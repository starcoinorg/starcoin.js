"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiEd25519PublicKey = void 0;
var MultiEd25519PublicKey = /** @class */ (function () {
    function MultiEd25519PublicKey(value) {
        this.value = value;
    }
    MultiEd25519PublicKey.prototype.serialize = function (serializer) {
        serializer.serializeBytes(this.value);
    };
    MultiEd25519PublicKey.deserialize = function (deserializer) {
        var value = deserializer.deserializeBytes();
        return new MultiEd25519PublicKey(value);
    };
    return MultiEd25519PublicKey;
}());
exports.MultiEd25519PublicKey = MultiEd25519PublicKey;
