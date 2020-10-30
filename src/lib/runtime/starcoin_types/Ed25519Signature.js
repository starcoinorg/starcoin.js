"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ed25519Signature = void 0;
var Ed25519Signature = /** @class */ (function () {
    function Ed25519Signature(value) {
        this.value = value;
    }
    Ed25519Signature.prototype.serialize = function (serializer) {
        serializer.serializeBytes(this.value);
    };
    Ed25519Signature.deserialize = function (deserializer) {
        var value = deserializer.deserializeBytes();
        return new Ed25519Signature(value);
    };
    return Ed25519Signature;
}());
exports.Ed25519Signature = Ed25519Signature;
