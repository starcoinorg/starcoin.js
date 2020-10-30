"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignedUserTransaction = void 0;
var RawUserTransaction_1 = require("./RawUserTransaction");
var TransactionAuthenticator_1 = require("./TransactionAuthenticator");
var SignedUserTransaction = /** @class */ (function () {
    function SignedUserTransaction(raw_txn, authenticator) {
        this.raw_txn = raw_txn;
        this.authenticator = authenticator;
    }
    SignedUserTransaction.prototype.serialize = function (serializer) {
        this.raw_txn.serialize(serializer);
        this.authenticator.serialize(serializer);
    };
    SignedUserTransaction.deserialize = function (deserializer) {
        var raw_txn = RawUserTransaction_1.RawUserTransaction.deserialize(deserializer);
        var authenticator = TransactionAuthenticator_1.TransactionAuthenticator.deserialize(deserializer);
        return new SignedUserTransaction(raw_txn, authenticator);
    };
    return SignedUserTransaction;
}());
exports.SignedUserTransaction = SignedUserTransaction;
