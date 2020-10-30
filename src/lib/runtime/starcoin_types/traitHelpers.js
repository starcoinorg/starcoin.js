"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraitHelpers = void 0;
var Module_1 = require("./Module");
var TransactionArgument_1 = require("./TransactionArgument");
var TypeTag_1 = require("./TypeTag");
var Ed25519PublicKey_1 = require("./Ed25519PublicKey");
var KeyRotationCapabilityResource_1 = require("./KeyRotationCapabilityResource");
var Script_1 = require("./Script");
var WithdrawCapabilityResource_1 = require("./WithdrawCapabilityResource");
var AccessPath_1 = require("./AccessPath");
var WriteOp_1 = require("./WriteOp");
var TraitHelpers = /** @class */ (function () {
    function TraitHelpers() {
    }
    TraitHelpers.serializeListModule = function (value, serializer) {
        serializer.serializeLen(value.length);
        value.forEach(function (item) {
            item.serialize(serializer);
        });
    };
    TraitHelpers.deserializeListModule = function (deserializer) {
        var length = deserializer.deserializeLen();
        var list = [];
        for (var i = 0; i < length; i++) {
            list.push(Module_1.Module.deserialize(deserializer));
        }
        return list;
    };
    TraitHelpers.serializeListTransactionArgument = function (value, serializer) {
        serializer.serializeLen(value.length);
        value.forEach(function (item) {
            item.serialize(serializer);
        });
    };
    TraitHelpers.deserializeListTransactionArgument = function (deserializer) {
        var length = deserializer.deserializeLen();
        var list = [];
        for (var i = 0; i < length; i++) {
            list.push(TransactionArgument_1.TransactionArgument.deserialize(deserializer));
        }
        return list;
    };
    TraitHelpers.serializeListTupleAccessPathWriteOp = function (value, serializer) {
        serializer.serializeLen(value.length);
        value.forEach(function (item) {
            TraitHelpers.serializeTupleAccessPathWriteOp(item, serializer);
        });
    };
    TraitHelpers.deserializeListTupleAccessPathWriteOp = function (deserializer) {
        var length = deserializer.deserializeLen();
        var list = [];
        for (var i = 0; i < length; i++) {
            list.push(TraitHelpers.deserializeTupleAccessPathWriteOp(deserializer));
        }
        return list;
    };
    TraitHelpers.serializeListTuplenumber = function (value, serializer) {
        value.forEach(function (item) {
            serializer.serializeU8(item);
        });
    };
    TraitHelpers.deserializeListTuplenumber = function (deserializer) {
        var list = [];
        for (var i = 0; i < 16; i++) {
            list.push(deserializer.deserializeU8());
        }
        return list;
    };
    TraitHelpers.serializeListTypeTag = function (value, serializer) {
        serializer.serializeLen(value.length);
        value.forEach(function (item) {
            item.serialize(serializer);
        });
    };
    TraitHelpers.deserializeListTypeTag = function (deserializer) {
        var length = deserializer.deserializeLen();
        var list = [];
        for (var i = 0; i < length; i++) {
            list.push(TypeTag_1.TypeTag.deserialize(deserializer));
        }
        return list;
    };
    TraitHelpers.serializeListnumber = function (value, serializer) {
        serializer.serializeLen(value.length);
        value.forEach(function (item) {
            serializer.serializeU8(item);
        });
    };
    TraitHelpers.deserializeListnumber = function (deserializer) {
        var length = deserializer.deserializeLen();
        var list = [];
        for (var i = 0; i < length; i++) {
            list.push(deserializer.deserializeU8());
        }
        return list;
    };
    TraitHelpers.serializeOptionalEd25519PublicKey = function (value, serializer) {
        if (value) {
            serializer.serializeOptionTag(true);
            value.serialize(serializer);
        }
        else {
            serializer.serializeOptionTag(false);
        }
    };
    TraitHelpers.deserializeOptionalEd25519PublicKey = function (deserializer) {
        var tag = deserializer.deserializeOptionTag();
        if (!tag) {
            return null;
        }
        else {
            return Ed25519PublicKey_1.Ed25519PublicKey.deserialize(deserializer);
        }
    };
    TraitHelpers.serializeOptionalKeyRotationCapabilityResource = function (value, serializer) {
        if (value) {
            serializer.serializeOptionTag(true);
            value.serialize(serializer);
        }
        else {
            serializer.serializeOptionTag(false);
        }
    };
    TraitHelpers.deserializeOptionalKeyRotationCapabilityResource = function (deserializer) {
        var tag = deserializer.deserializeOptionTag();
        if (!tag) {
            return null;
        }
        else {
            return KeyRotationCapabilityResource_1.KeyRotationCapabilityResource.deserialize(deserializer);
        }
    };
    TraitHelpers.serializeOptionalScript = function (value, serializer) {
        if (value) {
            serializer.serializeOptionTag(true);
            value.serialize(serializer);
        }
        else {
            serializer.serializeOptionTag(false);
        }
    };
    TraitHelpers.deserializeOptionalScript = function (deserializer) {
        var tag = deserializer.deserializeOptionTag();
        if (!tag) {
            return null;
        }
        else {
            return Script_1.Script.deserialize(deserializer);
        }
    };
    TraitHelpers.serializeOptionalWithdrawCapabilityResource = function (value, serializer) {
        if (value) {
            serializer.serializeOptionTag(true);
            value.serialize(serializer);
        }
        else {
            serializer.serializeOptionTag(false);
        }
    };
    TraitHelpers.deserializeOptionalWithdrawCapabilityResource = function (deserializer) {
        var tag = deserializer.deserializeOptionTag();
        if (!tag) {
            return null;
        }
        else {
            return WithdrawCapabilityResource_1.WithdrawCapabilityResource.deserialize(deserializer);
        }
    };
    TraitHelpers.serializeTupleAccessPathWriteOp = function (value, serializer) {
        value[0].serialize(serializer);
        value[1].serialize(serializer);
    };
    TraitHelpers.deserializeTupleAccessPathWriteOp = function (deserializer) {
        return [
            AccessPath_1.AccessPath.deserialize(deserializer),
            WriteOp_1.WriteOp.deserialize(deserializer)
        ];
    };
    return TraitHelpers;
}());
exports.TraitHelpers = TraitHelpers;
