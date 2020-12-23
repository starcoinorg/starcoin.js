import { WebsocketProvider } from '.';

describe('websocket-provider', () => {
  const provider = new WebsocketProvider();
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
      event_keys: [],
    });
    console.log(events);
  });

  afterAll(async () => {
    await provider.destroy();
  });
});
