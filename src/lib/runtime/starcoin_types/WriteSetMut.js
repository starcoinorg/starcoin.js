"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteSetMut = void 0;
var traitHelpers_1 = require("./traitHelpers");
var WriteSetMut = /** @class */ (function () {
    function WriteSetMut(write_set) {
        this.write_set = write_set;
    }
    WriteSetMut.prototype.serialize = function (serializer) {
        traitHelpers_1.TraitHelpers.serializeListTupleAccessPathWriteOp(this.write_set, serializer);
    };
    WriteSetMut.deserialize = function (deserializer) {
        var write_set = traitHelpers_1.TraitHelpers.deserializeListTupleAccessPathWriteOp(deserializer);
        return new WriteSetMut(write_set);
    };
    return WriteSetMut;
}());
exports.WriteSetMut = WriteSetMut;
