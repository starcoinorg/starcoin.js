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
exports.KindVariantnewMintBlock = exports.KindVariantnewPendingTransactions = exports.KindVariantevents = exports.KindVariantnewHeads = exports.Kind = void 0;
var Kind = /** @class */ (function () {
    function Kind() {
    }
    Kind.deserialize = function (deserializer) {
        var index = deserializer.deserializeVariantIndex();
        switch (index) {
            case 0: return KindVariantnewHeads.load(deserializer);
            case 1: return KindVariantevents.load(deserializer);
            case 2: return KindVariantnewPendingTransactions.load(deserializer);
            case 3: return KindVariantnewMintBlock.load(deserializer);
            default: throw new Error("Unknown variant index for Kind: " + index);
        }
    };
    return Kind;
}());
exports.Kind = Kind;
var KindVariantnewHeads = /** @class */ (function (_super) {
    __extends(KindVariantnewHeads, _super);
    function KindVariantnewHeads() {
        return _super.call(this) || this;
    }
    KindVariantnewHeads.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(0);
    };
    KindVariantnewHeads.load = function (deserializer) {
        return new KindVariantnewHeads();
    };
    return KindVariantnewHeads;
}(Kind));
exports.KindVariantnewHeads = KindVariantnewHeads;
var KindVariantevents = /** @class */ (function (_super) {
    __extends(KindVariantevents, _super);
    function KindVariantevents() {
        return _super.call(this) || this;
    }
    KindVariantevents.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(1);
    };
    KindVariantevents.load = function (deserializer) {
        return new KindVariantevents();
    };
    return KindVariantevents;
}(Kind));
exports.KindVariantevents = KindVariantevents;
var KindVariantnewPendingTransactions = /** @class */ (function (_super) {
    __extends(KindVariantnewPendingTransactions, _super);
    function KindVariantnewPendingTransactions() {
        return _super.call(this) || this;
    }
    KindVariantnewPendingTransactions.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(2);
    };
    KindVariantnewPendingTransactions.load = function (deserializer) {
        return new KindVariantnewPendingTransactions();
    };
    return KindVariantnewPendingTransactions;
}(Kind));
exports.KindVariantnewPendingTransactions = KindVariantnewPendingTransactions;
var KindVariantnewMintBlock = /** @class */ (function (_super) {
    __extends(KindVariantnewMintBlock, _super);
    function KindVariantnewMintBlock() {
        return _super.call(this) || this;
    }
    KindVariantnewMintBlock.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(3);
    };
    KindVariantnewMintBlock.load = function (deserializer) {
        return new KindVariantnewMintBlock();
    };
    return KindVariantnewMintBlock;
}(Kind));
exports.KindVariantnewMintBlock = KindVariantnewMintBlock;
