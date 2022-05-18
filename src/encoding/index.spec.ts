import { arrayify, hexlify, isHexString } from '@ethersproject/bytes';
import { addHexPrefix } from 'ethereumjs-util';
import { BigNumber } from '@ethersproject/bignumber';
import * as fs from "fs";
import path from "path";
import {
  addressToSCS, decodeTransactionPayload, decodeSignedUserTransaction, privateKeyToPublicKey,
  publicKeyToAuthKey, publicKeyToAddress, publicKeyToReceiptIdentifier, encodeReceiptIdentifier,
  decodeReceiptIdentifier, bytesToString, stringToBytes, bcsEncode
} from '.';
import { BcsSerializer, BcsDeserializer } from '../lib/runtime/bcs';
import * as starcoin_types from '../lib/runtime/starcoin_types';
import { toHexString } from '../utils/hex';
import { JsonRpcProvider } from '../providers/jsonrpc-provider';
import {
  encodePackage, encodeScriptFunction, generateRawUserTransaction, signRawUserTransaction, encodeStructTypeTags, encodeScriptFunctionByResolve
} from "../utils/tx";

test("encoding token", () => {
  const token = '0x00000000000000000000000000000001::STC::STC'
  console.log(token)
  const tokenUint8Array = new Uint8Array(Buffer.from(token))
  console.log(tokenUint8Array)
  const se = new BcsSerializer();
  se.serializeBytes(tokenUint8Array)
  const tokenHex = toHexString(se.getBytes());
  console.log(tokenHex)
});

test("encoding address", () => {
  expect(addressToSCS("0x1").value.length).toBe(16);
  expect(addressToSCS("0x01").value.length).toBe(16);
});

test("encodeScriptFunction hex", async () => {

  const functionId = '0x1::TransferScripts::peer_to_peer_v2'

  const strTypeArgs = ['0x1::STC::STC']
  const tyArgs = encodeStructTypeTags(strTypeArgs)

  const args = [
    arrayify('0x1df9157f14b0041eed18dcc56520d829'),
    arrayify('0x0060d743dd500b000000000000000000')
  ]
  console.log({ args })
  const scriptFunction = encodeScriptFunction(functionId, tyArgs, args);

  const se = new BcsSerializer();
  scriptFunction.serialize(se);
  const payloadInHex = toHexString(se.getBytes());

  const hexExpected = "0x02000000000000000000000000000000010f5472616e73666572536372697074730f706565725f746f5f706565725f763201070000000000000000000000000000000103535443035354430002101df9157f14b0041eed18dcc56520d829100060d743dd500b000000000000000000";
  expect(payloadInHex).toBe(hexExpected);
}, 10000);


test("encodeScriptFunctionByResolve", async () => {
  const functionId = '0x1::TransferScripts::peer_to_peer_v2'
  const typeArgs = ['0x1::STC::STC']
  const args = [
    '0x1df9157f14b0041eed18dcc56520d829',
    3185136000000000,
  ]
  const nodeUrl = 'https://barnard-seed.starcoin.org'
  const scriptFunction = await encodeScriptFunctionByResolve(functionId, typeArgs, args, nodeUrl);

  const se = new BcsSerializer();
  scriptFunction.serialize(se);
  const payloadInHex = toHexString(se.getBytes());
  console.log(payloadInHex)

  const hexExpected = "0x02000000000000000000000000000000010f5472616e73666572536372697074730f706565725f746f5f706565725f763201070000000000000000000000000000000103535443035354430002101df9157f14b0041eed18dcc56520d829100060d743dd500b000000000000000000";
  expect(payloadInHex).toBe(hexExpected);
}, 10000);

test("encodeScriptFunctionByResolve2", async () => {
  const record = {
    airDropId: 1629183961184,
    ownerAddress: '0x3f19d5422824f47e6c021978cee98f35',
    root: '0x95897dd6c2fb94d0543dc745471c12910eff0e9b886686c79e251038cb1b4d02',
    address: '0x3f19d5422824f47e6c021978cee98f35',
    idx: 0,
    amount: 1000000000,
    proof: [
      '0x8e942cfc78768a015a18657d8da260ce16744136cea62a9dd17159a9f0dc5110'
    ],
  }
  const functionId = '0xb987F1aB0D7879b2aB421b98f96eFb44::MerkleDistributorScript::claim_script'
  const typeArgs = ['0x1::STC::STC']
  const args = [record.ownerAddress, record.airDropId, record.root, record.idx, record.amount, record.proof]

  const nodeUrl = 'https://barnard-seed.starcoin.org'
  const scriptFunction = await encodeScriptFunctionByResolve(functionId, typeArgs, args, nodeUrl);

  const se = new BcsSerializer();
  scriptFunction.serialize(se);
  const payloadInHex = toHexString(se.getBytes());
  // console.log({ payloadInHex })
  const hexExpected = "0x02b987f1ab0d7879b2ab421b98f96efb44174d65726b6c654469737472696275746f725363726970740c636c61696d5f73637269707401070000000000000000000000000000000103535443035354430006103f19d5422824f47e6c021978cee98f35086068ee527b010000212095897dd6c2fb94d0543dc745471c12910eff0e9b886686c79e251038cb1b4d020800000000000000001000ca9a3b0000000000000000000000002201208e942cfc78768a015a18657d8da260ce16744136cea62a9dd17159a9f0dc5110";
  expect(payloadInHex).toBe(hexExpected);
}, 10000);


test("encodeScriptFunctionByResolve3", async () => {
  const nft = {
    name: 'mytestnft',
    image: 'ipfs:://QmSPcvcXgdtHHiVTAAarzTeubk5X3iWymPAoKBfiRFjPMY',
    description: 'mytestnftdescription',
  }
  const functionId = '0x2c5bd5fb513108d4557107e09c51656c::SimpleNFTScripts::mint_with_image'
  const tyArgs = []
  // the following 2 args[] both should be work
  // const args = [hexlify(stringToBytes(nft.name)), hexlify(stringToBytes(nft.image)), hexlify(stringToBytes(nft.description))]
  const args = [nft.name, nft.image, nft.description]

  const nodeUrl = 'https://barnard-seed.starcoin.org'
  // console.log({ functionId, tyArgs, args, nodeUrl })

  const scriptFunction = await encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)

  const payloadInHex = (function () {
    const se = new BcsSerializer()
    scriptFunction.serialize(se)
    return hexlify(se.getBytes())
  })()
  // console.log({ payloadInHex })

  const hexExpected = "0x022c5bd5fb513108d4557107e09c51656c1053696d706c654e4654536372697074730f6d696e745f776974685f696d61676500030a096d79746573746e66743736697066733a3a2f2f516d5350637663586764744848695654414161727a546575626b3558336957796d50416f4b42666952466a504d5915146d79746573746e66746465736372697074696f6e";
  expect(payloadInHex).toBe(hexExpected);
}, 10000);


test("encodeScriptFunctionByResolve4", async () => {
  const functionId = '0x18351d311d32201149a4df2a9fc2db8a::CrossChainScript::lock_with_stc_fee'
  const tyArgs = []
  // const args = [
  //   '0x18351d311d32201149a4df2a9fc2db8a::XETH::XETH',
  //   2,
  //   '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
  //   10000000,
  //   50000000,
  //   1
  // ]
  // const args = [
  //   '0x00000000000000000000000000000001::STC::STC',
  //   318,
  //   '0x18351d311d32201149a4df2a9fc2db8a',
  //   10000000,
  //   50000000,
  //   1
  // ]
  // const scriptFunction = await encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl);


  const nodeUrl = 'https://barnard-seed.starcoin.org'

  const provider = new JsonRpcProvider(nodeUrl);
  const { args: argsType } = await provider.send(
    'contract.resolve_function',
    [functionId]
  );
  // Remove the first Signer type
  if (argsType[0] && argsType[0].type_tag === 'Signer') {
    argsType.shift();
  }
  console.log(JSON.stringify(argsType, null, 2))

  // const fromAssetHash = "0x00000000000000000000000000000001::STC::STC"
  // const toChainId = 318
  // const toAddress = "0x18351d311d32201149a4df2a9fc2db8a"
  // const amount = 10000000
  // const fee = 5000000
  // const id = 1

  const fromAssetHash = "0x18351d311d32201149a4df2a9fc2db8a::XETH::XETH"
  const toChainId = 2
  const toAddress = "0x208d1ae5bb7fd323ce6386c443473ed660825d46"
  const amount = 115555000000
  const fee = 5000000
  const id = 1

  const fromAssetHashU8 = new Uint8Array(Buffer.from(fromAssetHash))
  const fromAssetHashHex = (function () {
    const se = new BcsSerializer();
    se.serializeStr(fromAssetHash);
    console.log(se.getBytes())
    // do not include vector's length
    return hexlify(se.getBytes());
  })();

  console.log({ fromAssetHash, fromAssetHashU8, fromAssetHashHex })

  const toChainIdHex = (function () {
    const se = new BcsSerializer();
    se.serializeU64(toChainId);
    return hexlify(se.getBytes());
  })();

  const toAddressHex = (function () {
    const se = new BcsSerializer();
    se.serializeBytes(arrayify(toAddress));
    return hexlify(se.getBytes());
  })();

  const amountHex = (function () {
    const se = new BcsSerializer();
    se.serializeU128(amount);
    return hexlify(se.getBytes());
  })();

  const feeHex = (function () {
    const se = new BcsSerializer();
    se.serializeU128(fee);
    return hexlify(se.getBytes());
  })();

  const idHex = (function () {
    const se = new BcsSerializer();
    se.serializeU128(id);
    return hexlify(se.getBytes());
  })();
  const args = [
    arrayify(fromAssetHashHex),
    arrayify(toChainIdHex),
    arrayify(toAddressHex),
    arrayify(amountHex),
    arrayify(feeHex),
    arrayify(idHex),
  ];
  console.log({ fromAssetHashHex, args });
  const scriptFunction = encodeScriptFunction(functionId, tyArgs, args);

  console.log(JSON.stringify(scriptFunction, null, 2))
  const se = new BcsSerializer();
  scriptFunction.serialize(se);
  const payloadInHex = toHexString(se.getBytes());
  console.log(payloadInHex)

  const senderPrivateKeyHex = 'ac4e1d2b8ef0503ce5a5156d075c3b014045f2db4892d2df9334957b8bfd8be7'

  const senderAddressHex = '0xeb9a0d1628fddba79b932ced2623b1a4'

  const senderSequenceNumber = await provider.getSequenceNumber(senderAddressHex)

  // TODO: generate maxGasAmount from contract.dry_run -> gas_used
  const maxGasAmount = 40000000
  const gasUnitPrice = 1
  const chainId = 251

  // because the time system in dev network is relatively static,
  // we should use nodeInfo.now_secondsinstead of using new Date().getTime()
  const nowSeconds = await provider.getNowSeconds()
  // expired after 12 hours since Unix Epoch
  const expiredSecs = 43200
  const expirationTimestampSecs = nowSeconds + expiredSecs

  console.log({
    senderAddressHex,
    maxGasAmount,
    gasUnitPrice,
    senderSequenceNumber,
    expirationTimestampSecs,
    chainId
  })
  const rawUserTransaction = generateRawUserTransaction(
    senderAddressHex,
    scriptFunction,
    maxGasAmount,
    gasUnitPrice,
    senderSequenceNumber,
    expirationTimestampSecs,
    chainId
  );

  const rawUserTransactionHex = bcsEncode(rawUserTransaction);
  console.log({ rawUserTransactionHex })

  const signRawUserTransactionHex = await signRawUserTransaction(
    senderPrivateKeyHex,
    rawUserTransaction
  );

  console.log({ signRawUserTransactionHex })

  // const signedUserTransactionDecoded = decodeSignedUserTransaction(hex);

  // const hexExpected = "0x02000000000000000000000000000000010f5472616e73666572536372697074730f706565725f746f5f706565725f763201070000000000000000000000000000000103535443035354430002101df9157f14b0041eed18dcc56520d829100060d743dd500b000000000000000000";
  // expect(payloadInHex).toBe(hexExpected);
}, 10000);

test("encodeScriptFunctionByResolve5", async () => {
  const nft = {
    name: 'mytestnft',
    image: 'ipfs:://QmSPcvcXgdtHHiVTAAarzTeubk5X3iWymPAoKBfiRFjPMY',
    description: '',
  }
  const functionId = '0x2c5bd5fb513108d4557107e09c51656c::SimpleNFTScripts::mint_with_image'
  const tyArgs = []
  const args = [nft.name, nft.image, nft.description]

  const nodeUrl = 'https://barnard-seed.starcoin.org'

  const scriptFunction = await encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)
  expect(args[2]).toBe('');
  expect(scriptFunction.value.args[2].length).toBe(1);
  expect(scriptFunction.value.args[2][0]).toBe(0);
}, 10000);

test("encodeScriptFunctionByResolve6", async () => {
  const address = '0xedb4a7199ae49f76991614CF4C39c585'
  const privateKey = '0a4a0fe4985df2590ac59c208775f36438a47193ce6eeb197964d8a8f8a6a1f9'
  const STC_SCALLING_FACTOR = 1000000000
  const addressArray = [
    '0xFB400ab8753213Cb40c286E740534Ab9',
  ];
  const amountArray = [];
  addressArray.forEach(() => {
    amountArray.push(0.1 * STC_SCALLING_FACTOR)
  });
  // console.log({ addressArray, amountArray })
  const functionId = '0x1::TransferScripts::batch_peer_to_peer_v2'
  const typeArgs = ['0x1::STC::STC']
  const args = [addressArray, amountArray]

  const nodeUrl = 'https://barnard-seed.starcoin.org'
  const scriptFunction = await encodeScriptFunctionByResolve(functionId, typeArgs, args, nodeUrl);

  const se = new BcsSerializer();
  scriptFunction.serialize(se);
  // const payloadInHex = toHexString(se.getBytes());
  // const hexExpected = "0x02000000000000000000000000000000010f5472616e73666572536372697074731562617463685f706565725f746f5f706565725f76320107000000000000000000000000000000010353544303535443000212011022a19240709cb17ec9523252aa17b997110100aea68f020000000000000000000000";
  // expect(payloadInHex).toBe(hexExpected);
  const provider = new JsonRpcProvider(nodeUrl);
  const senderSequenceNumber = await provider.getSequenceNumber(address)
  const chainId = 251;
  const nowSeconds = await provider.getNowSeconds();
  // console.log({ senderSequenceNumber, nowSeconds })
  const rawUserTransaction = generateRawUserTransaction(
    address,
    scriptFunction,
    10000000,   //maxGasAmount
    1,          // gasUnitPrice
    senderSequenceNumber,
    nowSeconds + 43200,
    chainId,
  );

  const rawUserTransactionHex = bcsEncode(rawUserTransaction)
  // console.log({ rawUserTransactionHex })

  const signedUserTransactionHex = await signRawUserTransaction(
    privateKey,
    rawUserTransaction,
  );

  const txn = await provider.sendTransaction(signedUserTransactionHex);
  console.log(txn);
  const txnInfo = await txn.wait(1);
  // console.log(txnInfo);

  expect(txnInfo.status).toBe('Executed');
}, 60000);

test("decoding txn payload", () => {
  const payloadInHex = "0x02000000000000000000000000000000010f5472616e73666572536372697074730c706565725f746f5f7065657201070000000000000000000000000000000103535443035354430003101df9157f14b0041eed18dcc56520d82900100060d743dd500b000000000000000000";
  const txnPayload = decodeTransactionPayload(payloadInHex);
  expect(txnPayload.hasOwnProperty("ScriptFunction")).toBeTruthy();
  let scriptFunction = txnPayload["ScriptFunction"];
  expect(scriptFunction.func.functionName).toBe("peer_to_peer");
  expect(scriptFunction.args.length).toBe(3);
});

test("encoding SignedUserTransaction hex, 0x1::DaoVoteScripts::cast_vote", async () => {
  return;
  const senderPrivateKeyHex = '0x...'

  const senderAddressHex = '0x0a6cd5d8711d88258adac029ffa6a3e4'

  const nodeUrl = 'https://main-seed.starcoin.org'

  const provider = new JsonRpcProvider(nodeUrl);

  const senderSequenceNumber = await provider.getSequenceNumber(senderAddressHex)

  // TODO: generate maxGasAmount from contract.dry_run -> gas_used
  const maxGasAmount = 10000000
  const gasUnitPrice = 1
  const chainId = 1

  // because the time system in dev network is relatively static,
  // we should use nodeInfo.now_secondsinstead of using new Date().getTime()
  const nowSeconds = await provider.getNowSeconds()
  // expired after 12 hours since Unix Epoch
  const expiredSecs = 43200
  const expirationTimestampSecs = nowSeconds + expiredSecs

  const sendAmount = 0.01;
  const config = { creator: "0xb2aa52f94db4516c5beecef363af850a", id: 1, type_args_1: "0x1::OnChainConfigDao::OnChainConfigUpdate<0x1::TransactionPublishOption::TransactionPublishOption, d::e::f>" };
  const functionId = '0x1::DaoVoteScripts::cast_vote';
  const strTypeArgs = ['0x1::STC::STC', config.type_args_1]
  const tyArgs = encodeStructTypeTags(strTypeArgs)
  console.log(tyArgs);
  const proposerAdressHex = config.creator;
  const proposalId = config.id;
  const agree = true; // yes: true; no: false
  const votes = sendAmount * 1000000000; // sendAmount * 1e9
  // console.log('vote: ', votes.toString());

  // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
  const proposalIdSCSHex = (function () {
    const se = new BcsSerializer();
    se.serializeU64(proposalId);
    return hexlify(se.getBytes());
  })();
  // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
  const agreeSCSHex = (function () {
    const se = new BcsSerializer();
    se.serializeBool(agree);
    return hexlify(se.getBytes());
  })();
  // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
  const votesSCSHex = (function () {
    const se = new BcsSerializer();
    se.serializeU128(votes);
    return hexlify(se.getBytes());
  })();
  const args = [
    arrayify(proposerAdressHex),
    arrayify(proposalIdSCSHex),
    arrayify(agreeSCSHex),
    arrayify(votesSCSHex),
  ];
  console.log({ args });

  const scriptFunction = encodeScriptFunction(functionId, tyArgs, args);

  console.log(scriptFunction);

  const payloadInHex = (function () {
    const se = new BcsSerializer();
    scriptFunction.serialize(se);
    return hexlify(se.getBytes());
  })();
  console.log(payloadInHex);

  const rawUserTransaction = generateRawUserTransaction(
    senderAddressHex,
    scriptFunction,
    maxGasAmount,
    gasUnitPrice,
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
}, 10000);

test("encoding SignedUserTransaction hex, 0x1::TransferScripts::peer_to_peer", async () => {
  return;
  const senderPrivateKeyHex = '0x...'

  const senderAddressHex = '0x0a6cd5d8711d88258adac029ffa6a3e4'

  const nodeUrl = 'https://main-seed.starcoin.org'

  const provider = new JsonRpcProvider(nodeUrl);

  const senderSequenceNumber = await provider.getSequenceNumber(senderAddressHex)

  // TODO: generate maxGasAmount from contract.dry_run -> gas_used
  const maxGasAmount = 10000000
  const gasUnitPrice = 1

  const chainId = 1

  // because the time system in dev network is relatively static,
  // we should use nodeInfo.now_secondsinstead of using new Date().getTime()
  const nowSeconds = await provider.getNowSeconds()
  // expired after 12 hours since Unix Epoch
  const expiredSecs = 43200
  const expirationTimestampSecs = nowSeconds + expiredSecs

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

  const strTypeArgs = ['0x1::STC::STC']
  const tyArgs = encodeStructTypeTags(strTypeArgs)

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
    gasUnitPrice,
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
}, 10000);

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

test("decode receipt identifier", () => {
  const address = "1603d10ce8649663e4e5a757a8681833";
  const authKey = "93dcc435cfca2dcf3bf44e9948f1f6a98e66a1f1b114a4b8a37ea16e12beeb6d";
  const encodedStr = 'stc1pzcpazr8gvjtx8e895at6s6qcxwfae3p4el9zmnem738fjj83765cue4p7xc3ff9c5dl2zmsjhm4k63mmwta'

  const receiptIdentifier = decodeReceiptIdentifier(encodedStr)
  // console.log('address', receiptIdentifier.accountAddress)
  // console.log('authkey', receiptIdentifier.authKey)
  expect(receiptIdentifier.accountAddress).toBe(address)
  expect(receiptIdentifier.authKey).toBe(authKey)
});

test("encode struct type args: send stc", () => {
  const strTypeArgs = ['0x1::STC::STC']
  const structTypeTags = encodeStructTypeTags(strTypeArgs)
  console.log(strTypeArgs)
  console.log(JSON.stringify(structTypeTags, undefined, 2))
  expect(structTypeTags.length).toBe(1)
});

test("encode struct type args: vote", () => {
  const strTypeArgs = ['0x1::STC::STC', '0x1::OnChainConfigDao::OnChainConfigUpdate<0x1::TransactionPublishOption::TransactionPublishOption>']
  const structTypeTags = encodeStructTypeTags(strTypeArgs)
  console.log(strTypeArgs)
  console.log(JSON.stringify(structTypeTags, undefined, 2))
  expect(structTypeTags.length).toBe(2)
  expect(structTypeTags[1]['Struct'].type_params.length).toBe(1)
});

test("encode struct type args: lp", () => {
  const strTypeArgs = ['0x4783d08fb16990bd35d83f3e23bf93b8::TokenSwap::LiquidityToken<0x00000000000000000000000000000001::STC::STC, 0xfe125d419811297dfab03c61efec0bc9::FAI::FAI>']
  const structTypeTags = encodeStructTypeTags(strTypeArgs)
  console.log(strTypeArgs)
  console.log(JSON.stringify(structTypeTags, undefined, 2))

  console.log(strTypeArgs)
  const functionId = '0x1::Account::accept_token';
  const args = [];
  const scriptFunction = encodeScriptFunction(functionId, structTypeTags, args);
  console.log(scriptFunction)

  const payloadInHex = (function () {
    const se = new BcsSerializer();
    scriptFunction.serialize(se);
    return hexlify(se.getBytes());
  })();
  console.log(payloadInHex)

  expect(structTypeTags.length).toBe(1)
  expect(structTypeTags[0]['Struct'].type_params.length).toBe(2)
});

test('decode string', () => {
  const imageHex = '0x53746172636f696e47656e657369734e4654'
  const imageBytes = arrayify(imageHex)
  const imageName = Buffer.from(imageBytes).toString()
  // console.log({ imageName })
  expect(imageName).toBe('StarcoinGenesisNFT')
});

test('encode/decode string', () => {
  const imageUrl = 'ipfs://QmSPcvcXgdtHHiVTAAarzTeubk5X3iWymPAoKBfiRFjPMY'
  const imageBytes = new Uint8Array(Buffer.from(imageUrl))
  const imageHex = hexlify(imageBytes)
  expect(imageHex).toBe('0x697066733a2f2f516d5350637663586764744848695654414161727a546575626b3558336957796d50416f4b42666952466a504d59')
  expect(Buffer.from(imageBytes).toString()).toBe(imageUrl)
});


test('encode/decode data:image/png;base64', () => {
  const buffer = fs.readFileSync(
    path.join(__dirname, "data", "image_png_base64.txt")
  );
  const imageData = buffer.toString()
  // console.log({ imageData })
  const imageBytes = new Uint8Array(Buffer.from(imageData))
  const imageHex = hexlify(imageBytes)
  // console.log({ imageHex })
  const buffer2 = fs.readFileSync(
    path.join(__dirname, "data", "imageHex.txt")
  );
  const imageHexExpected = buffer2.toString()
  expect(imageHex).toBe(imageHexExpected)
  expect(Buffer.from(imageBytes).toString()).toBe(imageData)
});

test('encodePackage', async () => {
  const address = '0xedb4a7199ae49f76991614CF4C39c585'
  const privateKey = '0a4a0fe4985df2590ac59c208775f36438a47193ce6eeb197964d8a8f8a6a1f9'

  // There are two ways to generate TransactionPayloadVariantPackage from *.move

  // Option 1:
  // First, in Terminal,execute following commands:
  // ➜ ~/work/my-token $mpm sandbox publish
  // ➜ ~/work/my-token$ cp storage/0x0xedb4a7199ae49f76991614cf4c39c585/modules/TestToken.mv ../starcoin.js/src/encoding/data/
  const buffer = fs.readFileSync(
    path.join(__dirname, "data", "TestToken.mv")
  );
  const fileBytes = new Uint8Array(buffer)
  const fileHex = hexlify(fileBytes)
  const transactionPayload = encodePackage(
    address,
    [fileHex],
    {
      functionId: `${ address }::TestToken::init`,
      tyArgs: encodeStructTypeTags([]),
      args: [],
    },
  );


  // Option 2:
  // First, in Terminal,execute following commands:
  // ➜ ~/work/my-token $mpm release --function 0xedb4a7199ae49f76991614CF4C39c585::TestToken::init
  // Packaging Modules:
  //   0xedb4a7199ae49f76991614cf4c39c585::TestToken
  // Release done: release/my_token.v0.0.1.blob, package hash: 0x1ad1d9f2a97964f722fae2e157ef6c316625c269998c6127e0f9c3871b3e1438
  // ➜ ~/work/my-token $hexdump -v -e '1/1 "%02x"' release/my_token.v0.0.1.blob
  // edb4a7199ae49f76991614cf4c39c58501aa01a11ceb0b040000000901000402040403080b04130205150a071f340853200a73050c780d000001010002070000030001000105030101040102010c0001080002060c020954657374546f6b656e05546f6b656e0355534404696e69740b64756d6d795f6669656c640e72656769737465725f746f6b656eedb4a7199ae49f76991614cf4c39c5850000000000000000000000000000000100020104010002000001040e0031093800020001edb4a7199ae49f76991614cf4c39c5850954657374546f6b656e04696e69740000
  // Then, copy and past the output hex string as the parameter moduleHex's value().

  // const moduleHex = 'edb4a7199ae49f76991614cf4c39c58501aa01a11ceb0b040000000901000402040403080b04130205150a071f340853200a73050c780d000001010002070000030001000105030101040102010c0001080002060c020954657374546f6b656e05546f6b656e0355534404696e69740b64756d6d795f6669656c640e72656769737465725f746f6b656eedb4a7199ae49f76991614cf4c39c5850000000000000000000000000000000100020104010002000001040e0031093800020001edb4a7199ae49f76991614cf4c39c5850954657374546f6b656e04696e69740000'
  // const de = new BcsDeserializer(arrayify(addHexPrefix(moduleHex)))
  // const packageData = starcoin_types.Package.deserialize(de)
  // const transactionPayload = new starcoin_types.TransactionPayloadVariantPackage(packageData);

  const nodeUrl = 'https://barnard-seed.starcoin.org'
  const provider = new JsonRpcProvider(nodeUrl);
  const senderSequenceNumber = await provider.getSequenceNumber(address)
  const chainId = 251;
  const nowSeconds = await provider.getNowSeconds();
  // console.log({ senderSequenceNumber, nowSeconds })
  const rawUserTransaction = generateRawUserTransaction(
    address,
    transactionPayload,
    10000000,   //maxGasAmount
    1,          // gasUnitPrice
    senderSequenceNumber,
    nowSeconds + 43200,
    chainId,
  );

  const rawUserTransactionHex = bcsEncode(rawUserTransaction)
  // console.log({ rawUserTransactionHex })

  const signedUserTransactionHex = await signRawUserTransaction(
    privateKey,
    rawUserTransaction,
  );

  const txn = await provider.sendTransaction(signedUserTransactionHex);

  const txnInfo = await txn.wait(1);

  // console.log(txnInfo);

  expect(txnInfo.status).toBe('Executed');
}, 60000);

