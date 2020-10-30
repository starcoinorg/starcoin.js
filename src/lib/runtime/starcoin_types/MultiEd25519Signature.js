"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiEd25519Signature = void 0;
var MultiEd25519Signature = /** @class */ (function () {
    function MultiEd25519Signature(value) {
        this.value = value;
    }
    MultiEd25519Signature.prototype.serialize = function (serializer) {
        serializer.serializeBytes(this.value);
    };
    MultiEd25519Signature.deserialize = function (deserializer) {
        var value = deserializer.deserializeBytes();
        return new MultiEd25519Signature(value);
    };
    return MultiEd25519Signature;
}());
exports.MultiEd25519Signature = MultiEd25519Signature;
