import { arrayify, hexlify } from '@ethersproject/bytes';
import { addHexPrefix } from 'ethereumjs-util';
import { JsonRpcProvider } from '.';
import { BcsSerializer, BcsDeserializer } from '../lib/runtime/bcs';
import { encodeScriptFunction, generateRawUserTransaction, signRawUserTransaction, encodeStructTypeTags } from '../utils/tx';
import { ReceiptIdentifier, TransactionPayload, TransactionPayloadVariantPackage } from '../lib/runtime/starcoin_types';
import { addressFromSCS, decodeTransactionPayload, bcsEncode, decodeReceiptIdentifier, packageHexToTransactionPayload, packageHexToTransactionPayloadHex } from '../encoding';

describe('jsonrpc-provider', () => {
  // let provider = new JsonRpcProvider("http://39.102.41.156:9850", undefined);

  // const nodeUrl = 'http://localhost:9850';
  // const chainId = 254;
  // const nodeUrl = 'https://barnard-seed.starcoin.org';
  // const chainId = 251;
  const nodeUrl = 'https://main-seed.starcoin.org';
  // const nodeUrl = 'https://fullnode.mainnet.aptoslabs.com/v1/';
  const chainId = 1;


  const provider = new JsonRpcProvider(nodeUrl);
  test('detectNetwork', async () => {
    const net = await provider.getNetwork();
    expect(net.chainId).toBe(chainId);
  }, 10000);
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

  test('call contract v2', async () => {
    const values = await provider.callV2({
      function_id: '0x1::Token::scaling_factor',
      type_args: ['0x1::STC::STC'],
      args: [],
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
      '0x2bc8181071dc81eddf8756fedfadfb9a99141196dc1ef7a8f4254b1dea4d928a';

    const senderPublicKeyHex =
      '0x06898c96a2abfa44ba4d5db6f9f3751595bb868eaac01c8f3c6bb4424ee882a6';

    const senderAddressHex = '0x024f69FF412b2C1Bb1dD394d79554F30';

    const senderSequenceNumber = await provider.getSequenceNumber(
      senderAddressHex
    );

    // const receiverAddressHex = '0x84d6de1c82bea949966fd13e7896e381';
    // const receiverAuthKeyHex = 'd9bddf7607b58be4331c888116e2365f84d6de1c82bea949966fd13e7896e381';
    const receiver = '0x49624992dD72Da077ee19D0be210406A'

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

    // const sendAmountString = `${ amount.toString() }u128`
    // const txnRequest = {
    //   chain_id: chainId,
    //   gas_unit_price: 1,
    //   sender: senderAddressHex,
    //   sender_public_key: senderPublicKeyHex,
    //   sequence_number: senderSequenceNumber,
    //   max_gas_amount: 10000000,
    //   script: {
    //     code: '0x1::TransferScripts::peer_to_peer',
    //     type_args: ['0x1::STC::STC'],
    //     args: [receiverAddressHex, `x"${ receiverAuthKeyHex }"`, sendAmountString],
    //   },
    // }
    // const txnOutput = await provider.dryRun(txnRequest)

    // TODO: generate maxGasAmount from contract.dry_run -> gas_used
    let maxGasAmount = BigInt(10000000);
    const gasUnitPrice = 1;
    // because the time system in dev network is relatively static,
    // we should use nodeInfo.now_secondsinstead of using new Date().getTime()
    const nowSeconds = await provider.getNowSeconds();
    // expired after 12 hours since Unix Epoch
    const expiredSecs = 43200
    const expirationTimestampSecs = nowSeconds + expiredSecs

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

    console.log({ scriptFunction })
    let rawUserTransaction = generateRawUserTransaction(
      senderAddressHex,
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

    const dryRunRawResult = await provider.dryRunRaw(
      rawUserTransactionHex,
      senderPublicKeyHex
    );
    console.log({ dryRunRawResult })
    if (dryRunRawResult.status === 'Executed') {
      console.log(dryRunRawResult.gas_used, typeof dryRunRawResult.gas_used)
      maxGasAmount = BigInt(Math.ceil(<number>dryRunRawResult.gas_used * 3))
      rawUserTransaction = generateRawUserTransaction(
        senderAddressHex,
        scriptFunction,
        maxGasAmount,
        gasUnitPrice,
        senderSequenceNumber,
        expirationTimestampSecs,
        chainId
      );
      console.log({ rawUserTransaction })
    }

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
    expect(maxGasAmount).toBeLessThan(10000000n);
  }, 120000);

  test('deploy contract with blob hex', async () => {
    // privateKey is generated in starcoin console using command:
    // starcoin% account export <ADDRESS> -p <PASSWORD>
    const privateKey = '0x83c7829c68e1ad81ced10f69d11ea741f7f18c7a5f059215e8a965362a5ae25e';

    const address = '0x49624992dd72da077ee19d0be210406a';

    const senderSequenceNumber = await provider.getSequenceNumber(
      address
    );

    // TODO: generate maxGasAmount from contract.dry_run -> gas_used
    const maxGasAmount = 10000000;
    const gasUnitPrice = 1;
    // because the time system in dev network is relatively static,
    // we should use nodeInfo.now_secondsinstead of using new Date().getTime()
    const nowSeconds = await provider.getNowSeconds();
    // expired after 12 hours since Unix Epoch
    const expiredSecs = 43200
    const expirationTimestampSecs = nowSeconds + expiredSecs

    const packageHex = '49624992dd72da077ee19d0be210406a02ab02a11ceb0b0200000009010006020609030f2204310805392807615708b801200ad801050cdd0126000001010102000007000202040100000300010000040201000206040101040107050101040204070801040108090101040203030304030503010c00020c0401080002060c0201060c010b0101080002060c04010b0101090002060c0b0101090003506464074163636f756e7405546f6b656e04696e6974046d696e740b64756d6d795f6669656c640e72656769737465725f746f6b656e0f646f5f6163636570745f746f6b656e0f6465706f7369745f746f5f73656c6649624992dd72da077ee19d0be210406a0000000000000000000000000000000100020105010002000001060e00310338000e003801020102000006080e000a0138020c020e000b02380302008d03a11ceb0b020000000a010006020609030f3a04490c0555310786017a0880022006a002030aa302050ca80238000001010102000007000202040100000300010000040102010400050301000006010400020806010104010907010104020a010202040402050a0b0104010b0c010104020601040104040505050608070508050905010c000101020c04010501080002060c0201060c0208000900010b0101080002060c04010b0101090002060c0b0101090003414243074163636f756e7405546f6b656e04696e69740669735f616263046d696e740d746f6b656e5f616464726573730b64756d6d795f6669656c640e72656769737465725f746f6b656e0f646f5f6163636570745f746f6b656e0d69735f73616d655f746f6b656e0f6465706f7369745f746f5f73656c6649624992dd72da077ee19d0be210406a0000000000000000000000000000000102011200020107010002000001060e00070038000e003801020101000001023802020202000009080e000a0138030c020e000b023804020301000001023805020000';
    const transactionPayload = packageHexToTransactionPayload(packageHex)

    // const transactionPayloadHex = bcsEncode(transactionPayload)
    // // or 
    // // const transactionPayloadHex = packageHexToTransactionPayloadHex(packageHex)
    // console.log({ packageHex, transactionPayloadHex })
    // const txnPayload = decodeTransactionPayload(transactionPayloadHex);
    // console.log({ txnPayload })

    const rawUserTransaction = generateRawUserTransaction(
      address,
      transactionPayload,
      maxGasAmount,
      gasUnitPrice,
      senderSequenceNumber,
      expirationTimestampSecs,
      chainId
    );

    const signedUserTransactionHex = await signRawUserTransaction(
      privateKey,
      rawUserTransaction
    );

    const txn = await provider.sendTransaction(signedUserTransactionHex);

    const txnInfo = await txn.wait(1);

    // console.log(txnInfo);

    expect(txnInfo.status).toBe('Executed');
  }, 120000);

});
