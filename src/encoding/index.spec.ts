import { arrayify } from '@ethersproject/bytes';
import { addressToSCS, decodeEventData, decodeEventKey, decodeTransactionPayload, decodeSignedUserTransaction, privateKeyToPublicKey, publicKeyToAuthKey, publicKeyToAddress, publicKeyToReceiptIdentifier, encodeReceiptIdentifier, decodeReceiptIdentifier } from '.';
import { BcsSerializer } from '../lib/runtime/bcs';
import { toHexString } from '../utils/hex';
import { JsonrpcProvider } from '../providers/jsonrpc-provider';
import { encodeScriptFunction, generateRawUserTransaction, signRawUserTransaction } from "../utils/tx";

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
    arrayify('0x1df9157f14b0041eed18dcc56520d829'),
    Buffer.from(''),
    arrayify('0x0060d743dd500b000000000000000000')
  ]

  const scriptFunction = encodeScriptFunction(functionId, tyArgs, args);

  const se = new BcsSerializer();
  scriptFunction.serialize(se);
  const payloadInHex = toHexString(se.getBytes());

  const hexExpected = "0x02000000000000000000000000000000010f5472616e73666572536372697074730c706565725f746f5f7065657201070000000000000000000000000000000103535443035354430003101df9157f14b0041eed18dcc56520d82900100060d743dd500b000000000000000000";
  expect(payloadInHex).toBe(hexExpected);
});

test("decoding txn payload", () => {
  const payloadInHex = "0x02000000000000000000000000000000010f5472616e73666572536372697074730c706565725f746f5f7065657201070000000000000000000000000000000103535443035354430003101df9157f14b0041eed18dcc56520d82900100060d743dd500b000000000000000000";
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

  const senderAddressHex = '0x49624992dd72da077ee19d0be210406a'

  const nodeUrl = 'http://localhost:9850'

  const provider = new JsonrpcProvider(nodeUrl);

  const senderSequenceNumber = await provider.getSequenceNumber(senderAddressHex)

  const receiverAddressHex = '0x621500bf2b4aad17a690cb24f9a225c6'

  const amount = 1000000000

  // TODO: generate maxGasAmount from contract.dry_run -> gas_used
  const maxGasAmount = 124191

  const chainId = 254

  // because the time system in dev network is relatively static, 
  // we should use nodeInfo.now_secondsinstead of using new Date().getTime()
  const nowSeconds = await provider.getNowSeconds()
  // expired after 12 hours since Unix Epoch
  const expirationTimestampSecs = nowSeconds + 43200

  const rawUserTransaction = generateRawUserTransaction(
    senderAddressHex,
    receiverAddressHex,
    amount,
    maxGasAmount,
    senderSequenceNumber,
    expirationTimestampSecs,
    chainId
  );

  const hex = await signRawUserTransaction(
    senderPrivateKeyHex,
    rawUserTransaction
  );

  const signedUserTransactionDecoded = decodeSignedUserTransaction(hex);

  expect(signedUserTransactionDecoded.raw_txn.sender).toBe(senderAddressHex);
});

test("decoding SignedUserTransaction hex", () => {
  const hex = "0x49624992dd72da077ee19d0be210406a100000000000000002000000000000000000000000000000010f5472616e73666572536372697074730c706565725f746f5f706565720107000000000000000000000000000000010353544303535443000310621500bf2b4aad17a690cb24f9a225c601001000ca9a3b0000000000000000000000001fe501000000000001000000000000000d3078313a3a5354433a3a535443e8ab000000000000fe002020e2c9a32b0ce41c3a5f4a5f010909741f12e265debcb681c9f9d58c2e69e65c4040288d5662f0f0e72d181073c00bd4f6a15fcfaf4911f6ac35827e09c5e6e02d0df0f2d1bb81c90617911362a39801b88cf6ae405ef226c2e6645a1e5c946e09";
  const signedUserTransaction = decodeSignedUserTransaction(hex);
  console.log(signedUserTransaction)
  expect(signedUserTransaction.transaction_hash).toBe("0x17d671d18736358b7e6665be3cde9d27a4e515f5f12ce9d014f45ff550be84d3");
  expect(signedUserTransaction.raw_txn.sender).toBe("0x49624992dd72da077ee19d0be210406a");
});

test("should convert public key to auth key correctly", () => {
  // work on barnard network
  const publicKey = '0xe8eba2c517d0b5012c20737b3627c58447ccd6098aaae84027520afcc82a4ded'
  const value = publicKeyToAuthKey(publicKey)
  console.log({ auth_key: value })
  expect(value).toBe(
    "0x049ad0f8c75341261eb354aba13b3a4f400e8f6e15f47c92519e2527fcd64b3a"
  );
});

test("should convert public key to address correctly", () => {
  const publicKey = '0xe8eba2c517d0b5012c20737b3627c58447ccd6098aaae84027520afcc82a4ded'
  const value = publicKeyToAddress(publicKey)
  console.log({ address: value })
  expect(value).toBe(
    "0x400e8f6e15f47c92519e2527fcd64b3a"
  );
});

test("should convert private key to publick key correctly", async () => {
  const privateKey = '0xa6d8991ca3d6813f493d13216d6dedd30211a649d21b2ca102b860bea51045fd'
  const value = await privateKeyToPublicKey(privateKey)
  console.log({ publicKey: value })
  expect(value).toBe(
    "0xe8eba2c517d0b5012c20737b3627c58447ccd6098aaae84027520afcc82a4ded"
  );
});

test("publicKeyToReceiptIdentifier", () => {
  const publicKey = "0x94c3732e3c08eee7738d33b4e6f74daa615da14a94607ac00b531d189cb5b0dd"
  const encodedStrExcepted = "stc1pvg2sp0etf2k30f5sevj0ng39cmhuvhh4vzevdu07ksg38r0mrd0xy9gqhu454tgh56gvkf8e5gjuv6hqjnv"

  const encodedStr = publicKeyToReceiptIdentifier(publicKey)
  expect(encodedStr).toBe(encodedStrExcepted)
});

test("encode && decode receipt identifier", () => {
  const address = "1603d10ce8649663e4e5a757a8681833";
  const authKey = "93dcc435cfca2dcf3bf44e9948f1f6a98e66a1f1b114a4b8a37ea16e12beeb6d";

  // address + authKey
  (() => {
    const encodedStrExcepted = "stc1pzcpazr8gvjtx8e895at6s6qcxwfae3p4el9zmnem738fjj83765cue4p7xc3ff9c5dl2zmsjhm4k63mmwta"

    const encodedStr = encodeReceiptIdentifier(address, authKey)
    expect(encodedStr).toBe(encodedStrExcepted)

    const receiptIdentifier = decodeReceiptIdentifier(encodedStr)
    expect(receiptIdentifier.accountAddress).toBe(address)
    expect(receiptIdentifier.authKey).toBe(authKey)
  })();

  // address only
  (() => {
    const encodedStrExcepted = "stc1pzcpazr8gvjtx8e895at6s6qcxvs4ct50"

    const encodedStr = encodeReceiptIdentifier(address)
    expect(encodedStr).toBe(encodedStrExcepted)

    const receiptIdentifier = decodeReceiptIdentifier(encodedStr)
    expect(receiptIdentifier.accountAddress).toBe(address)
    expect(receiptIdentifier.authKey).toBe("")
  })();

  // address + empty authKey
  (() => {
    const encodedStrExcepted = "stc1pzcpazr8gvjtx8e895at6s6qcxvs4ct50"

    const encodedStr = encodeReceiptIdentifier(address, "")
    expect(encodedStr).toBe(encodedStrExcepted)

    const receiptIdentifier = decodeReceiptIdentifier(encodedStr)
    expect(receiptIdentifier.accountAddress).toBe(address)
    expect(receiptIdentifier.authKey).toBe("")
  })();

});

// To test and see the decoded event data structure, run:
// yarn test:unit  src/encoding/index.spec.ts --testNamePattern="decode"

test('decode deposit event data', () => {
  const eventName = 'DepositEvent';
  const eventData = '0x00ca9a3b00000000000000000000000000000000000000000000000000000001035354430353544300';
  const result = decodeEventData(eventName, eventData);
  console.log(result.toJS());
});

test('decode withdraw event data', () => {
  const eventName = 'WithdrawEvent';
  const eventData = '0x00e1f50500000000000000000000000000000000000000000000000000000001035354430353544300';
  const result = decodeEventData(eventName, eventData);
  console.log(result.toJS());
});

test('decode new block event data', () => {
  const eventName = 'NewBlockEvent';
  const eventData = '0x440000000000000094e957321e7bb2d3eb08ff6be81a6fcdec8a9d73780100000000000000000000';
  const result = decodeEventData(eventName, eventData);
  console.log(result.toJS());
});

test('decode block reward event data', () => {
  const eventName = 'BlockRewardEvent';
  const eventData = '0x57fa0200000000006041c420010000000000000000000000000000000000000000000000000000009a306cd9afde5d249257c2c6e6f39103';
  const result = decodeEventData(eventName, eventData);
  console.log(result.toJS());
});

test('decode accept token event data', () => {
  const eventName = 'AcceptTokenEvent';
  const eventData = '0x000000000000000000000000000000010353544303535443';
  const result = decodeEventData(eventName, eventData);
  console.log(result.toJS());
});

test('decode mint event data', () => {
  const eventName = 'MintEvent';
  const eventData = '0x80cb29d0000000000000000000000000000000000000000000000000000000010353544303535443';
  const result = decodeEventData(eventName, eventData);
  console.log(result.toJS());
});

test('decode vote changed event data', () => {
  const eventName = 'VoteChangedEvent';
  const eventData = '0x0a000000000000000000000000000000000000000a550c180000000000000000000000000a550c180100003426f56b1c000000000000000000';
  const result = decodeEventData(eventName, eventData);
  console.log(result.toJS());
});

test('decode proposal created event data', () => {
  const eventName = 'ProposalCreatedEvent';
  const eventData = '0x03000000000000000000000000000000000000000a550c18';
  const result = decodeEventData(eventName, eventData);
  console.log(result.toJS());
});


// Decode event key
test("decode event key", () => {
  const eventKeyInHex = "0x000000000000000063af4e1cf4e6345df840f4c57597a0f6";
  const eventKey = decodeEventKey(eventKeyInHex);
  console.log(eventKey);
})
