"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Script = void 0;
var traitHelpers_1 = require("./traitHelpers");
var Script = /** @class */ (function () {
    function Script(code, ty_args, args) {
        this.code = code;
        this.ty_args = ty_args;
        this.args = args;
    }
    Script.prototype.serialize = function (serializer) {
        serializer.serializeBytes(this.code);
        traitHelpers_1.TraitHelpers.serializeListTypeTag(this.ty_args, serializer);
        traitHelpers_1.TraitHelpers.serializeListTransactionArgument(this.args, serializer);
    };
    Script.deserialize = function (deserializer) {
        var code = deserializer.deserializeBytes();
        var ty_args = traitHelpers_1.TraitHelpers.deserializeListTypeTag(deserializer);
        var args = traitHelpers_1.TraitHelpers.deserializeListTransactionArgument(deserializer);
        return new Script(code, ty_args, args);
    };
    return Script;
}());
exports.Script = Script;
