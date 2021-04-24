import { arrayify, BytesLike, hexlify } from '@ethersproject/bytes';
import { BcsSerializer } from '../lib/runtime/bcs';
import { TypeTag } from '../types';
import { toHexString } from './hex';
import { encodeScriptFunction } from "./tx";

describe("tx", () => {
  test("generate TransactionPayload->ScriptFunction hex", () => {
    // associated decoding test case: encoding/index.spec.ts -> "decoding txn payload"
    const payloadInHexExpected = "0x02000000000000000000000000000000010f5472616e73666572536372697074730c706565725f746f5f7065657201070000000000000000000000000000000103535443035354430003101df9157f14b0041eed18dcc56520d829212065acc62b12c75ae0d0db89411a8481601df9157f14b0041eed18dcc56520d829100060d743dd500b000000000000000000";

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

    expect(payloadInHex).toBe(payloadInHexExpected);
  });
});


