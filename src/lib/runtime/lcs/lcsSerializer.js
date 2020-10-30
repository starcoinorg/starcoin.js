"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LcsSerializer = void 0;
var leb_1 = __importDefault(require("leb"));
var binarySerializer_1 = require("../serde/binarySerializer");
var LcsSerializer = /** @class */ (function (_super) {
    __extends(LcsSerializer, _super);
    function LcsSerializer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LcsSerializer.prototype.serializeU32AsUleb128 = function (value) {
        this.concat(leb_1.default.encodeUInt32(value));
    };
    LcsSerializer.prototype.serializeLen = function (value) {
        this.serializeU32AsUleb128(value);
    };
    LcsSerializer.prototype.serializeVariantIndex = function (value) {
        this.serializeU32AsUleb128(value);
    };
    LcsSerializer.prototype.serializeHexString = function (value) {
        this.concat(LcsSerializer.hexString(value));
    };
    LcsSerializer.prototype.sortMapEntries = function (offsets) {
        throw new Error('Method sortMapEntries not implemented.');
    };
    LcsSerializer.hexString = function (value) {
        var data = value.match(/.{1,2}/g).map(function (x) { return parseInt(x, 16); });
        return new Uint8Array(data);
    };
    LcsSerializer.prototype.getBytesAsHex = function () {
        return Buffer.from(this.getBytes()).toString('hex');
    };
    return LcsSerializer;
}(binarySerializer_1.BinarySerializer));
exports.LcsSerializer = LcsSerializer;
