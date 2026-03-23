import { bech32 } from 'bech32';
import { concat, arrayify, hexlify, hexValue, isHexString, hexDataLength, isBytes } from '@ethersproject/bytes';
import { addHexPrefix, stripHexPrefix } from 'ethereumjs-util';
import { getPublicKey, utils, sign, verify } from '@noble/ed25519';
import { sha3_256 as sha3_256$1 } from 'js-sha3';
import hexadecimal from 'is-hexadecimal';
import decimal from 'is-decimal';
import alphanumerical from 'is-alphanumerical';
import alphabetical from 'is-alphabetical';
import whitespace from 'is-whitespace-character';
import { Logger } from '@ethersproject/logger';
import { cloneDeep } from 'lodash';
import { BigNumber } from '@ethersproject/bignumber';
import { defineReadOnly, shallowCopy, resolveProperties, getStatic, deepCopy } from '@ethersproject/properties';
import { poll, fetchJson } from '@ethersproject/web';
import '@ethersproject/basex';
import '@ethersproject/sha2';
import WebSocket from 'ws';

const accountType = {
  SINGLE: 0,
  MULTI: 1
};
function formatStructTag(structTag) {
  let s = `${structTag.address}::${structTag.module}::${structTag.name}`;

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
function formatTypeTag(typeTag) {
  if (typeof typeTag === 'string') {
    return typeTag.toLowerCase();
  }

  if (typeof typeTag === 'object') {
    // @ts-ignore
    if (typeTag.Vector !== undefined) {
      // @ts-ignore
      let subTypeTag = typeTag.Vector;
      return `vector<${formatTypeTag(subTypeTag)}>`;
    } // @ts-ignore


    if (typeTag.Struct !== undefined) {
      // @ts-ignore
      let subTypeTag = typeTag.Struct;
      return formatStructTag(subTypeTag);
    }
  }
} // eslint-disable-next-line @typescript-eslint/naming-convention

const TransactionVMStatus_Executed = 'Executed'; // eslint-disable-next-line @typescript-eslint/naming-convention

const TransactionVMStatus_OutOfGas = 'OutOfGas'; // eslint-disable-next-line @typescript-eslint/naming-convention

const TransactionVMStatus_MiscellaneousError = 'MiscellaneousError';
function formatFunctionId(functionId) {
  if (typeof functionId !== 'string') {
    return `${functionId.address}::${functionId.module}::${functionId.functionName}`;
  } else {
    return functionId;
  }
}
function parseFunctionId(functionId) {
  if (typeof functionId !== 'string') {
    return functionId;
  } else {
    const parts = functionId.split('::', 3);

    if (parts.length !== 3) {
      throw new Error(`cannot parse ${functionId} into FunctionId`);
    }

    return {
      address: parts[0],
      module: parts[1],
      functionName: parts[2]
    };
  }
}

var index = {
  __proto__: null,
  accountType: accountType,
  formatStructTag: formatStructTag,
  formatTypeTag: formatTypeTag,
  TransactionVMStatus_Executed: TransactionVMStatus_Executed,
  TransactionVMStatus_OutOfGas: TransactionVMStatus_OutOfGas,
  TransactionVMStatus_MiscellaneousError: TransactionVMStatus_MiscellaneousError,
  formatFunctionId: formatFunctionId,
  parseFunctionId: parseFunctionId
};

class BinaryDeserializer {
  constructor(data) {
    // As we can't be sure about the origin of the data, it's better to copy it to a new buffer
    // e.g. if the data originated by: Buffer.from('16a9', 'hex'), the internal buffer would be much longer and/or different (as Buffer is some sort of a view)
    this.buffer = new ArrayBuffer(data.length);
    new Uint8Array(this.buffer).set(data, 0);
    this.offset = 0;
  }

  read(length) {
    const bytes = this.buffer.slice(this.offset, this.offset + length);
    this.offset += length;
    return bytes;
  }

  deserializeStr() {
    const value = this.deserializeBytes();
    return BinaryDeserializer.textDecoder.decode(value);
  }

  deserializeBytes() {
    const len = this.deserializeLen();

    if (len < 0) {
      throw new Error("Length of a bytes array can't be negative");
    }

    return new Uint8Array(this.read(len));
  }

  deserializeBool() {
    const bool = new Uint8Array(this.read(1))[0];
    return bool == 1;
  }

  deserializeUnit() {
    return null;
  }

  deserializeU8() {
    return new DataView(this.read(1)).getUint8(0);
  }

  deserializeU16() {
    return new DataView(this.read(2)).getUint16(0, true);
  }

  deserializeU32() {
    return new DataView(this.read(4)).getUint32(0, true);
  }

  deserializeU64() {
    const low = this.deserializeU32();
    const high = this.deserializeU32(); // combine the two 32-bit values and return (little endian)

    return BigInt(high) << BinaryDeserializer.BIG_32 | BigInt(low);
  }

  deserializeU128() {
    const low = this.deserializeU64();
    const high = this.deserializeU64(); // combine the two 64-bit values and return (little endian)

    return BigInt(high) << BinaryDeserializer.BIG_64 | BigInt(low);
  }

  deserializeI8() {
    return new DataView(this.read(1)).getInt8(0);
  }

  deserializeI16() {
    return new DataView(this.read(2)).getInt16(0, true);
  }

  deserializeI32() {
    return new DataView(this.read(4)).getInt32(0, true);
  }

  deserializeI64() {
    const low = this.deserializeI32();
    const high = this.deserializeI32(); // combine the two 32-bit values and return (little endian)

    return BigInt(high) << BinaryDeserializer.BIG_32 | BigInt(low);
  }

  deserializeI128() {
    const low = this.deserializeI64();
    const high = this.deserializeI64(); // combine the two 64-bit values and return (little endian)

    return BigInt(high) << BinaryDeserializer.BIG_64 | BigInt(low);
  }

  deserializeOptionTag() {
    return this.deserializeBool();
  }

  getBufferOffset() {
    return this.offset;
  }

  deserializeChar() {
    throw new Error('Method deserializeChar not implemented.');
  }

  deserializeF32() {
    return new DataView(this.read(4)).getFloat32(0, true);
  }

  deserializeF64() {
    return new DataView(this.read(8)).getFloat64(0, true);
  }

}
BinaryDeserializer.BIG_32 = BigInt(32);
BinaryDeserializer.BIG_64 = BigInt(64);
BinaryDeserializer.textDecoder = new TextDecoder();

class BcsDeserializer extends BinaryDeserializer {
  constructor(data) {
    super(data);
  }

  deserializeUleb128AsU32() {
    let value = 0;

    for (let shift = 0; shift < 32; shift += 7) {
      const x = this.deserializeU8();
      const digit = x & 0x7f;
      value = value | digit << shift;

      if (value < 0 || value > BcsDeserializer.MAX_UINT_32) {
        throw new Error('Overflow while parsing uleb128-encoded uint32 value');
      }

      if (digit == x) {
        if (shift > 0 && digit == 0) {
          throw new Error('Invalid uleb128 number (unexpected zero digit)');
        }

        return value;
      }
    }

    throw new Error('Overflow while parsing uleb128-encoded uint32 value');
  }

  deserializeLen() {
    return this.deserializeUleb128AsU32();
  }

  deserializeVariantIndex() {
    return this.deserializeUleb128AsU32();
  }

  checkThatKeySlicesAreIncreasing( // eslint-disable-next-line @typescript-eslint/no-unused-vars
  key1, // eslint-disable-next-line @typescript-eslint/no-unused-vars
  key2) {
    return;
  }

}
BcsDeserializer.MAX_UINT_32 = 2 ** 32 - 1;

class BinarySerializer {
  constructor() {
    this.buffer = new ArrayBuffer(64);
    this.offset = 0;
  }

  ensureBufferWillHandleSize(bytes) {
    while (this.buffer.byteLength < this.offset + bytes) {
      const newBuffer = new ArrayBuffer(this.buffer.byteLength * 2);
      new Uint8Array(newBuffer).set(new Uint8Array(this.buffer));
      this.buffer = newBuffer;
    }
  }

  serialize(values) {
    this.ensureBufferWillHandleSize(values.length);
    new Uint8Array(this.buffer, this.offset).set(values);
    this.offset += values.length;
  }

  serializeStr(value) {
    this.serializeBytes(BinarySerializer.textEncoder.encode(value));
  }

  serializeBytes(value) {
    this.serializeLen(value.length);
    this.serialize(value);
  }

  serializeBool(value) {
    const byteValue = value ? 1 : 0;
    this.serialize(new Uint8Array([byteValue]));
  } // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/explicit-module-boundary-types


  serializeUnit(value) {
    return;
  }

  serializeWithFunction(fn, bytesLength, value) {
    this.ensureBufferWillHandleSize(bytesLength);
    const dv = new DataView(this.buffer, this.offset);
    fn.apply(dv, [0, value, true]);
    this.offset += bytesLength;
  }

  serializeU8(value) {
    this.serialize(new Uint8Array([value]));
  }

  serializeU16(value) {
    this.serializeWithFunction(DataView.prototype.setUint16, 2, value);
  }

  serializeU32(value) {
    this.serializeWithFunction(DataView.prototype.setUint32, 4, value);
  }

  serializeU64(value) {
    const low = BigInt(value) & BinarySerializer.BIG_32Fs;
    const high = BigInt(value) >> BinarySerializer.BIG_32; // write little endian number

    this.serializeU32(Number(low));
    this.serializeU32(Number(high));
  }

  serializeU128(value) {
    const low = BigInt(value) & BinarySerializer.BIG_64Fs;
    const high = BigInt(value) >> BinarySerializer.BIG_64; // write little endian number

    this.serializeU64(low);
    this.serializeU64(high);
  }

  serializeI8(value) {
    const bytes = 1;
    this.ensureBufferWillHandleSize(bytes);
    new DataView(this.buffer, this.offset).setInt8(0, value);
    this.offset += bytes;
  }

  serializeI16(value) {
    const bytes = 2;
    this.ensureBufferWillHandleSize(bytes);
    new DataView(this.buffer, this.offset).setInt16(0, value, true);
    this.offset += bytes;
  }

  serializeI32(value) {
    const bytes = 4;
    this.ensureBufferWillHandleSize(bytes);
    new DataView(this.buffer, this.offset).setInt32(0, value, true);
    this.offset += bytes;
  }

  serializeI64(value) {
    const low = BigInt(value) & BinarySerializer.BIG_32Fs;
    const high = BigInt(value) >> BinarySerializer.BIG_32; // write little endian number

    this.serializeI32(Number(low));
    this.serializeI32(Number(high));
  }

  serializeI128(value) {
    const low = BigInt(value) & BinarySerializer.BIG_64Fs;
    const high = BigInt(value) >> BinarySerializer.BIG_64; // write little endian number

    this.serializeI64(low);
    this.serializeI64(high);
  }

  serializeOptionTag(value) {
    this.serializeBool(value);
  }

  getBufferOffset() {
    return this.offset;
  }

  getBytes() {
    return new Uint8Array(this.buffer).slice(0, this.offset);
  }

  serializeChar(value) {
    throw new Error('Method serializeChar not implemented.');
  }

  serializeF32(value) {
    const bytes = 4;
    this.ensureBufferWillHandleSize(bytes);
    new DataView(this.buffer, this.offset).setFloat32(0, value, true);
    this.offset += bytes;
  }

  serializeF64(value) {
    const bytes = 8;
    this.ensureBufferWillHandleSize(bytes);
    new DataView(this.buffer, this.offset).setFloat64(0, value, true);
    this.offset += bytes;
  }

}
BinarySerializer.BIG_32 = BigInt(32);
BinarySerializer.BIG_64 = BigInt(64); // TypeScript with target below es2016 will translate BigInt(2)**BigInt(32) to Math.pow(BigInt(2), BigInt(32))
// which will result in `Cannot convert a BigInt value to a number`
// parsing it directly from the string representation of the number will overcome it and allow es6 to be configured as well

BinarySerializer.BIG_32Fs = BigInt('4294967295');
BinarySerializer.BIG_64Fs = BigInt('18446744073709551615');
BinarySerializer.textEncoder = new TextEncoder();

class BcsSerializer extends BinarySerializer {
  constructor() {
    super();
  }

  serializeU32AsUleb128(value) {
    const valueArray = [];

    while (value >>> 7 != 0) {
      valueArray.push(value & 0x7f | 0x80);
      value = value >>> 7;
    }

    valueArray.push(value);
    this.serialize(new Uint8Array(valueArray));
  }

  serializeLen(value) {
    this.serializeU32AsUleb128(value);
  }

  serializeVariantIndex(value) {
    this.serializeU32AsUleb128(value);
  }

  sortMapEntries(offsets) {// leaving it empty for now, should be implemented soon
  }

}



var index$1 = {
  __proto__: null,
  BcsDeserializer: BcsDeserializer,
  BcsSerializer: BcsSerializer
};

/* eslint-disable no-bitwise */
function dec2bin(dec) {
  const bin = (dec >>> 0).toString(2);
  const prefixed = `00000000000000000000000000000000${bin}`;
  return prefixed.slice(-32);
}
function bin2dec(bin) {
  return Number.parseInt(Number.parseInt(bin, 2).toString(10), 10);
} // the 3rd and 31st positions are set.
// 268435457
// 0b00010000000000000000000000000001
// [0b0001_0000, 0b0000_0000, 0b0000_0000, 0b0000_0001]
// Uint8Array(4)[ 16, 0, 0, 1 ]

function dec2uint8array(n) {
  const arr = dec2bin(n).match(/.{1,8}/g);
  const bitmap = Uint8Array.from(arr.map(str => bin2dec(str)));
  return bitmap;
}
function uint8array2dec(bitmap) {
  const binArr = [];
  bitmap.forEach(n => binArr.push(dec2bin(n).slice(-8)));
  return bin2dec(binArr.join(''));
} // index from left to right

function setBit(n, idx) {
  if (idx > 31 || idx < 0) {
    throw new Error(`mask: invalid idx at ${idx}, should be between 0 and 31`);
  }

  const mask = 1 << 32 - idx - 1;
  return n | mask;
} // index from left to right

function isSetBit(n, idx) {
  if (idx > 31 || idx < 0) {
    throw new Error(`mask: invalid idx at ${idx}, should be between 0 and 31`);
  } // const mask = 1 << (32 - idx - 1)
  // let isSet = false
  // if ((n & mask) !== 0) {
  //   isSet = true
  // }
  // return isSet


  return (n >> 32 - idx - 1) % 2 !== 0;
}

var helper = {
  __proto__: null,
  dec2bin: dec2bin,
  bin2dec: bin2dec,
  dec2uint8array: dec2uint8array,
  uint8array2dec: uint8array2dec,
  setBit: setBit,
  isSetBit: isSetBit
};

const CryptoMaterialError = {
  SerializationError: 'Struct to be signed does not serialize correctly',
  DeserializationError: 'Key or signature material does not deserialize correctly',
  ValidationError: 'Key or signature material deserializes, but is otherwise not valid',
  WrongLengthError: 'Key, threshold or signature material does not have the expected size',
  CanonicalRepresentationError: 'Part of the signature or key is not canonical resulting to malleability issues',
  SmallSubgroupError: 'A curve point (i.e., a public key) lies on a small group',
  PointNotOnCurveError: 'A curve point (i.e., a public key) does not satisfy the curve equation',
  BitVecError: 'BitVec errors in accountable multi-sig schemes'
};
const MAX_NUM_OF_KEYS = 32;
class AccessPath {
  constructor(field0, field1) {
    this.field0 = field0;
    this.field1 = field1;
  }

  serialize(serializer) {
    this.field0.serialize(serializer);
    this.field1.serialize(serializer);
  }

  static deserialize(deserializer) {
    const field0 = AccountAddress.deserialize(deserializer);
    const field1 = DataPath.deserialize(deserializer);
    return new AccessPath(field0, field1);
  }

}
class AccountAddress {
  constructor(value) {
    this.value = value;
  }

  serialize(serializer) {
    Helpers.serializeArray16U8Array(this.value, serializer);
  }

  static deserialize(deserializer) {
    const value = Helpers.deserializeArray16U8Array(deserializer);
    return new AccountAddress(value);
  }

}
AccountAddress.LENGTH = 16;
class AccountResource {
  constructor(authentication_key, withdrawal_capability, key_rotation_capability, withdraw_events, deposit_events, accept_token_events, sequence_number) {
    this.authentication_key = authentication_key;
    this.withdrawal_capability = withdrawal_capability;
    this.key_rotation_capability = key_rotation_capability;
    this.withdraw_events = withdraw_events;
    this.deposit_events = deposit_events;
    this.accept_token_events = accept_token_events;
    this.sequence_number = sequence_number;
  }

  serialize(serializer) {
    Helpers.serializeVectorU8(this.authentication_key, serializer);
    Helpers.serializeOptionWithdrawCapabilityResource(this.withdrawal_capability, serializer);
    Helpers.serializeOptionKeyRotationCapabilityResource(this.key_rotation_capability, serializer);
    this.withdraw_events.serialize(serializer);
    this.deposit_events.serialize(serializer);
    this.accept_token_events.serialize(serializer);
    serializer.serializeU64(this.sequence_number);
  }

  static deserialize(deserializer) {
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
class ArgumentABI {
  constructor(name, type_tag) {
    this.name = name;
    this.type_tag = type_tag;
  }

  serialize(serializer) {
    serializer.serializeStr(this.name);
    this.type_tag.serialize(serializer);
  }

  static deserialize(deserializer) {
    const name = deserializer.deserializeStr();
    const type_tag = TypeTag.deserialize(deserializer);
    return new ArgumentABI(name, type_tag);
  }

}
class AuthenticationKey {
  constructor(value) {
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer) {
    const value = deserializer.deserializeBytes();
    return new AuthenticationKey(value);
  }

}
class BlockMetadata {
  constructor(parent_hash, timestamp, author, author_auth_key, uncles, number, chain_id, parent_gas_used) {
    this.parent_hash = parent_hash;
    this.timestamp = timestamp;
    this.author = author;
    this.author_auth_key = author_auth_key;
    this.uncles = uncles;
    this.number = number;
    this.chain_id = chain_id;
    this.parent_gas_used = parent_gas_used;
  }

  serialize(serializer) {
    this.parent_hash.serialize(serializer);
    serializer.serializeU64(this.timestamp);
    this.author.serialize(serializer);
    Helpers.serializeOptionAuthenticationKey(this.author_auth_key, serializer);
    serializer.serializeU64(this.uncles);
    serializer.serializeU64(this.number);
    this.chain_id.serialize(serializer);
    serializer.serializeU64(this.parent_gas_used);
  }

  static deserialize(deserializer) {
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
class ChainId {
  constructor(id) {
    this.id = id;
  }

  serialize(serializer) {
    serializer.serializeU8(this.id);
  }

  static deserialize(deserializer) {
    const id = deserializer.deserializeU8();
    return new ChainId(id);
  }

}
class ContractEvent {
  static deserialize(deserializer) {
    const index = deserializer.deserializeVariantIndex();

    switch (index) {
      case 0:
        return ContractEventVariantV0.load(deserializer);

      default:
        throw new Error("Unknown variant index for ContractEvent: " + index);
    }
  }

}
class ContractEventVariantV0 extends ContractEvent {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  }

  static load(deserializer) {
    const value = ContractEventV0.deserialize(deserializer);
    return new ContractEventVariantV0(value);
  }

}
class ContractEventV0 {
  constructor(key, sequence_number, type_tag, event_data) {
    this.key = key;
    this.sequence_number = sequence_number;
    this.type_tag = type_tag;
    this.event_data = event_data;
  }

  serialize(serializer) {
    this.key.serialize(serializer);
    serializer.serializeU64(this.sequence_number);
    this.type_tag.serialize(serializer);
    serializer.serializeBytes(this.event_data);
  }

  static deserialize(deserializer) {
    const key = EventKey.deserialize(deserializer);
    const sequence_number = deserializer.deserializeU64();
    const type_tag = TypeTag.deserialize(deserializer);
    const event_data = deserializer.deserializeBytes();
    return new ContractEventV0(key, sequence_number, type_tag, event_data);
  }

}
class DataPath {
  static deserialize(deserializer) {
    const index = deserializer.deserializeVariantIndex();

    switch (index) {
      case 0:
        return DataPathVariantCode.load(deserializer);

      case 1:
        return DataPathVariantResource.load(deserializer);

      default:
        throw new Error("Unknown variant index for DataPath: " + index);
    }
  }

}
class DataPathVariantCode extends DataPath {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  }

  static load(deserializer) {
    const value = Identifier.deserialize(deserializer);
    return new DataPathVariantCode(value);
  }

}
class DataPathVariantResource extends DataPath {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(1);
    this.value.serialize(serializer);
  }

  static load(deserializer) {
    const value = StructTag.deserialize(deserializer);
    return new DataPathVariantResource(value);
  }

}
class DataType {
  static deserialize(deserializer) {
    const index = deserializer.deserializeVariantIndex();

    switch (index) {
      case 0:
        return DataTypeVariantCODE.load(deserializer);

      case 1:
        return DataTypeVariantRESOURCE.load(deserializer);

      default:
        throw new Error("Unknown variant index for DataType: " + index);
    }
  }

}
class DataTypeVariantCODE extends DataType {
  constructor() {
    super();
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(0);
  }

  static load(deserializer) {
    return new DataTypeVariantCODE();
  }

}
class DataTypeVariantRESOURCE extends DataType {
  constructor() {
    super();
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(1);
  }

  static load(deserializer) {
    return new DataTypeVariantRESOURCE();
  }

}
class Ed25519PrivateKey {
  constructor(value) {
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer) {
    const value = deserializer.deserializeBytes();
    return new Ed25519PrivateKey(value);
  }

}
class Ed25519PublicKey {
  constructor(value) {
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer) {
    const value = deserializer.deserializeBytes();
    return new Ed25519PublicKey(value);
  }

}
class Ed25519Signature {
  constructor(value) {
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer) {
    const value = deserializer.deserializeBytes();
    return new Ed25519Signature(value);
  }

}
class EventHandle {
  constructor(count, key) {
    this.count = count;
    this.key = key;
  }

  serialize(serializer) {
    serializer.serializeU64(this.count);
    this.key.serialize(serializer);
  }

  static deserialize(deserializer) {
    const count = deserializer.deserializeU64();
    const key = EventKey.deserialize(deserializer);
    return new EventHandle(count, key);
  }

}
class EventKey {
  constructor(value) {
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer) {
    const value = deserializer.deserializeBytes();
    return new EventKey(value);
  }

}
class HashValue {
  constructor(value) {
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer) {
    const value = deserializer.deserializeBytes();
    return new HashValue(value);
  }

}
class Identifier {
  constructor(value) {
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeStr(this.value);
  }

  static deserialize(deserializer) {
    const value = deserializer.deserializeStr();
    return new Identifier(value);
  }

}
class KeyRotationCapabilityResource {
  constructor(account_address) {
    this.account_address = account_address;
  }

  serialize(serializer) {
    this.account_address.serialize(serializer);
  }

  static deserialize(deserializer) {
    const account_address = AccountAddress.deserialize(deserializer);
    return new KeyRotationCapabilityResource(account_address);
  }

}
class Module {
  constructor(code) {
    this.code = code;
  }

  serialize(serializer) {
    serializer.serializeBytes(this.code);
  }

  static deserialize(deserializer) {
    const code = deserializer.deserializeBytes();
    return new Module(code);
  }

}
class ModuleId {
  constructor(address, name) {
    this.address = address;
    this.name = name;
  }

  serialize(serializer) {
    this.address.serialize(serializer);
    this.name.serialize(serializer);
  }

  static deserialize(deserializer) {
    const address = AccountAddress.deserialize(deserializer);
    const name = Identifier.deserialize(deserializer);
    return new ModuleId(address, name);
  }

}
class MultiEd25519PrivateKey {
  constructor(value) {
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer) {
    const value = deserializer.deserializeBytes();
    return new MultiEd25519PrivateKey(value);
  }

}
class MultiEd25519PublicKey {
  constructor(public_keys, threshold) {
    this.public_keys = public_keys;
    this.threshold = threshold;
    const num_of_public_keys = public_keys.length;

    if (threshold === 0 || num_of_public_keys < threshold) {
      throw new Error(CryptoMaterialError.ValidationError);
    } else if (num_of_public_keys > MAX_NUM_OF_KEYS) {
      throw new Error(CryptoMaterialError.WrongLengthError);
    }
  }

  serialize(serializer) {
    serializer.serializeBytes(this.value());
  }

  static deserialize(deserializer) {
    const bytes = deserializer.deserializeBytes();
    const public_keys = [];
    const count = (bytes.length - 1) / 32;

    for (let i = 0; i < count; i++) {
      const start = i * 32;
      const end = start + 32;
      public_keys.push(new Ed25519PublicKey(bytes.slice(start, end)));
    }

    const threshold = new DataView(bytes.slice(-1).buffer, 0).getUint8(0);
    return new MultiEd25519PublicKey(public_keys, threshold);
  }

  value() {
    const arrPub = [];
    this.public_keys.forEach(pub => {
      arrPub.push(pub.value);
    });
    const arrThreshold = new Uint8Array(1);
    arrThreshold[0] = this.threshold;
    const bytes = concat([...arrPub, ...arrThreshold]);
    return bytes;
  }

}
class MultiEd25519Signature {
  // 0b00010000000000000000000000000001(268435457), the 3rd and 31st positions are set.
  constructor(signatures, bitmap) {
    this.signatures = signatures;
    this.bitmap = bitmap;
  }

  static build(origin_signatures) {
    const num_of_sigs = origin_signatures.length;

    if (num_of_sigs === 0 || num_of_sigs > MAX_NUM_OF_KEYS) {
      throw new Error(CryptoMaterialError.ValidationError);
    }

    const sorted_signatures = origin_signatures.sort((a, b) => {
      return a[1] > b[1] ? 1 : -1;
    });
    const sigs = [];
    let bitmap = 0b00000000000000000000000000000000;
    sorted_signatures.forEach((k, v) => {
      console.log(k, v);

      if (k[1] >= MAX_NUM_OF_KEYS) {
        throw new Error(`${CryptoMaterialError.BitVecError}: Signature index is out of range`);
      } else if (isSetBit(bitmap, k[1])) {
        throw new Error(`${CryptoMaterialError.BitVecError}: Duplicate signature index`);
      } else {
        sigs.push(k[0]);
        bitmap = setBit(bitmap, k[1]);
      }
    });
    return new MultiEd25519Signature(sigs, bitmap);
  }

  serialize(serializer) {
    serializer.serializeBytes(this.value());
  }

  static deserialize(deserializer) {
    const bytes = deserializer.deserializeBytes();
    const signatures = [];
    const count = (bytes.length - 4) / 64;

    for (let i = 0; i < count; i++) {
      const start = i * 64;
      const end = start + 64;
      signatures.push(new Ed25519Signature(bytes.slice(start, end)));
    }

    const bitmap = uint8array2dec(bytes.slice(-4));
    return new MultiEd25519Signature(signatures, bitmap);
  }

  value() {
    const arrSignatures = [];
    this.signatures.forEach(signature => {
      arrSignatures.push(signature.value);
    });
    const arrBitmap = dec2uint8array(this.bitmap);
    const bytes = concat([...arrSignatures, ...arrBitmap]);
    return bytes;
  }

}
class MultiEd25519SignatureShard {
  constructor(signature, threshold) {
    this.signature = signature;
    this.threshold = threshold;
  }

  signatures() {
    const signatures = this.signature.signatures;
    const bitmap = this.signature.bitmap;
    const result = [];
    let bitmap_index = 0;
    signatures.forEach((v, idx) => {
      while (!isSetBit(bitmap, bitmap_index)) {
        bitmap_index += 1;
      }

      result.push([v, bitmap_index]);
      bitmap_index += 1;
    });
    return result;
  }

  static merge(shards) {
    if (shards.length === 0) {
      throw new Error('MultiEd25519SignatureShard shards is empty');
    }

    const threshold = shards[0].threshold;
    const signatures = [];
    shards.forEach(shard => {
      if (shard.threshold !== threshold) {
        throw new Error('MultiEd25519SignatureShard shards threshold not same');
      }

      signatures.push(...shard.signatures());
    });
    return new MultiEd25519SignatureShard(MultiEd25519Signature.build(signatures), threshold);
  }

  is_enough() {
    return this.signature.signatures.length >= this.threshold;
  }

} // Part of private keys in the multi-key Ed25519 structure along with the threshold.
// note: the private keys must be a sequential part of the MultiEd25519PrivateKey

class MultiEd25519KeyShard {
  constructor(public_keys, threshold, private_keys) {
    this.public_keys = public_keys;
    this.threshold = threshold;
    this.private_keys = private_keys;
    const num_of_public_keys = public_keys.length;
    const num_of_private_keys = Object.keys(private_keys).length;

    if (threshold === 0 || num_of_private_keys === 0 || num_of_public_keys < threshold) {
      throw new Error(CryptoMaterialError.ValidationError);
    } else if (num_of_private_keys > MAX_NUM_OF_KEYS || num_of_public_keys > MAX_NUM_OF_KEYS) {
      throw new Error(CryptoMaterialError.WrongLengthError);
    }
  }

  serialize(serializer) {
    serializer.serializeU8(this.public_keys.length);
    serializer.serializeU8(this.threshold);
    serializer.serializeU8(this.len());
    this.public_keys.forEach(pub => {
      pub.serialize(serializer);
    });
    Object.keys(this.private_keys).forEach(pos => {
      serializer.serializeU8(Number.parseInt(pos, 10));
      this.private_keys[pos].serialize(serializer);
    });
  }

  static deserialize(deserializer) {
    const publicKeysLen = deserializer.deserializeU8();
    const threshold = deserializer.deserializeU8();
    const privateKeysLen = deserializer.deserializeU8();
    const public_keys = [];

    for (let i = 0; i < publicKeysLen; i++) {
      public_keys.push(Ed25519PublicKey.deserialize(deserializer));
    }

    const private_keys = [];

    for (let i = 0; i < privateKeysLen; i++) {
      const pos = deserializer.deserializeU8();
      const privateKey = Ed25519PrivateKey.deserialize(deserializer);
      public_keys[pos] = privateKey;
    }

    return new MultiEd25519KeyShard(public_keys, threshold, private_keys);
  }

  publicKey() {
    return new MultiEd25519PublicKey(this.public_keys, this.threshold);
  } // should be different for each account, since the private_keys are not the same


  privateKeys() {
    return Object.values(this.private_keys);
  } // should be different for each account, since the private_keys are not the same


  privateKey() {
    const arrHead = new Uint8Array(3);
    arrHead[0] = this.public_keys.length;
    arrHead[1] = this.threshold;
    arrHead[2] = this.len();
    const arrPub = [];
    this.public_keys.forEach(pub => {
      arrPub.push(pub.value);
    });
    const arrPriv = [];
    Object.values(this.private_keys).forEach(priv => {
      arrPriv.push(priv.value);
    });
    const bytes = concat([arrHead, ...arrPub, ...arrPriv]);
    return bytes;
  }

  len() {
    return Object.values(this.private_keys).length;
  }

  isEmpty() {
    return this.len() === 0;
  }

}
class Package {
  constructor(package_address, modules, init_script) {
    this.package_address = package_address;
    this.modules = modules;
    this.init_script = init_script;
  }

  serialize(serializer) {
    this.package_address.serialize(serializer);
    Helpers.serializeVectorModule(this.modules, serializer);
    Helpers.serializeOptionScriptFunction(this.init_script, serializer);
  }

  static deserialize(deserializer) {
    const package_address = AccountAddress.deserialize(deserializer);
    const modules = Helpers.deserializeVectorModule(deserializer);
    const init_script = Helpers.deserializeOptionScriptFunction(deserializer);
    return new Package(package_address, modules, init_script);
  }

}
class RawUserTransaction {
  constructor(sender, sequence_number, payload, max_gas_amount, gas_unit_price, gas_token_code, expiration_timestamp_secs, chain_id) {
    this.sender = sender;
    this.sequence_number = sequence_number;
    this.payload = payload;
    this.max_gas_amount = max_gas_amount;
    this.gas_unit_price = gas_unit_price;
    this.gas_token_code = gas_token_code;
    this.expiration_timestamp_secs = expiration_timestamp_secs;
    this.chain_id = chain_id;
  }

  serialize(serializer) {
    this.sender.serialize(serializer);
    serializer.serializeU64(this.sequence_number);
    this.payload.serialize(serializer);
    serializer.serializeU64(this.max_gas_amount);
    serializer.serializeU64(this.gas_unit_price);
    serializer.serializeStr(this.gas_token_code);
    serializer.serializeU64(this.expiration_timestamp_secs);
    this.chain_id.serialize(serializer);
  }

  static deserialize(deserializer) {
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
class Script {
  constructor(code, ty_args, args) {
    this.code = code;
    this.ty_args = ty_args;
    this.args = args;
  }

  serialize(serializer) {
    serializer.serializeBytes(this.code);
    Helpers.serializeVectorTypeTag(this.ty_args, serializer);
    Helpers.serializeVectorBytes(this.args, serializer);
  }

  static deserialize(deserializer) {
    const code = deserializer.deserializeBytes();
    const ty_args = Helpers.deserializeVectorTypeTag(deserializer);
    const args = Helpers.deserializeVectorBytes(deserializer);
    return new Script(code, ty_args, args);
  }

}
class ScriptABI {
  static deserialize(deserializer) {
    const index = deserializer.deserializeVariantIndex();

    switch (index) {
      case 0:
        return ScriptABIVariantTransactionScript.load(deserializer);

      case 1:
        return ScriptABIVariantScriptFunction.load(deserializer);

      default:
        throw new Error("Unknown variant index for ScriptABI: " + index);
    }
  }

}
class ScriptABIVariantTransactionScript extends ScriptABI {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  }

  static load(deserializer) {
    const value = TransactionScriptABI.deserialize(deserializer);
    return new ScriptABIVariantTransactionScript(value);
  }

}
class ScriptABIVariantScriptFunction extends ScriptABI {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(1);
    this.value.serialize(serializer);
  }

  static load(deserializer) {
    const value = ScriptFunctionABI.deserialize(deserializer);
    return new ScriptABIVariantScriptFunction(value);
  }

}
class ScriptFunction {
  // need to rename `function` to `func` as `function` is a keyword in JS.
  constructor(module, func, ty_args, args) {
    this.module = module;
    this.func = func;
    this.ty_args = ty_args;
    this.args = args;
  }

  serialize(serializer) {
    this.module.serialize(serializer);
    this.func.serialize(serializer);
    Helpers.serializeVectorTypeTag(this.ty_args, serializer);
    Helpers.serializeVectorBytes(this.args, serializer);
  }

  static deserialize(deserializer) {
    const module = ModuleId.deserialize(deserializer);
    const func = Identifier.deserialize(deserializer);
    const ty_args = Helpers.deserializeVectorTypeTag(deserializer);
    const args = Helpers.deserializeVectorBytes(deserializer);
    return new ScriptFunction(module, func, ty_args, args);
  }

}
class ScriptFunctionABI {
  constructor(name, module_name, doc, ty_args, args) {
    this.name = name;
    this.module_name = module_name;
    this.doc = doc;
    this.ty_args = ty_args;
    this.args = args;
  }

  serialize(serializer) {
    serializer.serializeStr(this.name);
    this.module_name.serialize(serializer);
    serializer.serializeStr(this.doc);
    Helpers.serializeVectorTypeArgumentAbi(this.ty_args, serializer);
    Helpers.serializeVectorArgumentAbi(this.args, serializer);
  }

  static deserialize(deserializer) {
    const name = deserializer.deserializeStr();
    const module_name = ModuleId.deserialize(deserializer);
    const doc = deserializer.deserializeStr();
    const ty_args = Helpers.deserializeVectorTypeArgumentAbi(deserializer);
    const args = Helpers.deserializeVectorArgumentAbi(deserializer);
    return new ScriptFunctionABI(name, module_name, doc, ty_args, args);
  }

}
class SignedUserTransaction {
  constructor(raw_txn, authenticator) {
    this.raw_txn = raw_txn;
    this.authenticator = authenticator;
  }

  serialize(serializer) {
    this.raw_txn.serialize(serializer);
    this.authenticator.serialize(serializer);
  }

  static deserialize(deserializer) {
    const raw_txn = RawUserTransaction.deserialize(deserializer);
    const authenticator = TransactionAuthenticator.deserialize(deserializer);
    return new SignedUserTransaction(raw_txn, authenticator);
  }

  static ed25519(raw_txn, public_key, signature) {
    const authenticator = new TransactionAuthenticatorVariantEd25519(public_key, signature);
    return new SignedUserTransaction(raw_txn, authenticator);
  }

  static multi_ed25519(raw_txn, public_key, signature) {
    const authenticator = new TransactionAuthenticatorVariantMultiEd25519(public_key, signature);
    return new SignedUserTransaction(raw_txn, authenticator);
  }

}
class StructTag {
  constructor(address, module, name, type_params) {
    this.address = address;
    this.module = module;
    this.name = name;
    this.type_params = type_params;
  }

  serialize(serializer) {
    this.address.serialize(serializer);
    this.module.serialize(serializer);
    this.name.serialize(serializer);
    Helpers.serializeVectorTypeTag(this.type_params, serializer);
  }

  static deserialize(deserializer) {
    const address = AccountAddress.deserialize(deserializer);
    const module = Identifier.deserialize(deserializer);
    const name = Identifier.deserialize(deserializer);
    const type_params = Helpers.deserializeVectorTypeTag(deserializer);
    return new StructTag(address, module, name, type_params);
  }

}
class Transaction {
  static deserialize(deserializer) {
    const index = deserializer.deserializeVariantIndex();

    switch (index) {
      case 0:
        return TransactionVariantUserTransaction.load(deserializer);

      case 1:
        return TransactionVariantBlockMetadata.load(deserializer);

      default:
        throw new Error("Unknown variant index for Transaction: " + index);
    }
  }

}
class TransactionVariantUserTransaction extends Transaction {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  }

  static load(deserializer) {
    const value = SignedUserTransaction.deserialize(deserializer);
    return new TransactionVariantUserTransaction(value);
  }

}
class TransactionVariantBlockMetadata extends Transaction {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(1);
    this.value.serialize(serializer);
  }

  static load(deserializer) {
    const value = BlockMetadata.deserialize(deserializer);
    return new TransactionVariantBlockMetadata(value);
  }

}
class TransactionArgument {
  static deserialize(deserializer) {
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
        throw new Error("Unknown variant index for TransactionArgument: " + index);
    }
  }

}
class TransactionArgumentVariantU8 extends TransactionArgument {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(0);
    serializer.serializeU8(this.value);
  }

  static load(deserializer) {
    const value = deserializer.deserializeU8();
    return new TransactionArgumentVariantU8(value);
  }

}
class TransactionArgumentVariantU64 extends TransactionArgument {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(1);
    serializer.serializeU64(this.value);
  }

  static load(deserializer) {
    const value = deserializer.deserializeU64();
    return new TransactionArgumentVariantU64(value);
  }

}
class TransactionArgumentVariantU128 extends TransactionArgument {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(2);
    serializer.serializeU128(this.value);
  }

  static load(deserializer) {
    const value = deserializer.deserializeU128();
    return new TransactionArgumentVariantU128(value);
  }

}
class TransactionArgumentVariantAddress extends TransactionArgument {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(3);
    this.value.serialize(serializer);
  }

  static load(deserializer) {
    const value = AccountAddress.deserialize(deserializer);
    return new TransactionArgumentVariantAddress(value);
  }

}
class TransactionArgumentVariantU8Vector extends TransactionArgument {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(4);
    serializer.serializeBytes(this.value);
  }

  static load(deserializer) {
    const value = deserializer.deserializeBytes();
    return new TransactionArgumentVariantU8Vector(value);
  }

}
class TransactionArgumentVariantBool extends TransactionArgument {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(5);
    serializer.serializeBool(this.value);
  }

  static load(deserializer) {
    const value = deserializer.deserializeBool();
    return new TransactionArgumentVariantBool(value);
  }

}
class TransactionAuthenticator {
  static deserialize(deserializer) {
    const index = deserializer.deserializeVariantIndex();

    switch (index) {
      case 0:
        return TransactionAuthenticatorVariantEd25519.load(deserializer);

      case 1:
        return TransactionAuthenticatorVariantMultiEd25519.load(deserializer);

      default:
        throw new Error("Unknown variant index for TransactionAuthenticator: " + index);
    }
  }

}
class TransactionAuthenticatorVariantEd25519 extends TransactionAuthenticator {
  constructor(public_key, signature) {
    super();
    this.public_key = public_key;
    this.signature = signature;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(0);
    this.public_key.serialize(serializer);
    this.signature.serialize(serializer);
  }

  static load(deserializer) {
    const public_key = Ed25519PublicKey.deserialize(deserializer);
    const signature = Ed25519Signature.deserialize(deserializer);
    return new TransactionAuthenticatorVariantEd25519(public_key, signature);
  }

}
class TransactionAuthenticatorVariantMultiEd25519 extends TransactionAuthenticator {
  constructor(public_key, signature) {
    super();
    this.public_key = public_key;
    this.signature = signature;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(1);
    this.public_key.serialize(serializer);
    this.signature.serialize(serializer);
  }

  static load(deserializer) {
    const public_key = MultiEd25519PublicKey.deserialize(deserializer);
    const signature = MultiEd25519Signature.deserialize(deserializer);
    return new TransactionAuthenticatorVariantMultiEd25519(public_key, signature);
  }

}
class TransactionPayload {
  static deserialize(deserializer) {
    const index = deserializer.deserializeVariantIndex();

    switch (index) {
      case 0:
        return TransactionPayloadVariantScript.load(deserializer);

      case 1:
        return TransactionPayloadVariantPackage.load(deserializer);

      case 2:
        return TransactionPayloadVariantScriptFunction.load(deserializer);

      default:
        throw new Error("Unknown variant index for TransactionPayload: " + index);
    }
  }

}
class TransactionPayloadVariantScript extends TransactionPayload {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  }

  static load(deserializer) {
    const value = Script.deserialize(deserializer);
    return new TransactionPayloadVariantScript(value);
  }

}
class TransactionPayloadVariantPackage extends TransactionPayload {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(1);
    this.value.serialize(serializer);
  }

  static load(deserializer) {
    const value = Package.deserialize(deserializer);
    return new TransactionPayloadVariantPackage(value);
  }

}
class TransactionPayloadVariantScriptFunction extends TransactionPayload {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(2);
    this.value.serialize(serializer);
  }

  static load(deserializer) {
    const value = ScriptFunction.deserialize(deserializer);
    return new TransactionPayloadVariantScriptFunction(value);
  }

}
class TransactionScriptABI {
  constructor(name, doc, code, ty_args, args) {
    this.name = name;
    this.doc = doc;
    this.code = code;
    this.ty_args = ty_args;
    this.args = args;
  }

  serialize(serializer) {
    serializer.serializeStr(this.name);
    serializer.serializeStr(this.doc);
    serializer.serializeBytes(this.code);
    Helpers.serializeVectorTypeArgumentAbi(this.ty_args, serializer);
    Helpers.serializeVectorArgumentAbi(this.args, serializer);
  }

  static deserialize(deserializer) {
    const name = deserializer.deserializeStr();
    const doc = deserializer.deserializeStr();
    const code = deserializer.deserializeBytes();
    const ty_args = Helpers.deserializeVectorTypeArgumentAbi(deserializer);
    const args = Helpers.deserializeVectorArgumentAbi(deserializer);
    return new TransactionScriptABI(name, doc, code, ty_args, args);
  }

}
class TypeArgumentABI {
  constructor(name) {
    this.name = name;
  }

  serialize(serializer) {
    serializer.serializeStr(this.name);
  }

  static deserialize(deserializer) {
    const name = deserializer.deserializeStr();
    return new TypeArgumentABI(name);
  }

}
class TypeTag {
  static deserialize(deserializer) {
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
        throw new Error("Unknown variant index for TypeTag: " + index);
    }
  }

}
class TypeTagVariantBool extends TypeTag {
  constructor() {
    super();
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(0);
  }

  static load(deserializer) {
    return new TypeTagVariantBool();
  }

}
class TypeTagVariantU8 extends TypeTag {
  constructor() {
    super();
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(1);
  }

  static load(deserializer) {
    return new TypeTagVariantU8();
  }

}
class TypeTagVariantU64 extends TypeTag {
  constructor() {
    super();
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(2);
  }

  static load(deserializer) {
    return new TypeTagVariantU64();
  }

}
class TypeTagVariantU128 extends TypeTag {
  constructor() {
    super();
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(3);
  }

  static load(deserializer) {
    return new TypeTagVariantU128();
  }

}
class TypeTagVariantAddress extends TypeTag {
  constructor() {
    super();
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(4);
  }

  static load(deserializer) {
    return new TypeTagVariantAddress();
  }

}
class TypeTagVariantSigner extends TypeTag {
  constructor() {
    super();
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(5);
  }

  static load(deserializer) {
    return new TypeTagVariantSigner();
  }

}
class TypeTagVariantVector extends TypeTag {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(6);
    this.value.serialize(serializer);
  }

  static load(deserializer) {
    const value = TypeTag.deserialize(deserializer);
    return new TypeTagVariantVector(value);
  }

}
class TypeTagVariantStruct extends TypeTag {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(7);
    this.value.serialize(serializer);
  }

  static load(deserializer) {
    const value = StructTag.deserialize(deserializer);
    return new TypeTagVariantStruct(value);
  }

}
class WithdrawCapabilityResource {
  constructor(account_address) {
    this.account_address = account_address;
  }

  serialize(serializer) {
    this.account_address.serialize(serializer);
  }

  static deserialize(deserializer) {
    const account_address = AccountAddress.deserialize(deserializer);
    return new WithdrawCapabilityResource(account_address);
  }

}
class WriteOp {
  static deserialize(deserializer) {
    const index = deserializer.deserializeVariantIndex();

    switch (index) {
      case 0:
        return WriteOpVariantDeletion.load(deserializer);

      case 1:
        return WriteOpVariantValue.load(deserializer);

      default:
        throw new Error("Unknown variant index for WriteOp: " + index);
    }
  }

}
class WriteOpVariantDeletion extends WriteOp {
  constructor() {
    super();
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(0);
  }

  static load(deserializer) {
    return new WriteOpVariantDeletion();
  }

}
class WriteOpVariantValue extends WriteOp {
  constructor(value) {
    super();
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeVariantIndex(1);
    serializer.serializeBytes(this.value);
  }

  static load(deserializer) {
    const value = deserializer.deserializeBytes();
    return new WriteOpVariantValue(value);
  }

}
class WriteSet {
  constructor(value) {
    this.value = value;
  }

  serialize(serializer) {
    this.value.serialize(serializer);
  }

  static deserialize(deserializer) {
    const value = WriteSetMut.deserialize(deserializer);
    return new WriteSet(value);
  }

}
class WriteSetMut {
  constructor(write_set) {
    this.write_set = write_set;
  }

  serialize(serializer) {
    Helpers.serializeVectorTuple2AccessPathWriteOp(this.write_set, serializer);
  }

  static deserialize(deserializer) {
    const write_set = Helpers.deserializeVectorTuple2AccessPathWriteOp(deserializer);
    return new WriteSetMut(write_set);
  }

}
class Helpers {
  static serializeArray16U8Array(value, serializer) {
    value.forEach(item => {
      serializer.serializeU8(item[0]);
    });
  }

  static deserializeArray16U8Array(deserializer) {
    const list = [];

    for (let i = 0; i < 16; i++) {
      list.push([deserializer.deserializeU8()]);
    }

    return list;
  }

  static serializeOptionAuthenticationKey(value, serializer) {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  }

  static deserializeOptionAuthenticationKey(deserializer) {
    const tag = deserializer.deserializeOptionTag();

    if (!tag) {
      return null;
    } else {
      return AuthenticationKey.deserialize(deserializer);
    }
  }

  static serializeOptionKeyRotationCapabilityResource(value, serializer) {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  }

  static deserializeOptionKeyRotationCapabilityResource(deserializer) {
    const tag = deserializer.deserializeOptionTag();

    if (!tag) {
      return null;
    } else {
      return KeyRotationCapabilityResource.deserialize(deserializer);
    }
  }

  static serializeOptionScriptFunction(value, serializer) {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  }

  static deserializeOptionScriptFunction(deserializer) {
    const tag = deserializer.deserializeOptionTag();

    if (!tag) {
      return null;
    } else {
      return ScriptFunction.deserialize(deserializer);
    }
  }

  static serializeOptionWithdrawCapabilityResource(value, serializer) {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  }

  static deserializeOptionWithdrawCapabilityResource(deserializer) {
    const tag = deserializer.deserializeOptionTag();

    if (!tag) {
      return null;
    } else {
      return WithdrawCapabilityResource.deserialize(deserializer);
    }
  }

  static serializeTuple2AccessPathWriteOp(value, serializer) {
    value[0].serialize(serializer);
    value[1].serialize(serializer);
  }

  static deserializeTuple2AccessPathWriteOp(deserializer) {
    return [AccessPath.deserialize(deserializer), WriteOp.deserialize(deserializer)];
  }

  static serializeVectorArgumentAbi(value, serializer) {
    serializer.serializeLen(value.length);
    value.forEach(item => {
      item.serialize(serializer);
    });
  }

  static deserializeVectorArgumentAbi(deserializer) {
    const length = deserializer.deserializeLen();
    const list = [];

    for (let i = 0; i < length; i++) {
      list.push(ArgumentABI.deserialize(deserializer));
    }

    return list;
  }

  static serializeVectorModule(value, serializer) {
    serializer.serializeLen(value.length);
    value.forEach(item => {
      item.serialize(serializer);
    });
  }

  static deserializeVectorModule(deserializer) {
    const length = deserializer.deserializeLen();
    const list = [];

    for (let i = 0; i < length; i++) {
      list.push(Module.deserialize(deserializer));
    }

    return list;
  }

  static serializeVectorTypeArgumentAbi(value, serializer) {
    serializer.serializeLen(value.length);
    value.forEach(item => {
      item.serialize(serializer);
    });
  }

  static deserializeVectorTypeArgumentAbi(deserializer) {
    const length = deserializer.deserializeLen();
    const list = [];

    for (let i = 0; i < length; i++) {
      list.push(TypeArgumentABI.deserialize(deserializer));
    }

    return list;
  }

  static serializeVectorTypeTag(value, serializer) {
    serializer.serializeLen(value.length);
    value.forEach(item => {
      item.serialize(serializer);
    });
  }

  static deserializeVectorTypeTag(deserializer) {
    const length = deserializer.deserializeLen();
    const list = [];

    for (let i = 0; i < length; i++) {
      list.push(TypeTag.deserialize(deserializer));
    }

    return list;
  }

  static serializeVectorBytes(value, serializer) {
    serializer.serializeLen(value.length);
    value.forEach(item => {
      serializer.serializeBytes(item);
    });
  }

  static deserializeVectorBytes(deserializer) {
    const length = deserializer.deserializeLen();
    const list = [];

    for (let i = 0; i < length; i++) {
      list.push(deserializer.deserializeBytes());
    }

    return list;
  }

  static serializeVectorTuple2AccessPathWriteOp(value, serializer) {
    serializer.serializeLen(value.length);
    value.forEach(item => {
      Helpers.serializeTuple2AccessPathWriteOp(item, serializer);
    });
  }

  static deserializeVectorTuple2AccessPathWriteOp(deserializer) {
    const length = deserializer.deserializeLen();
    const list = [];

    for (let i = 0; i < length; i++) {
      list.push(Helpers.deserializeTuple2AccessPathWriteOp(deserializer));
    }

    return list;
  }

  static serializeVectorU8(value, serializer) {
    serializer.serializeLen(value.length);
    value.forEach(item => {
      serializer.serializeU8(item);
    });
  }

  static deserializeVectorU8(deserializer) {
    const length = deserializer.deserializeLen();
    const list = [];

    for (let i = 0; i < length; i++) {
      list.push(deserializer.deserializeU8());
    }

    return list;
  }

}
class AuthKey {
  constructor(value) {
    this.value = value;
  }

  serialize(serializer) {
    serializer.serializeBytes(this.value);
  }

  hex() {
    return Buffer.from(this.value).toString('hex');
  }

}
/**
 * Receipt Identifier
 * https://github.com/starcoinorg/SIPs/blob/master/sip-21/index.md
 *
 */

class ReceiptIdentifier {
  constructor(accountAddress, authKey) {
    this.accountAddress = accountAddress;
    this.authKey = authKey;
  }

  encode() {
    const VERSION = '1';
    const PREFIX = 'stc';
    const se = new BcsSerializer();
    this.accountAddress.serialize(se);
    const dataBuff = Buffer.concat([Buffer.from(se.getBytes()), Buffer.from(this.authKey.value)]);
    const words = bech32.toWords(dataBuff);
    const wordsPrefixVersion = [Number(VERSION)].concat(words);
    const encodedStr = bech32.encode(PREFIX, wordsPrefixVersion);
    return encodedStr;
  }

  static decode(value) {
    const result = bech32.decode(value);
    const wordsPrefixVersion = result.words; // const versionBytes = wordsPrefixVersion.slice(0, 1)
    // const version = versionBytes.toString()

    const words = wordsPrefixVersion.slice(1);
    const dataBytes = Buffer.from(bech32.fromWords(words));
    const accountAddressBytes = dataBytes.slice(0, AccountAddress.LENGTH);
    const authKeyBytes = dataBytes.slice(AccountAddress.LENGTH);
    const accountAddress = AccountAddress.deserialize(new BcsDeserializer(accountAddressBytes));
    const authKey = new AuthKey(authKeyBytes);
    return new ReceiptIdentifier(accountAddress, authKey);
  }

}
class SigningMessage {
  constructor(message) {
    this.message = message;
  }

  serialize(serializer) {
    serializer.serializeBytes(this.message);
  }

  static deserialize(deserializer) {
    const message = deserializer.deserializeBytes();
    return new SigningMessage(message);
  }

}
class SignedMessage {
  constructor(account, message, authenticator, chain_id) {
    this.account = account;
    this.message = message;
    this.authenticator = authenticator;
    this.chain_id = chain_id;
  }

  serialize(serializer) {
    this.account.serialize(serializer);
    this.message.serialize(serializer);
    this.authenticator.serialize(serializer);
    this.chain_id.serialize(serializer);
  }

  static deserialize(deserializer) {
    const account = AccountAddress.deserialize(deserializer);
    const message = SigningMessage.deserialize(deserializer);
    const authenticator = TransactionAuthenticator.deserialize(deserializer);
    const chain_id = ChainId.deserialize(deserializer);
    return new SignedMessage(account, message, authenticator, chain_id);
  }

}

var index$2 = {
  __proto__: null,
  AccessPath: AccessPath,
  AccountAddress: AccountAddress,
  AccountResource: AccountResource,
  ArgumentABI: ArgumentABI,
  AuthenticationKey: AuthenticationKey,
  BlockMetadata: BlockMetadata,
  ChainId: ChainId,
  ContractEvent: ContractEvent,
  ContractEventVariantV0: ContractEventVariantV0,
  ContractEventV0: ContractEventV0,
  DataPath: DataPath,
  DataPathVariantCode: DataPathVariantCode,
  DataPathVariantResource: DataPathVariantResource,
  DataType: DataType,
  DataTypeVariantCODE: DataTypeVariantCODE,
  DataTypeVariantRESOURCE: DataTypeVariantRESOURCE,
  Ed25519PrivateKey: Ed25519PrivateKey,
  Ed25519PublicKey: Ed25519PublicKey,
  Ed25519Signature: Ed25519Signature,
  EventHandle: EventHandle,
  EventKey: EventKey,
  HashValue: HashValue,
  Identifier: Identifier,
  KeyRotationCapabilityResource: KeyRotationCapabilityResource,
  Module: Module,
  ModuleId: ModuleId,
  MultiEd25519PrivateKey: MultiEd25519PrivateKey,
  MultiEd25519PublicKey: MultiEd25519PublicKey,
  MultiEd25519Signature: MultiEd25519Signature,
  MultiEd25519SignatureShard: MultiEd25519SignatureShard,
  MultiEd25519KeyShard: MultiEd25519KeyShard,
  Package: Package,
  RawUserTransaction: RawUserTransaction,
  Script: Script,
  ScriptABI: ScriptABI,
  ScriptABIVariantTransactionScript: ScriptABIVariantTransactionScript,
  ScriptABIVariantScriptFunction: ScriptABIVariantScriptFunction,
  ScriptFunction: ScriptFunction,
  ScriptFunctionABI: ScriptFunctionABI,
  SignedUserTransaction: SignedUserTransaction,
  StructTag: StructTag,
  Transaction: Transaction,
  TransactionVariantUserTransaction: TransactionVariantUserTransaction,
  TransactionVariantBlockMetadata: TransactionVariantBlockMetadata,
  TransactionArgument: TransactionArgument,
  TransactionArgumentVariantU8: TransactionArgumentVariantU8,
  TransactionArgumentVariantU64: TransactionArgumentVariantU64,
  TransactionArgumentVariantU128: TransactionArgumentVariantU128,
  TransactionArgumentVariantAddress: TransactionArgumentVariantAddress,
  TransactionArgumentVariantU8Vector: TransactionArgumentVariantU8Vector,
  TransactionArgumentVariantBool: TransactionArgumentVariantBool,
  TransactionAuthenticator: TransactionAuthenticator,
  TransactionAuthenticatorVariantEd25519: TransactionAuthenticatorVariantEd25519,
  TransactionAuthenticatorVariantMultiEd25519: TransactionAuthenticatorVariantMultiEd25519,
  TransactionPayload: TransactionPayload,
  TransactionPayloadVariantScript: TransactionPayloadVariantScript,
  TransactionPayloadVariantPackage: TransactionPayloadVariantPackage,
  TransactionPayloadVariantScriptFunction: TransactionPayloadVariantScriptFunction,
  TransactionScriptABI: TransactionScriptABI,
  TypeArgumentABI: TypeArgumentABI,
  TypeTag: TypeTag,
  TypeTagVariantBool: TypeTagVariantBool,
  TypeTagVariantU8: TypeTagVariantU8,
  TypeTagVariantU64: TypeTagVariantU64,
  TypeTagVariantU128: TypeTagVariantU128,
  TypeTagVariantAddress: TypeTagVariantAddress,
  TypeTagVariantSigner: TypeTagVariantSigner,
  TypeTagVariantVector: TypeTagVariantVector,
  TypeTagVariantStruct: TypeTagVariantStruct,
  WithdrawCapabilityResource: WithdrawCapabilityResource,
  WriteOp: WriteOp,
  WriteOpVariantDeletion: WriteOpVariantDeletion,
  WriteOpVariantValue: WriteOpVariantValue,
  WriteSet: WriteSet,
  WriteSetMut: WriteSetMut,
  Helpers: Helpers,
  AuthKey: AuthKey,
  ReceiptIdentifier: ReceiptIdentifier,
  SigningMessage: SigningMessage,
  SignedMessage: SignedMessage
};

const Buffer$1 = require('safe-buffer').Buffer;

const sha3_256 = require('js-sha3').sha3_256;

const STARCOIN_HASH_PREFIX = 'STARCOIN::';

class DefaultHasher {
  constructor(typename) {
    if (typename) {
      const data = new Uint8Array(Buffer$1.from(STARCOIN_HASH_PREFIX + typename));
      const hasher = sha3_256.create();
      hasher.update(data);
      this.salt = new Uint8Array(hasher.arrayBuffer());
    }
  }

  crypto_hash(data) {
    const hasher = sha3_256.create();

    if (this.salt) {
      hasher.update(this.salt);
    }

    hasher.update(arrayify(data));
    return addHexPrefix(hasher.hex());
  }

  get_salt() {
    return this.salt;
  }

}

function createHash(typename) {
  return new DefaultHasher(typename);
}
function createUserTransactionHasher() {
  return createHash("SignedUserTransaction");
}
function createRawUserTransactionHasher() {
  return createHash("RawUserTransaction");
}
function createSigningMessageHasher() {
  return createHash("SigningMessage");
}

var index$3 = {
  __proto__: null,
  createHash: createHash,
  createUserTransactionHasher: createUserTransactionHasher,
  createRawUserTransactionHasher: createRawUserTransactionHasher,
  createSigningMessageHasher: createSigningMessageHasher
};

function toHexString(byteArray) {
  return '0x' + Buffer.from(new Uint8Array(byteArray)).toString('hex');
}
function fromHexString(hex, padding) {
  if (hex.startsWith('0x')) {
    hex = hex.substring(2);
  }

  if (padding) {
    if (hex.length < padding) {
      hex = padLeft(hex, padding);
    }
  } else {
    if (hex.length % 2 != 0) {
      hex = '0' + hex;
    }
  }

  const buf = Buffer.from(hex, 'hex');
  return new Uint8Array(buf);
}
/**
 * @public
 * Should be called to pad string to expected length
 */

function padLeft(str, chars, sign) {
  return new Array(chars - str.length + 1).join(sign ? sign : '0') + str;
}
/**
 * @public
 * Should be called to pad string to expected length
 */

function padRight(str, chars, sign) {
  return str + new Array(chars - str.length + 1).join(sign ? sign : '0');
}

var hex = {
  __proto__: null,
  toHexString: toHexString,
  fromHexString: fromHexString,
  padLeft: padLeft,
  padRight: padRight
};

function bcsDecode(t, data) {
  const de = new BcsDeserializer(arrayify(data));
  return t.deserialize(de);
}
function bcsEncode(data) {
  const se = new BcsSerializer();
  data.serialize(se);
  return toHexString(se.getBytes());
}
function decodeSignedUserTransaction(data) {
  const bytes = arrayify(data);

  const scsData = function () {
    const de = new BcsDeserializer(bytes);
    return SignedUserTransaction.deserialize(de);
  }();

  let authenticator;

  if (scsData.authenticator instanceof TransactionAuthenticatorVariantEd25519) {
    const publicKey = hexlify(scsData.authenticator.public_key.value);
    const signature = hexlify(scsData.authenticator.signature.value);
    authenticator = {
      Ed25519: {
        public_key: publicKey,
        signature
      }
    };
  } else {
    const auth = scsData.authenticator;
    const publicKey = hexlify(auth.public_key.value());
    const signature = hexlify(auth.signature.value());
    authenticator = {
      MultiEd25519: {
        public_key: publicKey,
        signature
      }
    };
  }

  const rawTxn = scsData.raw_txn;

  const payload = function () {
    const se = new BcsSerializer();
    rawTxn.payload.serialize(se);
    return hexlify(se.getBytes());
  }();

  return {
    transaction_hash: createUserTransactionHasher().crypto_hash(bytes),
    raw_txn: {
      sender: addressFromSCS(rawTxn.sender),
      sequence_number: rawTxn.sequence_number,
      payload,
      max_gas_amount: rawTxn.max_gas_amount,
      gas_unit_price: rawTxn.gas_unit_price,
      gas_token_code: rawTxn.gas_token_code,
      expiration_timestamp_secs: rawTxn.expiration_timestamp_secs,
      chain_id: rawTxn.chain_id.id
    },
    authenticator
  };
} /// Decode a hex view or raw bytes of TransactionPayload into js struct.

function decodeTransactionPayload(payload) {
  const bytes = arrayify(payload);
  const de = new BcsDeserializer(bytes);
  const bcsTxnPayload = TransactionPayload.deserialize(de);

  if (bcsTxnPayload instanceof TransactionPayloadVariantScript) {
    const script = bcsTxnPayload.value;
    return {
      Script: {
        code: toHexString(script.code),
        ty_args: script.ty_args.map(t => typeTagFromSCS(t)),
        args: script.args.map(arg => hexlify(arg))
      }
    };
  }

  if (bcsTxnPayload instanceof TransactionPayloadVariantScriptFunction) {
    let scriptFunction = bcsTxnPayload.value;
    return {
      ScriptFunction: {
        func: {
          address: addressFromSCS(scriptFunction.module.address),
          module: scriptFunction.module.name.value,
          functionName: scriptFunction.func.value
        },
        ty_args: scriptFunction.ty_args.map(t => typeTagFromSCS(t)),
        args: scriptFunction.args.map(arg => hexlify(arg))
      }
    };
  } // NOTE: VM2 EntryFunction is BCS-compatible with ScriptFunction (same variant index 2).
  // Use decodeTransactionPayloadVM2() if you need the result keyed as 'EntryFunction'.


  if (bcsTxnPayload instanceof TransactionPayloadVariantPackage) {
    const packagePayload = bcsTxnPayload.value;
    return {
      Package: {
        package_address: addressFromSCS(packagePayload.package_address),
        modules: packagePayload.modules.map(m => ({
          code: toHexString(m.code)
        })),
        init_script: packagePayload.init_script === null ? undefined : {
          func: {
            address: addressFromSCS(packagePayload.init_script.module.address),
            module: packagePayload.init_script.module.name.value,
            functionName: packagePayload.init_script.func.value
          },
          args: packagePayload.init_script.args.map(arg => hexlify(arg)),
          ty_args: packagePayload.init_script.ty_args.map(ty => typeTagFromSCS(ty))
        }
      }
    };
  }

  throw new TypeError(`cannot decode bcs data ${bcsTxnPayload}`);
}
function packageHexToTransactionPayload(packageHex) {
  const deserializer = new BcsDeserializer(arrayify(addHexPrefix(packageHex)));
  const transactionPayload = TransactionPayloadVariantPackage.load(deserializer);
  return transactionPayload;
}
function packageHexToTransactionPayloadHex(packageHex) {
  const transactionPayload = packageHexToTransactionPayload(packageHex);
  return bcsEncode(transactionPayload);
}
function addressToSCS(addr) {
  // AccountAddress should be 16 bytes, in hex, it's 16 * 2.
  const bytes = fromHexString(addr, 16 * 2);
  return AccountAddress.deserialize(new BcsDeserializer(bytes));
}
function addressFromSCS(addr) {
  return toHexString(addr.value.map(([t]) => t));
}
function typeTagToSCS(ty) {
  if (ty === 'Bool') {
    return new TypeTagVariantBool();
  }

  if (ty === 'U8') {
    return new TypeTagVariantU8();
  }

  if (ty === 'U128') {
    return new TypeTagVariantU128();
  }

  if (ty === 'U64') {
    return new TypeTagVariantU64();
  }

  if (ty === 'Address') {
    return new TypeTagVariantAddress();
  }

  if (ty === 'Signer') {
    return new TypeTagVariantSigner();
  }

  if ('Vector' in ty) {
    return new TypeTagVariantVector(typeTagToSCS(ty.Vector));
  }

  if ('Struct' in ty) {
    return new TypeTagVariantStruct(structTagToSCS(ty.Struct));
  }

  throw new Error(`invalid type tag: ${ty}`);
}
function structTagToSCS(data) {
  return new StructTag(addressToSCS(data.address), new Identifier(data.module), new Identifier(data.name), data.type_params ? data.type_params.map(t => typeTagToSCS(t)) : []);
}
function structTagFromSCS(bcs_data) {
  return {
    module: bcs_data.module.value,
    name: bcs_data.name.value,
    type_params: bcs_data.type_params.map(t => typeTagFromSCS(t)),
    address: addressFromSCS(bcs_data.address)
  };
} // eslint-disable-next-line consistent-return

function typeTagFromSCS(bcs_data) {
  if (bcs_data instanceof TypeTagVariantAddress) {
    return 'Address';
  }

  if (bcs_data instanceof TypeTagVariantBool) {
    return 'Bool';
  }

  if (bcs_data instanceof TypeTagVariantU8) {
    return 'U8';
  }

  if (bcs_data instanceof TypeTagVariantU64) {
    return 'U64';
  }

  if (bcs_data instanceof TypeTagVariantU128) {
    return 'U128';
  }

  if (bcs_data instanceof TypeTagVariantSigner) {
    return 'Signer';
  }

  if (bcs_data instanceof TypeTagVariantStruct) {
    return {
      Struct: structTagFromSCS(bcs_data.value)
    };
  }

  if (bcs_data instanceof TypeTagVariantVector) {
    return {
      Vector: typeTagFromSCS(bcs_data.value)
    };
  }

  throw new TypeError(`invalid bcs type tag: ${bcs_data}`);
}
async function privateKeyToPublicKey(privateKey) {
  const publicKey = await getPublicKey(stripHexPrefix(privateKey));
  return hexlify(publicKey);
} // singleMulti: 0-single, 1-multi

function publicKeyToAuthKey(publicKey, singleMulti = accountType.SINGLE) {
  const hasher = sha3_256$1.create();
  hasher.update(fromHexString(publicKey));
  hasher.update(fromHexString(hexlify(singleMulti)));
  const hash = hasher.hex();
  return addHexPrefix(hash);
} // singleMulti: 0-single, 1-multi

function publicKeyToAddress(publicKey, singleMulti = accountType.SINGLE) {
  const hasher = sha3_256$1.create();
  hasher.update(fromHexString(publicKey));
  hasher.update(fromHexString(hexlify(singleMulti)));
  const hash = hasher.hex();
  const address = hash.slice(hash.length / 2);
  return addHexPrefix(address);
}
function encodeReceiptIdentifier(addressStr, authKeyStr = '') {
  const accountAddress = addressToSCS(addressStr);
  const authKey = new AuthKey(Buffer.from(authKeyStr, 'hex'));
  return new ReceiptIdentifier(accountAddress, authKey).encode();
}
function decodeReceiptIdentifier(value) {
  const receiptIdentifier = ReceiptIdentifier.decode(value);
  const accountAddress = stripHexPrefix(addressFromSCS(receiptIdentifier.accountAddress));
  const authKey = receiptIdentifier.authKey.hex();
  const receiptIdentifierView = {
    accountAddress,
    authKey
  };
  return receiptIdentifierView;
}
function publicKeyToReceiptIdentifier(publicKey) {
  const address = publicKeyToAddress(publicKey);
  const authKey = publicKeyToAuthKey(publicKey);
  const receiptIdentifier = encodeReceiptIdentifier(stripHexPrefix(address), stripHexPrefix(authKey));
  return receiptIdentifier;
} // export function txnArgFromSCS(data: starcoin_types.TransactionArgument): TransactionArgument {
//   if (data instanceof starcoin_types.TransactionArgumentVariantBool) {
//     return { Bool: data.value };
//   }
//   if (data instanceof starcoin_types.TransactionArgumentVariantU8) {
//     return { U8: data.value };
//   }
//   if (data instanceof starcoin_types.TransactionArgumentVariantU64) {
//     return { U64: data.value };
//   }
//   if (data instanceof starcoin_types.TransactionArgumentVariantU128) {
//     return { U128: data.value };
//   }
//   if (data instanceof starcoin_types.TransactionArgumentVariantAddress) {
//     return { Address: addressFromSCS(data.value) };
//   }
//   if (data instanceof starcoin_types.TransactionArgumentVariantU8Vector) {
//     return { U8Vector: data.value };
//   }
//   throw new TypeError(`cannot decode bcs type: ${data}`);
// }
// export function txnArgToSCS(
//   data: TransactionArgument
// ): starcoin_types.TransactionArgument {
//   if ('U8' in data) {
//     return new starcoin_types.TransactionArgumentVariantU8(data.U8);
//   }
//   if ('U64' in data) {
//     return new starcoin_types.TransactionArgumentVariantU64(BigInt(data.U64));
//   }
//   if ('U128' in data) {
//     return new starcoin_types.TransactionArgumentVariantU128(BigInt(data.U128));
//   }
//   if ('Address' in data) {
//     return new starcoin_types.TransactionArgumentVariantAddress(
//       addressToSCS(data.Address)
//     );
//   }
//   if ('U8Vector' in data) {
//     return new starcoin_types.TransactionArgumentVariantU8Vector(data.U8Vector);
//   }
//   if ('Bool' in data) {
//     return new starcoin_types.TransactionArgumentVariantBool(data.Bool);
//   }
//   throw new Error(`invalid txn argument${data}`);
//
// }
// Deprecated
// stringToBytes(str) can be replaced with: new Uint8Array(Buffer.from(str))

function stringToBytes(str) {
  let bytes = new Array();
  let len, c;
  len = str.length;

  for (let i = 0; i < len; i++) {
    c = str.charCodeAt(i);

    if (c >= 0x010000 && c <= 0x10FFFF) {
      bytes.push(c >> 18 & 0x07 | 0xF0);
      bytes.push(c >> 12 & 0x3F | 0x80);
      bytes.push(c >> 6 & 0x3F | 0x80);
      bytes.push(c & 0x3F | 0x80);
    } else if (c >= 0x000800 && c <= 0x00FFFF) {
      bytes.push(c >> 12 & 0x0F | 0xE0);
      bytes.push(c >> 6 & 0x3F | 0x80);
      bytes.push(c & 0x3F | 0x80);
    } else if (c >= 0x000080 && c <= 0x0007FF) {
      bytes.push(c >> 6 & 0x1F | 0xC0);
      bytes.push(c & 0x3F | 0x80);
    } else {
      bytes.push(c & 0xFF);
    }
  }

  return bytes;
} // Deprecated
// bytesToString(arr) can be replaced with: Buffer.from(arr).toString()

function bytesToString(arr) {
  if (typeof arr === 'string') {
    return arr;
  }

  let str = '';

  for (let i = 0; i < arr.length; i++) {
    let one = arr[i].toString(2),
        v = one.match(/^1+?(?=0)/);

    if (v && one.length == 8) {
      let bytesLength = v[0].length;
      let store = arr[i].toString(2).slice(7 - bytesLength);

      for (let st = 1; st < bytesLength; st++) {
        store += arr[st + i].toString(2).slice(2);
      }

      str += String.fromCharCode(parseInt(store, 2));
      i += bytesLength - 1;
    } else {
      str += String.fromCharCode(arr[i]);
    }
  }

  return str;
}
/**
 * Decode a VM2 transaction payload.
 * Returns 'EntryFunction' key instead of 'ScriptFunction' for variant index 2.
 * BCS format is identical — only the key name differs.
 */

function decodeTransactionPayloadVM2(payload) {
  const result = decodeTransactionPayload(payload);

  if ('ScriptFunction' in result) {
    return {
      EntryFunction: result.ScriptFunction
    };
  }

  return result;
}

var index$4 = {
  __proto__: null,
  bcsDecode: bcsDecode,
  bcsEncode: bcsEncode,
  decodeSignedUserTransaction: decodeSignedUserTransaction,
  decodeTransactionPayload: decodeTransactionPayload,
  packageHexToTransactionPayload: packageHexToTransactionPayload,
  packageHexToTransactionPayloadHex: packageHexToTransactionPayloadHex,
  addressToSCS: addressToSCS,
  addressFromSCS: addressFromSCS,
  typeTagToSCS: typeTagToSCS,
  structTagToSCS: structTagToSCS,
  structTagFromSCS: structTagFromSCS,
  typeTagFromSCS: typeTagFromSCS,
  privateKeyToPublicKey: privateKeyToPublicKey,
  publicKeyToAuthKey: publicKeyToAuthKey,
  publicKeyToAddress: publicKeyToAddress,
  encodeReceiptIdentifier: encodeReceiptIdentifier,
  decodeReceiptIdentifier: decodeReceiptIdentifier,
  publicKeyToReceiptIdentifier: publicKeyToReceiptIdentifier,
  stringToBytes: stringToBytes,
  bytesToString: bytesToString,
  decodeTransactionPayloadVM2: decodeTransactionPayloadVM2
};

function decodeTransactionScriptABI(bytes) {
  const de = new BcsDeserializer(bytes);
  const abi = TransactionScriptABI.deserialize(de);
  return {
    args: abi.args.map(a => ({
      name: a.name,
      type_tag: typeTagFromSCS(a.type_tag)
    })),
    code: abi.code,
    doc: abi.doc,
    name: abi.name,
    ty_args: abi.ty_args.map(t => ({
      name: t.name
    }))
  };
}

var abi = {
  __proto__: null,
  decodeTransactionScriptABI: decodeTransactionScriptABI
};

function generatePrivateKey() {
  // 32-byte Uint8Array
  const privateKeyBytes = utils.randomPrivateKey();
  const privateKey = Buffer.from(privateKeyBytes).toString('hex');
  return addHexPrefix(privateKey);
}
async function generateAccount() {
  const privateKey = generatePrivateKey();
  const accountInfo = showAccount(privateKey);
  return accountInfo;
}
/**
 * simillar to these 2 commands in starcoin console:
 * starcoin% account import -i <PRIVATEKEY>
 * starcoin% account show <ACCOUNT_ADDRESS>
 * @param privateKey
 * @returns
 */

async function showAccount(privateKey) {
  const publicKey = await privateKeyToPublicKey(privateKey);
  const address = publicKeyToAddress(publicKey);
  const authKey = publicKeyToAuthKey(publicKey);
  const receiptIdentifier = encodeReceiptIdentifier(stripHexPrefix(address), stripHexPrefix(authKey));
  return {
    privateKey,
    publicKey,
    address,
    authKey,
    receiptIdentifier
  };
}
function getMultiEd25519AccountPrivateKey(shard) {
  const privateKey = hexlify(shard.privateKey());
  return privateKey;
}
function getMultiEd25519AccountPublicKey(shard) {
  const multiEd25519PublicKey = shard.publicKey();
  const publicKey = hexlify(multiEd25519PublicKey.value());
  return publicKey;
}
function getMultiEd25519AccountAddress(shard) {
  const publicKey = getMultiEd25519AccountPublicKey(shard);
  const address = publicKeyToAddress(publicKey, accountType.MULTI);
  return address;
}
function getMultiEd25519AccountReceiptIdentifier(shard) {
  const address = getMultiEd25519AccountAddress(shard); // same with Rust, receiptIdentifier do not include authKey

  const receiptIdentifier = encodeReceiptIdentifier(stripHexPrefix(address));
  return receiptIdentifier;
}
function showMultiEd25519Account(shard) {
  const privateKey = getMultiEd25519AccountPrivateKey(shard);
  const publicKey = getMultiEd25519AccountPublicKey(shard);
  const address = getMultiEd25519AccountAddress(shard);
  const receiptIdentifier = getMultiEd25519AccountReceiptIdentifier(shard);
  const authKey = publicKeyToAuthKey(publicKey, accountType.MULTI);
  return {
    privateKey,
    publicKey,
    address,
    authKey,
    receiptIdentifier
  };
}
function decodeMultiEd25519AccountPrivateKey(privateKey) {
  const bytes = arrayify(privateKey);
  const publicKeysLengthBytes = bytes.slice(0, 1);
  const publicKeysLength = publicKeysLengthBytes[0];
  const thresholdBytes = bytes.slice(1, 2);
  const threshold = thresholdBytes[0];
  const privateKeysLengthBytes = bytes.slice(2, 3);
  const privateKeysLength = privateKeysLengthBytes[0];
  const publicKeys = [];
  const privateKeys = [];
  let start = 3;
  const length = 32;
  let end;

  for (let i = 0; i < publicKeysLength; i += 1) {
    end = start + length;
    const publicKeyBytes = bytes.slice(start, end);
    publicKeys.push(hexlify(publicKeyBytes));
    start = end;
  }

  for (let i = 0; i < privateKeysLength; i += 1) {
    end = start + length;
    const privateKeyBytes = bytes.slice(start, end);
    privateKeys.push(hexlify(privateKeyBytes));
    start = end;
  }

  return {
    privateKeys,
    publicKeys,
    threshold
  };
}

var account = {
  __proto__: null,
  generatePrivateKey: generatePrivateKey,
  generateAccount: generateAccount,
  showAccount: showAccount,
  getMultiEd25519AccountPrivateKey: getMultiEd25519AccountPrivateKey,
  getMultiEd25519AccountPublicKey: getMultiEd25519AccountPublicKey,
  getMultiEd25519AccountAddress: getMultiEd25519AccountAddress,
  getMultiEd25519AccountReceiptIdentifier: getMultiEd25519AccountReceiptIdentifier,
  showMultiEd25519Account: showMultiEd25519Account,
  decodeMultiEd25519AccountPrivateKey: decodeMultiEd25519AccountPrivateKey
};

function InvalidNumberOfMoveArgs(given, expected) {
  return new Error(`Invalid number of arguments to Move function. given: ${given}, expected: ${expected}`);
}
function InvalidNumberOfRPCParams(methodName, given, expected) {
  return new Error(`Invalid number of input parameters to RPC method "${methodName}" given: ${given}, expected: ${expected}`);
}
function InvalidConnection(host) {
  return new Error("CONNECTION ERROR: Couldn't connect to node " + host + '.');
}
function InvalidProvider() {
  return new Error('Provider not set or invalid');
}
function InvalidResponse(result) {
  const message = !!result && !!result.error && !!result.error.message ? result.error.message : 'Invalid JSON RPC response: ' + JSON.stringify(result);
  return new Error(message);
}
function ConnectionTimeout(ms) {
  return new Error('CONNECTION TIMEOUT: timeout of ' + ms + ' ms achived');
}

var errors = {
  __proto__: null,
  InvalidNumberOfMoveArgs: InvalidNumberOfMoveArgs,
  InvalidNumberOfRPCParams: InvalidNumberOfRPCParams,
  InvalidConnection: InvalidConnection,
  InvalidProvider: InvalidProvider,
  InvalidResponse: InvalidResponse,
  ConnectionTimeout: ConnectionTimeout
};

class Parser {
  constructor(toks) {
    this.cur_idx = 0;
    this.toks = toks;
  }

  next_tok() {
    let tok = this.toks[this.cur_idx++];

    if (tok === undefined) {
      throw new Error('out of token, this should not happen');
    }

    return tok;
  }

  peek() {
    return this.toks[this.cur_idx];
  }

  consume_tok(tok) {
    let t = this.next_tok();

    if (t != tok) {
      throw new Error(`expected tok: ${tok}, got: ${t}`);
    }
  }

  parse_comma_list(parse_list_item, end_token, allow_trailing_comma) {
    let v = [];
    const head = this.peek();

    if (!(head === end_token)) {
      while (true) {
        v.push(parse_list_item(this));

        if (this.peek() === end_token) {
          break;
        }

        this.consume_tok('Comma');

        if (this.peek() === end_token && allow_trailing_comma) {
          break;
        }
      }
    }

    return v;
  }

  parseTypeTag() {
    let tok = this.next_tok();

    if (tok === 'U8Type') {
      return 'U8';
    }

    if (tok === 'U64Type') {
      return 'U64';
    }

    if (tok === 'U128Type') {
      return 'U128';
    }

    if (tok === 'BoolType') {
      return 'Bool';
    }

    if (tok === 'AddressType') {
      return 'Address';
    }

    if (tok === 'VectorType') {
      this.consume_tok('Lt');
      let ty = this.parseTypeTag();
      this.consume_tok('Gt');
      return {
        Vector: ty
      };
    }

    if (tok['Address'] !== undefined) {
      let addr = tok['Address'];
      this.consume_tok('ColonColon');
      let module_tok = this.next_tok();

      if (module_tok['Name'] === undefined) {
        throw new Error(`expected name, got: ${module_tok}`);
      }

      let module = module_tok['Name'];
      this.consume_tok('ColonColon');
      let struct_tok = this.next_tok();

      if (struct_tok['Name'] === undefined) {
        throw new Error(`expected name, got: ${module_tok}`);
      }

      let struct_name = struct_tok['Name'];
      let tyArgs = [];

      if (this.peek() === 'Lt') {
        this.consume_tok('Lt');
        tyArgs = this.parse_comma_list(p => p.parseTypeTag(), 'Gt', true);
        this.consume_tok('Gt');
      }

      return {
        Struct: {
          address: addr,
          module: module,
          name: struct_name,
          type_params: tyArgs
        }
      };
    }

    throw new Error(`unexpected token ${tok}, expected type tag`);
  }

} // parse a number from string.


function nextNumber(s) {
  let num = '';
  let i = 0;

  while (i < s.length) {
    let c = s[i++]; // parse number

    if (decimal(c)) {
      num = num.concat(c);
    } else if (alphabetical(c)) {
      // if come across a char, parse as suffix.
      let suffix = c;

      while (i < s.length) {
        let _c = s[i++];

        if (alphanumerical(_c)) {
          suffix = suffix.concat(_c);
        } else {
          break;
        }
      }

      const len = num.length + suffix.length;

      switch (suffix) {
        case 'u8':
          return [{
            U8: num
          }, len];

        case 'u64':
          return [{
            U64: num
          }, len];

        case 'u128':
          return [{
            U128: num
          }, len];

        default:
          throw new Error('invalid suffix');
      }
    } else {
      break;
    }
  }

  return [{
    U64: num
  }, num.length];
}

function nameToken(s) {
  switch (s) {
    case 'u8':
      return 'U8Type';

    case 'u64':
      return 'U64Type';

    case 'u128':
      return 'U128Type';

    case 'bool':
      return 'BoolType';

    case 'address':
      return 'AddressType';

    case 'vector':
      return 'VectorType';

    case 'true':
      return 'True';

    case 'false':
      return 'False';

    default:
      return {
        Name: s
      };
  }
}

function nextToken(s) {
  if (s.length === 0) {
    return undefined;
  }

  let head = s[0];

  if (head === '<') {
    return ['Lt', 1];
  }

  if (head === '>') {
    return ['Gt', 1];
  }

  if (head === ',') {
    return ['Comma', 1];
  }

  if (head === ':') {
    if (s[1] === ':') {
      return ['ColonColon', 2];
    } else {
      throw new Error('unrecognized token');
    }
  }

  if (head === '0' && ['x', 'X'].includes(s[1])) {
    if (hexadecimal(s[2])) {
      let r = '0x';

      for (let i = 2; i < s.length; i++) {
        if (hexadecimal(s[i])) {
          r = r.concat(s[i]);
        } else {
          break;
        }
      }

      return [{
        Address: r
      }, r.length];
    } else {
      throw new Error('unrecognized token');
    }
  }

  if (decimal(head)) {
    return nextNumber(s);
  } // parse bytes start with b.


  if (head === 'b' && s[1] === '"') {
    let r = '';
    let i = 2;

    while (true) {
      if (i >= s.length) {
        throw new Error('unrecognized token');
      }

      let c = s[i++];

      if (c === '"') {
        break;
      } else if (isAscii(c)) {
        r = r.concat(c);
      } else {
        throw new Error('unrecognized token');
      }
    }

    return [{
      Bytes: r
    }, r.length + 3];
  } // parse bytes start with x.


  if (head === 'x' && s[1] === '"') {
    let r = '';
    let i = 2;

    while (true) {
      if (i >= s.length) {
        throw new Error('unrecognized token');
      }

      let c = s[i++];

      if (c === '"') {
        break;
      } else if (hexadecimal(c)) {
        r = r.concat(c);
      } else {
        throw new Error('unrecognized token');
      }
    }

    return [{
      Bytes: r
    }, r.length + 3];
  } // parse name token.


  if (alphabetical(head) || ['-', '_'].includes(head)) {
    let r = '';

    for (let i = 0; i < s.length; i++) {
      if (alphanumerical(s[i]) || ['-', '_'].includes(s[i])) {
        r = r.concat(s[i]);
      } else {
        break;
      }
    }

    return [nameToken(r), r.length];
  } // parse whitespace.


  if (whitespace(head)) {
    let r = '';

    for (let i = 0; i < s.length; i++) {
      if (whitespace(s[i])) {
        r = r.concat(s[i]);
      } else {
        break;
      }
    }

    return [{
      WhiteSpace: r
    }, r.length];
  }

  throw new Error('unrecognized token');
}

function tokenize(s) {
  let v = [];

  while (true) {
    // @ts-ignore
    let nextTok = nextToken(s);

    if (nextTok === undefined) {
      break;
    }

    let [tok, n] = nextTok;
    v.push(tok);
    s = s.substring(n);
  }

  return v;
}

function isAscii(character) {
  var code = typeof character === 'string' ? character.charCodeAt(0) : character;
  return code <= 0x7F;
}

function parse(s, f) {
  // @ts-ignore
  let toks = tokenize(s).filter(t => t.WhiteSpace === undefined);
  toks.push('EOF');
  let parser = new Parser(toks);
  let res = f(parser);
  parser.consume_tok('EOF');
  return res;
}

function parseTypeTags(s) {
  return parse(s, p => {
    return p.parse_comma_list(p => p.parseTypeTag(), 'EOF', true);
  });
}
function parseTypeTag(s) {
  return parse(s, p => p.parseTypeTag());
} // export fuction parseTransactionArguments(s: string): TransactionArgument[] {
//   return parse(s, p => {
//     return p.parse_comma_list(p => p.parseTransactionArgument(), 'EOF', true);
//   });
// }
// export function parseTransactionArgument(s: string): TransactionArgument {
//   return parse(s, p => p.parseTransactionArgument());
// }

var parser = {
  __proto__: null,
  parseTypeTags: parseTypeTags,
  parseTypeTag: parseTypeTag
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../package.json');

const {
  version
} = packageJson;

const logger = new Logger(version);
function checkProperties(object, properties) {
  if (!object || typeof object !== "object") {
    logger.throwArgumentError("invalid object", "object", object);
  }

  Object.keys(object).forEach(key => {
    if (!properties[key]) {
      logger.throwArgumentError("invalid object key - " + key, "transaction:" + key, object);
    }
  });
}

var properties = {
  __proto__: null,
  checkProperties: checkProperties
};

function encodeTransactionAuthenticatorEd25519(signatureBytes, publicKeyBytes) {
  const ed25519PublicKey = new Ed25519PublicKey(publicKeyBytes);
  const ed25519Signature = new Ed25519Signature(signatureBytes);
  const authenticatorEd25519 = new TransactionAuthenticatorVariantEd25519(ed25519PublicKey, ed25519Signature);
  return authenticatorEd25519;
}
function getEd25519SignMsgBytes(signingMessage) {
  const hasher = createSigningMessageHasher();
  const hashSeedBytes = hasher.get_salt();

  const signingMessageBytes = function () {
    const se = new BcsSerializer();
    signingMessage.serialize(se);
    return se.getBytes();
  }();

  const msgBytes = ((a, b) => {
    const tmp = new Uint8Array(a.length + b.length);
    tmp.set(a, 0);
    tmp.set(b, a.length);
    return tmp;
  })(hashSeedBytes, signingMessageBytes);

  return msgBytes;
} // simulate OneKeyConnect.starcoinSignMessage with the same response payload

async function signMessage(msg, privateKeyHex) {
  const msgBytes = new Uint8Array(Buffer.from(msg, 'utf8'));
  const signingMessage = new SigningMessage(msgBytes);
  const signingMessageBytes = getEd25519SignMsgBytes(signingMessage);
  const publicKeyBytes = await getPublicKey(stripHexPrefix(privateKeyHex));
  const publicKeyHex = hexlify(publicKeyBytes);
  const signatureBytes = await sign(signingMessageBytes, stripHexPrefix(privateKeyHex));
  const signatureHex = hexlify(signatureBytes);
  return Promise.resolve({
    publicKey: publicKeyHex,
    signature: signatureHex
  });
}
async function generateSignedMessage(signingMessage, id, publicKeyHex, signatureHex) {
  const publicKeyBytes = arrayify(addHexPrefix(publicKeyHex));
  const addressHex = publicKeyToAddress(publicKeyHex);
  const accountAddress = addressToSCS(addressHex);
  const signatureBytes = arrayify(addHexPrefix(signatureHex));
  const transactionAuthenticatorEd25519 = encodeTransactionAuthenticatorEd25519(signatureBytes, publicKeyBytes);
  const chainId = new ChainId(id);
  const signedMessage = new SignedMessage(accountAddress, signingMessage, transactionAuthenticatorEd25519, chainId);
  const signedMessageBytes = bcsEncode(signedMessage);
  const signedMessageHex = hexlify(signedMessageBytes);
  return Promise.resolve(signedMessageHex);
}
async function encodeSignedMessage(msg, privateKeyBytes, chainId) {
  const msgBytes = new Uint8Array(Buffer.from(msg, 'utf8'));
  const signingMessage = new SigningMessage(msgBytes);
  const {
    publicKey,
    signature
  } = await signMessage(msg, hexlify(privateKeyBytes));
  const signedMessageHex = await generateSignedMessage(signingMessage, chainId, publicKey, signature);
  return Promise.resolve(signedMessageHex);
}
function decodeSignedMessage(data) {
  const dataBytes = arrayify(data);

  const scsData = function () {
    const de = new BcsDeserializer(dataBytes);
    return SignedMessage.deserialize(de);
  }();

  return scsData;
}
async function recoverSignedMessageAddress(signedMessageHex) {
  const signedMessage = decodeSignedMessage(signedMessageHex); // const rawMessageBytes = signedMessage.message.message
  // const rawMessageHex = hexlify(rawMessageBytes)
  // const rawMessage = Buffer.from(stripHexPrefix(rawMessageHex), 'hex').toString('utf8')

  let address;

  if (signedMessage.authenticator instanceof TransactionAuthenticatorVariantEd25519) {
    const signatureBytes = signedMessage.authenticator.signature.value;
    const msgBytes = getEd25519SignMsgBytes(signedMessage.message);
    const publicKeyBytes = signedMessage.authenticator.public_key.value;
    address = publicKeyToAddress(hexlify(publicKeyBytes));
    const isSigned = await verify(signatureBytes, msgBytes, publicKeyBytes);

    if (!isSigned) {
      throw new Error('Failed verify signature and message');
    }

    const isOk = checkAccount(publicKeyBytes, signedMessage.account);

    if (!isOk) {
      throw new Error('Failed: address are not match');
    }
  }

  return Promise.resolve(address);
} // TODO: check onchain authkey using chain_id

function checkAccount(publicKeyBytes, accountAddress) {
  const address = publicKeyToAddress(hexlify(publicKeyBytes));

  if (address === addressFromSCS(accountAddress)) {
    return true;
  }

  return false;
}

var signedMessage = {
  __proto__: null,
  encodeTransactionAuthenticatorEd25519: encodeTransactionAuthenticatorEd25519,
  getEd25519SignMsgBytes: getEd25519SignMsgBytes,
  signMessage: signMessage,
  generateSignedMessage: generateSignedMessage,
  encodeSignedMessage: encodeSignedMessage,
  decodeSignedMessage: decodeSignedMessage,
  recoverSignedMessageAddress: recoverSignedMessageAddress
};

const logger$1 = new Logger(version);

function isRenetworkable(value) {
  return value && typeof value.renetwork === 'function';
}

function stcDefaultProvider(network) {
  const func = function func(providers, options) {
    if (providers.JsonRpcProvider) {
      return new providers.JsonRpcProvider(options.jsonrpc, network);
    }

    return null;
  };

  func.renetwork = function (network) {
    return stcDefaultProvider(network);
  };

  return func;
}

const STANDARD_NETWORKS = {
  test: {
    chainId: 255,
    name: 'test',
    _defaultProvider: stcDefaultProvider('test')
  },
  dev: {
    chainId: 254,
    name: 'dev'
  },
  barnard: {
    chainId: 251,
    name: 'barnard'
  },
  halley: {
    chainId: 253,
    name: 'halley'
  },
  proxima: {
    chainId: 2,
    name: 'proxima'
  },
  main: {
    chainId: 1,
    name: 'main'
  }
};
const APTOS_NETWORKS = {
  test: {
    chainId: 2,
    name: 'testnet'
  },
  dev: {
    chainId: 34,
    name: 'devnet'
  },
  main: {
    chainId: 1,
    name: 'mainnet'
  }
};
function getNetwork(network, isAptos = false) {
  if (network == null) {
    return null;
  }

  const NETWORKS = isAptos ? APTOS_NETWORKS : STANDARD_NETWORKS;

  if (typeof network === 'number') {
    for (const name in NETWORKS) {
      const standard = NETWORKS[name];

      if (standard.chainId == network) {
        return {
          name: standard.name,
          chainId: standard.chainId,
          _defaultProvider: standard._defaultProvider || null
        };
      }
    }

    return {
      chainId: network,
      name: 'unknown'
    };
  } else if (typeof network === 'string') {
    const standard = NETWORKS[network];

    if (standard == null) {
      return null;
    }

    return {
      name: standard.name,
      chainId: standard.chainId,
      _defaultProvider: standard._defaultProvider || null
    };
  } else {
    const standard = NETWORKS[network.name];

    if (!standard) {
      if (typeof network.chainId !== 'number') {
        logger$1.throwArgumentError('invalid network chainId', 'network', network);
      }

      return network;
    } // Make sure the chainId matches the expected network chainId (or is 0; disable EIP-155)


    if (network.chainId !== standard.chainId) {
      logger$1.throwArgumentError('network chainId mismatch', 'network', network);
    } // @TODO: In the next major version add an attach function to a defaultProvider
    // class and move the _defaultProvider internal to this file (extend Network)


    let defaultProvider = network._defaultProvider || null;

    if (defaultProvider == null && standard._defaultProvider) {
      if (isRenetworkable(standard._defaultProvider)) {
        defaultProvider = standard._defaultProvider.renetwork(network);
      } else {
        defaultProvider = standard._defaultProvider;
      }
    } // Standard Network (allow overriding the ENS address)


    return {
      name: network.name,
      chainId: standard.chainId,
      _defaultProvider: defaultProvider
    };
  }
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

const version$1 = 'abstract-provider/5.0.5';
const logger$2 = new Logger(version$1); /// ////////////////////////////
// Exported Abstracts

class Provider {
  constructor() {
    logger$2.checkAbstract(new.target, Provider);
    defineReadOnly(this, '_isProvider', true);
  } // Account
  // eslint-disable-next-line consistent-return


  async getBalance(address, // token name, default to 0x1::STC::STC
  token, blockTag) {
    if (token === undefined) {
      // eslint-disable-next-line no-param-reassign
      token = '0x1::STC::STC';
    }

    const resource = await this.getResource(address, `0x1::Account::Balance<${token}>`, blockTag);

    if (resource !== undefined) {
      return resource.token.value;
    }
  } // get all token balances of `address`.


  async getBalances(address, blockTag) {
    const resources = await this.getResources(address, blockTag);

    if (resources === undefined) {
      return;
    }

    let tokenBalances = {}; // @ts-ignore

    for (let k in resources) {
      let typeTag = parseTypeTag(k); // filter out balance resources.
      // @ts-ignore

      if (typeof typeTag === 'object' && typeTag.Struct !== undefined) {
        // @ts-ignore
        let structTag = typeTag.Struct;

        if (structTag.module === 'Account' && structTag.name === 'Balance') {
          // @ts-ignore
          let tokenStruct = formatStructTag(structTag.type_params[0]['Struct']);
          tokenBalances[tokenStruct] = resources[k].token.value;
        }
      }
    }

    return tokenBalances;
  } // eslint-disable-next-line consistent-return


  async getSequenceNumber(address, blockTag) {
    const resource = await this.getResource(address, '0x1::Account::Account', blockTag);

    if (resource !== undefined) {
      return resource.sequence_number;
    }
  } // Alias for "on"


  addListener(eventName, listener) {
    return this.on(eventName, listener);
  } // Alias for "off"


  removeListener(eventName, listener) {
    return this.off(eventName, listener);
  }

  static isProvider(value) {
    // eslint-disable-next-line no-underscore-dangle
    return !!(value && value._isProvider);
  }

}

const logger$3 = new Logger(version);
function formatMoveStruct(v) {
  // eslint-disable-next-line unicorn/no-reduce
  return v.value.reduce((o, [k, field]) => _extends({}, o, {
    [k]: formatMoveValue(field)
  }), {});
}
function formatMoveValue(v) {
  if ('Bool' in v) {
    return v.Bool;
  }

  if ('U8' in v) {
    return v.U8;
  }

  if ('U64' in v) {
    return Formatter.bigint(v.U64);
  }

  if ('U128' in v) {
    return Formatter.bigint(v.U128);
  }

  if ('Address' in v) {
    return v.Address;
  }

  if ('Bytes' in v) {
    return hexValue(v.Bytes);
  }

  if ('Vector' in v) {
    return v.Vector.map(elem => formatMoveValue(elem));
  }

  if ('Struct' in v) {
    const struct = v.Struct; // eslint-disable-next-line unicorn/no-reduce

    return struct.value.reduce((o, [k, field]) => _extends({}, o, {
      [k]: formatMoveValue(field)
    }), {});
  }

  throw new Error(`invalid annotated move value, ${JSON.stringify(v)}`);
}
class Formatter {
  constructor() {
    logger$3.checkNew(new.target, Formatter);
    this.formats = this.getDefaultFormats();
  }

  getDefaultFormats() {
    const formats = {};
    const address = this.address.bind(this);
    const bigNumber = this.bigNumber.bind(this);
    const blockTag = this.blockTag.bind(this);
    const data = this.data.bind(this);
    const hash = this.hash.bind(this);
    const hex = this.hex.bind(this);
    const number = this.number.bind(this);
    const u64 = this.u64.bind(this); // eslint-disable-next-line no-underscore-dangle

    const i64 = Formatter.bigint.bind(this);
    const u8 = this.u8.bind(this);
    const u256 = this.u256.bind(this);

    formats.rawTransaction = {
      sender: address,
      sequence_number: u64,
      payload: data,
      max_gas_amount: u64,
      gas_unit_price: u64,
      gas_token_code: v => v,
      expiration_timestamp_secs: u64,
      chain_id: u8
    };
    formats.signedUserTransaction = {
      transaction_hash: hash,
      raw_txn: this.rawUserTransaction.bind(this),
      authenticator: this.transactionAuthenticator.bind(this)
    };
    formats.blockMetadata = {
      parent_hash: hash,
      timestamp: u64,
      author: address,
      author_auth_key: hex,
      uncles: u64,
      number: u64,
      chain_id: u8,
      parent_gas_used: u64
    };
    const txnBlockInfo = {
      block_hash: Formatter.allowNull(hash),
      block_number: Formatter.allowNull(u64),
      transaction_hash: Formatter.allowNull(hash),
      transaction_index: Formatter.allowNull(number)
    };
    formats.transaction = _extends({
      block_metadata: Formatter.allowNull(this.blockMetadata.bind(this), null),
      user_transaction: Formatter.allowNull(this.signedUserTransaction.bind(this), null)
    }, txnBlockInfo);
    formats.blockBody = {
      Full: Formatter.allowNull(Formatter.arrayOf(this.signedUserTransaction.bind(this))),
      Hashes: Formatter.allowNull(Formatter.arrayOf(hash))
    };
    formats.blockHeader = {
      block_hash: hash,
      parent_hash: hash,
      timestamp: u64,
      number: u64,
      author: address,
      author_auth_key: Formatter.allowNull(hex, null),
      /// The transaction accumulator root hash after executing this block.
      txn_accumulator_root: hash,
      /// The parent block accumulator root hash.
      block_accumulator_root: hash,
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
      chain_id: u8
    };
    formats.blockWithTransactions = {
      header: value => Formatter.check(formats.blockHeader, value),
      body: value => value
    };
    formats.block = {
      header: value => Formatter.check(formats.blockHeader, value),
      body: value => Formatter.check(formats.blockBody, value),
      confirmations: number
    };
    formats.transactionInfo = _extends({
      state_root_hash: hash,
      event_root_hash: hash,
      gas_used: u64,
      status: this.transactionVmStatus.bind(this),
      txn_events: Formatter.allowNull(Formatter.arrayOf(this.transactionEvent.bind(this)), null)
    }, txnBlockInfo);
    formats.transactionEvent = _extends({
      data: hex,
      type_tags: this.typeTag.bind(this),
      event_key: hex,
      event_seq_number: u64
    }, txnBlockInfo);
    formats.transactionOutput = {
      gas_used: u64,
      status: this.transactionVmStatus.bind(this),
      events: Formatter.allowNull(Formatter.arrayOf(this.transactionEvent.bind(this))),
      write_set: Formatter.allowNull(Formatter.arrayOf(this.transactionWriteAction.bind(this)))
    };
    formats.blockWithTransactions = shallowCopy(formats.block);
    formats.blockWithTransactions.transactions = Formatter.allowNull(Formatter.arrayOf(this.transactionResponse.bind(this)));
    formats.eventFilter = {
      from_block: Formatter.allowNull(blockTag),
      to_block: Formatter.allowNull(blockTag),
      event_keys: Formatter.arrayOf(hex),
      limit: Formatter.allowNull(number)
    };
    return formats;
  }

  typeTag(value) {
    return value;
  }

  moveValue(value) {
    return formatMoveValue(value);
  }

  moveStruct(value) {
    return formatMoveStruct(value);
  }

  transactionAuthenticator(value) {
    return value;
  }

  rawUserTransaction(value) {
    return Formatter.check(this.formats.rawTransaction, value);
  }

  signedUserTransaction(value) {
    return Formatter.check(this.formats.signedUserTransaction, value);
  }

  blockMetadata(value) {
    return Formatter.check(this.formats.blockMetadata, value);
  }

  transactionOutput(value) {
    return Formatter.check(this.formats.transactionOutput, value);
  }

  transactionWriteAction(value) {
    return value;
  }

  transactionEvent(value) {
    return Formatter.check(this.formats.transactionEvent, value);
  }

  transactionVmStatus(value) {
    if (typeof value === 'string') {
      if ([TransactionVMStatus_Executed, TransactionVMStatus_OutOfGas, TransactionVMStatus_MiscellaneousError].includes(value)) {
        return value;
      }

      throw new Error(`invalid txn vm_status: ${value}`);
    } else if (typeof value === 'object') {
      if (value.MoveAbort) {
        return {
          MoveAbort: {
            location: value.MoveAbort.location,
            abort_code: this.u64(value.MoveAbort.abort_code)
          }
        };
      }

      if (value.ExecutionFailure) {
        return value;
      }

      if (value.Discard) {
        return {
          Discard: {
            status_code: this.u64(value.Discard.status_code)
          }
        };
      }

      throw new Error(`invalid txn vm_status: ${JSON.stringify(value)}`);
    } else {
      throw new TypeError(`invalid txn vm_status type ${value}`);
    }
  } // Requires a BigNumberish that is within the IEEE754 safe integer range; returns a number
  // Strict! Used on input.


  number(number) {
    if (number === '0x') {
      return 0;
    }

    return BigNumber.from(number).toNumber();
  }

  u8(value) {
    if (typeof value === 'string') {
      return Number.parseInt(value, 10);
    }

    if (typeof value === 'number') {
      return value;
    }

    throw new Error(`invalid u8: ${value}`);
  }

  u64(number) {
    return Formatter.bigint(number);
  }

  u128(number) {
    return Formatter.bigint(number);
  }

  u256(number) {
    if (typeof number === 'string') {
      return number;
    }

    if (typeof number === 'number') {
      return number.toString();
    }

    throw new Error(`invalid bigint: ${number}`);
  }

  static bigint(number) {
    if (typeof number === 'string') {
      const bn = BigInt(number);

      if (bn > Number.MAX_SAFE_INTEGER) {
        return bn;
      } // eslint-disable-next-line radix


      return Number.parseInt(number);
    }

    if (typeof number === 'number') {
      return number;
    }

    throw new TypeError(`invalid bigint: ${number}`);
  } // Strict! Used on input.


  bigNumber(value) {
    return BigNumber.from(value);
  } // Requires a boolean, "true" or  "false"; returns a boolean


  boolean(value) {
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

    throw new Error(`invalid boolean - ${value}`);
  }

  hex(value, strict) {
    if (typeof value === 'string') {
      if (!strict && value.slice(0, 2) !== '0x') {
        value = `0x${value}`;
      }

      if (isHexString(value)) {
        return value.toLowerCase();
      }
    }

    return logger$3.throwArgumentError('invalid hex', 'value', value);
  }

  data(value, strict) {
    const result = this.hex(value, strict);

    if (result.length % 2 !== 0) {
      throw new Error(`invalid data; odd-length - ${value}`);
    }

    return result;
  } // Requires an address
  // Strict! Used on input.


  address(value) {
    if (typeof value !== 'string') {
      logger$3.throwArgumentError('invalid address', 'address', value);
    }

    const result = this.hex(value, true);
    const length = hexDataLength(result);

    if (length !== 16 && length !== 32) {
      return logger$3.throwArgumentError('invalid address', 'value', value);
    }

    return addHexPrefix(value);
  } // Strict! Used on input.


  blockTag(blockTag) {
    // if (blockTag == null) {
    //   return 'latest';
    // }
    if (blockTag === 'earliest') {
      return 0;
    } // if (blockTag === 'latest' || blockTag === 'pending') {
    //   return blockTag;
    // }


    if (typeof blockTag === 'number') {
      return blockTag;
    }

    throw new Error('invalid blockTag');
  } // Requires a hash, optionally requires 0x prefix; returns prefixed lowercase hash.


  hash(value, strict) {
    const result = this.hex(value, strict);

    if (hexDataLength(result) !== 32) {
      return logger$3.throwArgumentError('invalid hash', 'value', value);
    }

    return result;
  } // // Returns the difficulty as a number, or if too large (i.e. PoA network) null
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


  _block(value) {
    const block = Formatter.check(this.formats.block, value);
    const transactions = block.body.Full ? block.body.Full : block.body.Hashes;
    return {
      header: block.header,
      transactions,
      confirmations: block.confirmations
    };
  }

  blockWithTxnHashes(value) {
    const {
      header,
      transactions,
      confirmations
    } = this._block(value);

    return {
      header,
      transactions: transactions.map(t => t.transaction_hash),
      confirmations
    };
  }

  blockWithTransactions(value) {
    const {
      header,
      transactions,
      confirmations
    } = this._block(value);

    return {
      header,
      transactions: transactions,
      confirmations
    };
  } // // Strict! Used on input.
  // transactionRequest(value: any): any {
  //   return Formatter.check(this.formats.transactionRequest, value);
  // }


  transactionResponse(transaction) {
    return transaction;
  } // transactionResponse(transaction: any): TransactionResponse {
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


  userTransactionData(value) {
    return decodeSignedUserTransaction(value);
  }

  transactionInfo(value) {
    return Formatter.check(this.formats.transactionInfo, value);
  }

  topics(value) {
    if (Array.isArray(value)) {
      return value.map(v => this.topics(v));
    }

    if (value != undefined) {
      return this.hash(value, true);
    }

    return null;
  }

  filter(value) {
    return Formatter.check(this.formats.eventFilter, value);
  }

  static check(format, object) {
    const result = {};

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
  } // if value is null-ish, nullValue is returned


  static allowNull(format, nullValue) {
    return function (value) {
      if (value == undefined) {
        return nullValue;
      }

      return format(value);
    };
  } // If value is false-ish, replaceValue is returned


  static allowFalsish(format, replaceValue) {
    return function (value) {
      if (!value) {
        return replaceValue;
      }

      return format(value);
    };
  } // Requires an Array satisfying check


  static arrayOf(format) {
    return function (array) {
      if (!Array.isArray(array)) {
        throw new TypeError('not an array');
      }

      const result = [];
      array.forEach(function (value) {
        result.push(format(value));
      });
      return result;
    };
  }

} //
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

const logger$4 = new Logger(version); // Event Serializing

function serializeTopics(eventKeys) {
  if (eventKeys === undefined || eventKeys.length === 0) {
    return '*';
  } else {
    return eventKeys.join('|');
  }
}

function deserializeTopics(data) {
  if (data === '') {
    return [];
  }

  if (data === '*') {
    return [];
  }

  return data.split('|');
}

function getEventTag(eventName) {
  if (typeof eventName === 'string') {
    eventName = eventName.toLowerCase();

    if (hexDataLength(eventName) === 32) {
      return 'tx:' + eventName;
    }

    if (eventName.indexOf(':') === -1) {
      return eventName;
    }
  } else if (Array.isArray(eventName)) {
    return 'filter:' + serializeTopics(eventName);
  } else if (typeof eventName === 'object') {
    return 'filter:' + serializeTopics(eventName.event_keys);
  }

  throw new Error('invalid event - ' + eventName);
} //////////////////////////////
// Helper Object


function getTime() {
  return new Date().getTime();
}

function stall(duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
} //////////////////////////////
// Provider Object

/**
 *  EventType
 *   - "block"
 *   - "poll"
 *   - "didPoll"
 *   - "pending"
 *   - "error"
 *   - "network"
 *   - filter
 *   - topics array
 *   - transaction hash
 */


const CONSTANTS = {
  pending: 'pending',
  block: 'block',
  network: 'network',
  poll: 'poll',
  filter: 'filter',
  tx: 'tx'
};
const PollableEvents = [CONSTANTS.pending, CONSTANTS.block, CONSTANTS.network, CONSTANTS.poll];
class Event {
  constructor(tag, listener, once) {
    defineReadOnly(this, 'tag', tag);
    defineReadOnly(this, 'listener', listener);
    defineReadOnly(this, 'once', once);
  }

  get event() {
    switch (this.type) {
      case 'tx':
        return this.hash;

      case 'filter':
        return this.filter;
    }

    return this.tag;
  }

  get type() {
    return this.tag.split(':')[0];
  }

  get hash() {
    const comps = this.tag.split(':');

    if (comps[0] !== 'tx') {
      // @ts-ignore
      return null;
    }

    return comps[1];
  }

  get filter() {
    const comps = this.tag.split(':');

    if (comps[0] !== 'filter') {
      // @ts-ignore
      return null;
    }

    const topics = deserializeTopics(comps[1]);
    const filter = {};

    if (topics.length > 0) {
      filter.event_keys = topics;
    }

    return filter;
  }

  pollable() {
    return this.tag.indexOf(':') >= 0 || PollableEvents.indexOf(this.tag) >= 0;
  }

} // eslint-disable-next-line @typescript-eslint/ban-ts-comment

const RPC_ACTION = {
  getChainInfo: 'getChainInfo',
  getNodeInfo: 'getNodeInfo',
  sendTransaction: 'sendTransaction',
  getBlock: 'getBlock',
  getTransactionByHash: 'getTransactionByHash',
  getTransactionInfo: 'getTransactionInfo',
  getEventsOfTransaction: 'getEventsOfTransaction',
  getEvents: 'getEvents',
  call: 'call',
  callV2: 'callV2',
  getCode: 'getCode',
  getResource: 'getResource',
  getAccountState: 'getAccountState',
  getGasPrice: 'getGasPrice',
  dryRun: 'dryRun',
  dryRunRaw: 'dryRunRaw',
  // VM2 specific actions
  sendTransactionV2: 'sendTransactionV2',
  dryRunV2: 'dryRunV2',
  dryRunRawV2: 'dryRunRawV2',
  getResourceV2: 'getResourceV2',
  getCodeV2: 'getCodeV2',
  callV2VM2: 'callV2VM2',
  getAccountStateV2: 'getAccountStateV2',
  resolveFunction: 'resolveFunction',
  resolveFunctionV2: 'resolveFunctionV2'
};
let defaultFormatter;
let nextPollId = 1;
class BaseProvider extends Provider {
  /**
   *  ready
   *
   *  A Promise<Network> that resolves only once the provider is ready.
   *
   *  Sub-classes that call the super with a network without a chainId
   *  MUST set this. Standard named networks have a known chainId.
   *
   */
  constructor(network) {
    logger$4.checkNew(new.target, Provider);
    super(); // Events being listened to

    this._events = [];
    this._emitted = {
      block: -2
    };
    this.formatter = new.target.getFormatter(); // If network is any, this Provider allows the underlying
    // network to change dynamically, and we auto-detect the
    // current network

    defineReadOnly(this, 'anyNetwork', network === 'any');

    if (this.anyNetwork) {
      network = this.detectNetwork();
    }

    if (network instanceof Promise) {
      this._networkPromise = network; // Squash any "unhandled promise" errors; that do not need to be handled
      // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars

      network.catch(error => {}); // Trigger initial network setting (async)
      // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars

      this._ready().catch(error => {});
    } else {
      const knownNetwork = getNetwork(network);

      if (knownNetwork) {
        defineReadOnly(this, '_network', knownNetwork);
        this.emit('network', knownNetwork, null);
      } else {
        logger$4.throwArgumentError('invalid network', 'network', network);
      }
    }

    this._maxInternalBlockNumber = -1024;
    this._lastBlockNumber = -2;
    this._pollingInterval = 4000;
    this._fastQueryDate = 0;
  }

  async _ready() {
    if (this._network == null) {
      let network = null;

      if (this._networkPromise) {
        try {
          network = await this._networkPromise; // eslint-disable-next-line no-empty
        } catch (error) {}
      } // Try the Provider's network detection (this MUST throw if it cannot)


      if (network == null) {
        network = await this.detectNetwork();
      } // This should never happen; every Provider sub-class should have
      // suggested a network by here (or have thrown).


      if (!network) {
        logger$4.throwError('no network detected', Logger.errors.UNKNOWN_ERROR, {});
      } // Possible this call stacked so do not call defineReadOnly again


      if (this._network == null) {
        if (this.anyNetwork) {
          this._network = network;
        } else {
          defineReadOnly(this, '_network', network);
        }

        this.emit('network', network, null);
      }
    }

    return this._network;
  } // This will always return the most recently established network.
  // For "any", this can change (a "network" event is emitted before
  // any change is refelcted); otherwise this cannot change


  get ready() {
    return poll(() => {
      return this._ready().then(network => {
        return network;
      }, error => {
        // If the network isn't running yet, we will wait
        if (error.code === Logger.errors.NETWORK_ERROR && error.event === 'noNetwork') {
          return undefined;
        }

        throw error;
      });
    });
  } // @TODO: Remove this and just create a singleton formatter


  static getFormatter() {
    if (defaultFormatter == null) {
      defaultFormatter = new Formatter();
    }

    return defaultFormatter;
  } // Fetches the blockNumber, but will reuse any result that is less
  // than maxAge old or has been requested since the last request


  async _getInternalBlockNumber(maxAge) {
    await this._ready();
    const internalBlockNumber = this._internalBlockNumber;

    if (maxAge > 0 && this._internalBlockNumber) {
      const result = await internalBlockNumber;

      if (getTime() - result.respTime <= maxAge) {
        return result.blockNumber;
      }
    }

    const reqTime = getTime();
    const checkInternalBlockNumber = resolveProperties({
      blockNumber: this.perform(RPC_ACTION.getChainInfo, {}).then(chainInfo => chainInfo.head.number, err => err),
      networkError: this.getNetwork().then( // eslint-disable-next-line @typescript-eslint/no-unused-vars
      network => null, error => error)
    }).then(({
      blockNumber,
      networkError
    }) => {
      if (networkError) {
        // Unremember this bad internal block number
        if (this._internalBlockNumber === checkInternalBlockNumber) {
          this._internalBlockNumber = null;
        }

        throw networkError;
      }

      const respTime = getTime();
      blockNumber = BigNumber.from(blockNumber).toNumber();

      if (blockNumber < this._maxInternalBlockNumber) {
        blockNumber = this._maxInternalBlockNumber;
      }

      this._maxInternalBlockNumber = blockNumber;

      this._setFastBlockNumber(blockNumber);

      return {
        blockNumber,
        reqTime,
        respTime
      };
    });
    this._internalBlockNumber = checkInternalBlockNumber;
    return (await checkInternalBlockNumber).blockNumber;
  }

  async poll() {
    const pollId = nextPollId++; // Track all running promises, so we can trigger a post-poll once they are complete

    const runners = [];
    const blockNumber = await this._getInternalBlockNumber(100 + this.pollingInterval / 2);

    this._setFastBlockNumber(blockNumber); // Emit a poll event after we have the latest (fast) block number


    this.emit('poll', pollId, blockNumber); // If the block has not changed, meh.

    if (blockNumber === this._lastBlockNumber) {
      this.emit('didPoll', pollId);
      return;
    } // First polling cycle, trigger a "block" events


    if (this._emitted.block === -2) {
      this._emitted.block = blockNumber - 1;
    }

    if (Math.abs(this._emitted.block - blockNumber) > 1000) {
      logger$4.warn('network block skew detected; skipping block events');
      this.emit('error', logger$4.makeError('network block skew detected', Logger.errors.NETWORK_ERROR, {
        blockNumber: blockNumber,
        event: 'blockSkew',
        previousBlockNumber: this._emitted.block
      }));
      this.emit(CONSTANTS.block, blockNumber);
    } else {
      // Notify all listener for each block that has passed
      for (let i = this._emitted.block + 1; i <= blockNumber; i++) {
        this.emit(CONSTANTS.block, i);
      }
    } // The emitted block was updated, check for obsolete events


    if (this._emitted.block !== blockNumber) {
      this._emitted.block = blockNumber;
      Object.keys(this._emitted).forEach(key => {
        // The block event does not expire
        if (key === CONSTANTS.block) {
          return;
        } // The block we were at when we emitted this event


        const eventBlockNumber = this._emitted[key]; // We cannot garbage collect pending transactions or blocks here
        // They should be garbage collected by the Provider when setting
        // "pending" events

        if (eventBlockNumber === 'pending') {
          return;
        } // Evict any transaction hashes or block hashes over 12 blocks
        // old, since they should not return null anyways


        if (blockNumber - eventBlockNumber > 12) {
          delete this._emitted[key];
        }
      });
    } // First polling cycle


    if (this._lastBlockNumber === -2) {
      this._lastBlockNumber = blockNumber - 1;
    } // Find all transaction hashes we are waiting on


    this._events.forEach(event => {
      switch (event.type) {
        case CONSTANTS.tx:
          {
            const hash = event.hash;
            const runner = this.getTransactionInfo(hash).then(receipt => {
              if (!receipt || receipt.block_number == null) {
                return null;
              }

              this._emitted['t:' + hash] = receipt.block_number;
              this.emit(hash, receipt);
              return null;
            }).catch(error => {
              this.emit('error', error);
            });
            runners.push(runner);
            break;
          }

        case CONSTANTS.filter:
          {
            const filter = event.filter;
            filter.from_block = this._lastBlockNumber + 1;
            filter.to_block = blockNumber;
            const runner = this.getTransactionEvents(filter).then(logs => {
              if (logs.length === 0) {
                return;
              }

              logs.forEach(log => {
                this._emitted['b:' + log.block_hash] = log.block_number;
                this._emitted['t:' + log.transaction_hash] = log.block_number;
                this.emit(filter, log);
              });
            }).catch(error => {
              this.emit('error', error);
            });
            runners.push(runner);
            break;
          }
      }
    });

    this._lastBlockNumber = blockNumber; // Once all events for this loop have been processed, emit "didPoll"

    Promise.all(runners).then(() => {
      this.emit('didPoll', pollId);
    });
    return null;
  }

  get network() {
    return this._network;
  }

  async getNetwork() {
    const network = await this._ready(); // Make sure we are still connected to the same network; this is
    // only an external call for backends which can have the underlying
    // network change spontaneously

    const currentNetwork = await this.detectNetwork();

    if (network.chainId !== currentNetwork.chainId) {
      // We are allowing network changes, things can get complex fast;
      // make sure you know what you are doing if you use "any"
      if (this.anyNetwork) {
        this._network = currentNetwork; // Reset all internal block number guards and caches

        this._lastBlockNumber = -2;
        this._fastBlockNumber = null;
        this._fastBlockNumberPromise = null;
        this._fastQueryDate = 0;
        this._emitted.block = -2;
        this._maxInternalBlockNumber = -1024;
        this._internalBlockNumber = null; // The "network" event MUST happen before this method resolves
        // so any events have a chance to unregister, so we stall an
        // additional event loop before returning from /this/ call

        this.emit('network', currentNetwork, network);
        await stall(0);
        return this._network;
      }

      const error = logger$4.makeError('underlying network changed', Logger.errors.NETWORK_ERROR, {
        event: 'changed',
        network: network,
        detectedNetwork: currentNetwork
      });
      this.emit('error', error);
      throw error;
    }

    return network;
  }

  get blockNumber() {
    this._getInternalBlockNumber(100 + this.pollingInterval / 2);

    return this._fastBlockNumber != null ? this._fastBlockNumber : -1;
  }

  get polling() {
    return this._poller != null;
  }

  set polling(value) {
    if (value && !this._poller) {
      this._poller = setInterval(this.poll.bind(this), this.pollingInterval);

      if (!this._bootstrapPoll) {
        this._bootstrapPoll = setTimeout(() => {
          this.poll(); // We block additional polls until the polling interval
          // is done, to prevent overwhelming the poll function

          this._bootstrapPoll = setTimeout(() => {
            // If polling was disabled, something may require a poke
            // since starting the bootstrap poll and it was disabled
            if (!this._poller) {
              this.poll();
            } // Clear out the bootstrap so we can do another


            this._bootstrapPoll = null;
          }, this.pollingInterval);
        }, 0);
      }
    } else if (!value && this._poller) {
      clearInterval(this._poller);
      this._poller = null;
    }
  }

  get pollingInterval() {
    return this._pollingInterval;
  }

  set pollingInterval(value) {
    if (typeof value !== 'number' || value <= 0 || parseInt(String(value)) != value) {
      throw new Error('invalid polling interval');
    }

    this._pollingInterval = value;

    if (this._poller) {
      clearInterval(this._poller);
      this._poller = setInterval(() => {
        this.poll();
      }, this._pollingInterval);
    }
  }

  _getFastBlockNumber() {
    const now = getTime(); // Stale block number, request a newer value

    if (now - this._fastQueryDate > 2 * this._pollingInterval) {
      this._fastQueryDate = now;
      this._fastBlockNumberPromise = this.getBlockNumber().then(blockNumber => {
        if (this._fastBlockNumber == null || blockNumber > this._fastBlockNumber) {
          this._fastBlockNumber = blockNumber;
        }

        return this._fastBlockNumber;
      });
    }

    return this._fastBlockNumberPromise;
  }

  _setFastBlockNumber(blockNumber) {
    // Older block, maybe a stale request
    if (this._fastBlockNumber != null && blockNumber < this._fastBlockNumber) {
      return;
    } // Update the time we updated the blocknumber


    this._fastQueryDate = getTime(); // Newer block number, use  it

    if (this._fastBlockNumber == null || blockNumber > this._fastBlockNumber) {
      this._fastBlockNumber = blockNumber;
      this._fastBlockNumberPromise = Promise.resolve(blockNumber);
    }
  }

  async waitForTransaction(transactionHash, confirmations, timeout) {
    if (confirmations == null) {
      confirmations = 1;
    }

    const transactionInfo = await this.getTransactionInfo(transactionHash); // Receipt is already good

    if ((transactionInfo ? transactionInfo.confirmations : 0) >= confirmations) {
      return Promise.resolve(transactionInfo);
    } // Poll until the receipt is good...


    return new Promise((resolve, reject) => {
      let timer = null;
      let done = false;

      const handler = transactionInfo => {
        if (transactionInfo.confirmations < confirmations) {
          return;
        }

        if (timer) {
          clearTimeout(timer);
        }

        if (done) {
          return;
        }

        done = true;
        this.removeListener(transactionHash, handler);
        resolve(transactionInfo);
      };

      this.on(transactionHash, handler);

      if (typeof timeout === 'number' && timeout > 0) {
        timer = setTimeout(() => {
          if (done) {
            return;
          }

          timer = null;
          done = true;
          this.removeListener(transactionHash, handler);
          reject(logger$4.makeError('timeout exceeded', Logger.errors.TIMEOUT, {
            timeout: timeout
          }));
        }, timeout);

        if (timer.unref) {
          timer.unref();
        }
      }
    });
  }

  async getBlockNumber() {
    return this._getInternalBlockNumber(0);
  }

  async getGasPrice() {
    await this.getNetwork();
    const result = await this.perform(RPC_ACTION.getGasPrice, {});
    return this.formatter.u64(result);
  } // async getBalance(
  //   addressOrName: string | Promise<string>,
  //   blockTag?: BlockTag | Promise<BlockTag>
  // ): Promise<BigNumber> {
  //   await this.getNetwork();
  //   const params = await resolveProperties({
  //     address: this._getAddress(addressOrName),
  //     blockTag: this._getBlockTag(blockTag),
  //   });
  //   return BigNumber.from(await this.perform('getBalance', params));
  // }
  // async getTransactionCount(
  //   addressOrName: string | Promise<string>,
  //   blockTag?: BlockTag | Promise<BlockTag>
  // ): Promise<number> {
  //   await this.getNetwork();
  //   const params = await resolveProperties({
  //     address: this._getAddress(addressOrName),
  //     blockTag: this._getBlockTag(blockTag),
  //   });
  //   return BigNumber.from(
  //     await this.perform('getTransactionCount', params)
  //   ).toNumber();
  // }
  // eslint-disable-next-line consistent-return


  async getCode(moduleId, blockTag) {
    await this.getNetwork();
    const params = await resolveProperties({
      moduleId: BaseProvider.getModuleId(await moduleId),
      blockTag
    });
    const code = await this.perform(RPC_ACTION.getCode, params);

    if (code) {
      return hexlify(code);
    }
  } // get resource data.
  // eslint-disable-next-line consistent-return


  async getResource(address, resource_struct_tag, blockTag) {
    await this.getNetwork();
    const params = await resolveProperties({
      address,
      structTag: resource_struct_tag,
      blockTag
    });
    const value = await this.perform(RPC_ACTION.getResource, params);

    if (value) {
      return this.formatter.moveStruct(value);
    }
  }

  async getResources(address, blockTag) {
    await this.getNetwork();
    const params = await resolveProperties({
      address,
      blockTag
    });
    const value = await this.perform(RPC_ACTION.getAccountState, params);

    if (value) {
      // @ts-ignore
      return Object.entries(value.resources).reduce((o, [k, v]) => _extends({}, o, {
        [k]: this.formatter.moveStruct(v)
      }), {});
    }
  } // This should be called by any subclass wrapping a TransactionResponse


  _wrapTransaction(tx, hash) {
    var _this = this;

    if (hash != null && hexDataLength(hash) !== 32) {
      throw new Error('invalid response - sendTransaction');
    }

    const result = tx; // Check the hash we expect is the same as the hash the server reported

    if (hash != null && tx.transaction_hash !== hash) {
      logger$4.throwError('Transaction hash mismatch from Provider.sendTransaction.', Logger.errors.UNKNOWN_ERROR, {
        expectedHash: tx.transaction_hash,
        returnedHash: hash
      });
    } // @TODO: (confirmations? number, timeout? number)


    result.wait = async function (confirmations) {
      // We know this transaction *must* exist (whether it gets mined is
      // another story), so setting an emitted value forces us to
      // wait even if the node returns null for the receipt
      if (confirmations !== 0) {
        _this._emitted[`t:${tx.transaction_hash}`] = 'pending';
      }

      const receipt = await _this.waitForTransaction(tx.transaction_hash, confirmations);

      if (receipt == null && confirmations === 0) {
        return null;
      } // No longer pending, allow the polling loop to garbage collect this


      _this._emitted[`t:${tx.transaction_hash}`] = receipt.block_number;
      result.block_hash = receipt.block_hash;
      result.block_number = receipt.block_number;
      result.confirmations = confirmations;

      if (receipt.status !== 'Executed') {
        logger$4.throwError('transaction failed', Logger.errors.CALL_EXCEPTION, {
          transactionHash: tx.transaction_hash,
          transaction: tx,
          receipt
        });
      }

      return receipt;
    };

    return result;
  }

  async sendTransaction(signedTransaction) {
    await this.getNetwork();
    const hexTx = await signedTransaction;
    const tx = this.formatter.userTransactionData(hexTx);

    try {
      // FIXME: check rpc call
      await this.perform(RPC_ACTION.sendTransaction, {
        signedTransaction: hexTx
      });
      return this._wrapTransaction(tx);
    } catch (error) {
      error.transaction = tx;
      error.transactionHash = tx.transaction_hash;
      throw error;
    }
  } // async _getTransactionRequest(
  //   transaction: Deferrable<TransactionRequest>
  // ): Promise<Transaction> {
  //   const values: any = await transaction;
  //
  //   const tx: any = {};
  //
  //   ['from', 'to'].forEach((key) => {
  //     if (values[key] == null) {
  //       return;
  //     }
  //     tx[key] = Promise.resolve(values[key]).then((v) =>
  //       v ? this._getAddress(v) : null
  //     );
  //   });
  //
  //   ['gasLimit', 'gasPrice', 'value'].forEach((key) => {
  //     if (values[key] == null) {
  //       return;
  //     }
  //     tx[key] = Promise.resolve(values[key]).then((v) =>
  //       v ? BigNumber.from(v) : null
  //     );
  //   });
  //
  //   ['data'].forEach((key) => {
  //     if (values[key] == null) {
  //       return;
  //     }
  //     tx[key] = Promise.resolve(values[key]).then((v) =>
  //       v ? hexlify(v) : null
  //     );
  //   });
  //
  //   return this.formatter.transactionRequest(await resolveProperties(tx));
  // }


  static getModuleId(moduleId) {
    if (typeof moduleId === 'string') {
      return moduleId;
    }

    return `${moduleId.address}::${moduleId.name}`;
  }

  async _getFilter(filter) {
    const result = await filter; // const result: any = {};
    //
    // ['blockHash', 'topics'].forEach((key) => {
    //   if ((<any>filter)[key] == null) {
    //     return;
    //   }
    //   result[key] = (<any>filter)[key];
    // });
    //
    // ['fromBlock', 'toBlock'].forEach((key) => {
    //   if ((<any>filter)[key] == null) {
    //     return;
    //   }
    //   result[key] = this._getBlockTag((<any>filter)[key]);
    // });

    return this.formatter.filter(await resolveProperties(result));
  }

  async call(request, // eslint-disable-next-line @typescript-eslint/no-unused-vars
  blockTag) {
    await this.getNetwork();
    const params = await resolveProperties({
      request
    });
    params.request.function_id = formatFunctionId(params.request.function_id); // eslint-disable-next-line no-return-await

    const rets = await this.perform(RPC_ACTION.call, params);
    return rets.map(v => this.formatter.moveValue(v));
  }

  async callV2(request, // eslint-disable-next-line @typescript-eslint/no-unused-vars
  blockTag) {
    await this.getNetwork();
    const params = await resolveProperties({
      request
    });
    params.request.function_id = formatFunctionId(params.request.function_id); // eslint-disable-next-line no-return-await

    const rets = await this.perform(RPC_ACTION.callV2, params);
    return rets.map(v => v);
  }

  async dryRun(transaction) {
    await this.getNetwork();
    const params = await resolveProperties({
      transaction
    });
    const resp = await this.perform(RPC_ACTION.dryRun, params);
    return this.formatter.transactionOutput(resp);
  }

  async dryRunRaw(rawUserTransactionHex, publicKeyHex) {
    await this.getNetwork();
    const params = {
      rawUserTransactionHex,
      publicKeyHex
    };
    const resp = await this.perform(RPC_ACTION.dryRunRaw, params);
    return this.formatter.transactionOutput(resp);
  } // VM2 variants


  async sendRawTransactionV2(signedTransactionHex) {
    await this.getNetwork();
    const params = {
      signedTransaction: signedTransactionHex
    };
    return this.perform(RPC_ACTION.sendTransactionV2, params);
  }

  async dryRunRawV2(rawUserTransactionHex, publicKeyHex) {
    await this.getNetwork();
    const params = {
      rawUserTransactionHex,
      publicKeyHex
    };
    const resp = await this.perform(RPC_ACTION.dryRunRawV2, params);
    return this.formatter.transactionOutput(resp);
  }

  async getResourceV2(address, resource_struct_tag) {
    await this.getNetwork();
    const params = await resolveProperties({
      address,
      structTag: resource_struct_tag
    });
    const value = await this.perform(RPC_ACTION.getResourceV2, params);

    if (value) {
      return this.formatter.moveStruct(value);
    }
  }

  async getCodeV2(moduleId) {
    await this.getNetwork();
    const params = await resolveProperties({
      moduleId: BaseProvider.getModuleId(await moduleId)
    });
    const code = await this.perform(RPC_ACTION.getCodeV2, params);

    if (code) {
      return hexlify(code);
    }
  }

  async _getBlock(blockHashOrBlockNumber, includeTransactions) {
    var _this2 = this;

    await this.getNetwork();
    blockHashOrBlockNumber = await blockHashOrBlockNumber; // If blockTag is a number (not "latest", etc), this is the block number

    let blockNumber = -128;
    const params = {
      includeTransactions: !!includeTransactions
    };

    if (isHexString(blockHashOrBlockNumber, 32)) {
      params.blockHash = blockHashOrBlockNumber;
    } else {
      try {
        params.blockNumber = await this._getBlockTag(blockHashOrBlockNumber);
        blockNumber = params.blockNumber;
      } catch (error) {
        logger$4.throwArgumentError('invalid block hash or block number', 'blockHashOrBlockNumber', blockHashOrBlockNumber);
      }
    }

    return poll(async function () {
      const block = await _this2.perform(RPC_ACTION.getBlock, params); // Block was not found

      if (block == null) {
        // For blockhashes, if we didn't say it existed, that blockhash may
        // not exist. If we did see it though, perhaps from a log, we know
        // it exists, and this node is just not caught up yet.
        if (params.blockHash != null) {
          if (_this2._emitted[`b:${params.blockHash}`] == null) {
            return null;
          }
        } // For block number, if we are asking for a future block, we return null


        if (params.blockNumber != null) {
          if (blockNumber > _this2._emitted.block) {
            return null;
          }
        } // Retry on the next block


        return undefined;
      } // Add transactions


      if (includeTransactions) {
        const blockNumber = await _this2._getInternalBlockNumber(100 + 2 * _this2.pollingInterval); // Add the confirmations using the fast block number (pessimistic)

        let confirmations = blockNumber - block.header.number + 1;

        if (confirmations <= 0) {
          confirmations = 1;
        }

        block.confirmations = confirmations;
        return _this2.formatter.blockWithTransactions(block);
      }

      return _this2.formatter.blockWithTxnHashes(block);
    }, {
      oncePoll: this
    });
  } // getBlock(
  //   blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>
  // ): Promise<BlockWithTxnHashes> {
  //   return <Promise<BlockWithTxnHashes>>(
  //     this._getBlock(blockHashOrBlockTag, true)
  //   );
  // }


  getBlock(blockTag) {
    return this._getBlock(blockTag, true);
  }

  async getTransaction(transactionHash) {
    var _this3 = this;

    await this.getNetwork();
    transactionHash = await transactionHash;
    const params = {
      transactionHash: this.formatter.hash(transactionHash, true)
    };
    return poll(async function () {
      const result = await _this3.perform(RPC_ACTION.getTransactionByHash, params);

      if (result == null) {
        if (_this3._emitted[`t:${transactionHash}`] == null) {
          return null;
        }

        return undefined;
      }

      const tx = _this3.formatter.transactionResponse(result);

      if (tx.block_number === undefined) {
        tx.confirmations = 0;
      } else if (tx.confirmations === undefined) {
        const blockNumber = await _this3._getInternalBlockNumber(100 + 2 * _this3.pollingInterval); // Add the confirmations using the fast block number (pessimistic)

        let confirmations = blockNumber - tx.block_number + 1;

        if (confirmations <= 0) {
          confirmations = 1;
        }

        tx.confirmations = confirmations;
      }

      return _this3._wrapTransaction(tx);
    }, {
      oncePoll: this
    });
  }

  async getTransactionInfo(transactionHash) {
    var _this4 = this;

    await this.getNetwork();
    transactionHash = await transactionHash;
    const params = {
      transactionHash: this.formatter.hash(transactionHash, true)
    };
    return poll(async function () {
      const result = await _this4.perform(RPC_ACTION.getTransactionInfo, params);

      if (result === null) {
        if (_this4._emitted[`t:${transactionHash}`] === null) {
          return null;
        }

        return undefined;
      }

      if (result.block_hash === null) {
        return undefined;
      }

      const transactionInfo = _this4.formatter.transactionInfo(result);

      if (transactionInfo.block_number === null) {
        transactionInfo.confirmations = 0;
      } else if (!transactionInfo.confirmations) {
        const blockNumber = await _this4._getInternalBlockNumber(100 + 2 * _this4.pollingInterval); // Add the confirmations using the fast block number (pessimistic)

        let confirmations = blockNumber - transactionInfo.block_number + 1;

        if (confirmations <= 0) {
          confirmations = 1;
        }

        transactionInfo.confirmations = confirmations;
      }

      return transactionInfo;
    }, {
      oncePoll: this
    });
  }

  async getEventsOfTransaction(transactionHash) {
    await this.getNetwork();
    transactionHash = await transactionHash;
    const params = {
      transactionHash: this.formatter.hash(transactionHash, true)
    };
    const logs = await this.perform(RPC_ACTION.getEventsOfTransaction, params);
    return Formatter.arrayOf(this.formatter.transactionEvent.bind(this.formatter))(logs);
  }

  async getTransactionEvents(filter) {
    await this.getNetwork();
    const params = await resolveProperties({
      filter
    });
    const logs = await this.perform(RPC_ACTION.getEvents, params);
    return Formatter.arrayOf(this.formatter.transactionEvent.bind(this.formatter))(logs);
  }

  async _getBlockTag(blockTag) {
    blockTag = await blockTag;

    if (blockTag < 0) {
      if (blockTag % 1) {
        logger$4.throwArgumentError('invalid BlockTag', 'blockTag', blockTag);
      }

      let blockNumber = await this._getInternalBlockNumber(100 + 2 * this.pollingInterval);
      blockNumber += blockTag;

      if (blockNumber < 0) {
        blockNumber = 0;
      }

      return blockNumber;
    } else {
      return blockTag;
    }
  } // eslint-disable-next-line @typescript-eslint/no-unused-vars


  _startEvent(event) {
    this.polling = this._events.filter(e => e.pollable()).length > 0;
  } // eslint-disable-next-line @typescript-eslint/no-unused-vars


  _stopEvent(event) {
    this.polling = this._events.filter(e => e.pollable()).length > 0;
  }

  _addEventListener(eventName, listener, once) {
    const event = new Event(getEventTag(eventName), listener, once);

    this._events.push(event);

    this._startEvent(event);

    return this;
  }

  on(eventName, listener) {
    return this._addEventListener(eventName, listener, false);
  }

  once(eventName, listener) {
    return this._addEventListener(eventName, listener, true);
  }

  emit(eventName, ...args) {
    let result = false;
    const stopped = [];
    const eventTag = getEventTag(eventName);
    this._events = this._events.filter(event => {
      if (event.tag !== eventTag) {
        return true;
      }

      setTimeout(() => {
        event.listener.apply(this, args);
      }, 0);
      result = true;

      if (event.once) {
        stopped.push(event);
        return false;
      }

      return true;
    });
    stopped.forEach(event => {
      this._stopEvent(event);
    });
    return result;
  }

  listenerCount(eventName) {
    if (!eventName) {
      return this._events.length;
    }

    const eventTag = getEventTag(eventName);
    return this._events.filter(event => {
      return event.tag === eventTag;
    }).length;
  }

  listeners(eventName) {
    if (eventName == null) {
      return this._events.map(event => event.listener);
    }

    const eventTag = getEventTag(eventName);
    return this._events.filter(event => event.tag === eventTag).map(event => event.listener);
  }

  off(eventName, listener) {
    if (listener === null) {
      return this.removeAllListeners(eventName);
    }

    const stopped = [];
    let found = false;
    const eventTag = getEventTag(eventName);
    this._events = this._events.filter(event => {
      if (event.tag !== eventTag || event.listener !== listener) {
        return true;
      }

      if (found) {
        return true;
      }

      found = true;
      stopped.push(event);
      return false;
    });
    stopped.forEach(event => {
      this._stopEvent(event);
    });
    return this;
  }

  removeAllListeners(eventName) {
    let stopped = [];

    if (eventName === null) {
      stopped = this._events;
      this._events = [];
    } else {
      const eventTag = getEventTag(eventName);
      this._events = this._events.filter(event => {
        if (event.tag !== eventTag) {
          return true;
        }

        stopped.push(event);
        return false;
      });
    }

    stopped.forEach(event => {
      this._stopEvent(event);
    });
    return this;
  }

}

const logger$5 = new Logger(version);
const allowedTransactionKeys = new Set(['sender', 'sender_public_key', 'sequence_number', 'script', 'modules', 'max_gas_amount', 'gas_unit_price', 'gas_token_code', 'chain_id']); // FIXME: change the error data.

const forwardErrors = new Set([Logger.errors.INSUFFICIENT_FUNDS, Logger.errors.NONCE_EXPIRED, Logger.errors.REPLACEMENT_UNDERPRICED]);
class Signer {
  // Sub-classes MUST call super
  constructor() {
    logger$5.checkAbstract(new.target, Signer);
    defineReadOnly(this, '_isSigner', true);
  } // Sub-classes MAY override these


  async getBalance(token, blockTag) {
    this.checkProvider('getBalance');
    return this.provider.getBalance(this.getAddress(), token, blockTag);
  } // FIXME: check pending txn in txpool


  async getSequenceNumber(blockTag) {
    this.checkProvider('getSequenceNumber');
    return this.provider.getSequenceNumber(this.getAddress(), blockTag);
  } // Populates "from" if unspecified, and estimates the gas for the transation


  async estimateGas(transaction) {
    this.checkProvider('estimateGas');
    const tx = await resolveProperties(this.checkTransaction(transaction));
    const txnOutput = await this.provider.dryRun(tx);

    if (typeof txnOutput.gas_used === 'number') {
      return 3 * txnOutput.gas_used;
    }

    return BigInt(3) * txnOutput.gas_used.valueOf();
  } // calls with the transaction
  // async call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag): Promise<string> {
  //   this.checkProvider('call');
  //   const tx = await resolveProperties(this.checkTransaction(transaction));
  //   return await this.provider.call(tx, blockTag);
  // }
  // Populates all fields in a transaction, signs it and sends it to the network


  sendTransaction(transaction) {
    this.checkProvider('sendTransaction');
    return this.populateTransaction(transaction).then(tx => {
      return this.signTransaction(tx).then(signedTx => {
        return this.provider.sendTransaction(signedTx);
      });
    });
  }

  async getChainId() {
    this.checkProvider('getChainId');
    const network = await this.provider.getNetwork();
    return network.chainId;
  }

  async getGasPrice() {
    this.checkProvider('getGasPrice');
    return this.provider.getGasPrice();
  } // Checks a transaction does not contain invalid keys and if
  // no "from" is provided, populates it.
  // - does NOT require a provider
  // - adds "from" is not present
  // - returns a COPY (safe to mutate the result)
  // By default called from: (overriding these prevents it)
  //   - call
  //   - estimateGas
  //   - populateTransaction (and therefor sendTransaction)


  checkTransaction(transaction) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(transaction)) {
      if (!allowedTransactionKeys.has(key)) {
        logger$5.throwArgumentError(`invalid transaction key: ${key}`, 'transaction', transaction);
      }
    }

    const tx = shallowCopy(transaction);

    if (tx.sender === undefined) {
      tx.sender = this.getAddress();
    } else {
      // Make sure any provided address matches this signer
      tx.sender = Promise.all([Promise.resolve(tx.sender), this.getAddress()]).then(result => {
        if (result[0] !== result[1]) {
          logger$5.throwArgumentError('from address mismatch', 'transaction', transaction);
        }

        return result[0];
      });
    }

    return tx;
  } // Populates ALL keys for a transaction and checks that "from" matches
  // this Signer. Should be used by sendTransaction but NOT by signTransaction.
  // By default called from: (overriding these prevents it)
  //   - sendTransaction


  async populateTransaction(transaction) {
    const tx = await resolveProperties(this.checkTransaction(transaction));

    if (tx.gas_unit_price === undefined) {
      tx.gas_unit_price = this.getGasPrice();
    }

    if (tx.sequence_number === undefined) {
      tx.sequence_number = this.getSequenceNumber('pending');
    }

    if (tx.chain_id === undefined) {
      tx.chain_id = this.getChainId();
    } else {
      tx.chain_id = Promise.all([Promise.resolve(tx.chain_id), this.getChainId()]).then(results => {
        if (results[1] !== 0 && results[0] !== results[1]) {
          logger$5.throwArgumentError('chainId address mismatch', 'transaction', transaction);
        }

        return results[0];
      });
    }

    if (tx.max_gas_amount === undefined) {
      tx.max_gas_amount = this.estimateGas(tx).catch(error => {
        if (forwardErrors.has(error.code)) {
          throw error;
        }

        console.log(`err: ${error}`);
        return logger$5.throwError('cannot estimate gas; transaction may fail or may require manual gas limit', Logger.errors.UNPREDICTABLE_GAS_LIMIT, {
          error,
          tx
        });
      });
    }

    return resolveProperties(tx);
  } // Sub-classes SHOULD leave these alone
  // eslint-disable-next-line no-underscore-dangle


  checkProvider(operation) {
    if (!this.provider) {
      logger$5.throwError('missing provider', Logger.errors.UNSUPPORTED_OPERATION, {
        operation: operation || '_checkProvider'
      });
    }
  } // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types


  static isSigner(value) {
    // eslint-disable-next-line no-underscore-dangle
    return !!(value && value._isSigner);
  }

}

// eslint-disable-next-line max-classes-per-file
const logger$6 = new Logger(version);
const errorGas = new Set(['call', 'estimateGas']); // FIXME: recheck the error.

function checkError(method, error, params) {
  let {
    message
  } = error;

  if (error.code === Logger.errors.SERVER_ERROR && error.error && typeof error.error.message === 'string') {
    message = error.error.message;
  } else if (typeof error.body === 'string') {
    message = error.body;
  } else if (typeof error.responseText === 'string') {
    message = error.responseText;
  }

  message = (message || '').toLowerCase();
  const transaction = params.transaction || params.signedTransaction; // "insufficient funds for gas * price + value + cost(data)"

  if (message.match(/insufficient funds/)) {
    logger$6.throwError('insufficient funds for intrinsic transaction cost', Logger.errors.INSUFFICIENT_FUNDS, {
      error,
      method,
      transaction
    });
  } // "nonce too low"


  if (message.match(/nonce too low/)) {
    logger$6.throwError('nonce has already been used', Logger.errors.NONCE_EXPIRED, {
      error,
      method,
      transaction
    });
  } // "replacement transaction underpriced"


  if (message.match(/replacement transaction underpriced/)) {
    logger$6.throwError('replacement fee too low', Logger.errors.REPLACEMENT_UNDERPRICED, {
      error,
      method,
      transaction
    });
  }

  if (errorGas.has(method) && message.match(/gas required exceeds allowance|always failing transaction|execution reverted/)) {
    logger$6.throwError('cannot estimate gas; transaction may fail or may require manual gas limit', Logger.errors.UNPREDICTABLE_GAS_LIMIT, {
      error,
      method,
      transaction
    });
  }

  throw error;
}

function timer(timeout) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
}

function getResult(payload) {
  if (payload.error) {
    // @TODO: not any
    const error = new Error(payload.error.message);
    error.code = payload.error.code;
    error.data = payload.error.data;
    throw error;
  }

  return payload.result;
}

const _constructorGuard = {};
class JsonRpcSigner extends Signer {
  // eslint-disable-next-line no-use-before-define
  constructor(constructorGuard, provider, addressOrIndex) {
    logger$6.checkNew(new.target, JsonRpcSigner);
    super();

    if (constructorGuard !== _constructorGuard) {
      throw new Error('do not call the JsonRpcSigner constructor directly; use provider.getSigner');
    }

    defineReadOnly(this, 'provider', provider); // eslint-disable-next-line no-param-reassign

    if (addressOrIndex === undefined) {
      addressOrIndex = 0;
    }

    if (typeof addressOrIndex === 'string') {
      defineReadOnly(this, '_address', this.provider.formatter.address(addressOrIndex));
    } else if (typeof addressOrIndex === 'number') {
      defineReadOnly(this, '_index', addressOrIndex);
    } else {
      logger$6.throwArgumentError('invalid address or index', 'addressOrIndex', addressOrIndex);
    }
  } // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this


  connect(provider) {
    return logger$6.throwError('cannot alter JSON-RPC Signer connection', Logger.errors.UNSUPPORTED_OPERATION, {
      operation: 'connect'
    });
  } // connectUnchecked(): JsonRpcSigner {
  //   return new UncheckedJsonRpcSigner(_constructorGuard, this.provider, this._address || this._index);
  // }


  async getAddress() {
    // eslint-disable-next-line no-underscore-dangle
    if (this._address) {
      // eslint-disable-next-line no-underscore-dangle
      return Promise.resolve(this._address);
    }

    return this.provider.send("stc_accounts", []).then(accounts => {
      if (accounts.length <= this._index) {
        logger$6.throwError("unknown account #" + this._index, Logger.errors.UNSUPPORTED_OPERATION, {
          operation: "getAddress"
        });
      }

      return this.provider.formatter.address(accounts[this._index]);
    });
  }

  sendUncheckedTransaction(transaction) {
    logger$6.debug('sendUncheckedTransaction', transaction);
    transaction = shallowCopy(transaction);
    const fromAddress = this.getAddress().then(address => {
      if (address) {
        address = address.toLowerCase();
      }

      return address;
    });
    logger$6.debug(fromAddress); // Since contract.dry_run_raw need publicKey, so we can not do it here.
    // we can only do estimateGas in the StarMask -> MetaMaskController -> newUnapprovedTransaction
    // The JSON-RPC for eth_sendTransaction uses 90000 gas; if the user
    // wishes to use this, it is easy to specify explicitly, otherwise
    // we look it up for them.
    // if (transaction.gasLimit == null) {
    //   const estimate = shallowCopy(transaction);
    //   estimate.from = fromAddress;
    //   transaction.gasLimit = this.provider.estimateGas(estimate);
    // }

    return resolveProperties({
      tx: resolveProperties(transaction),
      sender: fromAddress
    }).then(({
      tx,
      sender
    }) => {
      if (tx.from != null) {
        if (tx.from.toLowerCase() !== sender) {
          logger$6.throwArgumentError("from address mismatch", "transaction", transaction);
        }
      } else {
        tx.from = sender;
      }

      const hexTx = this.provider.constructor.hexlifyTransaction(tx, {
        from: true,
        expiredSecs: true,
        addGasBufferMultiplier: true
      });

      if (tx.addGasBufferMultiplier && typeof tx.addGasBufferMultiplier === 'number') {
        hexTx.addGasBufferMultiplier = tx.addGasBufferMultiplier.toString();
      }

      logger$6.debug(hexTx);
      return this.provider.send("stc_sendTransaction", [hexTx]).then(hash => {
        return hash;
      }, error => {
        if (error.responseText) {
          // See: JsonRpcProvider.sendTransaction (@TODO: Expose a ._throwError??)
          if (error.responseText.indexOf("insufficient funds") >= 0) {
            logger$6.throwError("insufficient funds", Logger.errors.INSUFFICIENT_FUNDS, {
              transaction: tx
            });
          }

          if (error.responseText.indexOf("nonce too low") >= 0) {
            logger$6.throwError("nonce has already been used", Logger.errors.NONCE_EXPIRED, {
              transaction: tx
            });
          }

          if (error.responseText.indexOf("replacement transaction underpriced") >= 0) {
            logger$6.throwError("replacement fee too low", Logger.errors.REPLACEMENT_UNDERPRICED, {
              transaction: tx
            });
          }
        }

        throw error;
      });
    });
  }

  async signTransaction(transaction) {
    // eslint-disable-next-line no-param-reassign
    const request = await resolveProperties(transaction);
    const sender = await this.getAddress();

    if (request.sender !== undefined) {
      if (request.sender !== sender) {
        logger$6.throwArgumentError('from address mismatch', 'transaction', transaction);
      }
    } else {
      request.sender = sender;
    }

    return this.provider.send('account.sign_txn_request', [request]).then(hexTxnData => {
      return hexTxnData;
    }, error => {
      return checkError('signTransaction', error, request);
    });
  } // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars


  async signMessage(message) {
    // return logger.throwError('signing message is unsupported', Logger.errors.UNSUPPORTED_OPERATION, {
    //  operation: 'signMessage'
    // });
    const {
      provider
    } = this;
    const address = await this.getAddress();
    let u8a;

    if (typeof message === 'string') {
      u8a = new Uint8Array(Buffer.from(message));
    } else if (isBytes(message)) {
      u8a = message;
    } else {
      return logger$6.throwError('type of message input is unsupported', Logger.errors.UNSUPPORTED_OPERATION, {
        operation: 'signMessage'
      });
    }

    const msgArray = Array.from(u8a);
    const messageArg = {
      message: msgArray
    };
    return provider.send('account.sign', [address.toLowerCase(), messageArg]);
    /*
    return this.provider.send('account.sign', [request]).then((hexSignedMessageData) => {
        return hexSignedMessageData;
      },
      (error) => {
        return checkError('signMessage', error, request);
      });
    */
    // const data = ((typeof(message) === "string") ? toUtf8Bytes(message): message);
    // const address = await this.getAddress();
    //
    // // https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign
    // return this.provider.send("eth_sign", [ address.toLowerCase(), hexlify(data) ]);
  }

  async unlock(password) {
    const {
      provider
    } = this;
    const address = await this.getAddress();
    return provider.send('account.unlock', [address.toLowerCase(), password, undefined]);
  }

} // class UncheckedJsonRpcSigner extends JsonRpcSigner {
//   sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
//     return this.sendUncheckedTransaction(transaction).then((hash) => {
//       return <TransactionResponse>{
//         hash: hash,
//         nonce: null,
//         gasLimit: null,
//         gasPrice: null,
//         data: null,
//         value: null,
//         chainId: null,
//         confirmations: 0,
//         from: null,
//         wait: (confirmations?: number) => { return this.provider.waitForTransaction(hash, confirmations); }
//       };
//     });
//   }
// }

const allowedTransactionKeys$1 = {
  chainId: true,
  data: true,
  functionAptos: true,
  gasLimit: true,
  gasPrice: true,
  nonce: true,
  to: true,
  value: true
};
class JsonRpcProvider extends BaseProvider {
  constructor(url, network) {
    logger$6.checkNew(new.target, JsonRpcProvider);
    let networkOrReady = network; // The network is unknown, query the JSON-RPC for it

    if (networkOrReady == null) {
      networkOrReady = new Promise((resolve, reject) => {
        setTimeout(() => {
          this.detectNetwork().then(network => {
            resolve(network);
          }, error => {
            reject(error);
          });
        }, 0);
      });
    }

    super(networkOrReady); // Default URL

    if (!url) {
      url = getStatic(this.constructor, 'defaultUrl')();
    }

    if (typeof url === 'string') {
      defineReadOnly(this, 'connection', Object.freeze({
        url: url
      }));
    } else {
      defineReadOnly(this, 'connection', Object.freeze(shallowCopy(url)));
    }

    this._nextId = 42;
  }

  static defaultUrl() {
    return 'https://main-seed.starcoin.org';
  }

  async detectNetwork() {
    await timer(0);
    let chainId = null;

    try {
      const resp = await this.send('chain.id', []);
      chainId = resp.id;
    } catch (error) {
      try {
        const chainInfo = await this.perform(RPC_ACTION.getChainInfo, null);
        chainId = chainInfo.chain_id; // eslint-disable-next-line no-empty
      } catch (error) {}
    }

    if (chainId != null) {
      try {
        const isAptos = this.isAptos();
        return getNetwork(BigNumber.from(chainId).toNumber(), isAptos);
      } catch (error) {
        return logger$6.throwError('could not detect network', Logger.errors.NETWORK_ERROR, {
          chainId: chainId,
          event: 'invalidNetwork',
          serverError: error
        });
      }
    }

    return logger$6.throwError('could not detect network', Logger.errors.NETWORK_ERROR, {
      event: 'noNetwork'
    });
  }

  getSigner(addressOrIndex) {
    return new JsonRpcSigner(_constructorGuard, this, addressOrIndex);
  } // getUncheckedSigner(addressOrIndex?: string | number): UncheckedJsonRpcSigner {
  //   return this.getSigner(addressOrIndex).connectUnchecked();
  // }


  async getNowSeconds() {
    const nodeInfo = await this.perform(RPC_ACTION.getNodeInfo, null);
    return nodeInfo.now_seconds;
  }

  isAptos() {
    return /aptoslabs\.com/.test(this.connection.url);
  }

  send(method, params) {
    const isAptos = this.isAptos(); // most aptos Rest APIs used in Dapp's injected window.starcoin is GET

    if (isAptos) {
      const _request = null;
      let fetchUrl = this.connection.url; // default for chain.id, chain.info

      if (method === 'state.list_resource' || method === 'getAccountResources') {
        fetchUrl = `${fetchUrl}accounts/${params[0]}/resources`;
      }

      if (method === 'getAccount') {
        fetchUrl = `${fetchUrl}accounts/${params[0]}`;
      }

      if (method === 'getAccountResource') {
        fetchUrl = `${fetchUrl}accounts/${params[0]}/resource/${encodeURI(params[1])}`;
      }

      if (method === 'chain.get_transaction_info') {
        fetchUrl = `${fetchUrl}transactions/by_hash/${params[0]}`;
      }

      return fetchJson(fetchUrl).then(data => {
        console.log({
          data
        });
        this.emit('debug', {
          action: 'response',
          request: _request,
          response: data,
          provider: this
        });
        let result;

        switch (method) {
          case 'chain.id':
            const network = this.connection.url.split('.')[1];
            result = {
              id: data.chain_id,
              name: network
            };
            break;

          case 'chain.info':
            result = {
              head: {
                number: Number(data.block_height)
              }
            };
            break;

          default:
            result = data;
        }

        return result;
      }, error => {
        this.emit('debug', {
          action: 'response',
          error,
          request: _request,
          provider: this
        });
        throw error;
      });
    } // starcoin


    const request = {
      method,
      params,
      id: this._nextId++,
      jsonrpc: '2.0'
    };
    this.emit('debug', {
      action: 'request',
      request: deepCopy(request),
      provider: this
    });
    return fetchJson(this.connection, JSON.stringify(request), getResult).then(result => {
      this.emit('debug', {
        action: 'response',
        request,
        response: result,
        provider: this
      });
      return result;
    }, error => {
      this.emit('debug', {
        action: 'response',
        error,
        request,
        provider: this
      });
      throw error;
    });
  } // eslint-disable-next-line consistent-return


  prepareRequest(method, params) {
    switch (method) {
      case RPC_ACTION.getChainInfo:
        return ['chain.info', []];

      case RPC_ACTION.getNodeInfo:
        return ['node.info', []];

      case RPC_ACTION.getGasPrice:
        return ['txpool.gas_price', []];

      case RPC_ACTION.dryRun:
        return ['contract.dry_run', [params.transaction]];

      case RPC_ACTION.dryRunRaw:
        return ['contract.dry_run_raw', [params.rawUserTransactionHex, params.publicKeyHex]];
      // case 'getBalance':
      //   return [
      //     'eth_getBalance',
      //     [getLowerCase(params.address), params.blockTag],
      //   ];
      // case 'getTransactionCount':
      //   return [
      //     'eth_getTransactionCount',
      //     [getLowerCase(params.address), params.blockTag],
      //   ];
      // case 'getCode':
      //   return ['eth_getCode', [getLowerCase(params.address), params.blockTag]];
      //
      // case 'getStorageAt':
      //   return [
      //     'eth_getStorageAt',
      //     [getLowerCase(params.address), params.position, params.blockTag],
      //   ];

      case RPC_ACTION.sendTransaction:
        return ['txpool.submit_hex_transaction', [params.signedTransaction]];

      case RPC_ACTION.getBlock:
        if (params.blockNumber !== undefined) {
          return ['chain.get_block_by_number', [params.blockNumber]];
        }

        if (params.blockHash !== undefined) {
          return ['chain.get_block_by_hash', [params.blockHash]];
        }

        break;

      case RPC_ACTION.getTransactionByHash:
        return ['chain.get_transaction', [params.transactionHash]];

      case RPC_ACTION.getTransactionInfo:
        return ['chain.get_transaction_info', [params.transactionHash]];

      case RPC_ACTION.getEventsOfTransaction:
        return ['chain.get_events_by_txn_hash', [params.transactionHash]];

      case RPC_ACTION.getCode:
        return ['contract.get_code', [params.moduleId]];

      case RPC_ACTION.getResource:
        return ['contract.get_resource', [params.address, params.structTag]];

      case RPC_ACTION.getAccountState:
        return ['state.get_account_state_set', [params.address]];

      case RPC_ACTION.call:
        return ['contract.call', [params.request]];

      case RPC_ACTION.callV2:
        return ['contract.call_v2', [params.request]];
      // case 'estimateGas': {
      //   const hexlifyTransaction = getStatic<
      //     (
      //       t: TransactionRequest,
      //       a?: { [key: string]: boolean }
      //     ) => { [key: string]: string }
      //   >(this.constructor, 'hexlifyTransaction');
      //   return [
      //     'eth_estimateGas',
      //     [hexlifyTransaction(params.transaction, { from: true })],
      //   ];
      // }

      case RPC_ACTION.getEvents:
        return ['chain.get_events', [params.filter]];
      // VM2 specific RPC methods

      case RPC_ACTION.sendTransactionV2:
        return ['txpool.submit_hex_transaction2', [params.signedTransaction]];

      case RPC_ACTION.dryRunV2:
        return ['contract2.dry_run', [params.transaction]];

      case RPC_ACTION.dryRunRawV2:
        return ['contract2.dry_run_raw', [params.rawUserTransactionHex, params.publicKeyHex]];

      case RPC_ACTION.getResourceV2:
        return ['state2.get_resource', [params.address, params.structTag]];

      case RPC_ACTION.getCodeV2:
        return ['contract2.get_code', [params.moduleId]];

      case RPC_ACTION.callV2VM2:
        return ['contract2.call_v2', [params.request]];

      case RPC_ACTION.getAccountStateV2:
        return ['state2.get_account_state_set', [params.address]];

      case RPC_ACTION.resolveFunction:
        return ['contract.resolve_function', [params.functionId]];

      case RPC_ACTION.resolveFunctionV2:
        return ['contract2.resolve_function', [params.functionId]];
      // if (params instanceof Array) {
      //   return [method, params];
      // } else {
      //   return [method, [params]];
      // }
    }
  }

  async perform(method, params) {
    const args = this.prepareRequest(method, params);

    if (args === undefined) {
      logger$6.throwError(`${method} not implemented`, Logger.errors.NOT_IMPLEMENTED, {
        operation: method
      });
    }

    try {
      return await this.send(args[0], args[1]);
    } catch (error) {
      return checkError(method, error, params);
    }
  }

  _startEvent(event) {
    if (event.tag === 'pending') {
      // this._startPending();
      logger$6.throwError('pending event not implemented', Logger.errors.NOT_IMPLEMENTED, {
        operation: 'pending event'
      });
    }

    super._startEvent(event);
  } // _startPending(): void {
  //   if (this._pendingFilter != null) {
  //     return;
  //   }
  //   // eslint-disable-next-line @typescript-eslint/no-this-alias
  //   const self = this;
  //
  //   const pendingFilter: Promise<number> = this.send(
  //     'eth_newPendingTransactionFilter',
  //     []
  //   );
  //   this._pendingFilter = pendingFilter;
  //
  //   pendingFilter
  //     .then(function (filterId) {
  //       function poll() {
  //         self
  //           .send('eth_getFilterChanges', [filterId])
  //           .then(function (hashes: Array<string>) {
  //             if (self._pendingFilter != pendingFilter) {
  //               return null;
  //             }
  //
  //             let seq = Promise.resolve();
  //             hashes.forEach(function (hash) {
  //               // @TODO: This should be garbage collected at some point... How? When?
  //               // @ts-ignore
  //               self._emitted['t:' + hash.toLowerCase()] = CONSTANTS.pending;
  //               seq = seq.then(function () {
  //                 return self.getTransaction(hash).then(function (tx) {
  //                   self.emit(CONSTANTS.pending, tx);
  //                   return null;
  //                 });
  //               });
  //             });
  //
  //             return seq.then(function () {
  //               return timer(1000);
  //             });
  //           })
  //           .then(function () {
  //             if (self._pendingFilter != pendingFilter) {
  //               self.send('eth_uninstallFilter', [filterId]);
  //               return;
  //             }
  //             setTimeout(function () {
  //               poll();
  //             }, 0);
  //
  //             return null;
  //           })
  //           // eslint-disable-next-line @typescript-eslint/no-empty-function
  //           .catch((error: Error) => {});
  //       }
  //       poll();
  //
  //       return filterId;
  //     })
  //     // eslint-disable-next-line @typescript-eslint/no-empty-function
  //     .catch((error: Error) => {});
  // }


  _stopEvent(event) {
    if (event.tag === CONSTANTS.pending && this.listenerCount(CONSTANTS.pending) === 0) {
      this._pendingFilter = null;
    }

    super._stopEvent(event);
  } // Convert an ethers.js transaction into a JSON-RPC transaction
  //  - gasLimit => gas
  //  - All values hexlified
  //  - All numeric values zero-striped
  //  - All addresses are lowercased
  // NOTE: This allows a TransactionRequest, but all values should be resolved
  //       before this is called
  // @TODO: This will likely be removed in future versions and prepareRequest
  //        will be the preferred method for this.


  static hexlifyTransaction(transaction, allowExtra) {
    // Check only allowed properties are given
    const allowed = shallowCopy(allowedTransactionKeys$1);

    if (allowExtra) {
      for (const key in allowExtra) {
        if (allowExtra[key]) {
          allowed[key] = true;
        }
      }
    }

    checkProperties(transaction, allowed);
    const result = {}; // Some nodes (INFURA ropsten; INFURA mainnet is fine) do not like leading zeros.

    ["gasLimit", "gasPrice", "nonce", "value", "expiredSecs"].forEach(function (key) {
      if (transaction[key] == null) {
        return;
      }

      const value = hexValue(transaction[key]);

      if (key === "gasLimit") {
        key = "gas";
      }

      result[key] = value;
    });
    ["from", "to", "data"].forEach(function (key) {
      if (transaction[key] == null) {
        return;
      }

      result[key] = hexlify(transaction[key]);
    });
    ["functionAptos"].forEach(function (key) {
      if (transaction[key] == null) {
        return;
      }

      result[key] = transaction[key];
    });
    return result;
  }

}

/* eslint-disable @typescript-eslint/no-explicit-any */
function encodeTransactionScript(code, ty_args, args) {
  const script = new Script(code, ty_args.map(t => typeTagToSCS(t)), args.map(t => arrayify(t)));
  return new TransactionPayloadVariantScript(script);
}
function encodeStarcoinTypesScriptFunction(functionId, tyArgs, args) {
  const funcId = parseFunctionId(functionId);
  const scriptFunction = new ScriptFunction(new ModuleId(addressToSCS(funcId.address), new Identifier(funcId.module)), new Identifier(funcId.functionName), tyArgs.map(t => typeTagToSCS(t)), args);
  return scriptFunction;
}
function encodeScriptFunction(functionId, tyArgs, args) {
  const scriptFunction = encodeStarcoinTypesScriptFunction(functionId, tyArgs, args);
  return new TransactionPayloadVariantScriptFunction(scriptFunction);
}
function encodeStarcoinTypesPackage(moduleAddress, moduleCodes, initScriptFunction) {
  const modules = moduleCodes.map(m => new Module(arrayify(m)));
  let scriptFunction = null;

  if (!!initScriptFunction) {
    scriptFunction = encodeStarcoinTypesScriptFunction(initScriptFunction.functionId, initScriptFunction.tyArgs, initScriptFunction.args);
  }

  const packageData = new Package(addressToSCS(moduleAddress), modules, scriptFunction);
  return packageData;
}
function encodePackage(moduleAddress, moduleCodes, initScriptFunction) {
  const packageData = encodeStarcoinTypesPackage(moduleAddress, moduleCodes, initScriptFunction);
  return new TransactionPayloadVariantPackage(packageData);
} // Step 1: generate RawUserTransaction

function generateRawUserTransaction(senderAddress, payload, maxGasAmount, gasUnitPrice, senderSequenceNumber, expirationTimestampSecs, chainId) {
  // Step 1-2: generate RawUserTransaction
  const sender = addressToSCS(senderAddress);
  const sequence_number = BigInt(senderSequenceNumber);
  const max_gas_amount = BigInt(maxGasAmount);
  const gas_unit_price = BigInt(gasUnitPrice);
  const gas_token_code = '0x1::STC::STC';
  const expiration_timestamp_secs = BigInt(expirationTimestampSecs);
  const chain_id = new ChainId(chainId);
  const rawUserTransaction = new RawUserTransaction(sender, sequence_number, payload, max_gas_amount, gas_unit_price, gas_token_code, expiration_timestamp_secs, chain_id);
  return rawUserTransaction;
}
async function getSignatureHex(rawUserTransaction, senderPrivateKey) {
  const hasher = createRawUserTransactionHasher();
  const hashSeedBytes = hasher.get_salt();

  const rawUserTransactionBytes = function () {
    const se = new BcsSerializer();
    rawUserTransaction.serialize(se);
    return se.getBytes();
  }();

  const msgBytes = ((a, b) => {
    const tmp = new Uint8Array(a.length + b.length);
    tmp.set(a, 0);
    tmp.set(b, a.length);
    return tmp;
  })(hashSeedBytes, rawUserTransactionBytes);

  const signatureBytes = await sign(msgBytes, stripHexPrefix(senderPrivateKey));
  const signatureHex = hexlify(signatureBytes);
  return signatureHex;
}

async function generateSignedUserTransaction(senderPrivateKey, signatureHex, rawUserTransaction) {
  const senderPublicKeyMissingPrefix = await getPublicKey(stripHexPrefix(senderPrivateKey));
  const signedUserTransaction = signTxn(senderPublicKeyMissingPrefix, signatureHex, rawUserTransaction);
  return Promise.resolve(signedUserTransaction);
}

function signTxn(senderPublicKey, signatureHex, rawUserTransaction) {
  // Step 3-1: generate authenticator
  const public_key = new Ed25519PublicKey(arrayify(addHexPrefix(senderPublicKey)));
  const signature = new Ed25519Signature(arrayify(addHexPrefix(signatureHex)));
  const transactionAuthenticatorVariantEd25519 = new TransactionAuthenticatorVariantEd25519(public_key, signature); // Step 3-2: generate SignedUserTransaction

  const signedUserTransaction = new SignedUserTransaction(rawUserTransaction, transactionAuthenticatorVariantEd25519);
  return signedUserTransaction;
} // export function signTransaction(
//   authenticator: starcoin_types.TransactionAuthenticator,
//   rawUserTransaction: starcoin_types.RawUserTransaction
// ): starcoin_types.SignedUserTransaction {
//   // Step 3-1: generate authenticator
//   const transactionAuthenticatorVariantEd25519 = new starcoin_types.TransactionAuthenticatorVariantEd25519(public_key, signature)
//   // Step 3-2: generate SignedUserTransaction
//   const signedUserTransaction = new starcoin_types.SignedUserTransaction(rawUserTransaction, authenticator)
//   return signedUserTransaction
// }

function getSignedUserTransactionHex(signedUserTransaction) {
  const se = new BcsSerializer();
  signedUserTransaction.serialize(se);
  return hexlify(se.getBytes());
}

async function getSignedUserTransaction(senderPrivateKey, rawUserTransaction) {
  // Step 2: generate signature of RawUserTransaction
  const signatureHex = await getSignatureHex(rawUserTransaction, senderPrivateKey); // Step 3: generate SignedUserTransaction

  const signedUserTransaction = await generateSignedUserTransaction(senderPrivateKey, signatureHex, rawUserTransaction);
  return signedUserTransaction;
}
async function signRawUserTransaction(senderPrivateKey, rawUserTransaction) {
  const signedUserTransaction = await getSignedUserTransaction(senderPrivateKey, rawUserTransaction); // Step 4: get SignedUserTransaction Hex

  const hex = getSignedUserTransactionHex(signedUserTransaction);
  return hex;
}

function encodeStructTypeTag(str) {
  const arr = str.split('<');
  const arr1 = arr[0].split('::');
  const address = arr1[0];
  const module = arr1[1];
  const name = arr1[2];
  const params = arr[1] ? arr[1].replace('>', '').split(',') : []; // eslint-disable-next-line @typescript-eslint/naming-convention

  const type_params = [];

  if (params.length > 0) {
    params.forEach(param => {
      type_params.push(encodeStructTypeTag(param.trim()));
    });
  }

  const result = {
    Struct: {
      address,
      module,
      name,
      type_params
    }
  };
  return result;
}
/**
 * while generate ScriptFunction, we need to encode a string array:
[
  'address1::module1::name1<address2::module2::name2>'
]

into a TypeTag array:

[
  {
    "Struct": {
      "address": "address1",
      "module": "module1",
      "name": "name1",
      "type_params": [
        {
          "Struct": {
            "address": "address2",
            "module": "module2",
            "name": "name2",
            "type_params": []
          }
        }
      ]
    }
  }
]
 */


function encodeStructTypeTags(typeArgsString) {
  return typeArgsString.map(str => encodeStructTypeTag(str));
}

function serializeWithType(value, type) {
  if (type === 'Address') return arrayify(value);
  const se = new BcsSerializer();

  if (type && type.Vector === 'U8') {
    const valueBytes = value ? isHexString(addHexPrefix(value)) ? fromHexString(value) : new Uint8Array(Buffer.from(value)) : new Uint8Array();
    const {
      length
    } = valueBytes;
    const list = [];

    for (let i = 0; i < length; i++) {
      list.push(valueBytes[i]);
    }

    Helpers.serializeVectorU8(list, se);
    const hex = hexlify(se.getBytes());
    return arrayify(hex);
  }

  if (type && type.Vector && Array.isArray(value)) {
    se.serializeLen(value.length);
    value.forEach(sub => {
      // array of string: vector<vector<u8>>
      if (type.Vector.Vector === 'U8') {
        se.serializeBytes(fromHexString(sub));
      } else if (type.Vector === 'Address') {
        const accountAddress = addressToSCS(sub);
        accountAddress.serialize(se);
      } else if (type.Vector) {
        // array of other types: vector<u8>
        se[`serialize${type.Vector}`](sub);
      }
    });
    const hex = hexlify(se.getBytes());
    return arrayify(hex);
  } // For normal data type


  if (type) {
    se[`serialize${type}`](value);
    const hex = hexlify(se.getBytes());
    return arrayify(hex);
  }

  return value;
}

function encodeScriptFunctionArgs(argsType, args) {
  return args.map((value, index) => serializeWithType(value, argsType[index].type_tag));
}
async function encodeScriptFunctionByResolve(functionId, typeArgs, args, nodeUrl) {
  const tyArgs = encodeStructTypeTags(typeArgs);
  const provider = new JsonRpcProvider(nodeUrl);
  const {
    args: argsType
  } = await provider.send('contract.resolve_function', [functionId]); // Remove the first Signer type

  if (argsType[0] && argsType[0].type_tag === 'Signer') {
    argsType.shift();
  }

  const argsBytes = encodeScriptFunctionArgs(argsType, args);
  return encodeScriptFunction(functionId, tyArgs, argsBytes);
}

var tx = {
  __proto__: null,
  encodeTransactionScript: encodeTransactionScript,
  encodeStarcoinTypesScriptFunction: encodeStarcoinTypesScriptFunction,
  encodeScriptFunction: encodeScriptFunction,
  encodeStarcoinTypesPackage: encodeStarcoinTypesPackage,
  encodePackage: encodePackage,
  generateRawUserTransaction: generateRawUserTransaction,
  getSignatureHex: getSignatureHex,
  signTxn: signTxn,
  getSignedUserTransaction: getSignedUserTransaction,
  signRawUserTransaction: signRawUserTransaction,
  encodeStructTypeTags: encodeStructTypeTags,
  encodeScriptFunctionArgs: encodeScriptFunctionArgs,
  encodeScriptFunctionByResolve: encodeScriptFunctionByResolve
};

/* eslint-disable @typescript-eslint/naming-convention */
/**
 * simillar to this command in the starcoin console:
 * starcoin% account import-multisig --pubkey <PUBLIC_KEY> --pubkey <PUBLIC_KEY> --prikey <PRIVATE_KEY> -t 2
 *
 * @param originPublicKeys
 * @param originPrivateKeys
 * @param thresHold
 * @returns
 */

async function generateMultiEd25519KeyShard(originPublicKeys, originPrivateKeys, thresHold) {
  if (originPrivateKeys.length === 0) {
    throw new Error('require at least one private key');
  }

  const publicKeys = cloneDeep(originPublicKeys);
  // 2. generate pub->priv map

  await Promise.all(originPrivateKeys.map(priv => {
    return privateKeyToPublicKey(priv).then(pub => {
      publicKeys.push(pub);
      return pub;
    }).catch(error => {
      throw new Error(`invalid private key: ${error}`);
    });
  })); // 3. sort all public keys by its bytes in asc order to make sure same public key set always generate same auth key.

  publicKeys.sort((a, b) => {
    return a > b ? 1 : -1;
  }); // 4. remove repeat public keys, if use add repeat public_key or private key.

  const uniquePublicKeys = publicKeys.filter((v, i, a) => a.indexOf(v) === i); // 5. generate pos_verified_private_keys

  const pos_verified_private_keys = {};
  await Promise.all(originPrivateKeys.map(priv => {
    return privateKeyToPublicKey(priv).then(pub => {
      const idx = uniquePublicKeys.indexOf(pub);

      if (idx > -1) {
        pos_verified_private_keys[idx] = new Ed25519PrivateKey(arrayify(priv));
      }

      return pub;
    }).catch(error => {
      throw new Error(`invalid private key: ${error}`);
    });
  }));
  const public_keys = uniquePublicKeys.map(pub => new Ed25519PublicKey(arrayify(pub)));
  const shard = new MultiEd25519KeyShard(public_keys, thresHold, pos_verified_private_keys);
  return Promise.resolve(shard);
}
async function generateMultiEd25519Signature(multiEd25519KeyShard, rawUserTransaction) {
  const signatures = await Promise.all(Object.keys(multiEd25519KeyShard.private_keys).map(k => {
    const privateKey = hexlify(multiEd25519KeyShard.private_keys[k].value);
    return getSignatureHex(rawUserTransaction, privateKey).then(signatureHex => {
      const signature = new Ed25519Signature(arrayify(signatureHex));
      const pos = Number.parseInt(k, 10);
      return [signature, pos];
    }).catch(error => {
      throw new Error(`invalid private key: ${error}`);
    });
  }));
  const multiEd25519Signature = MultiEd25519Signature.build(signatures);
  return Promise.resolve(multiEd25519Signature);
}
async function generateMultiEd25519SignatureShard(multiEd25519KeyShard, rawUserTransaction) {
  const multiEd25519Signature = await generateMultiEd25519Signature(multiEd25519KeyShard, rawUserTransaction);
  const multiEd25519SignatureShard = new MultiEd25519SignatureShard(multiEd25519Signature, multiEd25519KeyShard.threshold);
  return Promise.resolve(multiEd25519SignatureShard);
}

var multiSign = {
  __proto__: null,
  generateMultiEd25519KeyShard: generateMultiEd25519KeyShard,
  generateMultiEd25519Signature: generateMultiEd25519Signature,
  generateMultiEd25519SignatureShard: generateMultiEd25519SignatureShard
};



var index$5 = {
  __proto__: null,
  abi: abi,
  account: account,
  errors: errors,
  helper: helper,
  hex: hex,
  parser: parser,
  properties: properties,
  signedMessage: signedMessage,
  multiSign: multiSign,
  tx: tx
};



var index$6 = {
  __proto__: null,
  BinaryDeserializer: BinaryDeserializer,
  BinarySerializer: BinarySerializer
};

const logger$7 = new Logger(version);
let NextId = 1;

function buildWeb3LegacyFetcher(provider, sendFunc) {
  return function (method, params) {
    NextId += 1;
    const request = {
      method,
      params,
      id: NextId,
      jsonrpc: "2.0"
    };
    return new Promise((resolve, reject) => {
      sendFunc(request, function (error, result) {
        if (error) {
          return reject(error);
        }

        if (result.error) {
          const _error = new Error(result.error.message);

          _error.code = result.error.code;
          _error.data = result.error.data;
          return reject(_error);
        }

        resolve(result.result);
      });
    });
  };
}

class Web3Provider extends JsonRpcProvider {
  constructor(provider, network) {
    logger$7.checkNew(new.target, Web3Provider);

    if (provider === undefined) {
      logger$7.throwArgumentError("missing provider", "provider", provider);
    }

    let path;
    let jsonRpcFetchFunc;
    let subprovider;

    if (typeof provider === "function") {
      path = "unknown:";
      jsonRpcFetchFunc = provider;
    } else {
      path = provider.host || provider.path || "";

      if (!path && provider.isStarMask) {
        path = "starmask";
      }

      subprovider = provider;

      if (provider.sendAsync) {
        jsonRpcFetchFunc = buildWeb3LegacyFetcher(provider, provider.sendAsync.bind(provider));
      } else if (provider.send) {
        jsonRpcFetchFunc = buildWeb3LegacyFetcher(provider, provider.send.bind(provider));
      } else {
        logger$7.throwArgumentError("unsupported provider", "provider", provider);
      }

      if (!path) {
        path = "unknown:";
      }
    }

    super(path, network);
    defineReadOnly(this, "jsonRpcFetchFunc", jsonRpcFetchFunc);
    defineReadOnly(this, "provider", subprovider);
  }

  send(method, params) {
    return this.jsonRpcFetchFunc(method, params);
  }

}

// import { setInterval } from 'timers';
const logger$8 = new Logger(version);
/**
 *  Notes:
 *
 *  This provider differs a bit from the polling providers. One main
 *  difference is how it handles consistency. The polling providers
 *  will stall responses to ensure a consistent state, while this
 *  WebSocket provider assumes the connected backend will manage this.
 *
 *  For example, if a polling provider emits an event which indicats
 *  the event occurred in blockhash XXX, a call to fetch that block by
 *  its hash XXX, if not present will retry until it is present. This
 *  can occur when querying a pool of nodes that are mildly out of sync
 *  with each other.
 */

let NextId$1 = 1; // For more info about the Real-time Event API see:
//   https://geth.ethereum.org/docs/rpc/pubsub

class WebsocketProvider extends JsonRpcProvider {
  constructor(url, network) {
    // This will be added in the future; please open an issue to expedite
    if (network === 'any') {
      logger$8.throwError("WebSocketProvider does not support 'any' network yet", Logger.errors.UNSUPPORTED_OPERATION, {
        operation: 'network:any'
      });
    }

    super(url, network);
    this._pollingInterval = -1;
    this._wsReady = false;
    defineReadOnly(this, '_websocket', new WebSocket(this.connection.url));
    defineReadOnly(this, '_requests', {});
    defineReadOnly(this, '_subs', {});
    defineReadOnly(this, '_subIds', {});
    defineReadOnly(this, '_detectNetwork', super.detectNetwork()); // Stall sending requests until the socket is open...

    this._websocket.onopen = () => {
      this._wsReady = true;
      Object.keys(this._requests).forEach(id => {
        this._websocket.send(this._requests[id].payload);
      });
    };

    this._websocket.onmessage = messageEvent => {
      const data = messageEvent.data;
      const result = JSON.parse(data);

      if (result.id != null) {
        const id = String(result.id);
        const request = this._requests[id];
        delete this._requests[id];

        if (result.result !== undefined) {
          request.callback(null, result.result);
          this.emit('debug', {
            action: 'response',
            request: JSON.parse(request.payload),
            response: result.result,
            provider: this
          });
        } else {
          let error;

          if (result.error) {
            error = new Error(result.error.message || 'unknown error');
            defineReadOnly(error, 'code', result.error.code || null);
            defineReadOnly(error, 'response', data);
          } else {
            error = new Error('unknown error');
          }

          request.callback(error, undefined);
          this.emit('debug', {
            action: 'response',
            error,
            request: JSON.parse(request.payload),
            provider: this
          });
        }
      } else if (result.method === 'starcoin_subscription') {
        // Subscription...
        const sub = this._subs[result.params.subscription];

        if (sub) {
          sub.processFunc(result.params.result);
        }
      } else {
        console.warn('this should not happen');
      }
    }; // This Provider does not actually poll, but we want to trigger
    // poll events for things that depend on them (like stalling for
    // block and transaction lookups)


    const fauxPoll = setInterval(() => {
      this.emit('poll');
    }, 1000);

    if (fauxPoll.unref) {
      fauxPoll.unref();
    }
  }

  detectNetwork() {
    return this._detectNetwork;
  }

  get pollingInterval() {
    return 0;
  }

  set pollingInterval(value) {
    logger$8.throwError('cannot set polling interval on WebSocketProvider', Logger.errors.UNSUPPORTED_OPERATION, {
      operation: 'setPollingInterval'
    });
  }

  async poll() {
    return null;
  }

  set polling(value) {
    if (!value) {
      return;
    }

    logger$8.throwError('cannot set polling on WebSocketProvider', Logger.errors.UNSUPPORTED_OPERATION, {
      operation: 'setPolling'
    });
  }

  send(method, params) {
    const rid = NextId$1++;
    return new Promise((resolve, reject) => {
      function callback(error, result) {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      }

      const payload = JSON.stringify({
        method: method,
        params: params,
        id: rid,
        jsonrpc: '2.0'
      });
      this.emit('debug', {
        action: 'request',
        request: JSON.parse(payload),
        provider: this
      });
      this._requests[String(rid)] = {
        callback,
        payload
      };

      if (this._wsReady) {
        this._websocket.send(payload);
      }
    });
  }

  static defaultUrl() {
    return 'ws://localhost:9870';
  }

  async _subscribe(tag, param, processFunc) {
    let subIdPromise = this._subIds[tag];

    if (subIdPromise == null) {
      subIdPromise = Promise.all(param).then(param => {
        return this.send('starcoin_subscribe', param);
      });
      this._subIds[tag] = subIdPromise;
    }

    const subId = await subIdPromise;
    this._subs[subId] = {
      tag,
      processFunc
    };
  }

  _startEvent(event) {
    switch (event.type) {
      case CONSTANTS.block:
        this._subscribe(CONSTANTS.block, [{
          type_name: 'newHeads'
        }], result => {
          // FIXME
          const blockNumber = this.formatter.u64(result.header.number); // const blockNumber = BigNumber.from(result.header.number).toNumber();

          this._emitted.block = blockNumber;
          this.emit(CONSTANTS.block, blockNumber);
        });

        break;

      case CONSTANTS.pending:
        this._subscribe(CONSTANTS.pending, [{
          type_name: 'newPendingTransactions'
        }], result => {
          this.emit(CONSTANTS.pending, result);
        });

        break;

      case CONSTANTS.filter:
        this._subscribe(event.tag, [{
          type_name: 'events'
        }, event.filter], result => {
          this.emit(event.filter, this.formatter.transactionEvent(result));
        });

        break;

      case CONSTANTS.tx:
        {
          const emitTxnInfo = event => {
            const hash = event.hash;
            this.getTransactionInfo(hash).then(txnInfo => {
              if (!txnInfo) {
                return;
              }

              this.emit(hash, txnInfo);
            });
          }; // In case it is already mined


          emitTxnInfo(event); // To keep things simple, we start up a single newHeads subscription
          // to keep an eye out for transactions we are watching for.
          // Starting a subscription for an event (i.e. "tx") that is already
          // running is (basically) a nop.

          this._subscribe(CONSTANTS.tx, [{
            type_name: 'newHeads'
          }], result => {
            this._events.filter(e => e.type === CONSTANTS.tx).forEach(emitTxnInfo);
          });

          break;
        }
      // Nothing is needed

      case 'debug':
      case 'poll':
      case 'willPoll':
      case 'didPoll':
      case 'error':
        break;

      default:
        console.log('unhandled:', event);
        break;
    }
  }

  _stopEvent(event) {
    let tag = event.tag;

    if (event.type === CONSTANTS.tx) {
      // There are remaining transaction event listeners
      if (this._events.filter(e => e.type === CONSTANTS.tx).length) {
        return;
      }

      tag = CONSTANTS.tx;
    } else if (this.listenerCount(event.event)) {
      // There are remaining event listeners
      return;
    }

    const subId = this._subIds[tag];

    if (!subId) {
      return;
    }

    delete this._subIds[tag];
    subId.then(subId => {
      if (!this._subs[subId]) {
        return;
      }

      delete this._subs[subId];
      this.send('starcoin_unsubscribe', [subId]);
    });
  }

  async destroy() {
    // Wait until we have connected before trying to disconnect
    if (this._websocket.readyState === WebSocket.CONNECTING) {
      await new Promise(resolve => {
        this._websocket.onopen = function () {
          resolve(true);
        };

        this._websocket.onerror = function () {
          resolve(false);
        };
      });
    } // Hangup
    // See: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes


    this._websocket.close(1000);
  }

}



var index$7 = {
  __proto__: null,
  CONSTANTS: CONSTANTS,
  Event: Event,
  RPC_ACTION: RPC_ACTION,
  BaseProvider: BaseProvider,
  formatMoveStruct: formatMoveStruct,
  formatMoveValue: formatMoveValue,
  Formatter: Formatter,
  JsonRpcSigner: JsonRpcSigner,
  JsonRpcProvider: JsonRpcProvider,
  Web3Provider: Web3Provider,
  WebsocketProvider: WebsocketProvider
};

class AcceptTokenEvent {
  constructor(token_code) {
    this.token_code = token_code;
  }

  serialize(serializer) {
    this.token_code.serialize(serializer);
  }

  static deserialize(deserializer) {
    const token_code = TokenCode.deserialize(deserializer);
    return new AcceptTokenEvent(token_code);
  }

}
class AccountAddress$1 {
  constructor(value) {
    this.value = value;
  }

  serialize(serializer) {
    Helpers$1.serializeArray16U8Array(this.value, serializer);
  }

  static deserialize(deserializer) {
    const value = Helpers$1.deserializeArray16U8Array(deserializer);
    return new AccountAddress$1(value);
  }

}
class BlockRewardEvent {
  constructor(block_number, block_reward, gas_fees, miner) {
    this.block_number = block_number;
    this.block_reward = block_reward;
    this.gas_fees = gas_fees;
    this.miner = miner;
  }

  serialize(serializer) {
    serializer.serializeU64(this.block_number);
    serializer.serializeU128(this.block_reward);
    serializer.serializeU128(this.gas_fees);
    this.miner.serialize(serializer);
  }

  static deserialize(deserializer) {
    const block_number = deserializer.deserializeU64();
    const block_reward = deserializer.deserializeU128();
    const gas_fees = deserializer.deserializeU128();
    const miner = AccountAddress$1.deserialize(deserializer);
    return new BlockRewardEvent(block_number, block_reward, gas_fees, miner);
  }

}
class BurnEvent {
  constructor(amount, token_code) {
    this.amount = amount;
    this.token_code = token_code;
  }

  serialize(serializer) {
    serializer.serializeU128(this.amount);
    this.token_code.serialize(serializer);
  }

  static deserialize(deserializer) {
    const amount = deserializer.deserializeU128();
    const token_code = TokenCode.deserialize(deserializer);
    return new BurnEvent(amount, token_code);
  }

}
class DepositEvent {
  constructor(amount, token_code, metadata) {
    this.amount = amount;
    this.token_code = token_code;
    this.metadata = metadata;
  }

  serialize(serializer) {
    serializer.serializeU128(this.amount);
    this.token_code.serialize(serializer);
    Helpers$1.serializeVectorU8(this.metadata, serializer);
  }

  static deserialize(deserializer) {
    const amount = deserializer.deserializeU128();
    const token_code = TokenCode.deserialize(deserializer);
    const metadata = Helpers$1.deserializeVectorU8(deserializer);
    return new DepositEvent(amount, token_code, metadata);
  }

}
class MintEvent {
  constructor(amount, token_code) {
    this.amount = amount;
    this.token_code = token_code;
  }

  serialize(serializer) {
    serializer.serializeU128(this.amount);
    this.token_code.serialize(serializer);
  }

  static deserialize(deserializer) {
    const amount = deserializer.deserializeU128();
    const token_code = TokenCode.deserialize(deserializer);
    return new MintEvent(amount, token_code);
  }

}
class NewBlockEvent {
  constructor(number, author, timestamp, uncles) {
    this.number = number;
    this.author = author;
    this.timestamp = timestamp;
    this.uncles = uncles;
  }

  serialize(serializer) {
    serializer.serializeU64(this.number);
    this.author.serialize(serializer);
    serializer.serializeU64(this.timestamp);
    serializer.serializeU64(this.uncles);
  }

  static deserialize(deserializer) {
    const number = deserializer.deserializeU64();
    const author = AccountAddress$1.deserialize(deserializer);
    const timestamp = deserializer.deserializeU64();
    const uncles = deserializer.deserializeU64();
    return new NewBlockEvent(number, author, timestamp, uncles);
  }

}
class ProposalCreatedEvent {
  constructor(proposal_id, proposer) {
    this.proposal_id = proposal_id;
    this.proposer = proposer;
  }

  serialize(serializer) {
    serializer.serializeU64(this.proposal_id);
    this.proposer.serialize(serializer);
  }

  static deserialize(deserializer) {
    const proposal_id = deserializer.deserializeU64();
    const proposer = AccountAddress$1.deserialize(deserializer);
    return new ProposalCreatedEvent(proposal_id, proposer);
  }

}
class TokenCode {
  constructor(address, module, name) {
    this.address = address;
    this.module = module;
    this.name = name;
  }

  serialize(serializer) {
    this.address.serialize(serializer);
    serializer.serializeStr(this.module);
    serializer.serializeStr(this.name);
  }

  static deserialize(deserializer) {
    const address = AccountAddress$1.deserialize(deserializer);
    const module = deserializer.deserializeStr();
    const name = deserializer.deserializeStr();
    return new TokenCode(address, module, name);
  }

}
class VoteChangedEvent {
  constructor(proposal_id, proposer, voter, agree, vote) {
    this.proposal_id = proposal_id;
    this.proposer = proposer;
    this.voter = voter;
    this.agree = agree;
    this.vote = vote;
  }

  serialize(serializer) {
    serializer.serializeU64(this.proposal_id);
    this.proposer.serialize(serializer);
    this.voter.serialize(serializer);
    serializer.serializeBool(this.agree);
    serializer.serializeU128(this.vote);
  }

  static deserialize(deserializer) {
    const proposal_id = deserializer.deserializeU64();
    const proposer = AccountAddress$1.deserialize(deserializer);
    const voter = AccountAddress$1.deserialize(deserializer);
    const agree = deserializer.deserializeBool();
    const vote = deserializer.deserializeU128();
    return new VoteChangedEvent(proposal_id, proposer, voter, agree, vote);
  }

}
class WithdrawEvent {
  constructor(amount, token_code, metadata) {
    this.amount = amount;
    this.token_code = token_code;
    this.metadata = metadata;
  }

  serialize(serializer) {
    serializer.serializeU128(this.amount);
    this.token_code.serialize(serializer);
    Helpers$1.serializeVectorU8(this.metadata, serializer);
  }

  static deserialize(deserializer) {
    const amount = deserializer.deserializeU128();
    const token_code = TokenCode.deserialize(deserializer);
    const metadata = Helpers$1.deserializeVectorU8(deserializer);
    return new WithdrawEvent(amount, token_code, metadata);
  }

}
class Helpers$1 {
  static serializeArray16U8Array(value, serializer) {
    value.forEach(item => {
      serializer.serializeU8(item[0]);
    });
  }

  static deserializeArray16U8Array(deserializer) {
    const list = [];

    for (let i = 0; i < 16; i++) {
      list.push([deserializer.deserializeU8()]);
    }

    return list;
  }

  static serializeVectorU8(value, serializer) {
    serializer.serializeLen(value.length);
    value.forEach(item => {
      serializer.serializeU8(item);
    });
  }

  static deserializeVectorU8(deserializer) {
    const length = deserializer.deserializeLen();
    const list = [];

    for (let i = 0; i < length; i++) {
      list.push(deserializer.deserializeU8());
    }

    return list;
  }

}

var onchain_events = {
  __proto__: null,
  AcceptTokenEvent: AcceptTokenEvent,
  AccountAddress: AccountAddress$1,
  BlockRewardEvent: BlockRewardEvent,
  BurnEvent: BurnEvent,
  DepositEvent: DepositEvent,
  MintEvent: MintEvent,
  NewBlockEvent: NewBlockEvent,
  ProposalCreatedEvent: ProposalCreatedEvent,
  TokenCode: TokenCode,
  VoteChangedEvent: VoteChangedEvent,
  WithdrawEvent: WithdrawEvent,
  Helpers: Helpers$1
};

const ACCOUNT_ADDRESS_LENGTH = 16;
const EVENT_KEY_LENGTH = ACCOUNT_ADDRESS_LENGTH + 8;

TokenCode.prototype.toJS = function () {
  return {
    address: addressFromSCS(this.address),
    module: this.module,
    name: this.name
  };
};

DepositEvent.prototype.toJS = function () {
  return {
    amount: this.amount,
    metadata: this.metadata,
    token_code: this.token_code.toJS()
  };
};

AcceptTokenEvent.prototype.toJS = function () {
  return {
    token_code: this.token_code.toJS()
  };
};

BlockRewardEvent.prototype.toJS = function () {
  return {
    block_number: this.block_number,
    block_reward: this.block_reward,
    gas_fees: this.gas_fees,
    miner: addressFromSCS(this.miner)
  };
};

BurnEvent.prototype.toJS = function () {
  return {
    amount: this.amount,
    token_code: this.token_code.toJS()
  };
};

MintEvent.prototype.toJS = function () {
  return {
    amount: this.amount,
    token_code: this.token_code.toJS()
  };
};

NewBlockEvent.prototype.toJS = function () {
  return {
    number: this.number,
    author: addressFromSCS(this.author),
    timestamp: this.timestamp,
    uncles: this.uncles
  };
};

ProposalCreatedEvent.prototype.toJS = function () {
  return {
    proposal_id: this.proposal_id,
    proposer: addressFromSCS(this.proposer)
  };
};

VoteChangedEvent.prototype.toJS = function () {
  return {
    agree: this.agree,
    vote: this.vote,
    voter: addressFromSCS(this.voter),
    proposal_id: this.proposal_id,
    proposer: addressFromSCS(this.proposer)
  };
};

WithdrawEvent.prototype.toJS = function () {
  return {
    amount: this.amount,
    metadata: this.metadata,
    token_code: this.token_code.toJS()
  };
};

DepositEvent.prototype.toJS = function () {
  return {
    amount: this.amount,
    metadata: this.metadata,
    token_code: this.token_code.toJS()
  };
}; // Uint8Array is a general-purpose byte-array that’s available in both nodejs and browsers. 
// Buffer is a subclass of Uint8Array that’s only available in nodejs
// So we must use Uint8Array, instead of Buffer
// https://github.com/oBusk/read-bigint/blob/main/src/read-bigint-64-le.ts


function readBigInt64LE(data, offset = 0) {
  const first = data[offset];
  const last = data[offset + 7];
  const val = data[offset + 4] + data[offset + 5] * 2 ** 8 + data[offset + 6] * 2 ** 16 + (last << 24); // Overflow

  return (BigInt(val) << BigInt(32)) + BigInt(first + data[++offset] * 2 ** 8 + data[++offset] * 2 ** 16 + data[++offset] * 2 ** 24);
} /// Decode a hex view or raw bytes of event key into parts.
/// EventKey is constructed by `Salt+AccountAddress`.


function decodeEventKey(eventKey) {
  const bytes = arrayify(eventKey);

  if (bytes.byteLength !== EVENT_KEY_LENGTH) {
    throw new Error(`invalid eventkey data, expect byte length to be ${EVENT_KEY_LENGTH}, actual: ${bytes.byteLength}`);
  }

  const saltBytes = bytes.slice(0, EVENT_KEY_LENGTH - ACCOUNT_ADDRESS_LENGTH);
  const data = new Uint8Array(Buffer.from(saltBytes));
  const salt = readBigInt64LE(data);
  const addressBytes = bytes.slice(EVENT_KEY_LENGTH - ACCOUNT_ADDRESS_LENGTH);
  const address = toHexString(addressBytes);
  return {
    address,
    salt
  };
}
function decodeEventData(eventName, eventData) {
  const eventType = onchain_events[eventName];
  const d = bcsDecode(eventType, eventData);
  return d;
}

var index$8 = {
  __proto__: null,
  decodeEventKey: decodeEventKey,
  decodeEventData: decodeEventData
};

/**
 * VM type definitions for dual-VM support.
 */
var VMType;

(function (VMType) {
  VMType["VM1"] = "vm1";
  VMType["VM2"] = "vm2";
})(VMType || (VMType = {}));
/**
 * Determine VM type from an RPC response that includes vm_type field.
 */


function getVMType(response) {
  if (response && response.vm_type === 'vm2') {
    return VMType.VM2;
  }

  return VMType.VM1;
}
/**
 * Check if a transaction info response is from VM2.
 */

function isVM2Transaction(response) {
  return getVMType(response) === VMType.VM2;
}

/**
 * VM2 transaction building utilities.
 *
 * Since VM2's EntryFunction is BCS-compatible with VM1's ScriptFunction
 * (same variant index, same field layout), we reuse the existing BCS types.
 * The naming aliases make intent clear when building VM2 transactions.
 */
/**
 * Encode a VM2 EntryFunction payload.
 *
 * BCS-compatible with VM1 ScriptFunction — reuses the same serialization
 * since both have variant index 2 and identical field layout:
 *   (module: ModuleId, function: Identifier, ty_args: Vec<TypeTag>, args: Vec<Vec<u8>>)
 */

function encodeEntryFunction(functionId, tyArgs, args) {
  return encodeScriptFunction(functionId, tyArgs, args);
}
/**
 * Encode a VM2 EntryFunction by resolving argument types from the chain.
 * Uses contract2.resolve_function RPC method for VM2.
 */

async function encodeEntryFunctionByResolve(functionId, typeArgs, args, nodeUrl) {
  const tyArgs = encodeStructTypeTags(typeArgs);
  const provider = new JsonRpcProvider(nodeUrl);
  const {
    args: argsType
  } = await provider.send('contract2.resolve_function', [functionId]); // Remove the first Signer type

  if (argsType[0] && argsType[0].type_tag === 'Signer') {
    argsType.shift();
  }

  const argsBytes = encodeScriptFunctionArgs(argsType, args);
  return encodeEntryFunction(functionId, tyArgs, argsBytes);
}
/**
 * Generate a RawUserTransaction for VM2.
 *
 * Identical BCS layout to VM1 — the struct fields are the same.
 * Alias provided for semantic clarity.
 */

function generateRawUserTransactionV2(senderAddress, payload, maxGasAmount, gasUnitPrice, senderSequenceNumber, expirationTimestampSecs, chainId) {
  return generateRawUserTransaction(senderAddress, payload, maxGasAmount, gasUnitPrice, senderSequenceNumber, expirationTimestampSecs, chainId);
}
/**
 * Sign a VM2 raw user transaction and return the SignedUserTransaction object.
 */

async function getSignedUserTransactionV2(senderPrivateKey, rawUserTransaction) {
  const signatureHex = await getSignatureHex(rawUserTransaction, senderPrivateKey);
  const senderPublicKeyMissingPrefix = await getPublicKey(stripHexPrefix(senderPrivateKey));
  return signTxn(senderPublicKeyMissingPrefix, signatureHex, rawUserTransaction);
}
/**
 * Sign a VM2 raw user transaction and return the hex string.
 */

async function signRawUserTransactionV2(senderPrivateKey, rawUserTransaction) {
  const signedUserTransaction = await getSignedUserTransactionV2(senderPrivateKey, rawUserTransaction);
  const se = new BcsSerializer();
  signedUserTransaction.serialize(se);
  return hexlify(se.getBytes());
}

/**
 * VM2 RPC method mappings.
 *
 * VM2 RPC naming follows TWO patterns (verified from starcoin Rust source):
 *   Prefix pattern: state2.*, contract2.*, account2.* (defined in vm2/rpc/api/)
 *   Suffix pattern: chain.method2, txpool.method2 (defined in rpc/api/)
 * Examples:
 * - txpool.submit_hex_transaction2 (suffix)
 * - contract2.dry_run_raw (prefix)
 * - state2.get_resource (prefix)
 * - chain.get_transaction_info2 (suffix, NOT chain2.get_transaction_info)
 */

/**
 * Mapping from VM1 RPC method names to VM2 equivalents.
 */
const VM2_RPC_METHODS = {
  // Transaction submission
  'txpool.submit_hex_transaction': 'txpool.submit_hex_transaction2',
  'txpool.submit_transaction': 'txpool.submit_transaction2',
  // Contract / dry-run
  'contract.dry_run': 'contract2.dry_run',
  'contract.dry_run_raw': 'contract2.dry_run_raw',
  'contract.get_code': 'contract2.get_code',
  'contract.get_resource': 'state2.get_resource',
  'contract.resolve_function': 'contract2.resolve_function',
  'contract.resolve_struct': 'contract2.resolve_struct',
  'contract.call': 'contract2.call',
  'contract.call_v2': 'contract2.call_v2',
  // State
  'state.get_account_state_set': 'state2.get_account_state_set',
  'state.list_resource': 'state2.list_resource',
  'state.get_resource': 'state2.get_resource',
  // Chain queries (suffix pattern: chain.method2)
  'chain.get_transaction': 'chain.get_transaction2',
  'chain.get_transaction_info': 'chain.get_transaction_info2',
  'chain.get_events_by_txn_hash': 'chain.get_events_by_txn_hash2',
  'chain.get_block_txn_infos': 'chain.get_block_txn_infos2',
  'chain.get_block_info_by_number': 'chain.get_block_info_by_number2',
  'chain.get_transaction_infos': 'chain.get_transaction_infos2',
  // Account
  'account.get_sequence_number': 'account2.get_sequence_number'
};
/**
 * Convert a VM1 RPC method to its VM2 equivalent.
 * Returns the original method if no VM2 mapping exists.
 */

function vm1MethodToVM2(method) {
  return VM2_RPC_METHODS[method] || method;
}

/**
 * VM2 support for Starcoin.
 *
 * Key insight: VM2's EntryFunction is BCS-compatible with VM1's ScriptFunction
 * (same variant index 2, same field layout: module, function, ty_args, args).
 * So the existing starcoin_types BCS classes can be reused for VM2 transaction
 * building and signing.
 *
 * The main differences are:
 * 1. RPC method names use "2" suffix (e.g. txpool.submit_transaction2)
 * 2. RPC responses include a "vm_type" field ("vm1" or "vm2")
 * 3. Conceptual naming: ScriptFunction → EntryFunction
 */

var index$9 = {
  __proto__: null,
  get VMType () { return VMType; },
  isVM2Transaction: isVM2Transaction,
  getVMType: getVMType,
  encodeEntryFunction: encodeEntryFunction,
  encodeEntryFunctionByResolve: encodeEntryFunctionByResolve,
  generateRawUserTransactionV2: generateRawUserTransactionV2,
  signRawUserTransactionV2: signRawUserTransactionV2,
  getSignedUserTransactionV2: getSignedUserTransactionV2,
  VM2_RPC_METHODS: VM2_RPC_METHODS,
  vm1MethodToVM2: vm1MethodToVM2
};

export { index$1 as bcs, index$3 as crypto_hash, index$4 as encoding, index$8 as onchain_events, index$7 as providers, index$6 as serde, index$2 as starcoin_types, index as types, index$5 as utils, version, index$9 as vm2 };
