import { HTTPProvider, starcoin } from '../src';

test('1+1=2', () => {
  expect(2 + 2).toBe(4);
});

const provider = new HTTPProvider({
  url: 'http://127.0.0.1:9850'
});

const STC ={
  address: "00000000000000000000000000000001",
  module: "STC",
  name: "STC",
  type_params: []
};
const ASSOCIATION_ADDRESS = "0000000000000000000000000A550C18";
describe('starcoin api', () => {
  test('dev.call_contract', async () => {
    let result = await starcoin.dev_callContract.execute(provider, {
      module_address: '00000000000000000000000000000001',
      module_name: 'Account',
      func: 'balance',
      type_args: [{
        "Struct": STC
      }],
      args: [{
        "Address": ASSOCIATION_ADDRESS
      }],
    });
    console.log(result);
  });
  test('chain.get_blocks_by_number', async () => {
    let result = await starcoin.chain.get_blocks_by_number.execute(provider, 0, 1);
        console.log(JSON.stringify(result,null, 2 ));
  });
  test('chain.get_events', async () => {
    let result = await starcoin.chain.get_events.execute(provider, {
      from_block: 0,
      event_keys: [],
      limit: 10,
    });
    console.log(JSON.stringify(result,null, 2 ));
  });
});
