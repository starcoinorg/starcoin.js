import { WebsocketProvider } from '.';

describe('websocket-provider', () => {
  const provider = new WebsocketProvider();
  test('detectNetwork', async () => {
    const net = await provider.getNetwork();
    expect(net.chainId).toBe(254);
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
      event_keys: [],
    });
  });

  test('call contract', async () => {
    const values = await provider.call({
      function_id: '0x1::Account::balance',
      type_args: ['0x1::STC::STC'],
      args: ['0x1'],
    });
  });

  test('get code', async () => {
    let code = await provider.getCode("0x1::Account");
    code = await provider.getCode("0x1::Accouny");
    expect(code).toBeUndefined();
  });
  test('get resource', async () => {
    let resource = await provider.getResource("0x1", "0x1::Account::Account");
    resource = await provider.getResource("0x2", "0x1::Account::Account");
    expect(resource).toBeUndefined();
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

  afterAll(async () => {
    await provider.destroy();
  });
});
