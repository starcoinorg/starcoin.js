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
exports.TransactionPayloadVariantPackage = exports.TransactionPayloadVariantScript = exports.TransactionPayload = void 0;
var TransactionPayload = /** @class */ (function () {
    function TransactionPayload() {
    }
    TransactionPayload.deserialize = function (deserializer) {
        var index = deserializer.deserializeVariantIndex();
        switch (index) {
            case 0: return TransactionPayloadVariantScript.load(deserializer);
            case 1: return TransactionPayloadVariantPackage.load(deserializer);
            default: throw new Error("Unknown variant index for TransactionPayload: " + index);
        }
    };
    return TransactionPayload;
}());
exports.TransactionPayload = TransactionPayload;
var Script_1 = require("./Script");
var TransactionPayloadVariantScript = /** @class */ (function (_super) {
    __extends(TransactionPayloadVariantScript, _super);
    function TransactionPayloadVariantScript(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    TransactionPayloadVariantScript.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(0);
        this.value.serialize(serializer);
    };
    TransactionPayloadVariantScript.load = function (deserializer) {
        var value = Script_1.Script.deserialize(deserializer);
        return new TransactionPayloadVariantScript(value);
    };
    return TransactionPayloadVariantScript;
}(TransactionPayload));
exports.TransactionPayloadVariantScript = TransactionPayloadVariantScript;
var Package_1 = require("./Package");
var TransactionPayloadVariantPackage = /** @class */ (function (_super) {
    __extends(TransactionPayloadVariantPackage, _super);
    function TransactionPayloadVariantPackage(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    TransactionPayloadVariantPackage.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(1);
        this.value.serialize(serializer);
    };
    TransactionPayloadVariantPackage.load = function (deserializer) {
        var value = Package_1.Package.deserialize(deserializer);
        return new TransactionPayloadVariantPackage(value);
    };
    return TransactionPayloadVariantPackage;
}(TransactionPayload));
exports.TransactionPayloadVariantPackage = TransactionPayloadVariantPackage;
