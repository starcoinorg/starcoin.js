/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-bitwise */

import { readFileSync, writeFileSync } from 'fs';
import { hexlify, arrayify } from '@ethersproject/bytes';
import { addHexPrefix } from 'ethereumjs-util';
import { BigNumber } from '@ethersproject/bignumber';
import { utils as ed25519Utils } from '@noble/ed25519';
import { JsonRpcProvider } from '../providers';
import { bcsEncode, bcsDecode } from '../encoding';
import { BcsSerializer, BcsDeserializer } from '../lib/runtime/bcs';
import { toHexString } from './hex';
import {
  generateRawUserTransaction,
  getSignedUserTransaction,
  encodeScriptFunctionByResolve,
  getSignatureHex,
} from "./tx";
import { generateMultiEd25519KeyShard, generateMultiEd25519Signature, generateMultiEd25519SignatureShard } from "./multi-sign";
import { dec2bin, bin2dec, setBit, isSetBit, dec2uint8array, uint8array2dec } from "./helper";
import { showMultiEd25519Account, decodeMultiEd25519AccountPrivateKey } from "./account";
import * as starcoin_types from "../lib/runtime/starcoin_types";

// Implemention of multi sign in https://starcoin.org/zh/developer/cli/multisig_account/
const threshold = 2;

const alice = {
  'address': '0xd597bcfa4d3464b98bea990ce21aca06',
  'public_key': '0x547c6a1ef36e9e99865ce7ac028ee79aff404d279b568272bc7154802d4856bb',
  'private_key': '0xa9e47d270d2ce33b1475f500f3b9a773eb966f3f8ab5ceb738d52262bbe10cb2'
}

const bob = {
  'address': '0xdcd7ae3232acb938c68ee088305b83f6',
  'public_key': '0xe8cdd5b17a37fe7e8fe446d067e7a9907cf7783aca204ccb623972176614c0a0',
  'private_key': '0x7ea63107b0e214789fdb0d6c6e6b0d8f8b8c0be7398654ddd63f3617282be97b'
}

const tom = {
  'address': '0x14417edb1fe8c4591d739fee0a91ce42',
  'public_key': '0xc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8',
  'private_key': '0x359059828e89fe42dddd5f9571a0c623b071379fc6287c712649dcc8c77f5eb4'
}

test('import from multiSign account privateKey', async () => {
  const publicKeys1 = [bob.public_key, tom.public_key];
  const privateKeys1 = [alice.private_key];

  const shardAlice = await generateMultiEd25519KeyShard(publicKeys1, privateKeys1, threshold)
  const multiAccountAlice = showMultiEd25519Account(shardAlice)
  console.log({ multiAccountAlice });

  let shard
  {
    const { publicKeys, threshold, privateKeys } = decodeMultiEd25519AccountPrivateKey(multiAccountAlice.privateKey)
    console.log('decodeMultiEd25519AccountPrivateKey', { publicKeys, threshold, privateKeys });
    shard = await generateMultiEd25519KeyShard(publicKeys, privateKeys, threshold)
  }
  const multiAccount = showMultiEd25519Account(shard)
  console.log({ multiAccount });

  expect(multiAccount.privateKey).toEqual(multiAccountAlice.privateKey);
  expect(multiAccount.publicKey).toEqual(multiAccountAlice.publicKey);
  expect(multiAccount.address).toEqual(multiAccountAlice.address);
  expect(multiAccount.authKey).toEqual(multiAccountAlice.authKey);
  expect(multiAccount.receiptIdentifier).toEqual(multiAccountAlice.receiptIdentifier);
})

test('prepare 3 multi sign accounts', async () => {
  // step 1: 准备3个多签账号
  // in alice's terminal
  // account import-multisig --pubkey 0xe8cdd5b17a37fe7e8fe446d067e7a9907cf7783aca204ccb623972176614c0a0 --pubkey 0xc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8 --prikey 0xa9e47d270d2ce33b1475f500f3b9a773eb966f3f8ab5ceb738d52262bbe10cb2 -t 2
  const publicKeys1 = [bob.public_key, tom.public_key];
  const privateKeys1 = [alice.private_key];

  const shardAlice = await generateMultiEd25519KeyShard(publicKeys1, privateKeys1, threshold)
  console.log({ shardAlice })
  const multiAccountAlice = showMultiEd25519Account(shardAlice)
  console.log({ multiAccountAlice });
  // multiAccountAlice: {
  //   privateKey: '0x030201547c6a1ef36e9e99865ce7ac028ee79aff404d279b568272bc7154802d4856bbc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8e8cdd5b17a37fe7e8fe446d067e7a9907cf7783aca204ccb623972176614c0a0a9e47d270d2ce33b1475f500f3b9a773eb966f3f8ab5ceb738d52262bbe10cb2',
  //   publicKey: '0x547c6a1ef36e9e99865ce7ac028ee79aff404d279b568272bc7154802d4856bbc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8e8cdd5b17a37fe7e8fe446d067e7a9907cf7783aca204ccb623972176614c0a002',
  //   address: '0xb555d8b06fed69769821e189b5168870',
  //   authKey: '0xe116cedcb2b7c21396a9efb07947ce78b555d8b06fed69769821e189b5168870',
  //   receiptIdentifier: 'stc1pk42a3vr0a45hdxppuxym295gwq38kuqj'
  // }

  // in bob's terminal
  // account import-multisig --pubkey 0x547c6a1ef36e9e99865ce7ac028ee79aff404d279b568272bc7154802d4856bb --pubkey 0xc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8 --prikey 0x7ea63107b0e214789fdb0d6c6e6b0d8f8b8c0be7398654ddd63f3617282be97b -t 2
  const publicKeys2 = [alice.public_key, tom.public_key];
  const privateKeys2 = [bob.private_key];

  const shardBob = await generateMultiEd25519KeyShard(publicKeys2, privateKeys2, threshold)
  console.log({ shardBob })
  const multiAccountBob = showMultiEd25519Account(shardBob)
  console.log({ multiAccountBob });
  // multiAccountBob: {
  //   privateKey: '0x030201547c6a1ef36e9e99865ce7ac028ee79aff404d279b568272bc7154802d4856bbc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8e8cdd5b17a37fe7e8fe446d067e7a9907cf7783aca204ccb623972176614c0a07ea63107b0e214789fdb0d6c6e6b0d8f8b8c0be7398654ddd63f3617282be97b',
  //   publicKey: '0x547c6a1ef36e9e99865ce7ac028ee79aff404d279b568272bc7154802d4856bbc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8e8cdd5b17a37fe7e8fe446d067e7a9907cf7783aca204ccb623972176614c0a002',
  //   address: '0xb555d8b06fed69769821e189b5168870',
  //   authKey: '0xe116cedcb2b7c21396a9efb07947ce78b555d8b06fed69769821e189b5168870',
  //   receiptIdentifier: 'stc1pk42a3vr0a45hdxppuxym295gwq38kuqj'
  // }

  // in tom's terminal
  // account import-multisig --pubkey 0x547c6a1ef36e9e99865ce7ac028ee79aff404d279b568272bc7154802d4856bb --pubkey 0xe8cdd5b17a37fe7e8fe446d067e7a9907cf7783aca204ccb623972176614c0a0 --prikey 0x359059828e89fe42dddd5f9571a0c623b071379fc6287c712649dcc8c77f5eb4 -t 2
  const publicKeys3 = [alice.public_key, bob.public_key];
  const privateKeys3 = [tom.private_key];

  const shardTom = await generateMultiEd25519KeyShard(publicKeys3, privateKeys3, threshold)
  console.log({ shardTom })
  const multiAccountTom = showMultiEd25519Account(shardTom)
  console.log({ multiAccountTom });
  // multiAccountTom: {
  //   privateKey: '0x030201547c6a1ef36e9e99865ce7ac028ee79aff404d279b568272bc7154802d4856bbc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8e8cdd5b17a37fe7e8fe446d067e7a9907cf7783aca204ccb623972176614c0a0359059828e89fe42dddd5f9571a0c623b071379fc6287c712649dcc8c77f5eb4',
  //   publicKey: '0x547c6a1ef36e9e99865ce7ac028ee79aff404d279b568272bc7154802d4856bbc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8e8cdd5b17a37fe7e8fe446d067e7a9907cf7783aca204ccb623972176614c0a002',
  //   address: '0xb555d8b06fed69769821e189b5168870',
  //   authKey: '0xe116cedcb2b7c21396a9efb07947ce78b555d8b06fed69769821e189b5168870',
  //   receiptIdentifier: 'stc1pk42a3vr0a45hdxppuxym295gwq38kuqj'
  // }

  // 3 multiAccount's privateKey should be different, while the other properties ate the same:
  expect(multiAccountAlice.address).toEqual(multiAccountBob.address);
  expect(multiAccountAlice.address).toEqual(multiAccountTom.address);
  expect(multiAccountAlice.privateKey).not.toEqual(multiAccountBob.privateKey);
  expect(multiAccountAlice.privateKey).not.toEqual(multiAccountTom.privateKey);

})

test('first multi sign', async () => {
  const publicKeys3 = [alice.public_key, bob.public_key];
  const privateKeys3 = [tom.private_key];

  const shardTom = await generateMultiEd25519KeyShard(publicKeys3, privateKeys3, threshold)
  console.log({ shardTom })
  const multiAccountTom = showMultiEd25519Account(shardTom)
  console.log({ multiAccountTom });

  // step1: 在任意一个 starcoin console 里面，给多签账户 充值 100 STC。
  // starcoin% account default 0xb555d8b06fed69769821e189b5168870
  // starcoin% dev get - coin - v 100STC

  // step2: 我们来发起一个多签交易：从多签账户往 bob 转账 1 个 STC。
  // 2.1 在 tom 的 starcoin console 中执行
  // account sign-multisig-txn -s 0xb555d8b06fed69769821e189b5168870 --function 0x1::TransferScripts::peer_to_peer_v2 -t 0x1::STC::STC --arg 0xdcd7ae3232acb938c68ee088305b83f6 --arg 1000000000u128
  // mutlisig txn(address: 0xb555d8b06fed69769821e189b5168870, threshold: 2): 1 signatures collected
  // still require 1 signatures
  // {
  //   "ok": "/Users/starcoin/projects/starcoinorg/starcoin/5e764f83.multisig-txn"
  // }
  // 该命令会生成原始交易，并用多签账户(由tom的私钥生成)的私钥签名，生成的 txn 会以文件形式保存在当前目录下，文件名是 txn 的 short hash。

  const senderAddress = multiAccountTom.address
  const receiverAddress = bob.address
  const amount = 1000000000
  const functionId = '0x1::TransferScripts::peer_to_peer_v2'
  const typeArgs = ['0x1::STC::STC']
  const args = [
    receiverAddress,
    amount,
  ]
  const nodeUrl = 'http://localhost:9850'
  const chainId = 254
  const scriptFunction = await encodeScriptFunctionByResolve(functionId, typeArgs, args, nodeUrl);

  const payloadInHex = bcsEncode(scriptFunction);
  console.log(payloadInHex)

  const provider = new JsonRpcProvider(nodeUrl);
  const senderSequenceNumber = await provider.getSequenceNumber(
    senderAddress
  ) || 0;

  const maxGasAmount = 10000000n;
  const gasUnitPrice = 1;
  const nowSeconds = await provider.getNowSeconds();
  // expired after 12 hours since Unix Epoch
  const expiredSecs = 43200
  const expirationTimestampSecs = nowSeconds + expiredSecs

  // hard coded in rust
  // const expirationTimestampSecs = 3005

  const rawUserTransaction = generateRawUserTransaction(
    senderAddress,
    scriptFunction,
    maxGasAmount,
    gasUnitPrice,
    senderSequenceNumber,
    expirationTimestampSecs,
    chainId
  );
  console.log({ rawUserTransaction })

  const rawUserTransactionHex = bcsEncode(rawUserTransaction)
  console.log({ rawUserTransactionHex })

  // const hex1 = '0xb555d8b06fed69769821e189b5168870000000000000000002000000000000000000000000000000010f5472616e73666572536372697074730f706565725f746f5f706565725f76320107000000000000000000000000000000010353544303535443000210dcd7ae3232acb938c68ee088305b83f61000ca9a3b000000000000000000000000809698000000000001000000000000000d3078313a3a5354433a3a535443bd0b000000000000fe'
  // const rtx = bcsDecode(starcoin_types.RawUserTransaction, hex1)
  // console.log({ rtx })

  // const hex2 = '0x61547c6a1ef36e9e99865ce7ac028ee79aff404d279b568272bc7154802d4856bbc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8e8cdd5b17a37fe7e8fe446d067e7a9907cf7783aca204ccb623972176614c0a002'
  // const multiEd25519PublicKey = bcsDecode(starcoin_types.MultiEd25519PublicKey, hex2)
  // console.log({ multiEd25519PublicKey })
  // console.log(bcsEncode(multiEd25519PublicKey as starcoin_types.MultiEd25519PublicKey))
  // expect(hex2).toEqual(bcsEncode(multiEd25519PublicKey as starcoin_types.MultiEd25519PublicKey));

  // const hex3 = '0x44de420c239c21c51c686a5e50b9783375fec7c07591edde3bc50cdd5a3e9104ac4d6673645e4fcd8c1a455a08f549da236cc6e474a0c8ae3a5ef0ad1d1da4400240000000'
  // const multiEd25519Signature = bcsDecode(starcoin_types.MultiEd25519Signature, hex3)
  // console.log({ multiEd25519Signature })
  // console.log(bcsEncode(multiEd25519Signature as starcoin_types.MultiEd25519Signature))
  // expect(hex3).toEqual(bcsEncode(multiEd25519Signature as starcoin_types.MultiEd25519Signature));

  const signatureShard = await generateMultiEd25519SignatureShard(shardTom, rawUserTransaction)
  console.log({ signatureShard })
  const count_signatures = signatureShard.signature.signatures.length
  console.log('count_signatures', count_signatures, 'is_enough', signatureShard.is_enough())

  const authenticator = new starcoin_types.TransactionAuthenticatorVariantMultiEd25519(shardTom.publicKey(), signatureShard.signature)

  const partial_signed_txn = new starcoin_types.SignedUserTransaction(rawUserTransaction, authenticator)

  console.log({ partial_signed_txn })
  console.log(partial_signed_txn.authenticator)

  const filename = (function () {
    const privateKeyBytes = ed25519Utils.randomPrivateKey();
    const name = Buffer.from(privateKeyBytes).toString('hex').slice(0, 8);
    return `${ name }.multisig-txn`
  })();
  console.log({ filename })
  console.log(`mutlisig txn(address: ${ multiAccountTom.address }, threshold: ${ threshold }): ${ count_signatures } signatures collected
still require ${ threshold - count_signatures } signatures
{
  "ok": "${ filename }"
}
`)
  // write Uint8Array into local binary file
  try {
    const partial_signed_txn_hex = bcsEncode(partial_signed_txn);
    console.log({ partial_signed_txn_hex })
    const signed_txn = bcsDecode(starcoin_types.SignedUserTransaction, partial_signed_txn_hex)
    console.log({ signed_txn })
    expect(partial_signed_txn_hex).toEqual(bcsEncode(signed_txn as starcoin_types.SignedUserTransaction));
    console.log({ filename })
    writeFileSync(filename, arrayify(partial_signed_txn_hex));
    const rbuf = readFileSync(filename);
    console.log(hexlify(rbuf));

    // const rbuf2 = readFileSync("3d874c34.multisig-txn");
    // console.log(hexlify(rbuf2));
    // expect(hexlify(rbuf)).toEqual(hexlify(rbuf2));
  } catch (error) {
    console.log(error);
  }
})

test('second multi sign', async () => {
  // 2.2 alice 拿到上述的交易文件后，在自己的 starcoin cosole 中签名
  // starcoin% account sign-multisig-txn /Users/starcoin/projects/starcoinorg/starcoin/5e764f83.multisig-txn
  // mutlisig txn(address: 0xdec266f6749fa0b193f3a7f89d3cd9f2, threshold: 2): 2 signatures collected
  // enough signatures collected for the multisig txn, txn can be submitted now
  // {
  //   "ok": "/Users/starcoin/projects/starcoinorg/starcoin/194d547f.multisig-txn"
  // }
  // 该命令会用多签账户(由alice的私钥生成)的私钥签名生成另一个交易文件，该交易同时包含有 tom 和 alice 的签名。 
  // 返回信息提示用户，该多签交易已经收集到足够多的签名，可以提交到链上执行了。
  const rbuf = readFileSync("4d6e1867.multisig-txn");
  console.log(hexlify(rbuf));
  const txn: starcoin_types.SignedUserTransaction = bcsDecode(starcoin_types.SignedUserTransaction, hexlify(rbuf))
  console.log({ txn });

  let existingAuthenticator: starcoin_types.TransactionAuthenticatorVariantMultiEd25519
  if (txn.authenticator instanceof starcoin_types.TransactionAuthenticatorVariantMultiEd25519) {
    existingAuthenticator = txn.authenticator as starcoin_types.TransactionAuthenticatorVariantMultiEd25519
  }

  console.log(existingAuthenticator)
  console.log(existingAuthenticator.public_key)
  console.log(existingAuthenticator.signature)
  console.log(existingAuthenticator.signature.signatures)
  const count_signatures = existingAuthenticator.signature.signatures.length
  expect(existingAuthenticator.public_key.threshold).toEqual(2);
  console.log(`is_enough: ${ count_signatures >= threshold }, 
threshold= ${ threshold }
${ count_signatures } signatures collected, still require ${ threshold - count_signatures } signatures
`)

  const { raw_txn } = txn
  const existingSignatureShards = new starcoin_types.MultiEd25519SignatureShard(existingAuthenticator.signature, existingAuthenticator.public_key.threshold)

  console.log({ raw_txn, existingSignatureShards })
  console.log('existingSignatureShards is_enough', existingSignatureShards.is_enough())

  const publicKeys1 = [bob.public_key, tom.public_key];
  const privateKeys1 = [alice.private_key];

  const shardAlice = await generateMultiEd25519KeyShard(publicKeys1, privateKeys1, threshold)
  console.log({ shardAlice })
  const multiAccountAlice = showMultiEd25519Account(shardAlice)
  console.log({ multiAccountAlice });
  const signatureShard = await generateMultiEd25519SignatureShard(shardAlice, raw_txn)
  console.log({ signatureShard })

  const mySignatureShards = new starcoin_types.MultiEd25519SignatureShard(signatureShard.signature, existingAuthenticator.public_key.threshold)
  const signatureShards = []
  signatureShards.push(existingSignatureShards)
  signatureShards.push(mySignatureShards)
  console.log({ signatureShards })
  const mergedSignatureShards = starcoin_types.MultiEd25519SignatureShard.merge(signatureShards)
  console.log({ mergedSignatureShards })
  console.log('mergedSignatureShards is_enough', mergedSignatureShards.is_enough())
  if (!mergedSignatureShards.is_enough()) {
    console.log(`still require ${ mergedSignatureShards.threshold - mergedSignatureShards.signature.signatures.length } signatures`);
  } else {
    console.log('enough signatures collected for the multisig txn, txn can be submitted now')
  }
  const authenticator = new starcoin_types.TransactionAuthenticatorVariantMultiEd25519(shardAlice.publicKey(), mergedSignatureShards.signature)

  const partial_signed_txn = new starcoin_types.SignedUserTransaction(raw_txn, authenticator)

  console.log({ partial_signed_txn })
  console.log(partial_signed_txn.authenticator)

  const filename = (function () {
    const privateKeyBytes = ed25519Utils.randomPrivateKey();
    const name = Buffer.from(privateKeyBytes).toString('hex').slice(0, 8);
    return `${ name }.multisig-txn`
  })();
  console.log({ filename })
  // write Uint8Array into local binary file
  try {
    const partial_signed_txn_hex = bcsEncode(partial_signed_txn);
    console.log({ partial_signed_txn_hex })
    const signed_txn = bcsDecode(starcoin_types.SignedUserTransaction, partial_signed_txn_hex)
    console.log({ signed_txn })
    expect(partial_signed_txn_hex).toEqual(bcsEncode(signed_txn as starcoin_types.SignedUserTransaction));
    console.log({ filename })
    writeFileSync(filename, arrayify(partial_signed_txn_hex));
    const rbuf2 = readFileSync(filename);
    console.log(hexlify(rbuf2));

    // const rbuf3 = readFileSync("c22af117.multisig-txn");
    // console.log(hexlify(rbuf3));
    // expect(hexlify(rbuf3)).toEqual(hexlify(rbuf2));
  } catch (error) {
    console.log(error);
  }
})

test('bit operator', () => {
  console.log(dec2bin(-1073741824))
  const pos_a = 0b00000000000000000000000000000001
  const pos_b = 0b00010000000000000000000000000000
  console.log({ pos_a, pos_b })
  const bitmap = pos_a | pos_b
  console.log(bitmap, dec2bin(bitmap))
  const arr = ['a', 'b']
  let bitmap_index = 0
  arr.forEach((v, idx) => {
    while (!isSetBit(bitmap, bitmap_index)) {
      bitmap_index += 1;
    }
    console.log({ idx, v, bitmap_index })
    bitmap_index += 1
  })

  const b1 = bin2dec('11111111')
  const b2 = 0b11111111
  console.log({ b1, b2 })
  // const test = 268435457
  const test = 1073741824
  console.log({ test })
  const bitmap2 = dec2uint8array(test)
  console.log({ bitmap2 })
  console.log(hexlify(bitmap2))
  const test2 = uint8array2dec(bitmap2)
  console.log({ test2 })
  expect(test).toEqual(test2);
  const bin = dec2bin(test)
  console.log({ bin })
  const n = bin2dec(bin)
  console.log({ n })
  const t2 = bin2dec('00000000000000000000000000000000') | bin2dec('00000000000000000000000000000001') | bin2dec('00010000000000000000000000000000')
  console.log(t2, dec2bin(t2))
  const n0 = 0b00000000000000000000000000000000
  const n1 = setBit(n0, 3)
  const n2 = setBit(n1, 31)
  console.log(n0, n1, n2, dec2bin(n2))
  console.log(dec2uint8array(n0), dec2uint8array(n1), dec2uint8array(n2))
  console.log(0b101, typeof 0b101)
  console.log(1 << 32 - 3 - 1, dec2bin(1 << 32 - 3 - 1))
  console.log(1 << 32 - 31 - 1, dec2bin(1 << 32 - 31 - 1))
  console.log(isSetBit(n2, 3))
  console.log(isSetBit(n2, 31))
  console.log(isSetBit(n2, 30))
})
