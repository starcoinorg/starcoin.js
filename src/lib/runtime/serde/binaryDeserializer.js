"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryDeserializer = void 0;
var bignumber_1 = require("@ethersproject/bignumber");
var int64_buffer_1 = require("int64-buffer");
var stream_1 = require("stream");
var BinaryDeserializer = /** @class */ (function () {
    function BinaryDeserializer(data) {
        this.data = BinaryDeserializer.makeReadable(data);
    }
    BinaryDeserializer.makeReadable = function (data) {
        var r = new stream_1.Readable();
        r.push(Buffer.from(data));
        r.push(null);
        return r;
    };
    BinaryDeserializer.prototype.deserializeStr = function () {
        var value = this.deserializeBytes();
        return String.fromCharCode.apply(null, Array.from(value));
    };
    BinaryDeserializer.prototype.deserializeBytes = function () {
        var len = this.deserializeLen();
        if (len < 0 || len > BinaryDeserializer.MAX_VALUE) {
            throw new Error('The length of a JavaScript array cannot exceed MAXINT');
        }
        return this.data.read(len);
    };
    BinaryDeserializer.prototype.deserializeBool = function () {
        var bool = this.data.read(1);
        return bool[0] == 1;
    };
    BinaryDeserializer.prototype.deserializeUnit = function () {
        return;
    };
    BinaryDeserializer.prototype.deserializeU8 = function () {
        return Buffer.from(this.data.read(1)).readUInt8(0);
    };
    BinaryDeserializer.prototype.deserializeU16 = function () {
        return Buffer.from(this.data.read(2)).readUInt16LE(0);
    };
    BinaryDeserializer.prototype.deserializeU32 = function () {
        return Buffer.from(this.data.read(4)).readUInt32LE(0);
    };
    BinaryDeserializer.prototype.deserializeU64 = function () {
        return new int64_buffer_1.Uint64LE(Buffer.from(this.data.read(8)));
    };
    BinaryDeserializer.prototype.deserializeU128 = function () {
        return bignumber_1.BigNumber.from(this.data.read(16));
    };
    BinaryDeserializer.prototype.deserializeI8 = function () {
        return Buffer.from(this.data.read(1)).readInt8(0);
    };
    BinaryDeserializer.prototype.deserializeI16 = function () {
        return Buffer.from(this.data.read(2)).readInt16LE(0);
    };
    BinaryDeserializer.prototype.deserializeI32 = function () {
        return Buffer.from(this.data.read(4)).readInt32LE(0);
    };
    BinaryDeserializer.prototype.deserializeI64 = function () {
        return new int64_buffer_1.Int64LE(Buffer.from(this.data.read(8)));
    };
    BinaryDeserializer.prototype.deserializeI128 = function () {
        return bignumber_1.BigNumber.from(this.data.read(16));
    };
    BinaryDeserializer.prototype.deserializeOptionTag = function () {
        return this.deserializeBool();
    };
    BinaryDeserializer.prototype.getBufferOffset = function () {
        throw new Error('Method getBufferOffset not implemented.');
    };
    BinaryDeserializer.prototype.deserializeChar = function () {
        throw new Error('Method serializeChar not implemented.');
    };
    BinaryDeserializer.prototype.deserializeF32 = function () {
        throw new Error('Method serializeF32 not implemented.');
    };
    BinaryDeserializer.prototype.deserializeF64 = function () {
        throw new Error('Method serializeF64 not implemented.');
    };
    BinaryDeserializer.MAX_VALUE = 2147483647;
    return BinaryDeserializer;
}());
exports.BinaryDeserializer = BinaryDeserializer;
