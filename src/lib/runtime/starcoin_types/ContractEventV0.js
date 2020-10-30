"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractEventV0 = void 0;
var EventKey_1 = require("./EventKey");
var TypeTag_1 = require("./TypeTag");
var ContractEventV0 = /** @class */ (function () {
    function ContractEventV0(key, sequence_number, type_tag, event_data) {
        this.key = key;
        this.sequence_number = sequence_number;
        this.type_tag = type_tag;
        this.event_data = event_data;
    }
    ContractEventV0.prototype.serialize = function (serializer) {
        this.key.serialize(serializer);
        serializer.serializeU64(this.sequence_number);
        this.type_tag.serialize(serializer);
        serializer.serializeBytes(this.event_data);
    };
    ContractEventV0.deserialize = function (deserializer) {
        var key = EventKey_1.EventKey.deserialize(deserializer);
        var sequence_number = deserializer.deserializeU64();
        var type_tag = TypeTag_1.TypeTag.deserialize(deserializer);
        var event_data = deserializer.deserializeBytes();
        return new ContractEventV0(key, sequence_number, type_tag, event_data);
    };
    return ContractEventV0;
}());
exports.ContractEventV0 = ContractEventV0;
