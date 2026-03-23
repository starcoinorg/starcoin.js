function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var bech32 = require('bech32');
var bytes = require('@ethersproject/bytes');
var ethereumjsUtil = require('ethereumjs-util');
var ed = require('@noble/ed25519');
var jsSha3 = require('js-sha3');
var hexadecimal = _interopDefault(require('is-hexadecimal'));
var decimal = _interopDefault(require('is-decimal'));
var alphanumerical = _interopDefault(require('is-alphanumerical'));
var alphabetical = _interopDefault(require('is-alphabetical'));
var whitespace = _interopDefault(require('is-whitespace-character'));
var logger$9 = require('@ethersproject/logger');
var lodash = require('lodash');
var bignumber = require('@ethersproject/bignumber');
var properties$1 = require('@ethersproject/properties');
var web = require('@ethersproject/web');
require('@ethersproject/basex');
require('@ethersproject/sha2');
var WebSocket = _interopDefault(require('ws'));

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
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

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
  if (it) return (it = it.call(o)).next.bind(it);

  if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
    if (it) o = it;
    var i = 0;
    return function () {
      if (i >= o.length) return {
        done: true
      };
      return {
        done: false,
        value: o[i++]
      };
    };
  }

  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var accountType = {
  SINGLE: 0,
  MULTI: 1
};
function formatStructTag(structTag) {
  var s = structTag.address + "::" + structTag.module + "::" + structTag.name;

  if (structTag.type_params && structTag.type_params.length > 0) {
    s = s.concat('<');
    s = s.concat(formatTypeTag(structTag.type_params[0]));

    for (var _iterator = _createForOfIteratorHelperLoose(structTag.type_params.slice(1)), _step; !(_step = _iterator()).done;) {
      var t = _step.value;
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
      var subTypeTag = typeTag.Vector;
      return "vector<" + formatTypeTag(subTypeTag) + ">";
    } // @ts-ignore


    if (typeTag.Struct !== undefined) {
      // @ts-ignore
      var _subTypeTag = typeTag.Struct;
      return formatStructTag(_subTypeTag);
    }
  }
} // eslint-disable-next-line @typescript-eslint/naming-convention

var TransactionVMStatus_Executed = 'Executed'; // eslint-disable-next-line @typescript-eslint/naming-convention

var TransactionVMStatus_OutOfGas = 'OutOfGas'; // eslint-disable-next-line @typescript-eslint/naming-convention

var TransactionVMStatus_MiscellaneousError = 'MiscellaneousError';
function formatFunctionId(functionId) {
  if (typeof functionId !== 'string') {
    return functionId.address + "::" + functionId.module + "::" + functionId.functionName;
  } else {
    return functionId;
  }
}
function parseFunctionId(functionId) {
  if (typeof functionId !== 'string') {
    return functionId;
  } else {
    var parts = functionId.split('::', 3);

    if (parts.length !== 3) {
      throw new Error("cannot parse " + functionId + " into FunctionId");
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

var BinaryDeserializer = /*#__PURE__*/function () {
  function BinaryDeserializer(data) {
    // As we can't be sure about the origin of the data, it's better to copy it to a new buffer
    // e.g. if the data originated by: Buffer.from('16a9', 'hex'), the internal buffer would be much longer and/or different (as Buffer is some sort of a view)
    this.buffer = new ArrayBuffer(data.length);
    new Uint8Array(this.buffer).set(data, 0);
    this.offset = 0;
  }

  var _proto = BinaryDeserializer.prototype;

  _proto.read = function read(length) {
    var bytes = this.buffer.slice(this.offset, this.offset + length);
    this.offset += length;
    return bytes;
  };

  _proto.deserializeStr = function deserializeStr() {
    var value = this.deserializeBytes();
    return BinaryDeserializer.textDecoder.decode(value);
  };

  _proto.deserializeBytes = function deserializeBytes() {
    var len = this.deserializeLen();

    if (len < 0) {
      throw new Error("Length of a bytes array can't be negative");
    }

    return new Uint8Array(this.read(len));
  };

  _proto.deserializeBool = function deserializeBool() {
    var bool = new Uint8Array(this.read(1))[0];
    return bool == 1;
  };

  _proto.deserializeUnit = function deserializeUnit() {
    return null;
  };

  _proto.deserializeU8 = function deserializeU8() {
    return new DataView(this.read(1)).getUint8(0);
  };

  _proto.deserializeU16 = function deserializeU16() {
    return new DataView(this.read(2)).getUint16(0, true);
  };

  _proto.deserializeU32 = function deserializeU32() {
    return new DataView(this.read(4)).getUint32(0, true);
  };

  _proto.deserializeU64 = function deserializeU64() {
    var low = this.deserializeU32();
    var high = this.deserializeU32(); // combine the two 32-bit values and return (little endian)

    return BigInt(high) << BinaryDeserializer.BIG_32 | BigInt(low);
  };

  _proto.deserializeU128 = function deserializeU128() {
    var low = this.deserializeU64();
    var high = this.deserializeU64(); // combine the two 64-bit values and return (little endian)

    return BigInt(high) << BinaryDeserializer.BIG_64 | BigInt(low);
  };

  _proto.deserializeI8 = function deserializeI8() {
    return new DataView(this.read(1)).getInt8(0);
  };

  _proto.deserializeI16 = function deserializeI16() {
    return new DataView(this.read(2)).getInt16(0, true);
  };

  _proto.deserializeI32 = function deserializeI32() {
    return new DataView(this.read(4)).getInt32(0, true);
  };

  _proto.deserializeI64 = function deserializeI64() {
    var low = this.deserializeI32();
    var high = this.deserializeI32(); // combine the two 32-bit values and return (little endian)

    return BigInt(high) << BinaryDeserializer.BIG_32 | BigInt(low);
  };

  _proto.deserializeI128 = function deserializeI128() {
    var low = this.deserializeI64();
    var high = this.deserializeI64(); // combine the two 64-bit values and return (little endian)

    return BigInt(high) << BinaryDeserializer.BIG_64 | BigInt(low);
  };

  _proto.deserializeOptionTag = function deserializeOptionTag() {
    return this.deserializeBool();
  };

  _proto.getBufferOffset = function getBufferOffset() {
    return this.offset;
  };

  _proto.deserializeChar = function deserializeChar() {
    throw new Error('Method deserializeChar not implemented.');
  };

  _proto.deserializeF32 = function deserializeF32() {
    return new DataView(this.read(4)).getFloat32(0, true);
  };

  _proto.deserializeF64 = function deserializeF64() {
    return new DataView(this.read(8)).getFloat64(0, true);
  };

  return BinaryDeserializer;
}();
BinaryDeserializer.BIG_32 = BigInt(32);
BinaryDeserializer.BIG_64 = BigInt(64);
BinaryDeserializer.textDecoder = new TextDecoder();

var BcsDeserializer = /*#__PURE__*/function (_BinaryDeserializer) {
  _inheritsLoose(BcsDeserializer, _BinaryDeserializer);

  function BcsDeserializer(data) {
    return _BinaryDeserializer.call(this, data) || this;
  }

  var _proto = BcsDeserializer.prototype;

  _proto.deserializeUleb128AsU32 = function deserializeUleb128AsU32() {
    var value = 0;

    for (var shift = 0; shift < 32; shift += 7) {
      var x = this.deserializeU8();
      var digit = x & 0x7f;
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
  };

  _proto.deserializeLen = function deserializeLen() {
    return this.deserializeUleb128AsU32();
  };

  _proto.deserializeVariantIndex = function deserializeVariantIndex() {
    return this.deserializeUleb128AsU32();
  };

  _proto.checkThatKeySlicesAreIncreasing = function checkThatKeySlicesAreIncreasing( // eslint-disable-next-line @typescript-eslint/no-unused-vars
  key1, // eslint-disable-next-line @typescript-eslint/no-unused-vars
  key2) {
    return;
  };

  return BcsDeserializer;
}(BinaryDeserializer);
BcsDeserializer.MAX_UINT_32 = Math.pow(2, 32) - 1;

var BinarySerializer = /*#__PURE__*/function () {
  function BinarySerializer() {
    this.buffer = new ArrayBuffer(64);
    this.offset = 0;
  }

  var _proto = BinarySerializer.prototype;

  _proto.ensureBufferWillHandleSize = function ensureBufferWillHandleSize(bytes) {
    while (this.buffer.byteLength < this.offset + bytes) {
      var newBuffer = new ArrayBuffer(this.buffer.byteLength * 2);
      new Uint8Array(newBuffer).set(new Uint8Array(this.buffer));
      this.buffer = newBuffer;
    }
  };

  _proto.serialize = function serialize(values) {
    this.ensureBufferWillHandleSize(values.length);
    new Uint8Array(this.buffer, this.offset).set(values);
    this.offset += values.length;
  };

  _proto.serializeStr = function serializeStr(value) {
    this.serializeBytes(BinarySerializer.textEncoder.encode(value));
  };

  _proto.serializeBytes = function serializeBytes(value) {
    this.serializeLen(value.length);
    this.serialize(value);
  };

  _proto.serializeBool = function serializeBool(value) {
    var byteValue = value ? 1 : 0;
    this.serialize(new Uint8Array([byteValue]));
  } // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/explicit-module-boundary-types
  ;

  _proto.serializeUnit = function serializeUnit(value) {
    return;
  };

  _proto.serializeWithFunction = function serializeWithFunction(fn, bytesLength, value) {
    this.ensureBufferWillHandleSize(bytesLength);
    var dv = new DataView(this.buffer, this.offset);
    fn.apply(dv, [0, value, true]);
    this.offset += bytesLength;
  };

  _proto.serializeU8 = function serializeU8(value) {
    this.serialize(new Uint8Array([value]));
  };

  _proto.serializeU16 = function serializeU16(value) {
    this.serializeWithFunction(DataView.prototype.setUint16, 2, value);
  };

  _proto.serializeU32 = function serializeU32(value) {
    this.serializeWithFunction(DataView.prototype.setUint32, 4, value);
  };

  _proto.serializeU64 = function serializeU64(value) {
    var low = BigInt(value) & BinarySerializer.BIG_32Fs;
    var high = BigInt(value) >> BinarySerializer.BIG_32; // write little endian number

    this.serializeU32(Number(low));
    this.serializeU32(Number(high));
  };

  _proto.serializeU128 = function serializeU128(value) {
    var low = BigInt(value) & BinarySerializer.BIG_64Fs;
    var high = BigInt(value) >> BinarySerializer.BIG_64; // write little endian number

    this.serializeU64(low);
    this.serializeU64(high);
  };

  _proto.serializeI8 = function serializeI8(value) {
    var bytes = 1;
    this.ensureBufferWillHandleSize(bytes);
    new DataView(this.buffer, this.offset).setInt8(0, value);
    this.offset += bytes;
  };

  _proto.serializeI16 = function serializeI16(value) {
    var bytes = 2;
    this.ensureBufferWillHandleSize(bytes);
    new DataView(this.buffer, this.offset).setInt16(0, value, true);
    this.offset += bytes;
  };

  _proto.serializeI32 = function serializeI32(value) {
    var bytes = 4;
    this.ensureBufferWillHandleSize(bytes);
    new DataView(this.buffer, this.offset).setInt32(0, value, true);
    this.offset += bytes;
  };

  _proto.serializeI64 = function serializeI64(value) {
    var low = BigInt(value) & BinarySerializer.BIG_32Fs;
    var high = BigInt(value) >> BinarySerializer.BIG_32; // write little endian number

    this.serializeI32(Number(low));
    this.serializeI32(Number(high));
  };

  _proto.serializeI128 = function serializeI128(value) {
    var low = BigInt(value) & BinarySerializer.BIG_64Fs;
    var high = BigInt(value) >> BinarySerializer.BIG_64; // write little endian number

    this.serializeI64(low);
    this.serializeI64(high);
  };

  _proto.serializeOptionTag = function serializeOptionTag(value) {
    this.serializeBool(value);
  };

  _proto.getBufferOffset = function getBufferOffset() {
    return this.offset;
  };

  _proto.getBytes = function getBytes() {
    return new Uint8Array(this.buffer).slice(0, this.offset);
  };

  _proto.serializeChar = function serializeChar(value) {
    throw new Error('Method serializeChar not implemented.');
  };

  _proto.serializeF32 = function serializeF32(value) {
    var bytes = 4;
    this.ensureBufferWillHandleSize(bytes);
    new DataView(this.buffer, this.offset).setFloat32(0, value, true);
    this.offset += bytes;
  };

  _proto.serializeF64 = function serializeF64(value) {
    var bytes = 8;
    this.ensureBufferWillHandleSize(bytes);
    new DataView(this.buffer, this.offset).setFloat64(0, value, true);
    this.offset += bytes;
  };

  return BinarySerializer;
}();
BinarySerializer.BIG_32 = BigInt(32);
BinarySerializer.BIG_64 = BigInt(64); // TypeScript with target below es2016 will translate BigInt(2)**BigInt(32) to Math.pow(BigInt(2), BigInt(32))
// which will result in `Cannot convert a BigInt value to a number`
// parsing it directly from the string representation of the number will overcome it and allow es6 to be configured as well

BinarySerializer.BIG_32Fs = BigInt('4294967295');
BinarySerializer.BIG_64Fs = BigInt('18446744073709551615');
BinarySerializer.textEncoder = new TextEncoder();

var BcsSerializer = /*#__PURE__*/function (_BinarySerializer) {
  _inheritsLoose(BcsSerializer, _BinarySerializer);

  function BcsSerializer() {
    return _BinarySerializer.call(this) || this;
  }

  var _proto = BcsSerializer.prototype;

  _proto.serializeU32AsUleb128 = function serializeU32AsUleb128(value) {
    var valueArray = [];

    while (value >>> 7 != 0) {
      valueArray.push(value & 0x7f | 0x80);
      value = value >>> 7;
    }

    valueArray.push(value);
    this.serialize(new Uint8Array(valueArray));
  };

  _proto.serializeLen = function serializeLen(value) {
    this.serializeU32AsUleb128(value);
  };

  _proto.serializeVariantIndex = function serializeVariantIndex(value) {
    this.serializeU32AsUleb128(value);
  };

  _proto.sortMapEntries = function sortMapEntries(offsets) {// leaving it empty for now, should be implemented soon
  };

  return BcsSerializer;
}(BinarySerializer);



var index$1 = {
  __proto__: null,
  BcsDeserializer: BcsDeserializer,
  BcsSerializer: BcsSerializer
};

/* eslint-disable no-bitwise */
function dec2bin(dec) {
  var bin = (dec >>> 0).toString(2);
  var prefixed = "00000000000000000000000000000000" + bin;
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
  var arr = dec2bin(n).match(/.{1,8}/g);
  var bitmap = Uint8Array.from(arr.map(function (str) {
    return bin2dec(str);
  }));
  return bitmap;
}
function uint8array2dec(bitmap) {
  var binArr = [];
  bitmap.forEach(function (n) {
    return binArr.push(dec2bin(n).slice(-8));
  });
  return bin2dec(binArr.join(''));
} // index from left to right

function setBit(n, idx) {
  if (idx > 31 || idx < 0) {
    throw new Error("mask: invalid idx at " + idx + ", should be between 0 and 31");
  }

  var mask = 1 << 32 - idx - 1;
  return n | mask;
} // index from left to right

function isSetBit(n, idx) {
  if (idx > 31 || idx < 0) {
    throw new Error("mask: invalid idx at " + idx + ", should be between 0 and 31");
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

var CryptoMaterialError = {
  SerializationError: 'Struct to be signed does not serialize correctly',
  DeserializationError: 'Key or signature material does not deserialize correctly',
  ValidationError: 'Key or signature material deserializes, but is otherwise not valid',
  WrongLengthError: 'Key, threshold or signature material does not have the expected size',
  CanonicalRepresentationError: 'Part of the signature or key is not canonical resulting to malleability issues',
  SmallSubgroupError: 'A curve point (i.e., a public key) lies on a small group',
  PointNotOnCurveError: 'A curve point (i.e., a public key) does not satisfy the curve equation',
  BitVecError: 'BitVec errors in accountable multi-sig schemes'
};
var MAX_NUM_OF_KEYS = 32;
var AccessPath = /*#__PURE__*/function () {
  function AccessPath(field0, field1) {
    this.field0 = field0;
    this.field1 = field1;
  }

  var _proto = AccessPath.prototype;

  _proto.serialize = function serialize(serializer) {
    this.field0.serialize(serializer);
    this.field1.serialize(serializer);
  };

  AccessPath.deserialize = function deserialize(deserializer) {
    var field0 = AccountAddress.deserialize(deserializer);
    var field1 = DataPath.deserialize(deserializer);
    return new AccessPath(field0, field1);
  };

  return AccessPath;
}();
var AccountAddress = /*#__PURE__*/function () {
  function AccountAddress(value) {
    this.value = value;
  }

  var _proto2 = AccountAddress.prototype;

  _proto2.serialize = function serialize(serializer) {
    Helpers.serializeArray16U8Array(this.value, serializer);
  };

  AccountAddress.deserialize = function deserialize(deserializer) {
    var value = Helpers.deserializeArray16U8Array(deserializer);
    return new AccountAddress(value);
  };

  return AccountAddress;
}();
AccountAddress.LENGTH = 16;
var AccountResource = /*#__PURE__*/function () {
  function AccountResource(authentication_key, withdrawal_capability, key_rotation_capability, withdraw_events, deposit_events, accept_token_events, sequence_number) {
    this.authentication_key = authentication_key;
    this.withdrawal_capability = withdrawal_capability;
    this.key_rotation_capability = key_rotation_capability;
    this.withdraw_events = withdraw_events;
    this.deposit_events = deposit_events;
    this.accept_token_events = accept_token_events;
    this.sequence_number = sequence_number;
  }

  var _proto3 = AccountResource.prototype;

  _proto3.serialize = function serialize(serializer) {
    Helpers.serializeVectorU8(this.authentication_key, serializer);
    Helpers.serializeOptionWithdrawCapabilityResource(this.withdrawal_capability, serializer);
    Helpers.serializeOptionKeyRotationCapabilityResource(this.key_rotation_capability, serializer);
    this.withdraw_events.serialize(serializer);
    this.deposit_events.serialize(serializer);
    this.accept_token_events.serialize(serializer);
    serializer.serializeU64(this.sequence_number);
  };

  AccountResource.deserialize = function deserialize(deserializer) {
    var authentication_key = Helpers.deserializeVectorU8(deserializer);
    var withdrawal_capability = Helpers.deserializeOptionWithdrawCapabilityResource(deserializer);
    var key_rotation_capability = Helpers.deserializeOptionKeyRotationCapabilityResource(deserializer);
    var withdraw_events = EventHandle.deserialize(deserializer);
    var deposit_events = EventHandle.deserialize(deserializer);
    var accept_token_events = EventHandle.deserialize(deserializer);
    var sequence_number = deserializer.deserializeU64();
    return new AccountResource(authentication_key, withdrawal_capability, key_rotation_capability, withdraw_events, deposit_events, accept_token_events, sequence_number);
  };

  return AccountResource;
}();
var ArgumentABI = /*#__PURE__*/function () {
  function ArgumentABI(name, type_tag) {
    this.name = name;
    this.type_tag = type_tag;
  }

  var _proto4 = ArgumentABI.prototype;

  _proto4.serialize = function serialize(serializer) {
    serializer.serializeStr(this.name);
    this.type_tag.serialize(serializer);
  };

  ArgumentABI.deserialize = function deserialize(deserializer) {
    var name = deserializer.deserializeStr();
    var type_tag = TypeTag.deserialize(deserializer);
    return new ArgumentABI(name, type_tag);
  };

  return ArgumentABI;
}();
var AuthenticationKey = /*#__PURE__*/function () {
  function AuthenticationKey(value) {
    this.value = value;
  }

  var _proto5 = AuthenticationKey.prototype;

  _proto5.serialize = function serialize(serializer) {
    serializer.serializeBytes(this.value);
  };

  AuthenticationKey.deserialize = function deserialize(deserializer) {
    var value = deserializer.deserializeBytes();
    return new AuthenticationKey(value);
  };

  return AuthenticationKey;
}();
var BlockMetadata = /*#__PURE__*/function () {
  function BlockMetadata(parent_hash, timestamp, author, author_auth_key, uncles, number, chain_id, parent_gas_used) {
    this.parent_hash = parent_hash;
    this.timestamp = timestamp;
    this.author = author;
    this.author_auth_key = author_auth_key;
    this.uncles = uncles;
    this.number = number;
    this.chain_id = chain_id;
    this.parent_gas_used = parent_gas_used;
  }

  var _proto6 = BlockMetadata.prototype;

  _proto6.serialize = function serialize(serializer) {
    this.parent_hash.serialize(serializer);
    serializer.serializeU64(this.timestamp);
    this.author.serialize(serializer);
    Helpers.serializeOptionAuthenticationKey(this.author_auth_key, serializer);
    serializer.serializeU64(this.uncles);
    serializer.serializeU64(this.number);
    this.chain_id.serialize(serializer);
    serializer.serializeU64(this.parent_gas_used);
  };

  BlockMetadata.deserialize = function deserialize(deserializer) {
    var parent_hash = HashValue.deserialize(deserializer);
    var timestamp = deserializer.deserializeU64();
    var author = AccountAddress.deserialize(deserializer);
    var author_auth_key = Helpers.deserializeOptionAuthenticationKey(deserializer);
    var uncles = deserializer.deserializeU64();
    var number = deserializer.deserializeU64();
    var chain_id = ChainId.deserialize(deserializer);
    var parent_gas_used = deserializer.deserializeU64();
    return new BlockMetadata(parent_hash, timestamp, author, author_auth_key, uncles, number, chain_id, parent_gas_used);
  };

  return BlockMetadata;
}();
var ChainId = /*#__PURE__*/function () {
  function ChainId(id) {
    this.id = id;
  }

  var _proto7 = ChainId.prototype;

  _proto7.serialize = function serialize(serializer) {
    serializer.serializeU8(this.id);
  };

  ChainId.deserialize = function deserialize(deserializer) {
    var id = deserializer.deserializeU8();
    return new ChainId(id);
  };

  return ChainId;
}();
var ContractEvent = /*#__PURE__*/function () {
  function ContractEvent() {}

  ContractEvent.deserialize = function deserialize(deserializer) {
    var index = deserializer.deserializeVariantIndex();

    switch (index) {
      case 0:
        return ContractEventVariantV0.load(deserializer);

      default:
        throw new Error("Unknown variant index for ContractEvent: " + index);
    }
  };

  return ContractEvent;
}();
var ContractEventVariantV0 = /*#__PURE__*/function (_ContractEvent) {
  _inheritsLoose(ContractEventVariantV0, _ContractEvent);

  function ContractEventVariantV0(value) {
    var _this;

    _this = _ContractEvent.call(this) || this;
    _this.value = value;
    return _this;
  }

  var _proto8 = ContractEventVariantV0.prototype;

  _proto8.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  };

  ContractEventVariantV0.load = function load(deserializer) {
    var value = ContractEventV0.deserialize(deserializer);
    return new ContractEventVariantV0(value);
  };

  return ContractEventVariantV0;
}(ContractEvent);
var ContractEventV0 = /*#__PURE__*/function () {
  function ContractEventV0(key, sequence_number, type_tag, event_data) {
    this.key = key;
    this.sequence_number = sequence_number;
    this.type_tag = type_tag;
    this.event_data = event_data;
  }

  var _proto9 = ContractEventV0.prototype;

  _proto9.serialize = function serialize(serializer) {
    this.key.serialize(serializer);
    serializer.serializeU64(this.sequence_number);
    this.type_tag.serialize(serializer);
    serializer.serializeBytes(this.event_data);
  };

  ContractEventV0.deserialize = function deserialize(deserializer) {
    var key = EventKey.deserialize(deserializer);
    var sequence_number = deserializer.deserializeU64();
    var type_tag = TypeTag.deserialize(deserializer);
    var event_data = deserializer.deserializeBytes();
    return new ContractEventV0(key, sequence_number, type_tag, event_data);
  };

  return ContractEventV0;
}();
var DataPath = /*#__PURE__*/function () {
  function DataPath() {}

  DataPath.deserialize = function deserialize(deserializer) {
    var index = deserializer.deserializeVariantIndex();

    switch (index) {
      case 0:
        return DataPathVariantCode.load(deserializer);

      case 1:
        return DataPathVariantResource.load(deserializer);

      default:
        throw new Error("Unknown variant index for DataPath: " + index);
    }
  };

  return DataPath;
}();
var DataPathVariantCode = /*#__PURE__*/function (_DataPath) {
  _inheritsLoose(DataPathVariantCode, _DataPath);

  function DataPathVariantCode(value) {
    var _this2;

    _this2 = _DataPath.call(this) || this;
    _this2.value = value;
    return _this2;
  }

  var _proto10 = DataPathVariantCode.prototype;

  _proto10.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  };

  DataPathVariantCode.load = function load(deserializer) {
    var value = Identifier.deserialize(deserializer);
    return new DataPathVariantCode(value);
  };

  return DataPathVariantCode;
}(DataPath);
var DataPathVariantResource = /*#__PURE__*/function (_DataPath2) {
  _inheritsLoose(DataPathVariantResource, _DataPath2);

  function DataPathVariantResource(value) {
    var _this3;

    _this3 = _DataPath2.call(this) || this;
    _this3.value = value;
    return _this3;
  }

  var _proto11 = DataPathVariantResource.prototype;

  _proto11.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(1);
    this.value.serialize(serializer);
  };

  DataPathVariantResource.load = function load(deserializer) {
    var value = StructTag.deserialize(deserializer);
    return new DataPathVariantResource(value);
  };

  return DataPathVariantResource;
}(DataPath);
var DataType = /*#__PURE__*/function () {
  function DataType() {}

  DataType.deserialize = function deserialize(deserializer) {
    var index = deserializer.deserializeVariantIndex();

    switch (index) {
      case 0:
        return DataTypeVariantCODE.load(deserializer);

      case 1:
        return DataTypeVariantRESOURCE.load(deserializer);

      default:
        throw new Error("Unknown variant index for DataType: " + index);
    }
  };

  return DataType;
}();
var DataTypeVariantCODE = /*#__PURE__*/function (_DataType) {
  _inheritsLoose(DataTypeVariantCODE, _DataType);

  function DataTypeVariantCODE() {
    return _DataType.call(this) || this;
  }

  var _proto12 = DataTypeVariantCODE.prototype;

  _proto12.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(0);
  };

  DataTypeVariantCODE.load = function load(deserializer) {
    return new DataTypeVariantCODE();
  };

  return DataTypeVariantCODE;
}(DataType);
var DataTypeVariantRESOURCE = /*#__PURE__*/function (_DataType2) {
  _inheritsLoose(DataTypeVariantRESOURCE, _DataType2);

  function DataTypeVariantRESOURCE() {
    return _DataType2.call(this) || this;
  }

  var _proto13 = DataTypeVariantRESOURCE.prototype;

  _proto13.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(1);
  };

  DataTypeVariantRESOURCE.load = function load(deserializer) {
    return new DataTypeVariantRESOURCE();
  };

  return DataTypeVariantRESOURCE;
}(DataType);
var Ed25519PrivateKey = /*#__PURE__*/function () {
  function Ed25519PrivateKey(value) {
    this.value = value;
  }

  var _proto14 = Ed25519PrivateKey.prototype;

  _proto14.serialize = function serialize(serializer) {
    serializer.serializeBytes(this.value);
  };

  Ed25519PrivateKey.deserialize = function deserialize(deserializer) {
    var value = deserializer.deserializeBytes();
    return new Ed25519PrivateKey(value);
  };

  return Ed25519PrivateKey;
}();
var Ed25519PublicKey = /*#__PURE__*/function () {
  function Ed25519PublicKey(value) {
    this.value = value;
  }

  var _proto15 = Ed25519PublicKey.prototype;

  _proto15.serialize = function serialize(serializer) {
    serializer.serializeBytes(this.value);
  };

  Ed25519PublicKey.deserialize = function deserialize(deserializer) {
    var value = deserializer.deserializeBytes();
    return new Ed25519PublicKey(value);
  };

  return Ed25519PublicKey;
}();
var Ed25519Signature = /*#__PURE__*/function () {
  function Ed25519Signature(value) {
    this.value = value;
  }

  var _proto16 = Ed25519Signature.prototype;

  _proto16.serialize = function serialize(serializer) {
    serializer.serializeBytes(this.value);
  };

  Ed25519Signature.deserialize = function deserialize(deserializer) {
    var value = deserializer.deserializeBytes();
    return new Ed25519Signature(value);
  };

  return Ed25519Signature;
}();
var EventHandle = /*#__PURE__*/function () {
  function EventHandle(count, key) {
    this.count = count;
    this.key = key;
  }

  var _proto17 = EventHandle.prototype;

  _proto17.serialize = function serialize(serializer) {
    serializer.serializeU64(this.count);
    this.key.serialize(serializer);
  };

  EventHandle.deserialize = function deserialize(deserializer) {
    var count = deserializer.deserializeU64();
    var key = EventKey.deserialize(deserializer);
    return new EventHandle(count, key);
  };

  return EventHandle;
}();
var EventKey = /*#__PURE__*/function () {
  function EventKey(value) {
    this.value = value;
  }

  var _proto18 = EventKey.prototype;

  _proto18.serialize = function serialize(serializer) {
    serializer.serializeBytes(this.value);
  };

  EventKey.deserialize = function deserialize(deserializer) {
    var value = deserializer.deserializeBytes();
    return new EventKey(value);
  };

  return EventKey;
}();
var HashValue = /*#__PURE__*/function () {
  function HashValue(value) {
    this.value = value;
  }

  var _proto19 = HashValue.prototype;

  _proto19.serialize = function serialize(serializer) {
    serializer.serializeBytes(this.value);
  };

  HashValue.deserialize = function deserialize(deserializer) {
    var value = deserializer.deserializeBytes();
    return new HashValue(value);
  };

  return HashValue;
}();
var Identifier = /*#__PURE__*/function () {
  function Identifier(value) {
    this.value = value;
  }

  var _proto20 = Identifier.prototype;

  _proto20.serialize = function serialize(serializer) {
    serializer.serializeStr(this.value);
  };

  Identifier.deserialize = function deserialize(deserializer) {
    var value = deserializer.deserializeStr();
    return new Identifier(value);
  };

  return Identifier;
}();
var KeyRotationCapabilityResource = /*#__PURE__*/function () {
  function KeyRotationCapabilityResource(account_address) {
    this.account_address = account_address;
  }

  var _proto21 = KeyRotationCapabilityResource.prototype;

  _proto21.serialize = function serialize(serializer) {
    this.account_address.serialize(serializer);
  };

  KeyRotationCapabilityResource.deserialize = function deserialize(deserializer) {
    var account_address = AccountAddress.deserialize(deserializer);
    return new KeyRotationCapabilityResource(account_address);
  };

  return KeyRotationCapabilityResource;
}();
var Module = /*#__PURE__*/function () {
  function Module(code) {
    this.code = code;
  }

  var _proto22 = Module.prototype;

  _proto22.serialize = function serialize(serializer) {
    serializer.serializeBytes(this.code);
  };

  Module.deserialize = function deserialize(deserializer) {
    var code = deserializer.deserializeBytes();
    return new Module(code);
  };

  return Module;
}();
var ModuleId = /*#__PURE__*/function () {
  function ModuleId(address, name) {
    this.address = address;
    this.name = name;
  }

  var _proto23 = ModuleId.prototype;

  _proto23.serialize = function serialize(serializer) {
    this.address.serialize(serializer);
    this.name.serialize(serializer);
  };

  ModuleId.deserialize = function deserialize(deserializer) {
    var address = AccountAddress.deserialize(deserializer);
    var name = Identifier.deserialize(deserializer);
    return new ModuleId(address, name);
  };

  return ModuleId;
}();
var MultiEd25519PrivateKey = /*#__PURE__*/function () {
  function MultiEd25519PrivateKey(value) {
    this.value = value;
  }

  var _proto24 = MultiEd25519PrivateKey.prototype;

  _proto24.serialize = function serialize(serializer) {
    serializer.serializeBytes(this.value);
  };

  MultiEd25519PrivateKey.deserialize = function deserialize(deserializer) {
    var value = deserializer.deserializeBytes();
    return new MultiEd25519PrivateKey(value);
  };

  return MultiEd25519PrivateKey;
}();
var MultiEd25519PublicKey = /*#__PURE__*/function () {
  function MultiEd25519PublicKey(public_keys, threshold) {
    this.public_keys = public_keys;
    this.threshold = threshold;
    var num_of_public_keys = public_keys.length;

    if (threshold === 0 || num_of_public_keys < threshold) {
      throw new Error(CryptoMaterialError.ValidationError);
    } else if (num_of_public_keys > MAX_NUM_OF_KEYS) {
      throw new Error(CryptoMaterialError.WrongLengthError);
    }
  }

  var _proto25 = MultiEd25519PublicKey.prototype;

  _proto25.serialize = function serialize(serializer) {
    serializer.serializeBytes(this.value());
  };

  MultiEd25519PublicKey.deserialize = function deserialize(deserializer) {
    var bytes = deserializer.deserializeBytes();
    var public_keys = [];
    var count = (bytes.length - 1) / 32;

    for (var i = 0; i < count; i++) {
      var start = i * 32;
      var end = start + 32;
      public_keys.push(new Ed25519PublicKey(bytes.slice(start, end)));
    }

    var threshold = new DataView(bytes.slice(-1).buffer, 0).getUint8(0);
    return new MultiEd25519PublicKey(public_keys, threshold);
  };

  _proto25.value = function value() {
    var arrPub = [];
    this.public_keys.forEach(function (pub) {
      arrPub.push(pub.value);
    });
    var arrThreshold = new Uint8Array(1);
    arrThreshold[0] = this.threshold;
    var bytes$1 = bytes.concat([].concat(arrPub, arrThreshold));
    return bytes$1;
  };

  return MultiEd25519PublicKey;
}();
var MultiEd25519Signature = /*#__PURE__*/function () {
  // 0b00010000000000000000000000000001(268435457), the 3rd and 31st positions are set.
  function MultiEd25519Signature(signatures, bitmap) {
    this.signatures = signatures;
    this.bitmap = bitmap;
  }

  MultiEd25519Signature.build = function build(origin_signatures) {
    var num_of_sigs = origin_signatures.length;

    if (num_of_sigs === 0 || num_of_sigs > MAX_NUM_OF_KEYS) {
      throw new Error(CryptoMaterialError.ValidationError);
    }

    var sorted_signatures = origin_signatures.sort(function (a, b) {
      return a[1] > b[1] ? 1 : -1;
    });
    var sigs = [];
    var bitmap = 0;
    sorted_signatures.forEach(function (k, v) {
      console.log(k, v);

      if (k[1] >= MAX_NUM_OF_KEYS) {
        throw new Error(CryptoMaterialError.BitVecError + ": Signature index is out of range");
      } else if (isSetBit(bitmap, k[1])) {
        throw new Error(CryptoMaterialError.BitVecError + ": Duplicate signature index");
      } else {
        sigs.push(k[0]);
        bitmap = setBit(bitmap, k[1]);
      }
    });
    return new MultiEd25519Signature(sigs, bitmap);
  };

  var _proto26 = MultiEd25519Signature.prototype;

  _proto26.serialize = function serialize(serializer) {
    serializer.serializeBytes(this.value());
  };

  MultiEd25519Signature.deserialize = function deserialize(deserializer) {
    var bytes = deserializer.deserializeBytes();
    var signatures = [];
    var count = (bytes.length - 4) / 64;

    for (var i = 0; i < count; i++) {
      var start = i * 64;
      var end = start + 64;
      signatures.push(new Ed25519Signature(bytes.slice(start, end)));
    }

    var bitmap = uint8array2dec(bytes.slice(-4));
    return new MultiEd25519Signature(signatures, bitmap);
  };

  _proto26.value = function value() {
    var arrSignatures = [];
    this.signatures.forEach(function (signature) {
      arrSignatures.push(signature.value);
    });
    var arrBitmap = dec2uint8array(this.bitmap);
    var bytes$1 = bytes.concat([].concat(arrSignatures, arrBitmap));
    return bytes$1;
  };

  return MultiEd25519Signature;
}();
var MultiEd25519SignatureShard = /*#__PURE__*/function () {
  function MultiEd25519SignatureShard(signature, threshold) {
    this.signature = signature;
    this.threshold = threshold;
  }

  var _proto27 = MultiEd25519SignatureShard.prototype;

  _proto27.signatures = function signatures() {
    var signatures = this.signature.signatures;
    var bitmap = this.signature.bitmap;
    var result = [];
    var bitmap_index = 0;
    signatures.forEach(function (v, idx) {
      while (!isSetBit(bitmap, bitmap_index)) {
        bitmap_index += 1;
      }

      result.push([v, bitmap_index]);
      bitmap_index += 1;
    });
    return result;
  };

  MultiEd25519SignatureShard.merge = function merge(shards) {
    if (shards.length === 0) {
      throw new Error('MultiEd25519SignatureShard shards is empty');
    }

    var threshold = shards[0].threshold;
    var signatures = [];
    shards.forEach(function (shard) {
      if (shard.threshold !== threshold) {
        throw new Error('MultiEd25519SignatureShard shards threshold not same');
      }

      signatures.push.apply(signatures, shard.signatures());
    });
    return new MultiEd25519SignatureShard(MultiEd25519Signature.build(signatures), threshold);
  };

  _proto27.is_enough = function is_enough() {
    return this.signature.signatures.length >= this.threshold;
  };

  return MultiEd25519SignatureShard;
}(); // Part of private keys in the multi-key Ed25519 structure along with the threshold.
// note: the private keys must be a sequential part of the MultiEd25519PrivateKey

var MultiEd25519KeyShard = /*#__PURE__*/function () {
  function MultiEd25519KeyShard(public_keys, threshold, private_keys) {
    this.public_keys = public_keys;
    this.threshold = threshold;
    this.private_keys = private_keys;
    var num_of_public_keys = public_keys.length;
    var num_of_private_keys = Object.keys(private_keys).length;

    if (threshold === 0 || num_of_private_keys === 0 || num_of_public_keys < threshold) {
      throw new Error(CryptoMaterialError.ValidationError);
    } else if (num_of_private_keys > MAX_NUM_OF_KEYS || num_of_public_keys > MAX_NUM_OF_KEYS) {
      throw new Error(CryptoMaterialError.WrongLengthError);
    }
  }

  var _proto28 = MultiEd25519KeyShard.prototype;

  _proto28.serialize = function serialize(serializer) {
    var _this4 = this;

    serializer.serializeU8(this.public_keys.length);
    serializer.serializeU8(this.threshold);
    serializer.serializeU8(this.len());
    this.public_keys.forEach(function (pub) {
      pub.serialize(serializer);
    });
    Object.keys(this.private_keys).forEach(function (pos) {
      serializer.serializeU8(Number.parseInt(pos, 10));

      _this4.private_keys[pos].serialize(serializer);
    });
  };

  MultiEd25519KeyShard.deserialize = function deserialize(deserializer) {
    var publicKeysLen = deserializer.deserializeU8();
    var threshold = deserializer.deserializeU8();
    var privateKeysLen = deserializer.deserializeU8();
    var public_keys = [];

    for (var i = 0; i < publicKeysLen; i++) {
      public_keys.push(Ed25519PublicKey.deserialize(deserializer));
    }

    var private_keys = [];

    for (var _i = 0; _i < privateKeysLen; _i++) {
      var pos = deserializer.deserializeU8();
      var privateKey = Ed25519PrivateKey.deserialize(deserializer);
      public_keys[pos] = privateKey;
    }

    return new MultiEd25519KeyShard(public_keys, threshold, private_keys);
  };

  _proto28.publicKey = function publicKey() {
    return new MultiEd25519PublicKey(this.public_keys, this.threshold);
  } // should be different for each account, since the private_keys are not the same
  ;

  _proto28.privateKeys = function privateKeys() {
    return Object.values(this.private_keys);
  } // should be different for each account, since the private_keys are not the same
  ;

  _proto28.privateKey = function privateKey() {
    var arrHead = new Uint8Array(3);
    arrHead[0] = this.public_keys.length;
    arrHead[1] = this.threshold;
    arrHead[2] = this.len();
    var arrPub = [];
    this.public_keys.forEach(function (pub) {
      arrPub.push(pub.value);
    });
    var arrPriv = [];
    Object.values(this.private_keys).forEach(function (priv) {
      arrPriv.push(priv.value);
    });
    var bytes$1 = bytes.concat([arrHead].concat(arrPub, arrPriv));
    return bytes$1;
  };

  _proto28.len = function len() {
    return Object.values(this.private_keys).length;
  };

  _proto28.isEmpty = function isEmpty() {
    return this.len() === 0;
  };

  return MultiEd25519KeyShard;
}();
var Package = /*#__PURE__*/function () {
  function Package(package_address, modules, init_script) {
    this.package_address = package_address;
    this.modules = modules;
    this.init_script = init_script;
  }

  var _proto29 = Package.prototype;

  _proto29.serialize = function serialize(serializer) {
    this.package_address.serialize(serializer);
    Helpers.serializeVectorModule(this.modules, serializer);
    Helpers.serializeOptionScriptFunction(this.init_script, serializer);
  };

  Package.deserialize = function deserialize(deserializer) {
    var package_address = AccountAddress.deserialize(deserializer);
    var modules = Helpers.deserializeVectorModule(deserializer);
    var init_script = Helpers.deserializeOptionScriptFunction(deserializer);
    return new Package(package_address, modules, init_script);
  };

  return Package;
}();
var RawUserTransaction = /*#__PURE__*/function () {
  function RawUserTransaction(sender, sequence_number, payload, max_gas_amount, gas_unit_price, gas_token_code, expiration_timestamp_secs, chain_id) {
    this.sender = sender;
    this.sequence_number = sequence_number;
    this.payload = payload;
    this.max_gas_amount = max_gas_amount;
    this.gas_unit_price = gas_unit_price;
    this.gas_token_code = gas_token_code;
    this.expiration_timestamp_secs = expiration_timestamp_secs;
    this.chain_id = chain_id;
  }

  var _proto30 = RawUserTransaction.prototype;

  _proto30.serialize = function serialize(serializer) {
    this.sender.serialize(serializer);
    serializer.serializeU64(this.sequence_number);
    this.payload.serialize(serializer);
    serializer.serializeU64(this.max_gas_amount);
    serializer.serializeU64(this.gas_unit_price);
    serializer.serializeStr(this.gas_token_code);
    serializer.serializeU64(this.expiration_timestamp_secs);
    this.chain_id.serialize(serializer);
  };

  RawUserTransaction.deserialize = function deserialize(deserializer) {
    var sender = AccountAddress.deserialize(deserializer);
    var sequence_number = deserializer.deserializeU64();
    var payload = TransactionPayload.deserialize(deserializer);
    var max_gas_amount = deserializer.deserializeU64();
    var gas_unit_price = deserializer.deserializeU64();
    var gas_token_code = deserializer.deserializeStr();
    var expiration_timestamp_secs = deserializer.deserializeU64();
    var chain_id = ChainId.deserialize(deserializer);
    return new RawUserTransaction(sender, sequence_number, payload, max_gas_amount, gas_unit_price, gas_token_code, expiration_timestamp_secs, chain_id);
  };

  return RawUserTransaction;
}();
var Script = /*#__PURE__*/function () {
  function Script(code, ty_args, args) {
    this.code = code;
    this.ty_args = ty_args;
    this.args = args;
  }

  var _proto31 = Script.prototype;

  _proto31.serialize = function serialize(serializer) {
    serializer.serializeBytes(this.code);
    Helpers.serializeVectorTypeTag(this.ty_args, serializer);
    Helpers.serializeVectorBytes(this.args, serializer);
  };

  Script.deserialize = function deserialize(deserializer) {
    var code = deserializer.deserializeBytes();
    var ty_args = Helpers.deserializeVectorTypeTag(deserializer);
    var args = Helpers.deserializeVectorBytes(deserializer);
    return new Script(code, ty_args, args);
  };

  return Script;
}();
var ScriptABI = /*#__PURE__*/function () {
  function ScriptABI() {}

  ScriptABI.deserialize = function deserialize(deserializer) {
    var index = deserializer.deserializeVariantIndex();

    switch (index) {
      case 0:
        return ScriptABIVariantTransactionScript.load(deserializer);

      case 1:
        return ScriptABIVariantScriptFunction.load(deserializer);

      default:
        throw new Error("Unknown variant index for ScriptABI: " + index);
    }
  };

  return ScriptABI;
}();
var ScriptABIVariantTransactionScript = /*#__PURE__*/function (_ScriptABI) {
  _inheritsLoose(ScriptABIVariantTransactionScript, _ScriptABI);

  function ScriptABIVariantTransactionScript(value) {
    var _this5;

    _this5 = _ScriptABI.call(this) || this;
    _this5.value = value;
    return _this5;
  }

  var _proto32 = ScriptABIVariantTransactionScript.prototype;

  _proto32.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  };

  ScriptABIVariantTransactionScript.load = function load(deserializer) {
    var value = TransactionScriptABI.deserialize(deserializer);
    return new ScriptABIVariantTransactionScript(value);
  };

  return ScriptABIVariantTransactionScript;
}(ScriptABI);
var ScriptABIVariantScriptFunction = /*#__PURE__*/function (_ScriptABI2) {
  _inheritsLoose(ScriptABIVariantScriptFunction, _ScriptABI2);

  function ScriptABIVariantScriptFunction(value) {
    var _this6;

    _this6 = _ScriptABI2.call(this) || this;
    _this6.value = value;
    return _this6;
  }

  var _proto33 = ScriptABIVariantScriptFunction.prototype;

  _proto33.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(1);
    this.value.serialize(serializer);
  };

  ScriptABIVariantScriptFunction.load = function load(deserializer) {
    var value = ScriptFunctionABI.deserialize(deserializer);
    return new ScriptABIVariantScriptFunction(value);
  };

  return ScriptABIVariantScriptFunction;
}(ScriptABI);
var ScriptFunction = /*#__PURE__*/function () {
  // need to rename `function` to `func` as `function` is a keyword in JS.
  function ScriptFunction(module, func, ty_args, args) {
    this.module = module;
    this.func = func;
    this.ty_args = ty_args;
    this.args = args;
  }

  var _proto34 = ScriptFunction.prototype;

  _proto34.serialize = function serialize(serializer) {
    this.module.serialize(serializer);
    this.func.serialize(serializer);
    Helpers.serializeVectorTypeTag(this.ty_args, serializer);
    Helpers.serializeVectorBytes(this.args, serializer);
  };

  ScriptFunction.deserialize = function deserialize(deserializer) {
    var module = ModuleId.deserialize(deserializer);
    var func = Identifier.deserialize(deserializer);
    var ty_args = Helpers.deserializeVectorTypeTag(deserializer);
    var args = Helpers.deserializeVectorBytes(deserializer);
    return new ScriptFunction(module, func, ty_args, args);
  };

  return ScriptFunction;
}();
var ScriptFunctionABI = /*#__PURE__*/function () {
  function ScriptFunctionABI(name, module_name, doc, ty_args, args) {
    this.name = name;
    this.module_name = module_name;
    this.doc = doc;
    this.ty_args = ty_args;
    this.args = args;
  }

  var _proto35 = ScriptFunctionABI.prototype;

  _proto35.serialize = function serialize(serializer) {
    serializer.serializeStr(this.name);
    this.module_name.serialize(serializer);
    serializer.serializeStr(this.doc);
    Helpers.serializeVectorTypeArgumentAbi(this.ty_args, serializer);
    Helpers.serializeVectorArgumentAbi(this.args, serializer);
  };

  ScriptFunctionABI.deserialize = function deserialize(deserializer) {
    var name = deserializer.deserializeStr();
    var module_name = ModuleId.deserialize(deserializer);
    var doc = deserializer.deserializeStr();
    var ty_args = Helpers.deserializeVectorTypeArgumentAbi(deserializer);
    var args = Helpers.deserializeVectorArgumentAbi(deserializer);
    return new ScriptFunctionABI(name, module_name, doc, ty_args, args);
  };

  return ScriptFunctionABI;
}();
var SignedUserTransaction = /*#__PURE__*/function () {
  function SignedUserTransaction(raw_txn, authenticator) {
    this.raw_txn = raw_txn;
    this.authenticator = authenticator;
  }

  var _proto36 = SignedUserTransaction.prototype;

  _proto36.serialize = function serialize(serializer) {
    this.raw_txn.serialize(serializer);
    this.authenticator.serialize(serializer);
  };

  SignedUserTransaction.deserialize = function deserialize(deserializer) {
    var raw_txn = RawUserTransaction.deserialize(deserializer);
    var authenticator = TransactionAuthenticator.deserialize(deserializer);
    return new SignedUserTransaction(raw_txn, authenticator);
  };

  SignedUserTransaction.ed25519 = function ed25519(raw_txn, public_key, signature) {
    var authenticator = new TransactionAuthenticatorVariantEd25519(public_key, signature);
    return new SignedUserTransaction(raw_txn, authenticator);
  };

  SignedUserTransaction.multi_ed25519 = function multi_ed25519(raw_txn, public_key, signature) {
    var authenticator = new TransactionAuthenticatorVariantMultiEd25519(public_key, signature);
    return new SignedUserTransaction(raw_txn, authenticator);
  };

  return SignedUserTransaction;
}();
var StructTag = /*#__PURE__*/function () {
  function StructTag(address, module, name, type_params) {
    this.address = address;
    this.module = module;
    this.name = name;
    this.type_params = type_params;
  }

  var _proto37 = StructTag.prototype;

  _proto37.serialize = function serialize(serializer) {
    this.address.serialize(serializer);
    this.module.serialize(serializer);
    this.name.serialize(serializer);
    Helpers.serializeVectorTypeTag(this.type_params, serializer);
  };

  StructTag.deserialize = function deserialize(deserializer) {
    var address = AccountAddress.deserialize(deserializer);
    var module = Identifier.deserialize(deserializer);
    var name = Identifier.deserialize(deserializer);
    var type_params = Helpers.deserializeVectorTypeTag(deserializer);
    return new StructTag(address, module, name, type_params);
  };

  return StructTag;
}();
var Transaction = /*#__PURE__*/function () {
  function Transaction() {}

  Transaction.deserialize = function deserialize(deserializer) {
    var index = deserializer.deserializeVariantIndex();

    switch (index) {
      case 0:
        return TransactionVariantUserTransaction.load(deserializer);

      case 1:
        return TransactionVariantBlockMetadata.load(deserializer);

      default:
        throw new Error("Unknown variant index for Transaction: " + index);
    }
  };

  return Transaction;
}();
var TransactionVariantUserTransaction = /*#__PURE__*/function (_Transaction) {
  _inheritsLoose(TransactionVariantUserTransaction, _Transaction);

  function TransactionVariantUserTransaction(value) {
    var _this7;

    _this7 = _Transaction.call(this) || this;
    _this7.value = value;
    return _this7;
  }

  var _proto38 = TransactionVariantUserTransaction.prototype;

  _proto38.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  };

  TransactionVariantUserTransaction.load = function load(deserializer) {
    var value = SignedUserTransaction.deserialize(deserializer);
    return new TransactionVariantUserTransaction(value);
  };

  return TransactionVariantUserTransaction;
}(Transaction);
var TransactionVariantBlockMetadata = /*#__PURE__*/function (_Transaction2) {
  _inheritsLoose(TransactionVariantBlockMetadata, _Transaction2);

  function TransactionVariantBlockMetadata(value) {
    var _this8;

    _this8 = _Transaction2.call(this) || this;
    _this8.value = value;
    return _this8;
  }

  var _proto39 = TransactionVariantBlockMetadata.prototype;

  _proto39.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(1);
    this.value.serialize(serializer);
  };

  TransactionVariantBlockMetadata.load = function load(deserializer) {
    var value = BlockMetadata.deserialize(deserializer);
    return new TransactionVariantBlockMetadata(value);
  };

  return TransactionVariantBlockMetadata;
}(Transaction);
var TransactionArgument = /*#__PURE__*/function () {
  function TransactionArgument() {}

  TransactionArgument.deserialize = function deserialize(deserializer) {
    var index = deserializer.deserializeVariantIndex();

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
  };

  return TransactionArgument;
}();
var TransactionArgumentVariantU8 = /*#__PURE__*/function (_TransactionArgument) {
  _inheritsLoose(TransactionArgumentVariantU8, _TransactionArgument);

  function TransactionArgumentVariantU8(value) {
    var _this9;

    _this9 = _TransactionArgument.call(this) || this;
    _this9.value = value;
    return _this9;
  }

  var _proto40 = TransactionArgumentVariantU8.prototype;

  _proto40.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(0);
    serializer.serializeU8(this.value);
  };

  TransactionArgumentVariantU8.load = function load(deserializer) {
    var value = deserializer.deserializeU8();
    return new TransactionArgumentVariantU8(value);
  };

  return TransactionArgumentVariantU8;
}(TransactionArgument);
var TransactionArgumentVariantU64 = /*#__PURE__*/function (_TransactionArgument2) {
  _inheritsLoose(TransactionArgumentVariantU64, _TransactionArgument2);

  function TransactionArgumentVariantU64(value) {
    var _this10;

    _this10 = _TransactionArgument2.call(this) || this;
    _this10.value = value;
    return _this10;
  }

  var _proto41 = TransactionArgumentVariantU64.prototype;

  _proto41.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(1);
    serializer.serializeU64(this.value);
  };

  TransactionArgumentVariantU64.load = function load(deserializer) {
    var value = deserializer.deserializeU64();
    return new TransactionArgumentVariantU64(value);
  };

  return TransactionArgumentVariantU64;
}(TransactionArgument);
var TransactionArgumentVariantU128 = /*#__PURE__*/function (_TransactionArgument3) {
  _inheritsLoose(TransactionArgumentVariantU128, _TransactionArgument3);

  function TransactionArgumentVariantU128(value) {
    var _this11;

    _this11 = _TransactionArgument3.call(this) || this;
    _this11.value = value;
    return _this11;
  }

  var _proto42 = TransactionArgumentVariantU128.prototype;

  _proto42.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(2);
    serializer.serializeU128(this.value);
  };

  TransactionArgumentVariantU128.load = function load(deserializer) {
    var value = deserializer.deserializeU128();
    return new TransactionArgumentVariantU128(value);
  };

  return TransactionArgumentVariantU128;
}(TransactionArgument);
var TransactionArgumentVariantAddress = /*#__PURE__*/function (_TransactionArgument4) {
  _inheritsLoose(TransactionArgumentVariantAddress, _TransactionArgument4);

  function TransactionArgumentVariantAddress(value) {
    var _this12;

    _this12 = _TransactionArgument4.call(this) || this;
    _this12.value = value;
    return _this12;
  }

  var _proto43 = TransactionArgumentVariantAddress.prototype;

  _proto43.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(3);
    this.value.serialize(serializer);
  };

  TransactionArgumentVariantAddress.load = function load(deserializer) {
    var value = AccountAddress.deserialize(deserializer);
    return new TransactionArgumentVariantAddress(value);
  };

  return TransactionArgumentVariantAddress;
}(TransactionArgument);
var TransactionArgumentVariantU8Vector = /*#__PURE__*/function (_TransactionArgument5) {
  _inheritsLoose(TransactionArgumentVariantU8Vector, _TransactionArgument5);

  function TransactionArgumentVariantU8Vector(value) {
    var _this13;

    _this13 = _TransactionArgument5.call(this) || this;
    _this13.value = value;
    return _this13;
  }

  var _proto44 = TransactionArgumentVariantU8Vector.prototype;

  _proto44.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(4);
    serializer.serializeBytes(this.value);
  };

  TransactionArgumentVariantU8Vector.load = function load(deserializer) {
    var value = deserializer.deserializeBytes();
    return new TransactionArgumentVariantU8Vector(value);
  };

  return TransactionArgumentVariantU8Vector;
}(TransactionArgument);
var TransactionArgumentVariantBool = /*#__PURE__*/function (_TransactionArgument6) {
  _inheritsLoose(TransactionArgumentVariantBool, _TransactionArgument6);

  function TransactionArgumentVariantBool(value) {
    var _this14;

    _this14 = _TransactionArgument6.call(this) || this;
    _this14.value = value;
    return _this14;
  }

  var _proto45 = TransactionArgumentVariantBool.prototype;

  _proto45.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(5);
    serializer.serializeBool(this.value);
  };

  TransactionArgumentVariantBool.load = function load(deserializer) {
    var value = deserializer.deserializeBool();
    return new TransactionArgumentVariantBool(value);
  };

  return TransactionArgumentVariantBool;
}(TransactionArgument);
var TransactionAuthenticator = /*#__PURE__*/function () {
  function TransactionAuthenticator() {}

  TransactionAuthenticator.deserialize = function deserialize(deserializer) {
    var index = deserializer.deserializeVariantIndex();

    switch (index) {
      case 0:
        return TransactionAuthenticatorVariantEd25519.load(deserializer);

      case 1:
        return TransactionAuthenticatorVariantMultiEd25519.load(deserializer);

      default:
        throw new Error("Unknown variant index for TransactionAuthenticator: " + index);
    }
  };

  return TransactionAuthenticator;
}();
var TransactionAuthenticatorVariantEd25519 = /*#__PURE__*/function (_TransactionAuthentic) {
  _inheritsLoose(TransactionAuthenticatorVariantEd25519, _TransactionAuthentic);

  function TransactionAuthenticatorVariantEd25519(public_key, signature) {
    var _this15;

    _this15 = _TransactionAuthentic.call(this) || this;
    _this15.public_key = public_key;
    _this15.signature = signature;
    return _this15;
  }

  var _proto46 = TransactionAuthenticatorVariantEd25519.prototype;

  _proto46.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(0);
    this.public_key.serialize(serializer);
    this.signature.serialize(serializer);
  };

  TransactionAuthenticatorVariantEd25519.load = function load(deserializer) {
    var public_key = Ed25519PublicKey.deserialize(deserializer);
    var signature = Ed25519Signature.deserialize(deserializer);
    return new TransactionAuthenticatorVariantEd25519(public_key, signature);
  };

  return TransactionAuthenticatorVariantEd25519;
}(TransactionAuthenticator);
var TransactionAuthenticatorVariantMultiEd25519 = /*#__PURE__*/function (_TransactionAuthentic2) {
  _inheritsLoose(TransactionAuthenticatorVariantMultiEd25519, _TransactionAuthentic2);

  function TransactionAuthenticatorVariantMultiEd25519(public_key, signature) {
    var _this16;

    _this16 = _TransactionAuthentic2.call(this) || this;
    _this16.public_key = public_key;
    _this16.signature = signature;
    return _this16;
  }

  var _proto47 = TransactionAuthenticatorVariantMultiEd25519.prototype;

  _proto47.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(1);
    this.public_key.serialize(serializer);
    this.signature.serialize(serializer);
  };

  TransactionAuthenticatorVariantMultiEd25519.load = function load(deserializer) {
    var public_key = MultiEd25519PublicKey.deserialize(deserializer);
    var signature = MultiEd25519Signature.deserialize(deserializer);
    return new TransactionAuthenticatorVariantMultiEd25519(public_key, signature);
  };

  return TransactionAuthenticatorVariantMultiEd25519;
}(TransactionAuthenticator);
var TransactionPayload = /*#__PURE__*/function () {
  function TransactionPayload() {}

  TransactionPayload.deserialize = function deserialize(deserializer) {
    var index = deserializer.deserializeVariantIndex();

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
  };

  return TransactionPayload;
}();
var TransactionPayloadVariantScript = /*#__PURE__*/function (_TransactionPayload) {
  _inheritsLoose(TransactionPayloadVariantScript, _TransactionPayload);

  function TransactionPayloadVariantScript(value) {
    var _this17;

    _this17 = _TransactionPayload.call(this) || this;
    _this17.value = value;
    return _this17;
  }

  var _proto48 = TransactionPayloadVariantScript.prototype;

  _proto48.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  };

  TransactionPayloadVariantScript.load = function load(deserializer) {
    var value = Script.deserialize(deserializer);
    return new TransactionPayloadVariantScript(value);
  };

  return TransactionPayloadVariantScript;
}(TransactionPayload);
var TransactionPayloadVariantPackage = /*#__PURE__*/function (_TransactionPayload2) {
  _inheritsLoose(TransactionPayloadVariantPackage, _TransactionPayload2);

  function TransactionPayloadVariantPackage(value) {
    var _this18;

    _this18 = _TransactionPayload2.call(this) || this;
    _this18.value = value;
    return _this18;
  }

  var _proto49 = TransactionPayloadVariantPackage.prototype;

  _proto49.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(1);
    this.value.serialize(serializer);
  };

  TransactionPayloadVariantPackage.load = function load(deserializer) {
    var value = Package.deserialize(deserializer);
    return new TransactionPayloadVariantPackage(value);
  };

  return TransactionPayloadVariantPackage;
}(TransactionPayload);
var TransactionPayloadVariantScriptFunction = /*#__PURE__*/function (_TransactionPayload3) {
  _inheritsLoose(TransactionPayloadVariantScriptFunction, _TransactionPayload3);

  function TransactionPayloadVariantScriptFunction(value) {
    var _this19;

    _this19 = _TransactionPayload3.call(this) || this;
    _this19.value = value;
    return _this19;
  }

  var _proto50 = TransactionPayloadVariantScriptFunction.prototype;

  _proto50.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(2);
    this.value.serialize(serializer);
  };

  TransactionPayloadVariantScriptFunction.load = function load(deserializer) {
    var value = ScriptFunction.deserialize(deserializer);
    return new TransactionPayloadVariantScriptFunction(value);
  };

  return TransactionPayloadVariantScriptFunction;
}(TransactionPayload);
var TransactionScriptABI = /*#__PURE__*/function () {
  function TransactionScriptABI(name, doc, code, ty_args, args) {
    this.name = name;
    this.doc = doc;
    this.code = code;
    this.ty_args = ty_args;
    this.args = args;
  }

  var _proto51 = TransactionScriptABI.prototype;

  _proto51.serialize = function serialize(serializer) {
    serializer.serializeStr(this.name);
    serializer.serializeStr(this.doc);
    serializer.serializeBytes(this.code);
    Helpers.serializeVectorTypeArgumentAbi(this.ty_args, serializer);
    Helpers.serializeVectorArgumentAbi(this.args, serializer);
  };

  TransactionScriptABI.deserialize = function deserialize(deserializer) {
    var name = deserializer.deserializeStr();
    var doc = deserializer.deserializeStr();
    var code = deserializer.deserializeBytes();
    var ty_args = Helpers.deserializeVectorTypeArgumentAbi(deserializer);
    var args = Helpers.deserializeVectorArgumentAbi(deserializer);
    return new TransactionScriptABI(name, doc, code, ty_args, args);
  };

  return TransactionScriptABI;
}();
var TypeArgumentABI = /*#__PURE__*/function () {
  function TypeArgumentABI(name) {
    this.name = name;
  }

  var _proto52 = TypeArgumentABI.prototype;

  _proto52.serialize = function serialize(serializer) {
    serializer.serializeStr(this.name);
  };

  TypeArgumentABI.deserialize = function deserialize(deserializer) {
    var name = deserializer.deserializeStr();
    return new TypeArgumentABI(name);
  };

  return TypeArgumentABI;
}();
var TypeTag = /*#__PURE__*/function () {
  function TypeTag() {}

  TypeTag.deserialize = function deserialize(deserializer) {
    var index = deserializer.deserializeVariantIndex();

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
  };

  return TypeTag;
}();
var TypeTagVariantBool = /*#__PURE__*/function (_TypeTag) {
  _inheritsLoose(TypeTagVariantBool, _TypeTag);

  function TypeTagVariantBool() {
    return _TypeTag.call(this) || this;
  }

  var _proto53 = TypeTagVariantBool.prototype;

  _proto53.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(0);
  };

  TypeTagVariantBool.load = function load(deserializer) {
    return new TypeTagVariantBool();
  };

  return TypeTagVariantBool;
}(TypeTag);
var TypeTagVariantU8 = /*#__PURE__*/function (_TypeTag2) {
  _inheritsLoose(TypeTagVariantU8, _TypeTag2);

  function TypeTagVariantU8() {
    return _TypeTag2.call(this) || this;
  }

  var _proto54 = TypeTagVariantU8.prototype;

  _proto54.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(1);
  };

  TypeTagVariantU8.load = function load(deserializer) {
    return new TypeTagVariantU8();
  };

  return TypeTagVariantU8;
}(TypeTag);
var TypeTagVariantU64 = /*#__PURE__*/function (_TypeTag3) {
  _inheritsLoose(TypeTagVariantU64, _TypeTag3);

  function TypeTagVariantU64() {
    return _TypeTag3.call(this) || this;
  }

  var _proto55 = TypeTagVariantU64.prototype;

  _proto55.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(2);
  };

  TypeTagVariantU64.load = function load(deserializer) {
    return new TypeTagVariantU64();
  };

  return TypeTagVariantU64;
}(TypeTag);
var TypeTagVariantU128 = /*#__PURE__*/function (_TypeTag4) {
  _inheritsLoose(TypeTagVariantU128, _TypeTag4);

  function TypeTagVariantU128() {
    return _TypeTag4.call(this) || this;
  }

  var _proto56 = TypeTagVariantU128.prototype;

  _proto56.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(3);
  };

  TypeTagVariantU128.load = function load(deserializer) {
    return new TypeTagVariantU128();
  };

  return TypeTagVariantU128;
}(TypeTag);
var TypeTagVariantAddress = /*#__PURE__*/function (_TypeTag5) {
  _inheritsLoose(TypeTagVariantAddress, _TypeTag5);

  function TypeTagVariantAddress() {
    return _TypeTag5.call(this) || this;
  }

  var _proto57 = TypeTagVariantAddress.prototype;

  _proto57.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(4);
  };

  TypeTagVariantAddress.load = function load(deserializer) {
    return new TypeTagVariantAddress();
  };

  return TypeTagVariantAddress;
}(TypeTag);
var TypeTagVariantSigner = /*#__PURE__*/function (_TypeTag6) {
  _inheritsLoose(TypeTagVariantSigner, _TypeTag6);

  function TypeTagVariantSigner() {
    return _TypeTag6.call(this) || this;
  }

  var _proto58 = TypeTagVariantSigner.prototype;

  _proto58.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(5);
  };

  TypeTagVariantSigner.load = function load(deserializer) {
    return new TypeTagVariantSigner();
  };

  return TypeTagVariantSigner;
}(TypeTag);
var TypeTagVariantVector = /*#__PURE__*/function (_TypeTag7) {
  _inheritsLoose(TypeTagVariantVector, _TypeTag7);

  function TypeTagVariantVector(value) {
    var _this20;

    _this20 = _TypeTag7.call(this) || this;
    _this20.value = value;
    return _this20;
  }

  var _proto59 = TypeTagVariantVector.prototype;

  _proto59.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(6);
    this.value.serialize(serializer);
  };

  TypeTagVariantVector.load = function load(deserializer) {
    var value = TypeTag.deserialize(deserializer);
    return new TypeTagVariantVector(value);
  };

  return TypeTagVariantVector;
}(TypeTag);
var TypeTagVariantStruct = /*#__PURE__*/function (_TypeTag8) {
  _inheritsLoose(TypeTagVariantStruct, _TypeTag8);

  function TypeTagVariantStruct(value) {
    var _this21;

    _this21 = _TypeTag8.call(this) || this;
    _this21.value = value;
    return _this21;
  }

  var _proto60 = TypeTagVariantStruct.prototype;

  _proto60.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(7);
    this.value.serialize(serializer);
  };

  TypeTagVariantStruct.load = function load(deserializer) {
    var value = StructTag.deserialize(deserializer);
    return new TypeTagVariantStruct(value);
  };

  return TypeTagVariantStruct;
}(TypeTag);
var WithdrawCapabilityResource = /*#__PURE__*/function () {
  function WithdrawCapabilityResource(account_address) {
    this.account_address = account_address;
  }

  var _proto61 = WithdrawCapabilityResource.prototype;

  _proto61.serialize = function serialize(serializer) {
    this.account_address.serialize(serializer);
  };

  WithdrawCapabilityResource.deserialize = function deserialize(deserializer) {
    var account_address = AccountAddress.deserialize(deserializer);
    return new WithdrawCapabilityResource(account_address);
  };

  return WithdrawCapabilityResource;
}();
var WriteOp = /*#__PURE__*/function () {
  function WriteOp() {}

  WriteOp.deserialize = function deserialize(deserializer) {
    var index = deserializer.deserializeVariantIndex();

    switch (index) {
      case 0:
        return WriteOpVariantDeletion.load(deserializer);

      case 1:
        return WriteOpVariantValue.load(deserializer);

      default:
        throw new Error("Unknown variant index for WriteOp: " + index);
    }
  };

  return WriteOp;
}();
var WriteOpVariantDeletion = /*#__PURE__*/function (_WriteOp) {
  _inheritsLoose(WriteOpVariantDeletion, _WriteOp);

  function WriteOpVariantDeletion() {
    return _WriteOp.call(this) || this;
  }

  var _proto62 = WriteOpVariantDeletion.prototype;

  _proto62.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(0);
  };

  WriteOpVariantDeletion.load = function load(deserializer) {
    return new WriteOpVariantDeletion();
  };

  return WriteOpVariantDeletion;
}(WriteOp);
var WriteOpVariantValue = /*#__PURE__*/function (_WriteOp2) {
  _inheritsLoose(WriteOpVariantValue, _WriteOp2);

  function WriteOpVariantValue(value) {
    var _this22;

    _this22 = _WriteOp2.call(this) || this;
    _this22.value = value;
    return _this22;
  }

  var _proto63 = WriteOpVariantValue.prototype;

  _proto63.serialize = function serialize(serializer) {
    serializer.serializeVariantIndex(1);
    serializer.serializeBytes(this.value);
  };

  WriteOpVariantValue.load = function load(deserializer) {
    var value = deserializer.deserializeBytes();
    return new WriteOpVariantValue(value);
  };

  return WriteOpVariantValue;
}(WriteOp);
var WriteSet = /*#__PURE__*/function () {
  function WriteSet(value) {
    this.value = value;
  }

  var _proto64 = WriteSet.prototype;

  _proto64.serialize = function serialize(serializer) {
    this.value.serialize(serializer);
  };

  WriteSet.deserialize = function deserialize(deserializer) {
    var value = WriteSetMut.deserialize(deserializer);
    return new WriteSet(value);
  };

  return WriteSet;
}();
var WriteSetMut = /*#__PURE__*/function () {
  function WriteSetMut(write_set) {
    this.write_set = write_set;
  }

  var _proto65 = WriteSetMut.prototype;

  _proto65.serialize = function serialize(serializer) {
    Helpers.serializeVectorTuple2AccessPathWriteOp(this.write_set, serializer);
  };

  WriteSetMut.deserialize = function deserialize(deserializer) {
    var write_set = Helpers.deserializeVectorTuple2AccessPathWriteOp(deserializer);
    return new WriteSetMut(write_set);
  };

  return WriteSetMut;
}();
var Helpers = /*#__PURE__*/function () {
  function Helpers() {}

  Helpers.serializeArray16U8Array = function serializeArray16U8Array(value, serializer) {
    value.forEach(function (item) {
      serializer.serializeU8(item[0]);
    });
  };

  Helpers.deserializeArray16U8Array = function deserializeArray16U8Array(deserializer) {
    var list = [];

    for (var i = 0; i < 16; i++) {
      list.push([deserializer.deserializeU8()]);
    }

    return list;
  };

  Helpers.serializeOptionAuthenticationKey = function serializeOptionAuthenticationKey(value, serializer) {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  };

  Helpers.deserializeOptionAuthenticationKey = function deserializeOptionAuthenticationKey(deserializer) {
    var tag = deserializer.deserializeOptionTag();

    if (!tag) {
      return null;
    } else {
      return AuthenticationKey.deserialize(deserializer);
    }
  };

  Helpers.serializeOptionKeyRotationCapabilityResource = function serializeOptionKeyRotationCapabilityResource(value, serializer) {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  };

  Helpers.deserializeOptionKeyRotationCapabilityResource = function deserializeOptionKeyRotationCapabilityResource(deserializer) {
    var tag = deserializer.deserializeOptionTag();

    if (!tag) {
      return null;
    } else {
      return KeyRotationCapabilityResource.deserialize(deserializer);
    }
  };

  Helpers.serializeOptionScriptFunction = function serializeOptionScriptFunction(value, serializer) {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  };

  Helpers.deserializeOptionScriptFunction = function deserializeOptionScriptFunction(deserializer) {
    var tag = deserializer.deserializeOptionTag();

    if (!tag) {
      return null;
    } else {
      return ScriptFunction.deserialize(deserializer);
    }
  };

  Helpers.serializeOptionWithdrawCapabilityResource = function serializeOptionWithdrawCapabilityResource(value, serializer) {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  };

  Helpers.deserializeOptionWithdrawCapabilityResource = function deserializeOptionWithdrawCapabilityResource(deserializer) {
    var tag = deserializer.deserializeOptionTag();

    if (!tag) {
      return null;
    } else {
      return WithdrawCapabilityResource.deserialize(deserializer);
    }
  };

  Helpers.serializeTuple2AccessPathWriteOp = function serializeTuple2AccessPathWriteOp(value, serializer) {
    value[0].serialize(serializer);
    value[1].serialize(serializer);
  };

  Helpers.deserializeTuple2AccessPathWriteOp = function deserializeTuple2AccessPathWriteOp(deserializer) {
    return [AccessPath.deserialize(deserializer), WriteOp.deserialize(deserializer)];
  };

  Helpers.serializeVectorArgumentAbi = function serializeVectorArgumentAbi(value, serializer) {
    serializer.serializeLen(value.length);
    value.forEach(function (item) {
      item.serialize(serializer);
    });
  };

  Helpers.deserializeVectorArgumentAbi = function deserializeVectorArgumentAbi(deserializer) {
    var length = deserializer.deserializeLen();
    var list = [];

    for (var i = 0; i < length; i++) {
      list.push(ArgumentABI.deserialize(deserializer));
    }

    return list;
  };

  Helpers.serializeVectorModule = function serializeVectorModule(value, serializer) {
    serializer.serializeLen(value.length);
    value.forEach(function (item) {
      item.serialize(serializer);
    });
  };

  Helpers.deserializeVectorModule = function deserializeVectorModule(deserializer) {
    var length = deserializer.deserializeLen();
    var list = [];

    for (var i = 0; i < length; i++) {
      list.push(Module.deserialize(deserializer));
    }

    return list;
  };

  Helpers.serializeVectorTypeArgumentAbi = function serializeVectorTypeArgumentAbi(value, serializer) {
    serializer.serializeLen(value.length);
    value.forEach(function (item) {
      item.serialize(serializer);
    });
  };

  Helpers.deserializeVectorTypeArgumentAbi = function deserializeVectorTypeArgumentAbi(deserializer) {
    var length = deserializer.deserializeLen();
    var list = [];

    for (var i = 0; i < length; i++) {
      list.push(TypeArgumentABI.deserialize(deserializer));
    }

    return list;
  };

  Helpers.serializeVectorTypeTag = function serializeVectorTypeTag(value, serializer) {
    serializer.serializeLen(value.length);
    value.forEach(function (item) {
      item.serialize(serializer);
    });
  };

  Helpers.deserializeVectorTypeTag = function deserializeVectorTypeTag(deserializer) {
    var length = deserializer.deserializeLen();
    var list = [];

    for (var i = 0; i < length; i++) {
      list.push(TypeTag.deserialize(deserializer));
    }

    return list;
  };

  Helpers.serializeVectorBytes = function serializeVectorBytes(value, serializer) {
    serializer.serializeLen(value.length);
    value.forEach(function (item) {
      serializer.serializeBytes(item);
    });
  };

  Helpers.deserializeVectorBytes = function deserializeVectorBytes(deserializer) {
    var length = deserializer.deserializeLen();
    var list = [];

    for (var i = 0; i < length; i++) {
      list.push(deserializer.deserializeBytes());
    }

    return list;
  };

  Helpers.serializeVectorTuple2AccessPathWriteOp = function serializeVectorTuple2AccessPathWriteOp(value, serializer) {
    serializer.serializeLen(value.length);
    value.forEach(function (item) {
      Helpers.serializeTuple2AccessPathWriteOp(item, serializer);
    });
  };

  Helpers.deserializeVectorTuple2AccessPathWriteOp = function deserializeVectorTuple2AccessPathWriteOp(deserializer) {
    var length = deserializer.deserializeLen();
    var list = [];

    for (var i = 0; i < length; i++) {
      list.push(Helpers.deserializeTuple2AccessPathWriteOp(deserializer));
    }

    return list;
  };

  Helpers.serializeVectorU8 = function serializeVectorU8(value, serializer) {
    serializer.serializeLen(value.length);
    value.forEach(function (item) {
      serializer.serializeU8(item);
    });
  };

  Helpers.deserializeVectorU8 = function deserializeVectorU8(deserializer) {
    var length = deserializer.deserializeLen();
    var list = [];

    for (var i = 0; i < length; i++) {
      list.push(deserializer.deserializeU8());
    }

    return list;
  };

  return Helpers;
}();
var AuthKey = /*#__PURE__*/function () {
  function AuthKey(value) {
    this.value = value;
  }

  var _proto66 = AuthKey.prototype;

  _proto66.serialize = function serialize(serializer) {
    serializer.serializeBytes(this.value);
  };

  _proto66.hex = function hex() {
    return Buffer.from(this.value).toString('hex');
  };

  return AuthKey;
}();
/**
 * Receipt Identifier
 * https://github.com/starcoinorg/SIPs/blob/master/sip-21/index.md
 *
 */

var ReceiptIdentifier = /*#__PURE__*/function () {
  function ReceiptIdentifier(accountAddress, authKey) {
    this.accountAddress = accountAddress;
    this.authKey = authKey;
  }

  var _proto67 = ReceiptIdentifier.prototype;

  _proto67.encode = function encode() {
    var VERSION = '1';
    var PREFIX = 'stc';
    var se = new BcsSerializer();
    this.accountAddress.serialize(se);
    var dataBuff = Buffer.concat([Buffer.from(se.getBytes()), Buffer.from(this.authKey.value)]);
    var words = bech32.bech32.toWords(dataBuff);
    var wordsPrefixVersion = [Number(VERSION)].concat(words);
    var encodedStr = bech32.bech32.encode(PREFIX, wordsPrefixVersion);
    return encodedStr;
  };

  ReceiptIdentifier.decode = function decode(value) {
    var result = bech32.bech32.decode(value);
    var wordsPrefixVersion = result.words; // const versionBytes = wordsPrefixVersion.slice(0, 1)
    // const version = versionBytes.toString()

    var words = wordsPrefixVersion.slice(1);
    var dataBytes = Buffer.from(bech32.bech32.fromWords(words));
    var accountAddressBytes = dataBytes.slice(0, AccountAddress.LENGTH);
    var authKeyBytes = dataBytes.slice(AccountAddress.LENGTH);
    var accountAddress = AccountAddress.deserialize(new BcsDeserializer(accountAddressBytes));
    var authKey = new AuthKey(authKeyBytes);
    return new ReceiptIdentifier(accountAddress, authKey);
  };

  return ReceiptIdentifier;
}();
var SigningMessage = /*#__PURE__*/function () {
  function SigningMessage(message) {
    this.message = message;
  }

  var _proto68 = SigningMessage.prototype;

  _proto68.serialize = function serialize(serializer) {
    serializer.serializeBytes(this.message);
  };

  SigningMessage.deserialize = function deserialize(deserializer) {
    var message = deserializer.deserializeBytes();
    return new SigningMessage(message);
  };

  return SigningMessage;
}();
var SignedMessage = /*#__PURE__*/function () {
  function SignedMessage(account, message, authenticator, chain_id) {
    this.account = account;
    this.message = message;
    this.authenticator = authenticator;
    this.chain_id = chain_id;
  }

  var _proto69 = SignedMessage.prototype;

  _proto69.serialize = function serialize(serializer) {
    this.account.serialize(serializer);
    this.message.serialize(serializer);
    this.authenticator.serialize(serializer);
    this.chain_id.serialize(serializer);
  };

  SignedMessage.deserialize = function deserialize(deserializer) {
    var account = AccountAddress.deserialize(deserializer);
    var message = SigningMessage.deserialize(deserializer);
    var authenticator = TransactionAuthenticator.deserialize(deserializer);
    var chain_id = ChainId.deserialize(deserializer);
    return new SignedMessage(account, message, authenticator, chain_id);
  };

  return SignedMessage;
}();

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

var Buffer$1 = require('safe-buffer').Buffer;

var sha3_256 = require('js-sha3').sha3_256;

var STARCOIN_HASH_PREFIX = 'STARCOIN::';

var DefaultHasher = /*#__PURE__*/function () {
  function DefaultHasher(typename) {
    if (typename) {
      var data = new Uint8Array(Buffer$1.from(STARCOIN_HASH_PREFIX + typename));
      var hasher = sha3_256.create();
      hasher.update(data);
      this.salt = new Uint8Array(hasher.arrayBuffer());
    }
  }

  var _proto = DefaultHasher.prototype;

  _proto.crypto_hash = function crypto_hash(data) {
    var hasher = sha3_256.create();

    if (this.salt) {
      hasher.update(this.salt);
    }

    hasher.update(bytes.arrayify(data));
    return ethereumjsUtil.addHexPrefix(hasher.hex());
  };

  _proto.get_salt = function get_salt() {
    return this.salt;
  };

  return DefaultHasher;
}();

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

  var buf = Buffer.from(hex, 'hex');
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

var privateKeyToPublicKey = function privateKeyToPublicKey(privateKey) {
  try {
    return Promise.resolve(ed.getPublicKey(ethereumjsUtil.stripHexPrefix(privateKey))).then(bytes.hexlify);
  } catch (e) {
    return Promise.reject(e);
  }
}; // singleMulti: 0-single, 1-multi

function bcsDecode(t, data) {
  var de = new BcsDeserializer(bytes.arrayify(data));
  return t.deserialize(de);
}
function bcsEncode(data) {
  var se = new BcsSerializer();
  data.serialize(se);
  return toHexString(se.getBytes());
}
function decodeSignedUserTransaction(data) {
  var bytes$1 = bytes.arrayify(data);

  var scsData = function () {
    var de = new BcsDeserializer(bytes$1);
    return SignedUserTransaction.deserialize(de);
  }();

  var authenticator;

  if (scsData.authenticator instanceof TransactionAuthenticatorVariantEd25519) {
    var publicKey = bytes.hexlify(scsData.authenticator.public_key.value);
    var signature = bytes.hexlify(scsData.authenticator.signature.value);
    authenticator = {
      Ed25519: {
        public_key: publicKey,
        signature: signature
      }
    };
  } else {
    var auth = scsData.authenticator;

    var _publicKey = bytes.hexlify(auth.public_key.value());

    var _signature = bytes.hexlify(auth.signature.value());

    authenticator = {
      MultiEd25519: {
        public_key: _publicKey,
        signature: _signature
      }
    };
  }

  var rawTxn = scsData.raw_txn;

  var payload = function () {
    var se = new BcsSerializer();
    rawTxn.payload.serialize(se);
    return bytes.hexlify(se.getBytes());
  }();

  return {
    transaction_hash: createUserTransactionHasher().crypto_hash(bytes$1),
    raw_txn: {
      sender: addressFromSCS(rawTxn.sender),
      sequence_number: rawTxn.sequence_number,
      payload: payload,
      max_gas_amount: rawTxn.max_gas_amount,
      gas_unit_price: rawTxn.gas_unit_price,
      gas_token_code: rawTxn.gas_token_code,
      expiration_timestamp_secs: rawTxn.expiration_timestamp_secs,
      chain_id: rawTxn.chain_id.id
    },
    authenticator: authenticator
  };
} /// Decode a hex view or raw bytes of TransactionPayload into js struct.

function decodeTransactionPayload(payload) {
  var bytes$1 = bytes.arrayify(payload);
  var de = new BcsDeserializer(bytes$1);
  var bcsTxnPayload = TransactionPayload.deserialize(de);

  if (bcsTxnPayload instanceof TransactionPayloadVariantScript) {
    var script = bcsTxnPayload.value;
    return {
      Script: {
        code: toHexString(script.code),
        ty_args: script.ty_args.map(function (t) {
          return typeTagFromSCS(t);
        }),
        args: script.args.map(function (arg) {
          return bytes.hexlify(arg);
        })
      }
    };
  }

  if (bcsTxnPayload instanceof TransactionPayloadVariantScriptFunction) {
    var scriptFunction = bcsTxnPayload.value;
    return {
      ScriptFunction: {
        func: {
          address: addressFromSCS(scriptFunction.module.address),
          module: scriptFunction.module.name.value,
          functionName: scriptFunction.func.value
        },
        ty_args: scriptFunction.ty_args.map(function (t) {
          return typeTagFromSCS(t);
        }),
        args: scriptFunction.args.map(function (arg) {
          return bytes.hexlify(arg);
        })
      }
    };
  } // NOTE: VM2 EntryFunction is BCS-compatible with ScriptFunction (same variant index 2).
  // Use decodeTransactionPayloadVM2() if you need the result keyed as 'EntryFunction'.


  if (bcsTxnPayload instanceof TransactionPayloadVariantPackage) {
    var packagePayload = bcsTxnPayload.value;
    return {
      Package: {
        package_address: addressFromSCS(packagePayload.package_address),
        modules: packagePayload.modules.map(function (m) {
          return {
            code: toHexString(m.code)
          };
        }),
        init_script: packagePayload.init_script === null ? undefined : {
          func: {
            address: addressFromSCS(packagePayload.init_script.module.address),
            module: packagePayload.init_script.module.name.value,
            functionName: packagePayload.init_script.func.value
          },
          args: packagePayload.init_script.args.map(function (arg) {
            return bytes.hexlify(arg);
          }),
          ty_args: packagePayload.init_script.ty_args.map(function (ty) {
            return typeTagFromSCS(ty);
          })
        }
      }
    };
  }

  throw new TypeError("cannot decode bcs data " + bcsTxnPayload);
}
function packageHexToTransactionPayload(packageHex) {
  var deserializer = new BcsDeserializer(bytes.arrayify(ethereumjsUtil.addHexPrefix(packageHex)));
  var transactionPayload = TransactionPayloadVariantPackage.load(deserializer);
  return transactionPayload;
}
function packageHexToTransactionPayloadHex(packageHex) {
  var transactionPayload = packageHexToTransactionPayload(packageHex);
  return bcsEncode(transactionPayload);
}
function addressToSCS(addr) {
  // AccountAddress should be 16 bytes, in hex, it's 16 * 2.
  var bytes = fromHexString(addr, 16 * 2);
  return AccountAddress.deserialize(new BcsDeserializer(bytes));
}
function addressFromSCS(addr) {
  return toHexString(addr.value.map(function (_ref) {
    var t = _ref[0];
    return t;
  }));
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

  throw new Error("invalid type tag: " + ty);
}
function structTagToSCS(data) {
  return new StructTag(addressToSCS(data.address), new Identifier(data.module), new Identifier(data.name), data.type_params ? data.type_params.map(function (t) {
    return typeTagToSCS(t);
  }) : []);
}
function structTagFromSCS(bcs_data) {
  return {
    module: bcs_data.module.value,
    name: bcs_data.name.value,
    type_params: bcs_data.type_params.map(function (t) {
      return typeTagFromSCS(t);
    }),
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

  throw new TypeError("invalid bcs type tag: " + bcs_data);
}
function publicKeyToAuthKey(publicKey, singleMulti) {
  if (singleMulti === void 0) {
    singleMulti = accountType.SINGLE;
  }

  var hasher = jsSha3.sha3_256.create();
  hasher.update(fromHexString(publicKey));
  hasher.update(fromHexString(bytes.hexlify(singleMulti)));
  var hash = hasher.hex();
  return ethereumjsUtil.addHexPrefix(hash);
} // singleMulti: 0-single, 1-multi

function publicKeyToAddress(publicKey, singleMulti) {
  if (singleMulti === void 0) {
    singleMulti = accountType.SINGLE;
  }

  var hasher = jsSha3.sha3_256.create();
  hasher.update(fromHexString(publicKey));
  hasher.update(fromHexString(bytes.hexlify(singleMulti)));
  var hash = hasher.hex();
  var address = hash.slice(hash.length / 2);
  return ethereumjsUtil.addHexPrefix(address);
}
function encodeReceiptIdentifier(addressStr, authKeyStr) {
  if (authKeyStr === void 0) {
    authKeyStr = '';
  }

  var accountAddress = addressToSCS(addressStr);
  var authKey = new AuthKey(Buffer.from(authKeyStr, 'hex'));
  return new ReceiptIdentifier(accountAddress, authKey).encode();
}
function decodeReceiptIdentifier(value) {
  var receiptIdentifier = ReceiptIdentifier.decode(value);
  var accountAddress = ethereumjsUtil.stripHexPrefix(addressFromSCS(receiptIdentifier.accountAddress));
  var authKey = receiptIdentifier.authKey.hex();
  var receiptIdentifierView = {
    accountAddress: accountAddress,
    authKey: authKey
  };
  return receiptIdentifierView;
}
function publicKeyToReceiptIdentifier(publicKey) {
  var address = publicKeyToAddress(publicKey);
  var authKey = publicKeyToAuthKey(publicKey);
  var receiptIdentifier = encodeReceiptIdentifier(ethereumjsUtil.stripHexPrefix(address), ethereumjsUtil.stripHexPrefix(authKey));
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
  var bytes = new Array();
  var len, c;
  len = str.length;

  for (var i = 0; i < len; i++) {
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

  var str = '';

  for (var i = 0; i < arr.length; i++) {
    var one = arr[i].toString(2),
        v = one.match(/^1+?(?=0)/);

    if (v && one.length == 8) {
      var bytesLength = v[0].length;
      var store = arr[i].toString(2).slice(7 - bytesLength);

      for (var st = 1; st < bytesLength; st++) {
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
  var result = decodeTransactionPayload(payload);

  if ('ScriptFunction' in result) {
    return {
      EntryFunction: result.ScriptFunction
    };
  }

  return result;
}

var index$4 = {
  __proto__: null,
  privateKeyToPublicKey: privateKeyToPublicKey,
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
  var de = new BcsDeserializer(bytes);
  var abi = TransactionScriptABI.deserialize(de);
  return {
    args: abi.args.map(function (a) {
      return {
        name: a.name,
        type_tag: typeTagFromSCS(a.type_tag)
      };
    }),
    code: abi.code,
    doc: abi.doc,
    name: abi.name,
    ty_args: abi.ty_args.map(function (t) {
      return {
        name: t.name
      };
    })
  };
}

var abi = {
  __proto__: null,
  decodeTransactionScriptABI: decodeTransactionScriptABI
};

/**
 * simillar to these 2 commands in starcoin console:
 * starcoin% account import -i <PRIVATEKEY>
 * starcoin% account show <ACCOUNT_ADDRESS>
 * @param privateKey
 * @returns
 */
var showAccount = function showAccount(privateKey) {
  try {
    return Promise.resolve(privateKeyToPublicKey(privateKey)).then(function (publicKey) {
      var address = publicKeyToAddress(publicKey);
      var authKey = publicKeyToAuthKey(publicKey);
      var receiptIdentifier = encodeReceiptIdentifier(ethereumjsUtil.stripHexPrefix(address), ethereumjsUtil.stripHexPrefix(authKey));
      return {
        privateKey: privateKey,
        publicKey: publicKey,
        address: address,
        authKey: authKey,
        receiptIdentifier: receiptIdentifier
      };
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var generateAccount = function generateAccount() {
  try {
    var privateKey = generatePrivateKey();
    var accountInfo = showAccount(privateKey);
    return Promise.resolve(accountInfo);
  } catch (e) {
    return Promise.reject(e);
  }
};
function generatePrivateKey() {
  // 32-byte Uint8Array
  var privateKeyBytes = ed.utils.randomPrivateKey();
  var privateKey = Buffer.from(privateKeyBytes).toString('hex');
  return ethereumjsUtil.addHexPrefix(privateKey);
}
function getMultiEd25519AccountPrivateKey(shard) {
  var privateKey = bytes.hexlify(shard.privateKey());
  return privateKey;
}
function getMultiEd25519AccountPublicKey(shard) {
  var multiEd25519PublicKey = shard.publicKey();
  var publicKey = bytes.hexlify(multiEd25519PublicKey.value());
  return publicKey;
}
function getMultiEd25519AccountAddress(shard) {
  var publicKey = getMultiEd25519AccountPublicKey(shard);
  var address = publicKeyToAddress(publicKey, accountType.MULTI);
  return address;
}
function getMultiEd25519AccountReceiptIdentifier(shard) {
  var address = getMultiEd25519AccountAddress(shard); // same with Rust, receiptIdentifier do not include authKey

  var receiptIdentifier = encodeReceiptIdentifier(ethereumjsUtil.stripHexPrefix(address));
  return receiptIdentifier;
}
function showMultiEd25519Account(shard) {
  var privateKey = getMultiEd25519AccountPrivateKey(shard);
  var publicKey = getMultiEd25519AccountPublicKey(shard);
  var address = getMultiEd25519AccountAddress(shard);
  var receiptIdentifier = getMultiEd25519AccountReceiptIdentifier(shard);
  var authKey = publicKeyToAuthKey(publicKey, accountType.MULTI);
  return {
    privateKey: privateKey,
    publicKey: publicKey,
    address: address,
    authKey: authKey,
    receiptIdentifier: receiptIdentifier
  };
}
function decodeMultiEd25519AccountPrivateKey(privateKey) {
  var bytes$1 = bytes.arrayify(privateKey);
  var publicKeysLengthBytes = bytes$1.slice(0, 1);
  var publicKeysLength = publicKeysLengthBytes[0];
  var thresholdBytes = bytes$1.slice(1, 2);
  var threshold = thresholdBytes[0];
  var privateKeysLengthBytes = bytes$1.slice(2, 3);
  var privateKeysLength = privateKeysLengthBytes[0];
  var publicKeys = [];
  var privateKeys = [];
  var start = 3;
  var length = 32;
  var end;

  for (var i = 0; i < publicKeysLength; i += 1) {
    end = start + length;
    var publicKeyBytes = bytes$1.slice(start, end);
    publicKeys.push(bytes.hexlify(publicKeyBytes));
    start = end;
  }

  for (var _i = 0; _i < privateKeysLength; _i += 1) {
    end = start + length;
    var privateKeyBytes = bytes$1.slice(start, end);
    privateKeys.push(bytes.hexlify(privateKeyBytes));
    start = end;
  }

  return {
    privateKeys: privateKeys,
    publicKeys: publicKeys,
    threshold: threshold
  };
}

var account = {
  __proto__: null,
  showAccount: showAccount,
  generateAccount: generateAccount,
  generatePrivateKey: generatePrivateKey,
  getMultiEd25519AccountPrivateKey: getMultiEd25519AccountPrivateKey,
  getMultiEd25519AccountPublicKey: getMultiEd25519AccountPublicKey,
  getMultiEd25519AccountAddress: getMultiEd25519AccountAddress,
  getMultiEd25519AccountReceiptIdentifier: getMultiEd25519AccountReceiptIdentifier,
  showMultiEd25519Account: showMultiEd25519Account,
  decodeMultiEd25519AccountPrivateKey: decodeMultiEd25519AccountPrivateKey
};

function InvalidNumberOfMoveArgs(given, expected) {
  return new Error("Invalid number of arguments to Move function. given: " + given + ", expected: " + expected);
}
function InvalidNumberOfRPCParams(methodName, given, expected) {
  return new Error("Invalid number of input parameters to RPC method \"" + methodName + "\" given: " + given + ", expected: " + expected);
}
function InvalidConnection(host) {
  return new Error("CONNECTION ERROR: Couldn't connect to node " + host + '.');
}
function InvalidProvider() {
  return new Error('Provider not set or invalid');
}
function InvalidResponse(result) {
  var message = !!result && !!result.error && !!result.error.message ? result.error.message : 'Invalid JSON RPC response: ' + JSON.stringify(result);
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

var Parser = /*#__PURE__*/function () {
  function Parser(toks) {
    this.cur_idx = 0;
    this.toks = toks;
  }

  var _proto = Parser.prototype;

  _proto.next_tok = function next_tok() {
    var tok = this.toks[this.cur_idx++];

    if (tok === undefined) {
      throw new Error('out of token, this should not happen');
    }

    return tok;
  };

  _proto.peek = function peek() {
    return this.toks[this.cur_idx];
  };

  _proto.consume_tok = function consume_tok(tok) {
    var t = this.next_tok();

    if (t != tok) {
      throw new Error("expected tok: " + tok + ", got: " + t);
    }
  };

  _proto.parse_comma_list = function parse_comma_list(parse_list_item, end_token, allow_trailing_comma) {
    var v = [];
    var head = this.peek();

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
  };

  _proto.parseTypeTag = function parseTypeTag() {
    var tok = this.next_tok();

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
      var ty = this.parseTypeTag();
      this.consume_tok('Gt');
      return {
        Vector: ty
      };
    }

    if (tok['Address'] !== undefined) {
      var addr = tok['Address'];
      this.consume_tok('ColonColon');
      var module_tok = this.next_tok();

      if (module_tok['Name'] === undefined) {
        throw new Error("expected name, got: " + module_tok);
      }

      var module = module_tok['Name'];
      this.consume_tok('ColonColon');
      var struct_tok = this.next_tok();

      if (struct_tok['Name'] === undefined) {
        throw new Error("expected name, got: " + module_tok);
      }

      var struct_name = struct_tok['Name'];
      var tyArgs = [];

      if (this.peek() === 'Lt') {
        this.consume_tok('Lt');
        tyArgs = this.parse_comma_list(function (p) {
          return p.parseTypeTag();
        }, 'Gt', true);
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

    throw new Error("unexpected token " + tok + ", expected type tag");
  };

  return Parser;
}(); // parse a number from string.


function nextNumber(s) {
  var num = '';
  var i = 0;

  while (i < s.length) {
    var c = s[i++]; // parse number

    if (decimal(c)) {
      num = num.concat(c);
    } else if (alphabetical(c)) {
      // if come across a char, parse as suffix.
      var suffix = c;

      while (i < s.length) {
        var _c = s[i++];

        if (alphanumerical(_c)) {
          suffix = suffix.concat(_c);
        } else {
          break;
        }
      }

      var len = num.length + suffix.length;

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

  var head = s[0];

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
      var r = '0x';

      for (var i = 2; i < s.length; i++) {
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
    var _r = '';
    var _i = 2;

    while (true) {
      if (_i >= s.length) {
        throw new Error('unrecognized token');
      }

      var c = s[_i++];

      if (c === '"') {
        break;
      } else if (isAscii(c)) {
        _r = _r.concat(c);
      } else {
        throw new Error('unrecognized token');
      }
    }

    return [{
      Bytes: _r
    }, _r.length + 3];
  } // parse bytes start with x.


  if (head === 'x' && s[1] === '"') {
    var _r2 = '';
    var _i2 = 2;

    while (true) {
      if (_i2 >= s.length) {
        throw new Error('unrecognized token');
      }

      var _c2 = s[_i2++];

      if (_c2 === '"') {
        break;
      } else if (hexadecimal(_c2)) {
        _r2 = _r2.concat(_c2);
      } else {
        throw new Error('unrecognized token');
      }
    }

    return [{
      Bytes: _r2
    }, _r2.length + 3];
  } // parse name token.


  if (alphabetical(head) || ['-', '_'].includes(head)) {
    var _r3 = '';

    for (var _i3 = 0; _i3 < s.length; _i3++) {
      if (alphanumerical(s[_i3]) || ['-', '_'].includes(s[_i3])) {
        _r3 = _r3.concat(s[_i3]);
      } else {
        break;
      }
    }

    return [nameToken(_r3), _r3.length];
  } // parse whitespace.


  if (whitespace(head)) {
    var _r4 = '';

    for (var _i4 = 0; _i4 < s.length; _i4++) {
      if (whitespace(s[_i4])) {
        _r4 = _r4.concat(s[_i4]);
      } else {
        break;
      }
    }

    return [{
      WhiteSpace: _r4
    }, _r4.length];
  }

  throw new Error('unrecognized token');
}

function tokenize(s) {
  var v = [];

  while (true) {
    // @ts-ignore
    var nextTok = nextToken(s);

    if (nextTok === undefined) {
      break;
    }

    var tok = nextTok[0],
        n = nextTok[1];
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
  var toks = tokenize(s).filter(function (t) {
    return t.WhiteSpace === undefined;
  });
  toks.push('EOF');
  var parser = new Parser(toks);
  var res = f(parser);
  parser.consume_tok('EOF');
  return res;
}

function parseTypeTags(s) {
  return parse(s, function (p) {
    return p.parse_comma_list(function (p) {
      return p.parseTypeTag();
    }, 'EOF', true);
  });
}
function parseTypeTag(s) {
  return parse(s, function (p) {
    return p.parseTypeTag();
  });
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
var packageJson = require('../package.json');

var version = packageJson.version;

var logger = new logger$9.Logger(version);
function checkProperties(object, properties) {
  if (!object || typeof object !== "object") {
    logger.throwArgumentError("invalid object", "object", object);
  }

  Object.keys(object).forEach(function (key) {
    if (!properties[key]) {
      logger.throwArgumentError("invalid object key - " + key, "transaction:" + key, object);
    }
  });
}

var properties = {
  __proto__: null,
  checkProperties: checkProperties
};

var recoverSignedMessageAddress = function recoverSignedMessageAddress(signedMessageHex) {
  try {
    var _exit2;

    var _temp3 = function _temp3(_result) {
      return _exit2 ? _result : Promise.resolve(address);
    };

    var signedMessage = decodeSignedMessage(signedMessageHex); // const rawMessageBytes = signedMessage.message.message
    // const rawMessageHex = hexlify(rawMessageBytes)
    // const rawMessage = Buffer.from(stripHexPrefix(rawMessageHex), 'hex').toString('utf8')

    var address;

    var _temp4 = function () {
      if (signedMessage.authenticator instanceof TransactionAuthenticatorVariantEd25519) {
        var signatureBytes = signedMessage.authenticator.signature.value;
        var msgBytes = getEd25519SignMsgBytes(signedMessage.message);
        var publicKeyBytes = signedMessage.authenticator.public_key.value;
        address = publicKeyToAddress(bytes.hexlify(publicKeyBytes));
        return Promise.resolve(ed.verify(signatureBytes, msgBytes, publicKeyBytes)).then(function (isSigned) {
          if (!isSigned) {
            throw new Error('Failed verify signature and message');
          }

          var isOk = checkAccount(publicKeyBytes, signedMessage.account);

          if (!isOk) {
            throw new Error('Failed: address are not match');
          }
        });
      }
    }();

    return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
  } catch (e) {
    return Promise.reject(e);
  }
}; // TODO: check onchain authkey using chain_id

var encodeSignedMessage = function encodeSignedMessage(msg, privateKeyBytes, chainId) {
  try {
    var msgBytes = new Uint8Array(Buffer.from(msg, 'utf8'));
    var signingMessage = new SigningMessage(msgBytes);
    return Promise.resolve(signMessage(msg, bytes.hexlify(privateKeyBytes))).then(function (_ref) {
      var publicKey = _ref.publicKey,
          signature = _ref.signature;
      return Promise.resolve(generateSignedMessage(signingMessage, chainId, publicKey, signature)).then(Promise.resolve);
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var generateSignedMessage = function generateSignedMessage(signingMessage, id, publicKeyHex, signatureHex) {
  try {
    var publicKeyBytes = bytes.arrayify(ethereumjsUtil.addHexPrefix(publicKeyHex));
    var addressHex = publicKeyToAddress(publicKeyHex);
    var accountAddress = addressToSCS(addressHex);
    var signatureBytes = bytes.arrayify(ethereumjsUtil.addHexPrefix(signatureHex));
    var transactionAuthenticatorEd25519 = encodeTransactionAuthenticatorEd25519(signatureBytes, publicKeyBytes);
    var chainId = new ChainId(id);
    var signedMessage = new SignedMessage(accountAddress, signingMessage, transactionAuthenticatorEd25519, chainId);
    var signedMessageBytes = bcsEncode(signedMessage);
    var signedMessageHex = bytes.hexlify(signedMessageBytes);
    return Promise.resolve(signedMessageHex);
  } catch (e) {
    return Promise.reject(e);
  }
};
// simulate OneKeyConnect.starcoinSignMessage with the same response payload
var signMessage = function signMessage(msg, privateKeyHex) {
  try {
    var msgBytes = new Uint8Array(Buffer.from(msg, 'utf8'));
    var signingMessage = new SigningMessage(msgBytes);
    var signingMessageBytes = getEd25519SignMsgBytes(signingMessage);
    return Promise.resolve(ed.getPublicKey(ethereumjsUtil.stripHexPrefix(privateKeyHex))).then(function (publicKeyBytes) {
      var publicKeyHex = bytes.hexlify(publicKeyBytes);
      return Promise.resolve(ed.sign(signingMessageBytes, ethereumjsUtil.stripHexPrefix(privateKeyHex))).then(function (signatureBytes) {
        var signatureHex = bytes.hexlify(signatureBytes);
        return Promise.resolve({
          publicKey: publicKeyHex,
          signature: signatureHex
        });
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
function encodeTransactionAuthenticatorEd25519(signatureBytes, publicKeyBytes) {
  var ed25519PublicKey = new Ed25519PublicKey(publicKeyBytes);
  var ed25519Signature = new Ed25519Signature(signatureBytes);
  var authenticatorEd25519 = new TransactionAuthenticatorVariantEd25519(ed25519PublicKey, ed25519Signature);
  return authenticatorEd25519;
}
function getEd25519SignMsgBytes(signingMessage) {
  var hasher = createSigningMessageHasher();
  var hashSeedBytes = hasher.get_salt();

  var signingMessageBytes = function () {
    var se = new BcsSerializer();
    signingMessage.serialize(se);
    return se.getBytes();
  }();

  var msgBytes = function (a, b) {
    var tmp = new Uint8Array(a.length + b.length);
    tmp.set(a, 0);
    tmp.set(b, a.length);
    return tmp;
  }(hashSeedBytes, signingMessageBytes);

  return msgBytes;
}
function decodeSignedMessage(data) {
  var dataBytes = bytes.arrayify(data);

  var scsData = function () {
    var de = new BcsDeserializer(dataBytes);
    return SignedMessage.deserialize(de);
  }();

  return scsData;
}

function checkAccount(publicKeyBytes, accountAddress) {
  var address = publicKeyToAddress(bytes.hexlify(publicKeyBytes));

  if (address === addressFromSCS(accountAddress)) {
    return true;
  }

  return false;
}

var signedMessage = {
  __proto__: null,
  recoverSignedMessageAddress: recoverSignedMessageAddress,
  encodeSignedMessage: encodeSignedMessage,
  generateSignedMessage: generateSignedMessage,
  signMessage: signMessage,
  encodeTransactionAuthenticatorEd25519: encodeTransactionAuthenticatorEd25519,
  getEd25519SignMsgBytes: getEd25519SignMsgBytes,
  decodeSignedMessage: decodeSignedMessage
};

var logger$1 = new logger$9.Logger(version);

function isRenetworkable(value) {
  return value && typeof value.renetwork === 'function';
}

function stcDefaultProvider(network) {
  var func = function func(providers, options) {
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

var STANDARD_NETWORKS = {
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
var APTOS_NETWORKS = {
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
function getNetwork(network, isAptos) {
  if (isAptos === void 0) {
    isAptos = false;
  }

  if (network == null) {
    return null;
  }

  var NETWORKS = isAptos ? APTOS_NETWORKS : STANDARD_NETWORKS;

  if (typeof network === 'number') {
    for (var name in NETWORKS) {
      var standard = NETWORKS[name];

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
    var _standard = NETWORKS[network];

    if (_standard == null) {
      return null;
    }

    return {
      name: _standard.name,
      chainId: _standard.chainId,
      _defaultProvider: _standard._defaultProvider || null
    };
  } else {
    var _standard2 = NETWORKS[network.name];

    if (!_standard2) {
      if (typeof network.chainId !== 'number') {
        logger$1.throwArgumentError('invalid network chainId', 'network', network);
      }

      return network;
    } // Make sure the chainId matches the expected network chainId (or is 0; disable EIP-155)


    if (network.chainId !== _standard2.chainId) {
      logger$1.throwArgumentError('network chainId mismatch', 'network', network);
    } // @TODO: In the next major version add an attach function to a defaultProvider
    // class and move the _defaultProvider internal to this file (extend Network)


    var defaultProvider = network._defaultProvider || null;

    if (defaultProvider == null && _standard2._defaultProvider) {
      if (isRenetworkable(_standard2._defaultProvider)) {
        defaultProvider = _standard2._defaultProvider.renetwork(network);
      } else {
        defaultProvider = _standard2._defaultProvider;
      }
    } // Standard Network (allow overriding the ENS address)


    return {
      name: network.name,
      chainId: _standard2.chainId,
      _defaultProvider: defaultProvider
    };
  }
}

var version$1 = 'abstract-provider/5.0.5';
var logger$2 = new logger$9.Logger(version$1); /// ////////////////////////////
// Exported Abstracts

var Provider = /*#__PURE__*/function () {
  function Provider() {
    logger$2.checkAbstract(this instanceof Provider ? this.constructor : void 0, Provider);
    properties$1.defineReadOnly(this, '_isProvider', true);
  } // Account
  // eslint-disable-next-line consistent-return


  var _proto = Provider.prototype;

  _proto.getBalance = function getBalance(address, // token name, default to 0x1::STC::STC
  token, blockTag) {
    try {
      var _this2 = this;

      if (token === undefined) {
        // eslint-disable-next-line no-param-reassign
        token = '0x1::STC::STC';
      }

      return Promise.resolve(_this2.getResource(address, "0x1::Account::Balance<" + token + ">", blockTag)).then(function (resource) {
        if (resource !== undefined) {
          return resource.token.value;
        }
      });
    } catch (e) {
      return Promise.reject(e);
    }
  } // get all token balances of `address`.
  ;

  _proto.getBalances = function getBalances(address, blockTag) {
    try {
      var _this4 = this;

      return Promise.resolve(_this4.getResources(address, blockTag)).then(function (resources) {
        if (resources === undefined) {
          return;
        }

        var tokenBalances = {}; // @ts-ignore

        for (var k in resources) {
          var typeTag = parseTypeTag(k); // filter out balance resources.
          // @ts-ignore

          if (typeof typeTag === 'object' && typeTag.Struct !== undefined) {
            // @ts-ignore
            var structTag = typeTag.Struct;

            if (structTag.module === 'Account' && structTag.name === 'Balance') {
              // @ts-ignore
              var tokenStruct = formatStructTag(structTag.type_params[0]['Struct']);
              tokenBalances[tokenStruct] = resources[k].token.value;
            }
          }
        }

        return tokenBalances;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  } // eslint-disable-next-line consistent-return
  ;

  _proto.getSequenceNumber = function getSequenceNumber(address, blockTag) {
    try {
      var _this6 = this;

      return Promise.resolve(_this6.getResource(address, '0x1::Account::Account', blockTag)).then(function (resource) {
        if (resource !== undefined) {
          return resource.sequence_number;
        }
      });
    } catch (e) {
      return Promise.reject(e);
    }
  } // Alias for "on"
  ;

  _proto.addListener = function addListener(eventName, listener) {
    return this.on(eventName, listener);
  } // Alias for "off"
  ;

  _proto.removeListener = function removeListener(eventName, listener) {
    return this.off(eventName, listener);
  };

  Provider.isProvider = function isProvider(value) {
    // eslint-disable-next-line no-underscore-dangle
    return !!(value && value._isProvider);
  };

  return Provider;
}();

var logger$3 = new logger$9.Logger(version);
function formatMoveStruct(v) {
  // eslint-disable-next-line unicorn/no-reduce
  return v.value.reduce(function (o, _ref) {
    var _extends2;

    var k = _ref[0],
        field = _ref[1];
    return _extends({}, o, (_extends2 = {}, _extends2[k] = formatMoveValue(field), _extends2));
  }, {});
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
    return bytes.hexValue(v.Bytes);
  }

  if ('Vector' in v) {
    return v.Vector.map(function (elem) {
      return formatMoveValue(elem);
    });
  }

  if ('Struct' in v) {
    var struct = v.Struct; // eslint-disable-next-line unicorn/no-reduce

    return struct.value.reduce(function (o, _ref2) {
      var _extends3;

      var k = _ref2[0],
          field = _ref2[1];
      return _extends({}, o, (_extends3 = {}, _extends3[k] = formatMoveValue(field), _extends3));
    }, {});
  }

  throw new Error("invalid annotated move value, " + JSON.stringify(v));
}
var Formatter = /*#__PURE__*/function () {
  function Formatter() {
    logger$3.checkNew(this instanceof Formatter ? this.constructor : void 0, Formatter);
    this.formats = this.getDefaultFormats();
  }

  var _proto = Formatter.prototype;

  _proto.getDefaultFormats = function getDefaultFormats() {

    var formats = {};
    var address = this.address.bind(this);
    var bigNumber = this.bigNumber.bind(this);
    var blockTag = this.blockTag.bind(this);
    var data = this.data.bind(this);
    var hash = this.hash.bind(this);
    var hex = this.hex.bind(this);
    var number = this.number.bind(this);
    var u64 = this.u64.bind(this); // eslint-disable-next-line no-underscore-dangle

    var i64 = Formatter.bigint.bind(this);
    var u8 = this.u8.bind(this);
    var u256 = this.u256.bind(this);

    formats.rawTransaction = {
      sender: address,
      sequence_number: u64,
      payload: data,
      max_gas_amount: u64,
      gas_unit_price: u64,
      gas_token_code: function gas_token_code(v) {
        return v;
      },
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
    var txnBlockInfo = {
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
      header: function header(value) {
        return Formatter.check(formats.blockHeader, value);
      },
      body: function body(value) {
        return value;
      }
    };
    formats.block = {
      header: function header(value) {
        return Formatter.check(formats.blockHeader, value);
      },
      body: function body(value) {
        return Formatter.check(formats.blockBody, value);
      },
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
    formats.blockWithTransactions = properties$1.shallowCopy(formats.block);
    formats.blockWithTransactions.transactions = Formatter.allowNull(Formatter.arrayOf(this.transactionResponse.bind(this)));
    formats.eventFilter = {
      from_block: Formatter.allowNull(blockTag),
      to_block: Formatter.allowNull(blockTag),
      event_keys: Formatter.arrayOf(hex),
      limit: Formatter.allowNull(number)
    };
    return formats;
  };

  _proto.typeTag = function typeTag(value) {
    return value;
  };

  _proto.moveValue = function moveValue(value) {
    return formatMoveValue(value);
  };

  _proto.moveStruct = function moveStruct(value) {
    return formatMoveStruct(value);
  };

  _proto.transactionAuthenticator = function transactionAuthenticator(value) {
    return value;
  };

  _proto.rawUserTransaction = function rawUserTransaction(value) {
    return Formatter.check(this.formats.rawTransaction, value);
  };

  _proto.signedUserTransaction = function signedUserTransaction(value) {
    return Formatter.check(this.formats.signedUserTransaction, value);
  };

  _proto.blockMetadata = function blockMetadata(value) {
    return Formatter.check(this.formats.blockMetadata, value);
  };

  _proto.transactionOutput = function transactionOutput(value) {
    return Formatter.check(this.formats.transactionOutput, value);
  };

  _proto.transactionWriteAction = function transactionWriteAction(value) {
    return value;
  };

  _proto.transactionEvent = function transactionEvent(value) {
    return Formatter.check(this.formats.transactionEvent, value);
  };

  _proto.transactionVmStatus = function transactionVmStatus(value) {
    if (typeof value === 'string') {
      if ([TransactionVMStatus_Executed, TransactionVMStatus_OutOfGas, TransactionVMStatus_MiscellaneousError].includes(value)) {
        return value;
      }

      throw new Error("invalid txn vm_status: " + value);
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

      throw new Error("invalid txn vm_status: " + JSON.stringify(value));
    } else {
      throw new TypeError("invalid txn vm_status type " + value);
    }
  } // Requires a BigNumberish that is within the IEEE754 safe integer range; returns a number
  // Strict! Used on input.
  ;

  _proto.number = function number(_number) {
    if (_number === '0x') {
      return 0;
    }

    return bignumber.BigNumber.from(_number).toNumber();
  };

  _proto.u8 = function u8(value) {
    if (typeof value === 'string') {
      return Number.parseInt(value, 10);
    }

    if (typeof value === 'number') {
      return value;
    }

    throw new Error("invalid u8: " + value);
  };

  _proto.u64 = function u64(number) {
    return Formatter.bigint(number);
  };

  _proto.u128 = function u128(number) {
    return Formatter.bigint(number);
  };

  _proto.u256 = function u256(number) {
    if (typeof number === 'string') {
      return number;
    }

    if (typeof number === 'number') {
      return number.toString();
    }

    throw new Error("invalid bigint: " + number);
  };

  Formatter.bigint = function bigint(number) {
    if (typeof number === 'string') {
      var bn = BigInt(number);

      if (bn > Number.MAX_SAFE_INTEGER) {
        return bn;
      } // eslint-disable-next-line radix


      return Number.parseInt(number);
    }

    if (typeof number === 'number') {
      return number;
    }

    throw new TypeError("invalid bigint: " + number);
  } // Strict! Used on input.
  ;

  _proto.bigNumber = function bigNumber(value) {
    return bignumber.BigNumber.from(value);
  } // Requires a boolean, "true" or  "false"; returns a boolean
  ;

  _proto["boolean"] = function boolean(value) {
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

    throw new Error("invalid boolean - " + value);
  };

  _proto.hex = function hex(value, strict) {
    if (typeof value === 'string') {
      if (!strict && value.slice(0, 2) !== '0x') {
        value = "0x" + value;
      }

      if (bytes.isHexString(value)) {
        return value.toLowerCase();
      }
    }

    return logger$3.throwArgumentError('invalid hex', 'value', value);
  };

  _proto.data = function data(value, strict) {
    var result = this.hex(value, strict);

    if (result.length % 2 !== 0) {
      throw new Error("invalid data; odd-length - " + value);
    }

    return result;
  } // Requires an address
  // Strict! Used on input.
  ;

  _proto.address = function address(value) {
    if (typeof value !== 'string') {
      logger$3.throwArgumentError('invalid address', 'address', value);
    }

    var result = this.hex(value, true);
    var length = bytes.hexDataLength(result);

    if (length !== 16 && length !== 32) {
      return logger$3.throwArgumentError('invalid address', 'value', value);
    }

    return ethereumjsUtil.addHexPrefix(value);
  } // Strict! Used on input.
  ;

  _proto.blockTag = function blockTag(_blockTag) {
    // if (blockTag == null) {
    //   return 'latest';
    // }
    if (_blockTag === 'earliest') {
      return 0;
    } // if (blockTag === 'latest' || blockTag === 'pending') {
    //   return blockTag;
    // }


    if (typeof _blockTag === 'number') {
      return _blockTag;
    }

    throw new Error('invalid blockTag');
  } // Requires a hash, optionally requires 0x prefix; returns prefixed lowercase hash.
  ;

  _proto.hash = function hash(value, strict) {
    var result = this.hex(value, strict);

    if (bytes.hexDataLength(result) !== 32) {
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
  ;

  _proto._block = function _block(value) {
    var block = Formatter.check(this.formats.block, value);
    var transactions = block.body.Full ? block.body.Full : block.body.Hashes;
    return {
      header: block.header,
      transactions: transactions,
      confirmations: block.confirmations
    };
  };

  _proto.blockWithTxnHashes = function blockWithTxnHashes(value) {
    var _this$_block = this._block(value),
        header = _this$_block.header,
        transactions = _this$_block.transactions,
        confirmations = _this$_block.confirmations;

    return {
      header: header,
      transactions: transactions.map(function (t) {
        return t.transaction_hash;
      }),
      confirmations: confirmations
    };
  };

  _proto.blockWithTransactions = function blockWithTransactions(value) {
    var _this$_block2 = this._block(value),
        header = _this$_block2.header,
        transactions = _this$_block2.transactions,
        confirmations = _this$_block2.confirmations;

    return {
      header: header,
      transactions: transactions,
      confirmations: confirmations
    };
  } // // Strict! Used on input.
  // transactionRequest(value: any): any {
  //   return Formatter.check(this.formats.transactionRequest, value);
  // }
  ;

  _proto.transactionResponse = function transactionResponse(transaction) {
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
  ;

  _proto.userTransactionData = function userTransactionData(value) {
    return decodeSignedUserTransaction(value);
  };

  _proto.transactionInfo = function transactionInfo(value) {
    return Formatter.check(this.formats.transactionInfo, value);
  };

  _proto.topics = function topics(value) {
    var _this2 = this;

    if (Array.isArray(value)) {
      return value.map(function (v) {
        return _this2.topics(v);
      });
    }

    if (value != undefined) {
      return this.hash(value, true);
    }

    return null;
  };

  _proto.filter = function filter(value) {
    return Formatter.check(this.formats.eventFilter, value);
  };

  Formatter.check = function check(format, object) {
    var result = {};

    for (var key in format) {
      try {
        var value = format[key](object[key]);

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
  ;

  Formatter.allowNull = function allowNull(format, nullValue) {
    return function (value) {
      if (value == undefined) {
        return nullValue;
      }

      return format(value);
    };
  } // If value is false-ish, replaceValue is returned
  ;

  Formatter.allowFalsish = function allowFalsish(format, replaceValue) {
    return function (value) {
      if (!value) {
        return replaceValue;
      }

      return format(value);
    };
  } // Requires an Array satisfying check
  ;

  Formatter.arrayOf = function arrayOf(format) {
    return function (array) {
      if (!Array.isArray(array)) {
        throw new TypeError('not an array');
      }

      var result = [];
      array.forEach(function (value) {
        result.push(format(value));
      });
      return result;
    };
  };

  return Formatter;
}(); //
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

function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}

var logger$4 = new logger$9.Logger(version); // Event Serializing

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

    if (bytes.hexDataLength(eventName) === 32) {
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
  return new Promise(function (resolve) {
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


var CONSTANTS = {
  pending: 'pending',
  block: 'block',
  network: 'network',
  poll: 'poll',
  filter: 'filter',
  tx: 'tx'
};
var PollableEvents = [CONSTANTS.pending, CONSTANTS.block, CONSTANTS.network, CONSTANTS.poll];
var Event = /*#__PURE__*/function () {
  function Event(tag, listener, once) {
    properties$1.defineReadOnly(this, 'tag', tag);
    properties$1.defineReadOnly(this, 'listener', listener);
    properties$1.defineReadOnly(this, 'once', once);
  }

  var _proto = Event.prototype;

  _proto.pollable = function pollable() {
    return this.tag.indexOf(':') >= 0 || PollableEvents.indexOf(this.tag) >= 0;
  };

  _createClass(Event, [{
    key: "event",
    get: function get() {
      switch (this.type) {
        case 'tx':
          return this.hash;

        case 'filter':
          return this.filter;
      }

      return this.tag;
    }
  }, {
    key: "type",
    get: function get() {
      return this.tag.split(':')[0];
    }
  }, {
    key: "hash",
    get: function get() {
      var comps = this.tag.split(':');

      if (comps[0] !== 'tx') {
        // @ts-ignore
        return null;
      }

      return comps[1];
    }
  }, {
    key: "filter",
    get: function get() {
      var comps = this.tag.split(':');

      if (comps[0] !== 'filter') {
        // @ts-ignore
        return null;
      }

      var topics = deserializeTopics(comps[1]);
      var filter = {};

      if (topics.length > 0) {
        filter.event_keys = topics;
      }

      return filter;
    }
  }]);

  return Event;
}(); // eslint-disable-next-line @typescript-eslint/ban-ts-comment

var RPC_ACTION = {
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
var defaultFormatter;
var nextPollId = 1;
var BaseProvider = /*#__PURE__*/function (_Provider) {
  _inheritsLoose(BaseProvider, _Provider);

  /**
   *  ready
   *
   *  A Promise<Network> that resolves only once the provider is ready.
   *
   *  Sub-classes that call the super with a network without a chainId
   *  MUST set this. Standard named networks have a known chainId.
   *
   */
  function BaseProvider(network) {
    var _this;

    logger$4.checkNew(this instanceof BaseProvider ? this.constructor : void 0, Provider);
    _this = _Provider.call(this) || this; // Events being listened to

    _this._events = [];
    _this._emitted = {
      block: -2
    };
    _this.formatter = (this instanceof BaseProvider ? this.constructor : void 0).getFormatter(); // If network is any, this Provider allows the underlying
    // network to change dynamically, and we auto-detect the
    // current network

    properties$1.defineReadOnly(_assertThisInitialized(_this), 'anyNetwork', network === 'any');

    if (_this.anyNetwork) {
      network = _this.detectNetwork();
    }

    if (network instanceof Promise) {
      _this._networkPromise = network; // Squash any "unhandled promise" errors; that do not need to be handled
      // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars

      network["catch"](function (error) {}); // Trigger initial network setting (async)
      // eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars

      _this._ready()["catch"](function (error) {});
    } else {
      var knownNetwork = getNetwork(network);

      if (knownNetwork) {
        properties$1.defineReadOnly(_assertThisInitialized(_this), '_network', knownNetwork);

        _this.emit('network', knownNetwork, null);
      } else {
        logger$4.throwArgumentError('invalid network', 'network', network);
      }
    }

    _this._maxInternalBlockNumber = -1024;
    _this._lastBlockNumber = -2;
    _this._pollingInterval = 4000;
    _this._fastQueryDate = 0;
    return _this;
  }

  var _proto2 = BaseProvider.prototype;

  _proto2._ready = function _ready() {
    try {
      var _this3 = this;

      var _temp8 = function _temp8() {
        return _this3._network;
      };

      var _temp9 = function () {
        if (_this3._network == null) {
          var _temp10 = function _temp10() {
            function _temp3() {
              // This should never happen; every Provider sub-class should have
              // suggested a network by here (or have thrown).
              if (!_network) {
                logger$4.throwError('no network detected', logger$9.Logger.errors.UNKNOWN_ERROR, {});
              } // Possible this call stacked so do not call defineReadOnly again


              if (_this3._network == null) {
                if (_this3.anyNetwork) {
                  _this3._network = _network;
                } else {
                  properties$1.defineReadOnly(_this3, '_network', _network);
                }

                _this3.emit('network', _network, null);
              }
            }

            var _temp2 = function () {
              if (_network == null) {
                return Promise.resolve(_this3.detectNetwork()).then(function (_this2$detectNetwork) {
                  _network = _this2$detectNetwork;
                });
              }
            }();

            // Try the Provider's network detection (this MUST throw if it cannot)
            return _temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2);
          };

          var _network = null;

          var _temp11 = function () {
            if (_this3._networkPromise) {
              var _temp12 = _catch(function () {
                return Promise.resolve(_this3._networkPromise).then(function (_this2$_networkPromis) {
                  _network = _this2$_networkPromis;
                }); // eslint-disable-next-line no-empty
              }, function () {});

              if (_temp12 && _temp12.then) return _temp12.then(function () {});
            }
          }();

          return _temp11 && _temp11.then ? _temp11.then(_temp10) : _temp10(_temp11);
        }
      }();

      return Promise.resolve(_temp9 && _temp9.then ? _temp9.then(_temp8) : _temp8(_temp9));
    } catch (e) {
      return Promise.reject(e);
    }
  } // This will always return the most recently established network.
  // For "any", this can change (a "network" event is emitted before
  // any change is refelcted); otherwise this cannot change
  ;

  // @TODO: Remove this and just create a singleton formatter
  BaseProvider.getFormatter = function getFormatter() {
    if (defaultFormatter == null) {
      defaultFormatter = new Formatter();
    }

    return defaultFormatter;
  } // Fetches the blockNumber, but will reuse any result that is less
  // than maxAge old or has been requested since the last request
  ;

  _proto2._getInternalBlockNumber = function _getInternalBlockNumber(maxAge) {
    try {
      var _this5 = this;

      return Promise.resolve(_this5._ready()).then(function () {
        var _exit;

        function _temp14(_result) {
          if (_exit) return _result;
          var reqTime = getTime();
          var checkInternalBlockNumber = properties$1.resolveProperties({
            blockNumber: _this5.perform(RPC_ACTION.getChainInfo, {}).then(function (chainInfo) {
              return chainInfo.head.number;
            }, function (err) {
              return err;
            }),
            networkError: _this5.getNetwork().then( // eslint-disable-next-line @typescript-eslint/no-unused-vars
            function (network) {
              return null;
            }, function (error) {
              return error;
            })
          }).then(function (_ref) {
            var blockNumber = _ref.blockNumber,
                networkError = _ref.networkError;

            if (networkError) {
              // Unremember this bad internal block number
              if (_this5._internalBlockNumber === checkInternalBlockNumber) {
                _this5._internalBlockNumber = null;
              }

              throw networkError;
            }

            var respTime = getTime();
            blockNumber = bignumber.BigNumber.from(blockNumber).toNumber();

            if (blockNumber < _this5._maxInternalBlockNumber) {
              blockNumber = _this5._maxInternalBlockNumber;
            }

            _this5._maxInternalBlockNumber = blockNumber;

            _this5._setFastBlockNumber(blockNumber);

            return {
              blockNumber: blockNumber,
              reqTime: reqTime,
              respTime: respTime
            };
          });
          _this5._internalBlockNumber = checkInternalBlockNumber;
          return Promise.resolve(checkInternalBlockNumber).then(function (_checkInternalBlockNu) {
            return _checkInternalBlockNu.blockNumber;
          });
        }

        var internalBlockNumber = _this5._internalBlockNumber;

        var _temp13 = function () {
          if (maxAge > 0 && _this5._internalBlockNumber) {
            return Promise.resolve(internalBlockNumber).then(function (result) {
              if (getTime() - result.respTime <= maxAge) {
                _exit = 1;
                return result.blockNumber;
              }
            });
          }
        }();

        return _temp13 && _temp13.then ? _temp13.then(_temp14) : _temp14(_temp13);
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.poll = function poll() {
    try {
      var _this7 = this;

      var pollId = nextPollId++; // Track all running promises, so we can trigger a post-poll once they are complete

      var runners = [];
      return Promise.resolve(_this7._getInternalBlockNumber(100 + _this7.pollingInterval / 2)).then(function (blockNumber) {
        _this7._setFastBlockNumber(blockNumber); // Emit a poll event after we have the latest (fast) block number


        _this7.emit('poll', pollId, blockNumber); // If the block has not changed, meh.


        if (blockNumber === _this7._lastBlockNumber) {
          _this7.emit('didPoll', pollId);

          return;
        } // First polling cycle, trigger a "block" events


        if (_this7._emitted.block === -2) {
          _this7._emitted.block = blockNumber - 1;
        }

        if (Math.abs(_this7._emitted.block - blockNumber) > 1000) {
          logger$4.warn('network block skew detected; skipping block events');

          _this7.emit('error', logger$4.makeError('network block skew detected', logger$9.Logger.errors.NETWORK_ERROR, {
            blockNumber: blockNumber,
            event: 'blockSkew',
            previousBlockNumber: _this7._emitted.block
          }));

          _this7.emit(CONSTANTS.block, blockNumber);
        } else {
          // Notify all listener for each block that has passed
          for (var i = _this7._emitted.block + 1; i <= blockNumber; i++) {
            _this7.emit(CONSTANTS.block, i);
          }
        } // The emitted block was updated, check for obsolete events


        if (_this7._emitted.block !== blockNumber) {
          _this7._emitted.block = blockNumber;
          Object.keys(_this7._emitted).forEach(function (key) {
            // The block event does not expire
            if (key === CONSTANTS.block) {
              return;
            } // The block we were at when we emitted this event


            var eventBlockNumber = _this7._emitted[key]; // We cannot garbage collect pending transactions or blocks here
            // They should be garbage collected by the Provider when setting
            // "pending" events

            if (eventBlockNumber === 'pending') {
              return;
            } // Evict any transaction hashes or block hashes over 12 blocks
            // old, since they should not return null anyways


            if (blockNumber - eventBlockNumber > 12) {
              delete _this7._emitted[key];
            }
          });
        } // First polling cycle


        if (_this7._lastBlockNumber === -2) {
          _this7._lastBlockNumber = blockNumber - 1;
        } // Find all transaction hashes we are waiting on


        _this7._events.forEach(function (event) {
          switch (event.type) {
            case CONSTANTS.tx:
              {
                var hash = event.hash;

                var runner = _this7.getTransactionInfo(hash).then(function (receipt) {
                  if (!receipt || receipt.block_number == null) {
                    return null;
                  }

                  _this7._emitted['t:' + hash] = receipt.block_number;

                  _this7.emit(hash, receipt);

                  return null;
                })["catch"](function (error) {
                  _this7.emit('error', error);
                });

                runners.push(runner);
                break;
              }

            case CONSTANTS.filter:
              {
                var filter = event.filter;
                filter.from_block = _this7._lastBlockNumber + 1;
                filter.to_block = blockNumber;

                var _runner = _this7.getTransactionEvents(filter).then(function (logs) {
                  if (logs.length === 0) {
                    return;
                  }

                  logs.forEach(function (log) {
                    _this7._emitted['b:' + log.block_hash] = log.block_number;
                    _this7._emitted['t:' + log.transaction_hash] = log.block_number;

                    _this7.emit(filter, log);
                  });
                })["catch"](function (error) {
                  _this7.emit('error', error);
                });

                runners.push(_runner);
                break;
              }
          }
        });

        _this7._lastBlockNumber = blockNumber; // Once all events for this loop have been processed, emit "didPoll"

        Promise.all(runners).then(function () {
          _this7.emit('didPoll', pollId);
        });
        return null;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.getNetwork = function getNetwork() {
    try {
      var _this9 = this;

      return Promise.resolve(_this9._ready()).then(function (network) {
        // Make sure we are still connected to the same network; this is
        // only an external call for backends which can have the underlying
        // network change spontaneously
        return Promise.resolve(_this9.detectNetwork()).then(function (currentNetwork) {
          var _exit2;

          var _temp17 = function () {
            if (network.chainId !== currentNetwork.chainId) {
              var _temp18 = function _temp18(_result2) {
                if (_exit2) return _result2;
                var error = logger$4.makeError('underlying network changed', logger$9.Logger.errors.NETWORK_ERROR, {
                  event: 'changed',
                  network: network,
                  detectedNetwork: currentNetwork
                });

                _this9.emit('error', error);

                throw error;
              };

              var _temp19 = function () {
                if (_this9.anyNetwork) {
                  _this9._network = currentNetwork; // Reset all internal block number guards and caches

                  _this9._lastBlockNumber = -2;
                  _this9._fastBlockNumber = null;
                  _this9._fastBlockNumberPromise = null;
                  _this9._fastQueryDate = 0;
                  _this9._emitted.block = -2;
                  _this9._maxInternalBlockNumber = -1024;
                  _this9._internalBlockNumber = null; // The "network" event MUST happen before this method resolves
                  // so any events have a chance to unregister, so we stall an
                  // additional event loop before returning from /this/ call

                  _this9.emit('network', currentNetwork, network);

                  return Promise.resolve(stall(0)).then(function () {
                    _exit2 = 1;
                    return _this9._network;
                  });
                }
              }();

              // We are allowing network changes, things can get complex fast;
              // make sure you know what you are doing if you use "any"
              return _temp19 && _temp19.then ? _temp19.then(_temp18) : _temp18(_temp19);
            }
          }();

          return _temp17 && _temp17.then ? _temp17.then(function (_result3) {
            return _exit2 ? _result3 : network;
          }) : _exit2 ? _temp17 : network;
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2._getFastBlockNumber = function _getFastBlockNumber() {
    var _this10 = this;

    var now = getTime(); // Stale block number, request a newer value

    if (now - this._fastQueryDate > 2 * this._pollingInterval) {
      this._fastQueryDate = now;
      this._fastBlockNumberPromise = this.getBlockNumber().then(function (blockNumber) {
        if (_this10._fastBlockNumber == null || blockNumber > _this10._fastBlockNumber) {
          _this10._fastBlockNumber = blockNumber;
        }

        return _this10._fastBlockNumber;
      });
    }

    return this._fastBlockNumberPromise;
  };

  _proto2._setFastBlockNumber = function _setFastBlockNumber(blockNumber) {
    // Older block, maybe a stale request
    if (this._fastBlockNumber != null && blockNumber < this._fastBlockNumber) {
      return;
    } // Update the time we updated the blocknumber


    this._fastQueryDate = getTime(); // Newer block number, use  it

    if (this._fastBlockNumber == null || blockNumber > this._fastBlockNumber) {
      this._fastBlockNumber = blockNumber;
      this._fastBlockNumberPromise = Promise.resolve(blockNumber);
    }
  };

  _proto2.waitForTransaction = function waitForTransaction(transactionHash, confirmations, timeout) {
    try {
      var _this12 = this;

      if (confirmations == null) {
        confirmations = 1;
      }

      return Promise.resolve(_this12.getTransactionInfo(transactionHash)).then(function (transactionInfo) {
        return (transactionInfo ? transactionInfo.confirmations : 0) >= confirmations ? Promise.resolve(transactionInfo) : new Promise(function (resolve, reject) {
          var timer = null;
          var done = false;

          var handler = function handler(transactionInfo) {
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

            _this12.removeListener(transactionHash, handler);

            resolve(transactionInfo);
          };

          _this12.on(transactionHash, handler);

          if (typeof timeout === 'number' && timeout > 0) {
            timer = setTimeout(function () {
              if (done) {
                return;
              }

              timer = null;
              done = true;

              _this12.removeListener(transactionHash, handler);

              reject(logger$4.makeError('timeout exceeded', logger$9.Logger.errors.TIMEOUT, {
                timeout: timeout
              }));
            }, timeout);

            if (timer.unref) {
              timer.unref();
            }
          }
        });
      }); // Receipt is already good
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.getBlockNumber = function getBlockNumber() {
    try {
      var _this14 = this;

      return Promise.resolve(_this14._getInternalBlockNumber(0));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.getGasPrice = function getGasPrice() {
    try {
      var _this16 = this;

      return Promise.resolve(_this16.getNetwork()).then(function () {
        return Promise.resolve(_this16.perform(RPC_ACTION.getGasPrice, {})).then(function (result) {
          return _this16.formatter.u64(result);
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
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
  ;

  _proto2.getCode = function getCode(moduleId, blockTag) {
    try {
      var _this18 = this;

      return Promise.resolve(_this18.getNetwork()).then(function () {
        var _getModuleId = BaseProvider.getModuleId;
        return Promise.resolve(moduleId).then(function (_moduleId) {
          return Promise.resolve(properties$1.resolveProperties({
            moduleId: _getModuleId.call(BaseProvider, _moduleId),
            blockTag: blockTag
          })).then(function (params) {
            return Promise.resolve(_this18.perform(RPC_ACTION.getCode, params)).then(function (code) {
              if (code) {
                return bytes.hexlify(code);
              }
            });
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  } // get resource data.
  // eslint-disable-next-line consistent-return
  ;

  _proto2.getResource = function getResource(address, resource_struct_tag, blockTag) {
    try {
      var _this20 = this;

      return Promise.resolve(_this20.getNetwork()).then(function () {
        return Promise.resolve(properties$1.resolveProperties({
          address: address,
          structTag: resource_struct_tag,
          blockTag: blockTag
        })).then(function (params) {
          return Promise.resolve(_this20.perform(RPC_ACTION.getResource, params)).then(function (value) {
            if (value) {
              return _this20.formatter.moveStruct(value);
            }
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.getResources = function getResources(address, blockTag) {
    try {
      var _this22 = this;

      return Promise.resolve(_this22.getNetwork()).then(function () {
        return Promise.resolve(properties$1.resolveProperties({
          address: address,
          blockTag: blockTag
        })).then(function (params) {
          return Promise.resolve(_this22.perform(RPC_ACTION.getAccountState, params)).then(function (value) {
            if (value) {
              // @ts-ignore
              return Object.entries(value.resources).reduce(function (o, _ref2) {
                var _extends2;

                var k = _ref2[0],
                    v = _ref2[1];
                return _extends({}, o, (_extends2 = {}, _extends2[k] = _this22.formatter.moveStruct(v), _extends2));
              }, {});
            }
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  } // This should be called by any subclass wrapping a TransactionResponse
  ;

  _proto2._wrapTransaction = function _wrapTransaction(tx, hash) {
    var _this23 = this;

    if (hash != null && bytes.hexDataLength(hash) !== 32) {
      throw new Error('invalid response - sendTransaction');
    }

    var result = tx; // Check the hash we expect is the same as the hash the server reported

    if (hash != null && tx.transaction_hash !== hash) {
      logger$4.throwError('Transaction hash mismatch from Provider.sendTransaction.', logger$9.Logger.errors.UNKNOWN_ERROR, {
        expectedHash: tx.transaction_hash,
        returnedHash: hash
      });
    } // @TODO: (confirmations? number, timeout? number)


    result.wait = function (confirmations) {
      try {
        // We know this transaction *must* exist (whether it gets mined is
        // another story), so setting an emitted value forces us to
        // wait even if the node returns null for the receipt
        if (confirmations !== 0) {
          _this23._emitted["t:" + tx.transaction_hash] = 'pending';
        }

        return Promise.resolve(_this23.waitForTransaction(tx.transaction_hash, confirmations)).then(function (receipt) {
          if (receipt == null && confirmations === 0) {
            return null;
          } // No longer pending, allow the polling loop to garbage collect this


          _this23._emitted["t:" + tx.transaction_hash] = receipt.block_number;
          result.block_hash = receipt.block_hash;
          result.block_number = receipt.block_number;
          result.confirmations = confirmations;

          if (receipt.status !== 'Executed') {
            logger$4.throwError('transaction failed', logger$9.Logger.errors.CALL_EXCEPTION, {
              transactionHash: tx.transaction_hash,
              transaction: tx,
              receipt: receipt
            });
          }

          return receipt;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };

    return result;
  };

  _proto2.sendTransaction = function sendTransaction(signedTransaction) {
    try {
      var _this25 = this;

      return Promise.resolve(_this25.getNetwork()).then(function () {
        return Promise.resolve(signedTransaction).then(function (hexTx) {
          var tx = _this25.formatter.userTransactionData(hexTx);

          return _catch(function () {
            // FIXME: check rpc call
            return Promise.resolve(_this25.perform(RPC_ACTION.sendTransaction, {
              signedTransaction: hexTx
            })).then(function () {
              return _this25._wrapTransaction(tx);
            });
          }, function (error) {
            error.transaction = tx;
            error.transactionHash = tx.transaction_hash;
            throw error;
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
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
  ;

  BaseProvider.getModuleId = function getModuleId(moduleId) {
    if (typeof moduleId === 'string') {
      return moduleId;
    }

    return moduleId.address + "::" + moduleId.name;
  };

  _proto2._getFilter = function _getFilter(filter) {
    try {
      var _this27 = this;

      return Promise.resolve(filter).then(function (result) {
        var _this26$formatter = _this27.formatter,
            _filter = _this26$formatter.filter;
        // const result: any = {};
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
        return Promise.resolve(properties$1.resolveProperties(result)).then(function (_resolveProperties) {
          return _filter.call(_this26$formatter, _resolveProperties);
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.call = function call(request, // eslint-disable-next-line @typescript-eslint/no-unused-vars
  blockTag) {
    try {
      var _this29 = this;

      return Promise.resolve(_this29.getNetwork()).then(function () {
        return Promise.resolve(properties$1.resolveProperties({
          request: request
        })).then(function (params) {
          params.request.function_id = formatFunctionId(params.request.function_id); // eslint-disable-next-line no-return-await

          return Promise.resolve(_this29.perform(RPC_ACTION.call, params)).then(function (rets) {
            return rets.map(function (v) {
              return _this29.formatter.moveValue(v);
            });
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.callV2 = function callV2(request, // eslint-disable-next-line @typescript-eslint/no-unused-vars
  blockTag) {
    try {
      var _this31 = this;

      return Promise.resolve(_this31.getNetwork()).then(function () {
        return Promise.resolve(properties$1.resolveProperties({
          request: request
        })).then(function (params) {
          params.request.function_id = formatFunctionId(params.request.function_id); // eslint-disable-next-line no-return-await

          return Promise.resolve(_this31.perform(RPC_ACTION.callV2, params)).then(function (rets) {
            return rets.map(function (v) {
              return v;
            });
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.dryRun = function dryRun(transaction) {
    try {
      var _this33 = this;

      return Promise.resolve(_this33.getNetwork()).then(function () {
        return Promise.resolve(properties$1.resolveProperties({
          transaction: transaction
        })).then(function (params) {
          return Promise.resolve(_this33.perform(RPC_ACTION.dryRun, params)).then(function (resp) {
            return _this33.formatter.transactionOutput(resp);
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.dryRunRaw = function dryRunRaw(rawUserTransactionHex, publicKeyHex) {
    try {
      var _this35 = this;

      return Promise.resolve(_this35.getNetwork()).then(function () {
        var params = {
          rawUserTransactionHex: rawUserTransactionHex,
          publicKeyHex: publicKeyHex
        };
        return Promise.resolve(_this35.perform(RPC_ACTION.dryRunRaw, params)).then(function (resp) {
          return _this35.formatter.transactionOutput(resp);
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  } // VM2 variants
  ;

  _proto2.sendRawTransactionV2 = function sendRawTransactionV2(signedTransactionHex) {
    try {
      var _this37 = this;

      return Promise.resolve(_this37.getNetwork()).then(function () {
        var params = {
          signedTransaction: signedTransactionHex
        };
        return _this37.perform(RPC_ACTION.sendTransactionV2, params);
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.dryRunRawV2 = function dryRunRawV2(rawUserTransactionHex, publicKeyHex) {
    try {
      var _this39 = this;

      return Promise.resolve(_this39.getNetwork()).then(function () {
        var params = {
          rawUserTransactionHex: rawUserTransactionHex,
          publicKeyHex: publicKeyHex
        };
        return Promise.resolve(_this39.perform(RPC_ACTION.dryRunRawV2, params)).then(function (resp) {
          return _this39.formatter.transactionOutput(resp);
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.getResourceV2 = function getResourceV2(address, resource_struct_tag) {
    try {
      var _this41 = this;

      return Promise.resolve(_this41.getNetwork()).then(function () {
        return Promise.resolve(properties$1.resolveProperties({
          address: address,
          structTag: resource_struct_tag
        })).then(function (params) {
          return Promise.resolve(_this41.perform(RPC_ACTION.getResourceV2, params)).then(function (value) {
            if (value) {
              return _this41.formatter.moveStruct(value);
            }
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.getCodeV2 = function getCodeV2(moduleId) {
    try {
      var _this43 = this;

      return Promise.resolve(_this43.getNetwork()).then(function () {
        var _getModuleId2 = BaseProvider.getModuleId;
        return Promise.resolve(moduleId).then(function (_moduleId2) {
          return Promise.resolve(properties$1.resolveProperties({
            moduleId: _getModuleId2.call(BaseProvider, _moduleId2)
          })).then(function (params) {
            return Promise.resolve(_this43.perform(RPC_ACTION.getCodeV2, params)).then(function (code) {
              if (code) {
                return bytes.hexlify(code);
              }
            });
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2._getBlock = function _getBlock(blockHashOrBlockNumber, includeTransactions) {
    try {
      var _this45 = this;

      return Promise.resolve(_this45.getNetwork()).then(function () {
        return Promise.resolve(blockHashOrBlockNumber).then(function (_blockHashOrBlockNumb) {
          function _temp22() {
            return web.poll(function () {
              try {
                return Promise.resolve(_this45.perform(RPC_ACTION.getBlock, params)).then(function (block) {
                  var _exit3;

                  function _temp24(_result4) {
                    return _exit3 ? _result4 : _this45.formatter.blockWithTxnHashes(block);
                  }

                  // Block was not found
                  if (block == null) {
                    // For blockhashes, if we didn't say it existed, that blockhash may
                    // not exist. If we did see it though, perhaps from a log, we know
                    // it exists, and this node is just not caught up yet.
                    if (params.blockHash != null) {
                      if (_this45._emitted["b:" + params.blockHash] == null) {
                        return null;
                      }
                    } // For block number, if we are asking for a future block, we return null


                    if (params.blockNumber != null) {
                      if (blockNumber > _this45._emitted.block) {
                        return null;
                      }
                    } // Retry on the next block


                    return undefined;
                  } // Add transactions


                  var _temp23 = function () {
                    if (includeTransactions) {
                      return Promise.resolve(_this45._getInternalBlockNumber(100 + 2 * _this45.pollingInterval)).then(function (blockNumber) {
                        // Add the confirmations using the fast block number (pessimistic)
                        var confirmations = blockNumber - block.header.number + 1;

                        if (confirmations <= 0) {
                          confirmations = 1;
                        }

                        block.confirmations = confirmations;
                        _exit3 = 1;
                        return _this45.formatter.blockWithTransactions(block);
                      });
                    }
                  }();

                  return _temp23 && _temp23.then ? _temp23.then(_temp24) : _temp24(_temp23);
                });
              } catch (e) {
                return Promise.reject(e);
              }
            }, {
              oncePoll: _this45
            });
          }

          blockHashOrBlockNumber = _blockHashOrBlockNumb;
          // If blockTag is a number (not "latest", etc), this is the block number
          var blockNumber = -128;
          var params = {
            includeTransactions: !!includeTransactions
          };

          var _temp21 = function () {
            if (bytes.isHexString(blockHashOrBlockNumber, 32)) {
              params.blockHash = blockHashOrBlockNumber;
            } else {
              var _temp25 = _catch(function () {
                return Promise.resolve(_this45._getBlockTag(blockHashOrBlockNumber)).then(function (_this44$_getBlockTag) {
                  params.blockNumber = _this44$_getBlockTag;
                  blockNumber = params.blockNumber;
                });
              }, function () {
                logger$4.throwArgumentError('invalid block hash or block number', 'blockHashOrBlockNumber', blockHashOrBlockNumber);
              });

              if (_temp25 && _temp25.then) return _temp25.then(function () {});
            }
          }();

          return _temp21 && _temp21.then ? _temp21.then(_temp22) : _temp22(_temp21);
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  } // getBlock(
  //   blockHashOrBlockTag: BlockTag | string | Promise<BlockTag | string>
  // ): Promise<BlockWithTxnHashes> {
  //   return <Promise<BlockWithTxnHashes>>(
  //     this._getBlock(blockHashOrBlockTag, true)
  //   );
  // }
  ;

  _proto2.getBlock = function getBlock(blockTag) {
    return this._getBlock(blockTag, true);
  };

  _proto2.getTransaction = function getTransaction(transactionHash) {
    try {
      var _this47 = this;

      return Promise.resolve(_this47.getNetwork()).then(function () {
        return Promise.resolve(transactionHash).then(function (_transactionHash) {
          transactionHash = _transactionHash;
          var params = {
            transactionHash: _this47.formatter.hash(transactionHash, true)
          };
          return web.poll(function () {
            try {
              return Promise.resolve(_this47.perform(RPC_ACTION.getTransactionByHash, params)).then(function (result) {
                function _temp28() {
                  return _this47._wrapTransaction(tx);
                }

                if (result == null) {
                  if (_this47._emitted["t:" + transactionHash] == null) {
                    return null;
                  }

                  return undefined;
                }

                var tx = _this47.formatter.transactionResponse(result);

                var _temp27 = function () {
                  if (tx.block_number === undefined) {
                    tx.confirmations = 0;
                  } else {
                    var _temp29 = function () {
                      if (tx.confirmations === undefined) {
                        return Promise.resolve(_this47._getInternalBlockNumber(100 + 2 * _this47.pollingInterval)).then(function (blockNumber) {
                          // Add the confirmations using the fast block number (pessimistic)
                          var confirmations = blockNumber - tx.block_number + 1;

                          if (confirmations <= 0) {
                            confirmations = 1;
                          }

                          tx.confirmations = confirmations;
                        });
                      }
                    }();

                    if (_temp29 && _temp29.then) return _temp29.then(function () {});
                  }
                }();

                return _temp27 && _temp27.then ? _temp27.then(_temp28) : _temp28(_temp27);
              });
            } catch (e) {
              return Promise.reject(e);
            }
          }, {
            oncePoll: _this47
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.getTransactionInfo = function getTransactionInfo(transactionHash) {
    try {
      var _this49 = this;

      return Promise.resolve(_this49.getNetwork()).then(function () {
        return Promise.resolve(transactionHash).then(function (_transactionHash2) {
          transactionHash = _transactionHash2;
          var params = {
            transactionHash: _this49.formatter.hash(transactionHash, true)
          };
          return web.poll(function () {
            try {
              return Promise.resolve(_this49.perform(RPC_ACTION.getTransactionInfo, params)).then(function (result) {
                if (result === null) {
                  if (_this49._emitted["t:" + transactionHash] === null) {
                    return null;
                  }

                  return undefined;
                }

                if (result.block_hash === null) {
                  return undefined;
                }

                var transactionInfo = _this49.formatter.transactionInfo(result);

                var _temp31 = function () {
                  if (transactionInfo.block_number === null) {
                    transactionInfo.confirmations = 0;
                  } else {
                    var _temp32 = function () {
                      if (!transactionInfo.confirmations) {
                        return Promise.resolve(_this49._getInternalBlockNumber(100 + 2 * _this49.pollingInterval)).then(function (blockNumber) {
                          // Add the confirmations using the fast block number (pessimistic)
                          var confirmations = blockNumber - transactionInfo.block_number + 1;

                          if (confirmations <= 0) {
                            confirmations = 1;
                          }

                          transactionInfo.confirmations = confirmations;
                        });
                      }
                    }();

                    if (_temp32 && _temp32.then) return _temp32.then(function () {});
                  }
                }();

                return _temp31 && _temp31.then ? _temp31.then(function () {
                  return transactionInfo;
                }) : transactionInfo;
              });
            } catch (e) {
              return Promise.reject(e);
            }
          }, {
            oncePoll: _this49
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.getEventsOfTransaction = function getEventsOfTransaction(transactionHash) {
    try {
      var _this51 = this;

      return Promise.resolve(_this51.getNetwork()).then(function () {
        return Promise.resolve(transactionHash).then(function (_transactionHash3) {
          transactionHash = _transactionHash3;
          var params = {
            transactionHash: _this51.formatter.hash(transactionHash, true)
          };
          return Promise.resolve(_this51.perform(RPC_ACTION.getEventsOfTransaction, params)).then(function (logs) {
            return Formatter.arrayOf(_this51.formatter.transactionEvent.bind(_this51.formatter))(logs);
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.getTransactionEvents = function getTransactionEvents(filter) {
    try {
      var _this53 = this;

      return Promise.resolve(_this53.getNetwork()).then(function () {
        return Promise.resolve(properties$1.resolveProperties({
          filter: filter
        })).then(function (params) {
          return Promise.resolve(_this53.perform(RPC_ACTION.getEvents, params)).then(function (logs) {
            return Formatter.arrayOf(_this53.formatter.transactionEvent.bind(_this53.formatter))(logs);
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2._getBlockTag = function _getBlockTag(blockTag) {
    try {
      var _this55 = this;

      return Promise.resolve(blockTag).then(function (_blockTag) {
        blockTag = _blockTag;

        if (blockTag < 0) {
          if (blockTag % 1) {
            logger$4.throwArgumentError('invalid BlockTag', 'blockTag', blockTag);
          }

          return Promise.resolve(_this55._getInternalBlockNumber(100 + 2 * _this55.pollingInterval)).then(function (blockNumber) {
            blockNumber += blockTag;

            if (blockNumber < 0) {
              blockNumber = 0;
            }

            return blockNumber;
          });
        } else {
          return blockTag;
        }
      });
    } catch (e) {
      return Promise.reject(e);
    }
  } // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ;

  _proto2._startEvent = function _startEvent(event) {
    this.polling = this._events.filter(function (e) {
      return e.pollable();
    }).length > 0;
  } // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ;

  _proto2._stopEvent = function _stopEvent(event) {
    this.polling = this._events.filter(function (e) {
      return e.pollable();
    }).length > 0;
  };

  _proto2._addEventListener = function _addEventListener(eventName, listener, once) {
    var event = new Event(getEventTag(eventName), listener, once);

    this._events.push(event);

    this._startEvent(event);

    return this;
  };

  _proto2.on = function on(eventName, listener) {
    return this._addEventListener(eventName, listener, false);
  };

  _proto2.once = function once(eventName, listener) {
    return this._addEventListener(eventName, listener, true);
  };

  _proto2.emit = function emit(eventName) {
    var _arguments = arguments,
        _this56 = this;

    var result = false;
    var stopped = [];
    var eventTag = getEventTag(eventName);
    this._events = this._events.filter(function (event) {
      if (event.tag !== eventTag) {
        return true;
      }

      setTimeout(function () {
        event.listener.apply(_this56, [].slice.call(_arguments, 1));
      }, 0);
      result = true;

      if (event.once) {
        stopped.push(event);
        return false;
      }

      return true;
    });
    stopped.forEach(function (event) {
      _this56._stopEvent(event);
    });
    return result;
  };

  _proto2.listenerCount = function listenerCount(eventName) {
    if (!eventName) {
      return this._events.length;
    }

    var eventTag = getEventTag(eventName);
    return this._events.filter(function (event) {
      return event.tag === eventTag;
    }).length;
  };

  _proto2.listeners = function listeners(eventName) {
    if (eventName == null) {
      return this._events.map(function (event) {
        return event.listener;
      });
    }

    var eventTag = getEventTag(eventName);
    return this._events.filter(function (event) {
      return event.tag === eventTag;
    }).map(function (event) {
      return event.listener;
    });
  };

  _proto2.off = function off(eventName, listener) {
    var _this57 = this;

    if (listener === null) {
      return this.removeAllListeners(eventName);
    }

    var stopped = [];
    var found = false;
    var eventTag = getEventTag(eventName);
    this._events = this._events.filter(function (event) {
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
    stopped.forEach(function (event) {
      _this57._stopEvent(event);
    });
    return this;
  };

  _proto2.removeAllListeners = function removeAllListeners(eventName) {
    var _this58 = this;

    var stopped = [];

    if (eventName === null) {
      stopped = this._events;
      this._events = [];
    } else {
      var eventTag = getEventTag(eventName);
      this._events = this._events.filter(function (event) {
        if (event.tag !== eventTag) {
          return true;
        }

        stopped.push(event);
        return false;
      });
    }

    stopped.forEach(function (event) {
      _this58._stopEvent(event);
    });
    return this;
  };

  _createClass(BaseProvider, [{
    key: "ready",
    get: function get() {
      var _this59 = this;

      return web.poll(function () {
        return _this59._ready().then(function (network) {
          return network;
        }, function (error) {
          // If the network isn't running yet, we will wait
          if (error.code === logger$9.Logger.errors.NETWORK_ERROR && error.event === 'noNetwork') {
            return undefined;
          }

          throw error;
        });
      });
    }
  }, {
    key: "network",
    get: function get() {
      return this._network;
    }
  }, {
    key: "blockNumber",
    get: function get() {
      this._getInternalBlockNumber(100 + this.pollingInterval / 2);

      return this._fastBlockNumber != null ? this._fastBlockNumber : -1;
    }
  }, {
    key: "polling",
    get: function get() {
      return this._poller != null;
    },
    set: function set(value) {
      var _this60 = this;

      if (value && !this._poller) {
        this._poller = setInterval(this.poll.bind(this), this.pollingInterval);

        if (!this._bootstrapPoll) {
          this._bootstrapPoll = setTimeout(function () {
            _this60.poll(); // We block additional polls until the polling interval
            // is done, to prevent overwhelming the poll function


            _this60._bootstrapPoll = setTimeout(function () {
              // If polling was disabled, something may require a poke
              // since starting the bootstrap poll and it was disabled
              if (!_this60._poller) {
                _this60.poll();
              } // Clear out the bootstrap so we can do another


              _this60._bootstrapPoll = null;
            }, _this60.pollingInterval);
          }, 0);
        }
      } else if (!value && this._poller) {
        clearInterval(this._poller);
        this._poller = null;
      }
    }
  }, {
    key: "pollingInterval",
    get: function get() {
      return this._pollingInterval;
    },
    set: function set(value) {
      var _this61 = this;

      if (typeof value !== 'number' || value <= 0 || parseInt(String(value)) != value) {
        throw new Error('invalid polling interval');
      }

      this._pollingInterval = value;

      if (this._poller) {
        clearInterval(this._poller);
        this._poller = setInterval(function () {
          _this61.poll();
        }, this._pollingInterval);
      }
    }
  }]);

  return BaseProvider;
}(Provider);

var logger$5 = new logger$9.Logger(version);
var allowedTransactionKeys = new Set(['sender', 'sender_public_key', 'sequence_number', 'script', 'modules', 'max_gas_amount', 'gas_unit_price', 'gas_token_code', 'chain_id']); // FIXME: change the error data.

var forwardErrors = new Set([logger$9.Logger.errors.INSUFFICIENT_FUNDS, logger$9.Logger.errors.NONCE_EXPIRED, logger$9.Logger.errors.REPLACEMENT_UNDERPRICED]);
var Signer = /*#__PURE__*/function () {
  // Sub-classes MUST call super
  function Signer() {
    logger$5.checkAbstract(this instanceof Signer ? this.constructor : void 0, Signer);
    properties$1.defineReadOnly(this, '_isSigner', true);
  } // Sub-classes MAY override these


  var _proto = Signer.prototype;

  _proto.getBalance = function getBalance(token, blockTag) {
    try {
      var _this2 = this;

      _this2.checkProvider('getBalance');

      return Promise.resolve(_this2.provider.getBalance(_this2.getAddress(), token, blockTag));
    } catch (e) {
      return Promise.reject(e);
    }
  } // FIXME: check pending txn in txpool
  ;

  _proto.getSequenceNumber = function getSequenceNumber(blockTag) {
    try {
      var _this4 = this;

      _this4.checkProvider('getSequenceNumber');

      return Promise.resolve(_this4.provider.getSequenceNumber(_this4.getAddress(), blockTag));
    } catch (e) {
      return Promise.reject(e);
    }
  } // Populates "from" if unspecified, and estimates the gas for the transation
  ;

  _proto.estimateGas = function estimateGas(transaction) {
    try {
      var _this6 = this;

      _this6.checkProvider('estimateGas');

      return Promise.resolve(properties$1.resolveProperties(_this6.checkTransaction(transaction))).then(function (tx) {
        return Promise.resolve(_this6.provider.dryRun(tx)).then(function (txnOutput) {
          return typeof txnOutput.gas_used === 'number' ? 3 * txnOutput.gas_used : BigInt(3) * txnOutput.gas_used.valueOf();
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  } // calls with the transaction
  // async call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag): Promise<string> {
  //   this.checkProvider('call');
  //   const tx = await resolveProperties(this.checkTransaction(transaction));
  //   return await this.provider.call(tx, blockTag);
  // }
  // Populates all fields in a transaction, signs it and sends it to the network
  ;

  _proto.sendTransaction = function sendTransaction(transaction) {
    var _this7 = this;

    this.checkProvider('sendTransaction');
    return this.populateTransaction(transaction).then(function (tx) {
      return _this7.signTransaction(tx).then(function (signedTx) {
        return _this7.provider.sendTransaction(signedTx);
      });
    });
  };

  _proto.getChainId = function getChainId() {
    try {
      var _this9 = this;

      _this9.checkProvider('getChainId');

      return Promise.resolve(_this9.provider.getNetwork()).then(function (network) {
        return network.chainId;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getGasPrice = function getGasPrice() {
    try {
      var _this11 = this;

      _this11.checkProvider('getGasPrice');

      return Promise.resolve(_this11.provider.getGasPrice());
    } catch (e) {
      return Promise.reject(e);
    }
  } // Checks a transaction does not contain invalid keys and if
  // no "from" is provided, populates it.
  // - does NOT require a provider
  // - adds "from" is not present
  // - returns a COPY (safe to mutate the result)
  // By default called from: (overriding these prevents it)
  //   - call
  //   - estimateGas
  //   - populateTransaction (and therefor sendTransaction)
  ;

  _proto.checkTransaction = function checkTransaction(transaction) {
    // eslint-disable-next-line no-restricted-syntax
    for (var _i = 0, _Object$keys = Object.keys(transaction); _i < _Object$keys.length; _i++) {
      var key = _Object$keys[_i];

      if (!allowedTransactionKeys.has(key)) {
        logger$5.throwArgumentError("invalid transaction key: " + key, 'transaction', transaction);
      }
    }

    var tx = properties$1.shallowCopy(transaction);

    if (tx.sender === undefined) {
      tx.sender = this.getAddress();
    } else {
      // Make sure any provided address matches this signer
      tx.sender = Promise.all([Promise.resolve(tx.sender), this.getAddress()]).then(function (result) {
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
  ;

  _proto.populateTransaction = function populateTransaction(transaction) {
    try {
      var _this13 = this;

      return Promise.resolve(properties$1.resolveProperties(_this13.checkTransaction(transaction))).then(function (tx) {
        if (tx.gas_unit_price === undefined) {
          tx.gas_unit_price = _this13.getGasPrice();
        }

        if (tx.sequence_number === undefined) {
          tx.sequence_number = _this13.getSequenceNumber('pending');
        }

        if (tx.chain_id === undefined) {
          tx.chain_id = _this13.getChainId();
        } else {
          tx.chain_id = Promise.all([Promise.resolve(tx.chain_id), _this13.getChainId()]).then(function (results) {
            if (results[1] !== 0 && results[0] !== results[1]) {
              logger$5.throwArgumentError('chainId address mismatch', 'transaction', transaction);
            }

            return results[0];
          });
        }

        if (tx.max_gas_amount === undefined) {
          tx.max_gas_amount = _this13.estimateGas(tx)["catch"](function (error) {
            if (forwardErrors.has(error.code)) {
              throw error;
            }

            console.log("err: " + error);
            return logger$5.throwError('cannot estimate gas; transaction may fail or may require manual gas limit', logger$9.Logger.errors.UNPREDICTABLE_GAS_LIMIT, {
              error: error,
              tx: tx
            });
          });
        }

        return properties$1.resolveProperties(tx);
      });
    } catch (e) {
      return Promise.reject(e);
    }
  } // Sub-classes SHOULD leave these alone
  // eslint-disable-next-line no-underscore-dangle
  ;

  _proto.checkProvider = function checkProvider(operation) {
    if (!this.provider) {
      logger$5.throwError('missing provider', logger$9.Logger.errors.UNSUPPORTED_OPERATION, {
        operation: operation || '_checkProvider'
      });
    }
  } // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  ;

  Signer.isSigner = function isSigner(value) {
    // eslint-disable-next-line no-underscore-dangle
    return !!(value && value._isSigner);
  };

  return Signer;
}();

function _catch$1(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }

  if (result && result.then) {
    return result.then(void 0, recover);
  }

  return result;
}

var logger$6 = new logger$9.Logger(version);
var errorGas = new Set(['call', 'estimateGas']); // FIXME: recheck the error.

function checkError(method, error, params) {
  var message = error.message;

  if (error.code === logger$9.Logger.errors.SERVER_ERROR && error.error && typeof error.error.message === 'string') {
    message = error.error.message;
  } else if (typeof error.body === 'string') {
    message = error.body;
  } else if (typeof error.responseText === 'string') {
    message = error.responseText;
  }

  message = (message || '').toLowerCase();
  var transaction = params.transaction || params.signedTransaction; // "insufficient funds for gas * price + value + cost(data)"

  if (message.match(/insufficient funds/)) {
    logger$6.throwError('insufficient funds for intrinsic transaction cost', logger$9.Logger.errors.INSUFFICIENT_FUNDS, {
      error: error,
      method: method,
      transaction: transaction
    });
  } // "nonce too low"


  if (message.match(/nonce too low/)) {
    logger$6.throwError('nonce has already been used', logger$9.Logger.errors.NONCE_EXPIRED, {
      error: error,
      method: method,
      transaction: transaction
    });
  } // "replacement transaction underpriced"


  if (message.match(/replacement transaction underpriced/)) {
    logger$6.throwError('replacement fee too low', logger$9.Logger.errors.REPLACEMENT_UNDERPRICED, {
      error: error,
      method: method,
      transaction: transaction
    });
  }

  if (errorGas.has(method) && message.match(/gas required exceeds allowance|always failing transaction|execution reverted/)) {
    logger$6.throwError('cannot estimate gas; transaction may fail or may require manual gas limit', logger$9.Logger.errors.UNPREDICTABLE_GAS_LIMIT, {
      error: error,
      method: method,
      transaction: transaction
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
    var error = new Error(payload.error.message);
    error.code = payload.error.code;
    error.data = payload.error.data;
    throw error;
  }

  return payload.result;
}

var _constructorGuard = {};
var JsonRpcSigner = /*#__PURE__*/function (_Signer) {
  _inheritsLoose(JsonRpcSigner, _Signer);

  // eslint-disable-next-line no-use-before-define
  function JsonRpcSigner(constructorGuard, provider, addressOrIndex) {
    var _this;

    logger$6.checkNew(this instanceof JsonRpcSigner ? this.constructor : void 0, JsonRpcSigner);
    _this = _Signer.call(this) || this;

    if (constructorGuard !== _constructorGuard) {
      throw new Error('do not call the JsonRpcSigner constructor directly; use provider.getSigner');
    }

    properties$1.defineReadOnly(_assertThisInitialized(_this), 'provider', provider); // eslint-disable-next-line no-param-reassign

    if (addressOrIndex === undefined) {
      addressOrIndex = 0;
    }

    if (typeof addressOrIndex === 'string') {
      properties$1.defineReadOnly(_assertThisInitialized(_this), '_address', _this.provider.formatter.address(addressOrIndex));
    } else if (typeof addressOrIndex === 'number') {
      properties$1.defineReadOnly(_assertThisInitialized(_this), '_index', addressOrIndex);
    } else {
      logger$6.throwArgumentError('invalid address or index', 'addressOrIndex', addressOrIndex);
    }

    return _this;
  } // eslint-disable-next-line @typescript-eslint/no-unused-vars,class-methods-use-this


  var _proto = JsonRpcSigner.prototype;

  _proto.connect = function connect(provider) {
    return logger$6.throwError('cannot alter JSON-RPC Signer connection', logger$9.Logger.errors.UNSUPPORTED_OPERATION, {
      operation: 'connect'
    });
  } // connectUnchecked(): JsonRpcSigner {
  //   return new UncheckedJsonRpcSigner(_constructorGuard, this.provider, this._address || this._index);
  // }
  ;

  _proto.getAddress = function getAddress() {
    try {
      var _this3 = this;

      // eslint-disable-next-line no-underscore-dangle
      if (_this3._address) {
        // eslint-disable-next-line no-underscore-dangle
        return Promise.resolve(_this3._address);
      }

      return Promise.resolve(_this3.provider.send("stc_accounts", []).then(function (accounts) {
        if (accounts.length <= _this3._index) {
          logger$6.throwError("unknown account #" + _this3._index, logger$9.Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "getAddress"
          });
        }

        return _this3.provider.formatter.address(accounts[_this3._index]);
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.sendUncheckedTransaction = function sendUncheckedTransaction(transaction) {
    var _this4 = this;

    logger$6.debug('sendUncheckedTransaction', transaction);
    transaction = properties$1.shallowCopy(transaction);
    var fromAddress = this.getAddress().then(function (address) {
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

    return properties$1.resolveProperties({
      tx: properties$1.resolveProperties(transaction),
      sender: fromAddress
    }).then(function (_ref) {
      var tx = _ref.tx,
          sender = _ref.sender;

      if (tx.from != null) {
        if (tx.from.toLowerCase() !== sender) {
          logger$6.throwArgumentError("from address mismatch", "transaction", transaction);
        }
      } else {
        tx.from = sender;
      }

      var hexTx = _this4.provider.constructor.hexlifyTransaction(tx, {
        from: true,
        expiredSecs: true,
        addGasBufferMultiplier: true
      });

      if (tx.addGasBufferMultiplier && typeof tx.addGasBufferMultiplier === 'number') {
        hexTx.addGasBufferMultiplier = tx.addGasBufferMultiplier.toString();
      }

      logger$6.debug(hexTx);
      return _this4.provider.send("stc_sendTransaction", [hexTx]).then(function (hash) {
        return hash;
      }, function (error) {
        if (error.responseText) {
          // See: JsonRpcProvider.sendTransaction (@TODO: Expose a ._throwError??)
          if (error.responseText.indexOf("insufficient funds") >= 0) {
            logger$6.throwError("insufficient funds", logger$9.Logger.errors.INSUFFICIENT_FUNDS, {
              transaction: tx
            });
          }

          if (error.responseText.indexOf("nonce too low") >= 0) {
            logger$6.throwError("nonce has already been used", logger$9.Logger.errors.NONCE_EXPIRED, {
              transaction: tx
            });
          }

          if (error.responseText.indexOf("replacement transaction underpriced") >= 0) {
            logger$6.throwError("replacement fee too low", logger$9.Logger.errors.REPLACEMENT_UNDERPRICED, {
              transaction: tx
            });
          }
        }

        throw error;
      });
    });
  };

  _proto.signTransaction = function signTransaction(transaction) {
    try {
      var _this6 = this;

      // eslint-disable-next-line no-param-reassign
      return Promise.resolve(properties$1.resolveProperties(transaction)).then(function (request) {
        return Promise.resolve(_this6.getAddress()).then(function (sender) {
          if (request.sender !== undefined) {
            if (request.sender !== sender) {
              logger$6.throwArgumentError('from address mismatch', 'transaction', transaction);
            }
          } else {
            request.sender = sender;
          }

          return _this6.provider.send('account.sign_txn_request', [request]).then(function (hexTxnData) {
            return hexTxnData;
          }, function (error) {
            return checkError('signTransaction', error, request);
          });
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  } // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  ;

  _proto.signMessage = function signMessage(message) {
    try {
      var _this8 = this;

      // return logger.throwError('signing message is unsupported', Logger.errors.UNSUPPORTED_OPERATION, {
      //  operation: 'signMessage'
      // });
      var provider = _this8.provider;
      return Promise.resolve(_this8.getAddress()).then(function (address) {
        var u8a;

        if (typeof message === 'string') {
          u8a = new Uint8Array(Buffer.from(message));
        } else if (bytes.isBytes(message)) {
          u8a = message;
        } else {
          return logger$6.throwError('type of message input is unsupported', logger$9.Logger.errors.UNSUPPORTED_OPERATION, {
            operation: 'signMessage'
          });
        }

        var msgArray = Array.from(u8a);
        var messageArg = {
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
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.unlock = function unlock(password) {
    try {
      var _this10 = this;

      var provider = _this10.provider;
      return Promise.resolve(_this10.getAddress()).then(function (address) {
        return provider.send('account.unlock', [address.toLowerCase(), password, undefined]);
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return JsonRpcSigner;
}(Signer); // class UncheckedJsonRpcSigner extends JsonRpcSigner {
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

var allowedTransactionKeys$1 = {
  chainId: true,
  data: true,
  functionAptos: true,
  gasLimit: true,
  gasPrice: true,
  nonce: true,
  to: true,
  value: true
};
var JsonRpcProvider = /*#__PURE__*/function (_BaseProvider) {
  _inheritsLoose(JsonRpcProvider, _BaseProvider);

  function JsonRpcProvider(url, network) {
    var _this11;

    logger$6.checkNew(this instanceof JsonRpcProvider ? this.constructor : void 0, JsonRpcProvider);
    var networkOrReady = network; // The network is unknown, query the JSON-RPC for it

    if (networkOrReady == null) {
      networkOrReady = new Promise(function (resolve, reject) {
        setTimeout(function () {
          _this11.detectNetwork().then(function (network) {
            resolve(network);
          }, function (error) {
            reject(error);
          });
        }, 0);
      });
    }

    _this11 = _BaseProvider.call(this, networkOrReady) || this; // Default URL

    if (!url) {
      url = properties$1.getStatic(_this11.constructor, 'defaultUrl')();
    }

    if (typeof url === 'string') {
      properties$1.defineReadOnly(_assertThisInitialized(_this11), 'connection', Object.freeze({
        url: url
      }));
    } else {
      properties$1.defineReadOnly(_assertThisInitialized(_this11), 'connection', Object.freeze(properties$1.shallowCopy(url)));
    }

    _this11._nextId = 42;
    return _this11;
  }

  JsonRpcProvider.defaultUrl = function defaultUrl() {
    return 'https://main-seed.starcoin.org';
  };

  var _proto2 = JsonRpcProvider.prototype;

  _proto2.detectNetwork = function detectNetwork() {
    try {
      var _this13 = this;

      return Promise.resolve(timer(0)).then(function () {
        function _temp3() {
          if (chainId != null) {
            try {
              var isAptos = _this13.isAptos();

              return getNetwork(bignumber.BigNumber.from(chainId).toNumber(), isAptos);
            } catch (error) {
              return logger$6.throwError('could not detect network', logger$9.Logger.errors.NETWORK_ERROR, {
                chainId: chainId,
                event: 'invalidNetwork',
                serverError: error
              });
            }
          }

          return logger$6.throwError('could not detect network', logger$9.Logger.errors.NETWORK_ERROR, {
            event: 'noNetwork'
          });
        }

        var chainId = null;

        var _temp2 = _catch$1(function () {
          return Promise.resolve(_this13.send('chain.id', [])).then(function (resp) {
            chainId = resp.id;
          });
        }, function () {
          var _temp = _catch$1(function () {
            return Promise.resolve(_this13.perform(RPC_ACTION.getChainInfo, null)).then(function (chainInfo) {
              chainId = chainInfo.chain_id; // eslint-disable-next-line no-empty
            });
          }, function () {});

          return _temp && _temp.then ? _temp.then(function () {}) : void 0;
        });

        return _temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2);
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.getSigner = function getSigner(addressOrIndex) {
    return new JsonRpcSigner(_constructorGuard, this, addressOrIndex);
  } // getUncheckedSigner(addressOrIndex?: string | number): UncheckedJsonRpcSigner {
  //   return this.getSigner(addressOrIndex).connectUnchecked();
  // }
  ;

  _proto2.getNowSeconds = function getNowSeconds() {
    try {
      var _this15 = this;

      return Promise.resolve(_this15.perform(RPC_ACTION.getNodeInfo, null)).then(function (nodeInfo) {
        return nodeInfo.now_seconds;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2.isAptos = function isAptos() {
    return /aptoslabs\.com/.test(this.connection.url);
  };

  _proto2.send = function send(method, params) {
    var _this16 = this;

    var isAptos = this.isAptos(); // most aptos Rest APIs used in Dapp's injected window.starcoin is GET

    if (isAptos) {
      var _request = null;
      var fetchUrl = this.connection.url; // default for chain.id, chain.info

      if (method === 'state.list_resource' || method === 'getAccountResources') {
        fetchUrl = fetchUrl + "accounts/" + params[0] + "/resources";
      }

      if (method === 'getAccount') {
        fetchUrl = fetchUrl + "accounts/" + params[0];
      }

      if (method === 'getAccountResource') {
        fetchUrl = fetchUrl + "accounts/" + params[0] + "/resource/" + encodeURI(params[1]);
      }

      if (method === 'chain.get_transaction_info') {
        fetchUrl = fetchUrl + "transactions/by_hash/" + params[0];
      }

      return web.fetchJson(fetchUrl).then(function (data) {
        console.log({
          data: data
        });

        _this16.emit('debug', {
          action: 'response',
          request: _request,
          response: data,
          provider: _this16
        });

        var result;

        switch (method) {
          case 'chain.id':
            var network = _this16.connection.url.split('.')[1];

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
      }, function (error) {
        _this16.emit('debug', {
          action: 'response',
          error: error,
          request: _request,
          provider: _this16
        });

        throw error;
      });
    } // starcoin


    var request = {
      method: method,
      params: params,
      id: this._nextId++,
      jsonrpc: '2.0'
    };
    this.emit('debug', {
      action: 'request',
      request: properties$1.deepCopy(request),
      provider: this
    });
    return web.fetchJson(this.connection, JSON.stringify(request), getResult).then(function (result) {
      _this16.emit('debug', {
        action: 'response',
        request: request,
        response: result,
        provider: _this16
      });

      return result;
    }, function (error) {
      _this16.emit('debug', {
        action: 'response',
        error: error,
        request: request,
        provider: _this16
      });

      throw error;
    });
  } // eslint-disable-next-line consistent-return
  ;

  _proto2.prepareRequest = function prepareRequest(method, params) {
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
  };

  _proto2.perform = function perform(method, params) {
    try {
      var _this18 = this;

      var args = _this18.prepareRequest(method, params);

      if (args === undefined) {
        logger$6.throwError(method + " not implemented", logger$9.Logger.errors.NOT_IMPLEMENTED, {
          operation: method
        });
      }

      return Promise.resolve(_catch$1(function () {
        return Promise.resolve(_this18.send(args[0], args[1]));
      }, function (error) {
        return checkError(method, error, params);
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto2._startEvent = function _startEvent(event) {
    if (event.tag === 'pending') {
      // this._startPending();
      logger$6.throwError('pending event not implemented', logger$9.Logger.errors.NOT_IMPLEMENTED, {
        operation: 'pending event'
      });
    }

    _BaseProvider.prototype._startEvent.call(this, event);
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
  ;

  _proto2._stopEvent = function _stopEvent(event) {
    if (event.tag === CONSTANTS.pending && this.listenerCount(CONSTANTS.pending) === 0) {
      this._pendingFilter = null;
    }

    _BaseProvider.prototype._stopEvent.call(this, event);
  } // Convert an ethers.js transaction into a JSON-RPC transaction
  //  - gasLimit => gas
  //  - All values hexlified
  //  - All numeric values zero-striped
  //  - All addresses are lowercased
  // NOTE: This allows a TransactionRequest, but all values should be resolved
  //       before this is called
  // @TODO: This will likely be removed in future versions and prepareRequest
  //        will be the preferred method for this.
  ;

  JsonRpcProvider.hexlifyTransaction = function hexlifyTransaction(transaction, allowExtra) {
    // Check only allowed properties are given
    var allowed = properties$1.shallowCopy(allowedTransactionKeys$1);

    if (allowExtra) {
      for (var key in allowExtra) {
        if (allowExtra[key]) {
          allowed[key] = true;
        }
      }
    }

    checkProperties(transaction, allowed);
    var result = {}; // Some nodes (INFURA ropsten; INFURA mainnet is fine) do not like leading zeros.

    ["gasLimit", "gasPrice", "nonce", "value", "expiredSecs"].forEach(function (key) {
      if (transaction[key] == null) {
        return;
      }

      var value = bytes.hexValue(transaction[key]);

      if (key === "gasLimit") {
        key = "gas";
      }

      result[key] = value;
    });
    ["from", "to", "data"].forEach(function (key) {
      if (transaction[key] == null) {
        return;
      }

      result[key] = bytes.hexlify(transaction[key]);
    });
    ["functionAptos"].forEach(function (key) {
      if (transaction[key] == null) {
        return;
      }

      result[key] = transaction[key];
    });
    return result;
  };

  return JsonRpcProvider;
}(BaseProvider);

/* eslint-disable @typescript-eslint/no-explicit-any */
var encodeScriptFunctionByResolve = function encodeScriptFunctionByResolve(functionId, typeArgs, args, nodeUrl) {
  try {
    var tyArgs = encodeStructTypeTags(typeArgs);
    var provider = new JsonRpcProvider(nodeUrl);
    return Promise.resolve(provider.send('contract.resolve_function', [functionId])).then(function (_ref) {
      var argsType = _ref.args;

      // Remove the first Signer type
      if (argsType[0] && argsType[0].type_tag === 'Signer') {
        argsType.shift();
      }

      var argsBytes = encodeScriptFunctionArgs(argsType, args);
      return encodeScriptFunction(functionId, tyArgs, argsBytes);
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var signRawUserTransaction = function signRawUserTransaction(senderPrivateKey, rawUserTransaction) {
  try {
    return Promise.resolve(getSignedUserTransaction(senderPrivateKey, rawUserTransaction)).then(function (signedUserTransaction) {
      // Step 4: get SignedUserTransaction Hex
      var hex = getSignedUserTransactionHex(signedUserTransaction);
      return hex;
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var getSignedUserTransaction = function getSignedUserTransaction(senderPrivateKey, rawUserTransaction) {
  try {
    // Step 2: generate signature of RawUserTransaction
    return Promise.resolve(getSignatureHex(rawUserTransaction, senderPrivateKey)).then(function (signatureHex) {
      // Step 3: generate SignedUserTransaction
      return Promise.resolve(generateSignedUserTransaction(senderPrivateKey, signatureHex, rawUserTransaction));
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var generateSignedUserTransaction = function generateSignedUserTransaction(senderPrivateKey, signatureHex, rawUserTransaction) {
  try {
    return Promise.resolve(ed.getPublicKey(ethereumjsUtil.stripHexPrefix(senderPrivateKey))).then(function (senderPublicKeyMissingPrefix) {
      var signedUserTransaction = signTxn(senderPublicKeyMissingPrefix, signatureHex, rawUserTransaction);
      return Promise.resolve(signedUserTransaction);
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var getSignatureHex = function getSignatureHex(rawUserTransaction, senderPrivateKey) {
  try {
    var hasher = createRawUserTransactionHasher();
    var hashSeedBytes = hasher.get_salt();

    var rawUserTransactionBytes = function () {
      var se = new BcsSerializer();
      rawUserTransaction.serialize(se);
      return se.getBytes();
    }();

    var msgBytes = function (a, b) {
      var tmp = new Uint8Array(a.length + b.length);
      tmp.set(a, 0);
      tmp.set(b, a.length);
      return tmp;
    }(hashSeedBytes, rawUserTransactionBytes);

    return Promise.resolve(ed.sign(msgBytes, ethereumjsUtil.stripHexPrefix(senderPrivateKey))).then(function (signatureBytes) {
      var signatureHex = bytes.hexlify(signatureBytes);
      return signatureHex;
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
function encodeTransactionScript(code, ty_args, args) {
  var script = new Script(code, ty_args.map(function (t) {
    return typeTagToSCS(t);
  }), args.map(function (t) {
    return bytes.arrayify(t);
  }));
  return new TransactionPayloadVariantScript(script);
}
function encodeStarcoinTypesScriptFunction(functionId, tyArgs, args) {
  var funcId = parseFunctionId(functionId);
  var scriptFunction = new ScriptFunction(new ModuleId(addressToSCS(funcId.address), new Identifier(funcId.module)), new Identifier(funcId.functionName), tyArgs.map(function (t) {
    return typeTagToSCS(t);
  }), args);
  return scriptFunction;
}
function encodeScriptFunction(functionId, tyArgs, args) {
  var scriptFunction = encodeStarcoinTypesScriptFunction(functionId, tyArgs, args);
  return new TransactionPayloadVariantScriptFunction(scriptFunction);
}
function encodeStarcoinTypesPackage(moduleAddress, moduleCodes, initScriptFunction) {
  var modules = moduleCodes.map(function (m) {
    return new Module(bytes.arrayify(m));
  });
  var scriptFunction = null;

  if (!!initScriptFunction) {
    scriptFunction = encodeStarcoinTypesScriptFunction(initScriptFunction.functionId, initScriptFunction.tyArgs, initScriptFunction.args);
  }

  var packageData = new Package(addressToSCS(moduleAddress), modules, scriptFunction);
  return packageData;
}
function encodePackage(moduleAddress, moduleCodes, initScriptFunction) {
  var packageData = encodeStarcoinTypesPackage(moduleAddress, moduleCodes, initScriptFunction);
  return new TransactionPayloadVariantPackage(packageData);
} // Step 1: generate RawUserTransaction

function generateRawUserTransaction(senderAddress, payload, maxGasAmount, gasUnitPrice, senderSequenceNumber, expirationTimestampSecs, chainId) {
  // Step 1-2: generate RawUserTransaction
  var sender = addressToSCS(senderAddress);
  var sequence_number = BigInt(senderSequenceNumber);
  var max_gas_amount = BigInt(maxGasAmount);
  var gas_unit_price = BigInt(gasUnitPrice);
  var gas_token_code = '0x1::STC::STC';
  var expiration_timestamp_secs = BigInt(expirationTimestampSecs);
  var chain_id = new ChainId(chainId);
  var rawUserTransaction = new RawUserTransaction(sender, sequence_number, payload, max_gas_amount, gas_unit_price, gas_token_code, expiration_timestamp_secs, chain_id);
  return rawUserTransaction;
}
function signTxn(senderPublicKey, signatureHex, rawUserTransaction) {
  // Step 3-1: generate authenticator
  var public_key = new Ed25519PublicKey(bytes.arrayify(ethereumjsUtil.addHexPrefix(senderPublicKey)));
  var signature = new Ed25519Signature(bytes.arrayify(ethereumjsUtil.addHexPrefix(signatureHex)));
  var transactionAuthenticatorVariantEd25519 = new TransactionAuthenticatorVariantEd25519(public_key, signature); // Step 3-2: generate SignedUserTransaction

  var signedUserTransaction = new SignedUserTransaction(rawUserTransaction, transactionAuthenticatorVariantEd25519);
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
  var se = new BcsSerializer();
  signedUserTransaction.serialize(se);
  return bytes.hexlify(se.getBytes());
}

function encodeStructTypeTag(str) {
  var arr = str.split('<');
  var arr1 = arr[0].split('::');
  var address = arr1[0];
  var module = arr1[1];
  var name = arr1[2];
  var params = arr[1] ? arr[1].replace('>', '').split(',') : []; // eslint-disable-next-line @typescript-eslint/naming-convention

  var type_params = [];

  if (params.length > 0) {
    params.forEach(function (param) {
      type_params.push(encodeStructTypeTag(param.trim()));
    });
  }

  var result = {
    Struct: {
      address: address,
      module: module,
      name: name,
      type_params: type_params
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
  return typeArgsString.map(function (str) {
    return encodeStructTypeTag(str);
  });
}

function serializeWithType(value, type) {
  if (type === 'Address') return bytes.arrayify(value);
  var se = new BcsSerializer();

  if (type && type.Vector === 'U8') {
    var valueBytes = value ? bytes.isHexString(ethereumjsUtil.addHexPrefix(value)) ? fromHexString(value) : new Uint8Array(Buffer.from(value)) : new Uint8Array();
    var length = valueBytes.length;
    var list = [];

    for (var i = 0; i < length; i++) {
      list.push(valueBytes[i]);
    }

    Helpers.serializeVectorU8(list, se);
    var hex = bytes.hexlify(se.getBytes());
    return bytes.arrayify(hex);
  }

  if (type && type.Vector && Array.isArray(value)) {
    se.serializeLen(value.length);
    value.forEach(function (sub) {
      // array of string: vector<vector<u8>>
      if (type.Vector.Vector === 'U8') {
        se.serializeBytes(fromHexString(sub));
      } else if (type.Vector === 'Address') {
        var accountAddress = addressToSCS(sub);
        accountAddress.serialize(se);
      } else if (type.Vector) {
        // array of other types: vector<u8>
        se["serialize" + type.Vector](sub);
      }
    });

    var _hex = bytes.hexlify(se.getBytes());

    return bytes.arrayify(_hex);
  } // For normal data type


  if (type) {
    se["serialize" + type](value);

    var _hex2 = bytes.hexlify(se.getBytes());

    return bytes.arrayify(_hex2);
  }

  return value;
}

function encodeScriptFunctionArgs(argsType, args) {
  return args.map(function (value, index) {
    return serializeWithType(value, argsType[index].type_tag);
  });
}

var tx = {
  __proto__: null,
  encodeScriptFunctionByResolve: encodeScriptFunctionByResolve,
  signRawUserTransaction: signRawUserTransaction,
  getSignedUserTransaction: getSignedUserTransaction,
  getSignatureHex: getSignatureHex,
  encodeTransactionScript: encodeTransactionScript,
  encodeStarcoinTypesScriptFunction: encodeStarcoinTypesScriptFunction,
  encodeScriptFunction: encodeScriptFunction,
  encodeStarcoinTypesPackage: encodeStarcoinTypesPackage,
  encodePackage: encodePackage,
  generateRawUserTransaction: generateRawUserTransaction,
  signTxn: signTxn,
  encodeStructTypeTags: encodeStructTypeTags,
  encodeScriptFunctionArgs: encodeScriptFunctionArgs
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

var generateMultiEd25519SignatureShard = function generateMultiEd25519SignatureShard(multiEd25519KeyShard, rawUserTransaction) {
  try {
    return Promise.resolve(generateMultiEd25519Signature(multiEd25519KeyShard, rawUserTransaction)).then(function (multiEd25519Signature) {
      var multiEd25519SignatureShard = new MultiEd25519SignatureShard(multiEd25519Signature, multiEd25519KeyShard.threshold);
      return Promise.resolve(multiEd25519SignatureShard);
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var generateMultiEd25519Signature = function generateMultiEd25519Signature(multiEd25519KeyShard, rawUserTransaction) {
  try {
    return Promise.resolve(Promise.all(Object.keys(multiEd25519KeyShard.private_keys).map(function (k) {
      var privateKey = bytes.hexlify(multiEd25519KeyShard.private_keys[k].value);
      return getSignatureHex(rawUserTransaction, privateKey).then(function (signatureHex) {
        var signature = new Ed25519Signature(bytes.arrayify(signatureHex));
        var pos = Number.parseInt(k, 10);
        return [signature, pos];
      })["catch"](function (error) {
        throw new Error("invalid private key: " + error);
      });
    }))).then(function (signatures) {
      var multiEd25519Signature = MultiEd25519Signature.build(signatures);
      return Promise.resolve(multiEd25519Signature);
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
var generateMultiEd25519KeyShard = function generateMultiEd25519KeyShard(originPublicKeys, originPrivateKeys, thresHold) {
  try {
    if (originPrivateKeys.length === 0) {
      throw new Error('require at least one private key');
    }

    var publicKeys = lodash.cloneDeep(originPublicKeys);
    var pubPrivMap = {}; // 1. merge privateKeys' publicKey into publicKeys
    // 2. generate pub->priv map

    return Promise.resolve(Promise.all(originPrivateKeys.map(function (priv) {
      return privateKeyToPublicKey(priv).then(function (pub) {
        publicKeys.push(pub);
        pubPrivMap[pub] = priv;
        return pub;
      })["catch"](function (error) {
        throw new Error("invalid private key: " + error);
      });
    }))).then(function () {
      // 3. sort all public keys by its bytes in asc order to make sure same public key set always generate same auth key.
      publicKeys.sort(function (a, b) {
        return a > b ? 1 : -1;
      }); // 4. remove repeat public keys, if use add repeat public_key or private key.

      var uniquePublicKeys = publicKeys.filter(function (v, i, a) {
        return a.indexOf(v) === i;
      }); // 5. generate pos_verified_private_keys

      var pos_verified_private_keys = {};
      return Promise.resolve(Promise.all(originPrivateKeys.map(function (priv) {
        return privateKeyToPublicKey(priv).then(function (pub) {
          var idx = uniquePublicKeys.indexOf(pub);

          if (idx > -1) {
            pos_verified_private_keys[idx] = new Ed25519PrivateKey(bytes.arrayify(priv));
          }

          return pub;
        })["catch"](function (error) {
          throw new Error("invalid private key: " + error);
        });
      }))).then(function () {
        var public_keys = uniquePublicKeys.map(function (pub) {
          return new Ed25519PublicKey(bytes.arrayify(pub));
        });
        var shard = new MultiEd25519KeyShard(public_keys, thresHold, pos_verified_private_keys);
        return Promise.resolve(shard);
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

var multiSign = {
  __proto__: null,
  generateMultiEd25519SignatureShard: generateMultiEd25519SignatureShard,
  generateMultiEd25519Signature: generateMultiEd25519Signature,
  generateMultiEd25519KeyShard: generateMultiEd25519KeyShard
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

var logger$7 = new logger$9.Logger(version);
var NextId = 1;

function buildWeb3LegacyFetcher(provider, sendFunc) {
  return function (method, params) {
    NextId += 1;
    var request = {
      method: method,
      params: params,
      id: NextId,
      jsonrpc: "2.0"
    };
    return new Promise(function (resolve, reject) {
      sendFunc(request, function (error, result) {
        if (error) {
          return reject(error);
        }

        if (result.error) {
          var _error = new Error(result.error.message);

          _error.code = result.error.code;
          _error.data = result.error.data;
          return reject(_error);
        }

        resolve(result.result);
      });
    });
  };
}

var Web3Provider = /*#__PURE__*/function (_JsonRpcProvider) {
  _inheritsLoose(Web3Provider, _JsonRpcProvider);

  function Web3Provider(provider, network) {
    var _this;

    logger$7.checkNew(this instanceof Web3Provider ? this.constructor : void 0, Web3Provider);

    if (provider === undefined) {
      logger$7.throwArgumentError("missing provider", "provider", provider);
    }

    var path;
    var jsonRpcFetchFunc;
    var subprovider;

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

    _this = _JsonRpcProvider.call(this, path, network) || this;
    properties$1.defineReadOnly(_assertThisInitialized(_this), "jsonRpcFetchFunc", jsonRpcFetchFunc);
    properties$1.defineReadOnly(_assertThisInitialized(_this), "provider", subprovider);
    return _this;
  }

  var _proto = Web3Provider.prototype;

  _proto.send = function send(method, params) {
    return this.jsonRpcFetchFunc(method, params);
  };

  return Web3Provider;
}(JsonRpcProvider);

var logger$8 = new logger$9.Logger(version);
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

var NextId$1 = 1; // For more info about the Real-time Event API see:
//   https://geth.ethereum.org/docs/rpc/pubsub

var WebsocketProvider = /*#__PURE__*/function (_JsonRpcProvider) {
  _inheritsLoose(WebsocketProvider, _JsonRpcProvider);

  function WebsocketProvider(url, network) {
    var _this;

    // This will be added in the future; please open an issue to expedite
    if (network === 'any') {
      logger$8.throwError("WebSocketProvider does not support 'any' network yet", logger$9.Logger.errors.UNSUPPORTED_OPERATION, {
        operation: 'network:any'
      });
    }

    _this = _JsonRpcProvider.call(this, url, network) || this;
    _this._pollingInterval = -1;
    _this._wsReady = false;
    properties$1.defineReadOnly(_assertThisInitialized(_this), '_websocket', new WebSocket(_this.connection.url));
    properties$1.defineReadOnly(_assertThisInitialized(_this), '_requests', {});
    properties$1.defineReadOnly(_assertThisInitialized(_this), '_subs', {});
    properties$1.defineReadOnly(_assertThisInitialized(_this), '_subIds', {});
    properties$1.defineReadOnly(_assertThisInitialized(_this), '_detectNetwork', _JsonRpcProvider.prototype.detectNetwork.call(_assertThisInitialized(_this))); // Stall sending requests until the socket is open...

    _this._websocket.onopen = function () {
      _this._wsReady = true;
      Object.keys(_this._requests).forEach(function (id) {
        _this._websocket.send(_this._requests[id].payload);
      });
    };

    _this._websocket.onmessage = function (messageEvent) {
      var data = messageEvent.data;
      var result = JSON.parse(data);

      if (result.id != null) {
        var id = String(result.id);
        var request = _this._requests[id];
        delete _this._requests[id];

        if (result.result !== undefined) {
          request.callback(null, result.result);

          _this.emit('debug', {
            action: 'response',
            request: JSON.parse(request.payload),
            response: result.result,
            provider: _assertThisInitialized(_this)
          });
        } else {
          var error;

          if (result.error) {
            error = new Error(result.error.message || 'unknown error');
            properties$1.defineReadOnly(error, 'code', result.error.code || null);
            properties$1.defineReadOnly(error, 'response', data);
          } else {
            error = new Error('unknown error');
          }

          request.callback(error, undefined);

          _this.emit('debug', {
            action: 'response',
            error: error,
            request: JSON.parse(request.payload),
            provider: _assertThisInitialized(_this)
          });
        }
      } else if (result.method === 'starcoin_subscription') {
        // Subscription...
        var sub = _this._subs[result.params.subscription];

        if (sub) {
          sub.processFunc(result.params.result);
        }
      } else {
        console.warn('this should not happen');
      }
    }; // This Provider does not actually poll, but we want to trigger
    // poll events for things that depend on them (like stalling for
    // block and transaction lookups)


    var fauxPoll = setInterval(function () {
      _this.emit('poll');
    }, 1000);

    if (fauxPoll.unref) {
      fauxPoll.unref();
    }

    return _this;
  }

  var _proto = WebsocketProvider.prototype;

  _proto.detectNetwork = function detectNetwork() {
    return this._detectNetwork;
  };

  _proto.poll = function poll() {
    return Promise.resolve(null);
  };

  _proto.send = function send(method, params) {
    var _this2 = this;

    var rid = NextId$1++;
    return new Promise(function (resolve, reject) {
      function callback(error, result) {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      }

      var payload = JSON.stringify({
        method: method,
        params: params,
        id: rid,
        jsonrpc: '2.0'
      });

      _this2.emit('debug', {
        action: 'request',
        request: JSON.parse(payload),
        provider: _this2
      });

      _this2._requests[String(rid)] = {
        callback: callback,
        payload: payload
      };

      if (_this2._wsReady) {
        _this2._websocket.send(payload);
      }
    });
  };

  WebsocketProvider.defaultUrl = function defaultUrl() {
    return 'ws://localhost:9870';
  };

  _proto._subscribe = function _subscribe(tag, param, processFunc) {
    try {
      var _this4 = this;

      var subIdPromise = _this4._subIds[tag];

      if (subIdPromise == null) {
        subIdPromise = Promise.all(param).then(function (param) {
          return _this4.send('starcoin_subscribe', param);
        });
        _this4._subIds[tag] = subIdPromise;
      }

      return Promise.resolve(subIdPromise).then(function (subId) {
        _this4._subs[subId] = {
          tag: tag,
          processFunc: processFunc
        };
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto._startEvent = function _startEvent(event) {
    var _this5 = this;

    switch (event.type) {
      case CONSTANTS.block:
        this._subscribe(CONSTANTS.block, [{
          type_name: 'newHeads'
        }], function (result) {
          // FIXME
          var blockNumber = _this5.formatter.u64(result.header.number); // const blockNumber = BigNumber.from(result.header.number).toNumber();


          _this5._emitted.block = blockNumber;

          _this5.emit(CONSTANTS.block, blockNumber);
        });

        break;

      case CONSTANTS.pending:
        this._subscribe(CONSTANTS.pending, [{
          type_name: 'newPendingTransactions'
        }], function (result) {
          _this5.emit(CONSTANTS.pending, result);
        });

        break;

      case CONSTANTS.filter:
        this._subscribe(event.tag, [{
          type_name: 'events'
        }, event.filter], function (result) {
          _this5.emit(event.filter, _this5.formatter.transactionEvent(result));
        });

        break;

      case CONSTANTS.tx:
        {
          var emitTxnInfo = function emitTxnInfo(event) {
            var hash = event.hash;

            _this5.getTransactionInfo(hash).then(function (txnInfo) {
              if (!txnInfo) {
                return;
              }

              _this5.emit(hash, txnInfo);
            });
          }; // In case it is already mined


          emitTxnInfo(event); // To keep things simple, we start up a single newHeads subscription
          // to keep an eye out for transactions we are watching for.
          // Starting a subscription for an event (i.e. "tx") that is already
          // running is (basically) a nop.

          this._subscribe(CONSTANTS.tx, [{
            type_name: 'newHeads'
          }], function (result) {
            _this5._events.filter(function (e) {
              return e.type === CONSTANTS.tx;
            }).forEach(emitTxnInfo);
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
  };

  _proto._stopEvent = function _stopEvent(event) {
    var _this6 = this;

    var tag = event.tag;

    if (event.type === CONSTANTS.tx) {
      // There are remaining transaction event listeners
      if (this._events.filter(function (e) {
        return e.type === CONSTANTS.tx;
      }).length) {
        return;
      }

      tag = CONSTANTS.tx;
    } else if (this.listenerCount(event.event)) {
      // There are remaining event listeners
      return;
    }

    var subId = this._subIds[tag];

    if (!subId) {
      return;
    }

    delete this._subIds[tag];
    subId.then(function (subId) {
      if (!_this6._subs[subId]) {
        return;
      }

      delete _this6._subs[subId];

      _this6.send('starcoin_unsubscribe', [subId]);
    });
  };

  _proto.destroy = function destroy() {
    try {
      var _this8 = this;

      var _temp3 = function _temp3() {
        // Hangup
        // See: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
        _this8._websocket.close(1000);
      };

      var _temp4 = function () {
        if (_this8._websocket.readyState === WebSocket.CONNECTING) {
          return Promise.resolve(new Promise(function (resolve) {
            _this8._websocket.onopen = function () {
              resolve(true);
            };

            _this8._websocket.onerror = function () {
              resolve(false);
            };
          })).then(function () {});
        }
      }();

      // Wait until we have connected before trying to disconnect
      return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _createClass(WebsocketProvider, [{
    key: "pollingInterval",
    get: function get() {
      return 0;
    },
    set: function set(value) {
      logger$8.throwError('cannot set polling interval on WebSocketProvider', logger$9.Logger.errors.UNSUPPORTED_OPERATION, {
        operation: 'setPollingInterval'
      });
    }
  }, {
    key: "polling",
    set: function set(value) {
      if (!value) {
        return;
      }

      logger$8.throwError('cannot set polling on WebSocketProvider', logger$9.Logger.errors.UNSUPPORTED_OPERATION, {
        operation: 'setPolling'
      });
    }
  }]);

  return WebsocketProvider;
}(JsonRpcProvider);



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

var AcceptTokenEvent = /*#__PURE__*/function () {
  function AcceptTokenEvent(token_code) {
    this.token_code = token_code;
  }

  var _proto = AcceptTokenEvent.prototype;

  _proto.serialize = function serialize(serializer) {
    this.token_code.serialize(serializer);
  };

  AcceptTokenEvent.deserialize = function deserialize(deserializer) {
    var token_code = TokenCode.deserialize(deserializer);
    return new AcceptTokenEvent(token_code);
  };

  return AcceptTokenEvent;
}();
var AccountAddress$1 = /*#__PURE__*/function () {
  function AccountAddress(value) {
    this.value = value;
  }

  var _proto2 = AccountAddress.prototype;

  _proto2.serialize = function serialize(serializer) {
    Helpers$1.serializeArray16U8Array(this.value, serializer);
  };

  AccountAddress.deserialize = function deserialize(deserializer) {
    var value = Helpers$1.deserializeArray16U8Array(deserializer);
    return new AccountAddress(value);
  };

  return AccountAddress;
}();
var BlockRewardEvent = /*#__PURE__*/function () {
  function BlockRewardEvent(block_number, block_reward, gas_fees, miner) {
    this.block_number = block_number;
    this.block_reward = block_reward;
    this.gas_fees = gas_fees;
    this.miner = miner;
  }

  var _proto3 = BlockRewardEvent.prototype;

  _proto3.serialize = function serialize(serializer) {
    serializer.serializeU64(this.block_number);
    serializer.serializeU128(this.block_reward);
    serializer.serializeU128(this.gas_fees);
    this.miner.serialize(serializer);
  };

  BlockRewardEvent.deserialize = function deserialize(deserializer) {
    var block_number = deserializer.deserializeU64();
    var block_reward = deserializer.deserializeU128();
    var gas_fees = deserializer.deserializeU128();
    var miner = AccountAddress$1.deserialize(deserializer);
    return new BlockRewardEvent(block_number, block_reward, gas_fees, miner);
  };

  return BlockRewardEvent;
}();
var BurnEvent = /*#__PURE__*/function () {
  function BurnEvent(amount, token_code) {
    this.amount = amount;
    this.token_code = token_code;
  }

  var _proto4 = BurnEvent.prototype;

  _proto4.serialize = function serialize(serializer) {
    serializer.serializeU128(this.amount);
    this.token_code.serialize(serializer);
  };

  BurnEvent.deserialize = function deserialize(deserializer) {
    var amount = deserializer.deserializeU128();
    var token_code = TokenCode.deserialize(deserializer);
    return new BurnEvent(amount, token_code);
  };

  return BurnEvent;
}();
var DepositEvent = /*#__PURE__*/function () {
  function DepositEvent(amount, token_code, metadata) {
    this.amount = amount;
    this.token_code = token_code;
    this.metadata = metadata;
  }

  var _proto5 = DepositEvent.prototype;

  _proto5.serialize = function serialize(serializer) {
    serializer.serializeU128(this.amount);
    this.token_code.serialize(serializer);
    Helpers$1.serializeVectorU8(this.metadata, serializer);
  };

  DepositEvent.deserialize = function deserialize(deserializer) {
    var amount = deserializer.deserializeU128();
    var token_code = TokenCode.deserialize(deserializer);
    var metadata = Helpers$1.deserializeVectorU8(deserializer);
    return new DepositEvent(amount, token_code, metadata);
  };

  return DepositEvent;
}();
var MintEvent = /*#__PURE__*/function () {
  function MintEvent(amount, token_code) {
    this.amount = amount;
    this.token_code = token_code;
  }

  var _proto6 = MintEvent.prototype;

  _proto6.serialize = function serialize(serializer) {
    serializer.serializeU128(this.amount);
    this.token_code.serialize(serializer);
  };

  MintEvent.deserialize = function deserialize(deserializer) {
    var amount = deserializer.deserializeU128();
    var token_code = TokenCode.deserialize(deserializer);
    return new MintEvent(amount, token_code);
  };

  return MintEvent;
}();
var NewBlockEvent = /*#__PURE__*/function () {
  function NewBlockEvent(number, author, timestamp, uncles) {
    this.number = number;
    this.author = author;
    this.timestamp = timestamp;
    this.uncles = uncles;
  }

  var _proto7 = NewBlockEvent.prototype;

  _proto7.serialize = function serialize(serializer) {
    serializer.serializeU64(this.number);
    this.author.serialize(serializer);
    serializer.serializeU64(this.timestamp);
    serializer.serializeU64(this.uncles);
  };

  NewBlockEvent.deserialize = function deserialize(deserializer) {
    var number = deserializer.deserializeU64();
    var author = AccountAddress$1.deserialize(deserializer);
    var timestamp = deserializer.deserializeU64();
    var uncles = deserializer.deserializeU64();
    return new NewBlockEvent(number, author, timestamp, uncles);
  };

  return NewBlockEvent;
}();
var ProposalCreatedEvent = /*#__PURE__*/function () {
  function ProposalCreatedEvent(proposal_id, proposer) {
    this.proposal_id = proposal_id;
    this.proposer = proposer;
  }

  var _proto8 = ProposalCreatedEvent.prototype;

  _proto8.serialize = function serialize(serializer) {
    serializer.serializeU64(this.proposal_id);
    this.proposer.serialize(serializer);
  };

  ProposalCreatedEvent.deserialize = function deserialize(deserializer) {
    var proposal_id = deserializer.deserializeU64();
    var proposer = AccountAddress$1.deserialize(deserializer);
    return new ProposalCreatedEvent(proposal_id, proposer);
  };

  return ProposalCreatedEvent;
}();
var TokenCode = /*#__PURE__*/function () {
  function TokenCode(address, module, name) {
    this.address = address;
    this.module = module;
    this.name = name;
  }

  var _proto9 = TokenCode.prototype;

  _proto9.serialize = function serialize(serializer) {
    this.address.serialize(serializer);
    serializer.serializeStr(this.module);
    serializer.serializeStr(this.name);
  };

  TokenCode.deserialize = function deserialize(deserializer) {
    var address = AccountAddress$1.deserialize(deserializer);
    var module = deserializer.deserializeStr();
    var name = deserializer.deserializeStr();
    return new TokenCode(address, module, name);
  };

  return TokenCode;
}();
var VoteChangedEvent = /*#__PURE__*/function () {
  function VoteChangedEvent(proposal_id, proposer, voter, agree, vote) {
    this.proposal_id = proposal_id;
    this.proposer = proposer;
    this.voter = voter;
    this.agree = agree;
    this.vote = vote;
  }

  var _proto10 = VoteChangedEvent.prototype;

  _proto10.serialize = function serialize(serializer) {
    serializer.serializeU64(this.proposal_id);
    this.proposer.serialize(serializer);
    this.voter.serialize(serializer);
    serializer.serializeBool(this.agree);
    serializer.serializeU128(this.vote);
  };

  VoteChangedEvent.deserialize = function deserialize(deserializer) {
    var proposal_id = deserializer.deserializeU64();
    var proposer = AccountAddress$1.deserialize(deserializer);
    var voter = AccountAddress$1.deserialize(deserializer);
    var agree = deserializer.deserializeBool();
    var vote = deserializer.deserializeU128();
    return new VoteChangedEvent(proposal_id, proposer, voter, agree, vote);
  };

  return VoteChangedEvent;
}();
var WithdrawEvent = /*#__PURE__*/function () {
  function WithdrawEvent(amount, token_code, metadata) {
    this.amount = amount;
    this.token_code = token_code;
    this.metadata = metadata;
  }

  var _proto11 = WithdrawEvent.prototype;

  _proto11.serialize = function serialize(serializer) {
    serializer.serializeU128(this.amount);
    this.token_code.serialize(serializer);
    Helpers$1.serializeVectorU8(this.metadata, serializer);
  };

  WithdrawEvent.deserialize = function deserialize(deserializer) {
    var amount = deserializer.deserializeU128();
    var token_code = TokenCode.deserialize(deserializer);
    var metadata = Helpers$1.deserializeVectorU8(deserializer);
    return new WithdrawEvent(amount, token_code, metadata);
  };

  return WithdrawEvent;
}();
var Helpers$1 = /*#__PURE__*/function () {
  function Helpers() {}

  Helpers.serializeArray16U8Array = function serializeArray16U8Array(value, serializer) {
    value.forEach(function (item) {
      serializer.serializeU8(item[0]);
    });
  };

  Helpers.deserializeArray16U8Array = function deserializeArray16U8Array(deserializer) {
    var list = [];

    for (var i = 0; i < 16; i++) {
      list.push([deserializer.deserializeU8()]);
    }

    return list;
  };

  Helpers.serializeVectorU8 = function serializeVectorU8(value, serializer) {
    serializer.serializeLen(value.length);
    value.forEach(function (item) {
      serializer.serializeU8(item);
    });
  };

  Helpers.deserializeVectorU8 = function deserializeVectorU8(deserializer) {
    var length = deserializer.deserializeLen();
    var list = [];

    for (var i = 0; i < length; i++) {
      list.push(deserializer.deserializeU8());
    }

    return list;
  };

  return Helpers;
}();

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

var ACCOUNT_ADDRESS_LENGTH = 16;
var EVENT_KEY_LENGTH = ACCOUNT_ADDRESS_LENGTH + 8;

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


function readBigInt64LE(data, offset) {
  if (offset === void 0) {
    offset = 0;
  }

  var first = data[offset];
  var last = data[offset + 7];
  var val = data[offset + 4] + data[offset + 5] * Math.pow(2, 8) + data[offset + 6] * Math.pow(2, 16) + (last << 24); // Overflow

  return (BigInt(val) << BigInt(32)) + BigInt(first + data[++offset] * Math.pow(2, 8) + data[++offset] * Math.pow(2, 16) + data[++offset] * Math.pow(2, 24));
} /// Decode a hex view or raw bytes of event key into parts.
/// EventKey is constructed by `Salt+AccountAddress`.


function decodeEventKey(eventKey) {
  var bytes$1 = bytes.arrayify(eventKey);

  if (bytes$1.byteLength !== EVENT_KEY_LENGTH) {
    throw new Error("invalid eventkey data, expect byte length to be " + EVENT_KEY_LENGTH + ", actual: " + bytes$1.byteLength);
  }

  var saltBytes = bytes$1.slice(0, EVENT_KEY_LENGTH - ACCOUNT_ADDRESS_LENGTH);
  var data = new Uint8Array(Buffer.from(saltBytes));
  var salt = readBigInt64LE(data);
  var addressBytes = bytes$1.slice(EVENT_KEY_LENGTH - ACCOUNT_ADDRESS_LENGTH);
  var address = toHexString(addressBytes);
  return {
    address: address,
    salt: salt
  };
}
function decodeEventData(eventName, eventData) {
  var eventType = onchain_events[eventName];
  var d = bcsDecode(eventType, eventData);
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

/**
 * Sign a VM2 raw user transaction and return the hex string.
 */
var signRawUserTransactionV2 = function signRawUserTransactionV2(senderPrivateKey, rawUserTransaction) {
  try {
    return Promise.resolve(getSignedUserTransactionV2(senderPrivateKey, rawUserTransaction)).then(function (signedUserTransaction) {
      var se = new BcsSerializer();
      signedUserTransaction.serialize(se);
      return bytes.hexlify(se.getBytes());
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Sign a VM2 raw user transaction and return the SignedUserTransaction object.
 */
var getSignedUserTransactionV2 = function getSignedUserTransactionV2(senderPrivateKey, rawUserTransaction) {
  try {
    return Promise.resolve(getSignatureHex(rawUserTransaction, senderPrivateKey)).then(function (signatureHex) {
      return Promise.resolve(ed.getPublicKey(ethereumjsUtil.stripHexPrefix(senderPrivateKey))).then(function (senderPublicKeyMissingPrefix) {
        return signTxn(senderPublicKeyMissingPrefix, signatureHex, rawUserTransaction);
      });
    });
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Encode a VM2 EntryFunction by resolving argument types from the chain.
 * Uses contract2.resolve_function RPC method for VM2.
 */
var encodeEntryFunctionByResolve = function encodeEntryFunctionByResolve(functionId, typeArgs, args, nodeUrl) {
  try {
    var tyArgs = encodeStructTypeTags(typeArgs);
    var provider = new JsonRpcProvider(nodeUrl);
    return Promise.resolve(provider.send('contract2.resolve_function', [functionId])).then(function (_ref) {
      var argsType = _ref.args;

      // Remove the first Signer type
      if (argsType[0] && argsType[0].type_tag === 'Signer') {
        argsType.shift();
      }

      var argsBytes = encodeScriptFunctionArgs(argsType, args);
      return encodeEntryFunction(functionId, tyArgs, argsBytes);
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
/**
 * Generate a RawUserTransaction for VM2.
 *
 * Identical BCS layout to VM1 — the struct fields are the same.
 * Alias provided for semantic clarity.
 */

function encodeEntryFunction(functionId, tyArgs, args) {
  return encodeScriptFunction(functionId, tyArgs, args);
}
function generateRawUserTransactionV2(senderAddress, payload, maxGasAmount, gasUnitPrice, senderSequenceNumber, expirationTimestampSecs, chainId) {
  return generateRawUserTransaction(senderAddress, payload, maxGasAmount, gasUnitPrice, senderSequenceNumber, expirationTimestampSecs, chainId);
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
var VM2_RPC_METHODS = {
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

exports.bcs = index$1;
exports.crypto_hash = index$3;
exports.encoding = index$4;
exports.onchain_events = index$8;
exports.providers = index$7;
exports.serde = index$6;
exports.starcoin_types = index$2;
exports.types = index;
exports.utils = index$5;
exports.version = version;
exports.vm2 = index$9;
