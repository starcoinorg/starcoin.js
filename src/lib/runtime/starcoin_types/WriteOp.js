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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteOpVariantValue = exports.WriteOpVariantDeletion = exports.WriteOp = void 0;
var WriteOp = /** @class */ (function () {
    function WriteOp() {
    }
    WriteOp.deserialize = function (deserializer) {
        var index = deserializer.deserializeVariantIndex();
        switch (index) {
            case 0: return WriteOpVariantDeletion.load(deserializer);
            case 1: return WriteOpVariantValue.load(deserializer);
            default: throw new Error("Unknown variant index for WriteOp: " + index);
        }
    };
    return WriteOp;
}());
exports.WriteOp = WriteOp;
var WriteOpVariantDeletion = /** @class */ (function (_super) {
    __extends(WriteOpVariantDeletion, _super);
    function WriteOpVariantDeletion() {
        return _super.call(this) || this;
    }
    WriteOpVariantDeletion.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(0);
    };
    WriteOpVariantDeletion.load = function (deserializer) {
        return new WriteOpVariantDeletion();
    };
    return WriteOpVariantDeletion;
}(WriteOp));
exports.WriteOpVariantDeletion = WriteOpVariantDeletion;
var WriteOpVariantValue = /** @class */ (function (_super) {
    __extends(WriteOpVariantValue, _super);
    function WriteOpVariantValue(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    WriteOpVariantValue.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(1);
        serializer.serializeBytes(this.value);
    };
    WriteOpVariantValue.load = function (deserializer) {
        var value = deserializer.deserializeBytes();
        return new WriteOpVariantValue(value);
    };
    return WriteOpVariantValue;
}(WriteOp));
exports.WriteOpVariantValue = WriteOpVariantValue;
