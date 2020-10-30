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
exports.LcsDeserializer = void 0;
var leb_1 = __importDefault(require("leb"));
var binaryDeserializer_1 = require("../serde/binaryDeserializer");
var LcsDeserializer = /** @class */ (function (_super) {
    __extends(LcsDeserializer, _super);
    function LcsDeserializer(data) {
        return _super.call(this, data) || this;
    }
    LcsDeserializer.prototype.deserializeUleb128AsU32 = function () {
        var buffer = [];
        var byte = 0xff;
        while (byte >= 0x80) {
            byte = this.deserializeU8();
            buffer.push(byte);
        }
        return leb_1.default.decodeUInt32(Buffer.from(buffer)).value;
    };
    LcsDeserializer.prototype.deserializeLen = function () {
        return this.deserializeUleb128AsU32();
    };
    LcsDeserializer.prototype.deserializeVariantIndex = function () {
        return this.deserializeUleb128AsU32();
    };
    LcsDeserializer.prototype.deserializeToHexString = function () {
        var bytes = this.deserializeBytes();
        return Buffer.from(bytes).toString('hex');
    };
    LcsDeserializer.prototype.checkThatKeySlicesAreIncreasing = function (key1, key2) {
        return;
    };
    return LcsDeserializer;
}(binaryDeserializer_1.BinaryDeserializer));
exports.LcsDeserializer = LcsDeserializer;
