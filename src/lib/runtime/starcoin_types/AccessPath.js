"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessPath = void 0;
var AccountAddress_1 = require("./AccountAddress");
var AccessPath = /** @class */ (function () {
    function AccessPath(address, path) {
        this.address = address;
        this.path = path;
    }
    AccessPath.prototype.serialize = function (serializer) {
        this.address.serialize(serializer);
        serializer.serializeBytes(this.path);
    };
    AccessPath.deserialize = function (deserializer) {
        var address = AccountAddress_1.AccountAddress.deserialize(deserializer);
        var path = deserializer.deserializeBytes();
        return new AccessPath(address, path);
    };
    return AccessPath;
}());
exports.AccessPath = AccessPath;
