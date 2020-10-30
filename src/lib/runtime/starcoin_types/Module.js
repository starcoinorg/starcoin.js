"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Module = void 0;
var Module = /** @class */ (function () {
    function Module(code) {
        this.code = code;
    }
    Module.prototype.serialize = function (serializer) {
        serializer.serializeBytes(this.code);
    };
    Module.deserialize = function (deserializer) {
        var code = deserializer.deserializeBytes();
        return new Module(code);
    };
    return Module;
}());
exports.Module = Module;
