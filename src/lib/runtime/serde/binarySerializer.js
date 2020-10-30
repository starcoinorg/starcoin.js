"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinarySerializer = void 0;
var bytes_1 = __importDefault(require("@ethersproject/bytes"));
var BinarySerializer = /** @class */ (function () {
    function BinarySerializer() {
        this.output = Buffer.alloc(0);
    }
    BinarySerializer.prototype.serializeStr = function (value) {
        var stringUTF8Bytes = Buffer.from(value, 'utf8');
        this.serializeBytes(stringUTF8Bytes);
    };
    BinarySerializer.prototype.serializeBytes = function (value) {
        this.serializeLen(value.length);
        this.concat(value);
    };
    BinarySerializer.prototype.serializeBool = function (value) {
        this.concat(Buffer.from([value ? 1 : 0]));
    };
    BinarySerializer.prototype.serializeUnit = function (value) {
    };
    BinarySerializer.prototype.serializeU8 = function (value) {
        this.concat(new Uint8Array([value]));
    };
    BinarySerializer.prototype.serializeU16 = function (value) {
        var u16 = new Uint16Array([value]);
        this.concat(Buffer.from(u16.buffer));
    };
    BinarySerializer.prototype.serializeU32 = function (value) {
        var u32 = new Uint32Array([value]);
        this.concat(Buffer.from(u32.buffer));
    };
    BinarySerializer.prototype.serializeU64 = function (value) {
        var buffer = value.toArrayBuffer();
        this.concat(new Uint8Array(buffer));
    };
    BinarySerializer.prototype.serializeU128 = function (value) {
        this.concat(bytes_1.default.arrayify(value));
    };
    BinarySerializer.prototype.serializeI8 = function (value) {
        this.serializeU8(value);
    };
    BinarySerializer.prototype.serializeI16 = function (value) {
        this.serializeU16(value);
    };
    BinarySerializer.prototype.serializeI32 = function (value) {
        this.serializeU32(value);
    };
    BinarySerializer.prototype.serializeI64 = function (value) {
        var buffer = value.toArrayBuffer();
        this.concat(new Uint8Array(buffer));
    };
    BinarySerializer.prototype.serializeI128 = function (value) {
        this.concat(bytes_1.default.arrayify(value));
    };
    BinarySerializer.prototype.serializeOptionTag = function (value) {
        if (value) {
            this.concat(Buffer.from([1])); // True
        }
        else {
            this.concat(Buffer.from([0])); // False
        }
    };
    BinarySerializer.prototype.getBufferOffset = function () {
        return this.output.length;
    };
    BinarySerializer.prototype.getBytes = function () {
        return this.output;
    };
    BinarySerializer.prototype.concat = function (value) {
        this.output = BinarySerializer.concat(this.output, value);
    };
    BinarySerializer.concat = function (a, b) {
        return Buffer.concat([a, b], a.length + b.length);
    };
    BinarySerializer.prototype.serializeChar = function (value) {
        throw new Error('Method serializeChar not implemented.');
    };
    BinarySerializer.prototype.serializeF32 = function (value) {
        throw new Error('Method serializeF32 not implemented.');
    };
    BinarySerializer.prototype.serializeF64 = function (value) {
        throw new Error('Method serializeF64 not implemented.');
    };
    return BinarySerializer;
}());
exports.BinarySerializer = BinarySerializer;
