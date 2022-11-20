import { BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";
import { uint128, uint64, uint8 } from '../lib/runtime/serde';

export type Identifier = string;
export type AccountAddress = string;
export type HashValue = string;
export type U8 = number;
export type U16 = number;
export type U64 = number | BigInt;
export type U128 = number | BigInt;
export type U256 = string;
export type I64 = number | BigInt;
export type BlockNumber = number;
export type AuthenticationKey = string;
export type Ed25519PublicKey = string;
export type Ed25519PrivateKey = string;
export type Ed25519Signature = string;
export type MultiEd25519PublicKey = string;
export type MultiEd25519Signature = string;
export type EventKey = string;
export type HexString = string;

export const accountType = {
  SINGLE: 0,
  MULTI: 1,
}

export interface StructTag {
  address: string;
  module: string;
  name: string;
  // eslint-disable-next-line no-use-before-define
  type_params?: TypeTag[];
}

export type TypeTag =
  | 'Bool'
  | 'U8'
  | 'U64'
  | 'U128'
  | 'Address'
  | 'Signer'
  | { Vector: TypeTag }
  | { Struct: StructTag };

export function formatStructTag(structTag: StructTag): string {
  let s = `${ structTag.address }::${ structTag.module }::${ structTag.name }`;

  if (structTag.type_params && structTag.type_params.length > 0) {
    s = s.concat('<');
    s = s.concat(formatTypeTag(structTag.type_params[0]));
    for (let t of structTag.type_params.slice(1)) {
      s = s.concat(',').concat(formatTypeTag(t));
    }
    s = s.concat('>');
  }
  return s;
}

export function formatTypeTag(typeTag: TypeTag): string {
  if (typeof typeTag === 'string') {
    return typeTag.toLowerCase();
  }
  if (typeof typeTag === 'object') {
    // @ts-ignore
    if (typeTag.Vector !== undefined) {
      // @ts-ignore
      let subTypeTag: TypeTag = typeTag.Vector;
      return `vector<${ formatTypeTag(subTypeTag) }>`;
    }

    // @ts-ignore
    if (typeTag.Struct !== undefined) {
      // @ts-ignore
      let subTypeTag: StructTag = typeTag.Struct;
      return formatStructTag(subTypeTag);
    }
  }
}

export interface ChainId {
  id: U8;
}

interface Script {
  code: HexString;
  ty_args: TypeTag[];
  // eslint-disable-next-line no-use-before-define
  args: HexString[];
}

interface ScriptFunction {
  func: FunctionId;
  ty_args: TypeTag[];
  // eslint-disable-next-line no-use-before-define
  args: HexString[];
}

interface Module {
  code: HexString;
}

interface Package {
  package_address: AccountAddress;
  modules: Module[];
  init_script?: ScriptFunction;
}

export type TransactionPayload =
  | { Script: Script }
  | { Package: Package }
  | { ScriptFunction: ScriptFunction };

export type SignatureType = 'Ed25519' | 'MultiEd25519';

export type TransactionAuthenticator =
  | {
    Ed25519: {
      public_key: Ed25519PublicKey;
      signature: Ed25519Signature;
    };
  }
  | {
    MultiEd25519: {
      public_key: MultiEd25519PublicKey;
      signature: MultiEd25519Signature;
    };
  };

// export type TransactionArgument =
//   | { U8: number }
//   | { U64: BigInt }
//   | { U128: BigInt }
//   | { Address: AccountAddress }
//   | { U8Vector: Uint8Array }
//   | { Bool: boolean };

export interface AnnotatedMoveStruct {
  type_: string;
  // eslint-disable-next-line no-use-before-define
  value: [Identifier, AnnotatedMoveValue][];
}

export type AnnotatedMoveValue =
  | { U8: number }
  | { U64: string }
  | { U128: string }
  | { Bool: boolean }
  | { Address: AccountAddress }
  | { Bytes: HexString }
  | { Vector: AnnotatedMoveValue[] }
  | { Struct: AnnotatedMoveStruct };

// eslint-disable-next-line no-use-before-define
export type MoveStruct = { [key in Identifier]: MoveValue };
export type MoveValue =
  | number
  | bigint
  | boolean
  | AccountAddress
  | HexString
  | MoveValue[]
  | MoveStruct;

export interface EventHandle {
  count: U64;
  key: EventKey;
}

export interface Epoch {
  number: U64;
  // seconds
  start_time: U64;
  start_block_number: U64;
  end_block_number: U64;
  // seconds
  block_time_target: U64;
  reward_per_block: U128;
  reward_per_uncle_percent: U64;
  block_difficulty_window: U64;
  max_uncles_per_block: U64;
  block_gas_limit: U64;
  strategy: U8;
  new_epoch_events: EventHandle;
}

export interface EpochData {
  uncles: U64;
  total_reward: U128;
  total_gas: U128;
}

export interface EpochInfo {
  epoch: Epoch;
  epoch_data: EpochData;
}

export interface Event {
  block_hash?: HashValue;
  block_number?: BlockNumber;
  transaction_hash?: HashValue;
  // txn index in block
  transaction_index?: U64;
  data: Uint8Array;
  type_tags: TypeTag;
  event_key: EventKey;
  event_seq_number: U64;
}

export interface TypeArgumentABI {
  /// The name of the argument.
  name: string;
}

export interface ArgumentABI {
  /// The name of the argument.
  name: string;
  /// The expected type.
  /// In Move scripts, this does contain generics type parameters.
  type_tag: TypeTag;
}

export interface ScriptABI {
  // The public name of the script.
  name: string;
  // Some text comment.
  doc: string;
  // The `code` value to set in the `Script` object.
  code: Uint8Array;
  // The names of the type arguments.
  ty_args: TypeArgumentABI[];
  // The description of regular arguments.
  args: ArgumentABI[];
}

export type AbortLocation =
  | 'Script'
  | {
    Module: {
      address: AccountAddress;
      name: Identifier;
    };
  };

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TransactionVMStatus_Executed = 'Executed';
// eslint-disable-next-line @typescript-eslint/naming-convention
export const TransactionVMStatus_OutOfGas = 'OutOfGas';
// eslint-disable-next-line @typescript-eslint/naming-convention
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
  }
  | { Discard: { status_code: U64 } };

// Exported Types

export interface ReceiptIdentifierView {
  accountAddress: string,
  authKey: string
}

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

export interface SignedUserTransactionView {
  transaction_hash: HashValue;
  raw_txn: RawUserTransactionView;
  authenticator: TransactionAuthenticator;
}

export interface TransactionRequest {
  to?: string,
  from?: string,
  nonce?: BigNumberish,

  gasLimit?: BigNumberish,
  gasPrice?: BigNumberish,

  data?: BytesLike,
  value?: BigNumberish,
  expiredSecs?: U64;
  addGasBufferMultiplier?: U8;

  functionAptos?: {
    type?: string,
    function: string,
    type_arguments: Array<string>,
    arguments: Array<any>,
  };

  sender?: AccountAddress;
  sender_public_key?: HexString;
  sequence_number?: U64;

  script?: {
    code: string;
    type_args?: Array<string>;
    args?: Array<string>;
  };
  modules?: Array<HexString>;

  max_gas_amount?: U64;
  gas_unit_price?: U64;
  gas_token_code?: string;
  chain_id?: U8;
}

/// block hash or block number
export type BlockTag = string | number;
export type ModuleId = string | { address: AccountAddress; name: Identifier };
export type FunctionId =
  | string
  | { address: AccountAddress; module: Identifier; functionName: Identifier };

export interface CallRequest {
  function_id: FunctionId;
  type_args?: string[];
  args?: string[];
}

export function formatFunctionId(functionId: FunctionId): string {
  if (typeof functionId !== 'string') {
    return `${ functionId.address }::${ functionId.module }::${ functionId.functionName }`;
  } else {
    return functionId;
  }
}

export function parseFunctionId(
  functionId: FunctionId
): { address: AccountAddress; module: Identifier; functionName: Identifier } {
  if (typeof functionId !== 'string') {
    return functionId;
  } else {
    const parts = functionId.split('::', 3);
    if (parts.length !== 3) {
      throw new Error(`cannot parse ${ functionId } into FunctionId`);
    }
    return {
      address: parts[0],
      module: parts[1],
      functionName: parts[2],
    };
  }
}

export interface BlockHeaderView {
  block_hash: HashValue;

  parent_hash: HashValue;
  timestamp: U64;
  number: BlockNumber;
  author: AccountAddress;
  author_auth_key?: AuthenticationKey;
  /// The transaction accumulator root hash after executing this block.
  txn_accumulator_root: HashValue;
  /// The parent block accumulator root hash.
  block_accumulator_root: HashValue;
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

export interface TxnBlockInfo {
  block_hash: HashValue;
  block_number: BlockNumber;
  transaction_hash: HashValue;
  transaction_index: number;
}

export interface TransactionEventView extends TxnBlockInfo {
  data: HexString;
  type_tags: TypeTag;
  event_key: EventKey;
  event_seq_number: U64;
}

export interface AccessPath {
  address: AccountAddress;
  path: HexString;
}

export type WriteOp = 'Deletion' | { Value: HexString };

export interface TransactionWriteAction extends AccessPath {
  action: WriteOp;
}

export interface TransactionOutput {
  gas_used: U64;
  delta_size: I64;
  status: TransactionVMStatus;
  events: TransactionEventView[];
  write_set: TransactionWriteAction[];
}

export interface TransactionInfoView extends TxnBlockInfo {
  state_root_hash: HashValue;
  event_root_hash: HashValue;
  gas_used: U64;
  status: TransactionVMStatus;

  txn_events?: Array<TransactionEventView>;

  confirmations: number;
}

export interface TransactionResponse extends SignedUserTransactionView {
  // Only if a transaction has been mined
  block_number?: BlockNumber;
  block_hash?: HashValue;

  confirmations: number;

  // This function waits until the transaction has been mined
  wait: (confirmations?: number) => Promise<TransactionInfoView>;
}

export interface EventFilter {
  event_keys?: EventKey[];
  limit?: number;
}

export interface Filter extends EventFilter {
  from_block?: BlockNumber;
  to_block?: BlockNumber;
}

export interface OnchainEvent<T> {
  address: AccountAddress;
  eventId: uint64;
  eventSequenceNumber: uint64;
  eventData: T;
}

export interface AcceptTokenEvent {
  token_code: TokenCode;
}

export interface TokenCode {
  address: AccountAddress;
  module: string;
  name: string;
}

export interface BlockRewardEvent {
  block_number: uint64;
  block_reward: uint128;
  gas_fees: uint128;
  miner: AccountAddress;
}

export interface BurnEvent {
  amount: uint128;
  token_code: TokenCode;
}
export interface MintEvent {
  amount: uint128;
  token_code: TokenCode;
}

export interface DepositEvent {
  amount: uint128;
  token_code: TokenCode;
  metadata: uint8[];
}
export interface WithdrawEvent {
  amount: uint128;
  token_code: TokenCode;
  metadata: uint8[];
}

export interface NewBlockEvent {
  number: uint64;
  author: AccountAddress;

  timestamp: uint64;
  uncles: uint64;
}

export interface ProposalCreatedEvent {
  proposal_id: uint64;
  proposer: AccountAddress;
}

export interface VoteChangedEvent {
  proposal_id: uint64;
  proposer: AccountAddress;
  voter: AccountAddress;
  agree: boolean;
  vote: uint128;
}
