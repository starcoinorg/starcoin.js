"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawCapabilityResource = void 0;
var AccountAddress_1 = require("./AccountAddress");
var WithdrawCapabilityResource = /** @class */ (function () {
    function WithdrawCapabilityResource(account_address) {
        this.account_address = account_address;
    }
    WithdrawCapabilityResource.prototype.serialize = function (serializer) {
        this.account_address.serialize(serializer);
    };
    WithdrawCapabilityResource.deserialize = function (deserializer) {
        var account_address = AccountAddress_1.AccountAddress.deserialize(deserializer);
        return new WithdrawCapabilityResource(account_address);
    };
    return WithdrawCapabilityResource;
}());
exports.WithdrawCapabilityResource = WithdrawCapabilityResource;
