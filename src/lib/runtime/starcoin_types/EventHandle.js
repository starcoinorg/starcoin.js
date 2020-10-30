"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventHandle = void 0;
var EventKey_1 = require("./EventKey");
var EventHandle = /** @class */ (function () {
    function EventHandle(count, key) {
        this.count = count;
        this.key = key;
    }
    EventHandle.prototype.serialize = function (serializer) {
        serializer.serializeU64(this.count);
        this.key.serialize(serializer);
    };
    EventHandle.deserialize = function (deserializer) {
        var count = deserializer.deserializeU64();
        var key = EventKey_1.EventKey.deserialize(deserializer);
        return new EventHandle(count, key);
    };
    return EventHandle;
}());
exports.EventHandle = EventHandle;
