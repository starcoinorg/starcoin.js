import { WebsocketProvider, starcoin } from '../src';

const provider = new WebsocketProvider('http://127.0.0.1:9870');

const STC = {
  address: '0x00000000000000000000000000000001',
  module: 'STC',
  name: 'STC',
  type_params: [],
};
const ASSOCIATION_ADDRESS = '0x0000000000000000000000000A550C18';
describe('starcoin api', () => {
  test('dev.call_contract', async () => {
    let result = await starcoin.dev.call_contract.execute(provider, {
      module_address: '0x00000000000000000000000000000001',
      module_name: 'Account',
      func: 'balance',
      type_args: [
        {
          Struct: STC,
        },
      ],
      args: [
        {
          Address: ASSOCIATION_ADDRESS,
        },
      ],
    });
    console.log(result);
  });
  test('chain.get_blocks_by_number', async () => {
    let result = await starcoin.chain.get_blocks_by_number.execute(
      provider,
      null,
      1
    );
    console.log(JSON.stringify(result, null, 2));
  });
  test('chain.get_block_by_uncle', async () => {
    let fake_hash =
      '0xd22db56b61bd6917a6e440b05bc65756c9a8648e0491b62966ccbd3a7e0e208c';
    const result = await starcoin.chain.get_block_by_uncle
      .execute(provider, fake_hash)
      .catch((reason) => {
        console.log(reason);
      });
    expect(result).toBe(null);
  });
  test('chain.get_events', async () => {
    let result = await starcoin.chain.get_events.execute(provider, {
      from_block: 0,
      event_keys: [],
      limit: 10,
    });
    console.log(JSON.stringify(result, null, 2));
  });
  test('chain.current_epoch', async () => {
    let result = await starcoin.chain.current_epoch.execute(provider);
    console.log(JSON.stringify(result, null, 2));
  });
});
