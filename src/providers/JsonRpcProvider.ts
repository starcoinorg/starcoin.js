'use strict';
import { BigNumber } from '@ethersproject/bignumber';
import { Logger } from '@ethersproject/logger';
import {
  deepCopy,
  defineReadOnly,
  getStatic,
  shallowCopy,
} from '@ethersproject/properties';
import { ConnectionInfo, fetchJson } from '@ethersproject/web';

import { getNetwork, Network, Networkish } from '../networks';
import { version } from '../version';

const logger = new Logger(version);

import { BaseProvider, CONSTANTS, Event, RPC_ACTION } from './BaseProvider';

// eslint-disable-next-line import/order
import { ChainId } from '../types';

const errorGas = ['call', 'estimateGas'];

// FIXME: recheck the error.
function checkError(method: string, error: any, params: any): never {
  let message = error.message;
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
    errorGas.indexOf(method) >= 0 &&
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

export class JsonRpcProvider extends BaseProvider {
  readonly connection: ConnectionInfo;

  _pendingFilter: Promise<number>;
  _nextId: number;

  constructor(url?: ConnectionInfo | string, network?: Networkish) {
    logger.checkNew(new.target, JsonRpcProvider);

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

  send(method: string, params: Array<any>): Promise<any> {
    const request = {
      method: method,
      params: params,
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
          request: request,
          response: result,
          provider: this,
        });

        return result;
      },
      (error) => {
        this.emit('debug', {
          action: 'response',
          error: error,
          request: request,
          provider: this,
        });

        throw error;
      }
    );
  }

  prepareRequest(method: string, params: any): [string, Array<any>] {
    switch (method) {
      case RPC_ACTION.getChainInfo:
        return ['chain.info', []];
      // case 'getGasPrice':
      //   return ['eth_gasPrice', []];
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
        if (params.blockNumber != undefined) {
          return ['chain.get_block_by_number', [params.blockNumber]];
        } else if (params.blockHash != undefined) {
          return ['chain.get_block_by_hash', [params.blockHash]];
        }
        return null;
      case RPC_ACTION.getTransactionByHash:
        return ['chain.get_transaction', [params.transactionHash]];

      case RPC_ACTION.getTransactionInfo:
        return ['chain.get_transaction_info', [params.transactionHash]];

      // case 'call': {
      //   const hexlifyTransaction = getStatic<
      //     (
      //       t: TransactionRequest,
      //       a?: { [key: string]: boolean }
      //     ) => { [key: string]: string }
      //   >(this.constructor, 'hexlifyTransaction');
      //   return [
      //     'eth_call',
      //     [
      //       hexlifyTransaction(params.transaction, { from: true }),
      //       params.blockTag,
      //     ],
      //   ];
      // }
      //
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
        return null;
      // if (params instanceof Array) {
      //   return [method, params];
      // } else {
      //   return [method, [params]];
      // }
    }
  }

  async perform(method: string, params: any): Promise<any> {
    const args = this.prepareRequest(method, params);

    if (args == null) {
      logger.throwError(
        method + ' not implemented',
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
