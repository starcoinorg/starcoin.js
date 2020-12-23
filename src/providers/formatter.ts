'use strict';

import { BigNumber } from '@ethersproject/bignumber';
import {
  BytesLike,
  hexDataLength,
  hexStripZeros,
  hexValue,
  isHexString,
} from '@ethersproject/bytes';
import { Logger } from '@ethersproject/logger';
import { shallowCopy } from '@ethersproject/properties';

import {
  BlockMetadataView,
  BlockView,
  BlockWithTransactions,
  BlockWithTxnHashes,
  Filter,
  TransactionEventView,
  TransactionInfoView,
  TransactionResponse,
  TransactionVMStatus_Executed,
  TransactionVMStatus_MiscellaneousError,
  TransactionVMStatus_OutOfGas,
} from '../abstract-provider';
import {
  parseUserTransaction,
  RawUserTransactionView,
  SignedUserTransactionView,
} from '../transaction';
import {
  TransactionAuthenticator,
  TransactionVMStatus,
  TypeTag,
  U128,
  U256,
  U64,
  U8,
} from '../types';
import { version } from '../version';

const logger = new Logger(version);

export type FormatFunc = (value: any) => any;

export type FormatFuncs = { [key: string]: FormatFunc };

export type Formats = {
  blockMetadata: FormatFuncs;
  rawTransaction: FormatFuncs;
  signedUserTransaction: FormatFuncs;
  transaction: FormatFuncs;

  // transactionRequest: FormatFuncs;
  transactionInfo: FormatFuncs;
  transactionEvent: FormatFuncs;
  eventFilter: FormatFuncs;

  blockHeader: FormatFuncs;
  blockBody: FormatFuncs;
  block: FormatFuncs;
  blockWithTransactions: FormatFuncs;
};

export class Formatter {
  readonly formats: Formats;

  constructor() {
    logger.checkNew(new.target, Formatter);
    this.formats = this.getDefaultFormats();
  }

  getDefaultFormats(): Formats {
    const formats: Formats = <Formats>{};

    const address = this.address.bind(this);
    const bigNumber = this.bigNumber.bind(this);
    const blockTag = this.blockTag.bind(this);
    const data = this.data.bind(this);
    const hash = this.hash.bind(this);
    const hex = this.hex.bind(this);
    const number = this.number.bind(this);
    const u64 = this.u64.bind(this);
    const u8 = this.u8.bind(this);
    const u256 = this.u256.bind(this);

    const strictData = (v: any) => {
      return this.data(v, true);
    };

    formats.rawTransaction = {
      sender: address,
      sequence_number: u64,
      payload: data,
      max_gas_amount: u64,
      gas_unit_price: u64,
      gas_token_code: (v) => v,
      expiration_timestamp_secs: u64,
      chain_id: u8,
    };

    formats.signedUserTransaction = {
      transaction_hash: hash,
      raw_txn: this.rawUserTransaction.bind(this),
      authenticator: this.transactionAuthenticator.bind(this),
    };

    formats.blockMetadata = {
      parent_hash: hash,
      timestamp: u64,
      author: address,
      author_auth_key: hex,
      uncles: u64,
      number: u64,
      chain_id: u8,
      parent_gas_used: u64,
    };

    const txnBlockInfo = {
      block_hash: hash,
      block_number: u64,
      transaction_hash: Formatter.allowNull(hash, null),
      transaction_index: Formatter.allowNull(number, null),
    };

    formats.transaction = {
      block_metadata: Formatter.allowNull(this.blockMetadata.bind(this), null),
      user_transaction: Formatter.allowNull(
        this.signedUserTransaction.bind(this),
        null
      ),
      ...txnBlockInfo,
    };
    formats.blockBody = {
      Full: Formatter.allowNull(
        Formatter.arrayOf(this.signedUserTransaction.bind(this))
      ),
      Hashes: Formatter.allowNull(Formatter.arrayOf(hash)),
    };
    formats.blockHeader = {
      block_hash: hash,

      parent_hash: hash,
      timestamp: u64,
      number: u64,
      author: address,
      author_auth_key: Formatter.allowNull(hex, null),
      /// The transaction accumulator root hash after executing this block.
      accumulator_root: hash,
      /// The parent block accumulator root hash.
      parent_block_accumulator_root: hash,
      /// The last transaction state_root of this block after execute.
      state_root: hash,
      /// Gas used for contracts execution.
      gas_used: u64,
      /// Block difficulty
      difficulty: u256,
      /// Consensus nonce field.
      nonce: u64,
      /// hash for block body
      body_hash: hash,
      /// The chain id
      chain_id: u8,
    };

    formats.blockWithTransactions = {
      header: (value) => Formatter.check(formats.blockHeader, value),
      body: (value) => value,
    };
    formats.block = {
      header: (value) => Formatter.check(formats.blockHeader, value),
      body: (value) => Formatter.check(formats.blockBody, value),
      confirmations: number,
    };

    formats.transactionInfo = {
      state_root_hash: hash,
      event_root_hash: hash,
      gas_used: u64,
      status: this.transactionVmStatus.bind(this),
      txn_events: Formatter.allowNull(
        Formatter.arrayOf(this.transactionEvent.bind(this)),
        null
      ),
      ...txnBlockInfo,
    };

    formats.transactionEvent = {
      data: hex,
      type_tags: this.typeTag.bind(this),
      event_key: hex,
      event_seq_number: u64,
      ...txnBlockInfo,
    };

    formats.blockWithTransactions = shallowCopy(formats.block);
    formats.blockWithTransactions.transactions = Formatter.allowNull(
      Formatter.arrayOf(this.transactionResponse.bind(this))
    );

    formats.eventFilter = {
      from_block: Formatter.allowNull(blockTag, undefined),
      to_block: Formatter.allowNull(blockTag, undefined),
      event_keys: Formatter.arrayOf(hex),
      limit: Formatter.allowNull(number, undefined),
    };
    return formats;
  }

  typeTag(value: any): TypeTag {
    return value as TypeTag;
  }

  transactionAuthenticator(value: any): TransactionAuthenticator {
    return value as TransactionAuthenticator;
  }

  rawUserTransaction(value: any): RawUserTransactionView {
    return Formatter.check(this.formats.rawTransaction, value);
  }

  signedUserTransaction(value: any): SignedUserTransactionView {
    return Formatter.check(this.formats.signedUserTransaction, value);
  }

  blockMetadata(value: any): BlockMetadataView {
    return Formatter.check(this.formats.blockMetadata, value);
  }

  transactionEvent(value: any): TransactionEventView {
    return Formatter.check(this.formats.transactionEvent, value);
  }

  transactionVmStatus(value: any): TransactionVMStatus {
    if (typeof value === 'string') {
      if (
        [
          TransactionVMStatus_Executed,
          TransactionVMStatus_OutOfGas,
          TransactionVMStatus_MiscellaneousError,
        ].includes(value)
      ) {
        return value as TransactionVMStatus;
      } else {
        throw new Error('invalid txn vm_status: ' + value);
      }
    } else if (typeof value === 'object') {
      if (value['MoveAbort']) {
        return value as TransactionVMStatus;
      } else if (value['ExecutionFailure']) {
        return value as TransactionVMStatus;
      } else {
        throw new Error('invalid txn vm_status: ' + JSON.stringify(value));
      }
    } else {
      throw new Error('invalid txn vm_status type ' + value);
    }
  }

  // Requires a BigNumberish that is within the IEEE754 safe integer range; returns a number
  // Strict! Used on input.
  number(number: any): number {
    if (number === '0x') {
      return 0;
    }
    return BigNumber.from(number).toNumber();
  }

  u8(value: any): U8 {
    if (typeof value === 'string') {
      return Number.parseInt(value);
    } else if (typeof value === 'number') {
      return value;
    }
    throw new Error('invalid u8: ' + value);
  }
  u64(number: any): U64 {
    return this._bigint(number);
  }
  u128(number: any): U128 {
    return this._bigint(number);
  }
  u256(number: any): U256 {
    if (typeof number == 'string') {
      return number;
    } else if (typeof number == 'number') {
      return number.toString();
    }
    throw new Error('invalid bigint: ' + number);
  }

  private _bigint(number: any): number | BigInt {
    if (typeof number == 'string') {
      const bn = BigInt(number);
      if (bn > Number.MAX_SAFE_INTEGER) {
        return bn;
      } else {
        return Number.parseInt(number);
      }
    } else if (typeof number == 'number') {
      return number;
    }
    throw new Error('invalid bigint: ' + number);
  }

  // Strict! Used on input.
  bigNumber(value: any): BigNumber {
    return BigNumber.from(value);
  }

  // Requires a boolean, "true" or  "false"; returns a boolean
  boolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      value = value.toLowerCase();
      if (value === 'true') {
        return true;
      }
      if (value === 'false') {
        return false;
      }
    }
    throw new Error('invalid boolean - ' + value);
  }

  hex(value: any, strict?: boolean): string {
    if (typeof value === 'string') {
      if (!strict && value.substring(0, 2) !== '0x') {
        value = '0x' + value;
      }
      if (isHexString(value)) {
        return value.toLowerCase();
      }
    }
    return logger.throwArgumentError('invalid hex', 'value', value);
  }

  data(value: any, strict?: boolean): string {
    const result = this.hex(value, strict);
    if (result.length % 2 !== 0) {
      throw new Error('invalid data; odd-length - ' + value);
    }
    return result;
  }

  // Requires an address
  // Strict! Used on input.
  address(value: any): string {
    if (typeof value !== 'string') {
      logger.throwArgumentError('invalid address', 'address', value);
    }
    const result = this.hex(value, true);
    if (hexDataLength(result) !== 16) {
      return logger.throwArgumentError('invalid address', 'value', value);
    }
    return hexStripZeros(value);
  }

  // Strict! Used on input.
  blockTag(blockTag: any): number {
    // if (blockTag == null) {
    //   return 'latest';
    // }

    if (blockTag === 'earliest') {
      return 0;
    }

    // if (blockTag === 'latest' || blockTag === 'pending') {
    //   return blockTag;
    // }

    if (typeof blockTag === 'number') {
      return blockTag;
    }

    throw new Error('invalid blockTag');
  }

  // Requires a hash, optionally requires 0x prefix; returns prefixed lowercase hash.
  hash(value: any, strict?: boolean): string {
    const result = this.hex(value, strict);
    if (hexDataLength(result) !== 32) {
      return logger.throwArgumentError('invalid hash', 'value', value);
    }
    return result;
  }

  // // Returns the difficulty as a number, or if too large (i.e. PoA network) null
  // difficulty(value: any): number {
  //   if (value == null) {
  //     return null;
  //   }
  //
  //   const v = BigNumber.from(value);
  //
  //   try {
  //     return v.toNumber();
  //     // eslint-disable-next-line no-empty
  //   } catch (error) {}
  //
  //   return null;
  // }

  // uint256(value: any): string {
  //   if (!isHexString(value)) {
  //     throw new Error('invalid uint256');
  //   }
  //   return hexZeroPad(value, 32);
  // }

  private _block(value: any): BlockView {
    const block = Formatter.check(this.formats.block, value);

    const transactions = block.body.Full ? block.body.Full : block.body.Hashes;
    return {
      header: block.header,
      transactions,
      confirmations: block.confirmations,
    };
  }

  blockWithTxnHashes(value: any): BlockWithTxnHashes {
    const { header, transactions, confirmations } = this._block(value);
    return {
      header,
      transactions: (transactions as SignedUserTransactionView[]).map(
        (t) => t.transaction_hash
      ),
      confirmations,
    };
  }

  blockWithTransactions(value: any): BlockWithTransactions {
    const { header, transactions, confirmations } = this._block(value);
    return {
      header,
      transactions: transactions as Array<SignedUserTransactionView>,
      confirmations,
    };
  }

  // // Strict! Used on input.
  // transactionRequest(value: any): any {
  //   return Formatter.check(this.formats.transactionRequest, value);
  // }

  transactionResponse(transaction: any): TransactionResponse {
    return transaction as TransactionResponse;
  }

  // transactionResponse(transaction: any): TransactionResponse {
  //   // Rename gas to gasLimit
  //   if (transaction.gas != null && transaction.gasLimit == null) {
  //     transaction.gasLimit = transaction.gas;
  //   }
  //
  //   // Some clients (TestRPC) do strange things like return 0x0 for the
  //   // 0 address; correct this to be a real address
  //   if (transaction.to && BigNumber.from(transaction.to).isZero()) {
  //     transaction.to = '0x0000000000000000000000000000000000000000';
  //   }
  //
  //   // Rename input to data
  //   if (transaction.input != null && transaction.data == null) {
  //     transaction.data = transaction.input;
  //   }
  //
  //   // If to and creates are empty, populate the creates from the transaction
  //   if (transaction.to == null && transaction.creates == null) {
  //     transaction.creates = this.contractAddress(transaction);
  //   }
  //
  //   // @TODO: use transaction.serialize? Have to add support for including v, r, and s...
  //   /*
  //   if (!transaction.raw) {
  //
  //        // Very loose providers (e.g. TestRPC) do not provide a signature or raw
  //        if (transaction.v && transaction.r && transaction.s) {
  //            let raw = [
  //                stripZeros(hexlify(transaction.nonce)),
  //                stripZeros(hexlify(transaction.gasPrice)),
  //                stripZeros(hexlify(transaction.gasLimit)),
  //                (transaction.to || "0x"),
  //                stripZeros(hexlify(transaction.value || "0x")),
  //                hexlify(transaction.data || "0x"),
  //                stripZeros(hexlify(transaction.v || "0x")),
  //                stripZeros(hexlify(transaction.r)),
  //                stripZeros(hexlify(transaction.s)),
  //            ];
  //
  //            transaction.raw = rlpEncode(raw);
  //        }
  //    }
  //    */
  //
  //   const result: TransactionResponse = Formatter.check(
  //     this.formats.transaction,
  //     transaction
  //   );
  //
  //   if (transaction.chainId != null) {
  //     let chainId = transaction.chainId;
  //
  //     if (isHexString(chainId)) {
  //       chainId = BigNumber.from(chainId).toNumber();
  //     }
  //
  //     result.chainId = chainId;
  //   } else {
  //     let chainId = transaction.networkId;
  //
  //     // geth-etc returns chainId
  //     if (chainId == null && result.v == null) {
  //       chainId = transaction.chainId;
  //     }
  //
  //     if (isHexString(chainId)) {
  //       chainId = BigNumber.from(chainId).toNumber();
  //     }
  //
  //     if (typeof chainId !== 'number' && result.v != null) {
  //       chainId = (result.v - 35) / 2;
  //       if (chainId < 0) {
  //         chainId = 0;
  //       }
  //       chainId = parseInt(chainId);
  //     }
  //
  //     if (typeof chainId !== 'number') {
  //       chainId = 0;
  //     }
  //
  //     result.chainId = chainId;
  //   }
  //
  //   // 0x0000... should actually be null
  //   if (result.blockHash && result.blockHash.replace(/0/g, '') === 'x') {
  //     result.blockHash = null;
  //   }
  //
  //   return result;
  // }

  userTransactionData(value: BytesLike): SignedUserTransactionView {
    return parseUserTransaction(value);
  }

  transactionInfo(value: any): TransactionInfoView {
    return Formatter.check(this.formats.transactionInfo, value);
  }

  topics(value: any): any {
    if (Array.isArray(value)) {
      return value.map((v) => this.topics(v));
    } else if (value != null) {
      return this.hash(value, true);
    }

    return null;
  }

  filter(value: any): Filter {
    return Formatter.check(this.formats.eventFilter, value);
  }

  static check(format: { [name: string]: FormatFunc }, object: any): any {
    const result: any = {};
    for (const key in format) {
      try {
        const value = format[key](object[key]);
        if (value !== undefined) {
          result[key] = value;
        }
      } catch (error) {
        error.checkKey = key;
        error.checkValue = object[key];
        throw error;
      }
    }
    return result;
  }

  // if value is null-ish, nullValue is returned
  static allowNull(format: FormatFunc, nullValue?: any): FormatFunc {
    return function (value: any) {
      if (value == null) {
        return nullValue;
      }
      return format(value);
    };
  }

  // If value is false-ish, replaceValue is returned
  static allowFalsish(format: FormatFunc, replaceValue: any): FormatFunc {
    return function (value: any) {
      if (!value) {
        return replaceValue;
      }
      return format(value);
    };
  }

  // Requires an Array satisfying check
  static arrayOf(format: FormatFunc): FormatFunc {
    return function (array: any): Array<any> {
      if (!Array.isArray(array)) {
        throw new Error('not an array');
      }

      const result: any = [];

      array.forEach(function (value) {
        result.push(format(value));
      });

      return result;
    };
  }
}

//
// export interface CommunityResourcable {
//   isCommunityResource(): boolean;
// }
//
// export function isCommunityResourcable(
//   value: any
// ): value is CommunityResourcable {
//   return value && typeof value.isCommunityResource === 'function';
// }
//
// export function isCommunityResource(value: any): boolean {
//   return isCommunityResourcable(value) && value.isCommunityResource();
// }
