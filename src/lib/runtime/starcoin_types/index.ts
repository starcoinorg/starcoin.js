import { bech32 } from 'bech32';
import { concat, arrayify, hexlify } from '@ethersproject/bytes';
import { BcsDeserializer, BcsSerializer } from '../bcs';
import { Serializer } from '../serde/serializer';
import { Deserializer } from '../serde/deserializer';
import { Optional, Seq, Tuple, ListTuple, unit, bool, int8, int16, int32, int64, int128, uint8, uint16, uint32, uint64, uint128, float32, float64, char, str, bytes } from '../serde/types';
import { dec2bin, bin2dec, setBit, isSetBit, dec2uint8array, uint8array2dec } from "../../../utils/helper";

const CryptoMaterialError = {
  SerializationError: 'Struct to be signed does not serialize correctly',
  DeserializationError: 'Key or signature material does not deserialize correctly',
  ValidationError: 'Key or signature material deserializes, but is otherwise not valid',
  WrongLengthError: 'Key, threshold or signature material does not have the expected size',
  CanonicalRepresentationError: 'Part of the signature or key is not canonical resulting to malleability issues',
  SmallSubgroupError: 'A curve point (i.e., a public key) lies on a small group',
  PointNotOnCurveError: 'A curve point (i.e., a public key) does not satisfy the curve equation',
  BitVecError: 'BitVec errors in accountable multi-sig schemes',
}

const MAX_NUM_OF_KEYS = 32
const BITMAP_NUM_OF_BYTES = 4

// The length of the Ed25519PrivateKey
const ED25519_PRIVATE_KEY_LENGTH = 32;
// The length of the Ed25519PublicKey
const ED25519_PUBLIC_KEY_LENGTH = 32;
// The length of the Ed25519Signature
const ED25519_SIGNATURE_LENGTH = 32;

export class AccessPath {

  constructor(public field0: AccountAddress, public field1: DataPath) {
  }

  public serialize(serializer: Serializer): void {
    this.field0.serialize(serializer);
    this.field1.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): AccessPath {
    const field0 = AccountAddress.deserialize(deserializer);
    const field1 = DataPath.deserialize(deserializer);
    return new AccessPath(field0, field1);
  }

}
export class AccountAddress {
  static LENGTH: uint8 = 16;

  constructor(public value: ListTuple<[uint8]>) {
  }

  public serialize(serializer: Serializer): void {
    Helpers.serializeArray16U8Array(this.value, serializer);
  }

  static deserialize(deserializer: Deserializer): AccountAddress {
    const value = Helpers.deserializeArray16U8Array(deserializer);
    return new AccountAddress(value);
  }

}
export class AccountResource {

  constructor(public authentication_key: Seq<uint8>, public withdrawal_capability: Optional<WithdrawCapabilityResource>, public key_rotation_capability: Optional<KeyRotationCapabilityResource>, public withdraw_events: EventHandle, public deposit_events: EventHandle, public accept_token_events: EventHandle, public sequence_number: uint64) {
  }

  public serialize(serializer: Serializer): void {
    Helpers.serializeVectorU8(this.authentication_key, serializer);
    Helpers.serializeOptionWithdrawCapabilityResource(this.withdrawal_capability, serializer);
    Helpers.serializeOptionKeyRotationCapabilityResource(this.key_rotation_capability, serializer);
    this.withdraw_events.serialize(serializer);
    this.deposit_events.serialize(serializer);
    this.accept_token_events.serialize(serializer);
    serializer.serializeU64(this.sequence_number);
  }

  static deserialize(deserializer: Deserializer): AccountResource {
    const authentication_key = Helpers.deserializeVectorU8(deserializer);
    const withdrawal_capability = Helpers.deserializeOptionWithdrawCapabilityResource(deserializer);
    const key_rotation_capability = Helpers.deserializeOptionKeyRotationCapabilityResource(deserializer);
    const withdraw_events = EventHandle.deserialize(deserializer);
    const deposit_events = EventHandle.deserialize(deserializer);
    const accept_token_events = EventHandle.deserialize(deserializer);
    const sequence_number = deserializer.deserializeU64();
    return new AccountResource(authentication_key, withdrawal_capability, key_rotation_capability, withdraw_events, deposit_events, accept_token_events, sequence_number);
  }

}
export class ArgumentABI {

  constructor(public name: str, public type_tag: TypeTag) {
  }

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

  constructor(public value: bytes) {
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): AuthenticationKey {
    const value = deserializer.deserializeBytes();
    return new AuthenticationKey(value);
  }

}
export class BlockMetadata {

  constructor(public parent_hash: HashValue, public timestamp: uint64, public author: AccountAddress, public author_auth_key: Optional<AuthenticationKey>, public uncles: uint64, public number: uint64, public chain_id: ChainId, public parent_gas_used: uint64) {
  }

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
    const author_auth_key = Helpers.deserializeOptionAuthenticationKey(deserializer);
    const uncles = deserializer.deserializeU64();
    const number = deserializer.deserializeU64();
    const chain_id = ChainId.deserialize(deserializer);
    const parent_gas_used = deserializer.deserializeU64();
    return new BlockMetadata(parent_hash, timestamp, author, author_auth_key, uncles, number, chain_id, parent_gas_used);
  }

}
export class ChainId {

  constructor(public id: uint8) {
  }

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
      case 0: return ContractEventVariantV0.load(deserializer);
      default: throw new Error("Unknown variant index for ContractEvent: " + index);
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

  constructor(public key: EventKey, public sequence_number: uint64, public type_tag: TypeTag, public event_data: bytes) {
  }

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
export abstract class DataPath {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): DataPath {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0: return DataPathVariantCode.load(deserializer);
      case 1: return DataPathVariantResource.load(deserializer);
      default: throw new Error("Unknown variant index for DataPath: " + index);
    }
  }
}


export class DataPathVariantCode extends DataPath {

  constructor(public value: Identifier) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): DataPathVariantCode {
    const value = Identifier.deserialize(deserializer);
    return new DataPathVariantCode(value);
  }

}

export class DataPathVariantResource extends DataPath {

  constructor(public value: StructTag) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): DataPathVariantResource {
    const value = StructTag.deserialize(deserializer);
    return new DataPathVariantResource(value);
  }

}
export abstract class DataType {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): DataType {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0: return DataTypeVariantCODE.load(deserializer);
      case 1: return DataTypeVariantRESOURCE.load(deserializer);
      default: throw new Error("Unknown variant index for DataType: " + index);
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

  constructor(public value: bytes) {
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): Ed25519PrivateKey {
    const value = deserializer.deserializeBytes();
    return new Ed25519PrivateKey(value);
  }

}
export class Ed25519PublicKey {

  constructor(public value: bytes) {
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): Ed25519PublicKey {
    const value = deserializer.deserializeBytes();
    return new Ed25519PublicKey(value);
  }

}
export class Ed25519Signature {

  constructor(public value: bytes) {
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): Ed25519Signature {
    const value = deserializer.deserializeBytes();
    return new Ed25519Signature(value);
  }

}
export class EventHandle {

  constructor(public count: uint64, public key: EventKey) {
  }

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

  constructor(public value: bytes) {
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): EventKey {
    const value = deserializer.deserializeBytes();
    return new EventKey(value);
  }

}
export class HashValue {

  constructor(public value: bytes) {
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): HashValue {
    const value = deserializer.deserializeBytes();
    return new HashValue(value);
  }

}
export class Identifier {

  constructor(public value: str) {
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeStr(this.value);
  }

  static deserialize(deserializer: Deserializer): Identifier {
    const value = deserializer.deserializeStr();
    return new Identifier(value);
  }

}
export class KeyRotationCapabilityResource {

  constructor(public account_address: AccountAddress) {
  }

  public serialize(serializer: Serializer): void {
    this.account_address.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): KeyRotationCapabilityResource {
    const account_address = AccountAddress.deserialize(deserializer);
    return new KeyRotationCapabilityResource(account_address);
  }

}
export class Module {

  constructor(public code: bytes) {
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.code);
  }

  static deserialize(deserializer: Deserializer): Module {
    const code = deserializer.deserializeBytes();
    return new Module(code);
  }

}
export class ModuleId {

  constructor(public address: AccountAddress, public name: Identifier) {
  }

  public serialize(serializer: Serializer): void {
    this.address.serialize(serializer);
    this.name.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): ModuleId {
    const address = AccountAddress.deserialize(deserializer);
    const name = Identifier.deserialize(deserializer);
    return new ModuleId(address, name);
  }

}
export class MultiEd25519PrivateKey {

  constructor(public value: bytes) {
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): MultiEd25519PrivateKey {
    const value = deserializer.deserializeBytes();
    return new MultiEd25519PrivateKey(value);
  }

}
export class MultiEd25519PublicKey {
  constructor(public public_keys: Seq<Ed25519PublicKey>, public threshold: uint8) {
    const num_of_public_keys = public_keys.length;
    if (threshold === 0 || num_of_public_keys < threshold) {
      throw new Error(CryptoMaterialError.ValidationError)
    } else if (num_of_public_keys > MAX_NUM_OF_KEYS) {
      throw new Error(CryptoMaterialError.WrongLengthError)
    }
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value());
  }

  static deserialize(deserializer: Deserializer): MultiEd25519PublicKey {
    const bytes = deserializer.deserializeBytes()
    const public_keys: Seq<Ed25519PublicKey> = [];
    const count = (bytes.length - 1) / 32
    for (let i = 0; i < count; i++) {
      const start = i * 32;
      const end = start + 32;
      public_keys.push(new Ed25519PublicKey(bytes.slice(start, end)));
    }
    const threshold = new DataView(bytes.slice(-1).buffer, 0).getUint8(0);;
    return new MultiEd25519PublicKey(public_keys, threshold);
  }

  public value(): Uint8Array {
    const arrPub = []
    this.public_keys.forEach((pub) => {
      arrPub.push(pub.value)
    })

    const arrThreshold = new Uint8Array(1);
    arrThreshold[0] = this.threshold

    const bytes = concat([...arrPub, ...arrThreshold])
    return bytes;
  }
}

export class MultiEd25519Signature {
  // 0b00010000000000000000000000000001(268435457), the 3rd and 31st positions are set.
  constructor(public signatures: Seq<Ed25519Signature>, public bitmap: uint8) {
  }

  static build(origin_signatures: [Ed25519Signature, uint8][]): MultiEd25519Signature {
    const num_of_sigs = origin_signatures.length;
    if (num_of_sigs === 0 || num_of_sigs > MAX_NUM_OF_KEYS) {
      throw new Error(CryptoMaterialError.ValidationError)
    }
    const sorted_signatures = origin_signatures.sort((a, b) => {
      return a[1] > b[1] ? 1 : -1
    })
    const sigs = []
    let bitmap = 0b00000000000000000000000000000000
    sorted_signatures.forEach((k, v) => {
      console.log(k, v)
      if (k[1] >= MAX_NUM_OF_KEYS) {
        throw new Error(`${ CryptoMaterialError.BitVecError }: Signature index is out of range`)
      } else if (isSetBit(bitmap, k[1])) {
        throw new Error(`${ CryptoMaterialError.BitVecError }: Duplicate signature index`)
      } else {
        sigs.push(k[0])
        bitmap = setBit(bitmap, k[1])
      }
    })
    return new MultiEd25519Signature(sigs, bitmap);
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value());
  }

  static deserialize(deserializer: Deserializer): MultiEd25519Signature {
    const bytes = deserializer.deserializeBytes()
    const signatures: Seq<Ed25519Signature> = [];
    const count = (bytes.length - 4) / 64
    for (let i = 0; i < count; i++) {
      const start = i * 64;
      const end = start + 64;
      signatures.push(new Ed25519Signature(bytes.slice(start, end)));
    }
    const bitmap = uint8array2dec(bytes.slice(-4));
    return new MultiEd25519Signature(signatures, bitmap);
  }

  public value(): Uint8Array {
    const arrSignatures = []
    this.signatures.forEach((signature) => {
      arrSignatures.push(signature.value)
    })

    const arrBitmap = dec2uint8array(this.bitmap);

    const bytes = concat([...arrSignatures, ...arrBitmap])
    return bytes;
  }
}

export class MultiEd25519SignatureShard {
  constructor(public signature: MultiEd25519Signature, public threshold: uint8) {
  }

  public signatures(): [Ed25519Signature, uint8][] {
    const signatures = this.signature.signatures;
    const bitmap = this.signature.bitmap;
    const result: [Ed25519Signature, uint8][] = []
    let bitmap_index = 0
    signatures.forEach((v, idx) => {
      while (!isSetBit(bitmap, bitmap_index)) {
        bitmap_index += 1;
      }
      result.push([v, bitmap_index])
      bitmap_index += 1
    })
    return result
  }

  static merge(shards: Seq<MultiEd25519SignatureShard>): MultiEd25519SignatureShard {
    if (shards.length === 0) {
      throw new Error('MultiEd25519SignatureShard shards is empty')
    }
    const threshold = shards[0].threshold
    const signatures: [Ed25519Signature, uint8][] = []
    shards.forEach((shard) => {
      if (shard.threshold !== threshold) {
        throw new Error('MultiEd25519SignatureShard shards threshold not same')
      }
      signatures.push(...shard.signatures())
    })
    return new MultiEd25519SignatureShard(MultiEd25519Signature.build(signatures), threshold)

  }

  public is_enough(): boolean {
    return this.signature.signatures.length >= this.threshold
  }
}

// Part of private keys in the multi-key Ed25519 structure along with the threshold.
// note: the private keys must be a sequential part of the MultiEd25519PrivateKey
export class MultiEd25519KeyShard {
  constructor(public public_keys: Seq<Ed25519PublicKey>, public threshold: uint8, public private_keys: Record<uint8, Ed25519PrivateKey>) {
    const num_of_public_keys = public_keys.length;
    const num_of_private_keys = Object.keys(private_keys).length;
    if (threshold === 0 || num_of_private_keys === 0 || num_of_public_keys < threshold) {
      throw new Error(CryptoMaterialError.ValidationError)
    } else if (num_of_private_keys > MAX_NUM_OF_KEYS || num_of_public_keys > MAX_NUM_OF_KEYS) {
      throw new Error(CryptoMaterialError.WrongLengthError)
    }
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeU8(this.public_keys.length)
    serializer.serializeU8(this.threshold)
    serializer.serializeU8(this.len())
    this.public_keys.forEach((pub) => {
      pub.serialize(serializer)
    })
    Object.keys(this.private_keys).forEach((pos) => {
      serializer.serializeU8(Number.parseInt(pos, 10))
      this.private_keys[pos].serialize(serializer)
    })
  }

  static deserialize(deserializer: Deserializer): MultiEd25519KeyShard {
    const publicKeysLen = deserializer.deserializeU8();
    const threshold = deserializer.deserializeU8();
    const privateKeysLen = deserializer.deserializeU8();
    const public_keys: Seq<Ed25519PublicKey> = [];
    for (let i = 0; i < publicKeysLen; i++) {
      public_keys.push(Ed25519PublicKey.deserialize(deserializer));
    }
    const private_keys: Record<uint8, Ed25519PrivateKey> = [];
    for (let i = 0; i < privateKeysLen; i++) {
      const pos = deserializer.deserializeU8()
      const privateKey = Ed25519PrivateKey.deserialize(deserializer)
      public_keys[pos] = privateKey
    }
    return new MultiEd25519KeyShard(public_keys, threshold, private_keys);
  }

  public publicKey(): MultiEd25519PublicKey {
    return new MultiEd25519PublicKey(this.public_keys, this.threshold);
  }

  // should be different for each account, since the private_keys are not the same
  public privateKeys(): Ed25519PrivateKey[] {
    return Object.values(this.private_keys);
  }

  // should be different for each account, since the private_keys are not the same
  public privateKey(): Uint8Array {
    const arrHead = new Uint8Array(3);
    arrHead[0] = this.public_keys.length
    arrHead[1] = this.threshold
    arrHead[2] = this.len()
    const arrPub = []
    this.public_keys.forEach((pub) => {
      arrPub.push(pub.value)
    })
    const arrPriv = []
    Object.values(this.private_keys).forEach((priv) => {
      arrPriv.push(priv.value)
    })
    const bytes = concat([arrHead, ...arrPub, ...arrPriv])
    return bytes;
  }

  public len(): uint8 {
    return Object.values(this.private_keys).length;
  }

  public isEmpty(): boolean {
    return this.len() === 0;
  }
}

export class Package {

  constructor(public package_address: AccountAddress, public modules: Seq<Module>, public init_script: Optional<ScriptFunction>) {
  }

  public serialize(serializer: Serializer): void {
    this.package_address.serialize(serializer);
    Helpers.serializeVectorModule(this.modules, serializer);
    Helpers.serializeOptionScriptFunction(this.init_script, serializer);
  }

  static deserialize(deserializer: Deserializer): Package {
    const package_address = AccountAddress.deserialize(deserializer);
    const modules = Helpers.deserializeVectorModule(deserializer);
    const init_script = Helpers.deserializeOptionScriptFunction(deserializer);
    return new Package(package_address, modules, init_script);
  }

}
export class RawUserTransaction {

  constructor(public sender: AccountAddress, public sequence_number: uint64, public payload: TransactionPayload, public max_gas_amount: uint64, public gas_unit_price: uint64, public gas_token_code: str, public expiration_timestamp_secs: uint64, public chain_id: ChainId) {
  }

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
    return new RawUserTransaction(sender, sequence_number, payload, max_gas_amount, gas_unit_price, gas_token_code, expiration_timestamp_secs, chain_id);
  }
}
export class Script {

  constructor(public code: bytes, public ty_args: Seq<TypeTag>, public args: Seq<bytes>) {
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.code);
    Helpers.serializeVectorTypeTag(this.ty_args, serializer);
    Helpers.serializeVectorBytes(this.args, serializer);
  }

  static deserialize(deserializer: Deserializer): Script {
    const code = deserializer.deserializeBytes();
    const ty_args = Helpers.deserializeVectorTypeTag(deserializer);
    const args = Helpers.deserializeVectorBytes(deserializer);
    return new Script(code, ty_args, args);
  }

}
export abstract class ScriptABI {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): ScriptABI {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0: return ScriptABIVariantTransactionScript.load(deserializer);
      case 1: return ScriptABIVariantScriptFunction.load(deserializer);
      default: throw new Error("Unknown variant index for ScriptABI: " + index);
    }
  }
}


export class ScriptABIVariantTransactionScript extends ScriptABI {

  constructor(public value: TransactionScriptABI) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): ScriptABIVariantTransactionScript {
    const value = TransactionScriptABI.deserialize(deserializer);
    return new ScriptABIVariantTransactionScript(value);
  }

}

export class ScriptABIVariantScriptFunction extends ScriptABI {

  constructor(public value: ScriptFunctionABI) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): ScriptABIVariantScriptFunction {
    const value = ScriptFunctionABI.deserialize(deserializer);
    return new ScriptABIVariantScriptFunction(value);
  }

}
export class ScriptFunction {
  // need to rename `function` to `func` as `function` is a keyword in JS.
  constructor(public module: ModuleId, public func: Identifier, public ty_args: Seq<TypeTag>, public args: Seq<bytes>) {
  }

  public serialize(serializer: Serializer): void {
    this.module.serialize(serializer);
    this.func.serialize(serializer);
    Helpers.serializeVectorTypeTag(this.ty_args, serializer);
    Helpers.serializeVectorBytes(this.args, serializer);
  }

  static deserialize(deserializer: Deserializer): ScriptFunction {
    const module = ModuleId.deserialize(deserializer);
    const func = Identifier.deserialize(deserializer);
    const ty_args = Helpers.deserializeVectorTypeTag(deserializer);
    const args = Helpers.deserializeVectorBytes(deserializer);
    return new ScriptFunction(module, func, ty_args, args);
  }

}
export class ScriptFunctionABI {

  constructor(public name: str, public module_name: ModuleId, public doc: str, public ty_args: Seq<TypeArgumentABI>, public args: Seq<ArgumentABI>) {
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeStr(this.name);
    this.module_name.serialize(serializer);
    serializer.serializeStr(this.doc);
    Helpers.serializeVectorTypeArgumentAbi(this.ty_args, serializer);
    Helpers.serializeVectorArgumentAbi(this.args, serializer);
  }

  static deserialize(deserializer: Deserializer): ScriptFunctionABI {
    const name = deserializer.deserializeStr();
    const module_name = ModuleId.deserialize(deserializer);
    const doc = deserializer.deserializeStr();
    const ty_args = Helpers.deserializeVectorTypeArgumentAbi(deserializer);
    const args = Helpers.deserializeVectorArgumentAbi(deserializer);
    return new ScriptFunctionABI(name, module_name, doc, ty_args, args);
  }

}
export class SignedUserTransaction {

  constructor(public raw_txn: RawUserTransaction, public authenticator: TransactionAuthenticator) {
  }

  public serialize(serializer: Serializer): void {
    this.raw_txn.serialize(serializer);
    this.authenticator.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): SignedUserTransaction {
    const raw_txn = RawUserTransaction.deserialize(deserializer);
    const authenticator = TransactionAuthenticator.deserialize(deserializer);
    return new SignedUserTransaction(raw_txn, authenticator);
  }

  static ed25519(raw_txn: RawUserTransaction, public_key: Ed25519PublicKey, signature: Ed25519Signature): SignedUserTransaction {
    const authenticator = new TransactionAuthenticatorVariantEd25519(public_key, signature);
    return new SignedUserTransaction(raw_txn, authenticator);
  }

  static multi_ed25519(raw_txn: RawUserTransaction, public_key: MultiEd25519PublicKey, signature: MultiEd25519Signature): SignedUserTransaction {
    const authenticator = new TransactionAuthenticatorVariantMultiEd25519(public_key, signature);
    return new SignedUserTransaction(raw_txn, authenticator);
  }

}
export class StructTag {

  constructor(public address: AccountAddress, public module: Identifier, public name: Identifier, public type_params: Seq<TypeTag>) {
  }

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
      case 0: return TransactionVariantUserTransaction.load(deserializer);
      case 1: return TransactionVariantBlockMetadata.load(deserializer);
      default: throw new Error("Unknown variant index for Transaction: " + index);
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
      case 0: return TransactionArgumentVariantU8.load(deserializer);
      case 1: return TransactionArgumentVariantU64.load(deserializer);
      case 2: return TransactionArgumentVariantU128.load(deserializer);
      case 3: return TransactionArgumentVariantAddress.load(deserializer);
      case 4: return TransactionArgumentVariantU8Vector.load(deserializer);
      case 5: return TransactionArgumentVariantBool.load(deserializer);
      default: throw new Error("Unknown variant index for TransactionArgument: " + index);
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
      case 0: return TransactionAuthenticatorVariantEd25519.load(deserializer);
      case 1: return TransactionAuthenticatorVariantMultiEd25519.load(deserializer);
      default: throw new Error("Unknown variant index for TransactionAuthenticator: " + index);
    }
  }
}


export class TransactionAuthenticatorVariantEd25519 extends TransactionAuthenticator {

  constructor(public public_key: Ed25519PublicKey, public signature: Ed25519Signature) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
    this.public_key.serialize(serializer);
    this.signature.serialize(serializer);
  }

  static load(deserializer: Deserializer): TransactionAuthenticatorVariantEd25519 {
    const public_key = Ed25519PublicKey.deserialize(deserializer);
    const signature = Ed25519Signature.deserialize(deserializer);
    return new TransactionAuthenticatorVariantEd25519(public_key, signature);
  }

}

export class TransactionAuthenticatorVariantMultiEd25519 extends TransactionAuthenticator {

  constructor(public public_key: MultiEd25519PublicKey, public signature: MultiEd25519Signature) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
    this.public_key.serialize(serializer);
    this.signature.serialize(serializer);
  }

  static load(deserializer: Deserializer): TransactionAuthenticatorVariantMultiEd25519 {
    const public_key = MultiEd25519PublicKey.deserialize(deserializer);
    const signature = MultiEd25519Signature.deserialize(deserializer);
    return new TransactionAuthenticatorVariantMultiEd25519(public_key, signature);
  }

}
export abstract class TransactionPayload {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): TransactionPayload {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0: return TransactionPayloadVariantScript.load(deserializer);
      case 1: return TransactionPayloadVariantPackage.load(deserializer);
      case 2: return TransactionPayloadVariantScriptFunction.load(deserializer);
      default: throw new Error("Unknown variant index for TransactionPayload: " + index);
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

export class TransactionPayloadVariantScriptFunction extends TransactionPayload {

  constructor(public value: ScriptFunction) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(2);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): TransactionPayloadVariantScriptFunction {
    const value = ScriptFunction.deserialize(deserializer);
    return new TransactionPayloadVariantScriptFunction(value);
  }

}
export class TransactionScriptABI {

  constructor(public name: str, public doc: str, public code: bytes, public ty_args: Seq<TypeArgumentABI>, public args: Seq<ArgumentABI>) {
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeStr(this.name);
    serializer.serializeStr(this.doc);
    serializer.serializeBytes(this.code);
    Helpers.serializeVectorTypeArgumentAbi(this.ty_args, serializer);
    Helpers.serializeVectorArgumentAbi(this.args, serializer);
  }

  static deserialize(deserializer: Deserializer): TransactionScriptABI {
    const name = deserializer.deserializeStr();
    const doc = deserializer.deserializeStr();
    const code = deserializer.deserializeBytes();
    const ty_args = Helpers.deserializeVectorTypeArgumentAbi(deserializer);
    const args = Helpers.deserializeVectorArgumentAbi(deserializer);
    return new TransactionScriptABI(name, doc, code, ty_args, args);
  }

}
export class TypeArgumentABI {

  constructor(public name: str) {
  }

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
      case 0: return TypeTagVariantBool.load(deserializer);
      case 1: return TypeTagVariantU8.load(deserializer);
      case 2: return TypeTagVariantU64.load(deserializer);
      case 3: return TypeTagVariantU128.load(deserializer);
      case 4: return TypeTagVariantAddress.load(deserializer);
      case 5: return TypeTagVariantSigner.load(deserializer);
      case 6: return TypeTagVariantVector.load(deserializer);
      case 7: return TypeTagVariantStruct.load(deserializer);
      default: throw new Error("Unknown variant index for TypeTag: " + index);
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

  constructor(public account_address: AccountAddress) {
  }

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
      case 0: return WriteOpVariantDeletion.load(deserializer);
      case 1: return WriteOpVariantValue.load(deserializer);
      default: throw new Error("Unknown variant index for WriteOp: " + index);
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

  constructor(public value: WriteSetMut) {
  }

  public serialize(serializer: Serializer): void {
    this.value.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): WriteSet {
    const value = WriteSetMut.deserialize(deserializer);
    return new WriteSet(value);
  }

}
export class WriteSetMut {

  constructor(public write_set: Seq<Tuple<[AccessPath, WriteOp]>>) {
  }

  public serialize(serializer: Serializer): void {
    Helpers.serializeVectorTuple2AccessPathWriteOp(this.write_set, serializer);
  }

  static deserialize(deserializer: Deserializer): WriteSetMut {
    const write_set = Helpers.deserializeVectorTuple2AccessPathWriteOp(deserializer);
    return new WriteSetMut(write_set);
  }

}
export class Helpers {
  static serializeArray16U8Array(value: ListTuple<[uint8]>, serializer: Serializer): void {
    value.forEach((item) => {
      serializer.serializeU8(item[0]);
    });
  }

  static deserializeArray16U8Array(deserializer: Deserializer): ListTuple<[uint8]> {
    const list: ListTuple<[uint8]> = [];
    for (let i = 0; i < 16; i++) {
      list.push([deserializer.deserializeU8()]);
    }
    return list;
  }

  static serializeOptionAuthenticationKey(value: Optional<AuthenticationKey>, serializer: Serializer): void {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  }

  static deserializeOptionAuthenticationKey(deserializer: Deserializer): Optional<AuthenticationKey> {
    const tag = deserializer.deserializeOptionTag();
    if (!tag) {
      return null;
    } else {
      return AuthenticationKey.deserialize(deserializer);
    }
  }

  static serializeOptionKeyRotationCapabilityResource(value: Optional<KeyRotationCapabilityResource>, serializer: Serializer): void {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  }

  static deserializeOptionKeyRotationCapabilityResource(deserializer: Deserializer): Optional<KeyRotationCapabilityResource> {
    const tag = deserializer.deserializeOptionTag();
    if (!tag) {
      return null;
    } else {
      return KeyRotationCapabilityResource.deserialize(deserializer);
    }
  }

  static serializeOptionScriptFunction(value: Optional<ScriptFunction>, serializer: Serializer): void {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  }

  static deserializeOptionScriptFunction(deserializer: Deserializer): Optional<ScriptFunction> {
    const tag = deserializer.deserializeOptionTag();
    if (!tag) {
      return null;
    } else {
      return ScriptFunction.deserialize(deserializer);
    }
  }

  static serializeOptionWithdrawCapabilityResource(value: Optional<WithdrawCapabilityResource>, serializer: Serializer): void {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  }

  static deserializeOptionWithdrawCapabilityResource(deserializer: Deserializer): Optional<WithdrawCapabilityResource> {
    const tag = deserializer.deserializeOptionTag();
    if (!tag) {
      return null;
    } else {
      return WithdrawCapabilityResource.deserialize(deserializer);
    }
  }

  static serializeTuple2AccessPathWriteOp(value: Tuple<[AccessPath, WriteOp]>, serializer: Serializer): void {
    value[0].serialize(serializer);
    value[1].serialize(serializer);
  }

  static deserializeTuple2AccessPathWriteOp(deserializer: Deserializer): Tuple<[AccessPath, WriteOp]> {
    return [
      AccessPath.deserialize(deserializer),
      WriteOp.deserialize(deserializer)
    ];
  }

  static serializeVectorArgumentAbi(value: Seq<ArgumentABI>, serializer: Serializer): void {
    serializer.serializeLen(value.length);
    value.forEach((item: ArgumentABI) => {
      item.serialize(serializer);
    });
  }

  static deserializeVectorArgumentAbi(deserializer: Deserializer): Seq<ArgumentABI> {
    const length = deserializer.deserializeLen();
    const list: Seq<ArgumentABI> = [];
    for (let i = 0; i < length; i++) {
      list.push(ArgumentABI.deserialize(deserializer));
    }
    return list;
  }

  static serializeVectorModule(value: Seq<Module>, serializer: Serializer): void {
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

  static serializeVectorTypeArgumentAbi(value: Seq<TypeArgumentABI>, serializer: Serializer): void {
    serializer.serializeLen(value.length);
    value.forEach((item: TypeArgumentABI) => {
      item.serialize(serializer);
    });
  }

  static deserializeVectorTypeArgumentAbi(deserializer: Deserializer): Seq<TypeArgumentABI> {
    const length = deserializer.deserializeLen();
    const list: Seq<TypeArgumentABI> = [];
    for (let i = 0; i < length; i++) {
      list.push(TypeArgumentABI.deserialize(deserializer));
    }
    return list;
  }

  static serializeVectorTypeTag(value: Seq<TypeTag>, serializer: Serializer): void {
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

  static serializeVectorBytes(value: Seq<bytes>, serializer: Serializer): void {
    serializer.serializeLen(value.length);
    value.forEach((item: bytes) => {
      serializer.serializeBytes(item);
    });
  }

  static deserializeVectorBytes(deserializer: Deserializer): Seq<bytes> {
    const length = deserializer.deserializeLen();
    const list: Seq<bytes> = [];
    for (let i = 0; i < length; i++) {
      list.push(deserializer.deserializeBytes());
    }
    return list;
  }

  static serializeVectorTuple2AccessPathWriteOp(value: Seq<Tuple<[AccessPath, WriteOp]>>, serializer: Serializer): void {
    serializer.serializeLen(value.length);
    value.forEach((item: Tuple<[AccessPath, WriteOp]>) => {
      Helpers.serializeTuple2AccessPathWriteOp(item, serializer);
    });
  }

  static deserializeVectorTuple2AccessPathWriteOp(deserializer: Deserializer): Seq<Tuple<[AccessPath, WriteOp]>> {
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

export class AuthKey {

  constructor(public value: bytes) {
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  public hex(): string {
    return Buffer.from(this.value).toString('hex')
  }

}
/**
 * Receipt Identifier
 * https://github.com/starcoinorg/SIPs/blob/master/sip-21/index.md
 * 
 */
export class ReceiptIdentifier {
  constructor(public accountAddress: AccountAddress, public authKey: Optional<AuthKey>) {
  }

  public encode(): string {
    const VERSION = '1'
    const PREFIX = 'stc'

    const se = new BcsSerializer();
    this.accountAddress.serialize(se);

    const dataBuff = Buffer.concat([Buffer.from(se.getBytes()), Buffer.from(this.authKey.value)])
    const words = bech32.toWords(dataBuff)
    const wordsPrefixVersion = [Number(VERSION)].concat(words)
    const encodedStr = bech32.encode(PREFIX, wordsPrefixVersion)
    return encodedStr
  }

  static decode(value: string): ReceiptIdentifier {
    const result = bech32.decode(value)
    const wordsPrefixVersion = result.words

    // const versionBytes = wordsPrefixVersion.slice(0, 1)
    // const version = versionBytes.toString()

    const words = wordsPrefixVersion.slice(1)

    const dataBytes = Buffer.from(bech32.fromWords(words))

    const accountAddressBytes = dataBytes.slice(0, AccountAddress.LENGTH)
    const authKeyBytes = dataBytes.slice(AccountAddress.LENGTH)

    const accountAddress = AccountAddress.deserialize(new BcsDeserializer(accountAddressBytes))
    const authKey = new AuthKey(authKeyBytes)
    return new ReceiptIdentifier(accountAddress, authKey)
  }
}

export class SigningMessage {

  constructor(public message: bytes) {
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.message);
  }

  static deserialize(deserializer: Deserializer): SigningMessage {
    const message = deserializer.deserializeBytes();
    return new SigningMessage(message);
  }

}

export class SignedMessage {

  constructor(public account: AccountAddress, public message: SigningMessage, public authenticator: TransactionAuthenticator, public chain_id: ChainId) {
  }

  public serialize(serializer: Serializer): void {
    this.account.serialize(serializer);
    this.message.serialize(serializer);
    this.authenticator.serialize(serializer);
    this.chain_id.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): SignedMessage {
    const account = AccountAddress.deserialize(deserializer);
    const message = SigningMessage.deserialize(deserializer);
    const authenticator = TransactionAuthenticator.deserialize(deserializer);
    const chain_id = ChainId.deserialize(deserializer);
    return new SignedMessage(account, message, authenticator, chain_id);
  }

}
