import { arrayify, hexlify } from '@ethersproject/bytes';
import { addressToSCS, decodeTransactionPayload, decodeSignedUserTransaction, privateKeyToPublicKey, publicKeyToAuthKey, publicKeyToAddress, publicKeyToReceiptIdentifier, encodeReceiptIdentifier, decodeReceiptIdentifier } from '.';
import { BcsSerializer } from '../lib/runtime/bcs';
import { toHexString } from '../utils/hex';
import { JsonRpcProvider } from '../providers/jsonrpc-provider';
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

test("encoding SignedUserTransaction hex, 0x1::DaoVoteScripts::cast_vote", async () => {

  const senderPrivateKeyHex = '0x...'

  const senderAddressHex = '0x0a6cd5d8711d88258adac029ffa6a3e4'

  const nodeUrl = 'https://main-seed.starcoin.org'

  const provider = new JsonRpcProvider(nodeUrl);

  const senderSequenceNumber = await provider.getSequenceNumber(senderAddressHex)

  console.log({ senderSequenceNumber })
  // TODO: generate maxGasAmount from contract.dry_run -> gas_used
  const maxGasAmount = 10000000

  const chainId = 1

  // because the time system in dev network is relatively static, 
  // we should use nodeInfo.now_secondsinstead of using new Date().getTime()
  const nowSeconds = await provider.getNowSeconds()
  // expired after 12 hours since Unix Epoch
  const expirationTimestampSecs = nowSeconds + 43200

  const functionId = '0x1::DaoVoteScripts::cast_vote'

  const tyArgs = [
    { Struct: { address: '0x1', module: 'STC', name: 'STC', type_params: [] } },
    { Struct: { address: '0x1', module: 'UpgradeModuleDaoProposal', name: 'UpgradeModuleV2', type_params: [] } }
  ]

  const proposerAdressHex = '0xb2aa52f94db4516c5beecef363af850a'
  const proposalId = 0
  const agree = true
  const votes = 10000000

  // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
  const proposalIdSCSHex = (function () {
    const se = new BcsSerializer();
    se.serializeU64(proposalId);
    return hexlify(se.getBytes());
  })();
  console.log({ proposalIdSCSHex });

  // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
  const agreeSCSHex = (function () {
    const se = new BcsSerializer();
    se.serializeBool(agree);
    return hexlify(se.getBytes());
  })();

  console.log({ agreeSCSHex });
  console.log(arrayify(agreeSCSHex));

  // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
  const votesSCSHex = (function () {
    const se = new BcsSerializer();
    se.serializeU128(BigInt(votes));
    return hexlify(se.getBytes());
  })();

  console.log({ votesSCSHex });
  console.log(arrayify(votesSCSHex));

  const args = [
    arrayify(proposerAdressHex),
    arrayify(proposalIdSCSHex),
    arrayify(agreeSCSHex),
    arrayify(votesSCSHex)
  ]

  const scriptFunction = encodeScriptFunction(functionId, tyArgs, args);

  const scriptFunctionSCSHex = (function () {
    const se = new BcsSerializer();
    scriptFunction.serialize(se);
    return hexlify(se.getBytes());
  })();
  const rawUserTransaction = generateRawUserTransaction(
    senderAddressHex,
    scriptFunction,
    maxGasAmount,
    senderSequenceNumber,
    expirationTimestampSecs,
    chainId
  );

  const hex = await signRawUserTransaction(
    senderPrivateKeyHex,
    rawUserTransaction
  );

  console.log({ hex })

  const signedUserTransactionDecoded = decodeSignedUserTransaction(hex);

  expect(signedUserTransactionDecoded.raw_txn.sender).toBe(senderAddressHex);
});

test("encoding SignedUserTransaction hex, 0x1::TransferScripts::peer_to_peer", async () => {

  const senderPrivateKeyHex = '0x...'

  const senderAddressHex = '0x0a6cd5d8711d88258adac029ffa6a3e4'

  const nodeUrl = 'https://main-seed.starcoin.org'

  const provider = new JsonRpcProvider(nodeUrl);

  const senderSequenceNumber = await provider.getSequenceNumber(senderAddressHex)

  // TODO: generate maxGasAmount from contract.dry_run -> gas_used
  const maxGasAmount = 10000000

  const chainId = 1

  // because the time system in dev network is relatively static, 
  // we should use nodeInfo.now_secondsinstead of using new Date().getTime()
  const nowSeconds = await provider.getNowSeconds()
  // expired after 12 hours since Unix Epoch
  const expirationTimestampSecs = nowSeconds + 43200

  const receiver = '0xd365E954D0Db53CCe197229db866C29F'
  const amount = 10000000
  // Step 1-1: generate payload hex of ScriptFunction
  let receiverAddressHex
  let receiverAuthKeyHex
  let receiverAuthKeyBytes
  if (receiver.slice(0, 3) === 'stc') {
    const receiptIdentifierView = decodeReceiptIdentifier(receiver)
    receiverAddressHex = receiptIdentifierView.accountAddress
    receiverAddressHex = receiptIdentifierView.authKey
    if (receiverAuthKeyHex) {
      receiverAuthKeyBytes = Buffer.from(receiverAuthKeyHex, 'hex')
    } else {
      receiverAuthKeyBytes = Buffer.from('00', 'hex')
    }
  } else {
    receiverAddressHex = receiver
    receiverAuthKeyBytes = Buffer.from('00', 'hex')
  }

  const functionId = '0x1::TransferScripts::peer_to_peer'

  const tyArgs = [{ Struct: { address: '0x1', module: 'STC', name: 'STC', type_params: [] } }]

  // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
  const amountSCSHex = (function () {
    const se = new BcsSerializer();
    se.serializeU128(BigInt(amount));
    return hexlify(se.getBytes());
  })();

  const args = [
    arrayify(receiverAddressHex),
    receiverAuthKeyBytes,
    arrayify(amountSCSHex)
  ]

  const scriptFunction = encodeScriptFunction(functionId, tyArgs, args);

  const rawUserTransaction = generateRawUserTransaction(
    senderAddressHex,
    scriptFunction,
    maxGasAmount,
    senderSequenceNumber,
    expirationTimestampSecs,
    chainId
  );

  const hex = await signRawUserTransaction(
    senderPrivateKeyHex,
    rawUserTransaction
  );

  console.log({ hex })
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