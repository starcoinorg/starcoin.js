/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-bitwise */

import { readFileSync, writeFileSync } from 'fs';
import { hexlify, arrayify } from '@ethersproject/bytes';
import { addHexPrefix } from 'ethereumjs-util';
import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcProvider } from '../providers';
import { bcsEncode, bcsDecode } from '../encoding';
import { BcsSerializer, BcsDeserializer } from '../lib/runtime/bcs';
import { toHexString } from './hex';
import {
  generateRawUserTransaction,
  getSignedUserTransaction,
  encodeScriptFunctionByResolve
} from "./tx";
import { createMultiEd25519KeyShard, signMultiEd25519KeyShard } from "./multi-sign";
import { dec2bin, bin2dec, setBit, isSetBit, dec2uint8array, uint8array2dec } from "./helper";
import { showMultiEd25519Account } from "./account";
import * as starcoin_types from "../lib/runtime/starcoin_types";

test('2-3 multi sign', async () => {
  // Implemention of multi sign in https://starcoin.org/zh/developer/cli/multisig_account/
  const thresHold = 2;

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

  // step 1: 准备3个多签账号
  // in alice's terminal
  // account import-multisig --pubkey 0xe8cdd5b17a37fe7e8fe446d067e7a9907cf7783aca204ccb623972176614c0a0 --pubkey 0xc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8 --prikey 0xa9e47d270d2ce33b1475f500f3b9a773eb966f3f8ab5ceb738d52262bbe10cb2 -t 2
  const publicKeys1 = [bob.public_key, tom.public_key];
  const privateKeys1 = [alice.private_key];

  const shardAlice = await createMultiEd25519KeyShard(publicKeys1, privateKeys1, thresHold)
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

  const shardBob = await createMultiEd25519KeyShard(publicKeys2, privateKeys2, thresHold)
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

  const shardTom = await createMultiEd25519KeyShard(publicKeys3, privateKeys3, thresHold)
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

  const hex = '0xbc317a9becacae3e6ddf3c8a9c2efd64000000000000000002000000000000000000000000000000010f5472616e73666572536372697074730f706565725f746f5f706565725f76320107000000000000000000000000000000010353544303535443000210d7f20befd34b9f1ab8aeae98b82a5a511080969800000000000000000000000000809698000000000001000000000000000d3078313a3a5354433a3a5354432e3c6f6100000000fb'
  const rtx = bcsDecode(starcoin_types.RawUserTransaction, hex)
  console.log({ rtx })
  const signatures = await signMultiEd25519KeyShard(shardBob, rtx)
  console.log({ signatures })

  // write Uint8Array into local binary file, and read form it
  try {
    writeFileSync("binaryfile", arrayify(multiAccountBob.privateKey));
    const rbuf = readFileSync("binaryfile");
    console.log({ rbuf });
    console.log(hexlify(rbuf));
  } catch (error) {
    console.log(error);
  }

  // step2: 我们来发起一个多签交易：从多签账户往 bob 转账 1 个 STC。
  // 2.1 在 tom 的 starcoin console 中执行
  // account sign-multisig-txn -s 0xb555d8b06fed69769821e189b5168870 --function 0x1::TransferScripts::peer_to_peer_v2 -t 0x1::STC::STC --arg 0xdcd7ae3232acb938c68ee088305b83f6 --arg 1000000000u128
  // 该命令会生成原始交易，并用多签账户(由tom的私钥生成)的私钥签名，生成的 txn 会以文件形式保存在当前目录下，文件名是 txn 的 short hash。

  // const senderAddress = multiAccountTom.address
  // const senderPrivateKey = multiAccountTom.privateKey
  // const receiverAddress = bob.address
  // const amount = 1000000000
  // const functionId = '0x1::TransferScripts::peer_to_peer_v2'
  // const typeArgs = ['0x1::STC::STC']
  // const args = [
  //   receiverAddress,
  //   amount,
  // ]
  // const nodeUrl = 'http://localhost:9850'
  // const chainId = 254
  // const scriptFunction = await encodeScriptFunctionByResolve(functionId, typeArgs, args, nodeUrl);

  // const se = new BcsSerializer();
  // scriptFunction.serialize(se);
  // const payloadInHex = toHexString(se.getBytes());
  // console.log(payloadInHex)

  // const provider = new JsonRpcProvider(nodeUrl);
  // const senderSequenceNumber = await provider.getSequenceNumber(
  //   senderAddress
  // );
  // const maxGasAmount = 10000000n;
  // const gasUnitPrice = 1;
  // const nowSeconds = await provider.getNowSeconds();
  // // expired after 12 hours since Unix Epoch
  // const expiredSecs = 43200
  // const expirationTimestampSecs = nowSeconds + expiredSecs

  // const rawUserTransaction = generateRawUserTransaction(
  //   senderAddress,
  //   scriptFunction,
  //   maxGasAmount,
  //   gasUnitPrice,
  //   senderSequenceNumber,
  //   expirationTimestampSecs,
  //   chainId
  // );
  // console.log({ rawUserTransaction })

  // const rawUserTransactionHex = bcsEncode(rawUserTransaction)
  // console.log({ rawUserTransactionHex })

  // const partial_signed_txn = await getSignedUserTransaction(
  //   senderPrivateKey,
  //   rawUserTransaction
  // );

  // console.log({ partial_signed_txn })
  // console.log(partial_signed_txn.authenticator)

  // 2.2 alice 拿到上述的交易文件后，在自己的 starcoin cosole 中签名
  // account submit-multisig-txn ~/starcoin/work/starcoin-artifacts/4979854c.multisig-txn
  // 该命令会用多签账户(由alice的私钥生成)的私钥签名生成另一个交易文件，该交易同时包含有 tom 和 alice 的签名。 
  // 返回信息提示用户，该多签交易已经收集到足够多的签名，可以提交到链上执行了。
})

test('bit operator', () => {
  const b1 = bin2dec('11111111')
  const b2 = 0b11111111
  console.log({ b1, b2 })
  const test = 268435457
  console.log({ test })
  const bitmap = dec2uint8array(test)
  console.log({ bitmap })
  const test2 = uint8array2dec(bitmap)
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
  // let i
  // for (i = 0; i < 32; i++) {
  //   console.log(i, isSetBit(n2, i))
  // }
})
