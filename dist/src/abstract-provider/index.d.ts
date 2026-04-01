import { Deferrable } from '@ethersproject/properties';
import { OnceBlockable } from '@ethersproject/web';
import { Network } from '../networks';
import { AccountAddress, BlockTag, BlockWithTransactions, CallRequest, EventFilter, Filter, HashValue, ModuleId, MoveStruct, MoveValue, TransactionEventView, TransactionInfoView, TransactionOutput, TransactionRequest, TransactionResponse, U128, U64 } from '../types';
export declare type EventType = string | Array<string> | EventFilter;
export declare type Listener = (...args: any[]) => void;
export declare abstract class Provider implements OnceBlockable {
    abstract getNetwork(): Promise<Network>;
    abstract getBlockNumber(): Promise<number>;
    abstract getGasPrice(): Promise<U64>;
    getBalance(address: AccountAddress | Promise<AccountAddress>, token?: string, blockTag?: BlockTag | Promise<BlockTag>): Promise<U128 | undefined>;
    getBalances(address: AccountAddress | Promise<AccountAddress>, blockTag?: BlockTag | Promise<BlockTag>): Promise<{
        [k: string]: U128;
    } | undefined>;
    getSequenceNumber(address: AccountAddress | Promise<AccountAddress>, blockTag?: BlockTag | Promise<BlockTag>): Promise<U64 | undefined>;
    abstract getCode(moduleId: ModuleId | Promise<ModuleId>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string | undefined>;
    abstract getResource(address: AccountAddress | Promise<AccountAddress>, resource_struct_tag: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<MoveStruct | undefined>;
    abstract getResources(address: AccountAddress | Promise<AccountAddress>, blockTag?: BlockTag | Promise<BlockTag>): Promise<{
        [k: string]: MoveStruct;
    }>;
    abstract sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse>;
    abstract call(transaction: CallRequest | Promise<CallRequest>, blockTag?: BlockTag | Promise<BlockTag>): Promise<Array<MoveValue>>;
    abstract dryRun(transaction: Deferrable<TransactionRequest>): Promise<TransactionOutput>;
    abstract getBlock(blockHashOrBlockTag: BlockTag | Promise<BlockTag>): Promise<BlockWithTransactions>;
    abstract getTransaction(transactionHash: HashValue): Promise<TransactionResponse>;
    abstract getTransactionInfo(transactionHash: HashValue): Promise<TransactionInfoView>;
    abstract getEventsOfTransaction(transactionHash: HashValue): Promise<TransactionEventView[]>;
    abstract getTransactionEvents(filter: Filter): Promise<Array<TransactionEventView>>;
    abstract on(eventName: EventType, listener: Listener): Provider;
    abstract once(eventName: EventType, listener: Listener): Provider;
    abstract emit(eventName: EventType, ...args: Array<any>): boolean;
    abstract listenerCount(eventName?: EventType): number;
    abstract listeners(eventName?: EventType): Array<Listener>;
    abstract off(eventName: EventType, listener?: Listener): Provider;
    abstract removeAllListeners(eventName?: EventType): Provider;
    addListener(eventName: EventType, listener: Listener): Provider;
    removeListener(eventName: EventType, listener: Listener): Provider;
    abstract waitForTransaction(transactionHash: string, confirmations?: number, timeout?: number): Promise<TransactionInfoView>;
    readonly _isProvider: boolean;
    constructor();
    static isProvider(value: any): value is Provider;
}
