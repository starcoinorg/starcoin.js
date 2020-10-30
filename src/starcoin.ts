import { Method } from './Method';
import { outputMoveValuesFormatter } from './utils/formatters';
import {
  Block,
  ChainInfo,
  EpochInfo, Event,
  GlobalTimeOnChain,
  Transaction
} from './lib/types';

const identity = (v: any) => v;

export const dev_callContract = new Method({
  callName: 'dev.call_contract',
  params: 1,
  outputFormatter: outputMoveValuesFormatter
});

export const chain = {
  head: new Method<ChainInfo>({
    callName: 'chain.head',
    params: 0,
    outputFormatter: identity,
  }),
  get_block_by_hash:new Method<Block>({
    callName: 'chain.get_block_by_hash',
    params: 1,
    outputFormatter: identity,
  }),
  get_block_by_number:new Method<Block>({
    callName: 'chain.get_block_by_number',
    params: 1,
    outputFormatter: identity,
  }),
  get_blocks_by_number:new Method<Block[]>({
    callName: 'chain.get_blocks_by_number',
    params: 2,
    outputFormatter: identity,
  }),
  get_block_by_uncle:new Method<Block| null>({
    callName: 'chain.get_block_by_uncle',
    params: 1,
    outputFormatter: identity,
  }),
  get_transaction: new Method<Transaction>({
    callName: 'chain.get_transaction',
    params: 1,
    outputFormatter: identity,
  }),
  branches: new Method<ChainInfo[]>({
    callName: 'chain.branches',
    params: 0,
    outputFormatter: identity,
  }),
  current_epoch: new Method<EpochInfo>({
    callName: 'chain.current_epoch',
    params: 0,
    outputFormatter: identity,
  }),
  get_epoch_info_by_number: new Method<EpochInfo>({
    callName: 'chain.get_epoch_info_by_number',
    params: 1,
    outputFormatter: identity,
  }),
  get_global_time_by_number: new Method<GlobalTimeOnChain>({
    callName: 'chain.get_global_time_by_number',
    params: 1,
    outputFormatter: identity,
  }),

  get_events:new Method<Event[]>({
    callName: 'chain.get_events',
    params: 1,
    outputFormatter: identity,
  })
};
