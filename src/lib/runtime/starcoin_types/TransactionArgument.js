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
exports.TransactionArgumentVariantBool = exports.TransactionArgumentVariantU8Vector = exports.TransactionArgumentVariantAddress = exports.TransactionArgumentVariantU128 = exports.TransactionArgumentVariantU64 = exports.TransactionArgumentVariantU8 = exports.TransactionArgument = void 0;
var TransactionArgument = /** @class */ (function () {
    function TransactionArgument() {
    }
    TransactionArgument.deserialize = function (deserializer) {
        var index = deserializer.deserializeVariantIndex();
        switch (index) {
            case 0: return TransactionArgumentVariantU8.load(deserializer);
            case 1: return TransactionArgumentVariantU64.load(deserializer);
            case 2: return TransactionArgumentVariantU128.load(deserializer);
            case 3: return TransactionArgumentVariantAddress.load(deserializer);
            case 4: return TransactionArgumentVariantU8Vector.load(deserializer);
            case 5: return TransactionArgumentVariantBool.load(deserializer);
            default: throw new Error("Unknown variant index for TransactionArgument: " + index);
        }
    };
    return TransactionArgument;
}());
exports.TransactionArgument = TransactionArgument;
var TransactionArgumentVariantU8 = /** @class */ (function (_super) {
    __extends(TransactionArgumentVariantU8, _super);
    function TransactionArgumentVariantU8(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    TransactionArgumentVariantU8.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(0);
        serializer.serializeU8(this.value);
    };
    TransactionArgumentVariantU8.load = function (deserializer) {
        var value = deserializer.deserializeU8();
        return new TransactionArgumentVariantU8(value);
    };
    return TransactionArgumentVariantU8;
}(TransactionArgument));
exports.TransactionArgumentVariantU8 = TransactionArgumentVariantU8;
var TransactionArgumentVariantU64 = /** @class */ (function (_super) {
    __extends(TransactionArgumentVariantU64, _super);
    function TransactionArgumentVariantU64(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    TransactionArgumentVariantU64.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(1);
        serializer.serializeU64(this.value);
    };
    TransactionArgumentVariantU64.load = function (deserializer) {
        var value = deserializer.deserializeU64();
        return new TransactionArgumentVariantU64(value);
    };
    return TransactionArgumentVariantU64;
}(TransactionArgument));
exports.TransactionArgumentVariantU64 = TransactionArgumentVariantU64;
var TransactionArgumentVariantU128 = /** @class */ (function (_super) {
    __extends(TransactionArgumentVariantU128, _super);
    function TransactionArgumentVariantU128(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    TransactionArgumentVariantU128.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(2);
        serializer.serializeU128(this.value);
    };
    TransactionArgumentVariantU128.load = function (deserializer) {
        var value = deserializer.deserializeU128();
        return new TransactionArgumentVariantU128(value);
    };
    return TransactionArgumentVariantU128;
}(TransactionArgument));
exports.TransactionArgumentVariantU128 = TransactionArgumentVariantU128;
var AccountAddress_1 = require("./AccountAddress");
var TransactionArgumentVariantAddress = /** @class */ (function (_super) {
    __extends(TransactionArgumentVariantAddress, _super);
    function TransactionArgumentVariantAddress(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    TransactionArgumentVariantAddress.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(3);
        this.value.serialize(serializer);
    };
    TransactionArgumentVariantAddress.load = function (deserializer) {
        var value = AccountAddress_1.AccountAddress.deserialize(deserializer);
        return new TransactionArgumentVariantAddress(value);
    };
    return TransactionArgumentVariantAddress;
}(TransactionArgument));
exports.TransactionArgumentVariantAddress = TransactionArgumentVariantAddress;
var TransactionArgumentVariantU8Vector = /** @class */ (function (_super) {
    __extends(TransactionArgumentVariantU8Vector, _super);
    function TransactionArgumentVariantU8Vector(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    TransactionArgumentVariantU8Vector.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(4);
        serializer.serializeBytes(this.value);
    };
    TransactionArgumentVariantU8Vector.load = function (deserializer) {
        var value = deserializer.deserializeBytes();
        return new TransactionArgumentVariantU8Vector(value);
    };
    return TransactionArgumentVariantU8Vector;
}(TransactionArgument));
exports.TransactionArgumentVariantU8Vector = TransactionArgumentVariantU8Vector;
var TransactionArgumentVariantBool = /** @class */ (function (_super) {
    __extends(TransactionArgumentVariantBool, _super);
    function TransactionArgumentVariantBool(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    TransactionArgumentVariantBool.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(5);
        serializer.serializeBool(this.value);
    };
    TransactionArgumentVariantBool.load = function (deserializer) {
        var value = deserializer.deserializeBool();
        return new TransactionArgumentVariantBool(value);
    };
    return TransactionArgumentVariantBool;
}(TransactionArgument));
exports.TransactionArgumentVariantBool = TransactionArgumentVariantBool;
