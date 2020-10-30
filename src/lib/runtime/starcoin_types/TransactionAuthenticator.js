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
exports.TransactionAuthenticatorVariantMultiEd25519 = exports.TransactionAuthenticatorVariantEd25519 = exports.TransactionAuthenticator = void 0;
var TransactionAuthenticator = /** @class */ (function () {
    function TransactionAuthenticator() {
    }
    TransactionAuthenticator.deserialize = function (deserializer) {
        var index = deserializer.deserializeVariantIndex();
        switch (index) {
            case 0: return TransactionAuthenticatorVariantEd25519.load(deserializer);
            case 1: return TransactionAuthenticatorVariantMultiEd25519.load(deserializer);
            default: throw new Error("Unknown variant index for TransactionAuthenticator: " + index);
        }
    };
    return TransactionAuthenticator;
}());
exports.TransactionAuthenticator = TransactionAuthenticator;
var Ed25519PublicKey_1 = require("./Ed25519PublicKey");
var Ed25519Signature_1 = require("./Ed25519Signature");
var TransactionAuthenticatorVariantEd25519 = /** @class */ (function (_super) {
    __extends(TransactionAuthenticatorVariantEd25519, _super);
    function TransactionAuthenticatorVariantEd25519(public_key, signature) {
        var _this = _super.call(this) || this;
        _this.public_key = public_key;
        _this.signature = signature;
        return _this;
    }
    TransactionAuthenticatorVariantEd25519.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(0);
        this.public_key.serialize(serializer);
        this.signature.serialize(serializer);
    };
    TransactionAuthenticatorVariantEd25519.load = function (deserializer) {
        var public_key = Ed25519PublicKey_1.Ed25519PublicKey.deserialize(deserializer);
        var signature = Ed25519Signature_1.Ed25519Signature.deserialize(deserializer);
        return new TransactionAuthenticatorVariantEd25519(public_key, signature);
    };
    return TransactionAuthenticatorVariantEd25519;
}(TransactionAuthenticator));
exports.TransactionAuthenticatorVariantEd25519 = TransactionAuthenticatorVariantEd25519;
var MultiEd25519PublicKey_1 = require("./MultiEd25519PublicKey");
var MultiEd25519Signature_1 = require("./MultiEd25519Signature");
var TransactionAuthenticatorVariantMultiEd25519 = /** @class */ (function (_super) {
    __extends(TransactionAuthenticatorVariantMultiEd25519, _super);
    function TransactionAuthenticatorVariantMultiEd25519(public_key, signature) {
        var _this = _super.call(this) || this;
        _this.public_key = public_key;
        _this.signature = signature;
        return _this;
    }
    TransactionAuthenticatorVariantMultiEd25519.prototype.serialize = function (serializer) {
        serializer.serializeVariantIndex(1);
        this.public_key.serialize(serializer);
        this.signature.serialize(serializer);
    };
    TransactionAuthenticatorVariantMultiEd25519.load = function (deserializer) {
        var public_key = MultiEd25519PublicKey_1.MultiEd25519PublicKey.deserialize(deserializer);
        var signature = MultiEd25519Signature_1.MultiEd25519Signature.deserialize(deserializer);
        return new TransactionAuthenticatorVariantMultiEd25519(public_key, signature);
    };
    return TransactionAuthenticatorVariantMultiEd25519;
}(TransactionAuthenticator));
exports.TransactionAuthenticatorVariantMultiEd25519 = TransactionAuthenticatorVariantMultiEd25519;
