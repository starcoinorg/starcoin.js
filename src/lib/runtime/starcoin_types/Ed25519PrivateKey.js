"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ed25519PrivateKey = void 0;
var Ed25519PrivateKey = /** @class */ (function () {
    function Ed25519PrivateKey(value) {
        this.value = value;
    }
    Ed25519PrivateKey.prototype.serialize = function (serializer) {
        serializer.serializeBytes(this.value);
    };
    Ed25519PrivateKey.deserialize = function (deserializer) {
        var value = deserializer.deserializeBytes();
        return new Ed25519PrivateKey(value);
    };
    return Ed25519PrivateKey;
}());
exports.Ed25519PrivateKey = Ed25519PrivateKey;
