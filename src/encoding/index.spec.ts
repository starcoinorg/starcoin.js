import { addressToSCS, decodeEventKey, decodeTransactionPayload } from '.';

test("encoding address", () => {
  expect(addressToSCS("0x1").value.length).toBe(16);
  expect(addressToSCS("0x01").value.length).toBe(16);
});

test("decoding txn payload", () => {
  const payloadInHex = "0x02000000000000000000000000000000010f5472616e73666572536372697074730c706565725f746f5f7065657201070000000000000000000000000000000103535443035354430003101df9157f14b0041eed18dcc56520d829212065acc62b12c75ae0d0db89411a8481601df9157f14b0041eed18dcc56520d829100060d743dd500b000000000000000000";
  const txnPayload = decodeTransactionPayload(payloadInHex);
  expect(txnPayload.hasOwnProperty("ScriptFunction")).toBeTruthy();
  let scriptFunction  = txnPayload["ScriptFunction"];
  expect(scriptFunction.func.functionName).toBe("peer_to_peer");
  expect(scriptFunction.args.length).toBe(3);
});

test("decoding EventKey", () => {
  const eventKeyInHex= "0x000000000000000063af4e1cf4e6345df840f4c57597a0f6";
  const eventKey = decodeEventKey(eventKeyInHex);
  console.log(eventKey);
});
