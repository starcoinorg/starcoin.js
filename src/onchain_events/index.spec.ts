import { NewBlockEvent } from '../lib/runtime/onchain_events';
import './index';
import { bcsDecode } from '../encoding';
import { decodeEventKey, decodeEventData } from './index';

test('decode data', () => {
  const t = bcsDecode(
    NewBlockEvent,
    '0x440000000000000094e957321e7bb2d3eb08ff6be81a6fcdec8a9d73780100000000000000000000'
  );

  // @ts-ignore
  console.log(t.toJS());
});

// To test and see the decoded event data and key structure, run:
// yarn test:unit  src/onchain_events/index.spec.ts

test('decode deposit event data', () => {
  const eventName = 'DepositEvent';
  const eventData = '0x00ca9a3b00000000000000000000000000000000000000000000000000000001035354430353544300';
  const result = decodeEventData(eventName, eventData);
  console.log(result.toJS());
});

test('decode withdraw event data', () => {
  const eventName = 'WithdrawEvent';
  const eventData = '0x00e1f50500000000000000000000000000000000000000000000000000000001035354430353544300';
  const result = decodeEventData(eventName, eventData);
  console.log(result.toJS());
});

test('decode new block event data', () => {
  const eventName = 'NewBlockEvent';
  const eventData = '0x440000000000000094e957321e7bb2d3eb08ff6be81a6fcdec8a9d73780100000000000000000000';
  const result = decodeEventData(eventName, eventData);
  console.log(result.toJS());
});

test('decode block reward event data', () => {
  const eventName = 'BlockRewardEvent';
  const eventData = '0x57fa0200000000006041c420010000000000000000000000000000000000000000000000000000009a306cd9afde5d249257c2c6e6f39103';
  const result = decodeEventData(eventName, eventData);
  console.log(result.toJS());
});

test('decode accept token event data', () => {
  const eventName = 'AcceptTokenEvent';
  const eventData = '0x000000000000000000000000000000010353544303535443';
  const result = decodeEventData(eventName, eventData);
  console.log(result.toJS());
});

test('decode mint event data', () => {
  const eventName = 'MintEvent';
  const eventData = '0x80cb29d0000000000000000000000000000000000000000000000000000000010353544303535443';
  const result = decodeEventData(eventName, eventData);
  console.log(result.toJS());
});

test('decode vote changed event data', () => {
  const eventName = 'VoteChangedEvent';
  const eventData = '0x0a000000000000000000000000000000000000000a550c180000000000000000000000000a550c180100003426f56b1c000000000000000000';
  const result = decodeEventData(eventName, eventData);
  console.log(result.toJS());
});

test('decode proposal created event data', () => {
  const eventName = 'ProposalCreatedEvent';
  const eventData = '0x03000000000000000000000000000000000000000a550c18';
  const result = decodeEventData(eventName, eventData);
  console.log(result.toJS());
});


// Decode event key
test("decode event key", () => {
  const eventKeyInHex = "0x000000000000000063af4e1cf4e6345df840f4c57597a0f6";
  const eventKey = decodeEventKey(eventKeyInHex);
  console.log(eventKey);
})
