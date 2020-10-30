"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawUserTransaction = void 0;
var AccountAddress_1 = require("./AccountAddress");
var TransactionPayload_1 = require("./TransactionPayload");
var ChainId_1 = require("./ChainId");
var RawUserTransaction = /** @class */ (function () {
    function RawUserTransaction(sender, sequence_number, payload, max_gas_amount, gas_unit_price, gas_token_code, expiration_timestamp_secs, chain_id) {
        this.sender = sender;
        this.sequence_number = sequence_number;
        this.payload = payload;
        this.max_gas_amount = max_gas_amount;
        this.gas_unit_price = gas_unit_price;
        this.gas_token_code = gas_token_code;
        this.expiration_timestamp_secs = expiration_timestamp_secs;
        this.chain_id = chain_id;
    }
    RawUserTransaction.prototype.serialize = function (serializer) {
        this.sender.serialize(serializer);
        serializer.serializeU64(this.sequence_number);
        this.payload.serialize(serializer);
        serializer.serializeU64(this.max_gas_amount);
        serializer.serializeU64(this.gas_unit_price);
        serializer.serializeStr(this.gas_token_code);
        serializer.serializeU64(this.expiration_timestamp_secs);
        this.chain_id.serialize(serializer);
    };
    RawUserTransaction.deserialize = function (deserializer) {
        var sender = AccountAddress_1.AccountAddress.deserialize(deserializer);
        var sequence_number = deserializer.deserializeU64();
        var payload = TransactionPayload_1.TransactionPayload.deserialize(deserializer);
        var max_gas_amount = deserializer.deserializeU64();
        var gas_unit_price = deserializer.deserializeU64();
        var gas_token_code = deserializer.deserializeStr();
        var expiration_timestamp_secs = deserializer.deserializeU64();
        var chain_id = ChainId_1.ChainId.deserialize(deserializer);
        return new RawUserTransaction(sender, sequence_number, payload, max_gas_amount, gas_unit_price, gas_token_code, expiration_timestamp_secs, chain_id);
    };
    return RawUserTransaction;
}());
exports.RawUserTransaction = RawUserTransaction;
