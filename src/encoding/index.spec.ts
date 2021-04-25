import { addressToSCS, decodeEventKey, decodeTransactionPayload, decodeSignedUserTransaction } from '.';
import { BcsSerializer, BcsDeserializer } from '../lib/runtime/bcs';
import { toHexString } from '../utils/hex';
import { encodeScriptFunction, encodeSignedUserTransaction } from "../utils/tx";

test("encoding address", () => {
  expect(addressToSCS("0x1").value.length).toBe(16);
  expect(addressToSCS("0x01").value.length).toBe(16);
});

test("encoding TransactionPayload->ScriptFunction hex", () => {

  const functionId = '0x1::TransferScripts::peer_to_peer'

  const address = '0x1';
  // const address = '0x00000000000000000000000000000001';  // works too
  const module = 'STC';
  const name = 'STC';
  const type_params = [];
  const tyArgs = [{ Struct: { address, module, name, type_params } }]

  const args = [
    '0x1df9157f14b0041eed18dcc56520d829',
    '0x2065acc62b12c75ae0d0db89411a8481601df9157f14b0041eed18dcc56520d829',
    '0x0060d743dd500b000000000000000000'
  ]

  const scriptFunction = encodeScriptFunction(functionId, tyArgs, args);

  const se = new BcsSerializer();
  scriptFunction.serialize(se);
  const payloadInHex = toHexString(se.getBytes());

  const hexExpected = "0x02000000000000000000000000000000010f5472616e73666572536372697074730c706565725f746f5f7065657201070000000000000000000000000000000103535443035354430003101df9157f14b0041eed18dcc56520d829212065acc62b12c75ae0d0db89411a8481601df9157f14b0041eed18dcc56520d829100060d743dd500b000000000000000000";
  expect(payloadInHex).toBe(hexExpected);
});

test("decoding txn payload", () => {
  const payloadInHex = "0x02000000000000000000000000000000010f5472616e73666572536372697074730c706565725f746f5f7065657201070000000000000000000000000000000103535443035354430003101df9157f14b0041eed18dcc56520d829212065acc62b12c75ae0d0db89411a8481601df9157f14b0041eed18dcc56520d829100060d743dd500b000000000000000000";
  const txnPayload = decodeTransactionPayload(payloadInHex);
  expect(txnPayload.hasOwnProperty("ScriptFunction")).toBeTruthy();
  let scriptFunction = txnPayload["ScriptFunction"];
  expect(scriptFunction.func.functionName).toBe("peer_to_peer");
  expect(scriptFunction.args.length).toBe(3);
});

test("decoding EventKey", () => {
  const eventKeyInHex = "0x000000000000000063af4e1cf4e6345df840f4c57597a0f6";
  const eventKey = decodeEventKey(eventKeyInHex);
  console.log(eventKey);
});

test("encoding SignedUserTransaction hex", async () => {

  const senderPrivateKeyHex = '0x83c7829c68e1ad81ced10f69d11ea741f7f18c7a5f059215e8a965362a5ae25e'
  // TODO: generate address using privateKey
  const senderAddressHex = '0x49624992dd72da077ee19d0be210406a'

  const receiverAddressHex = '0x621500bf2b4aad17a690cb24f9a225c6'

  const amount = 1000000000

  const maxGasAmount = 124191

  const chainId = 254

  const signedUserTransaction = await encodeSignedUserTransaction(senderPrivateKeyHex, senderAddressHex, receiverAddressHex, amount, maxGasAmount, chainId);

  const hex = (function () {
    const se = new BcsSerializer();
    signedUserTransaction.serialize(se);
    return toHexString(se.getBytes());
  })();

  const hexExpected = "0x49624992dd72da077ee19d0be210406a100000000000000002000000000000000000000000000000010f5472616e73666572536372697074730c706565725f746f5f706565720107000000000000000000000000000000010353544303535443000310621500bf2b4aad17a690cb24f9a225c601001000ca9a3b0000000000000000000000001fe501000000000001000000000000000d3078313a3a5354433a3a535443e8ab000000000000fe002020e2c9a32b0ce41c3a5f4a5f010909741f12e265debcb681c9f9d58c2e69e65c4040288d5662f0f0e72d181073c00bd4f6a15fcfaf4911f6ac35827e09c5e6e02d0df0f2d1bb81c90617911362a39801b88cf6ae405ef226c2e6645a1e5c946e09";

  expect(hex).toBe(hexExpected);
});

test("decoding SignedUserTransaction hex", () => {
  const hex = "0x49624992dd72da077ee19d0be210406a100000000000000002000000000000000000000000000000010f5472616e73666572536372697074730c706565725f746f5f706565720107000000000000000000000000000000010353544303535443000310621500bf2b4aad17a690cb24f9a225c601001000ca9a3b0000000000000000000000001fe501000000000001000000000000000d3078313a3a5354433a3a535443e8ab000000000000fe002020e2c9a32b0ce41c3a5f4a5f010909741f12e265debcb681c9f9d58c2e69e65c4040288d5662f0f0e72d181073c00bd4f6a15fcfaf4911f6ac35827e09c5e6e02d0df0f2d1bb81c90617911362a39801b88cf6ae405ef226c2e6645a1e5c946e09";
  const signedUserTransaction = decodeSignedUserTransaction(hex);
  console.log(signedUserTransaction)
  expect(signedUserTransaction.transaction_hash).toBe("0x17d671d18736358b7e6665be3cde9d27a4e515f5f12ce9d014f45ff550be84d3");
  expect(signedUserTransaction.raw_txn.sender).toBe("0x49624992dd72da077ee19d0be210406a");
});