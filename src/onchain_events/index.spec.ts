import { NewBlockEvent } from '../lib/runtime/onchain_events';
import './index';
import { bcsDecode } from '../encoding';

test('decode data', () => {
  const t = bcsDecode(
    NewBlockEvent,
    '0x440000000000000094e957321e7bb2d3eb08ff6be81a6fcdec8a9d73780100000000000000000000'
  );

  // @ts-ignore
  console.log(t.toJS());
});
