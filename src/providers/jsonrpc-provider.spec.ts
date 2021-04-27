import { JsonrpcProvider } from '.';

const log = (data: any): void => {
  console.log(JSON.stringify(data, undefined, 2))
}

describe('jsonrpc-provider', () => {
  // let provider = new JsonrpcProvider("http://39.102.41.156:9850", undefined);

  const nodeUrl = 'https://starcoin.git.xin'
  const chainId = 251

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
    log(events);
  });

  test('call contract', async () => {
    const values = await provider.call({
      function_id: '0x1::Account::balance',
      type_args: ['0x1::STC::STC'],
      args: ['0x1'],
    });
    log(values);
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

  test('txn sign and submit', async () => {
    const signer = await provider.getSigner();
    await signer.unlock("");
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

  test('SignedUserTransaction', async () => {
    const senderAddress = '0x49624992dd72da077ee19d0be210406a'
    const receiverAddress = '0x621500bf2b4aad17a690cb24f9a225c6'
    const signer = provider.getSigner(senderAddress);
    const balanceBefore = await provider.getBalance(receiverAddress);
    log({ balanceBefore })
  }, 10000);

  test('Sign String Message', async () => {
    const signerAddress = '0x3f19d5422824f47e6c021978cee98f35'
    const unlockPassword = '123456'
    const message = 'foo'
    const signer = provider.getSigner(signerAddress);
    await signer.unlock(unlockPassword)
    const signedMessage = await signer.signMessage(message);
    expect(signedMessage).toBe("0xc51dada886afe59d4651f36b56f3c4a1a84da53dfbddf396d81a5b36ab5cdc265aa1559ad3185b714cb8b62583c4172833026820e6cf264a02f0e3ebd424301a80a15c3e2381c0419a91477805a3c5d60131d353eb29313a786584d4565fb203");
  }, 10000);

  test('Sign Bytes Message', async () => {
    const signerAddress = '0x3f19d5422824f47e6c021978cee98f35'
    const unlockPassword = '123456'
    // const message = new Uint8Array(Buffer.from('foo'))
    // Bytes here means ArrayLike<number>, check '@ethersproject/bytes'
    const message = { 0: 102, 1: 111, 2: 111, length: 3 }
    const signer = provider.getSigner(signerAddress);
    await signer.unlock(unlockPassword)
    const signedMessage = await signer.signMessage(message);
    expect(signedMessage).toBe("0xc51dada886afe59d4651f36b56f3c4a1a84da53dfbddf396d81a5b36ab5cdc265aa1559ad3185b714cb8b62583c4172833026820e6cf264a02f0e3ebd424301a80a15c3e2381c0419a91477805a3c5d60131d353eb29313a786584d4565fb203");
  }, 10000);
});
