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
exports.TransactionVariantBlockMetadata = exports.TransactionVariantUserTransaction = exports.Transaction = void 0;
var Transaction = /** @class */ (function () {
    function Transaction() {
    }
    Transaction.deserialize = function (deserializer) {
        var index = deserializer.deserializeVariantIndex();
        switch (index) {
            case 0: return TransactionVariantUserTransaction.load(deserializer);
            case 1: return TransactionVariantBlockMetadata.load(deserializer);
            default: throw new Error("Unknown variant index for Transaction: " + index);
        }
    };
    return Transaction;
}());
exports.Transaction = Transaction;
var SignedUserTransaction_1 = require("./SignedUserTransaction");
var TransactionVariantUserTransaction = /** @class */ (function (_super) {
    __extends(TransactionVariantUserTransaction, _super);
    function TransactionVariantUserTransaction(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    TransactionVariantUserTransaction.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(0);
        this.value.serialize(serializer);
    };
    TransactionVariantUserTransaction.load = function (deserializer) {
        var value = SignedUserTransaction_1.SignedUserTransaction.deserialize(deserializer);
        return new TransactionVariantUserTransaction(value);
    };
    return TransactionVariantUserTransaction;
}(Transaction));
exports.TransactionVariantUserTransaction = TransactionVariantUserTransaction;
var BlockMetadata_1 = require("./BlockMetadata");
var TransactionVariantBlockMetadata = /** @class */ (function (_super) {
    __extends(TransactionVariantBlockMetadata, _super);
    function TransactionVariantBlockMetadata(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    TransactionVariantBlockMetadata.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(1);
        this.value.serialize(serializer);
    };
    TransactionVariantBlockMetadata.load = function (deserializer) {
        var value = BlockMetadata_1.BlockMetadata.deserialize(deserializer);
        return new TransactionVariantBlockMetadata(value);
    };
    return TransactionVariantBlockMetadata;
}(Transaction));
exports.TransactionVariantBlockMetadata = TransactionVariantBlockMetadata;
