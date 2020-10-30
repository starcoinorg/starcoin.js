"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventKey = void 0;
var EventKey = /** @class */ (function () {
    function EventKey(value) {
        this.value = value;
    }
    EventKey.prototype.serialize = function (serializer) {
        serializer.serializeBytes(this.value);
    };
    EventKey.deserialize = function (deserializer) {
        var value = deserializer.deserializeBytes();
        return new EventKey(value);
    };
    return EventKey;
}());
exports.EventKey = EventKey;
