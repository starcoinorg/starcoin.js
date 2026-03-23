import { BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";
import { uint128, uint64, uint8 } from '../lib/runtime/serde';
export declare type Identifier = string;
export declare type AccountAddress = string;
export declare type HashValue = string;
export declare type U8 = number;
export declare type U16 = number;
export declare type U64 = number | BigInt;
export declare type U128 = number | BigInt;
export declare type U256 = string;
export declare type I64 = number | BigInt;
export declare type BlockNumber = number;
export declare type AuthenticationKey = string;
export declare type Ed25519PublicKey = string;
export declare type Ed25519PrivateKey = string;
export declare type Ed25519Signature = string;
export declare type MultiEd25519PublicKey = string;
export declare type MultiEd25519Signature = string;
export declare type EventKey = string;
export declare type HexString = string;
export declare const accountType: {
    SINGLE: number;
    MULTI: number;
};
export interface StructTag {
    address: string;
    module: string;
    name: string;
    type_params?: TypeTag[];
}
export declare type TypeTag = 'Bool' | 'U8' | 'U64' | 'U128' | 'Address' | 'Signer' | {
    Vector: TypeTag;
} | {
    Struct: StructTag;
};
export declare function formatStructTag(structTag: StructTag): string;
export declare function formatTypeTag(typeTag: TypeTag): string;
export interface ChainId {
    id: U8;
}
interface Script {
    code: HexString;
    ty_args: TypeTag[];
    args: HexString[];
}
interface ScriptFunction {
    func: FunctionId;
    ty_args: TypeTag[];
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
export declare type TransactionPayload = {
    Script: Script;
} | {
    Package: Package;
} | {
    ScriptFunction: ScriptFunction;
} | {
    EntryFunction: ScriptFunction;
};
export declare type SignatureType = 'Ed25519' | 'MultiEd25519';
export declare type TransactionAuthenticator = {
    Ed25519: {
        public_key: Ed25519PublicKey;
        signature: Ed25519Signature;
    };
} | {
    MultiEd25519: {
        public_key: MultiEd25519PublicKey;
        signature: MultiEd25519Signature;
    };
};
export interface AnnotatedMoveStruct {
    type_: string;
    value: [Identifier, AnnotatedMoveValue][];
}
export declare type AnnotatedMoveValue = {
    U8: number;
} | {
    U64: string;
} | {
    U128: string;
} | {
    Bool: boolean;
} | {
    Address: AccountAddress;
} | {
    Bytes: HexString;
} | {
    Vector: AnnotatedMoveValue[];
} | {
    Struct: AnnotatedMoveStruct;
};
export declare type MoveStruct = {
    [key in Identifier]: MoveValue;
};
export declare type MoveValue = number | bigint | boolean | AccountAddress | HexString | MoveValue[] | MoveStruct;
export interface EventHandle {
    count: U64;
    key: EventKey;
}
export interface Epoch {
    number: U64;
    start_time: U64;
    start_block_number: U64;
    end_block_number: U64;
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
    transaction_index?: U64;
    data: Uint8Array;
    type_tags: TypeTag;
    event_key: EventKey;
    event_seq_number: U64;
}
export interface TypeArgumentABI {
    name: string;
}
export interface ArgumentABI {
    name: string;
    type_tag: TypeTag;
}
export interface ScriptABI {
    name: string;
    doc: string;
    code: Uint8Array;
    ty_args: TypeArgumentABI[];
    args: ArgumentABI[];
}
export declare type AbortLocation = 'Script' | {
    Module: {
        address: AccountAddress;
        name: Identifier;
    };
};
export declare const TransactionVMStatus_Executed = "Executed";
export declare const TransactionVMStatus_OutOfGas = "OutOfGas";
export declare const TransactionVMStatus_MiscellaneousError = "MiscellaneousError";
export declare type TransactionVMStatus = 'Executed' | 'OutOfGas' | 'MiscellaneousError' | {
    MoveAbort: {
        location: AbortLocation;
        abort_code: U64;
    };
} | {
    ExecutionFailure: {
        location: AbortLocation;
        function: U16;
        code_offset: U16;
    };
} | {
    Discard: {
        status_code: U64;
    };
};
export interface ReceiptIdentifierView {
    accountAddress: string;
    authKey: string;
}
export interface RawUserTransactionView {
    sender: AccountAddress;
    sequence_number: U64;
    payload: HexString;
    max_gas_amount: U64;
    gas_unit_price: U64;
    gas_token_code: string;
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
    to?: string;
    from?: string;
    nonce?: BigNumberish;
    gasLimit?: BigNumberish;
    gasPrice?: BigNumberish;
    data?: BytesLike;
    value?: BigNumberish;
    expiredSecs?: U64;
    addGasBufferMultiplier?: U8;
    functionAptos?: {
        type?: string;
        function: string;
        type_arguments: Array<string>;
        arguments: Array<any>;
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
export declare type BlockTag = string | number;
export declare type ModuleId = string | {
    address: AccountAddress;
    name: Identifier;
};
export declare type FunctionId = string | {
    address: AccountAddress;
    module: Identifier;
    functionName: Identifier;
};
export interface CallRequest {
    function_id: FunctionId;
    type_args?: string[];
    args?: string[];
}
export declare function formatFunctionId(functionId: FunctionId): string;
export declare function parseFunctionId(functionId: FunctionId): {
    address: AccountAddress;
    module: Identifier;
    functionName: Identifier;
};
export interface BlockHeaderView {
    block_hash: HashValue;
    parent_hash: HashValue;
    timestamp: U64;
    number: BlockNumber;
    author: AccountAddress;
    author_auth_key?: AuthenticationKey;
    txn_accumulator_root: HashValue;
    block_accumulator_root: HashValue;
    state_root: HashValue;
    gas_used: U64;
    difficulty: U256;
    nonce: U64;
    body_hash: HashValue;
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
export declare type WriteOp = 'Deletion' | {
    Value: HexString;
};
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
    block_number?: BlockNumber;
    block_hash?: HashValue;
    confirmations: number;
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
export {};
