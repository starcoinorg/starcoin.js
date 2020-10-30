"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Package = void 0;
var traitHelpers_1 = require("./traitHelpers");
var AccountAddress_1 = require("./AccountAddress");
var Package = /** @class */ (function () {
    function Package(package_address, modules, init_script) {
        this.package_address = package_address;
        this.modules = modules;
        this.init_script = init_script;
    }
    Package.prototype.serialize = function (serializer) {
        this.package_address.serialize(serializer);
        traitHelpers_1.TraitHelpers.serializeListModule(this.modules, serializer);
        traitHelpers_1.TraitHelpers.serializeOptionalScript(this.init_script, serializer);
    };
    Package.deserialize = function (deserializer) {
        var package_address = AccountAddress_1.AccountAddress.deserialize(deserializer);
        var modules = traitHelpers_1.TraitHelpers.deserializeListModule(deserializer);
        var init_script = traitHelpers_1.TraitHelpers.deserializeOptionalScript(deserializer);
        return new Package(package_address, modules, init_script);
    };
    return Package;
}());
exports.Package = Package;
