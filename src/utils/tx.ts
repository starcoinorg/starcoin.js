import * as ed from 'noble-ed25519';
import { stripHexPrefix, addHexPrefix } from 'ethereumjs-util';
import { arrayify, hexlify } from '@ethersproject/bytes';
import { bytes } from '../lib/runtime/serde';
import * as starcoin_types from '../lib/runtime/starcoin_types';
import { BcsSerializer } from '../lib/runtime/bcs';
import { FunctionId, HexString, parseFunctionId, TypeTag, U128, U64, U8 } from '../types';
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
  receiverInfo: string,
  amount: U128,
  maxGasAmount: U64,
  senderSequenceNumber: U64,
  expirationTimestampSecs: U64,
  chainId: U8
): starcoin_types.RawUserTransaction {

  // Step 1-1: generate payload hex of ScriptFunction

  let receiverAddress
  let receiverAuthKeyBytes
  if (receiverInfo.slice(0, 3) === 'stc') {
    const receiptIdentifier = starcoin_types.ReceiptIdentifier.decode(receiverInfo)
    receiverAddress = addressFromSCS(receiptIdentifier.accountAddress);
    if (receiptIdentifier.authKey) {
      receiverAuthKeyBytes = (() => {
        const se = new BcsSerializer();
        receiptIdentifier.authKey.serialize(se);
        return se.getBytes();
      })();
    } else {
      receiverAuthKeyBytes = Buffer.from('00', 'hex')
    }
  } else {
    receiverAddress = receiverInfo
    receiverAuthKeyBytes = Buffer.from('00', 'hex')
  }


  const functionId = '0x1::TransferScripts::peer_to_peer'

  const address = '0x1';
  const module = 'STC';
  const name = 'STC';
  const type_params = [];
  const tyArgs = [{ Struct: { address, module, name, type_params } }]

  // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
  const amountSCSHex = (function () {
    const se = new BcsSerializer();
    se.serializeU128(BigInt(amount));
    return hexlify(se.getBytes());
  })();

  const args = [
    arrayify(receiverAddress),
    receiverAuthKeyBytes,
    arrayify(amountSCSHex)
  ]

  const scriptFunction = encodeScriptFunction(functionId, tyArgs, args);

  // Step 1-2: generate RawUserTransaction
  const sender = addressToSCS(senderAddress)
  const sequence_number = BigInt(senderSequenceNumber)
  const payload = scriptFunction
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