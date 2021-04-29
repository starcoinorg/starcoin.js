import { Logger } from '@ethersproject/logger';
import { Deferrable, defineReadOnly } from '@ethersproject/properties';
import { OnceBlockable } from '@ethersproject/web';

import { Network } from '../networks';
import {
  AccountAddress,
  BlockTag,
  BlockWithTransactions,
  CallRequest,
  EventFilter,
  Filter,
  formatStructTag,
  HashValue,
  ModuleId,
  MoveStruct,
  MoveValue,
  StructTag,
  TransactionEventView,
  TransactionInfoView,
  TransactionOutput,
  TransactionRequest,
  TransactionResponse,
  U128,
  U64,
} from '../types';
import { parseTypeTag } from '../utils/parser';

const version = 'abstract-provider/5.0.5';
const logger = new Logger(version);

export type EventType = string | Array<string> | EventFilter;

export type Listener = (...args: any[]) => void;

/// ////////////////////////////

// Exported Abstracts

export abstract class Provider implements OnceBlockable {
  // Network
  abstract getNetwork(): Promise<Network>;

  // Latest State
  abstract getBlockNumber(): Promise<number>;

  abstract getGasPrice(): Promise<U64>;

  // Account

  // eslint-disable-next-line consistent-return
  async getBalance(
    address: AccountAddress | Promise<AccountAddress>,
    // token name, default to 0x1::STC::STC
    token?: string,
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<U128 | undefined> {
    if (token === undefined) {
      // eslint-disable-next-line no-param-reassign
      token = '0x1::STC::STC';
    }
    const resource = await this.getResource(
      address,
      `0x1::Account::Balance<${token}>`,
      blockTag
    );
    if (resource !== undefined) {
      return ((resource as MoveStruct).token as MoveStruct).value as U128;
    }
  }

  // get all token balances of `address`.
  async getBalances(
    address: AccountAddress | Promise<AccountAddress>,
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<{ [k: string]: U128 } | undefined> {
    const resources = await this.getResources(address, blockTag);
    if (resources === undefined) {
      return;
    }
    let tokenBalances = {};
    // @ts-ignore
    for (let k in resources) {
      let typeTag = parseTypeTag(k);

      // filter out balance resources.
      // @ts-ignore
      if (typeof typeTag === 'object' && typeTag.Struct !== undefined) {
        // @ts-ignore
        let structTag: StructTag = typeTag.Struct;
        if (structTag.module === 'Account' && structTag.name === 'Balance') {
          // @ts-ignore
          let tokenStruct = formatStructTag(
            structTag.type_params[0]['Struct'] as StructTag
          );
          tokenBalances[tokenStruct] = (resources[k].token as MoveStruct)
            .value as U128;
        }
      }
    }
    return tokenBalances;
  }

  // eslint-disable-next-line consistent-return
  async getSequenceNumber(
    address: AccountAddress | Promise<AccountAddress>,
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<U64 | undefined> {
    const resource = await this.getResource(
      address,
      '0x1::Account::Account',
      blockTag
    );
    if (resource !== undefined) {
      return resource.sequence_number as number;
    }
  }

  // get Code of moduleId
  abstract getCode(
    moduleId: ModuleId | Promise<ModuleId>,
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<string | undefined>;

  // get resource data.
  abstract getResource(
    address: AccountAddress | Promise<AccountAddress>,
    resource_struct_tag: string | Promise<string>,
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<MoveStruct | undefined>;

  // get all resources under `address`.
  abstract getResources(
    address: AccountAddress | Promise<AccountAddress>,
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<{ [k: string]: MoveStruct }>;

  // Execution
  abstract sendTransaction(
    signedTransaction: string | Promise<string>
  ): Promise<TransactionResponse>;

  abstract call(
    transaction: CallRequest | Promise<CallRequest>,
    blockTag?: BlockTag | Promise<BlockTag>
  ): Promise<Array<MoveValue>>;

  abstract dryRun(
    transaction: Deferrable<TransactionRequest>
  ): Promise<TransactionOutput>;

  // Queries
  abstract getBlock(
    blockHashOrBlockTag: BlockTag | Promise<BlockTag>
  ): Promise<BlockWithTransactions>;

  // abstract getBlockWithTransactions(
  //   blockHashOrBlockTag: BlockTag | Promise<BlockTag>
  // ): Promise<BlockWithTransactions>;
  abstract getTransaction(
    transactionHash: HashValue
  ): Promise<TransactionResponse>;

  abstract getTransactionInfo(
    transactionHash: HashValue
  ): Promise<TransactionInfoView>;

  abstract getEventsOfTransaction(
    transactionHash: HashValue
  ): Promise<TransactionEventView[]>;

  // Bloom-filter Queries
  abstract getTransactionEvents(
    filter: Filter
  ): Promise<Array<TransactionEventView>>;

  // Event Emitter (ish)
  abstract on(eventName: EventType, listener: Listener): Provider;

  abstract once(eventName: EventType, listener: Listener): Provider;

  abstract emit(eventName: EventType, ...args: Array<any>): boolean;

  abstract listenerCount(eventName?: EventType): number;

  abstract listeners(eventName?: EventType): Array<Listener>;

  abstract off(eventName: EventType, listener?: Listener): Provider;

  abstract removeAllListeners(eventName?: EventType): Provider;

  // Alias for "on"
  addListener(eventName: EventType, listener: Listener): Provider {
    return this.on(eventName, listener);
  }

  // Alias for "off"
  removeListener(eventName: EventType, listener: Listener): Provider {
    return this.off(eventName, listener);
  }

  // @TODO: This *could* be implemented here, but would pull in events...
  abstract waitForTransaction(
    transactionHash: string,
    confirmations?: number,
    timeout?: number
  ): Promise<TransactionInfoView>;

  readonly _isProvider!: boolean;

  constructor() {
    logger.checkAbstract(new.target, Provider);
    defineReadOnly(this, '_isProvider', true);
  }

  static isProvider(value: any): value is Provider {
    // eslint-disable-next-line no-underscore-dangle
    return !!(value && value._isProvider);
  }
}
