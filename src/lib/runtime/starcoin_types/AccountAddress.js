"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountAddress = void 0;
var traitHelpers_1 = require("./traitHelpers");
var AccountAddress = /** @class */ (function () {
    function AccountAddress(value) {
        this.value = value;
    }
    AccountAddress.prototype.serialize = function (serializer) {
        traitHelpers_1.TraitHelpers.serializeListTuplenumber(this.value, serializer);
    };
    AccountAddress.deserialize = function (deserializer) {
        var value = traitHelpers_1.TraitHelpers.deserializeListTuplenumber(deserializer);
        return new AccountAddress(value);
    };
    return AccountAddress;
}());
exports.AccountAddress = AccountAddress;
