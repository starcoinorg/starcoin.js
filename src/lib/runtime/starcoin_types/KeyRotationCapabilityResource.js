"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyRotationCapabilityResource = void 0;
var AccountAddress_1 = require("./AccountAddress");
var KeyRotationCapabilityResource = /** @class */ (function () {
    function KeyRotationCapabilityResource(account_address) {
        this.account_address = account_address;
    }
    KeyRotationCapabilityResource.prototype.serialize = function (serializer) {
        this.account_address.serialize(serializer);
    };
    KeyRotationCapabilityResource.deserialize = function (deserializer) {
        var account_address = AccountAddress_1.AccountAddress.deserialize(deserializer);
        return new KeyRotationCapabilityResource(account_address);
    };
    return KeyRotationCapabilityResource;
}());
exports.KeyRotationCapabilityResource = KeyRotationCapabilityResource;
