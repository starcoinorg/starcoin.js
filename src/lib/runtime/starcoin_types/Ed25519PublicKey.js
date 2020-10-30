"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ed25519PublicKey = void 0;
var Ed25519PublicKey = /** @class */ (function () {
    function Ed25519PublicKey(value) {
        this.value = value;
    }
    Ed25519PublicKey.prototype.serialize = function (serializer) {
        serializer.serializeBytes(this.value);
    };
    Ed25519PublicKey.deserialize = function (deserializer) {
        var value = deserializer.deserializeBytes();
        return new Ed25519PublicKey(value);
    };
    return Ed25519PublicKey;
}());
exports.Ed25519PublicKey = Ed25519PublicKey;
