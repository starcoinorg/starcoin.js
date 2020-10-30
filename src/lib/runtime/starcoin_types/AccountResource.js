"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountResource = void 0;
var traitHelpers_1 = require("./traitHelpers");
var EventHandle_1 = require("./EventHandle");
var AccountResource = /** @class */ (function () {
    function AccountResource(authentication_key, withdrawal_capability, key_rotation_capability, received_events, sent_events, accept_token_events, sequence_number) {
        this.authentication_key = authentication_key;
        this.withdrawal_capability = withdrawal_capability;
        this.key_rotation_capability = key_rotation_capability;
        this.received_events = received_events;
        this.sent_events = sent_events;
        this.accept_token_events = accept_token_events;
        this.sequence_number = sequence_number;
    }
    AccountResource.prototype.serialize = function (serializer) {
        traitHelpers_1.TraitHelpers.serializeListnumber(this.authentication_key, serializer);
        traitHelpers_1.TraitHelpers.serializeOptionalWithdrawCapabilityResource(this.withdrawal_capability, serializer);
        traitHelpers_1.TraitHelpers.serializeOptionalKeyRotationCapabilityResource(this.key_rotation_capability, serializer);
        this.received_events.serialize(serializer);
        this.sent_events.serialize(serializer);
        this.accept_token_events.serialize(serializer);
        serializer.serializeU64(this.sequence_number);
    };
    AccountResource.deserialize = function (deserializer) {
        var authentication_key = traitHelpers_1.TraitHelpers.deserializeListnumber(deserializer);
        var withdrawal_capability = traitHelpers_1.TraitHelpers.deserializeOptionalWithdrawCapabilityResource(deserializer);
        var key_rotation_capability = traitHelpers_1.TraitHelpers.deserializeOptionalKeyRotationCapabilityResource(deserializer);
        var received_events = EventHandle_1.EventHandle.deserialize(deserializer);
        var sent_events = EventHandle_1.EventHandle.deserialize(deserializer);
        var accept_token_events = EventHandle_1.EventHandle.deserialize(deserializer);
        var sequence_number = deserializer.deserializeU64();
        return new AccountResource(authentication_key, withdrawal_capability, key_rotation_capability, received_events, sent_events, accept_token_events, sequence_number);
    };
    return AccountResource;
}());
exports.AccountResource = AccountResource;
