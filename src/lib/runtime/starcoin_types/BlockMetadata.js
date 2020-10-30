"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockMetadata = void 0;
var traitHelpers_1 = require("./traitHelpers");
var HashValue_1 = require("./HashValue");
var AccountAddress_1 = require("./AccountAddress");
var ChainId_1 = require("./ChainId");
var BlockMetadata = /** @class */ (function () {
    function BlockMetadata(parent_hash, timestamp, author, author_public_key, uncles, number, chain_id) {
        this.parent_hash = parent_hash;
        this.timestamp = timestamp;
        this.author = author;
        this.author_public_key = author_public_key;
        this.uncles = uncles;
        this.number = number;
        this.chain_id = chain_id;
    }
    BlockMetadata.prototype.serialize = function (serializer) {
        this.parent_hash.serialize(serializer);
        serializer.serializeU64(this.timestamp);
        this.author.serialize(serializer);
        traitHelpers_1.TraitHelpers.serializeOptionalEd25519PublicKey(this.author_public_key, serializer);
        serializer.serializeU64(this.uncles);
        serializer.serializeU64(this.number);
        this.chain_id.serialize(serializer);
    };
    BlockMetadata.deserialize = function (deserializer) {
        var parent_hash = HashValue_1.HashValue.deserialize(deserializer);
        var timestamp = deserializer.deserializeU64();
        var author = AccountAddress_1.AccountAddress.deserialize(deserializer);
        var author_public_key = traitHelpers_1.TraitHelpers.deserializeOptionalEd25519PublicKey(deserializer);
        var uncles = deserializer.deserializeU64();
        var number = deserializer.deserializeU64();
        var chain_id = ChainId_1.ChainId.deserialize(deserializer);
        return new BlockMetadata(parent_hash, timestamp, author, author_public_key, uncles, number, chain_id);
    };
    return BlockMetadata;
}());
exports.BlockMetadata = BlockMetadata;
