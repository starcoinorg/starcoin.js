import { Serializer } from '../serde/serializer';
import { Deserializer } from '../serde/deserializer';
import { Seq, ListTuple, bool, uint8, uint64, uint128, str } from '../serde/types';
export declare class AcceptTokenEvent {
    token_code: TokenCode;
    constructor(token_code: TokenCode);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): AcceptTokenEvent;
}
export declare class AccountAddress {
    value: ListTuple<[uint8]>;
    constructor(value: ListTuple<[uint8]>);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): AccountAddress;
}
export declare class BlockRewardEvent {
    block_number: uint64;
    block_reward: uint128;
    gas_fees: uint128;
    miner: AccountAddress;
    constructor(block_number: uint64, block_reward: uint128, gas_fees: uint128, miner: AccountAddress);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): BlockRewardEvent;
}
export declare class BurnEvent {
    amount: uint128;
    token_code: TokenCode;
    constructor(amount: uint128, token_code: TokenCode);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): BurnEvent;
}
export declare class DepositEvent {
    amount: uint128;
    token_code: TokenCode;
    metadata: Seq<uint8>;
    constructor(amount: uint128, token_code: TokenCode, metadata: Seq<uint8>);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): DepositEvent;
}
export declare class MintEvent {
    amount: uint128;
    token_code: TokenCode;
    constructor(amount: uint128, token_code: TokenCode);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): MintEvent;
}
export declare class NewBlockEvent {
    number: uint64;
    author: AccountAddress;
    timestamp: uint64;
    uncles: uint64;
    constructor(number: uint64, author: AccountAddress, timestamp: uint64, uncles: uint64);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): NewBlockEvent;
}
export declare class ProposalCreatedEvent {
    proposal_id: uint64;
    proposer: AccountAddress;
    constructor(proposal_id: uint64, proposer: AccountAddress);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): ProposalCreatedEvent;
}
export declare class TokenCode {
    address: AccountAddress;
    module: str;
    name: str;
    constructor(address: AccountAddress, module: str, name: str);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): TokenCode;
}
export declare class VoteChangedEvent {
    proposal_id: uint64;
    proposer: AccountAddress;
    voter: AccountAddress;
    agree: bool;
    vote: uint128;
    constructor(proposal_id: uint64, proposer: AccountAddress, voter: AccountAddress, agree: bool, vote: uint128);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): VoteChangedEvent;
}
export declare class WithdrawEvent {
    amount: uint128;
    token_code: TokenCode;
    metadata: Seq<uint8>;
    constructor(amount: uint128, token_code: TokenCode, metadata: Seq<uint8>);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): WithdrawEvent;
}
export declare class Helpers {
    static serializeArray16U8Array(value: ListTuple<[uint8]>, serializer: Serializer): void;
    static deserializeArray16U8Array(deserializer: Deserializer): ListTuple<[uint8]>;
    static serializeVectorU8(value: Seq<uint8>, serializer: Serializer): void;
    static deserializeVectorU8(deserializer: Deserializer): Seq<uint8>;
}
