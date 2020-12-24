import { JsonrpcProvider } from '.';

describe('jsonrpc-provider', () => {
  const provider = new JsonrpcProvider(undefined, undefined);
  test('detectNetwork', async () => {
    const net = await provider.getNetwork();
    expect(net.chainId).toBe(254);
  });
  test('getBlockNumber', async () => {
    const blockNumber = await provider.getBlockNumber();
    console.log(blockNumber);
    expect(provider.blockNumber).toBe(blockNumber);
  });

  test('getBlock', async () => {
    const block = await provider.getBlock(0);

    console.log(
      JSON.stringify(
        block,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value),
        2
      )
    );

    expect(block.header.author).toBe('0x1');
  });

  test('getTransaction', async () => {
    const block = await provider.getBlock(0);
    const txnHash = block.transactions[0].transaction_hash;
    const txn = await provider.getTransaction(txnHash);
    console.log(txn);
    const txnInfo = await provider.getTransactionInfo(txnHash);
    console.log(txnInfo);
  });

  test('getTransactionEvent', async () => {
    const events = await provider.getTransactionEvents({
      event_keys: []
    });
    console.log(events);
  });

  test('call contract', async () => {
    const values = await provider.call( {
      module_address: '0x1',
      module_name: 'Account',
      func: 'balance',
      type_args: ['0x1::STC::STC'],
      args: ['0x1'],
    });
    console.log(values);
  });

  test('get code', async () => {
    let code = await provider.getCode("0x1::Account");
    console.log(code);
    code = await provider.getCode("0x1::Accouny");
    expect(code).toBeUndefined();
  });
  test('get resource', async () => {
    let resource = await provider.getResource("0x1", "0x1::Account::Account");
    console.log(JSON.stringify(resource, undefined, 2));
    resource = await provider.getResource("0x2", "0x1::Account::Account");
    expect(resource).toBeUndefined();
  });
});
