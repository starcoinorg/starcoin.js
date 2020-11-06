export declare type Identifier = string;
export declare type AccountAddress = string;
export declare type HashValue = string;
export declare type U8 = number;
export declare type U64 = number;
export declare type U128 = number;
export declare type U256 = number;
export declare type BlockNumber = number;
export declare type AuthenticationKey = string;
export declare type Ed25519PublicKey = string;
export declare type Ed25519Signature = string;
export declare type MultiEd25519PublicKey = string;
export declare type MultiEd25519Signature = string;
export declare type EventKey = string;
export declare type TypeTag = 'Bool' | 'U8' | 'U64' | 'U128' | 'Address' | 'Signer' | {
    Vector: TypeTag;
} | {
    Struct: StructTag;
};
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
    accumulator_root: HashValue;
    parent_block_accumulator_root: HashValue;
    state_root: HashValue;
    gas_used: U64;
    difficulty: U256;
    nonce: U64;
    body_hash: HashValue;
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
export declare type TransactionPayload = {
    Script: Script;
} | {
    Package: Package;
};
export interface RawUserTransaction {
    sender: AccountAddress;
    sequence_number: U64;
    payload: TransactionPayload;
    max_gas_amount: U64;
    gas_unit_price: U64;
    gas_token_code: string;
    expiration_timestamp_secs: U64;
    chain_id: ChainId;
}
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
export interface SignedUserTransaction {
    raw_txn: RawUserTransaction;
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
export declare type Transaction = {
    UserTransaction: SignedUserTransaction;
} | {
    BlockMetadata: BlockMetadata;
};
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
export declare type TransactionArgument = {
    U8: number;
} | {
    U64: number;
} | {
    U128: number;
} | {
    Address: AccountAddress;
} | {
    U8Vector: Uint8Array;
} | {
    Bool: boolean;
};
export interface AnnotatedMoveStruct {
    is_resource: boolean;
    type_: StructTag;
    value: [Identifier, AnnotatedMoveValue][];
}
export declare type AnnotatedMoveValue = {
    U8: number;
} | {
    U64: number;
} | {
    U128: number;
} | {
    Bool: boolean;
} | {
    Address: AccountAddress;
} | {
    Bytes: Uint8Array;
} | {
    Vector: AnnotatedMoveValue[];
} | {
    Struct: AnnotatedMoveStruct;
};
export declare type MoveValue = number | boolean | AccountAddress | Uint8Array | MoveValue[] | MoveStruct;
export declare type MoveStruct = {
    [key in Identifier]: MoveValue;
};
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
export interface EventFilter {
    from_block?: U64;
    to_block?: U64;
    event_keys: EventKey[];
    limit?: U64;
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
export {};
