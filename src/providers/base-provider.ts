// import { clearInterval, clearTimeout, setInterval, setTimeout } from 'timers';

// eslint-disable-next-line max-classes-per-file
import { Base58 } from '@ethersproject/basex';
import { BigNumber } from '@ethersproject/bignumber';
import {
  concat,
  hexDataLength,
  hexDataSlice,
  hexlify,
  hexZeroPad,
  isHexString,
} from '@ethersproject/bytes';
import { Logger } from '@ethersproject/logger';
import {
  Deferrable,
  defineReadOnly,
  resolveProperties,
} from '@ethersproject/properties';
import { sha256 } from '@ethersproject/sha2';
import { poll } from '@ethersproject/web';
import { EventType, Listener, Provider } from '../abstract-provider';
import { getNetwork, Network, Networkish } from '../networks';
import { version } from '../version';

import { Formatter } from './formatter';
import {
  ModuleId,
  AccountAddress,
  BlockNumber,
  MoveStruct,
  MoveValue,
  TransactionEventView,
  BlockTag,
  BlockView,
  BlockWithTransactions,
  CallRequest,
  Filter,
  TransactionInfoView,
  TransactionOutput,
  TransactionRequest,
  TransactionResponse,
  U64,
  SignedUserTransactionView,
  AnnotatedMoveStruct,
  formatFunctionId,
  HashValue,
} from '../types';

const logger = new Logger(version);

// Event Serializing
function serializeTopics(eventKeys?: Array<string>): string {
  if (eventKeys === undefined || eventKeys.length === 0) {
    return '*';
  } else {
    return eventKeys.join('|');
  }
}

function deserializeTopics(data: string): Array<string> {
  if (data === '') {
    return [];
  }
  if (data === '*') {
    return [];
  }

  return data.split('|');
}

function getEventTag(eventName: EventType): string {
  if (typeof eventName === 'string') {
    eventName = eventName.toLowerCase();

    if (hexDataLength(eventName) === 32) {
      return 'tx:' + eventName;
    }

    if (eventName.indexOf(':') === -1) {
      return eventName;
    }
  } else if (Array.isArray(eventName)) {
    return 'filter:' + serializeTopics(eventName);
  } else if (typeof eventName === 'object') {
    return 'filter:' + serializeTopics(eventName.event_keys);
  }

  throw new Error('invalid event - ' + eventName);
}

//////////////////////////////
// Helper Object

function getTime() {
  return new Date().getTime();
}

function stall(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

//////////////////////////////
// Provider Object

/**
 *  EventType
 *   - "block"
 *   - "poll"
 *   - "didPoll"
 *   - "pending"
 *   - "error"
 *   - "network"
 *   - filter
 *   - topics array
 *   - transaction hash
 */

export const CONSTANTS = {
  pending: 'pending',
  block: 'block',
  network: 'network',
  poll: 'poll',
  filter: 'filter',
  tx: 'tx',
};

const PollableEvents = [
  CONSTANTS.pending,
  CONSTANTS.block,
  CONSTANTS.network,
  CONSTANTS.poll,
];

export class Event {
  readonly listener!: Listener;
  readonly once!: boolean;
  readonly tag!: string;

  constructor(tag: string, listener: Listener, once: boolean) {
    defineReadOnly(this, 'tag', tag);
    defineReadOnly(this, 'listener', listener);
    defineReadOnly(this, 'once', once);
  }

  get event(): EventType {
    switch (this.type) {
      case 'tx':
        return this.hash;
      case 'filter':
        return this.filter;
    }
    return this.tag;
  }

  get type(): string {
    return this.tag.split(':')[0];
  }

  get hash(): string {
    const comps = this.tag.split(':');
    if (comps[0] !== 'tx') {
      // @ts-ignore
      return null;
    }
    return comps[1];
  }

  get filter(): Filter {
    const comps = this.tag.split(':');
    if (comps[0] !== 'filter') {
      // @ts-ignore
      return null;
    }
    const topics = deserializeTopics(comps[1]);
    const filter: Filter = {};

    if (topics.length > 0) {
      filter.event_keys = topics;
    }

    return filter;
  }

  pollable(): boolean {
    return this.tag.indexOf(':') >= 0 || PollableEvents.indexOf(this.tag) >= 0;
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
function bytes32ify(value: number): string {
  return hexZeroPad(BigNumber.from(value).toHexString(), 32);
}

// Compute the Base58Check encoded data (checksum is first 4 bytes of sha256d)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
function base58Encode(data: Uint8Array): string {
  return Base58.encode(
    concat([data, hexDataSlice(sha256(sha256(data)), 0, 4)])
  );
}

export const RPC_ACTION = {
  getChainInfo: 'getChainInfo',
  getNodeInfo: 'getNodeInfo',
  sendTransaction: 'sendTransaction',
  getBlock: 'getBlock',
  getTransactionByHash: 'getTransactionByHash',
  getTransactionInfo: 'getTransactionInfo',
  getEventsOfTransaction: 'getEventsOfTransaction',
  getEvents: 'getEvents',
  call: 'call',
  callV2: 'callV2',
  getCode: 'getCode',
  getResource: 'getResource',
  getAccountState: 'getAccountState',
  getGasPrice: 'getGasPrice',
  dryRun: 'dryRun',
  dryRunRaw: 'dryRunRaw',
};

let defaultFormatter: Formatter;

let nextPollId = 1;

export abstract class BaseProvider extends Provider {
  _networkPromise: Promise<Network>;

  _network: Network;

  _events: Array<Event>;

  formatter: Formatter;

  // To help mitigate the eventually consistent nature of the blockchain
  // we keep a mapping of events we emit. If we emit an event X, we expect
  // that a user should be able to query for that event in the callback,
  // if the node returns null, we stall the response until we get back a
  // meaningful value, since we may be hitting a re-org, or a node that
  // has not indexed the event yet.
  // Events:
  //   - t:{hash}    - Transaction hash
  //   - b:{hash}    - BlockHash
  //   - block       - The most recent emitted block
  _emitted: { [eventName: string]: number | 'pending' };

  _pollingInterval: number;

  _poller: NodeJS.Timer;

  _bootstrapPoll: NodeJS.Timer;

  _lastBlockNumber: number;

  _fastBlockNumber: number;

  _fastBlockNumberPromise: Promise<number>;

  _fastQueryDate: number;

  _maxInternalBlockNumber: number;

  _internalBlockNumber: Promise<{
    blockNumber: number;
    reqTime: number;
    respTime: number;
  }>;

  readonly anyNetwork: boolean;

  /**
   *  ready
   *
   *  A Promise<Network> that resolves only once the provider is ready.
   *
   *  Sub-classes that call the super with a network without a chainId
   *  MUST set this. Standard named networks have a known chainId.
   *
   */

  constructor(network: Networkish | Promise<Network>) {
    logger.checkNew(new.target, Provider);

    super();

    // Events being listened to
    this._events = [];

    this._emitted = { block: -2 };

    this.formatter = new.target.getFormatter();

    // If network is any, this Provider allows the underlying
    // network to change dynamically, and we auto-detect the
    // current network
    defineReadOnly(this, 'anyNetwork', network === 'any');
    if (this.anyNetwork) {
      network = this.detectNetwork();
    }

    if (network instanceof Promise) {
      this._networkPromise = network;

      // Squash any "unhandled promise" errors; that do not need to be handled
      // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
      network.catch((error) => { });

      // Trigger initial network setting (async)
      // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
      this._ready().catch((error) => { });
    } else {
      const knownNetwork = getNetwork(network);
      if (knownNetwork) {
        defineReadOnly(this, '_network', knownNetwork);
        this.emit('network', knownNetwork, null);
      } else {
        logger.throwArgumentError('invalid network', 'network', network);
      }
    }

    this._maxInternalBlockNumber = -1024;

    this._lastBlockNumber = -2;

    this._pollingInterval = 4000;

    this._fastQueryDate = 0;
  }

  async _ready(): Promise<Network> {
    if (this._network == null) {
      let network: Network = null;
      if (this._networkPromise) {
        try {
          network = await this._networkPromise;
          // eslint-disable-next-line no-empty
        } catch (error) { }
      }

      // Try the Provider's network detection (this MUST throw if it cannot)
      if (network == null) {
        network = await this.detectNetwork();
      }

      // This should never happen; every Provider sub-class should have
      // suggested a network by here (or have thrown).
      if (!network) {
        logger.throwError(
          'no network detected',
          Logger.errors.UNKNOWN_ERROR,
          {}
        );
      }

      // Possible this call stacked so do not call defineReadOnly again
      if (this._network == null) {
        if (this.anyNetwork) {
          this._network = network;
        } else {
          defineReadOnly(this, '_network', network);
        }
        this.emit('network', network, null);
      }
    }

    return this._network;
  }

  // This will always return the most recently established network.
  // For "any", this can change (a "network" event is emitted before
  // any change is refelcted); otherwise this cannot change
  get ready(): Promise<Network> {
    return poll(() => {
      return this._ready().then(
        (network) => {
          return network;
        },
        (error) => {
          // If the network isn't running yet, we will wait
          if (
            error.code === Logger.errors.NETWORK_ERROR &&
            error.event === 'noNetwork'
          ) {
            return undefined;
          }
          throw error;
        }
      );
    });
  }

  // @TODO: Remove this and just create a singleton formatter
  static getFormatter(): Formatter {
    if (defaultFormatter == null) {
      defaultFormatter = new Formatter();
    }
    return defaultFormatter;
  }

  // Fetches the blockNumber, but will reuse any result that is less
  // than maxAge old or has been requested since the last request
  private async _getInternalBlockNumber(maxAge: number): Promise<number> {
    await this._ready();

    const internalBlockNumber = this._internalBlockNumber;

    if (maxAge > 0 && this._internalBlockNumber) {
      const result = await internalBlockNumber;
      if (getTime() - result.respTime <= maxAge) {
        return result.blockNumber;
      }
    }

    const reqTime = getTime();

    const checkInternalBlockNumber = resolveProperties({
      blockNumber: this.perform(RPC_ACTION.getChainInfo, {}).then(
        (chainInfo) => chainInfo.head.number,
        (err) => err
      ),
      networkError: this.getNetwork().then(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (network) => null,
        (error) => error
      ),
    }).then(({ blockNumber, networkError }) => {
      if (networkError) {
        // Unremember this bad internal block number
        if (this._internalBlockNumber === checkInternalBlockNumber) {
          this._internalBlockNumber = null;
        }
        throw networkError;
      }

      const respTime = getTime();

      blockNumber = BigNumber.from(blockNumber).toNumber();
      if (blockNumber < this._maxInternalBlockNumber) {
        blockNumber = this._maxInternalBlockNumber;
      }

      this._maxInternalBlockNumber = blockNumber;
      this._setFastBlockNumber(blockNumber);
      return { blockNumber, reqTime, respTime };
    });

    this._internalBlockNumber = checkInternalBlockNumber;

    return (await checkInternalBlockNumber).blockNumber;
  }

  protected async poll(): Promise<void> {
    const pollId = nextPollId++;

    // Track all running promises, so we can trigger a post-poll once they are complete
    const runners: Array<Promise<void>> = [];

    const blockNumber = await this._getInternalBlockNumber(
      100 + this.pollingInterval / 2
    );
    this._setFastBlockNumber(blockNumber);

    // Emit a poll event after we have the latest (fast) block number
    this.emit('poll', pollId, blockNumber);

    // If the block has not changed, meh.
    if (blockNumber === this._lastBlockNumber) {
      this.emit('didPoll', pollId);
      return;
    }

    // First polling cycle, trigger a "block" events
    if (this._emitted.block === -2) {
      this._emitted.block = blockNumber - 1;
    }

    if (Math.abs(<number>this._emitted.block - blockNumber) > 1000) {
      logger.warn('network block skew detected; skipping block events');
      this.emit(
        'error',
        logger.makeError(
          'network block skew detected',
          Logger.errors.NETWORK_ERROR,
          {
            blockNumber: blockNumber,
            event: 'blockSkew',
            previousBlockNumber: this._emitted.block,
          }
        )
      );
      this.emit(CONSTANTS.block, blockNumber);
    } else {
      // Notify all listener for each block that has passed
      for (let i = <number>this._emitted.block + 1; i <= blockNumber; i++) {
        this.emit(CONSTANTS.block, i);
      }
    }

    // The emitted block was updated, check for obsolete events
    if (<number>this._emitted.block !== blockNumber) {
      this._emitted.block = blockNumber;

      Object.keys(this._emitted).forEach((key) => {
        // The block event does not expire
        if (key === CONSTANTS.block) {
          return;
        }

        // The block we were at when we emitted this event
        const eventBlockNumber = this._emitted[key];

        // We cannot garbage collect pending transactions or blocks here
        // They should be garbage collected by the Provider when setting
        // "pending" events
        if (eventBlockNumber === 'pending') {
          return;
        }

        // Evict any transaction hashes or block hashes over 12 blocks
        // old, since they should not return null anyways
        if (blockNumber - eventBlockNumber > 12) {
          delete this._emitted[key];
        }
      });
    }

    // First polling cycle
    if (this._lastBlockNumber === -2) {
      this._lastBlockNumber = blockNumber - 1;
    }

    // Find all transaction hashes we are waiting on
    this._events.forEach((event) => {
      switch (event.type) {
        case CONSTANTS.tx: {
          const hash = event.hash;
          const runner = this.getTransactionInfo(hash)
            .then((receipt) => {
              if (!receipt || receipt.block_number == null) {
                return null;
              }
              this._emitted['t:' + hash] = receipt.block_number;
              this.emit(hash, receipt);
              return null;
            })
            .catch((error: Error) => {
              this.emit('error', error);
            });

          runners.push(runner);

          break;
        }

        case CONSTANTS.filter: {
          const filter = event.filter;
          filter.from_block = this._lastBlockNumber + 1;
          filter.to_block = blockNumber;

          const runner = this.getTransactionEvents(filter)
            .then((logs) => {
              if (logs.length === 0) {
                return;
              }
              logs.forEach((log: TransactionEventView) => {
                this._emitted['b:' + log.block_hash] = log.block_number;
                this._emitted['t:' + log.transaction_hash] = log.block_number;
                this.emit(filter, log);
              });
            })
            .catch((error: Error) => {
              this.emit('error', error);
            });
          runners.push(runner);

          break;
        }
      }
    });

    this._lastBlockNumber = blockNumber;

    // Once all events for this loop have been processed, emit "didPoll"
    Promise.all(runners).then(() => {
      this.emit('didPoll', pollId);
    });

    return null;
  }

  get network(): Network {
    return this._network;
  }

  // This method should query the network if the underlying network
  // can change, such as when connected to a JSON-RPC backend
  abstract detectNetwork(): Promise<Network>;

  async getNetwork(): Promise<Network> {
    const network = await this._ready();

    // Make sure we are still connected to the same network; this is
    // only an external call for backends which can have the underlying
    // network change spontaneously
    const currentNetwork = await this.detectNetwork();
    if (network.chainId !== currentNetwork.chainId) {
      // We are allowing network changes, things can get complex fast;
      // make sure you know what you are doing if you use "any"
      if (this.anyNetwork) {
        this._network = currentNetwork;

        // Reset all internal block number guards and caches
        this._lastBlockNumber = -2;
        this._fastBlockNumber = null;
        this._fastBlockNumberPromise = null;
        this._fastQueryDate = 0;
        this._emitted.block = -2;
        this._maxInternalBlockNumber = -1024;
        this._internalBlockNumber = null;

        // The "network" event MUST happen before this method resolves
        // so any events have a chance to unregister, so we stall an
        // additional event loop before returning from /this/ call
        this.emit('network', currentNetwork, network);
        await stall(0);

        return this._network;
      }

      const error = logger.makeError(
        'underlying network changed',
        Logger.errors.NETWORK_ERROR,
        {
          event: 'changed',
          network: network,
          detectedNetwork: currentNetwork,
        }
      );

      this.emit('error', error);
      throw error;
    }

    return network;
  }

  get blockNumber(): number {
    this._getInternalBlockNumber(100 + this.pollingInterval / 2);

    return this._fastBlockNumber != null ? this._fastBlockNumber : -1;
  }

  get polling(): boolean {
    return this._poller != null;
  }

  set polling(value: boolean) {
    if (value && !this._poller) {
      this._poller = setInterval(this.poll.bind(this), this.pollingInterval);

      if (!this._bootstrapPoll) {
        this._bootstrapPoll = setTimeout(() => {
          this.poll();

          // We block additional polls until the polling interval
          // is done, to prevent overwhelming the poll function
          this._bootstrapPoll = setTimeout(() => {
            // If polling was disabled, something may require a poke
            // since starting the bootstrap poll and it was disabled
            if (!this._poller) {
              this.poll();
            }

            // Clear out the bootstrap so we can do another
            this._bootstrapPoll = null;
          }, this.pollingInterval);
        }, 0);
      }
    } else if (!value && this._poller) {
      clearInterval(this._poller);
      this._poller = null;
    }
  }

  get pollingInterval(): number {
    return this._pollingInterval;
  }

  set pollingInterval(value: number) {
    if (
      typeof value !== 'number' ||
      value <= 0 ||
      parseInt(String(value)) != value
    ) {
      throw new Error('invalid polling interval');
    }

    this._pollingInterval = value;

    if (this._poller) {
      clearInterval(this._poller);
      this._poller = setInterval(() => {
        this.poll();
      }, this._pollingInterval);
    }
  }

  _getFastBlockNumber(): Promise<number> {
    const now = getTime();

    // Stale block number, request a newer value
    if (now - this._fastQueryDate > 2 * this._pollingInterval) {
      this._fastQueryDate = now;
      this._fastBlockNumberPromise = this.getBlockNumber().then(
        (blockNumber) => {
          if (
            this._fastBlockNumber == null ||
            blockNumber > this._fastBlockNumber
          ) {
            this._fastBlockNumber = blockNumber;
          }
          return this._fastBlockNumber;
        }
      );
    }

    return this._fastBlockNumberPromise;
  }

  _setFastBlockNumber(blockNumber: number): void {
    // Older block, maybe a stale request
    if (this._fastBlockNumber != null && blockNumber < this._fastBlockNumber) {
      return;
    }

    // Update the time we updated the blocknumber
    this._fastQueryDate = getTime();

    // Newer block number, use  it
    if (this._fastBlockNumber == null || blockNumber > this._fastBlockNumber) {
      this._fastBlockNumber = blockNumber;
      this._fastBlockNumberPromise = Promise.resolve(blockNumber);
    }
  }

  async waitForTransaction(
    transactionHash: string,
    confirmations?: number,
    timeout?: number
  ): Promise<TransactionInfoView> {
    if (confirmations == null) {
      confirmations = 1;
    }

    const transactionInfo = await this.getTransactionInfo(transactionHash);
    // Receipt is already good
    if (
      (transactionInfo ? transactionInfo.confirmations : 0) >= confirmations
    ) {
      return Promise.resolve(transactionInfo);
    }

    // Poll until the receipt is good...
    return new Promise((resolve, reject) => {
      let timer: NodeJS.Timer = null;
      let done = false;

      const handler = (transactionInfo: TransactionInfoView) => {
        if (transactionInfo.confirmations < confirmations) {
          return;
        }

        if (timer) {
          clearTimeout(timer);
        }
        if (done) {
          return;
        }
        done = true;

        this.removeListener(transactionHash, handler);
        resolve(transactionInfo);
      };
      this.on(transactionHash, handler);

      if (typeof timeout === 'number' && timeout > 0) {
        timer = setTimeout(() => {
          if (done) {
            return;
          }
          timer = null;
          done = true;

          this.removeListener(transactionHash, handler);
          reject(
            logger.makeError('timeout exceeded', Logger.errors.TIMEOUT, {
              timeout: timeout,
            })
          );
        }, timeout);
        if (timer.unref) {
          timer.unref();
        }
      }
    });
  }

  async getBlockNumber(): Promise<number> {
    return this._getInternalBlockNumber(0);
  }

  async getGasPrice(): Promise<U64> {
    await this.getNetwork();
    const result = await this.perform(RPC_ACTION.getGasPrice, {});
    return this.formatter.u64(result);
  }

  // async getBalance(
  //   addressOrName: string | Promise<string>,
  //   blockTag?: BlockTag | Promise<BlockTag>
  // ): Promise<BigNumber> {
  //   await this.getNetwork();
  //   const params = await resolveProperties({
  //     address: this._getAddress(addressOrName),
  //     blockTag: this._getBlockTag(blockTag),
  //   });
  //   return BigNumber.from(await this.perform('getBalance', params));
  // }

  // async getTransactionCount(
  //   addressOrName: string | Promise<string>,
  //   blockTag?: BlockTag | Promise<BlockTag>
  // ): Promise<number> {
  //   await this.getNetwork();
  //   const params = await resolveProperties({
  //     address: this._getAddress(addressOrName),
  //     blockTag: this._getBlockTag(blockTag),
  //   });
  //   return BigNumber.from(
  //     await this.perform('getTransactionCount', params)
  //   ).toNumber();
  // }

  // eslint-disable-next-line consistent-return
  async getCode(
    moduleId: ModuleId | Promise<ModuleId>,
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<string | undefined> {
    await this.getNetwork();
    const params = await resolveProperties({
      moduleId: BaseProvider.getModuleId(await moduleId),
      blockTag,
    });
    const code = await this.perform(RPC_ACTION.getCode, params);
    if (code) {
      return hexlify(code);
    }
  }

  // get resource data.
  // eslint-disable-next-line consistent-return
  async getResource(
    address: AccountAddress | Promise<AccountAddress>,
    resource_struct_tag: string | Promise<string>,
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<MoveStruct | undefined> {
    await this.getNetwork();
    const params = await resolveProperties({
      address,
      structTag: resource_struct_tag,
      blockTag,
    });
    const value = await this.perform(RPC_ACTION.getResource, params);
    if (value) {
      return this.formatter.moveStruct(value);
    }
  }

  async getResources(
    address: AccountAddress | Promise<AccountAddress>,
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<{ [k: string]: MoveStruct } | undefined> {
    await this.getNetwork();
    const params = await resolveProperties({
      address,
      blockTag,
    });
    const value = await this.perform(RPC_ACTION.getAccountState, params);
    if (value) {
      // @ts-ignore
      return Object.entries(value.resources).reduce(
        (o, [k, v]) => ({
          ...o,
          [k]: this.formatter.moveStruct(v as AnnotatedMoveStruct),
        }),
        {}
      );
    }
  }

  // This should be called by any subclass wrapping a TransactionResponse
  protected _wrapTransaction(
    tx: SignedUserTransactionView,
    hash?: string
  ): TransactionResponse {
    if (hash != null && hexDataLength(hash) !== 32) {
      throw new Error('invalid response - sendTransaction');
    }

    const result = <TransactionResponse>tx;

    // Check the hash we expect is the same as the hash the server reported
    if (hash != null && tx.transaction_hash !== hash) {
      logger.throwError(
        'Transaction hash mismatch from Provider.sendTransaction.',
        Logger.errors.UNKNOWN_ERROR,
        { expectedHash: tx.transaction_hash, returnedHash: hash }
      );
    }

    // @TODO: (confirmations? number, timeout? number)
    result.wait = async (confirmations?: number) => {
      // We know this transaction *must* exist (whether it gets mined is
      // another story), so setting an emitted value forces us to
      // wait even if the node returns null for the receipt
      if (confirmations !== 0) {
        this._emitted[`t:${ tx.transaction_hash }`] = 'pending';
      }

      const receipt = await this.waitForTransaction(
        tx.transaction_hash,
        confirmations
      );
      if (receipt == null && confirmations === 0) {
        return null;
      }

      // No longer pending, allow the polling loop to garbage collect this
      this._emitted[`t:${ tx.transaction_hash }`] = receipt.block_number;

      result.block_hash = receipt.block_hash;
      result.block_number = receipt.block_number;
      result.confirmations = confirmations;

      if (receipt.status !== 'Executed') {
        logger.throwError('transaction failed', Logger.errors.CALL_EXCEPTION, {
          transactionHash: tx.transaction_hash,
          transaction: tx,
          receipt,
        });
      }
      return receipt;
    };

    return result;
  }

  async sendTransaction(
    signedTransaction: string | Promise<string>
  ): Promise<TransactionResponse> {
    await this.getNetwork();
    const hexTx = await signedTransaction;
    const tx = this.formatter.userTransactionData(hexTx);
    try {
      // FIXME: check rpc call
      await this.perform(RPC_ACTION.sendTransaction, {
        signedTransaction: hexTx,
      });
      return this._wrapTransaction(tx);
    } catch (error) {
      (<any>error).transaction = tx;
      (<any>error).transactionHash = tx.transaction_hash;
      throw error;
    }
  }

  // async _getTransactionRequest(
  //   transaction: Deferrable<TransactionRequest>
  // ): Promise<Transaction> {
  //   const values: any = await transaction;
  //
  //   const tx: any = {};
  //
  //   ['from', 'to'].forEach((key) => {
  //     if (values[key] == null) {
  //       return;
  //     }
  //     tx[key] = Promise.resolve(values[key]).then((v) =>
  //       v ? this._getAddress(v) : null
  //     );
  //   });
  //
  //   ['gasLimit', 'gasPrice', 'value'].forEach((key) => {
  //     if (values[key] == null) {
  //       return;
  //     }
  //     tx[key] = Promise.resolve(values[key]).then((v) =>
  //       v ? BigNumber.from(v) : null
  //     );
  //   });
  //
  //   ['data'].forEach((key) => {
  //     if (values[key] == null) {
  //       return;
  //     }
  //     tx[key] = Promise.resolve(values[key]).then((v) =>
  //       v ? hexlify(v) : null
  //     );
  //   });
  //
  //   return this.formatter.transactionRequest(await resolveProperties(tx));
  // }

  private static getModuleId(moduleId: ModuleId): string {
    if (typeof moduleId === 'string') {
      return moduleId;
    }

    return `${ moduleId.address }::${ moduleId.name }`;
  }

  private async _getFilter(filter: Filter | Promise<Filter>): Promise<Filter> {
    const result = await filter;

    // const result: any = {};
    //
    // ['blockHash', 'topics'].forEach((key) => {
    //   if ((<any>filter)[key] == null) {
    //     return;
    //   }
    //   result[key] = (<any>filter)[key];
    // });
    //
    // ['fromBlock', 'toBlock'].forEach((key) => {
    //   if ((<any>filter)[key] == null) {
    //     return;
    //   }
    //   result[key] = this._getBlockTag((<any>filter)[key]);
    // });

    return this.formatter.filter(await resolveProperties(result));
  }

  async call(
    request: CallRequest | Promise<CallRequest>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<Array<MoveValue>> {
    await this.getNetwork();
    const params = await resolveProperties({
      request,
    });
    params.request.function_id = formatFunctionId(params.request.function_id);
    // eslint-disable-next-line no-return-await
    const rets = await this.perform(RPC_ACTION.call, params);
    return rets.map((v) => this.formatter.moveValue(v));
  }

  async callV2(
    request: CallRequest | Promise<CallRequest>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<Array<MoveValue>> {
    await this.getNetwork();
    const params = await resolveProperties({
      request,
    });
    params.request.function_id = formatFunctionId(params.request.function_id);
    // eslint-disable-next-line no-return-await
    const rets = await this.perform(RPC_ACTION.callV2, params);
    return rets.map((v) => v);
  }

  async dryRun(
    transaction: Deferrable<TransactionRequest>
  ): Promise<TransactionOutput> {
    await this.getNetwork();
    const params = await resolveProperties({
      transaction,
    });
    const resp = await this.perform(RPC_ACTION.dryRun, params);
    return this.formatter.transactionOutput(resp);
  }

  async dryRunRaw(
    rawUserTransactionHex: string,
    publicKeyHex: string
  ): Promise<TransactionOutput> {
    await this.getNetwork();
    const params = { rawUserTransactionHex, publicKeyHex }
    const resp = await this.perform(RPC_ACTION.dryRunRaw, params);
    return this.formatter.transactionOutput(resp);
  }

  private async _getBlock(
    blockHashOrBlockNumber: number | string | Promise<number | string>,
    includeTransactions?: boolean
  ): Promise<BlockView> {
    await this.getNetwork();

    blockHashOrBlockNumber = await blockHashOrBlockNumber;

    // If blockTag is a number (not "latest", etc), this is the block number
    let blockNumber = -128;

    const params: { [key: string]: any } = {
      includeTransactions: !!includeTransactions,
    };

    if (isHexString(blockHashOrBlockNumber, 32)) {
      params.blockHash = blockHashOrBlockNumber;
    } else {
      try {
        params.blockNumber = await this._getBlockTag(
          blockHashOrBlockNumber as number
        );
        blockNumber = params.blockNumber;
      } catch (error) {
        logger.throwArgumentError(
          'invalid block hash or block number',
          'blockHashOrBlockNumber',
          blockHashOrBlockNumber
        );
      }
    }

    return poll(
      async () => {
        const block = await this.perform(RPC_ACTION.getBlock, params);

        // Block was not found
        if (block == null) {
          // For blockhashes, if we didn't say it existed, that blockhash may
          // not exist. If we did see it though, perhaps from a log, we know
          // it exists, and this node is just not caught up yet.
          if (params.blockHash != null) {
            if (this._emitted[`b:${ params.blockHash }`] == null) {
              return null;
            }
          }

          // For block number, if we are asking for a future block, we return null
          if (params.blockNumber != null) {
            if (blockNumber > this._emitted.block) {
              return null;
            }
          }

          // Retry on the next block
          return undefined;
        }

        // Add transactions
        if (includeTransactions) {
          const blockNumber = await this._getInternalBlockNumber(
            100 + 2 * this.pollingInterval
          );

          // Add the confirmations using the fast block number (pessimistic)
          let confirmations = blockNumber - block.header.number + 1;
          if (confirmations <= 0) {
            confirmations = 1;
          }
          block.confirmations = confirmations;

          return this.formatter.blockWithTransactions(block);
        }

        return this.formatter.blockWithTxnHashes(block);
      },
      { oncePoll: this }
    );
  }

  // getBlock(
  //   blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>
  // ): Promise<BlockWithTxnHashes> {
  //   return <Promise<BlockWithTxnHashes>>(
  //     this._getBlock(blockHashOrBlockTag, true)
  //   );
  // }

  getBlock(
    blockTag: number | string | Promise<number | string>
  ): Promise<BlockWithTransactions> {
    return <Promise<BlockWithTransactions>>this._getBlock(blockTag, true);
  }

  async getTransaction(
    transactionHash: string | Promise<string>
  ): Promise<TransactionResponse> {
    await this.getNetwork();
    transactionHash = await transactionHash;

    const params = {
      transactionHash: this.formatter.hash(transactionHash, true),
    };

    return poll(
      async () => {
        const result = await this.perform(
          RPC_ACTION.getTransactionByHash,
          params
        );

        if (result == null) {
          if (this._emitted[`t:${ transactionHash }`] == null) {
            return null;
          }
          return undefined;
        }

        const tx = this.formatter.transactionResponse(result);

        if (tx.block_number === undefined) {
          tx.confirmations = 0;
        } else if (tx.confirmations === undefined) {
          const blockNumber = await this._getInternalBlockNumber(
            100 + 2 * this.pollingInterval
          );

          // Add the confirmations using the fast block number (pessimistic)
          let confirmations = blockNumber - tx.block_number + 1;
          if (confirmations <= 0) {
            confirmations = 1;
          }
          tx.confirmations = confirmations;
        }

        return this._wrapTransaction(tx);
      },
      { oncePoll: this }
    );
  }

  async getTransactionInfo(
    transactionHash: string | Promise<string>
  ): Promise<TransactionInfoView> {
    await this.getNetwork();

    transactionHash = await transactionHash;

    const params = {
      transactionHash: this.formatter.hash(transactionHash, true),
    };

    return poll(
      async () => {
        const result = await this.perform(
          RPC_ACTION.getTransactionInfo,
          params
        );

        if (result === null) {
          if (this._emitted[`t:${ transactionHash }`] === null) {
            return null;
          }
          return undefined;
        }

        if (result.block_hash === null) {
          return undefined;
        }

        const transactionInfo = this.formatter.transactionInfo(result);
        if (transactionInfo.block_number === null) {
          transactionInfo.confirmations = 0;
        } else if (!transactionInfo.confirmations) {
          const blockNumber = await this._getInternalBlockNumber(
            100 + 2 * this.pollingInterval
          );

          // Add the confirmations using the fast block number (pessimistic)
          let confirmations = blockNumber - transactionInfo.block_number + 1;
          if (confirmations <= 0) {
            confirmations = 1;
          }

          transactionInfo.confirmations = confirmations;
        }
        return transactionInfo;
      },
      { oncePoll: this }
    );
  }

  async getEventsOfTransaction(
    transactionHash: HashValue
  ): Promise<TransactionEventView[]> {
    await this.getNetwork();

    transactionHash = await transactionHash;

    const params = {
      transactionHash: this.formatter.hash(transactionHash, true),
    };
    const logs: Array<TransactionEventView> = await this.perform(
      RPC_ACTION.getEventsOfTransaction,
      params
    );
    return Formatter.arrayOf(
      this.formatter.transactionEvent.bind(this.formatter)
    )(logs);
  }

  async getTransactionEvents(
    filter: Filter | Promise<Filter>
  ): Promise<Array<TransactionEventView>> {
    await this.getNetwork();
    const params = await resolveProperties({ filter });
    const logs: Array<TransactionEventView> = await this.perform(
      RPC_ACTION.getEvents,
      params
    );
    return Formatter.arrayOf(
      this.formatter.transactionEvent.bind(this.formatter)
    )(logs);
  }

  async _getBlockTag(blockTag: number | Promise<number>): Promise<BlockNumber> {
    blockTag = await blockTag;

    if (blockTag < 0) {
      if (blockTag % 1) {
        logger.throwArgumentError('invalid BlockTag', 'blockTag', blockTag);
      }

      let blockNumber = await this._getInternalBlockNumber(
        100 + 2 * this.pollingInterval
      );
      blockNumber += blockTag;
      if (blockNumber < 0) {
        blockNumber = 0;
      }
      return blockNumber;
    } else {
      return blockTag;
    }
  }

  abstract perform(method: string, params: any): Promise<any>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _startEvent(event: Event): void {
    this.polling = this._events.filter((e) => e.pollable()).length > 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _stopEvent(event: Event): void {
    this.polling = this._events.filter((e) => e.pollable()).length > 0;
  }

  _addEventListener(
    eventName: EventType,
    listener: Listener,
    once: boolean
  ): this {
    const event = new Event(getEventTag(eventName), listener, once);
    this._events.push(event);
    this._startEvent(event);

    return this;
  }

  on(eventName: EventType, listener: Listener): this {
    return this._addEventListener(eventName, listener, false);
  }

  once(eventName: EventType, listener: Listener): this {
    return this._addEventListener(eventName, listener, true);
  }

  emit(eventName: EventType, ...args: Array<any>): boolean {
    let result = false;

    const stopped: Array<Event> = [];

    const eventTag = getEventTag(eventName);
    this._events = this._events.filter((event) => {
      if (event.tag !== eventTag) {
        return true;
      }

      setTimeout(() => {
        event.listener.apply(this, args);
      }, 0);

      result = true;

      if (event.once) {
        stopped.push(event);
        return false;
      }

      return true;
    });

    stopped.forEach((event) => {
      this._stopEvent(event);
    });

    return result;
  }

  listenerCount(eventName?: EventType): number {
    if (!eventName) {
      return this._events.length;
    }

    const eventTag = getEventTag(eventName);
    return this._events.filter((event) => {
      return event.tag === eventTag;
    }).length;
  }

  listeners(eventName?: EventType): Array<Listener> {
    if (eventName == null) {
      return this._events.map((event) => event.listener);
    }

    const eventTag = getEventTag(eventName);
    return this._events
      .filter((event) => event.tag === eventTag)
      .map((event) => event.listener);
  }

  off(eventName: EventType, listener?: Listener): this {
    if (listener === null) {
      return this.removeAllListeners(eventName);
    }

    const stopped: Array<Event> = [];

    let found = false;

    const eventTag = getEventTag(eventName);
    this._events = this._events.filter((event) => {
      if (event.tag !== eventTag || event.listener !== listener) {
        return true;
      }
      if (found) {
        return true;
      }
      found = true;
      stopped.push(event);
      return false;
    });

    stopped.forEach((event) => {
      this._stopEvent(event);
    });

    return this;
  }

  removeAllListeners(eventName?: EventType): this {
    let stopped: Array<Event> = [];
    if (eventName === null) {
      stopped = this._events;

      this._events = [];
    } else {
      const eventTag = getEventTag(eventName);
      this._events = this._events.filter((event) => {
        if (event.tag !== eventTag) {
          return true;
        }
        stopped.push(event);
        return false;
      });
    }

    stopped.forEach((event) => {
      this._stopEvent(event);
    });

    return this;
  }
}
