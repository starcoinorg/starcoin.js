import { sha3_256 } from 'js-sha3';
import * as ed from 'noble-ed25519';
import { stripHexPrefix } from 'ethereumjs-util';
import { arrayify, hexlify } from '@ethersproject/bytes';
import { bytes } from '../lib/runtime/serde';
import * as starcoin_types from '../lib/runtime/starcoin_types';
import { BcsSerializer } from '../lib/runtime/bcs';
import { FunctionId, HexString, parseFunctionId, TypeTag, U128, U64, U8 } from '../types';
import { addressToSCS, typeTagToSCS } from '../encoding';


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
  args: HexString[]): starcoin_types.TransactionPayloadVariantScriptFunction {
  let funcId = parseFunctionId(functionId);
  const scriptFunction = new starcoin_types.ScriptFunction(
    new starcoin_types.ModuleId(addressToSCS(funcId.address), new starcoin_types.Identifier(funcId.module)),
    new starcoin_types.Identifier(funcId.functionName),
    tyArgs.map((t) => typeTagToSCS(t)),
    args.map((t) => arrayify(t))
  );
  return new starcoin_types.TransactionPayloadVariantScriptFunction(scriptFunction);
}

export function encodePackage(
  moduleAddress: string,
  moduleCodes: HexString[],
  initScriptFunction?: { functionId: FunctionId; tyArgs: TypeTag[]; args: HexString[] }
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

export async function encodeSignedUserTransaction(
  senderPrivateKey: HexString,
  senderAddress: HexString,
  receiverAddress: HexString,
  amount: U128,
  maxGasAmount: U64,
  chainId: U8
): Promise<string> {

  // Step 1: generate payload hex of ScriptFunction

  // TODO: check the receiver exists on the chain or not
  // assuming the receiver exists on the chain already
  const receiverAuthKeyHex = '0x00'

  const functionId = '0x00000000000000000000000000000001::TransferScripts::peer_to_peer'

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
    receiverAddress,
    receiverAuthKeyHex,
    amountSCSHex
  ]

  const scriptFunction = encodeScriptFunction(functionId, tyArgs, args);

  const payloadInHex = (function () {
    const se = new BcsSerializer();
    scriptFunction.serialize(se);
    return hexlify(se.getBytes());
  })();

  console.log({ payloadInHex })

  // Step 2: generate RawUserTransaction
  const sender = addressToSCS(senderAddress)
  // TODO: call get_sequence_number
  const sequence_number = BigInt(16)
  const payload = scriptFunction
  const max_gas_amount = BigInt(maxGasAmount)
  const gas_unit_price = BigInt(1)
  const gas_token_code = '0x1::STC::STC'
  // expired after 12 hours(43200 seconds)
  // TODO: call node.info, now_seconds + 43200  
  const expiration_timestamp_secs = BigInt(44008)
  const chain_id = new starcoin_types.ChainId(chainId)

  const rawUserTransaction = new starcoin_types.RawUserTransaction(sender, sequence_number, payload, max_gas_amount, gas_unit_price, gas_token_code, expiration_timestamp_secs, chain_id)

  // Step 3: generate signature of RawUserTransaction

  const HASH_PRE_FIX = 'STARCOIN::'
  const typeName = 'RawUserTransaction'

  const salt = `${HASH_PRE_FIX}${typeName}`

  const hashSeed = sha3_256.create();
  hashSeed.update(salt);
  const hashSeedBytes = hashSeed.digest();

  const rawUserTransactionBytes = (function () {
    const se = new BcsSerializer();
    rawUserTransaction.serialize(se);
    return se.getBytes();
  })();

  const megBytes = new Uint8Array([...hashSeedBytes, ...rawUserTransactionBytes]);

  const signatureBytes = await ed.sign(megBytes, stripHexPrefix(senderPrivateKey))
  const signatureHex = hexlify(signatureBytes)
  console.log({ signatureHex })

  return "0x49624992dd72da077ee19d0be210406a100000000000000002000000000000000000000000000000010f5472616e73666572536372697074730c706565725f746f5f706565720107000000000000000000000000000000010353544303535443000310621500bf2b4aad17a690cb24f9a225c601001000ca9a3b0000000000000000000000001fe501000000000001000000000000000d3078313a3a5354433a3a535443e8ab000000000000fe002020e2c9a32b0ce41c3a5f4a5f010909741f12e265debcb681c9f9d58c2e69e65c4040288d5662f0f0e72d181073c00bd4f6a15fcfaf4911f6ac35827e09c5e6e02d0df0f2d1bb81c90617911362a39801b88cf6ae405ef226c2e6645a1e5c946e09";
}
