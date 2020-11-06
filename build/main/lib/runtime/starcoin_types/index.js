"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helpers = exports.WriteSetMut = exports.WriteSet = exports.WriteOpVariantValue = exports.WriteOpVariantDeletion = exports.WriteOp = exports.WithdrawCapabilityResource = exports.TypeTagVariantStruct = exports.TypeTagVariantVector = exports.TypeTagVariantSigner = exports.TypeTagVariantAddress = exports.TypeTagVariantU128 = exports.TypeTagVariantU64 = exports.TypeTagVariantU8 = exports.TypeTagVariantBool = exports.TypeTag = exports.TypeArgumentABI = exports.TransactionPayloadVariantPackage = exports.TransactionPayloadVariantScript = exports.TransactionPayload = exports.TransactionAuthenticatorVariantMultiEd25519 = exports.TransactionAuthenticatorVariantEd25519 = exports.TransactionAuthenticator = exports.TransactionArgumentVariantBool = exports.TransactionArgumentVariantU8Vector = exports.TransactionArgumentVariantAddress = exports.TransactionArgumentVariantU128 = exports.TransactionArgumentVariantU64 = exports.TransactionArgumentVariantU8 = exports.TransactionArgument = exports.TransactionVariantBlockMetadata = exports.TransactionVariantUserTransaction = exports.Transaction = exports.StructTag = exports.SignedUserTransaction = exports.ScriptABI = exports.Script = exports.RawUserTransaction = exports.Package = exports.MultiEd25519Signature = exports.MultiEd25519PublicKey = exports.MultiEd25519PrivateKey = exports.Module = exports.KeyRotationCapabilityResource = exports.Identifier = exports.HashValue = exports.EventKey = exports.EventHandle = exports.Ed25519Signature = exports.Ed25519PublicKey = exports.Ed25519PrivateKey = exports.DataTypeVariantRESOURCE = exports.DataTypeVariantCODE = exports.DataType = exports.ContractEventV0 = exports.ContractEventVariantV0 = exports.ContractEvent = exports.ChainId = exports.BlockMetadata = exports.AuthenticationKey = exports.ArgumentABI = exports.AccountResource = exports.AccountAddress = exports.AccessPath = void 0;
class AccessPath {
    constructor(address, path) {
        this.address = address;
        this.path = path;
    }
    serialize(serializer) {
        this.address.serialize(serializer);
        serializer.serializeBytes(this.path);
    }
    static deserialize(deserializer) {
        const address = AccountAddress.deserialize(deserializer);
        const path = deserializer.deserializeBytes();
        return new AccessPath(address, path);
    }
}
exports.AccessPath = AccessPath;
class AccountAddress {
    constructor(value) {
        this.value = value;
    }
    serialize(serializer) {
        Helpers.serializeArray16U8Array(this.value, serializer);
    }
    static deserialize(deserializer) {
        const value = Helpers.deserializeArray16U8Array(deserializer);
        return new AccountAddress(value);
    }
}
exports.AccountAddress = AccountAddress;
class AccountResource {
    constructor(authentication_key, withdrawal_capability, key_rotation_capability, withdraw_events, deposit_events, accept_token_events, sequence_number) {
        this.authentication_key = authentication_key;
        this.withdrawal_capability = withdrawal_capability;
        this.key_rotation_capability = key_rotation_capability;
        this.withdraw_events = withdraw_events;
        this.deposit_events = deposit_events;
        this.accept_token_events = accept_token_events;
        this.sequence_number = sequence_number;
    }
    serialize(serializer) {
        Helpers.serializeVectorU8(this.authentication_key, serializer);
        Helpers.serializeOptionWithdrawCapabilityResource(this.withdrawal_capability, serializer);
        Helpers.serializeOptionKeyRotationCapabilityResource(this.key_rotation_capability, serializer);
        this.withdraw_events.serialize(serializer);
        this.deposit_events.serialize(serializer);
        this.accept_token_events.serialize(serializer);
        serializer.serializeU64(this.sequence_number);
    }
    static deserialize(deserializer) {
        const authentication_key = Helpers.deserializeVectorU8(deserializer);
        const withdrawal_capability = Helpers.deserializeOptionWithdrawCapabilityResource(deserializer);
        const key_rotation_capability = Helpers.deserializeOptionKeyRotationCapabilityResource(deserializer);
        const withdraw_events = EventHandle.deserialize(deserializer);
        const deposit_events = EventHandle.deserialize(deserializer);
        const accept_token_events = EventHandle.deserialize(deserializer);
        const sequence_number = deserializer.deserializeU64();
        return new AccountResource(authentication_key, withdrawal_capability, key_rotation_capability, withdraw_events, deposit_events, accept_token_events, sequence_number);
    }
}
exports.AccountResource = AccountResource;
class ArgumentABI {
    constructor(name, type_tag) {
        this.name = name;
        this.type_tag = type_tag;
    }
    serialize(serializer) {
        serializer.serializeStr(this.name);
        this.type_tag.serialize(serializer);
    }
    static deserialize(deserializer) {
        const name = deserializer.deserializeStr();
        const type_tag = TypeTag.deserialize(deserializer);
        return new ArgumentABI(name, type_tag);
    }
}
exports.ArgumentABI = ArgumentABI;
class AuthenticationKey {
    constructor(value) {
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeBytes(this.value);
    }
    static deserialize(deserializer) {
        const value = deserializer.deserializeBytes();
        return new AuthenticationKey(value);
    }
}
exports.AuthenticationKey = AuthenticationKey;
class BlockMetadata {
    constructor(parent_hash, timestamp, author, author_auth_key, uncles, number, chain_id, parent_gas_used) {
        this.parent_hash = parent_hash;
        this.timestamp = timestamp;
        this.author = author;
        this.author_auth_key = author_auth_key;
        this.uncles = uncles;
        this.number = number;
        this.chain_id = chain_id;
        this.parent_gas_used = parent_gas_used;
    }
    serialize(serializer) {
        this.parent_hash.serialize(serializer);
        serializer.serializeU64(this.timestamp);
        this.author.serialize(serializer);
        Helpers.serializeOptionAuthenticationKey(this.author_auth_key, serializer);
        serializer.serializeU64(this.uncles);
        serializer.serializeU64(this.number);
        this.chain_id.serialize(serializer);
        serializer.serializeU64(this.parent_gas_used);
    }
    static deserialize(deserializer) {
        const parent_hash = HashValue.deserialize(deserializer);
        const timestamp = deserializer.deserializeU64();
        const author = AccountAddress.deserialize(deserializer);
        const author_auth_key = Helpers.deserializeOptionAuthenticationKey(deserializer);
        const uncles = deserializer.deserializeU64();
        const number = deserializer.deserializeU64();
        const chain_id = ChainId.deserialize(deserializer);
        const parent_gas_used = deserializer.deserializeU64();
        return new BlockMetadata(parent_hash, timestamp, author, author_auth_key, uncles, number, chain_id, parent_gas_used);
    }
}
exports.BlockMetadata = BlockMetadata;
class ChainId {
    constructor(id) {
        this.id = id;
    }
    serialize(serializer) {
        serializer.serializeU8(this.id);
    }
    static deserialize(deserializer) {
        const id = deserializer.deserializeU8();
        return new ChainId(id);
    }
}
exports.ChainId = ChainId;
class ContractEvent {
    static deserialize(deserializer) {
        const index = deserializer.deserializeVariantIndex();
        switch (index) {
            case 0:
                return ContractEventVariantV0.load(deserializer);
            default:
                throw new Error('Unknown variant index for ContractEvent: ' + index);
        }
    }
}
exports.ContractEvent = ContractEvent;
class ContractEventVariantV0 extends ContractEvent {
    constructor(value) {
        super();
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(0);
        this.value.serialize(serializer);
    }
    static load(deserializer) {
        const value = ContractEventV0.deserialize(deserializer);
        return new ContractEventVariantV0(value);
    }
}
exports.ContractEventVariantV0 = ContractEventVariantV0;
class ContractEventV0 {
    constructor(key, sequence_number, type_tag, event_data) {
        this.key = key;
        this.sequence_number = sequence_number;
        this.type_tag = type_tag;
        this.event_data = event_data;
    }
    serialize(serializer) {
        this.key.serialize(serializer);
        serializer.serializeU64(this.sequence_number);
        this.type_tag.serialize(serializer);
        serializer.serializeBytes(this.event_data);
    }
    static deserialize(deserializer) {
        const key = EventKey.deserialize(deserializer);
        const sequence_number = deserializer.deserializeU64();
        const type_tag = TypeTag.deserialize(deserializer);
        const event_data = deserializer.deserializeBytes();
        return new ContractEventV0(key, sequence_number, type_tag, event_data);
    }
}
exports.ContractEventV0 = ContractEventV0;
class DataType {
    static deserialize(deserializer) {
        const index = deserializer.deserializeVariantIndex();
        switch (index) {
            case 0:
                return DataTypeVariantCODE.load(deserializer);
            case 1:
                return DataTypeVariantRESOURCE.load(deserializer);
            default:
                throw new Error('Unknown variant index for DataType: ' + index);
        }
    }
}
exports.DataType = DataType;
class DataTypeVariantCODE extends DataType {
    constructor() {
        super();
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(0);
    }
    static load(deserializer) {
        return new DataTypeVariantCODE();
    }
}
exports.DataTypeVariantCODE = DataTypeVariantCODE;
class DataTypeVariantRESOURCE extends DataType {
    constructor() {
        super();
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(1);
    }
    static load(deserializer) {
        return new DataTypeVariantRESOURCE();
    }
}
exports.DataTypeVariantRESOURCE = DataTypeVariantRESOURCE;
class Ed25519PrivateKey {
    constructor(value) {
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeBytes(this.value);
    }
    static deserialize(deserializer) {
        const value = deserializer.deserializeBytes();
        return new Ed25519PrivateKey(value);
    }
}
exports.Ed25519PrivateKey = Ed25519PrivateKey;
class Ed25519PublicKey {
    constructor(value) {
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeBytes(this.value);
    }
    static deserialize(deserializer) {
        const value = deserializer.deserializeBytes();
        return new Ed25519PublicKey(value);
    }
}
exports.Ed25519PublicKey = Ed25519PublicKey;
class Ed25519Signature {
    constructor(value) {
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeBytes(this.value);
    }
    static deserialize(deserializer) {
        const value = deserializer.deserializeBytes();
        return new Ed25519Signature(value);
    }
}
exports.Ed25519Signature = Ed25519Signature;
class EventHandle {
    constructor(count, key) {
        this.count = count;
        this.key = key;
    }
    serialize(serializer) {
        serializer.serializeU64(this.count);
        this.key.serialize(serializer);
    }
    static deserialize(deserializer) {
        const count = deserializer.deserializeU64();
        const key = EventKey.deserialize(deserializer);
        return new EventHandle(count, key);
    }
}
exports.EventHandle = EventHandle;
class EventKey {
    constructor(value) {
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeBytes(this.value);
    }
    static deserialize(deserializer) {
        const value = deserializer.deserializeBytes();
        return new EventKey(value);
    }
}
exports.EventKey = EventKey;
class HashValue {
    constructor(value) {
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeBytes(this.value);
    }
    static deserialize(deserializer) {
        const value = deserializer.deserializeBytes();
        return new HashValue(value);
    }
}
exports.HashValue = HashValue;
class Identifier {
    constructor(value) {
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeStr(this.value);
    }
    static deserialize(deserializer) {
        const value = deserializer.deserializeStr();
        return new Identifier(value);
    }
}
exports.Identifier = Identifier;
class KeyRotationCapabilityResource {
    constructor(account_address) {
        this.account_address = account_address;
    }
    serialize(serializer) {
        this.account_address.serialize(serializer);
    }
    static deserialize(deserializer) {
        const account_address = AccountAddress.deserialize(deserializer);
        return new KeyRotationCapabilityResource(account_address);
    }
}
exports.KeyRotationCapabilityResource = KeyRotationCapabilityResource;
class Module {
    constructor(code) {
        this.code = code;
    }
    serialize(serializer) {
        serializer.serializeBytes(this.code);
    }
    static deserialize(deserializer) {
        const code = deserializer.deserializeBytes();
        return new Module(code);
    }
}
exports.Module = Module;
class MultiEd25519PrivateKey {
    constructor(value) {
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeBytes(this.value);
    }
    static deserialize(deserializer) {
        const value = deserializer.deserializeBytes();
        return new MultiEd25519PrivateKey(value);
    }
}
exports.MultiEd25519PrivateKey = MultiEd25519PrivateKey;
class MultiEd25519PublicKey {
    constructor(value) {
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeBytes(this.value);
    }
    static deserialize(deserializer) {
        const value = deserializer.deserializeBytes();
        return new MultiEd25519PublicKey(value);
    }
}
exports.MultiEd25519PublicKey = MultiEd25519PublicKey;
class MultiEd25519Signature {
    constructor(value) {
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeBytes(this.value);
    }
    static deserialize(deserializer) {
        const value = deserializer.deserializeBytes();
        return new MultiEd25519Signature(value);
    }
}
exports.MultiEd25519Signature = MultiEd25519Signature;
class Package {
    constructor(package_address, modules, init_script) {
        this.package_address = package_address;
        this.modules = modules;
        this.init_script = init_script;
    }
    serialize(serializer) {
        this.package_address.serialize(serializer);
        Helpers.serializeVectorModule(this.modules, serializer);
        Helpers.serializeOptionScript(this.init_script, serializer);
    }
    static deserialize(deserializer) {
        const package_address = AccountAddress.deserialize(deserializer);
        const modules = Helpers.deserializeVectorModule(deserializer);
        const init_script = Helpers.deserializeOptionScript(deserializer);
        return new Package(package_address, modules, init_script);
    }
}
exports.Package = Package;
class RawUserTransaction {
    constructor(sender, sequence_number, payload, max_gas_amount, gas_unit_price, gas_token_code, expiration_timestamp_secs, chain_id) {
        this.sender = sender;
        this.sequence_number = sequence_number;
        this.payload = payload;
        this.max_gas_amount = max_gas_amount;
        this.gas_unit_price = gas_unit_price;
        this.gas_token_code = gas_token_code;
        this.expiration_timestamp_secs = expiration_timestamp_secs;
        this.chain_id = chain_id;
    }
    serialize(serializer) {
        this.sender.serialize(serializer);
        serializer.serializeU64(this.sequence_number);
        this.payload.serialize(serializer);
        serializer.serializeU64(this.max_gas_amount);
        serializer.serializeU64(this.gas_unit_price);
        serializer.serializeStr(this.gas_token_code);
        serializer.serializeU64(this.expiration_timestamp_secs);
        this.chain_id.serialize(serializer);
    }
    static deserialize(deserializer) {
        const sender = AccountAddress.deserialize(deserializer);
        const sequence_number = deserializer.deserializeU64();
        const payload = TransactionPayload.deserialize(deserializer);
        const max_gas_amount = deserializer.deserializeU64();
        const gas_unit_price = deserializer.deserializeU64();
        const gas_token_code = deserializer.deserializeStr();
        const expiration_timestamp_secs = deserializer.deserializeU64();
        const chain_id = ChainId.deserialize(deserializer);
        return new RawUserTransaction(sender, sequence_number, payload, max_gas_amount, gas_unit_price, gas_token_code, expiration_timestamp_secs, chain_id);
    }
}
exports.RawUserTransaction = RawUserTransaction;
class Script {
    constructor(code, ty_args, args) {
        this.code = code;
        this.ty_args = ty_args;
        this.args = args;
    }
    serialize(serializer) {
        serializer.serializeBytes(this.code);
        Helpers.serializeVectorTypeTag(this.ty_args, serializer);
        Helpers.serializeVectorTransactionArgument(this.args, serializer);
    }
    static deserialize(deserializer) {
        const code = deserializer.deserializeBytes();
        const ty_args = Helpers.deserializeVectorTypeTag(deserializer);
        const args = Helpers.deserializeVectorTransactionArgument(deserializer);
        return new Script(code, ty_args, args);
    }
}
exports.Script = Script;
class ScriptABI {
    constructor(name, doc, code, ty_args, args) {
        this.name = name;
        this.doc = doc;
        this.code = code;
        this.ty_args = ty_args;
        this.args = args;
    }
    serialize(serializer) {
        serializer.serializeStr(this.name);
        serializer.serializeStr(this.doc);
        serializer.serializeBytes(this.code);
        Helpers.serializeVectorTypeArgumentAbi(this.ty_args, serializer);
        Helpers.serializeVectorArgumentAbi(this.args, serializer);
    }
    static deserialize(deserializer) {
        const name = deserializer.deserializeStr();
        const doc = deserializer.deserializeStr();
        const code = deserializer.deserializeBytes();
        const ty_args = Helpers.deserializeVectorTypeArgumentAbi(deserializer);
        const args = Helpers.deserializeVectorArgumentAbi(deserializer);
        return new ScriptABI(name, doc, code, ty_args, args);
    }
}
exports.ScriptABI = ScriptABI;
class SignedUserTransaction {
    constructor(raw_txn, authenticator) {
        this.raw_txn = raw_txn;
        this.authenticator = authenticator;
    }
    serialize(serializer) {
        this.raw_txn.serialize(serializer);
        this.authenticator.serialize(serializer);
    }
    static deserialize(deserializer) {
        const raw_txn = RawUserTransaction.deserialize(deserializer);
        const authenticator = TransactionAuthenticator.deserialize(deserializer);
        return new SignedUserTransaction(raw_txn, authenticator);
    }
}
exports.SignedUserTransaction = SignedUserTransaction;
class StructTag {
    constructor(address, module, name, type_params) {
        this.address = address;
        this.module = module;
        this.name = name;
        this.type_params = type_params;
    }
    serialize(serializer) {
        this.address.serialize(serializer);
        this.module.serialize(serializer);
        this.name.serialize(serializer);
        Helpers.serializeVectorTypeTag(this.type_params, serializer);
    }
    static deserialize(deserializer) {
        const address = AccountAddress.deserialize(deserializer);
        const module = Identifier.deserialize(deserializer);
        const name = Identifier.deserialize(deserializer);
        const type_params = Helpers.deserializeVectorTypeTag(deserializer);
        return new StructTag(address, module, name, type_params);
    }
}
exports.StructTag = StructTag;
class Transaction {
    static deserialize(deserializer) {
        const index = deserializer.deserializeVariantIndex();
        switch (index) {
            case 0:
                return TransactionVariantUserTransaction.load(deserializer);
            case 1:
                return TransactionVariantBlockMetadata.load(deserializer);
            default:
                throw new Error('Unknown variant index for Transaction: ' + index);
        }
    }
}
exports.Transaction = Transaction;
class TransactionVariantUserTransaction extends Transaction {
    constructor(value) {
        super();
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(0);
        this.value.serialize(serializer);
    }
    static load(deserializer) {
        const value = SignedUserTransaction.deserialize(deserializer);
        return new TransactionVariantUserTransaction(value);
    }
}
exports.TransactionVariantUserTransaction = TransactionVariantUserTransaction;
class TransactionVariantBlockMetadata extends Transaction {
    constructor(value) {
        super();
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(1);
        this.value.serialize(serializer);
    }
    static load(deserializer) {
        const value = BlockMetadata.deserialize(deserializer);
        return new TransactionVariantBlockMetadata(value);
    }
}
exports.TransactionVariantBlockMetadata = TransactionVariantBlockMetadata;
class TransactionArgument {
    static deserialize(deserializer) {
        const index = deserializer.deserializeVariantIndex();
        switch (index) {
            case 0:
                return TransactionArgumentVariantU8.load(deserializer);
            case 1:
                return TransactionArgumentVariantU64.load(deserializer);
            case 2:
                return TransactionArgumentVariantU128.load(deserializer);
            case 3:
                return TransactionArgumentVariantAddress.load(deserializer);
            case 4:
                return TransactionArgumentVariantU8Vector.load(deserializer);
            case 5:
                return TransactionArgumentVariantBool.load(deserializer);
            default:
                throw new Error('Unknown variant index for TransactionArgument: ' + index);
        }
    }
}
exports.TransactionArgument = TransactionArgument;
class TransactionArgumentVariantU8 extends TransactionArgument {
    constructor(value) {
        super();
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(0);
        serializer.serializeU8(this.value);
    }
    static load(deserializer) {
        const value = deserializer.deserializeU8();
        return new TransactionArgumentVariantU8(value);
    }
}
exports.TransactionArgumentVariantU8 = TransactionArgumentVariantU8;
class TransactionArgumentVariantU64 extends TransactionArgument {
    constructor(value) {
        super();
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(1);
        serializer.serializeU64(this.value);
    }
    static load(deserializer) {
        const value = deserializer.deserializeU64();
        return new TransactionArgumentVariantU64(value);
    }
}
exports.TransactionArgumentVariantU64 = TransactionArgumentVariantU64;
class TransactionArgumentVariantU128 extends TransactionArgument {
    constructor(value) {
        super();
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(2);
        serializer.serializeU128(this.value);
    }
    static load(deserializer) {
        const value = deserializer.deserializeU128();
        return new TransactionArgumentVariantU128(value);
    }
}
exports.TransactionArgumentVariantU128 = TransactionArgumentVariantU128;
class TransactionArgumentVariantAddress extends TransactionArgument {
    constructor(value) {
        super();
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(3);
        this.value.serialize(serializer);
    }
    static load(deserializer) {
        const value = AccountAddress.deserialize(deserializer);
        return new TransactionArgumentVariantAddress(value);
    }
}
exports.TransactionArgumentVariantAddress = TransactionArgumentVariantAddress;
class TransactionArgumentVariantU8Vector extends TransactionArgument {
    constructor(value) {
        super();
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(4);
        serializer.serializeBytes(this.value);
    }
    static load(deserializer) {
        const value = deserializer.deserializeBytes();
        return new TransactionArgumentVariantU8Vector(value);
    }
}
exports.TransactionArgumentVariantU8Vector = TransactionArgumentVariantU8Vector;
class TransactionArgumentVariantBool extends TransactionArgument {
    constructor(value) {
        super();
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(5);
        serializer.serializeBool(this.value);
    }
    static load(deserializer) {
        const value = deserializer.deserializeBool();
        return new TransactionArgumentVariantBool(value);
    }
}
exports.TransactionArgumentVariantBool = TransactionArgumentVariantBool;
class TransactionAuthenticator {
    static deserialize(deserializer) {
        const index = deserializer.deserializeVariantIndex();
        switch (index) {
            case 0:
                return TransactionAuthenticatorVariantEd25519.load(deserializer);
            case 1:
                return TransactionAuthenticatorVariantMultiEd25519.load(deserializer);
            default:
                throw new Error('Unknown variant index for TransactionAuthenticator: ' + index);
        }
    }
}
exports.TransactionAuthenticator = TransactionAuthenticator;
class TransactionAuthenticatorVariantEd25519 extends TransactionAuthenticator {
    constructor(public_key, signature) {
        super();
        this.public_key = public_key;
        this.signature = signature;
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(0);
        this.public_key.serialize(serializer);
        this.signature.serialize(serializer);
    }
    static load(deserializer) {
        const public_key = Ed25519PublicKey.deserialize(deserializer);
        const signature = Ed25519Signature.deserialize(deserializer);
        return new TransactionAuthenticatorVariantEd25519(public_key, signature);
    }
}
exports.TransactionAuthenticatorVariantEd25519 = TransactionAuthenticatorVariantEd25519;
class TransactionAuthenticatorVariantMultiEd25519 extends TransactionAuthenticator {
    constructor(public_key, signature) {
        super();
        this.public_key = public_key;
        this.signature = signature;
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(1);
        this.public_key.serialize(serializer);
        this.signature.serialize(serializer);
    }
    static load(deserializer) {
        const public_key = MultiEd25519PublicKey.deserialize(deserializer);
        const signature = MultiEd25519Signature.deserialize(deserializer);
        return new TransactionAuthenticatorVariantMultiEd25519(public_key, signature);
    }
}
exports.TransactionAuthenticatorVariantMultiEd25519 = TransactionAuthenticatorVariantMultiEd25519;
class TransactionPayload {
    static deserialize(deserializer) {
        const index = deserializer.deserializeVariantIndex();
        switch (index) {
            case 0:
                return TransactionPayloadVariantScript.load(deserializer);
            case 1:
                return TransactionPayloadVariantPackage.load(deserializer);
            default:
                throw new Error('Unknown variant index for TransactionPayload: ' + index);
        }
    }
}
exports.TransactionPayload = TransactionPayload;
class TransactionPayloadVariantScript extends TransactionPayload {
    constructor(value) {
        super();
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(0);
        this.value.serialize(serializer);
    }
    static load(deserializer) {
        const value = Script.deserialize(deserializer);
        return new TransactionPayloadVariantScript(value);
    }
}
exports.TransactionPayloadVariantScript = TransactionPayloadVariantScript;
class TransactionPayloadVariantPackage extends TransactionPayload {
    constructor(value) {
        super();
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(1);
        this.value.serialize(serializer);
    }
    static load(deserializer) {
        const value = Package.deserialize(deserializer);
        return new TransactionPayloadVariantPackage(value);
    }
}
exports.TransactionPayloadVariantPackage = TransactionPayloadVariantPackage;
class TypeArgumentABI {
    constructor(name) {
        this.name = name;
    }
    serialize(serializer) {
        serializer.serializeStr(this.name);
    }
    static deserialize(deserializer) {
        const name = deserializer.deserializeStr();
        return new TypeArgumentABI(name);
    }
}
exports.TypeArgumentABI = TypeArgumentABI;
class TypeTag {
    static deserialize(deserializer) {
        const index = deserializer.deserializeVariantIndex();
        switch (index) {
            case 0:
                return TypeTagVariantBool.load(deserializer);
            case 1:
                return TypeTagVariantU8.load(deserializer);
            case 2:
                return TypeTagVariantU64.load(deserializer);
            case 3:
                return TypeTagVariantU128.load(deserializer);
            case 4:
                return TypeTagVariantAddress.load(deserializer);
            case 5:
                return TypeTagVariantSigner.load(deserializer);
            case 6:
                return TypeTagVariantVector.load(deserializer);
            case 7:
                return TypeTagVariantStruct.load(deserializer);
            default:
                throw new Error('Unknown variant index for TypeTag: ' + index);
        }
    }
}
exports.TypeTag = TypeTag;
class TypeTagVariantBool extends TypeTag {
    constructor() {
        super();
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(0);
    }
    static load(deserializer) {
        return new TypeTagVariantBool();
    }
}
exports.TypeTagVariantBool = TypeTagVariantBool;
class TypeTagVariantU8 extends TypeTag {
    constructor() {
        super();
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(1);
    }
    static load(deserializer) {
        return new TypeTagVariantU8();
    }
}
exports.TypeTagVariantU8 = TypeTagVariantU8;
class TypeTagVariantU64 extends TypeTag {
    constructor() {
        super();
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(2);
    }
    static load(deserializer) {
        return new TypeTagVariantU64();
    }
}
exports.TypeTagVariantU64 = TypeTagVariantU64;
class TypeTagVariantU128 extends TypeTag {
    constructor() {
        super();
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(3);
    }
    static load(deserializer) {
        return new TypeTagVariantU128();
    }
}
exports.TypeTagVariantU128 = TypeTagVariantU128;
class TypeTagVariantAddress extends TypeTag {
    constructor() {
        super();
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(4);
    }
    static load(deserializer) {
        return new TypeTagVariantAddress();
    }
}
exports.TypeTagVariantAddress = TypeTagVariantAddress;
class TypeTagVariantSigner extends TypeTag {
    constructor() {
        super();
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(5);
    }
    static load(deserializer) {
        return new TypeTagVariantSigner();
    }
}
exports.TypeTagVariantSigner = TypeTagVariantSigner;
class TypeTagVariantVector extends TypeTag {
    constructor(value) {
        super();
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(6);
        this.value.serialize(serializer);
    }
    static load(deserializer) {
        const value = TypeTag.deserialize(deserializer);
        return new TypeTagVariantVector(value);
    }
}
exports.TypeTagVariantVector = TypeTagVariantVector;
class TypeTagVariantStruct extends TypeTag {
    constructor(value) {
        super();
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(7);
        this.value.serialize(serializer);
    }
    static load(deserializer) {
        const value = StructTag.deserialize(deserializer);
        return new TypeTagVariantStruct(value);
    }
}
exports.TypeTagVariantStruct = TypeTagVariantStruct;
class WithdrawCapabilityResource {
    constructor(account_address) {
        this.account_address = account_address;
    }
    serialize(serializer) {
        this.account_address.serialize(serializer);
    }
    static deserialize(deserializer) {
        const account_address = AccountAddress.deserialize(deserializer);
        return new WithdrawCapabilityResource(account_address);
    }
}
exports.WithdrawCapabilityResource = WithdrawCapabilityResource;
class WriteOp {
    static deserialize(deserializer) {
        const index = deserializer.deserializeVariantIndex();
        switch (index) {
            case 0:
                return WriteOpVariantDeletion.load(deserializer);
            case 1:
                return WriteOpVariantValue.load(deserializer);
            default:
                throw new Error('Unknown variant index for WriteOp: ' + index);
        }
    }
}
exports.WriteOp = WriteOp;
class WriteOpVariantDeletion extends WriteOp {
    constructor() {
        super();
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(0);
    }
    static load(deserializer) {
        return new WriteOpVariantDeletion();
    }
}
exports.WriteOpVariantDeletion = WriteOpVariantDeletion;
class WriteOpVariantValue extends WriteOp {
    constructor(value) {
        super();
        this.value = value;
    }
    serialize(serializer) {
        serializer.serializeVariantIndex(1);
        serializer.serializeBytes(this.value);
    }
    static load(deserializer) {
        const value = deserializer.deserializeBytes();
        return new WriteOpVariantValue(value);
    }
}
exports.WriteOpVariantValue = WriteOpVariantValue;
class WriteSet {
    constructor(value) {
        this.value = value;
    }
    serialize(serializer) {
        this.value.serialize(serializer);
    }
    static deserialize(deserializer) {
        const value = WriteSetMut.deserialize(deserializer);
        return new WriteSet(value);
    }
}
exports.WriteSet = WriteSet;
class WriteSetMut {
    constructor(write_set) {
        this.write_set = write_set;
    }
    serialize(serializer) {
        Helpers.serializeVectorTuple2AccessPathWriteOp(this.write_set, serializer);
    }
    static deserialize(deserializer) {
        const write_set = Helpers.deserializeVectorTuple2AccessPathWriteOp(deserializer);
        return new WriteSetMut(write_set);
    }
}
exports.WriteSetMut = WriteSetMut;
class Helpers {
    static serializeArray16U8Array(value, serializer) {
        value.forEach((item) => {
            serializer.serializeU8(item[0]);
        });
    }
    static deserializeArray16U8Array(deserializer) {
        const list = [];
        for (let i = 0; i < 16; i++) {
            list.push([deserializer.deserializeU8()]);
        }
        return list;
    }
    static serializeOptionAuthenticationKey(value, serializer) {
        if (value) {
            serializer.serializeOptionTag(true);
            value.serialize(serializer);
        }
        else {
            serializer.serializeOptionTag(false);
        }
    }
    static deserializeOptionAuthenticationKey(deserializer) {
        const tag = deserializer.deserializeOptionTag();
        if (!tag) {
            return null;
        }
        else {
            return AuthenticationKey.deserialize(deserializer);
        }
    }
    static serializeOptionKeyRotationCapabilityResource(value, serializer) {
        if (value) {
            serializer.serializeOptionTag(true);
            value.serialize(serializer);
        }
        else {
            serializer.serializeOptionTag(false);
        }
    }
    static deserializeOptionKeyRotationCapabilityResource(deserializer) {
        const tag = deserializer.deserializeOptionTag();
        if (!tag) {
            return null;
        }
        else {
            return KeyRotationCapabilityResource.deserialize(deserializer);
        }
    }
    static serializeOptionScript(value, serializer) {
        if (value) {
            serializer.serializeOptionTag(true);
            value.serialize(serializer);
        }
        else {
            serializer.serializeOptionTag(false);
        }
    }
    static deserializeOptionScript(deserializer) {
        const tag = deserializer.deserializeOptionTag();
        if (!tag) {
            return null;
        }
        else {
            return Script.deserialize(deserializer);
        }
    }
    static serializeOptionWithdrawCapabilityResource(value, serializer) {
        if (value) {
            serializer.serializeOptionTag(true);
            value.serialize(serializer);
        }
        else {
            serializer.serializeOptionTag(false);
        }
    }
    static deserializeOptionWithdrawCapabilityResource(deserializer) {
        const tag = deserializer.deserializeOptionTag();
        if (!tag) {
            return null;
        }
        else {
            return WithdrawCapabilityResource.deserialize(deserializer);
        }
    }
    static serializeTuple2AccessPathWriteOp(value, serializer) {
        value[0].serialize(serializer);
        value[1].serialize(serializer);
    }
    static deserializeTuple2AccessPathWriteOp(deserializer) {
        return [
            AccessPath.deserialize(deserializer),
            WriteOp.deserialize(deserializer),
        ];
    }
    static serializeVectorArgumentAbi(value, serializer) {
        serializer.serializeLen(value.length);
        value.forEach((item) => {
            item.serialize(serializer);
        });
    }
    static deserializeVectorArgumentAbi(deserializer) {
        const length = deserializer.deserializeLen();
        const list = [];
        for (let i = 0; i < length; i++) {
            list.push(ArgumentABI.deserialize(deserializer));
        }
        return list;
    }
    static serializeVectorModule(value, serializer) {
        serializer.serializeLen(value.length);
        value.forEach((item) => {
            item.serialize(serializer);
        });
    }
    static deserializeVectorModule(deserializer) {
        const length = deserializer.deserializeLen();
        const list = [];
        for (let i = 0; i < length; i++) {
            list.push(Module.deserialize(deserializer));
        }
        return list;
    }
    static serializeVectorTransactionArgument(value, serializer) {
        serializer.serializeLen(value.length);
        value.forEach((item) => {
            item.serialize(serializer);
        });
    }
    static deserializeVectorTransactionArgument(deserializer) {
        const length = deserializer.deserializeLen();
        const list = [];
        for (let i = 0; i < length; i++) {
            list.push(TransactionArgument.deserialize(deserializer));
        }
        return list;
    }
    static serializeVectorTypeArgumentAbi(value, serializer) {
        serializer.serializeLen(value.length);
        value.forEach((item) => {
            item.serialize(serializer);
        });
    }
    static deserializeVectorTypeArgumentAbi(deserializer) {
        const length = deserializer.deserializeLen();
        const list = [];
        for (let i = 0; i < length; i++) {
            list.push(TypeArgumentABI.deserialize(deserializer));
        }
        return list;
    }
    static serializeVectorTypeTag(value, serializer) {
        serializer.serializeLen(value.length);
        value.forEach((item) => {
            item.serialize(serializer);
        });
    }
    static deserializeVectorTypeTag(deserializer) {
        const length = deserializer.deserializeLen();
        const list = [];
        for (let i = 0; i < length; i++) {
            list.push(TypeTag.deserialize(deserializer));
        }
        return list;
    }
    static serializeVectorTuple2AccessPathWriteOp(value, serializer) {
        serializer.serializeLen(value.length);
        value.forEach((item) => {
            Helpers.serializeTuple2AccessPathWriteOp(item, serializer);
        });
    }
    static deserializeVectorTuple2AccessPathWriteOp(deserializer) {
        const length = deserializer.deserializeLen();
        const list = [];
        for (let i = 0; i < length; i++) {
            list.push(Helpers.deserializeTuple2AccessPathWriteOp(deserializer));
        }
        return list;
    }
    static serializeVectorU8(value, serializer) {
        serializer.serializeLen(value.length);
        value.forEach((item) => {
            serializer.serializeU8(item);
        });
    }
    static deserializeVectorU8(deserializer) {
        const length = deserializer.deserializeLen();
        const list = [];
        for (let i = 0; i < length; i++) {
            list.push(deserializer.deserializeU8());
        }
        return list;
    }
}
exports.Helpers = Helpers;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbGliL3J1bnRpbWUvc3RhcmNvaW5fdHlwZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBMEJBLE1BQWEsVUFBVTtJQUNyQixZQUFtQixPQUF1QixFQUFTLElBQVc7UUFBM0MsWUFBTyxHQUFQLE9BQU8sQ0FBZ0I7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFPO0lBQUcsQ0FBQztJQUUzRCxTQUFTLENBQUMsVUFBc0I7UUFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbkMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELE1BQU0sQ0FBQyxXQUFXLENBQUMsWUFBMEI7UUFDM0MsTUFBTSxPQUFPLEdBQUcsY0FBYyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN6RCxNQUFNLElBQUksR0FBRyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUM3QyxPQUFPLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0NBQ0Y7QUFiRCxnQ0FhQztBQUNELE1BQWEsY0FBYztJQUN6QixZQUFtQixLQUF5QjtRQUF6QixVQUFLLEdBQUwsS0FBSyxDQUFvQjtJQUFHLENBQUM7SUFFekMsU0FBUyxDQUFDLFVBQXNCO1FBQ3JDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCxNQUFNLENBQUMsV0FBVyxDQUFDLFlBQTBCO1FBQzNDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM5RCxPQUFPLElBQUksY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25DLENB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