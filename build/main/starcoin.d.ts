import { Method } from './Method';
import { Block, ChainInfo, ContractCall, EpochInfo, Event, EventFilter, GlobalTimeOnChain, MoveValue, Transaction } from './types';
export declare const dev: {
    call_contract: Method<[ContractCall], MoveValue[]>;
};
export declare const chain: {
    head: Method<[], ChainInfo>;
    get_block_by_hash: Method<[string], Block>;
    get_block_by_number: Method<[number], Block>;
    get_blocks_by_number: Method<[number | null, number], Block[]>;
    get_block_by_uncle: Method<[string], Block | null>;
    get_transaction: Method<[string], Transaction>;
    branches: Method<[], ChainInfo[]>;
    current_epoch: Method<[], EpochInfo>;
    get_epoch_info_by_number: Method<[number], EpochInfo>;
    get_global_time_by_number: Method<[number], GlobalTimeOnChain>;
    get_events: Method<[EventFilter], Event[]>;
};
