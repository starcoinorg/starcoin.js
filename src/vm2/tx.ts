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
import {
  encodeScriptFunction,
  encodeStarcoinTypesScriptFunction,
  encodeScriptFunctionArgs,
  encodeStructTypeTags,
  generateRawUserTransaction,
  getSignatureHex,
  signTxn,
} from '../utils/tx';
import { addressToSCS } from '../encoding';
import { BcsSerializer } from '../lib/runtime/bcs';
import { hexlify } from '@ethersproject/bytes';
import { JsonRpcProvider } from '../providers/jsonrpc-provider';
import { stripHexPrefix } from 'ethereumjs-util';
import * as ed from '@noble/ed25519';

/**
 * Encode a VM2 EntryFunction payload.
 *
 * BCS-compatible with VM1 ScriptFunction — reuses the same serialization
 * since both have variant index 2 and identical field layout:
 *   (module: ModuleId, function: Identifier, ty_args: Vec<TypeTag>, args: Vec<Vec<u8>>)
 */
export function encodeEntryFunction(
  functionId: FunctionId,
  tyArgs: TypeTag[],
  args: bytes[]
): starcoin_types.TransactionPayloadVariantScriptFunction {
  return encodeScriptFunction(functionId, tyArgs, args);
}

/**
 * Encode a VM2 EntryFunction by resolving argument types from the chain.
 * Uses contract2.resolve_function RPC method for VM2.
 */
export async function encodeEntryFunctionByResolve(
  functionId: FunctionId,
  typeArgs: string[],
  args: any[],
  nodeUrl: string
): Promise<starcoin_types.TransactionPayloadVariantScriptFunction> {
  const tyArgs = encodeStructTypeTags(typeArgs);

  const provider = new JsonRpcProvider(nodeUrl);
  const { args: argsType } = await provider.send(
    'contract2.resolve_function',
    [functionId]
  );
  // Remove the first Signer type
  if (argsType[0] && argsType[0].type_tag === 'Signer') {
    argsType.shift();
  }

  const argsBytes = encodeScriptFunctionArgs(argsType, args);

  return encodeEntryFunction(functionId, tyArgs, argsBytes);
}

/**
 * Generate a RawUserTransaction for VM2.
 *
 * Identical BCS layout to VM1 — the struct fields are the same.
 * Alias provided for semantic clarity.
 */
export function generateRawUserTransactionV2(
  senderAddress: HexString,
  payload: starcoin_types.TransactionPayload,
  maxGasAmount: U64,
  gasUnitPrice: U64,
  senderSequenceNumber: U64,
  expirationTimestampSecs: U64,
  chainId: U8
): starcoin_types.RawUserTransaction {
  return generateRawUserTransaction(
    senderAddress,
    payload,
    maxGasAmount,
    gasUnitPrice,
    senderSequenceNumber,
    expirationTimestampSecs,
    chainId
  );
}

/**
 * Sign a VM2 raw user transaction and return the SignedUserTransaction object.
 */
export async function getSignedUserTransactionV2(
  senderPrivateKey: HexString,
  rawUserTransaction: starcoin_types.RawUserTransaction
): Promise<starcoin_types.SignedUserTransaction> {
  const signatureHex = await getSignatureHex(rawUserTransaction, senderPrivateKey);
  const senderPublicKeyMissingPrefix = <string><unknown>await ed.getPublicKey(stripHexPrefix(senderPrivateKey));
  return signTxn(senderPublicKeyMissingPrefix, signatureHex, rawUserTransaction);
}

/**
 * Sign a VM2 raw user transaction and return the hex string.
 */
export async function signRawUserTransactionV2(
  senderPrivateKey: HexString,
  rawUserTransaction: starcoin_types.RawUserTransaction
): Promise<string> {
  const signedUserTransaction = await getSignedUserTransactionV2(senderPrivateKey, rawUserTransaction);
  const se = new BcsSerializer();
  signedUserTransaction.serialize(se);
  return hexlify(se.getBytes());
}
