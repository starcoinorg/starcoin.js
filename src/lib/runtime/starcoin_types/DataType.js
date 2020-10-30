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
exports.DataTypeVariantRESOURCE = exports.DataTypeVariantCODE = exports.DataType = void 0;
var DataType = /** @class */ (function () {
    function DataType() {
    }
    DataType.deserialize = function (deserializer) {
        var index = deserializer.deserializeVariantIndex();
        switch (index) {
            case 0: return DataTypeVariantCODE.load(deserializer);
            case 1: return DataTypeVariantRESOURCE.load(deserializer);
            default: throw new Error("Unknown variant index for DataType: " + index);
        }
    };
    return DataType;
}());
exports.DataType = DataType;
var DataTypeVariantCODE = /** @class */ (function (_super) {
    __extends(DataTypeVariantCODE, _super);
    function DataTypeVariantCODE() {
        return _super.call(this) || this;
    }
    DataTypeVariantCODE.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(0);
    };
    DataTypeVariantCODE.load = function (deserializer) {
        return new DataTypeVariantCODE();
    };
    return DataTypeVariantCODE;
}(DataType));
exports.DataTypeVariantCODE = DataTypeVariantCODE;
var DataTypeVariantRESOURCE = /** @class */ (function (_super) {
    __extends(DataTypeVariantRESOURCE, _super);
    function DataTypeVariantRESOURCE() {
        return _super.call(this) || this;
    }
    DataTypeVariantRESOURCE.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(1);
    };
    DataTypeVariantRESOURCE.load = function (deserializer) {
        return new DataTypeVariantRESOURCE();
    };
    return DataTypeVariantRESOURCE;
}(DataType));
exports.DataTypeVariantRESOURCE = DataTypeVariantRESOURCE;
