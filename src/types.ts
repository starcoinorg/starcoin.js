export type Identifier = string;
export type AccountAddress = string;
export type HashValue = string;
export type U8 = number;
export type U64 = number;
export type U128 = number;
export type U256 = number;
export type BlockNumber = number;
export type AuthenticationKey = string;
export type Ed25519PublicKey = string;
export type Ed25519Signature = string;
export type MultiEd25519PublicKey = string;
export type MultiEd25519Signature = string;
export type EventKey = string;

export type TypeTag =
  | 'Bool'
  | 'U8'
  | 'U64'
  | 'U128'
  | 'Address'
  | 'Signer'
  | { Vector: TypeTag[] }
  | { Struct: StructTag };

export interface ChainId {
  id: U8;
}

export interface ChainInfo {
  head_block: HashValue;
}

export interface Block {
  header: BlockHeader;
  body: BlockBody;
}

export interface BlockHeader {
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
  chain_id: ChainId;
}

interface Script {
  code: Uint8Array;
  ty_args: TypeTag[];
  args: TransactionArgument[];
}

interface Module {
  code: Uint8Array;
}

interface Package {
  package_address: AccountAddress;
  modules: Module[];
  init_script?: Script;
}

export type TransactionPayload = { Script: Script } | { Package: Package };

export interface RawUserTransaction {
  /// Sender's address.
  sender: AccountAddress;
  // Sequence number of this transaction corresponding to sender's account.
  sequence_number: U64;
  // The transaction script to execute.
  payload: TransactionPayload;

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
  chain_id: ChainId;
}

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

export interface SignedUserTransaction {
  /// The raw transaction
  raw_txn: RawUserTransaction;

  /// Public key and signature to authenticate
  authenticator: TransactionAuthenticator;
}

export interface BlockMetadata {
  parent_hash: HashValue;
  timestamp: U64;
  author: AccountAddress;
  author_auth_key?: AuthenticationKey;
  uncles: U64;
  number: U64;
  chain_id: ChainId;
  parent_gas_used: U64;
}

export type Transaction =
  | { UserTransaction: SignedUserTransaction }
  | { BlockMetadata: BlockMetadata };

export interface BlockBody {
  transactions: SignedUserTransaction[];
  uncles?: BlockHeader[];
}

export interface StructTag {
  address: string;
  module: string;
  name: string;
  type_params: TypeTag[];
}

export type TransactionArgument =
  | { U8: number }
  | { U64: number }
  | { U128: number }
  | { Address: AccountAddress }
  | { U8Vector: Uint8Array }
  | { Bool: boolean };

export interface AnnotatedMoveStruct {
  is_resource: boolean;
  type_: StructTag;
  value: [Identifier, AnnotatedMoveValue][];
}

export type AnnotatedMoveValue =
  | { U8: number }
  | { U64: number }
  | { U128: number }
  | { Bool: boolean }
  | { Address: AccountAddress }
  | { Bytes: Uint8Array }
  | { Vector: AnnotatedMoveValue[] }
  | { Struct: AnnotatedMoveStruct };

export type MoveValue =
  | number
  | boolean
  | AccountAddress
  | Uint8Array
  | MoveValue[]
  | MoveStruct;
export type MoveStruct = { [key in Identifier]: MoveValue };

export interface ContractCall {
  module_address: AccountAddress;
  module_name: Identifier;
  func: Identifier;
  type_args: TypeTag[];
  args: TransactionArgument[];
}

export interface GlobalTimeOnChain {
  milliseconds: U64;
}

export interface EventHandle {
  count: U64;
  key: EventKey;
}

export interface Epoch {
  number: U64;
  //seconds
  start_time: U64;
  start_block_number: U64;
  end_block_number: U64;
  //seconds
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

export interface EventFilter {
  from_block?: U64;
  to_block?: U64;
  event_keys: EventKey[];
  limit?: U64;
}
