"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructTag = void 0;
var traitHelpers_1 = require("./traitHelpers");
var AccountAddress_1 = require("./AccountAddress");
var Identifier_1 = require("./Identifier");
var StructTag = /** @class */ (function () {
    function StructTag(address, module, name, type_params) {
        this.address = address;
        this.module = module;
        this.name = name;
        this.type_params = type_params;
    }
    StructTag.prototype.serialize = function (serializer) {
        this.address.serialize(serializer);
        this.module.serialize(serializer);
        this.name.serialize(serializer);
        traitHelpers_1.TraitHelpers.serializeListTypeTag(this.type_params, serializer);
    };
    StructTag.deserialize = function (deserializer) {
        var address = AccountAddress_1.AccountAddress.deserialize(deserializer);
        var module = Identifier_1.Identifier.deserialize(deserializer);
        var name = Identifier_1.Identifier.deserialize(deserializer);
        var type_params = traitHelpers_1.TraitHelpers.deserializeListTypeTag(deserializer);
        return new StructTag(address, module, name, type_params);
    };
    return StructTag;
}());
exports.StructTag = StructTag;
