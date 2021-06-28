import { JsonRpcProvider } from '.';
import { arrayify, hexlify } from '@ethersproject/bytes';
import {BcsDeserializer, BcsSerializer} from '../lib/runtime/bcs';
import {
  encodePackage,
  encodeScriptFunction,
  generateRawUserTransaction,
  signRawUserTransaction
} from '../utils/tx';
import { ReceiptIdentifier } from '../lib/runtime/starcoin_types';
import {addressFromSCS, addressToSCS, decodeReceiptIdentifier} from '../encoding';
import {FunctionId, HexString, TypeTag} from "../types";
import {bytes, Deserializer} from "../lib/runtime/serde";
import * as starcoin_types from "../lib/runtime/starcoin_types";

describe('jsonrpc-provider', () => {
  // let provider = new JsonRpcProvider("http://39.102.41.156:9850", undefined);

  const nodeUrl = 'http://localhost:9851';  //dev 节点
  // const nodeUrl = 'http://localhost:9850';  //dev 节点
  // const chainId = 254;
  // const nodeUrl = 'https://barnard.seed.starcoin.org';
  // const chainId = 251;
  const chainId = 254; //dev network


  const provider = new JsonRpcProvider(nodeUrl);

  test('txn sign using sender privateKey and submit(timeout in 2 minutes)', async () => {
    // privateKey is generated in starcoin console using command:
    // starcoin% account export <ADDRESS> -p <PASSWORD>
    const senderPrivateKeyHex =
      '0x033afc60373f15c34c548b532c3b846585a427c65466acd5610a651689d9ac22';

    const senderPublicKeyHex =
      '0xc5bbf0c3ba97c80f2a7959a44fffdd4900ab6f6c3090e85ba87bfcfde5f50e1a';

    const senderAddressHex = '0x4b2b6e26ee6919d6878c05ae2c3572da';

    const moduleAddressHex = '0x4b2b6e26ee6919d6878c05ae2c3572da';
    const moduleHex = '0x4b2b6e26ee6919d6878c05ae2c3572da02ab02a11ceb0b0200000009010006020609030f2204310805392807615708b801200ad801050cdd0126000001010102000007000202040100000300010000040201000206040101040107050101040204070801040108090101040203030304030503010c00020c0401080002060c0201060c010b0101080002060c04010b0101090002060c0b0101090003506464074163636f756e7405546f6b656e04696e6974046d696e740b64756d6d795f6669656c640e72656769737465725f746f6b656e0f646f5f6163636570745f746f6b656e0f6465706f7369745f746f5f73656c664b2b6e26ee6919d6878c05ae2c3572da0000000000000000000000000000000100020105010002000001060e00310338000e003801020102000006080e000a0138020c020e000b02380302008d03a11ceb0b020000000a010006020609030f3a04490c0555310786017a0880022006a002030aa302050ca80238000001010102000007000202040100000300010000040102010400050301000006010400020806010104010907010104020a010202040402050a0b0104010b0c010104020601040104040505050608070508050905010c000101020c04010501080002060c0201060c0208000900010b0101080002060c04010b0101090002060c0b0101090003414243074163636f756e7405546f6b656e04696e69740669735f616263046d696e740d746f6b656e5f616464726573730b64756d6d795f6669656c640e72656769737465725f746f6b656e0f646f5f6163636570745f746f6b656e0d69735f73616d655f746f6b656e0f6465706f7369745f746f5f73656c664b2b6e26ee6919d6878c05ae2c3572da0000000000000000000000000000000102011200020107010002000001060e00070038000e003801020101000001023802020202000009080e000a0138030c020e000b023804020301000001023805020000';

    // const senderPrivateKeyHex =
    //   '0x66584c2cb2b14466a570192ff6bc34588128e9080d9cc3424f25d4b3a03292a6';
    //
    // const senderPublicKeyHex =
    //   '0x57cf2c1b096071d9bee9a75b8450ef0a64950786bbd25c64e1908f415df9b73c';
    //
    // const senderAddressHex = '0xbdb36b510391286e0b03499f938dbc51';

    const senderSequenceNumber = await provider.getSequenceNumber(
      senderAddressHex
    );

    // const receiver = '0xbdb36b510391286e0b03499f938dbc51'
    const receiver = 'stc1phkekk5grjy5xuzcrfx0e8rdu2yktd07y'

    const amount = 1024;
    // Step 1-1: generate payload hex of ScriptFunction
    let receiverAddressHex
    let receiverAuthKeyHex
    let receiverAuthKeyBytes
    if (receiver.slice(0, 3) === 'stc') {
      const receiptIdentifierView = decodeReceiptIdentifier(receiver)
      receiverAddressHex = receiptIdentifierView.accountAddress
      receiverAuthKeyHex = receiptIdentifierView.authKey

      if (receiverAuthKeyHex) {
        receiverAuthKeyBytes = Buffer.from(receiverAuthKeyHex, 'hex')
      } else {
        receiverAuthKeyBytes = Buffer.from('00', 'hex')
      }
    } else {
      receiverAddressHex = receiver
      receiverAuthKeyBytes = Buffer.from('00', 'hex')
    }


    const sendAmountString = `${amount.toString()}u128`

    console.log("receiverAddressHex", receiverAddressHex)
    console.log("receiverAuthKeyHex", receiverAuthKeyHex)
    // const txnOutput = await provider.dryRun(txnRequest)

    // TODO: generate maxGasAmount from contract.dry_run -> gas_used
    const maxGasAmount = 10000000;

    // because the time system in dev network is relatively static,
    // we should use nodeInfo.now_secondsinstead of using new Date().getTime()
    const nowSeconds = await provider.getNowSeconds();
    // expired after 12 hours since Unix Epoch
    const expirationTimestampSecs = nowSeconds + 43200;

    const moduleCodes = [
      moduleHex,
    ]

    // const scriptFunction = { functionId: '::', tyArgs: [], args: [] }
    // let scriptFunction = null

    // const scriptFunction = encodeScriptFunction(functionId, tyArgs, args);
    // const packagePayload = encodePackage(moduleAddressHex, moduleCodes, null);

    const de = new BcsDeserializer(arrayify(moduleHex))
    const packageData = starcoin_types.Package.deserialize(de)
    const packagePayload = new starcoin_types.TransactionPayloadVariantPackage(
      packageData
    );

    // const rawUserTransaction = generateRawUserTransactionForPackage(
    const rawUserTransaction = generateRawUserTransaction(
      senderAddressHex,
      packagePayload,
      maxGasAmount,
      senderSequenceNumber,
      expirationTimestampSecs,
      chainId
    );

    const signedUserTransactionHex = await signRawUserTransaction(
      senderPrivateKeyHex,
      rawUserTransaction
    );

    const balanceBefore = await provider.getBalance(receiverAddressHex);
    const txn = await provider.sendTransaction(signedUserTransactionHex);

    const txnInfo = await txn.wait(1);
    console.log("txnInfo", txnInfo)
  }, 120000);
});
