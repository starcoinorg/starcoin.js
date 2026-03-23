/**
 * VM2 transaction building utilities.
 *
 * Since VM2's EntryFunction is BCS-compatible with VM1's ScriptFunction
 * (same variant index, same field layout), we reuse the existing BCS types.
 * The naming aliases make intent clear when building VM2 transactions.
 */
import { bytes } from '../lib/runtime/serde';
import * as starcoin_types from '../lib/runtime/starcoin_types';
import { FunctionId, HexString, TypeTag, U64, U8 } from '../types';
/**
 * Encode a VM2 EntryFunction payload.
 *
 * BCS-compatible with VM1 ScriptFunction — reuses the same serialization
 * since both have variant index 2 and identical field layout:
 *   (module: ModuleId, function: Identifier, ty_args: Vec<TypeTag>, args: Vec<Vec<u8>>)
 */
export declare function encodeEntryFunction(functionId: FunctionId, tyArgs: TypeTag[], args: bytes[]): starcoin_types.TransactionPayloadVariantScriptFunction;
/**
 * Encode a VM2 EntryFunction by resolving argument types from the chain.
 * Uses contract2.resolve_function RPC method for VM2.
 */
export declare function encodeEntryFunctionByResolve(functionId: FunctionId, typeArgs: string[], args: any[], nodeUrl: string): Promise<starcoin_types.TransactionPayloadVariantScriptFunction>;
/**
 * Generate a RawUserTransaction for VM2.
 *
 * Identical BCS layout to VM1 — the struct fields are the same.
 * Alias provided for semantic clarity.
 */
export declare function generateRawUserTransactionV2(senderAddress: HexString, payload: starcoin_types.TransactionPayload, maxGasAmount: U64, gasUnitPrice: U64, senderSequenceNumber: U64, expirationTimestampSecs: U64, chainId: U8): starcoin_types.RawUserTransaction;
/**
 * Sign a VM2 raw user transaction and return the SignedUserTransaction object.
 */
export declare function getSignedUserTransactionV2(senderPrivateKey: HexString, rawUserTransaction: starcoin_types.RawUserTransaction): Promise<starcoin_types.SignedUserTransaction>;
/**
 * Sign a VM2 raw user transaction and return the hex string.
 */
export declare function signRawUserTransactionV2(senderPrivateKey: HexString, rawUserTransaction: starcoin_types.RawUserTransaction): Promise<string>;
