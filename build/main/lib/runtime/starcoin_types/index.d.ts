import { Serializer } from '../serde/serializer';
import { Deserializer } from '../serde/deserializer';
import { Optional, Seq, Tuple, ListTuple, bool, uint8, uint64, uint128, str, bytes } from '../serde/types';
export declare class AccessPath {
    address: AccountAddress;
    path: bytes;
    constructor(address: AccountAddress, path: bytes);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): AccessPath;
}
export declare class AccountAddress {
    value: ListTuple<[uint8]>;
    constructor(value: ListTuple<[uint8]>);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): AccountAddress;
}
export declare class AccountResource {
    authentication_key: Seq<uint8>;
    withdrawal_capability: Optional<WithdrawCapabilityResource>;
    key_rotation_capability: Optional<KeyRotationCapabilityResource>;
    withdraw_events: EventHandle;
    deposit_events: EventHandle;
    accept_token_events: EventHandle;
    sequence_number: uint64;
    constructor(authentication_key: Seq<uint8>, withdrawal_capability: Optional<WithdrawCapabilityResource>, key_rotation_capability: Optional<KeyRotationCapabilityResource>, withdraw_events: EventHandle, deposit_events: EventHandle, accept_token_events: EventHandle, sequence_number: uint64);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): AccountResource;
}
export declare class ArgumentABI {
    name: str;
    type_tag: TypeTag;
    constructor(name: str, type_tag: TypeTag);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): ArgumentABI;
}
export declare class AuthenticationKey {
    value: bytes;
    constructor(value: bytes);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): AuthenticationKey;
}
export declare class BlockMetadata {
    parent_hash: HashValue;
    timestamp: uint64;
    author: AccountAddress;
    author_auth_key: Optional<AuthenticationKey>;
    uncles: uint64;
    number: uint64;
    chain_id: ChainId;
    parent_gas_used: uint64;
    constructor(parent_hash: HashValue, timestamp: uint64, author: AccountAddress, author_auth_key: Optional<AuthenticationKey>, uncles: uint64, number: uint64, chain_id: ChainId, parent_gas_used: uint64);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): BlockMetadata;
}
export declare class ChainId {
    id: uint8;
    constructor(id: uint8);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): ChainId;
}
export declare abstract class ContractEvent {
    abstract serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): ContractEvent;
}
export declare class ContractEventVariantV0 extends ContractEvent {
    value: ContractEventV0;
    constructor(value: ContractEventV0);
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): ContractEventVariantV0;
}
export declare class ContractEventV0 {
    key: EventKey;
    sequence_number: uint64;
    type_tag: TypeTag;
    event_data: bytes;
    constructor(key: EventKey, sequence_number: uint64, type_tag: TypeTag, event_data: bytes);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): ContractEventV0;
}
export declare abstract class DataType {
    abstract serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): DataType;
}
export declare class DataTypeVariantCODE extends DataType {
    constructor();
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): DataTypeVariantCODE;
}
export declare class DataTypeVariantRESOURCE extends DataType {
    constructor();
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): DataTypeVariantRESOURCE;
}
export declare class Ed25519PrivateKey {
    value: bytes;
    constructor(value: bytes);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): Ed25519PrivateKey;
}
export declare class Ed25519PublicKey {
    value: bytes;
    constructor(value: bytes);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): Ed25519PublicKey;
}
export declare class Ed25519Signature {
    value: bytes;
    constructor(value: bytes);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): Ed25519Signature;
}
export declare class EventHandle {
    count: uint64;
    key: EventKey;
    constructor(count: uint64, key: EventKey);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): EventHandle;
}
export declare class EventKey {
    value: bytes;
    constructor(value: bytes);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): EventKey;
}
export declare class HashValue {
    value: bytes;
    constructor(value: bytes);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): HashValue;
}
export declare class Identifier {
    value: str;
    constructor(value: str);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): Identifier;
}
export declare class KeyRotationCapabilityResource {
    account_address: AccountAddress;
    constructor(account_address: AccountAddress);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): KeyRotationCapabilityResource;
}
export declare class Module {
    code: bytes;
    constructor(code: bytes);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): Module;
}
export declare class MultiEd25519PrivateKey {
    value: bytes;
    constructor(value: bytes);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): MultiEd25519PrivateKey;
}
export declare class MultiEd25519PublicKey {
    value: bytes;
    constructor(value: bytes);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): MultiEd25519PublicKey;
}
export declare class MultiEd25519Signature {
    value: bytes;
    constructor(value: bytes);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): MultiEd25519Signature;
}
export declare class Package {
    package_address: AccountAddress;
    modules: Seq<Module>;
    init_script: Optional<Script>;
    constructor(package_address: AccountAddress, modules: Seq<Module>, init_script: Optional<Script>);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): Package;
}
export declare class RawUserTransaction {
    sender: AccountAddress;
    sequence_number: uint64;
    payload: TransactionPayload;
    max_gas_amount: uint64;
    gas_unit_price: uint64;
    gas_token_code: str;
    expiration_timestamp_secs: uint64;
    chain_id: ChainId;
    constructor(sender: AccountAddress, sequence_number: uint64, payload: TransactionPayload, max_gas_amount: uint64, gas_unit_price: uint64, gas_token_code: str, expiration_timestamp_secs: uint64, chain_id: ChainId);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): RawUserTransaction;
}
export declare class Script {
    code: bytes;
    ty_args: Seq<TypeTag>;
    args: Seq<TransactionArgument>;
    constructor(code: bytes, ty_args: Seq<TypeTag>, args: Seq<TransactionArgument>);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): Script;
}
export declare class ScriptABI {
    name: str;
    doc: str;
    code: bytes;
    ty_args: Seq<TypeArgumentABI>;
    args: Seq<ArgumentABI>;
    constructor(name: str, doc: str, code: bytes, ty_args: Seq<TypeArgumentABI>, args: Seq<ArgumentABI>);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): ScriptABI;
}
export declare class SignedUserTransaction {
    raw_txn: RawUserTransaction;
    authenticator: TransactionAuthenticator;
    constructor(raw_txn: RawUserTransaction, authenticator: TransactionAuthenticator);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): SignedUserTransaction;
}
export declare class StructTag {
    address: AccountAddress;
    module: Identifier;
    name: Identifier;
    type_params: Seq<TypeTag>;
    constructor(address: AccountAddress, module: Identifier, name: Identifier, type_params: Seq<TypeTag>);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): StructTag;
}
export declare abstract class Transaction {
    abstract serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): Transaction;
}
export declare class TransactionVariantUserTransaction extends Transaction {
    value: SignedUserTransaction;
    constructor(value: SignedUserTransaction);
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TransactionVariantUserTransaction;
}
export declare class TransactionVariantBlockMetadata extends Transaction {
    value: BlockMetadata;
    constructor(value: BlockMetadata);
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TransactionVariantBlockMetadata;
}
export declare abstract class TransactionArgument {
    abstract serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): TransactionArgument;
}
export declare class TransactionArgumentVariantU8 extends TransactionArgument {
    value: uint8;
    constructor(value: uint8);
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TransactionArgumentVariantU8;
}
export declare class TransactionArgumentVariantU64 extends TransactionArgument {
    value: uint64;
    constructor(value: uint64);
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TransactionArgumentVariantU64;
}
export declare class TransactionArgumentVariantU128 extends TransactionArgument {
    value: uint128;
    constructor(value: uint128);
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TransactionArgumentVariantU128;
}
export declare class TransactionArgumentVariantAddress extends TransactionArgument {
    value: AccountAddress;
    constructor(value: AccountAddress);
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TransactionArgumentVariantAddress;
}
export declare class TransactionArgumentVariantU8Vector extends TransactionArgument {
    value: bytes;
    constructor(value: bytes);
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TransactionArgumentVariantU8Vector;
}
export declare class TransactionArgumentVariantBool extends TransactionArgument {
    value: bool;
    constructor(value: bool);
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TransactionArgumentVariantBool;
}
export declare abstract class TransactionAuthenticator {
    abstract serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): TransactionAuthenticator;
}
export declare class TransactionAuthenticatorVariantEd25519 extends TransactionAuthenticator {
    public_key: Ed25519PublicKey;
    signature: Ed25519Signature;
    constructor(public_key: Ed25519PublicKey, signature: Ed25519Signature);
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TransactionAuthenticatorVariantEd25519;
}
export declare class TransactionAuthenticatorVariantMultiEd25519 extends TransactionAuthenticator {
    public_key: MultiEd25519PublicKey;
    signature: MultiEd25519Signature;
    constructor(public_key: MultiEd25519PublicKey, signature: MultiEd25519Signature);
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TransactionAuthenticatorVariantMultiEd25519;
}
export declare abstract class TransactionPayload {
    abstract serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): TransactionPayload;
}
export declare class TransactionPayloadVariantScript extends TransactionPayload {
    value: Script;
    constructor(value: Script);
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TransactionPayloadVariantScript;
}
export declare class TransactionPayloadVariantPackage extends TransactionPayload {
    value: Package;
    constructor(value: Package);
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TransactionPayloadVariantPackage;
}
export declare class TypeArgumentABI {
    name: str;
    constructor(name: str);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): TypeArgumentABI;
}
export declare abstract class TypeTag {
    abstract serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): TypeTag;
}
export declare class TypeTagVariantBool extends TypeTag {
    constructor();
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TypeTagVariantBool;
}
export declare class TypeTagVariantU8 extends TypeTag {
    constructor();
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TypeTagVariantU8;
}
export declare class TypeTagVariantU64 extends TypeTag {
    constructor();
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TypeTagVariantU64;
}
export declare class TypeTagVariantU128 extends TypeTag {
    constructor();
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TypeTagVariantU128;
}
export declare class TypeTagVariantAddress extends TypeTag {
    constructor();
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TypeTagVariantAddress;
}
export declare class TypeTagVariantSigner extends TypeTag {
    constructor();
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TypeTagVariantSigner;
}
export declare class TypeTagVariantVector extends TypeTag {
    value: TypeTag;
    constructor(value: TypeTag);
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TypeTagVariantVector;
}
export declare class TypeTagVariantStruct extends TypeTag {
    value: StructTag;
    constructor(value: StructTag);
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): TypeTagVariantStruct;
}
export declare class WithdrawCapabilityResource {
    account_address: AccountAddress;
    constructor(account_address: AccountAddress);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): WithdrawCapabilityResource;
}
export declare abstract class WriteOp {
    abstract serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): WriteOp;
}
export declare class WriteOpVariantDeletion extends WriteOp {
    constructor();
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): WriteOpVariantDeletion;
}
export declare class WriteOpVariantValue extends WriteOp {
    value: bytes;
    constructor(value: bytes);
    serialize(serializer: Serializer): void;
    static load(deserializer: Deserializer): WriteOpVariantValue;
}
export declare class WriteSet {
    value: WriteSetMut;
    constructor(value: WriteSetMut);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): WriteSet;
}
export declare class WriteSetMut {
    write_set: Seq<Tuple<[AccessPath, WriteOp]>>;
    constructor(write_set: Seq<Tuple<[AccessPath, WriteOp]>>);
    serialize(serializer: Serializer): void;
    static deserialize(deserializer: Deserializer): WriteSetMut;
}
export declare class Helpers {
    static serializeArray16U8Array(value: ListTuple<[uint8]>, serializer: Serializer): void;
    static deserializeArray16U8Array(deserializer: Deserializer): ListTuple<[uint8]>;
    static serializeOptionAuthenticationKey(value: Optional<AuthenticationKey>, serializer: Serializer): void;
    static deserializeOptionAuthenticationKey(deserializer: Deserializer): Optional<AuthenticationKey>;
    static serializeOptionKeyRotationCapabilityResource(value: Optional<KeyRotationCapabilityResource>, serializer: Serializer): void;
    static deserializeOptionKeyRotationCapabilityResource(deserializer: Deserializer): Optional<KeyRotationCapabilityResource>;
    static serializeOptionScript(value: Optional<Script>, serializer: Serializer): void;
    static deserializeOptionScript(deserializer: Deserializer): Optional<Script>;
    static serializeOptionWithdrawCapabilityResource(value: Optional<WithdrawCapabilityResource>, serializer: Serializer): void;
    static deserializeOptionWithdrawCapabilityResource(deserializer: Deserializer): Optional<WithdrawCapabilityResource>;
    static serializeTuple2AccessPathWriteOp(value: Tuple<[AccessPath, WriteOp]>, serializer: Serializer): void;
    static deserializeTuple2AccessPathWriteOp(deserializer: Deserializer): Tuple<[AccessPath, WriteOp]>;
    static serializeVectorArgumentAbi(value: Seq<ArgumentABI>, serializer: Serializer): void;
    static deserializeVectorArgumentAbi(deserializer: Deserializer): Seq<ArgumentABI>;
    static serializeVectorModule(value: Seq<Module>, serializer: Serializer): void;
    static deserializeVectorModule(deserializer: Deserializer): Seq<Module>;
    static serializeVectorTransactionArgument(value: Seq<TransactionArgument>, serializer: Serializer): void;
    static deserializeVectorTransactionArgument(deserializer: Deserializer): Seq<TransactionArgument>;
    static serializeVectorTypeArgumentAbi(value: Seq<TypeArgumentABI>, serializer: Serializer): void;
    static deserializeVectorTypeArgumentAbi(deserializer: Deserializer): Seq<TypeArgumentABI>;
    static serializeVectorTypeTag(value: Seq<TypeTag>, serializer: Serializer): void;
    static deserializeVectorTypeTag(deserializer: Deserializer): Seq<TypeTag>;
    static serializeVectorTuple2AccessPathWriteOp(value: Seq<Tuple<[AccessPath, WriteOp]>>, serializer: Serializer): void;
    static deserializeVectorTuple2AccessPathWriteOp(deserializer: Deserializer): Seq<Tuple<[AccessPath, WriteOp]>>;
    static serializeVectorU8(value: Seq<uint8>, serializer: Serializer): void;
    static deserializeVectorU8(deserializer: Deserializer): Seq<uint8>;
}
