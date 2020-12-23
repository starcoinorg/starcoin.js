'use strict';

import { BigNumberish } from '@ethersproject/bignumber';
import { BytesLike } from '@ethersproject/bytes';
import { Logger } from '@ethersproject/logger';
import { defineReadOnly } from '@ethersproject/properties';
import { OnceBlockable } from '@ethersproject/web';

import { Network } from '../networks';
import {
  AbortLocation,
  AccountAddress,
  AuthenticationKey,
  BlockNumber,
  EventKey,
  HashValue,
  HexString,
  SignatureType,
  TransactionAuthenticator,
  TypeTag,
  U16,
  U256,
  U64,
  U8,
} from '../types';

const version = 'abstract-provider/5.0.5';
const logger = new Logger(version);

///////////////////////////////
// Exported Types
export interface RawUserTransactionView {
  /// Sender's address.
  sender: AccountAddress;
  // Sequence number of this transaction corresponding to sender's account.
  sequence_number: U64;
  // The transaction script to execute.
  payload: HexString;

  // Maximal total gas specified by wallet to spend for this transaction.
  max_gas_amount: U64;
  // Maximal price can be paid per gas.
  gas_unit_price: U64;
  // The token code for pay transaction gas, Default is STC token code.
  gas_token_code: string;
  // Expiration timestamp for this transaction. timestamp is represented
  // as u64 in seconds from Unix Epoch. If storage is queried and
  // the time returned is greater than or equal to this time and this
  // transaction has not been included, you can be certain that it will
  // never be included.
  // A transaction that doesn't expire is represented by a very large value like
  // u64::max_value().
  expiration_timestamp_secs: U64;
  chain_id: U8;
}

export interface TransactionSignature {
  signature_type: SignatureType;
  public_key: string;
  signature: string;
}

export interface SignedUserTransactionView {
  transaction_hash: HashValue;
  raw_txn: RawUserTransactionView;
  authenticator: TransactionAuthenticator;
}
export interface TransactionView {
  block_hash: HashValue;
  block_number: BlockNumber;
  transaction_hash: HashValue;
  transaction_index: number;
  block_metadata?: BlockMetadataView;
  user_transaction?: SignedUserTransactionView;
}

export type TransactionRequest = {
  to?: string;
  from?: string;
  nonce?: BigNumberish;

  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;

  data?: BytesLike;
  value?: BigNumberish;
  chainId?: number;
};

export interface TransactionResponse extends SignedUserTransactionView {
  // Only if a transaction has been mined
  block_number?: BlockNumber;
  block_hash?: HashValue;
  timestamp?: number;

  confirmations: number;

  // This function waits until the transaction has been mined
  wait: (confirmations?: number) => Promise<TransactionInfoView>;
}

export type BlockTag = string | number;

export interface BlockHeaderView {
  block_hash: HashValue;

  parent_hash: HashValue;
  timestamp: U64;
  number: BlockNumber;
  author: AccountAddress;
  author_auth_key?: AuthenticationKey;
  /// The transaction accumulator root hash after executing this block.
  accumulator_root: HashValue;
  /// The parent block accumulator root hash.
  parent_block_accumulator_root: HashValue;
  /// The last transaction state_root of this block after execute.
  state_root: HashValue;
  /// Gas used for contracts execution.
  gas_used: U64;
  /// Block difficulty
  difficulty: U256;
  /// Consensus nonce field.
  nonce: U64;
  /// hash for block body
  body_hash: HashValue;
  /// The chain id
  chain_id: U8;
}
export interface BlockMetadataView {
  parent_hash: HashValue;
  timestamp: U64;
  author: AccountAddress;
  author_auth_key?: AuthenticationKey;
  uncles: U64;
  number: BlockNumber;
  chain_id: U8;
  parent_gas_used: U64;
}

interface BlockCommon {
  header: BlockHeaderView;
  confirmations?: number;
}
export interface BlockWithTxnHashes extends BlockCommon {
  transactions: HashValue[];
}

export interface BlockWithTransactions extends BlockCommon {
  transactions: Array<SignedUserTransactionView>;
}

export interface BlockView extends BlockCommon {
  transactions: Array<HashValue | SignedUserTransactionView>;
}

export interface TransactionEventView extends TxnBlockInfo {
  data: HexString;
  type_tags: TypeTag;
  event_key: EventKey;
  event_seq_number: U64;
}

export interface TxnBlockInfo {
  block_hash: HashValue;
  block_number: BlockNumber;
  transaction_hash: HashValue;
  transaction_index: number;
}

export const TransactionVMStatus_Executed = 'Executed';
export const TransactionVMStatus_OutOfGas = 'OutOfGas';
export const TransactionVMStatus_MiscellaneousError = 'MiscellaneousError';
export type TransactionVMStatus =
  | 'Executed'
  | 'OutOfGas'
  | 'MiscellaneousError'
  | {
      MoveAbort: { location: AbortLocation; abort_code: U64 };
    }
  | {
      ExecutionFailure: {
        location: AbortLocation;
        function: U16;
        code_offset: U16;
      };
    };

export interface TransactionInfoView extends TxnBlockInfo {
  state_root_hash: HashValue;
  event_root_hash: HashValue;
  gas_used: U64;
  status: TransactionVMStatus;

  txn_events?: Array<TransactionEventView>;

  confirmations: number;
}

export interface EventFilter {
  event_keys?: EventKey[];
  limit?: number;
}

export interface Filter extends EventFilter {
  from_block?: BlockNumber;
  to_block?: BlockNumber;
}

// export interface FilterByBlockHash extends EventFilter {
//   blockHash?: string;
// }

// export abstract class ForkEvent extends Description {
//   // @ts-ignore
//   readonly expiry: number;
//
//   readonly _isForkEvent?: boolean;
//
//   static isForkEvent(value: any): value is ForkEvent {
//     return !!(value && value._isForkEvent);
//   }
// }
//
// export class BlockForkEvent extends ForkEvent {
//   // @ts-ignore
//   readonly blockHash: string;
//
//   readonly _isBlockForkEvent?: boolean;
//
//   constructor(blockHash: string, expiry?: number) {
//     if (!isHexString(blockHash, 32)) {
//       logger.throwArgumentError('invalid blockHash', 'blockHash', blockHash);
//     }
//
//     super({
//       _isForkEvent: true,
//       _isBlockForkEvent: true,
//       expiry: expiry || 0,
//       blockHash: blockHash,
//     });
//   }
// }
//
// export class TransactionForkEvent extends ForkEvent {
//   // @ts-ignore
//   readonly hash: string;
//
//   readonly _isTransactionOrderForkEvent?: boolean;
//
//   constructor(hash: string, expiry?: number) {
//     if (!isHexString(hash, 32)) {
//       logger.throwArgumentError('invalid transaction hash', 'hash', hash);
//     }
//
//     super({
//       _isForkEvent: true,
//       _isTransactionForkEvent: true,
//       expiry: expiry || 0,
//       hash: hash,
//     });
//   }
// }
//
// export class TransactionOrderForkEvent extends ForkEvent {
//   readonly beforeHash!: string;
//   readonly afterHash!: string;
//
//   constructor(beforeHash: string, afterHash: string, expiry?: number) {
//     if (!isHexString(beforeHash, 32)) {
//       logger.throwArgumentError(
//         'invalid transaction hash',
//         'beforeHash',
//         beforeHash
//       );
//     }
//     if (!isHexString(afterHash, 32)) {
//       logger.throwArgumentError(
//         'invalid transaction hash',
//         'afterHash',
//         afterHash
//       );
//     }
//
//     super({
//       _isForkEvent: true,
//       _isTransactionOrderForkEvent: true,
//       expiry: expiry || 0,
//       beforeHash: beforeHash,
//       afterHash: afterHash,
//     });
//   }
// }

export type EventType = string | Array<string> | EventFilter;

export type Listener = (...args: any[]) => void;

///////////////////////////////
// Exported Abstracts

export abstract class Provider implements OnceBlockable {
  // Network
  abstract getNetwork(): Promise<Network>;

  // Latest State
  abstract getBlockNumber(): Promise<number>;
  // abstract getGasPrice(): Promise<BigNumber>;

  // Account
  // abstract getBalance(
  //   addressOrName: string | Promise<string>,
  //   blockTag?: BlockTag | Promise<BlockTag>
  // ): Promise<BigNumber>;
  // abstract getTransactionCount(
  //   addressOrName: string | Promise<string>,
  //   blockTag?: BlockTag | Promise<BlockTag>
  // ): Promise<number>;
  // abstract getCode(
  //   addressOrName: string | Promise<string>,
  //   blockTag?: BlockTag | Promise<BlockTag>
  // ): Promise<string>;
  // abstract getStorageAt(
  //   addressOrName: string | Promise<string>,
  //   position: BigNumberish | Promise<BigNumberish>,
  //   blockTag?: BlockTag | Promise<BlockTag>
  // ): Promise<string>;

  // Execution
  abstract sendTransaction(
    signedTransaction: string | Promise<string>
  ): Promise<TransactionResponse>;

  // abstract call(
  //   transaction: Deferrable<TransactionRequest>,
  //   blockTag?: BlockTag | Promise<BlockTag>
  // ): Promise<string>;

  // abstract estimateGas(
  //   transaction: Deferrable<TransactionRequest>
  // ): Promise<BigNumber>;

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
    return !!(value && value._isProvider);
  }
}
