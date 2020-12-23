import { Serializer } from '../serde/serializer';
import { Deserializer } from '../serde/deserializer';
import {
  Optional,
  Seq,
  Tuple,
  ListTuple,
  unit,
  bool,
  int8,
  int16,
  int32,
  int64,
  int128,
  uint8,
  uint16,
  uint32,
  uint64,
  uint128,
  float32,
  float64,
  char,
  str,
  bytes,
} from '../serde/types';

export class AccessPath {
  constructor(public address: AccountAddress, public path: bytes) {}

  public serialize(serializer: Serializer): void {
    this.address.serialize(serializer);
    serializer.serializeBytes(this.path);
  }

  static deserialize(deserializer: Deserializer): AccessPath {
    const address = AccountAddress.deserialize(deserializer);
    const path = deserializer.deserializeBytes();
    return new AccessPath(address, path);
  }
}
export class AccountAddress {
  constructor(public value: ListTuple<[uint8]>) {}

  public serialize(serializer: Serializer): void {
    Helpers.serializeArray16U8Array(this.value, serializer);
  }

  static deserialize(deserializer: Deserializer): AccountAddress {
    const value = Helpers.deserializeArray16U8Array(deserializer);
    return new AccountAddress(value);
  }
}
export class AccountResource {
  constructor(
    public authentication_key: Seq<uint8>,
    public withdrawal_capability: Optional<WithdrawCapabilityResource>,
    public key_rotation_capability: Optional<KeyRotationCapabilityResource>,
    public withdraw_events: EventHandle,
    public deposit_events: EventHandle,
    public accept_token_events: EventHandle,
    public sequence_number: uint64
  ) {}

  public serialize(serializer: Serializer): void {
    Helpers.serializeVectorU8(this.authentication_key, serializer);
    Helpers.serializeOptionWithdrawCapabilityResource(
      this.withdrawal_capability,
      serializer
    );
    Helpers.serializeOptionKeyRotationCapabilityResource(
      this.key_rotation_capability,
      serializer
    );
    this.withdraw_events.serialize(serializer);
    this.deposit_events.serialize(serializer);
    this.accept_token_events.serialize(serializer);
    serializer.serializeU64(this.sequence_number);
  }

  static deserialize(deserializer: Deserializer): AccountResource {
    const authentication_key = Helpers.deserializeVectorU8(deserializer);
    const withdrawal_capability = Helpers.deserializeOptionWithdrawCapabilityResource(
      deserializer
    );
    const key_rotation_capability = Helpers.deserializeOptionKeyRotationCapabilityResource(
      deserializer
    );
    const withdraw_events = EventHandle.deserialize(deserializer);
    const deposit_events = EventHandle.deserialize(deserializer);
    const accept_token_events = EventHandle.deserialize(deserializer);
    const sequence_number = deserializer.deserializeU64();
    return new AccountResource(
      authentication_key,
      withdrawal_capability,
      key_rotation_capability,
      withdraw_events,
      deposit_events,
      accept_token_events,
      sequence_number
    );
  }
}
export class ArgumentABI {
  constructor(public name: str, public type_tag: TypeTag) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeStr(this.name);
    this.type_tag.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): ArgumentABI {
    const name = deserializer.deserializeStr();
    const type_tag = TypeTag.deserialize(deserializer);
    return new ArgumentABI(name, type_tag);
  }
}
export class AuthenticationKey {
  constructor(public value: bytes) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): AuthenticationKey {
    const value = deserializer.deserializeBytes();
    return new AuthenticationKey(value);
  }
}
export class BlockMetadata {
  constructor(
    public parent_hash: HashValue,
    public timestamp: uint64,
    public author: AccountAddress,
    public author_auth_key: Optional<AuthenticationKey>,
    public uncles: uint64,
    public number: uint64,
    public chain_id: ChainId,
    public parent_gas_used: uint64
  ) {}

  public serialize(serializer: Serializer): void {
    this.parent_hash.serialize(serializer);
    serializer.serializeU64(this.timestamp);
    this.author.serialize(serializer);
    Helpers.serializeOptionAuthenticationKey(this.author_auth_key, serializer);
    serializer.serializeU64(this.uncles);
    serializer.serializeU64(this.number);
    this.chain_id.serialize(serializer);
    serializer.serializeU64(this.parent_gas_used);
  }

  static deserialize(deserializer: Deserializer): BlockMetadata {
    const parent_hash = HashValue.deserialize(deserializer);
    const timestamp = deserializer.deserializeU64();
    const author = AccountAddress.deserialize(deserializer);
    const author_auth_key = Helpers.deserializeOptionAuthenticationKey(
      deserializer
    );
    const uncles = deserializer.deserializeU64();
    const number = deserializer.deserializeU64();
    const chain_id = ChainId.deserialize(deserializer);
    const parent_gas_used = deserializer.deserializeU64();
    return new BlockMetadata(
      parent_hash,
      timestamp,
      author,
      author_auth_key,
      uncles,
      number,
      chain_id,
      parent_gas_used
    );
  }
}
export class ChainId {
  constructor(public id: uint8) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeU8(this.id);
  }

  static deserialize(deserializer: Deserializer): ChainId {
    const id = deserializer.deserializeU8();
    return new ChainId(id);
  }
}
export abstract class ContractEvent {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): ContractEvent {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return ContractEventVariantV0.load(deserializer);
      default:
        throw new Error('Unknown variant index for ContractEvent: ' + index);
    }
  }
}

export class ContractEventVariantV0 extends ContractEvent {
  constructor(public value: ContractEventV0) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): ContractEventVariantV0 {
    const value = ContractEventV0.deserialize(deserializer);
    return new ContractEventVariantV0(value);
  }
}
export class ContractEventV0 {
  constructor(
    public key: EventKey,
    public sequence_number: uint64,
    public type_tag: TypeTag,
    public event_data: bytes
  ) {}

  public serialize(serializer: Serializer): void {
    this.key.serialize(serializer);
    serializer.serializeU64(this.sequence_number);
    this.type_tag.serialize(serializer);
    serializer.serializeBytes(this.event_data);
  }

  static deserialize(deserializer: Deserializer): ContractEventV0 {
    const key = EventKey.deserialize(deserializer);
    const sequence_number = deserializer.deserializeU64();
    const type_tag = TypeTag.deserialize(deserializer);
    const event_data = deserializer.deserializeBytes();
    return new ContractEventV0(key, sequence_number, type_tag, event_data);
  }
}
export abstract class DataType {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): DataType {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return DataTypeVariantCODE.load(deserializer);
      case 1:
        return DataTypeVariantRESOURCE.load(deserializer);
      default:
        throw new Error('Unknown variant index for DataType: ' + index);
    }
  }
}

export class DataTypeVariantCODE extends DataType {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
  }

  static load(deserializer: Deserializer): DataTypeVariantCODE {
    return new DataTypeVariantCODE();
  }
}

export class DataTypeVariantRESOURCE extends DataType {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
  }

  static load(deserializer: Deserializer): DataTypeVariantRESOURCE {
    return new DataTypeVariantRESOURCE();
  }
}
export class Ed25519PrivateKey {
  constructor(public value: bytes) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): Ed25519PrivateKey {
    const value = deserializer.deserializeBytes();
    return new Ed25519PrivateKey(value);
  }
}
export class Ed25519PublicKey {
  constructor(public value: bytes) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): Ed25519PublicKey {
    const value = deserializer.deserializeBytes();
    return new Ed25519PublicKey(value);
  }
}
export class Ed25519Signature {
  constructor(public value: bytes) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): Ed25519Signature {
    const value = deserializer.deserializeBytes();
    return new Ed25519Signature(value);
  }
}
export class EventHandle {
  constructor(public count: uint64, public key: EventKey) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeU64(this.count);
    this.key.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): EventHandle {
    const count = deserializer.deserializeU64();
    const key = EventKey.deserialize(deserializer);
    return new EventHandle(count, key);
  }
}
export class EventKey {
  constructor(public value: bytes) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): EventKey {
    const value = deserializer.deserializeBytes();
    return new EventKey(value);
  }
}
export class HashValue {
  constructor(public value: bytes) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): HashValue {
    const value = deserializer.deserializeBytes();
    return new HashValue(value);
  }
}
export class Identifier {
  constructor(public value: str) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeStr(this.value);
  }

  static deserialize(deserializer: Deserializer): Identifier {
    const value = deserializer.deserializeStr();
    return new Identifier(value);
  }
}
export class KeyRotationCapabilityResource {
  constructor(public account_address: AccountAddress) {}

  public serialize(serializer: Serializer): void {
    this.account_address.serialize(serializer);
  }

  static deserialize(
    deserializer: Deserializer
  ): KeyRotationCapabilityResource {
    const account_address = AccountAddress.deserialize(deserializer);
    return new KeyRotationCapabilityResource(account_address);
  }
}
export class Module {
  constructor(public code: bytes) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.code);
  }

  static deserialize(deserializer: Deserializer): Module {
    const code = deserializer.deserializeBytes();
    return new Module(code);
  }
}
export class MultiEd25519PrivateKey {
  constructor(public value: bytes) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): MultiEd25519PrivateKey {
    const value = deserializer.deserializeBytes();
    return new MultiEd25519PrivateKey(value);
  }
}
export class MultiEd25519PublicKey {
  constructor(public value: bytes) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): MultiEd25519PublicKey {
    const value = deserializer.deserializeBytes();
    return new MultiEd25519PublicKey(value);
  }
}
export class MultiEd25519Signature {
  constructor(public value: bytes) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): MultiEd25519Signature {
    const value = deserializer.deserializeBytes();
    return new MultiEd25519Signature(value);
  }
}
export class Package {
  constructor(
    public package_address: AccountAddress,
    public modules: Seq<Module>,
    public init_script: Optional<Script>
  ) {}

  public serialize(serializer: Serializer): void {
    this.package_address.serialize(serializer);
    Helpers.serializeVectorModule(this.modules, serializer);
    Helpers.serializeOptionScript(this.init_script, serializer);
  }

  static deserialize(deserializer: Deserializer): Package {
    const package_address = AccountAddress.deserialize(deserializer);
    const modules = Helpers.deserializeVectorModule(deserializer);
    const init_script = Helpers.deserializeOptionScript(deserializer);
    return new Package(package_address, modules, init_script);
  }
}
export class RawUserTransaction {
  constructor(
    public sender: AccountAddress,
    public sequence_number: uint64,
    public payload: TransactionPayload,
    public max_gas_amount: uint64,
    public gas_unit_price: uint64,
    public gas_token_code: str,
    public expiration_timestamp_secs: uint64,
    public chain_id: ChainId
  ) {}

  public serialize(serializer: Serializer): void {
    this.sender.serialize(serializer);
    serializer.serializeU64(this.sequence_number);
    this.payload.serialize(serializer);
    serializer.serializeU64(this.max_gas_amount);
    serializer.serializeU64(this.gas_unit_price);
    serializer.serializeStr(this.gas_token_code);
    serializer.serializeU64(this.expiration_timestamp_secs);
    this.chain_id.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): RawUserTransaction {
    const sender = AccountAddress.deserialize(deserializer);
    const sequence_number = deserializer.deserializeU64();
    const payload = TransactionPayload.deserialize(deserializer);
    const max_gas_amount = deserializer.deserializeU64();
    const gas_unit_price = deserializer.deserializeU64();
    const gas_token_code = deserializer.deserializeStr();
    const expiration_timestamp_secs = deserializer.deserializeU64();
    const chain_id = ChainId.deserialize(deserializer);
    return new RawUserTransaction(
      sender,
      sequence_number,
      payload,
      max_gas_amount,
      gas_unit_price,
      gas_token_code,
      expiration_timestamp_secs,
      chain_id
    );
  }
}
export class Script {
  constructor(
    public code: bytes,
    public ty_args: Seq<TypeTag>,
    public args: Seq<TransactionArgument>
  ) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.code);
    Helpers.serializeVectorTypeTag(this.ty_args, serializer);
    Helpers.serializeVectorTransactionArgument(this.args, serializer);
  }

  static deserialize(deserializer: Deserializer): Script {
    const code = deserializer.deserializeBytes();
    const ty_args = Helpers.deserializeVectorTypeTag(deserializer);
    const args = Helpers.deserializeVectorTransactionArgument(deserializer);
    return new Script(code, ty_args, args);
  }
}
export class ScriptABI {
  constructor(
    public name: str,
    public doc: str,
    public code: bytes,
    public ty_args: Seq<TypeArgumentABI>,
    public args: Seq<ArgumentABI>
  ) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeStr(this.name);
    serializer.serializeStr(this.doc);
    serializer.serializeBytes(this.code);
    Helpers.serializeVectorTypeArgumentAbi(this.ty_args, serializer);
    Helpers.serializeVectorArgumentAbi(this.args, serializer);
  }

  static deserialize(deserializer: Deserializer): ScriptABI {
    const name = deserializer.deserializeStr();
    const doc = deserializer.deserializeStr();
    const code = deserializer.deserializeBytes();
    const ty_args = Helpers.deserializeVectorTypeArgumentAbi(deserializer);
    const args = Helpers.deserializeVectorArgumentAbi(deserializer);
    return new ScriptABI(name, doc, code, ty_args, args);
  }
}
export class SignedUserTransaction {
  constructor(
    public raw_txn: RawUserTransaction,
    public authenticator: TransactionAuthenticator
  ) {}

  public serialize(serializer: Serializer): void {
    this.raw_txn.serialize(serializer);
    this.authenticator.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): SignedUserTransaction {
    const raw_txn = RawUserTransaction.deserialize(deserializer);
    const authenticator = TransactionAuthenticator.deserialize(deserializer);
    return new SignedUserTransaction(raw_txn, authenticator);
  }
}
export class StructTag {
  constructor(
    public address: AccountAddress,
    public module: Identifier,
    public name: Identifier,
    public type_params: Seq<TypeTag>
  ) {}

  public serialize(serializer: Serializer): void {
    this.address.serialize(serializer);
    this.module.serialize(serializer);
    this.name.serialize(serializer);
    Helpers.serializeVectorTypeTag(this.type_params, serializer);
  }

  static deserialize(deserializer: Deserializer): StructTag {
    const address = AccountAddress.deserialize(deserializer);
    const module = Identifier.deserialize(deserializer);
    const name = Identifier.deserialize(deserializer);
    const type_params = Helpers.deserializeVectorTypeTag(deserializer);
    return new StructTag(address, module, name, type_params);
  }
}
export abstract class Transaction {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): Transaction {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return TransactionVariantUserTransaction.load(deserializer);
      case 1:
        return TransactionVariantBlockMetadata.load(deserializer);
      default:
        throw new Error('Unknown variant index for Transaction: ' + index);
    }
  }
}

export class TransactionVariantUserTransaction extends Transaction {
  constructor(public value: SignedUserTransaction) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): TransactionVariantUserTransaction {
    const value = SignedUserTransaction.deserialize(deserializer);
    return new TransactionVariantUserTransaction(value);
  }
}

export class TransactionVariantBlockMetadata extends Transaction {
  constructor(public value: BlockMetadata) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): TransactionVariantBlockMetadata {
    const value = BlockMetadata.deserialize(deserializer);
    return new TransactionVariantBlockMetadata(value);
  }
}
export abstract class TransactionArgument {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): TransactionArgument {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return TransactionArgumentVariantU8.load(deserializer);
      case 1:
        return TransactionArgumentVariantU64.load(deserializer);
      case 2:
        return TransactionArgumentVariantU128.load(deserializer);
      case 3:
        return TransactionArgumentVariantAddress.load(deserializer);
      case 4:
        return TransactionArgumentVariantU8Vector.load(deserializer);
      case 5:
        return TransactionArgumentVariantBool.load(deserializer);
      default:
        throw new Error(
          'Unknown variant index for TransactionArgument: ' + index
        );
    }
  }
}

export class TransactionArgumentVariantU8 extends TransactionArgument {
  constructor(public value: uint8) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
    serializer.serializeU8(this.value);
  }

  static load(deserializer: Deserializer): TransactionArgumentVariantU8 {
    const value = deserializer.deserializeU8();
    return new TransactionArgumentVariantU8(value);
  }
}

export class TransactionArgumentVariantU64 extends TransactionArgument {
  constructor(public value: uint64) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
    serializer.serializeU64(this.value);
  }

  static load(deserializer: Deserializer): TransactionArgumentVariantU64 {
    const value = deserializer.deserializeU64();
    return new TransactionArgumentVariantU64(value);
  }
}

export class TransactionArgumentVariantU128 extends TransactionArgument {
  constructor(public value: uint128) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(2);
    serializer.serializeU128(this.value);
  }

  static load(deserializer: Deserializer): TransactionArgumentVariantU128 {
    const value = deserializer.deserializeU128();
    return new TransactionArgumentVariantU128(value);
  }
}

export class TransactionArgumentVariantAddress extends TransactionArgument {
  constructor(public value: AccountAddress) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(3);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): TransactionArgumentVariantAddress {
    const value = AccountAddress.deserialize(deserializer);
    return new TransactionArgumentVariantAddress(value);
  }
}

export class TransactionArgumentVariantU8Vector extends TransactionArgument {
  constructor(public value: bytes) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(4);
    serializer.serializeBytes(this.value);
  }

  static load(deserializer: Deserializer): TransactionArgumentVariantU8Vector {
    const value = deserializer.deserializeBytes();
    return new TransactionArgumentVariantU8Vector(value);
  }
}

export class TransactionArgumentVariantBool extends TransactionArgument {
  constructor(public value: bool) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(5);
    serializer.serializeBool(this.value);
  }

  static load(deserializer: Deserializer): TransactionArgumentVariantBool {
    const value = deserializer.deserializeBool();
    return new TransactionArgumentVariantBool(value);
  }
}
export abstract class TransactionAuthenticator {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): TransactionAuthenticator {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return TransactionAuthenticatorVariantEd25519.load(deserializer);
      case 1:
        return TransactionAuthenticatorVariantMultiEd25519.load(deserializer);
      default:
        throw new Error(
          'Unknown variant index for TransactionAuthenticator: ' + index
        );
    }
  }
}

export class TransactionAuthenticatorVariantEd25519 extends TransactionAuthenticator {
  constructor(
    public public_key: Ed25519PublicKey,
    public signature: Ed25519Signature
  ) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
    this.public_key.serialize(serializer);
    this.signature.serialize(serializer);
  }

  static load(
    deserializer: Deserializer
  ): TransactionAuthenticatorVariantEd25519 {
    const public_key = Ed25519PublicKey.deserialize(deserializer);
    const signature = Ed25519Signature.deserialize(deserializer);
    return new TransactionAuthenticatorVariantEd25519(public_key, signature);
  }
}

export class TransactionAuthenticatorVariantMultiEd25519 extends TransactionAuthenticator {
  constructor(
    public public_key: MultiEd25519PublicKey,
    public signature: MultiEd25519Signature
  ) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
    this.public_key.serialize(serializer);
    this.signature.serialize(serializer);
  }

  static load(
    deserializer: Deserializer
  ): TransactionAuthenticatorVariantMultiEd25519 {
    const public_key = MultiEd25519PublicKey.deserialize(deserializer);
    const signature = MultiEd25519Signature.deserialize(deserializer);
    return new TransactionAuthenticatorVariantMultiEd25519(
      public_key,
      signature
    );
  }
}
export abstract class TransactionPayload {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): TransactionPayload {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return TransactionPayloadVariantScript.load(deserializer);
      case 1:
        return TransactionPayloadVariantPackage.load(deserializer);
      default:
        throw new Error(
          'Unknown variant index for TransactionPayload: ' + index
        );
    }
  }
}

export class TransactionPayloadVariantScript extends TransactionPayload {
  constructor(public value: Script) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): TransactionPayloadVariantScript {
    const value = Script.deserialize(deserializer);
    return new TransactionPayloadVariantScript(value);
  }
}

export class TransactionPayloadVariantPackage extends TransactionPayload {
  constructor(public value: Package) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): TransactionPayloadVariantPackage {
    const value = Package.deserialize(deserializer);
    return new TransactionPayloadVariantPackage(value);
  }
}
export class TypeArgumentABI {
  constructor(public name: str) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeStr(this.name);
  }

  static deserialize(deserializer: Deserializer): TypeArgumentABI {
    const name = deserializer.deserializeStr();
    return new TypeArgumentABI(name);
  }
}
export abstract class TypeTag {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): TypeTag {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return TypeTagVariantBool.load(deserializer);
      case 1:
        return TypeTagVariantU8.load(deserializer);
      case 2:
        return TypeTagVariantU64.load(deserializer);
      case 3:
        return TypeTagVariantU128.load(deserializer);
      case 4:
        return TypeTagVariantAddress.load(deserializer);
      case 5:
        return TypeTagVariantSigner.load(deserializer);
      case 6:
        return TypeTagVariantVector.load(deserializer);
      case 7:
        return TypeTagVariantStruct.load(deserializer);
      default:
        throw new Error('Unknown variant index for TypeTag: ' + index);
    }
  }
}

export class TypeTagVariantBool extends TypeTag {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
  }

  static load(deserializer: Deserializer): TypeTagVariantBool {
    return new TypeTagVariantBool();
  }
}

export class TypeTagVariantU8 extends TypeTag {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
  }

  static load(deserializer: Deserializer): TypeTagVariantU8 {
    return new TypeTagVariantU8();
  }
}

export class TypeTagVariantU64 extends TypeTag {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(2);
  }

  static load(deserializer: Deserializer): TypeTagVariantU64 {
    return new TypeTagVariantU64();
  }
}

export class TypeTagVariantU128 extends TypeTag {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(3);
  }

  static load(deserializer: Deserializer): TypeTagVariantU128 {
    return new TypeTagVariantU128();
  }
}

export class TypeTagVariantAddress extends TypeTag {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(4);
  }

  static load(deserializer: Deserializer): TypeTagVariantAddress {
    return new TypeTagVariantAddress();
  }
}

export class TypeTagVariantSigner extends TypeTag {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(5);
  }

  static load(deserializer: Deserializer): TypeTagVariantSigner {
    return new TypeTagVariantSigner();
  }
}

export class TypeTagVariantVector extends TypeTag {
  constructor(public value: TypeTag) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(6);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): TypeTagVariantVector {
    const value = TypeTag.deserialize(deserializer);
    return new TypeTagVariantVector(value);
  }
}

export class TypeTagVariantStruct extends TypeTag {
  constructor(public value: StructTag) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(7);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): TypeTagVariantStruct {
    const value = StructTag.deserialize(deserializer);
    return new TypeTagVariantStruct(value);
  }
}
export class WithdrawCapabilityResource {
  constructor(public account_address: AccountAddress) {}

  public serialize(serializer: Serializer): void {
    this.account_address.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): WithdrawCapabilityResource {
    const account_address = AccountAddress.deserialize(deserializer);
    return new WithdrawCapabilityResource(account_address);
  }
}
export abstract class WriteOp {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): WriteOp {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return WriteOpVariantDeletion.load(deserializer);
      case 1:
        return WriteOpVariantValue.load(deserializer);
      default:
        throw new Error('Unknown variant index for WriteOp: ' + index);
    }
  }
}

export class WriteOpVariantDeletion extends WriteOp {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
  }

  static load(deserializer: Deserializer): WriteOpVariantDeletion {
    return new WriteOpVariantDeletion();
  }
}

export class WriteOpVariantValue extends WriteOp {
  constructor(public value: bytes) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
    serializer.serializeBytes(this.value);
  }

  static load(deserializer: Deserializer): WriteOpVariantValue {
    const value = deserializer.deserializeBytes();
    return new WriteOpVariantValue(value);
  }
}
export class WriteSet {
  constructor(public value: WriteSetMut) {}

  public serialize(serializer: Serializer): void {
    this.value.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): WriteSet {
    const value = WriteSetMut.deserialize(deserializer);
    return new WriteSet(value);
  }
}
export class WriteSetMut {
  constructor(public write_set: Seq<Tuple<[AccessPath, WriteOp]>>) {}

  public serialize(serializer: Serializer): void {
    Helpers.serializeVectorTuple2AccessPathWriteOp(this.write_set, serializer);
  }

  static deserialize(deserializer: Deserializer): WriteSetMut {
    const write_set = Helpers.deserializeVectorTuple2AccessPathWriteOp(
      deserializer
    );
    return new WriteSetMut(write_set);
  }
}
export class Helpers {
  static serializeArray16U8Array(
    value: ListTuple<[uint8]>,
    serializer: Serializer
  ): void {
    value.forEach((item) => {
      serializer.serializeU8(item[0]);
    });
  }

  static deserializeArray16U8Array(
    deserializer: Deserializer
  ): ListTuple<[uint8]> {
    const list: ListTuple<[uint8]> = [];
    for (let i = 0; i < 16; i++) {
      list.push([deserializer.deserializeU8()]);
    }
    return list;
  }

  static serializeOptionAuthenticationKey(
    value: Optional<AuthenticationKey>,
    serializer: Serializer
  ): void {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  }

  static deserializeOptionAuthenticationKey(
    deserializer: Deserializer
  ): Optional<AuthenticationKey> {
    const tag = deserializer.deserializeOptionTag();
    if (!tag) {
      return null;
    } else {
      return AuthenticationKey.deserialize(deserializer);
    }
  }

  static serializeOptionKeyRotationCapabilityResource(
    value: Optional<KeyRotationCapabilityResource>,
    serializer: Serializer
  ): void {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  }

  static deserializeOptionKeyRotationCapabilityResource(
    deserializer: Deserializer
  ): Optional<KeyRotationCapabilityResource> {
    const tag = deserializer.deserializeOptionTag();
    if (!tag) {
      return null;
    } else {
      return KeyRotationCapabilityResource.deserialize(deserializer);
    }
  }

  static serializeOptionScript(
    value: Optional<Script>,
    serializer: Serializer
  ): void {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  }

  static deserializeOptionScript(deserializer: Deserializer): Optional<Script> {
    const tag = deserializer.deserializeOptionTag();
    if (!tag) {
      return null;
    } else {
      return Script.deserialize(deserializer);
    }
  }

  static serializeOptionWithdrawCapabilityResource(
    value: Optional<WithdrawCapabilityResource>,
    serializer: Serializer
  ): void {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  }

  static deserializeOptionWithdrawCapabilityResource(
    deserializer: Deserializer
  ): Optional<WithdrawCapabilityResource> {
    const tag = deserializer.deserializeOptionTag();
    if (!tag) {
      return null;
    } else {
      return WithdrawCapabilityResource.deserialize(deserializer);
    }
  }

  static serializeTuple2AccessPathWriteOp(
    value: Tuple<[AccessPath, WriteOp]>,
    serializer: Serializer
  ): void {
    value[0].serialize(serializer);
    value[1].serialize(serializer);
  }

  static deserializeTuple2AccessPathWriteOp(
    deserializer: Deserializer
  ): Tuple<[AccessPath, WriteOp]> {
    return [
      AccessPath.deserialize(deserializer),
      WriteOp.deserialize(deserializer),
    ];
  }

  static serializeVectorArgumentAbi(
    value: Seq<ArgumentABI>,
    serializer: Serializer
  ): void {
    serializer.serializeLen(value.length);
    value.forEach((item: ArgumentABI) => {
      item.serialize(serializer);
    });
  }

  static deserializeVectorArgumentAbi(
    deserializer: Deserializer
  ): Seq<ArgumentABI> {
    const length = deserializer.deserializeLen();
    const list: Seq<ArgumentABI> = [];
    for (let i = 0; i < length; i++) {
      list.push(ArgumentABI.deserialize(deserializer));
    }
    return list;
  }

  static serializeVectorModule(
    value: Seq<Module>,
    serializer: Serializer
  ): void {
    serializer.serializeLen(value.length);
    value.forEach((item: Module) => {
      item.serialize(serializer);
    });
  }

  static deserializeVectorModule(deserializer: Deserializer): Seq<Module> {
    const length = deserializer.deserializeLen();
    const list: Seq<Module> = [];
    for (let i = 0; i < length; i++) {
      list.push(Module.deserialize(deserializer));
    }
    return list;
  }

  static serializeVectorTransactionArgument(
    value: Seq<TransactionArgument>,
    serializer: Serializer
  ): void {
    serializer.serializeLen(value.length);
    value.forEach((item: TransactionArgument) => {
      item.serialize(serializer);
    });
  }

  static deserializeVectorTransactionArgument(
    deserializer: Deserializer
  ): Seq<TransactionArgument> {
    const length = deserializer.deserializeLen();
    const list: Seq<TransactionArgument> = [];
    for (let i = 0; i < length; i++) {
      list.push(TransactionArgument.deserialize(deserializer));
    }
    return list;
  }

  static serializeVectorTypeArgumentAbi(
    value: Seq<TypeArgumentABI>,
    serializer: Serializer
  ): void {
    serializer.serializeLen(value.length);
    value.forEach((item: TypeArgumentABI) => {
      item.serialize(serializer);
    });
  }

  static deserializeVectorTypeArgumentAbi(
    deserializer: Deserializer
  ): Seq<TypeArgumentABI> {
    const length = deserializer.deserializeLen();
    const list: Seq<TypeArgumentABI> = [];
    for (let i = 0; i < length; i++) {
      list.push(TypeArgumentABI.deserialize(deserializer));
    }
    return list;
  }

  static serializeVectorTypeTag(
    value: Seq<TypeTag>,
    serializer: Serializer
  ): void {
    serializer.serializeLen(value.length);
    value.forEach((item: TypeTag) => {
      item.serialize(serializer);
    });
  }

  static deserializeVectorTypeTag(deserializer: Deserializer): Seq<TypeTag> {
    const length = deserializer.deserializeLen();
    const list: Seq<TypeTag> = [];
    for (let i = 0; i < length; i++) {
      list.push(TypeTag.deserialize(deserializer));
    }
    return list;
  }

  static serializeVectorTuple2AccessPathWriteOp(
    value: Seq<Tuple<[AccessPath, WriteOp]>>,
    serializer: Serializer
  ): void {
    serializer.serializeLen(value.length);
    value.forEach((item: Tuple<[AccessPath, WriteOp]>) => {
      Helpers.serializeTuple2AccessPathWriteOp(item, serializer);
    });
  }

  static deserializeVectorTuple2AccessPathWriteOp(
    deserializer: Deserializer
  ): Seq<Tuple<[AccessPath, WriteOp]>> {
    const length = deserializer.deserializeLen();
    const list: Seq<Tuple<[AccessPath, WriteOp]>> = [];
    for (let i = 0; i < length; i++) {
      list.push(Helpers.deserializeTuple2AccessPathWriteOp(deserializer));
    }
    return list;
  }

  static serializeVectorU8(value: Seq<uint8>, serializer: Serializer): void {
    serializer.serializeLen(value.length);
    value.forEach((item: uint8) => {
      serializer.serializeU8(item);
    });
  }

  static deserializeVectorU8(deserializer: Deserializer): Seq<uint8> {
    const length = deserializer.deserializeLen();
    const list: Seq<uint8> = [];
    for (let i = 0; i < length; i++) {
      list.push(deserializer.deserializeU8());
    }
    return list;
  }
}
