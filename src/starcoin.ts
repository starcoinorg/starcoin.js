import { Method } from './Method';
import {
  Block, BlockNumber,
  ChainInfo, ContractCall,
  EpochInfo, Event, EventFilter,
  GlobalTimeOnChain, HashValue, MoveValue,
  Transaction, U64
} from './types';
import { outputMoveValuesFormatter } from './utils/formatters';

export const dev = {
  call_contract: new Method<[ContractCall], MoveValue[]>({
    callName: 'dev.call_contract',
    params: 1,
    outputFormatter: outputMoveValuesFormatter
  })
};

export const chain = {
  head: new Method<[], ChainInfo>({
    callName: 'chain.head',
    params: 0,
  }),
  get_block_by_hash:new Method<[HashValue], Block>({
    callName: 'chain.get_block_by_hash',
    params: 1,
  }),
  get_block_by_number:new Method<[BlockNumber], Block>({
    callName: 'chain.get_block_by_number',
    params: 1,
  }),
  get_blocks_by_number:new Method<[BlockNumber|null, U64], Block[]>({
    callName: 'chain.get_blocks_by_number',
    params: 2,
  }),
  get_block_by_uncle:new Method<[HashValue], Block| null>({
    callName: 'chain.get_block_by_uncle',
    params: 1,
  }),
  get_transaction: new Method<[HashValue], Transaction>({
    callName: 'chain.get_transaction',
    params: 1,
  }),
  branches: new Method<[], ChainInfo[]>({
    callName: 'chain.branches',
    params: 0,
  }),
  current_epoch: new Method<[], EpochInfo>({
    callName: 'chain.epoch',
    params: 0,
  }),
  get_epoch_info_by_number: new Method<[BlockNumber], EpochInfo>({
    callName: 'chain.get_epoch_info_by_number',
    params: 1,
  }),
  get_global_time_by_number: new Method<[BlockNumber], GlobalTimeOnChain>({
    callName: 'chain.get_global_time_by_number',
    params: 1,
  }),

  get_events:new Method<[EventFilter], Event[]>({
    callName: 'chain.get_events',
    params: 1,
  })
};
