import { bcsDecode } from './encoding';
import { DepositEvent, NewBlockEvent, BlockRewardEvent } from './lib/runtime/onchain_events';
import './index';

describe('test onchain events decoding', () => {
  it('should deocde to new block event', () => {
    const t = bcsDecode(
      NewBlockEvent,
      '0x440000000000000094e957321e7bb2d3eb08ff6be81a6fcdec8a9d73780100000000000000000000'
    );
    // @ts-ignore
    console.log(t.toJS());
  });
  it('should decode to deposit event', () => {
    const t = bcsDecode(
      DepositEvent,
      '0x00ca9a3b00000000000000000000000000000000000000000000000000000001035354430353544300'
    );
    // @ts-ignore
    console.log(t.toJS());
  });
  it('should decode to block reward event', () => {
    const t = bcsDecode(
      BlockRewardEvent,
      '0x57fa0200000000006041c420010000000000000000000000000000000000000000000000000000009a306cd9afde5d249257c2c6e6f39103'
    );
    // @ts-ignore
    console.log(t.toJS());
  });
});
