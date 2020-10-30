"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteSet = void 0;
var WriteSetMut_1 = require("./WriteSetMut");
var WriteSet = /** @class */ (function () {
    function WriteSet(value) {
        this.value = value;
    }
    WriteSet.prototype.serialize = function (serializer) {
        this.value.serialize(serializer);
    };
    WriteSet.deserialize = function (deserializer) {
        var value = WriteSetMut_1.WriteSetMut.deserialize(deserializer);
        return new WriteSet(value);
    };
    return WriteSet;
}());
exports.WriteSet = WriteSet;
