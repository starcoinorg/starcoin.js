import * as ed from '@starcoin/stc-ed25519';
import { stripHexPrefix, addHexPrefix } from 'ethereumjs-util';
import { arrayify, hexlify } from '@ethersproject/bytes';
import { bytes } from '../lib/runtime/serde';
import * as starcoin_types from '../lib/runtime/starcoin_types';
import { BcsSerializer } from '../lib/runtime/bcs';
import { FunctionId, HexString, parseFunctionId, TypeTag, U128, U64, U } from '../types';
import { addressToSCS, addressFromSCS, typeTagToSCS } from '../encoding';
import { createRawUserTransactionHasher } from "../crypto_hash";

export function encodeTransactionScript(
  code: bytes,
  ty_args: TypeTag[],
  args: HexString[]
): starcoin_types.TransactionPayloadVariantScript {
  const script = new starcoin_types.Script(
    code,
    ty_args.map((t) => typeTagToSCS(t)),
    args.map((t) => arrayify(t))
  );
  return new starcoin_types.TransactionPayloadVariantScript(script);
}

export function encodeScriptFunction(functionId: FunctionId,
  tyArgs: TypeTag[],
  args: bytes[]): starcoin_types.TransactionPayloadVariantScriptFunction {
  let funcId = parseFunctionId(functionId);
  const scriptFunction = new starcoin_types.ScriptFunction(
    new starcoin_types.ModuleId(addressToSCS(funcId.address), new starcoin_types.Identifier(funcId.module)),
    new starcoin_types.Identifier(funcId.functionName),
    tyArgs.map((t) => typeTagToSCS(t)),
    args
  );
  return new starcoin_types.TransactionPayloadVariantScriptFunction(scriptFunction);
}

export function encodePackage(
  moduleAddress: string,
  moduleCodes: HexString[],
  initScriptFunction?: { functionId: FunctionId; tyArgs: TypeTag[]; args: bytes[] }
): starcoin_types.TransactionPayloadVariantPackage {
  const modules = moduleCodes.map((m) => new starcoin_types.Module(arrayify(m)));
  let scriptFunction = null;
  if (!!initScriptFunction) {
    scriptFunction = encodeScriptFunction(initScriptFunction.functionId, initScriptFunction.tyArgs, initScriptFunction.args);
  }
  const packageData = new starcoin_types.Package(
    addressToSCS(moduleAddress),
    modules,
    scriptFunction
  );
  return new starcoin_types.TransactionPayloadVariantPackage(
    packageData
  );
}

// Step 1: generate RawUserTransaction
export function generateRawUserTransaction(
  senderAddress: HexString,
  payload: starcoin_types.TransactionPayload,
  maxGasAmount: U64,
  senderSequenceNumber: U64,
  expirationTimestampSecs: U64,
  chainId: U8
): starcoin_types.RawUserTransaction {

  // Step 1-2: generate RawUserTransaction
  const sender = addressToSCS(senderAddress)
  const sequence_number = BigInt(senderSequenceNumber)

  const max_gas_amount = BigInt(maxGasAmount)
  const gas_unit_price = BigInt(1)
  const gas_token_code = '0x1::STC::STC'
  const expiration_timestamp_secs = BigInt(expirationTimestampSecs)
  const chain_id = new starcoin_types.ChainId(chainId)

  const rawUserTransaction = new starcoin_types.RawUserTransaction(sender, sequence_number, payload, max_gas_amount, gas_unit_price, gas_token_code, expiration_timestamp_secs, chain_id)

  return rawUserTransaction
}

async function getSignatureHex(
  rawUserTransaction: starcoin_types.RawUserTransaction,
  senderPrivateKey: HexString,
): Promise<string> {

  const hasher = createRawUserTransactionHasher();
  const hashSeedBytes = hasher.get_salt();

  const rawUserTransactionBytes = (function () {
    const se = new BcsSerializer();
    rawUserTransaction.serialize(se);
    return se.getBytes();
  })();

  const msgBytes = ((a, b) => {
    const tmp = new Uint8Array(a.length + b.length);
    tmp.set(a, 0);
    tmp.set(b, a.length);
    return tmp;
  })(hashSeedBytes, rawUserTransactionBytes);

  const signatureBytes = await ed.sign(msgBytes, stripHexPrefix(senderPrivateKey))
  const signatureHex = hexlify(signatureBytes)

  return signatureHex
}

async function generateSignedUserTransaction(
  senderPrivateKey: HexString,
  signatureHex: string,
  rawUserTransaction: starcoin_types.RawUserTransaction
): Promise<starcoin_types.SignedUserTransaction> {
  // Step 3-1: generate authenticator
  const senderPublicKeyMissingPrefix = await ed.getPublicKey(stripHexPrefix(senderPrivateKey))

  const public_key = new starcoin_types.Ed25519PublicKey(arrayify(senderPublicKeyMissingPrefix, { allowMissingPrefix: true }))
  const signature = new starcoin_types.Ed25519Signature(arrayify(signatureHex))
  const transactionAuthenticatorVariantEd25519 = new starcoin_types.TransactionAuthenticatorVariantEd25519(public_key, signature)

  // Step 3-2: generate SignedUserTransaction
  const signedUserTransaction = new starcoin_types.SignedUserTransaction(rawUserTransaction, transactionAuthenticatorVariantEd25519)

  return signedUserTransaction
}

function getSignedUserTransactionHex(
  signedUserTransaction: starcoin_types.SignedUserTransaction
): string {
  const se = new BcsSerializer();
  signedUserTransaction.serialize(se);
  return hexlify(se.getBytes());
}

export async function signRawUserTransaction(
  senderPrivateKey: HexString,
  rawUserTransaction: starcoin_types.RawUserTransaction
): Promise<string> {

  // Step 2: generate signature of RawUserTransaction
  const signatureHex = await getSignatureHex(rawUserTransaction, senderPrivateKey)

  // Step 3: generate SignedUserTransaction
  const signedUserTransaction = await generateSignedUserTransaction(senderPrivateKey, signatureHex, rawUserTransaction)

  // Step 4: get SignedUserTransaction Hex
  const hex = getSignedUserTransactionHex(signedUserTransaction)

  return hex
}

function encodeStructTypeTag(
  str: string
): TypeTag {
  const arr = str.split('<');
  const arr1 = arr[0].split('::');
  const address = arr1[0];
  const module = arr1[1];
  const name = arr1[2];

  const params = arr[1] ? arr[1].replace('>', '').split(',') : [];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const type_params: TypeTag[] = [];
  if (params.length > 0) {
    params.forEach((param: string) => {
      type_params.push(encodeStructTypeTag(param));
    });
  }

  const result: TypeTag = {
    Struct: {
      address,
      module,
      name,
      type_params,
    },
  }
  return result
}

/**
 * while generate ScriptFunction, we need to encode a string array:
[
  'address1::module1::name1<address2::module2::name2>'
]

into a TypeTag array:

[
  {
    "Struct": {
      "address": "address1",
      "module": "module1",
      "name": "name1",
      "type_params": [
        {
          "Struct": {
            "address": "address2",
            "module": "module2",
            "name": "name2",
            "type_params": []
          }
        }
      ]
    }
  }
]
 */
export function encodeStructTypeTags(
  typeArgsString: string[]
): TypeTag[] {
  return typeArgsString.map((str) => encodeStructTypeTag(str))
}