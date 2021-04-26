import { JsonrpcProvider } from '.';
import { generateSignedUserTransactionHex } from '../utils/tx';

describe('jsonrpc-provider', () => {
  // let provider = new JsonrpcProvider("http://39.102.41.156:9850", undefined);

  const nodeUrl = 'http://localhost:9850'
  const chainId = 254

  const provider = new JsonrpcProvider(nodeUrl);
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

  test('getTransactionEvent', async () => {
    const events = await provider.getTransactionEvents({
      event_keys: []
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
    let code = await provider.getCode("0x1::Account");
    code = await provider.getCode("0x1::Account");
    expect(code).toBeUndefined();
  });
  test('get resource', async () => {
    let resource = await provider.getResource("0x1", "0x1::Account::Account");
    resource = await provider.getResource("0x2", "0x1::Account::Account");
    expect(resource).toBeUndefined();
  });


  test('get resources', async () => {
    let resources = await provider.getResources("0x1");
  });

  test('get balances', async () => {
    let balances = await provider.getBalances("0x1");
  });

  test('txn sign using sender password and submit', async () => {
    const signer = await provider.getSigner();
    const password = ""; // put password into the quotes
    await signer.unlock(password);
    const txnRequest = {
      script: {
        code: '0x1::TransferScripts::peer_to_peer',
        type_args: ['0x1::STC::STC'],
        args: ['0xc13b50bdb12e3fdd03c4e3b05e34926a', 'x"29b6012aee31a216af67c3d05e21a092c13b50bdb12e3fdd03c4e3b05e34926a"', '100000u128'],
      }
    };
    const txnOutput = await provider.dryRun(txnRequest);

    const balanceBefore = await provider.getBalance('0xc13b50bdb12e3fdd03c4e3b05e34926a');

    const txn = await signer.sendTransaction(txnRequest);
    const txnInfo = await txn.wait(1);
    const balance = await provider.getBalance('0xc13b50bdb12e3fdd03c4e3b05e34926a');
    if (balanceBefore !== undefined) {
      // @ts-ignore
      const diff = balance - balanceBefore;
      expect(diff).toBe(100000);
    } else {
      expect(balance).toBe(100000);
    }
  }, 10000);

  test('txn sign using sender privateKey and submit', async () => {
    // privateKey is generated in starcoin console using command:
    // starcoin% account export <ADDRESS> -p <PASSWORD>
    const senderPrivateKeyHex = '0x83c7829c68e1ad81ced10f69d11ea741f7f18c7a5f059215e8a965362a5ae25e'

    const senderAddressHex = '0x49624992dd72da077ee19d0be210406a'

    const senderSequenceNumber = await provider.getSequenceNumber(senderAddressHex)

    const receiverAddressHex = '0x621500bf2b4aad17a690cb24f9a225c6'

    const amount = 1000000000

    // TODO: generate maxGasAmount from contract.dry_run -> gas_used
    const maxGasAmount = 124191

    // because the time system in dev network is relatively static, 
    // we should use nodeInfo.now_secondsinstead of using new Date().getTime()
    const nowSeconds = await provider.getNowSeconds()
    // expired after 12 hours since Unix Epoch
    const expirationTimestampSecs = nowSeconds + 43200

    const signedUserTransactionHex = await generateSignedUserTransactionHex(senderPrivateKeyHex, senderAddressHex, receiverAddressHex, amount, maxGasAmount, senderSequenceNumber, expirationTimestampSecs, chainId);

    console.log({ signedUserTransactionHex })

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
  }, 10000);

});

