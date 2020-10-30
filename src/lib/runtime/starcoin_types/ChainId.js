"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainId = void 0;
var ChainId = /** @class */ (function () {
    function ChainId(id) {
        this.id = id;
    }
    ChainId.prototype.serialize = function (serializer) {
        serializer.serializeU8(this.id);
    };
    ChainId.deserialize = function (deserializer) {
        var id = deserializer.deserializeU8();
        return new ChainId(id);
    };
    return ChainId;
}());
exports.ChainId = ChainId;
