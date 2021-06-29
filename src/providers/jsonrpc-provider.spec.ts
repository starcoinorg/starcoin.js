import { JsonRpcProvider } from '.';
import { arrayify, hexlify } from '@ethersproject/bytes';
import {BcsDeserializer, BcsSerializer} from '../lib/runtime/bcs';
import { encodeScriptFunction, generateRawUserTransaction, signRawUserTransaction, encodeStructTypeTags } from '../utils/tx';
import { ReceiptIdentifier } from '../lib/runtime/starcoin_types';
import { addressFromSCS, decodeReceiptIdentifier } from '../encoding';
import * as starcoin_types from "../lib/runtime/starcoin_types";

describe('jsonrpc-provider', () => {
  // let provider = new JsonRpcProvider("http://39.102.41.156:9850", undefined);

  // const nodeUrl = 'http://localhost:9850';
  // const chainId = 254;
  const nodeUrl = 'https://barnard.seed.starcoin.org';
  const chainId = 251;


  const provider = new JsonRpcProvider(nodeUrl);
  test('detectNetwork', async () => {
    const net = await provider.getNetwork();
    expect(net.chainId).toBe(chainId);
  });
  test('getBlockNumber', async () => {
    const blockNumber = await provider.getBlockNumber();
    expect(provider.blockNumber).toBe(blockNumber);
  });

  test('getBlock', async () => {
    const block = await provider.getBlock(0);

    expect(block.header.author).toBe('0x1');
  });

  test('getTransaction', async () => {
    const block = await provider.getBlock(0);
    const txnHash = block.transactions[0].transaction_hash;
    const txn = await provider.getTransaction(txnHash);
    const txnInfo = await provider.getTransactionInfo(txnHash);
  });

  test('getEventsOfTransaction', async () => {
    const block = await provider.getBlock(0);
    const txnHash = block.transactions[0].transaction_hash;
    const txnEvents = await provider.getEventsOfTransaction(txnHash);
    expect(txnEvents.length).toBeGreaterThan(0);
    console.log(txnEvents);
  });

  test('getTransactionEvents', async () => {
    const events = await provider.getTransactionEvents({
      event_keys: [],
    });
    console.log(JSON.stringify(events, undefined, 2));
  });

  test('call contract', async () => {
    const values = await provider.call({
      function_id: '0x1::Account::balance',
      type_args: ['0x1::STC::STC'],
      args: ['0x1'],
    });
    console.log(JSON.stringify(values, undefined, 2));
  });

  test('get code', async () => {
    let code = await provider.getCode('0x1::Account');
    code = await provider.getCode('0x1::Account');
    expect(code).toBeUndefined();
  });
  test('get resource', async () => {
    let resource = await provider.getResource('0x1', '0x1::Account::Account');
    resource = await provider.getResource('0x2', '0x1::Account::Account');
    expect(resource).toBeUndefined();
  });

  test('get resources', async () => {
    let resources = await provider.getResources('0x1');
  });

  test('get balances', async () => {
    let balances = await provider.getBalances('0x1');
  });

  test('txn sign using sender password and submit', async () => {
    const signer = await provider.getSigner();
    const password = ''; // put password into the quotes
    await signer.unlock(password);
    const txnRequest = {
      script: {
        code: '0x1::TransferScripts::peer_to_peer',
        type_args: ['0x1::STC::STC'],
        args: [
          '0xc13b50bdb12e3fdd03c4e3b05e34926a',
          'x""',
          '100000u128',
        ],
      },
    };
    const txnOutput = await provider.dryRun(txnRequest);

    const balanceBefore = await provider.getBalance(
      '0xc13b50bdb12e3fdd03c4e3b05e34926a'
    );

    const txn = await signer.sendTransaction(txnRequest);
    const txnInfo = await txn.wait(1);
    const balance = await provider.getBalance(
      '0xc13b50bdb12e3fdd03c4e3b05e34926a'
    );
    if (balanceBefore !== undefined) {
      // @ts-ignore
      const diff = balance - balanceBefore;
      expect(diff).toBe(100000);
    } else {
      expect(balance).toBe(100000);
    }
  }, 10000);

  test('txn sign using sender privateKey and submit(timeout in 2 minutes)', async () => {
    // privateKey is generated in starcoin console using command:
    // starcoin% account export <ADDRESS> -p <PASSWORD>
    const senderPrivateKeyHex =
      '0xe424e16db235e3f3b9ef2475516c51d4c15aa5287ceb364213698bd551eab4f2';

    const senderPublicKeyHex =
      '0x704148879e1341243f754d62fa5228529ccb207be6bd3af20b2c5422f6f234d8';

    const senderAddressHex = '0x319ccfe5fc73a2cdae11c40f31ca1b61';

    const senderSequenceNumber = await provider.getSequenceNumber(
      senderAddressHex
    );

    // const receiverAddressHex = '0x84d6de1c82bea949966fd13e7896e381';
    // const receiverAuthKeyHex = 'd9bddf7607b58be4331c888116e2365f84d6de1c82bea949966fd13e7896e381';
    const receiver = '0x84d6de1c82bea949966fd13e7896e381'

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

    const sendAmountString = `${ amount.toString() }u128`
    const txnRequest = {
      chain_id: chainId,
      gas_unit_price: 1,
      sender: senderAddressHex,
      sender_public_key: senderPublicKeyHex,
      sequence_number: senderSequenceNumber,
      max_gas_amount: 10000000,
      script: {
        code: '0x1::TransferScripts::peer_to_peer',
        type_args: ['0x1::STC::STC'],
        args: [receiverAddressHex, `x"${ receiverAuthKeyHex }"`, sendAmountString],
      },
    }
    const txnOutput = await provider.dryRun(txnRequest)

    // TODO: generate maxGasAmount from contract.dry_run -> gas_used
    const maxGasAmount = 10000000;

    // because the time system in dev network is relatively static,
    // we should use nodeInfo.now_secondsinstead of using new Date().getTime()
    const nowSeconds = await provider.getNowSeconds();
    // expired after 12 hours since Unix Epoch
    const expirationTimestampSecs = nowSeconds + 43200;

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
      gas_used,
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
    const balance = await provider.getBalance(receiverAddressHex);
    if (balanceBefore !== undefined) {
      // @ts-ignore
      const diff = balance - balanceBefore;
      expect(diff).toBe(amount);
    } else {
      expect(balance).toBe(amount);
    }
  }, 120000);

  test('Sign String Message', async () => {
    const signerAddress = '0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    const unlockPassword = 'your-password';
    const message = 'foo';
    const signer = provider.getSigner(signerAddress);
    await signer.unlock(unlockPassword);
    const signedMessage = await signer.signMessage(message);
    expect(signedMessage).toBe(
      '0xc51dada886afe59d4651f36b56f3c4a1a84da53dfbddf396d81a5b36ab5cdc265aa1559ad3185b714cb8b62583c4172833026820e6cf264a02f0e3ebd424301a80a15c3e2381c0419a91477805a3c5d60131d353eb29313a786584d4565fb203'
    );
  }, 10000);

  test('Sign Bytes Message', async () => {
    const signerAddress = '0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    const unlockPassword = 'your-password';
    // const message = new Uint8Array(Buffer.from('foo'))
    // Bytes here means ArrayLike<number>, check '@ethersproject/bytes'
    const message = { 0: 102, 1: 111, 2: 111, length: 3 };
    const signer = provider.getSigner(signerAddress);
    await signer.unlock(unlockPassword);
    const signedMessage = await signer.signMessage(message);
    expect(signedMessage).toBe(
      '0xc51dada886afe59d4651f36b56f3c4a1a84da53dfbddf396d81a5b36ab5cdc265aa1559ad3185b714cb8b62583c4172833026820e6cf264a02f0e3ebd424301a80a15c3e2381c0419a91477805a3c5d60131d353eb29313a786584d4565fb203'
    );
  }, 10000);
});

test('deployPackage', async () => {
  // privateKey is generated in starcoin console using command:
  // starcoin% account export <ADDRESS> -p <PASSWORD>
  const senderPrivateKeyHex =
    '0x033afc60373f15c34c548b532c3b846585a427c65466acd5610a651689d9ac22';

  const senderPublicKeyHex =
    '0xc5bbf0c3ba97c80f2a7959a44fffdd4900ab6f6c3090e85ba87bfcfde5f50e1a';

  const senderAddressHex = '0x4b2b6e26ee6919d6878c05ae2c3572da';

  const moduleAddressHex = '0x4b2b6e26ee6919d6878c05ae2c3572da';
  const moduleHex = '0x4b2b6e26ee6919d6878c05ae2c3572da02ab02a11ceb0b0200000009010006020609030f2204310805392807615708b801200ad801050cdd0126000001010102000007000202040100000300010000040201000206040101040107050101040204070801040108090101040203030304030503010c00020c0401080002060c0201060c010b0101080002060c04010b0101090002060c0b0101090003506464074163636f756e7405546f6b656e04696e6974046d696e740b64756d6d795f6669656c640e72656769737465725f746f6b656e0f646f5f6163636570745f746f6b656e0f6465706f7369745f746f5f73656c664b2b6e26ee6919d6878c05ae2c3572da0000000000000000000000000000000100020105010002000001060e00310338000e003801020102000006080e000a0138020c020e000b02380302008d03a11ceb0b020000000a010006020609030f3a04490c0555310786017a0880022006a002030aa302050ca80238000001010102000007000202040100000300010000040102010400050301000006010400020806010104010907010104020a010202040402050a0b0104010b0c010104020601040104040505050608070508050905010c000101020c04010501080002060c0201060c0208000900010b0101080002060c04010b0101090002060c0b0101090003414243074163636f756e7405546f6b656e04696e69740669735f616263046d696e740d746f6b656e5f616464726573730b64756d6d795f6669656c640e72656769737465725f746f6b656e0f646f5f6163636570745f746f6b656e0d69735f73616d655f746f6b656e0f6465706f7369745f746f5f73656c664b2b6e26ee6919d6878c05ae2c3572da0000000000000000000000000000000102011200020107010002000001060e00070038000e003801020101000001023802020202000009080e000a0138030c020e000b023804020301000001023805020000';

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
