"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashValue = void 0;
var HashValue = /** @class */ (function () {
    function HashValue(value) {
        this.value = value;
    }
    HashValue.prototype.serialize = function (serializer) {
        serializer.serializeBytes(this.value);
    };
    HashValue.deserialize = function (deserializer) {
        var value = deserializer.deserializeBytes();
        return new HashValue(value);
    };
    return HashValue;
}());
exports.HashValue = HashValue;
