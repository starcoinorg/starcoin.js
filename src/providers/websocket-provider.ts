// import { setInterval } from 'timers';

import { Logger } from '@ethersproject/logger';
import { defineReadOnly } from '@ethersproject/properties';
import WebSocket from 'ws';
import { Network, Networkish } from '../networks';
import { version } from '../version';
import { CONSTANTS, Event } from './base-provider';
import { JsonRpcProvider } from './jsonrpc-provider';

const logger = new Logger(version);

/**
 *  Notes:
 *
 *  This provider differs a bit from the polling providers. One main
 *  difference is how it handles consistency. The polling providers
 *  will stall responses to ensure a consistent state, while this
 *  WebSocket provider assumes the connected backend will manage this.
 *
 *  For example, if a polling provider emits an event which indicats
 *  the event occurred in blockhash XXX, a call to fetch that block by
 *  its hash XXX, if not present will retry until it is present. This
 *  can occur when querying a pool of nodes that are mildly out of sync
 *  with each other.
 */

let NextId = 1;

export type InflightRequest = {
  callback: (error: Error, result: any) => void;
  payload: string;
};

export type Subscription = {
  tag: string;
  processFunc: (payload: any) => void;
};

// For more info about the Real-time Event API see:
//   https://geth.ethereum.org/docs/rpc/pubsub

export class WebsocketProvider extends JsonRpcProvider {
  readonly _websocket: any;
  readonly _requests: { [name: string]: InflightRequest };
  readonly _detectNetwork: Promise<Network>;

  // Maps event tag to subscription ID (we dedupe identical events)
  readonly _subIds: { [tag: string]: Promise<string> };

  // Maps Subscription ID to Subscription
  readonly _subs: { [name: string]: Subscription };

  _wsReady: boolean;

  constructor(url?: string, network?: Networkish) {
    // This will be added in the future; please open an issue to expedite
    if (network === 'any') {
      logger.throwError(
        "WebSocketProvider does not support 'any' network yet",
        Logger.errors.UNSUPPORTED_OPERATION,
        {
          operation: 'network:any',
        }
      );
    }

    super(url, network);
    this._pollingInterval = -1;

    this._wsReady = false;

    defineReadOnly(this, '_websocket', new WebSocket(this.connection.url));
    defineReadOnly(this, '_requests', {});
    defineReadOnly(this, '_subs', {});
    defineReadOnly(this, '_subIds', {});
    defineReadOnly(this, '_detectNetwork', super.detectNetwork());

    // Stall sending requests until the socket is open...
    this._websocket.onopen = () => {
      this._wsReady = true;
      Object.keys(this._requests).forEach((id) => {
        this._websocket.send(this._requests[id].payload);
      });
    };

    this._websocket.onmessage = (messageEvent: { data: string }) => {
      const data = messageEvent.data;
      const result = JSON.parse(data);
      if (result.id != null) {
        const id = String(result.id);
        const request = this._requests[id];
        delete this._requests[id];

        if (result.result !== undefined) {
          request.callback(null, result.result);

          this.emit('debug', {
            action: 'response',
            request: JSON.parse(request.payload),
            response: result.result,
            provider: this,
          });
        } else {
          let error: Error;
          if (result.error) {
            error = new Error(result.error.message || 'unknown error');
            defineReadOnly(<any>error, 'code', result.error.code || null);
            defineReadOnly(<any>error, 'response', data);
          } else {
            error = new Error('unknown error');
          }

          request.callback(error, undefined);

          this.emit('debug', {
            action: 'response',
            error,
            request: JSON.parse(request.payload),
            provider: this,
          });
        }
      } else if (result.method === 'starcoin_subscription') {
        // Subscription...
        const sub = this._subs[result.params.subscription];
        if (sub) {
          sub.processFunc(result.params.result);
        }
      } else {
        console.warn('this should not happen');
      }
    };

    // This Provider does not actually poll, but we want to trigger
    // poll events for things that depend on them (like stalling for
    // block and transaction lookups)
    const fauxPoll = setInterval(() => {
      this.emit('poll');
    }, 1000);
    if (fauxPoll.unref) {
      fauxPoll.unref();
    }
  }

  detectNetwork(): Promise<Network> {
    return this._detectNetwork;
  }

  get pollingInterval(): number {
    return 0;
  }

  set pollingInterval(value: number) {
    logger.throwError(
      'cannot set polling interval on WebSocketProvider',
      Logger.errors.UNSUPPORTED_OPERATION,
      {
        operation: 'setPollingInterval',
      }
    );
  }

  async poll(): Promise<void> {
    return null;
  }

  set polling(value: boolean) {
    if (!value) {
      return;
    }

    logger.throwError(
      'cannot set polling on WebSocketProvider',
      Logger.errors.UNSUPPORTED_OPERATION,
      {
        operation: 'setPolling',
      }
    );
  }

  send(method: string, params?: Array<any>): Promise<any> {
    const rid = NextId++;

    return new Promise((resolve, reject) => {
      function callback(error: Error, result: any) {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      }

      const payload = JSON.stringify({
        method: method,
        params: params,
        id: rid,
        jsonrpc: '2.0',
      });

      this.emit('debug', {
        action: 'request',
        request: JSON.parse(payload),
        provider: this,
      });

      this._requests[String(rid)] = { callback, payload };

      if (this._wsReady) {
        this._websocket.send(payload);
      }
    });
  }

  static defaultUrl(): string {
    return 'ws://localhost:9870';
  }

  async _subscribe(
    tag: string,
    param: Array<any>,
    processFunc: (result: any) => void
  ): Promise<void> {
    let subIdPromise = this._subIds[tag];
    if (subIdPromise == null) {
      subIdPromise = Promise.all(param).then((param) => {
        return this.send('starcoin_subscribe', param);
      });
      this._subIds[tag] = subIdPromise;
    }
    const subId = await subIdPromise;
    this._subs[subId] = { tag, processFunc };
  }

  _startEvent(event: Event): void {
    switch (event.type) {
      case CONSTANTS.block:
        this._subscribe(
          CONSTANTS.block,
          [{ type_name: 'newHeads' }],
          (result: any) => {
            // FIXME
            const blockNumber = this.formatter.u64(
              result.header.number
            ) as number;
            // const blockNumber = BigNumber.from(result.header.number).toNumber();
            this._emitted.block = blockNumber;
            this.emit(CONSTANTS.block, blockNumber);
          }
        );
        break;

      case CONSTANTS.pending:
        this._subscribe(
          CONSTANTS.pending,
          [{ type_name: 'newPendingTransactions' }],
          (result: any) => {
            this.emit(CONSTANTS.pending, result);
          }
        );
        break;

      case CONSTANTS.filter:
        this._subscribe(
          event.tag,
          [{ type_name: 'events' }, event.filter],
          (result: any) => {
            this.emit(event.filter, this.formatter.transactionEvent(result));
          }
        );
        break;

      case CONSTANTS.tx: {
        const emitTxnInfo = (event: Event) => {
          const hash = event.hash;
          this.getTransactionInfo(hash).then((txnInfo) => {
            if (!txnInfo) {
              return;
            }
            this.emit(hash, txnInfo);
          });
        };

        // In case it is already mined
        emitTxnInfo(event);

        // To keep things simple, we start up a single newHeads subscription
        // to keep an eye out for transactions we are watching for.
        // Starting a subscription for an event (i.e. "tx") that is already
        // running is (basically) a nop.
        this._subscribe(
          CONSTANTS.tx,
          [{ type_name: 'newHeads' }],
          (result: any) => {
            this._events
              .filter((e) => e.type === CONSTANTS.tx)
              .forEach(emitTxnInfo);
          }
        );
        break;
      }

      // Nothing is needed
      case 'debug':
      case 'poll':
      case 'willPoll':
      case 'didPoll':
      case 'error':
        break;

      default:
        console.log('unhandled:', event);
        break;
    }
  }

  _stopEvent(event: Event): void {
    let tag = event.tag;

    if (event.type === CONSTANTS.tx) {
      // There are remaining transaction event listeners
      if (this._events.filter((e) => e.type === CONSTANTS.tx).length) {
        return;
      }
      tag = CONSTANTS.tx;
    } else if (this.listenerCount(event.event)) {
      // There are remaining event listeners
      return;
    }

    const subId = this._subIds[tag];
    if (!subId) {
      return;
    }

    delete this._subIds[tag];
    subId.then((subId) => {
      if (!this._subs[subId]) {
        return;
      }
      delete this._subs[subId];
      this.send('starcoin_unsubscribe', [subId]);
    });
  }

  async destroy(): Promise<void> {
    // Wait until we have connected before trying to disconnect
    if (this._websocket.readyState === WebSocket.CONNECTING) {
      await new Promise((resolve) => {
        this._websocket.onopen = function () {
          resolve(true);
        };

        this._websocket.onerror = function () {
          resolve(false);
        };
      });
    }

    // Hangup
    // See: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
    this._websocket.close(1000);
  }
}
