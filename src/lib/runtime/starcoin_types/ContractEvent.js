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
exports.ContractEventVariantV0 = exports.ContractEvent = void 0;
var ContractEvent = /** @class */ (function () {
    function ContractEvent() {
    }
    ContractEvent.deserialize = function (deserializer) {
        var index = deserializer.deserializeVariantIndex();
        switch (index) {
            case 0: return ContractEventVariantV0.load(deserializer);
            default: throw new Error("Unknown variant index for ContractEvent: " + index);
        }
    };
    return ContractEvent;
}());
exports.ContractEvent = ContractEvent;
var ContractEventV0_1 = require("./ContractEventV0");
var ContractEventVariantV0 = /** @class */ (function (_super) {
    __extends(ContractEventVariantV0, _super);
    function ContractEventVariantV0(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    ContractEventVariantV0.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(0);
        this.value.serialize(serializer);
    };
    ContractEventVariantV0.load = function (deserializer) {
        var value = ContractEventV0_1.ContractEventV0.deserialize(deserializer);
        return new ContractEventVariantV0(value);
    };
    return ContractEventVariantV0;
}(ContractEvent));
exports.ContractEventVariantV0 = ContractEventVariantV0;
