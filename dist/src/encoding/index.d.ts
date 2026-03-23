import { BytesLike } from '@ethersproject/bytes';
import * as starcoin_types from '../lib/runtime/starcoin_types';
import * as serde from '../lib/runtime/serde';
import { AccountAddress, SignedUserTransactionView, StructTag, TransactionPayload, TypeTag, ReceiptIdentifierView } from '../types';
import { Deserializer } from '../lib/runtime/serde';
export interface SerdeSerializable {
    serialize(serializer: serde.Serializer): void;
}
export interface Deserializable<T> {
    deserialize(deserializer: Deserializer): T;
}
export declare function bcsDecode<D extends Deserializable<T>, T>(t: D, data: BytesLike): T;
export declare function bcsEncode(data: SerdeSerializable): string;
export declare function decodeSignedUserTransaction(data: BytesLike): SignedUserTransactionView;
export declare function decodeTransactionPayload(payload: BytesLike): TransactionPayload;
export declare function packageHexToTransactionPayload(packageHex: string): starcoin_types.TransactionPayload;
export declare function packageHexToTransactionPayloadHex(packageHex: string): string;
export declare function addressToSCS(addr: AccountAddress): starcoin_types.AccountAddress;
export declare function addressFromSCS(addr: starcoin_types.AccountAddress): AccountAddress;
export declare function typeTagToSCS(ty: TypeTag): starcoin_types.TypeTag;
export declare function structTagToSCS(data: StructTag): starcoin_types.StructTag;
export declare function structTagFromSCS(bcs_data: starcoin_types.StructTag): StructTag;
export declare function typeTagFromSCS(bcs_data: starcoin_types.TypeTag): TypeTag;
export declare function privateKeyToPublicKey(privateKey: string): Promise<string>;
export declare function publicKeyToAuthKey(publicKey: string, singleMulti?: number): string;
export declare function publicKeyToAddress(publicKey: string, singleMulti?: number): string;
export declare function encodeReceiptIdentifier(addressStr: string, authKeyStr?: string): string;
export declare function decodeReceiptIdentifier(value: string): ReceiptIdentifierView;
export declare function publicKeyToReceiptIdentifier(publicKey: string): string;
export declare function stringToBytes(str: string): BytesLike;
export declare function bytesToString(arr: BytesLike): string;
/**
 * Decode a VM2 transaction payload.
 * Returns 'EntryFunction' key instead of 'ScriptFunction' for variant index 2.
 * BCS format is identical — only the key name differs.
 */
export declare function decodeTransactionPayloadVM2(payload: BytesLike): TransactionPayload;
