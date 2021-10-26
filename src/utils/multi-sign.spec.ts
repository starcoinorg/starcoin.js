/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-bitwise */

// import { readFileSync, writeFileSync } from 'fs';
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
import { dec2bin, bin2dec, setBit, isSetBit } from "./helper";
import { showMultiEd25519Account } from "./account";
import * as starcoin_types from "../lib/runtime/starcoin_types";

// Implemention of multi sign in https://starcoin.org/zh/developer/cli/multisig_account/

test('MultiEd25519KeyShard-tom', async () => {
  // 2-3 multi-sig
  const publicKeys = [
    '0xc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8',
    '0x547c6a1ef36e9e99865ce7ac028ee79aff404d279b568272bc7154802d4856bb',
  ];
  const privateKeys = ['0x7ea63107b0e214789fdb0d6c6e6b0d8f8b8c0be7398654ddd63f3617282be97b'];
  const thresHold = 2;
  const shard = await createMultiEd25519KeyShard(publicKeys, privateKeys, thresHold)
  console.log({ shard })
  const hex = '0xbc317a9becacae3e6ddf3c8a9c2efd64000000000000000002000000000000000000000000000000010f5472616e73666572536372697074730f706565725f746f5f706565725f76320107000000000000000000000000000000010353544303535443000210d7f20befd34b9f1ab8aeae98b82a5a511080969800000000000000000000000000809698000000000001000000000000000d3078313a3a5354433a3a5354432e3c6f6100000000fb'
  const rtx = bcsDecode(starcoin_types.RawUserTransaction, hex)
  console.log({ rtx })
  const signatures = await signMultiEd25519KeyShard(shard, rtx)
  console.log({ signatures })
  const accountInfo = showMultiEd25519Account(shard)
  console.log('accountInfo', accountInfo);
  // try {
  //   writeFileSync("binaryfile", accountInfo.privateKey);
  //   const rbuf = readFileSync("binaryfile");
  //   console.log({ rbuf });
  //   console.log(hexlify(rbuf));
  // } catch (error) {
  //   console.log(error);
  // }

  // 我们来发起一个多签交易：从多签账户往 bob 转账 1 个 STC。
  // 1. 在 tom 的 starcoin console 中执行
  // account sign-multisig-txn -s 0xb555d8b06fed69769821e189b5168870 --function 0x1::TransferScripts::peer_to_peer_v2 -t 0x1::STC::STC --arg 0xdcd7ae3232acb938c68ee088305b83f6 --arg 1000000000u128
  // 该命令会生成原始交易，并用多签账户(由tom的私钥生成)的私钥签名，生成的 txn 会以文件形式保存在当前目录下，文件名是 txn 的 short hash。

  // const senderAddress = accountInfo.address
  // const tomPrivateKey = '0x359059828e89fe42dddd5f9571a0c623b071379fc6287c712649dcc8c77f5eb4'
  // const receiverAddress = '0xdcd7ae3232acb938c68ee088305b83f6'
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
  //   tomPrivateKey,
  //   rawUserTransaction
  // );

  // console.log({ partial_signed_txn })
  // console.log(partial_signed_txn.authenticator)

  // 2. alice 拿到上述的交易文件后，在自己的 starcoin cosole 中签名
  // account submit-multisig-txn ~/starcoin/work/starcoin-artifacts/4979854c.multisig-txn
  // 该命令会用多签账户(由alice的私钥生成)的私钥签名生成另一个交易文件，该交易同时包含有 tom 和 alice 的签名。 
  // 返回信息提示用户，该多签交易已经收集到足够多的签名，可以提交到链上执行了。
  const accountNumbers = publicKeys.length + privateKeys.length
  expect(accountNumbers).toBeGreaterThan(thresHold);
})

test('bit operator', () => {
  const test = 268435457
  console.log({ test })
  const bitmap = dec2bin(test)
  console.log({ bitmap })
  const n = bin2dec(bitmap)
  console.log({ n })
  const t2 = bin2dec('00000000000000000000000000000000') | bin2dec('00000000000000000000000000000001') | bin2dec('00010000000000000000000000000000')
  console.log(t2, dec2bin(t2))
  const n0 = 0b00000000000000000000000000000000
  const n1 = setBit(n0, 3)
  const n2 = setBit(n1, 31)
  console.log(n0, n2, dec2bin(n2))
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
