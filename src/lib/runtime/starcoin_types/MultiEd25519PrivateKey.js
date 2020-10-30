"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiEd25519PrivateKey = void 0;
var MultiEd25519PrivateKey = /** @class */ (function () {
    function MultiEd25519PrivateKey(value) {
        this.value = value;
    }
    MultiEd25519PrivateKey.prototype.serialize = function (serializer) {
        serializer.serializeBytes(this.value);
    };
    MultiEd25519PrivateKey.deserialize = function (deserializer) {
        var value = deserializer.deserializeBytes();
        return new MultiEd25519PrivateKey(value);
    };
    return MultiEd25519PrivateKey;
}());
exports.MultiEd25519PrivateKey = MultiEd25519PrivateKey;
