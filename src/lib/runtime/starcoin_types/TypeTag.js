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
exports.TypeTagVariantStruct = exports.TypeTagVariantVector = exports.TypeTagVariantSigner = exports.TypeTagVariantAddress = exports.TypeTagVariantU128 = exports.TypeTagVariantU64 = exports.TypeTagVariantU8 = exports.TypeTagVariantBool = exports.TypeTag = void 0;
var TypeTag = /** @class */ (function () {
    function TypeTag() {
    }
    TypeTag.deserialize = function (deserializer) {
        var index = deserializer.deserializeVariantIndex();
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
    };
    return TypeTag;
}());
exports.TypeTag = TypeTag;
var TypeTagVariantBool = /** @class */ (function (_super) {
    __extends(TypeTagVariantBool, _super);
    function TypeTagVariantBool() {
        return _super.call(this) || this;
    }
    TypeTagVariantBool.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(0);
    };
    TypeTagVariantBool.load = function (deserializer) {
        return new TypeTagVariantBool();
    };
    return TypeTagVariantBool;
}(TypeTag));
exports.TypeTagVariantBool = TypeTagVariantBool;
var TypeTagVariantU8 = /** @class */ (function (_super) {
    __extends(TypeTagVariantU8, _super);
    function TypeTagVariantU8() {
        return _super.call(this) || this;
    }
    TypeTagVariantU8.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(1);
    };
    TypeTagVariantU8.load = function (deserializer) {
        return new TypeTagVariantU8();
    };
    return TypeTagVariantU8;
}(TypeTag));
exports.TypeTagVariantU8 = TypeTagVariantU8;
var TypeTagVariantU64 = /** @class */ (function (_super) {
    __extends(TypeTagVariantU64, _super);
    function TypeTagVariantU64() {
        return _super.call(this) || this;
    }
    TypeTagVariantU64.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(2);
    };
    TypeTagVariantU64.load = function (deserializer) {
        return new TypeTagVariantU64();
    };
    return TypeTagVariantU64;
}(TypeTag));
exports.TypeTagVariantU64 = TypeTagVariantU64;
var TypeTagVariantU128 = /** @class */ (function (_super) {
    __extends(TypeTagVariantU128, _super);
    function TypeTagVariantU128() {
        return _super.call(this) || this;
    }
    TypeTagVariantU128.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(3);
    };
    TypeTagVariantU128.load = function (deserializer) {
        return new TypeTagVariantU128();
    };
    return TypeTagVariantU128;
}(TypeTag));
exports.TypeTagVariantU128 = TypeTagVariantU128;
var TypeTagVariantAddress = /** @class */ (function (_super) {
    __extends(TypeTagVariantAddress, _super);
    function TypeTagVariantAddress() {
        return _super.call(this) || this;
    }
    TypeTagVariantAddress.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(4);
    };
    TypeTagVariantAddress.load = function (deserializer) {
        return new TypeTagVariantAddress();
    };
    return TypeTagVariantAddress;
}(TypeTag));
exports.TypeTagVariantAddress = TypeTagVariantAddress;
var TypeTagVariantSigner = /** @class */ (function (_super) {
    __extends(TypeTagVariantSigner, _super);
    function TypeTagVariantSigner() {
        return _super.call(this) || this;
    }
    TypeTagVariantSigner.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(5);
    };
    TypeTagVariantSigner.load = function (deserializer) {
        return new TypeTagVariantSigner();
    };
    return TypeTagVariantSigner;
}(TypeTag));
exports.TypeTagVariantSigner = TypeTagVariantSigner;
var TypeTagVariantVector = /** @class */ (function (_super) {
    __extends(TypeTagVariantVector, _super);
    function TypeTagVariantVector(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    TypeTagVariantVector.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(6);
        this.value.serialize(serializer);
    };
    TypeTagVariantVector.load = function (deserializer) {
        var value = TypeTag.deserialize(deserializer);
        return new TypeTagVariantVector(value);
    };
    return TypeTagVariantVector;
}(TypeTag));
exports.TypeTagVariantVector = TypeTagVariantVector;
var StructTag_1 = require("./StructTag");
var TypeTagVariantStruct = /** @class */ (function (_super) {
    __extends(TypeTagVariantStruct, _super);
    function TypeTagVariantStruct(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    TypeTagVariantStruct.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(7);
        this.value.serialize(serializer);
    };
    TypeTagVariantStruct.load = function (deserializer) {
        var value = StructTag_1.StructTag.deserialize(deserializer);
        return new TypeTagVariantStruct(value);
    };
    return TypeTagVariantStruct;
}(TypeTag));
exports.TypeTagVariantStruct = TypeTagVariantStruct;
