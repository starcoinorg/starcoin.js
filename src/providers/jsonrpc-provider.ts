// eslint-disable-next-line max-classes-per-file
import { BigNumber } from '@ethersproject/bignumber';
import { Logger } from '@ethersproject/logger';
import {
  deepCopy,
  Deferrable,
  defineReadOnly,
  getStatic,
  resolveProperties,
  shallowCopy,
} from '@ethersproject/properties';
import { ConnectionInfo, fetchJson } from '@ethersproject/web';
import { Bytes, isBytes } from '@ethersproject/bytes';
import { getNetwork, Network, Networkish } from '../networks';
import { version } from '../version';
import { BaseProvider, CONSTANTS, Event, RPC_ACTION } from './base-provider';
// eslint-disable-next-line import/order
import { AccountAddress, ChainId, TransactionRequest } from '../types';
import { Signer } from '../abstract-signer';
import { Provider } from '../abstract-provider';

const logger = new Logger(version);

const errorGas = new Set(['call', 'estimateGas']);

// FIXME: recheck the error.
function checkError(method: string, error: any, params: any): never {
  let { message } = error;
  if (
    error.code === Logger.errors.SERVER_ERROR &&
    error.error &&
    typeof error.error.message === 'string'
  ) {
    message = error.error.message;
  } else if (typeof error.body === 'string') {
    message = error.body;
  } else if (typeof error.responseText === 'string') {
    message = error.responseText;
  }
  message = (message || '').toLowerCase();

  const transaction = params.transaction || params.signedTransaction;

  // "insufficient funds for gas * price + value + cost(data)"
  if (message.match(/insufficient funds/)) {
    logger.throwError(
      'insufficient funds for intrinsic transaction cost',
      Logger.errors.INSUFFICIENT_FUNDS,
      {
        error,
        method,
        transaction,
      }
    );
  }

  // "nonce too low"
  if (message.match(/nonce too low/)) {
    logger.throwError(
      'nonce has already been used',
      Logger.errors.NONCE_EXPIRED,
      {
        error,
        method,
        transaction,
      }
    );
  }

  // "replacement transaction underpriced"
  if (message.match(/replacement transaction underpriced/)) {
    logger.throwError(
      'replacement fee too low',
      Logger.errors.REPLACEMENT_UNDERPRICED,
      {
        error,
        method,
        transaction,
      }
    );
  }

  if (
    errorGas.has(method) &&
    message.match(
      /gas required exceeds allowance|always failing transaction|execution reverted/
    )
  ) {
    logger.throwError(
      'cannot estimate gas; transaction may fail or may require manual gas limit',
      Logger.errors.UNPREDICTABLE_GAS_LIMIT,
      {
        error,
        method,
        transaction,
      }
    );
  }

  throw error;
}

function timer(timeout: number): Promise<any> {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
}

function getResult(payload: {
  error?: { code?: number; data?: any; message?: string };
  result?: any;
}): any {
  if (payload.error) {
    // @TODO: not any
    const error: any = new Error(payload.error.message);
    error.code = payload.error.code;
    error.data = payload.error.data;
    throw error;
  }

  return payload.result;
}

const _constructorGuard = {};

export class JsonRpcSigner extends Signer {
  // eslint-disable-next-line no-use-before-define
  readonly provider: JsonrpcProvider;
  _index?: number;
  _address?: string;

  // eslint-disable-next-line no-use-before-define
  constructor(
    constructorGuard: any,
    provider: JsonrpcProvider,
    addressOrIndex?: string | number
  ) {
    logger.checkNew(new.target, JsonRpcSigner);

    super();

    if (constructorGuard !== _constructorGuard) {
      throw new Error(
        'do not call the JsonRpcSigner constructor directly; use provider.getSigner'
      );
    }

    defineReadOnly(this, 'provider', provider);

    // eslint-disable-next-line no-param-reassign
    if (addressOrIndex === undefined) {
      addressOrIndex = 0;
    }

    if (typeof addressOrIndex === 'string') {
      defineReadOnly(
        this,
        '_address',
        this.provider.formatter.address(addressOrIndex)
      );
    } else if (typeof addressOrIndex === 'number') {
      defineReadOnly(this, '_index', addressOrIndex);
    } else {
      logger.throwArgumentError(
        'invalid address or index',
        'addressOrIndex',
        addressOrIndex
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this
  connect(provider: Provider): JsonRpcSigner {
    return logger.throwError(
      'cannot alter JSON-RPC Signer connection',
      Logger.errors.UNSUPPORTED_OPERATION,
      {
        operation: 'connect',
      }
    );
  }

  // connectUnchecked(): JsonRpcSigner {
  //   return new UncheckedJsonRpcSigner(_constructorGuard, this.provider, this._address || this._index);
  // }

  async getAddress(): Promise<string> {
    // eslint-disable-next-line no-underscore-dangle
    if (this._address) {
      // eslint-disable-next-line no-underscore-dangle
      return Promise.resolve(this._address);
    }

    return this.provider.listAccounts().then((accounts) => {
      // eslint-disable-next-line no-underscore-dangle
      if (accounts.length <= this._index) {
        // eslint-disable-next-line no-underscore-dangle
        logger.throwError(
          `unknown account #${this._index}`,
          Logger.errors.UNSUPPORTED_OPERATION,
          {
            operation: 'getAddress',
          }
        );
      }
      // eslint-disable-next-line no-underscore-dangle
      return accounts[this._index];
    });
  }

  async signTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<string> {
    // eslint-disable-next-line no-param-reassign
    const request = await resolveProperties(transaction);
    const sender = await this.getAddress();
    if (request.sender !== undefined) {
      if (request.sender !== sender) {
        logger.throwArgumentError(
          'from address mismatch',
          'transaction',
          transaction
        );
      }
    } else {
      request.sender = sender;
    }

    return this.provider.send('account.sign_txn_request', [request]).then(
      (hexTxnData) => {
        return hexTxnData;
      },
      (error) => {
        return checkError('signTransaction', error, request);
      }
    );
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  async signMessage(message: Bytes | string): Promise<string> {
    // return logger.throwError('signing message is unsupported', Logger.errors.UNSUPPORTED_OPERATION, {
    //  operation: 'signMessage'
    // });
    const { provider } = this;
    const address = await this.getAddress();
    let u8a;
    if (typeof message === 'string') {
      u8a = new Uint8Array(Buffer.from(message));
    } else if (isBytes(message)) {
      u8a = message;
    } else {
      return logger.throwError(
        'type of message input is unsupported',
        Logger.errors.UNSUPPORTED_OPERATION,
        {
          operation: 'signMessage',
        }
      );
    }
    const msgArray = Array.from(u8a);
    const messageArg = { message: msgArray };
    return provider.send('account.sign', [address.toLowerCase(), messageArg]);
    /*
    return this.provider.send('account.sign', [request]).then((hexSignedMessageData) => {
        return hexSignedMessageData;
      },
      (error) => {
        return checkError('signMessage', error, request);
      });
    */
    // const data = ((typeof(message) === "string") ? toUtf8Bytes(message): message);
    // const address = await this.getAddress();
    //
    // // https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign
    // return this.provider.send("eth_sign", [ address.toLowerCase(), hexlify(data) ]);
  }

  async unlock(password: string): Promise<void> {
    const { provider } = this;

    const address = await this.getAddress();

    return provider.send('account.unlock', [
      address.toLowerCase(),
      password,
      undefined,
    ]);
  }
}

// class UncheckedJsonRpcSigner extends JsonRpcSigner {
//   sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
//     return this.sendUncheckedTransaction(transaction).then((hash) => {
//       return <TransactionResponse>{
//         hash: hash,
//         nonce: null,
//         gasLimit: null,
//         gasPrice: null,
//         data: null,
//         value: null,
//         chainId: null,
//         confirmations: 0,
//         from: null,
//         wait: (confirmations?: number) => { return this.provider.waitForTransaction(hash, confirmations); }
//       };
//     });
//   }
// }

export class JsonrpcProvider extends BaseProvider {
  readonly connection: ConnectionInfo;

  _pendingFilter: Promise<number>;
  _nextId: number;

  constructor(url?: ConnectionInfo | string, network?: Networkish) {
    logger.checkNew(new.target, JsonrpcProvider);

    let networkOrReady: Networkish | Promise<Network> = network;

    // The network is unknown, query the JSON-RPC for it
    if (networkOrReady == null) {
      networkOrReady = new Promise((resolve, reject) => {
        setTimeout(() => {
          this.detectNetwork().then(
            (network) => {
              resolve(network);
            },
            (error) => {
              reject(error);
            }
          );
        }, 0);
      });
    }

    super(networkOrReady);

    // Default URL
    if (!url) {
      url = getStatic<() => string>(this.constructor, 'defaultUrl')();
    }

    if (typeof url === 'string') {
      defineReadOnly(
        this,
        'connection',
        Object.freeze({
          url: url,
        })
      );
    } else {
      defineReadOnly(this, 'connection', Object.freeze(shallowCopy(url)));
    }

    this._nextId = 42;
  }

  static defaultUrl(): string {
    return 'http://localhost:9850';
  }

  async detectNetwork(): Promise<Network> {
    await timer(0);

    let chainId = null;
    try {
      const resp = (await this.send('chain.id', [])) as ChainId;
      chainId = resp.id;
    } catch (error) {
      try {
        const chainInfo = await this.perform(RPC_ACTION.getChainInfo, null);
        chainId = chainInfo.chain_id;
        // eslint-disable-next-line no-empty
      } catch (error) {}
    }

    if (chainId != null) {
      try {
        return getNetwork(BigNumber.from(chainId).toNumber());
      } catch (error) {
        return logger.throwError(
          'could not detect network',
          Logger.errors.NETWORK_ERROR,
          {
            chainId: chainId,
            event: 'invalidNetwork',
            serverError: error,
          }
        );
      }
    }

    return logger.throwError(
      'could not detect network',
      Logger.errors.NETWORK_ERROR,
      {
        event: 'noNetwork',
      }
    );
  }

  getSigner(addressOrIndex?: string | number): JsonRpcSigner {
    return new JsonRpcSigner(_constructorGuard, this, addressOrIndex);
  }

  // getUncheckedSigner(addressOrIndex?: string | number): UncheckedJsonRpcSigner {
  //   return this.getSigner(addressOrIndex).connectUnchecked();
  // }

  listAccounts(): Promise<Array<string>> {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return this.send('account.list', []).then(
      (accounts: Array<{ address: AccountAddress }>) => {
        return accounts.map(({ address }) => this.formatter.address(address));
      }
    );
  }

  async getNowSeconds(): Promise<number> {
    const nodeInfo = await this.perform(RPC_ACTION.getNodeInfo, null);
    return nodeInfo.now_seconds;
  }

  send(method: string, params: Array<any>): Promise<any> {
    const request = {
      method,
      params,
      id: this._nextId++,
      jsonrpc: '2.0',
    };

    this.emit('debug', {
      action: 'request',
      request: deepCopy(request),
      provider: this,
    });

    return fetchJson(this.connection, JSON.stringify(request), getResult).then(
      (result) => {
        this.emit('debug', {
          action: 'response',
          request,
          response: result,
          provider: this,
        });

        return result;
      },
      (error) => {
        this.emit('debug', {
          action: 'response',
          error,
          request,
          provider: this,
        });

        throw error;
      }
    );
  }

  // eslint-disable-next-line consistent-return
  prepareRequest(method: string, params: any): [string, Array<any>] {
    switch (method) {
      case RPC_ACTION.getChainInfo:
        return ['chain.info', []];
      case RPC_ACTION.getNodeInfo:
        return ['node.info', []];
      case RPC_ACTION.getGasPrice:
        return ['txpool.gas_price', []];
      case RPC_ACTION.dryRun:
        return ['contract.dry_run', [params.transaction]];
      // case 'getBalance':
      //   return [
      //     'eth_getBalance',
      //     [getLowerCase(params.address), params.blockTag],
      //   ];
      // case 'getTransactionCount':
      //   return [
      //     'eth_getTransactionCount',
      //     [getLowerCase(params.address), params.blockTag],
      //   ];

      // case 'getCode':
      //   return ['eth_getCode', [getLowerCase(params.address), params.blockTag]];
      //
      // case 'getStorageAt':
      //   return [
      //     'eth_getStorageAt',
      //     [getLowerCase(params.address), params.position, params.blockTag],
      //   ];
      case RPC_ACTION.sendTransaction:
        return ['txpool.submit_hex_transaction', [params.signedTransaction]];
      case RPC_ACTION.getBlock:
        if (params.blockNumber !== undefined) {
          return ['chain.get_block_by_number', [params.blockNumber]];
        }
        if (params.blockHash !== undefined) {
          return ['chain.get_block_by_hash', [params.blockHash]];
        }
        break;
      case RPC_ACTION.getTransactionByHash:
        return ['chain.get_transaction', [params.transactionHash]];

      case RPC_ACTION.getTransactionInfo:
        return ['chain.get_transaction_info', [params.transactionHash]];
      case RPC_ACTION.getEventsOfTransaction:
        return ['chain.get_events_by_txn_hash', [params.transactionHash]];
      case RPC_ACTION.getCode:
        return ['contract.get_code', [params.moduleId]];
      case RPC_ACTION.getResource:
        return ['contract.get_resource', [params.address, params.structTag]];
      case RPC_ACTION.getAccountState:
        return ['state.get_account_state_set', [params.address]];
      case RPC_ACTION.call:
        return ['contract.call', [params.request]];

      // case 'estimateGas': {
      //   const hexlifyTransaction = getStatic<
      //     (
      //       t: TransactionRequest,
      //       a?: { [key: string]: boolean }
      //     ) => { [key: string]: string }
      //   >(this.constructor, 'hexlifyTransaction');
      //   return [
      //     'eth_estimateGas',
      //     [hexlifyTransaction(params.transaction, { from: true })],
      //   ];
      // }
      case RPC_ACTION.getEvents:
        return ['chain.get_events', [params.filter]];
      default:
        break;
      // if (params instanceof Array) {
      //   return [method, params];
      // } else {
      //   return [method, [params]];
      // }
    }
  }

  async perform(method: string, params: any): Promise<any> {
    const args = this.prepareRequest(method, params);

    if (args === undefined) {
      logger.throwError(
        `${method} not implemented`,
        Logger.errors.NOT_IMPLEMENTED,
        { operation: method }
      );
    }

    try {
      return await this.send(args[0], args[1]);
    } catch (error) {
      return checkError(method, error, params);
    }
  }

  _startEvent(event: Event): void {
    if (event.tag === 'pending') {
      // this._startPending();
      logger.throwError(
        'pending event not implemented',
        Logger.errors.NOT_IMPLEMENTED,
        { operation: 'pending event' }
      );
    }
    super._startEvent(event);
  }

  // _startPending(): void {
  //   if (this._pendingFilter != null) {
  //     return;
  //   }
  //   // eslint-disable-next-line @typescript-eslint/no-this-alias
  //   const self = this;
  //
  //   const pendingFilter: Promise<number> = this.send(
  //     'eth_newPendingTransactionFilter',
  //     []
  //   );
  //   this._pendingFilter = pendingFilter;
  //
  //   pendingFilter
  //     .then(function (filterId) {
  //       function poll() {
  //         self
  //           .send('eth_getFilterChanges', [filterId])
  //           .then(function (hashes: Array<string>) {
  //             if (self._pendingFilter != pendingFilter) {
  //               return null;
  //             }
  //
  //             let seq = Promise.resolve();
  //             hashes.forEach(function (hash) {
  //               // @TODO: This should be garbage collected at some point... How? When?
  //               // @ts-ignore
  //               self._emitted['t:' + hash.toLowerCase()] = CONSTANTS.pending;
  //               seq = seq.then(function () {
  //                 return self.getTransaction(hash).then(function (tx) {
  //                   self.emit(CONSTANTS.pending, tx);
  //                   return null;
  //                 });
  //               });
  //             });
  //
  //             return seq.then(function () {
  //               return timer(1000);
  //             });
  //           })
  //           .then(function () {
  //             if (self._pendingFilter != pendingFilter) {
  //               self.send('eth_uninstallFilter', [filterId]);
  //               return;
  //             }
  //             setTimeout(function () {
  //               poll();
  //             }, 0);
  //
  //             return null;
  //           })
  //           // eslint-disable-next-line @typescript-eslint/no-empty-function
  //           .catch((error: Error) => {});
  //       }
  //       poll();
  //
  //       return filterId;
  //     })
  //     // eslint-disable-next-line @typescript-eslint/no-empty-function
  //     .catch((error: Error) => {});
  // }

  _stopEvent(event: Event): void {
    if (
      event.tag === CONSTANTS.pending &&
      this.listenerCount(CONSTANTS.pending) === 0
    ) {
      this._pendingFilter = null;
    }
    super._stopEvent(event);
  }

  // // Convert an ethers.js transaction into a JSON-RPC transaction
  // //  - gasLimit => gas
  // //  - All values hexlified
  // //  - All numeric values zero-striped
  // //  - All addresses are lowercased
  // // NOTE: This allows a TransactionRequest, but all values should be resolved
  // //       before this is called
  // // @TODO: This will likely be removed in future versions and prepareRequest
  // //        will be the preferred method for this.
  // static hexlifyTransaction(
  //   transaction: TransactionRequest,
  //   allowExtra?: { [key: string]: boolean }
  // ): { [key: string]: string } {
  //   // Check only allowed properties are given
  //   const allowed = shallowCopy(allowedTransactionKeys);
  //   if (allowExtra) {
  //     for (const key in allowExtra) {
  //       if (allowExtra[key]) {
  //         allowed[key] = true;
  //       }
  //     }
  //   }
  //   checkProperties(transaction, allowed);
  //
  //   const result: { [key: string]: string } = {};
  //
  //   // Some nodes (INFURA ropsten; INFURA mainnet is fine) do not like leading zeros.
  //   ['gasLimit', 'gasPrice', 'nonce', 'value'].forEach(function (key) {
  //     if ((<any>transaction)[key] == null) {
  //       return;
  //     }
  //     const value = hexValue((<any>transaction)[key]);
  //     if (key === 'gasLimit') {
  //       key = 'gas';
  //     }
  //     result[key] = value;
  //   });
  //
  //   ['from', 'to', 'data'].forEach(function (key) {
  //     if ((<any>transaction)[key] == null) {
  //       return;
  //     }
  //     result[key] = hexlify((<any>transaction)[key]);
  //   });
  //
  //   return result;
  // }
}
