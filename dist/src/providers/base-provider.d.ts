/// <reference types="node" />
import { Deferrable } from '@ethersproject/properties';
import { EventType, Listener, Provider } from '../abstract-provider';
import { Network, Networkish } from '../networks';
import { Formatter } from './formatter';
import { ModuleId, AccountAddress, BlockNumber, MoveStruct, MoveValue, TransactionEventView, BlockTag, BlockWithTransactions, CallRequest, Filter, TransactionInfoView, TransactionOutput, TransactionRequest, TransactionResponse, U64, SignedUserTransactionView, HashValue } from '../types';
/**
 *  EventType
 *   - "block"
 *   - "poll"
 *   - "didPoll"
 *   - "pending"
 *   - "error"
 *   - "network"
 *   - filter
 *   - topics array
 *   - transaction hash
 */
export declare const CONSTANTS: {
    pending: string;
    block: string;
    network: string;
    poll: string;
    filter: string;
    tx: string;
};
export declare class Event {
    readonly listener: Listener;
    readonly once: boolean;
    readonly tag: string;
    constructor(tag: string, listener: Listener, once: boolean);
    get event(): EventType;
    get type(): string;
    get hash(): string;
    get filter(): Filter;
    pollable(): boolean;
}
export declare const RPC_ACTION: {
    getChainInfo: string;
    getNodeInfo: string;
    sendTransaction: string;
    getBlock: string;
    getTransactionByHash: string;
    getTransactionInfo: string;
    getEventsOfTransaction: string;
    getEvents: string;
    call: string;
    callV2: string;
    getCode: string;
    getResource: string;
    getAccountState: string;
    getGasPrice: string;
    dryRun: string;
    dryRunRaw: string;
    sendTransactionV2: string;
    dryRunV2: string;
    dryRunRawV2: string;
    getResourceV2: string;
    getCodeV2: string;
    callV2VM2: string;
    getAccountStateV2: string;
    resolveFunction: string;
    resolveFunctionV2: string;
};
export declare abstract class BaseProvider extends Provider {
    _networkPromise: Promise<Network>;
    _network: Network;
    _events: Array<Event>;
    formatter: Formatter;
    _emitted: {
        [eventName: string]: number | 'pending';
    };
    _pollingInterval: number;
    _poller: NodeJS.Timer;
    _bootstrapPoll: NodeJS.Timer;
    _lastBlockNumber: number;
    _fastBlockNumber: number;
    _fastBlockNumberPromise: Promise<number>;
    _fastQueryDate: number;
    _maxInternalBlockNumber: number;
    _internalBlockNumber: Promise<{
        blockNumber: number;
        reqTime: number;
        respTime: number;
    }>;
    readonly anyNetwork: boolean;
    /**
     *  ready
     *
     *  A Promise<Network> that resolves only once the provider is ready.
     *
     *  Sub-classes that call the super with a network without a chainId
     *  MUST set this. Standard named networks have a known chainId.
     *
     */
    constructor(network: Networkish | Promise<Network>);
    _ready(): Promise<Network>;
    get ready(): Promise<Network>;
    static getFormatter(): Formatter;
    private _getInternalBlockNumber;
    protected poll(): Promise<void>;
    get network(): Network;
    abstract detectNetwork(): Promise<Network>;
    getNetwork(): Promise<Network>;
    get blockNumber(): number;
    get polling(): boolean;
    set polling(value: boolean);
    get pollingInterval(): number;
    set pollingInterval(value: number);
    _getFastBlockNumber(): Promise<number>;
    _setFastBlockNumber(blockNumber: number): void;
    waitForTransaction(transactionHash: string, confirmations?: number, timeout?: number): Promise<TransactionInfoView>;
    getBlockNumber(): Promise<number>;
    getGasPrice(): Promise<U64>;
    getCode(moduleId: ModuleId | Promise<ModuleId>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string | undefined>;
    getResource(address: AccountAddress | Promise<AccountAddress>, resource_struct_tag: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<MoveStruct | undefined>;
    getResources(address: AccountAddress | Promise<AccountAddress>, blockTag?: BlockTag | Promise<BlockTag>): Promise<{
        [k: string]: MoveStruct;
    } | undefined>;
    protected _wrapTransaction(tx: SignedUserTransactionView, hash?: string): TransactionResponse;
    sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse>;
    private static getModuleId;
    private _getFilter;
    call(request: CallRequest | Promise<CallRequest>, blockTag?: BlockTag | Promise<BlockTag>): Promise<Array<MoveValue>>;
    callV2(request: CallRequest | Promise<CallRequest>, blockTag?: BlockTag | Promise<BlockTag>): Promise<Array<MoveValue>>;
    dryRun(transaction: Deferrable<TransactionRequest>): Promise<TransactionOutput>;
    dryRunRaw(rawUserTransactionHex: string, publicKeyHex: string): Promise<TransactionOutput>;
    sendRawTransactionV2(signedTransactionHex: string): Promise<string>;
    dryRunRawV2(rawUserTransactionHex: string, publicKeyHex: string): Promise<TransactionOutput>;
    getResourceV2(address: AccountAddress | Promise<AccountAddress>, resource_struct_tag: string | Promise<string>): Promise<MoveStruct | undefined>;
    getCodeV2(moduleId: ModuleId | Promise<ModuleId>): Promise<string | undefined>;
    private _getBlock;
    getBlock(blockTag: number | string | Promise<number | string>): Promise<BlockWithTransactions>;
    getTransaction(transactionHash: string | Promise<string>): Promise<TransactionResponse>;
    getTransactionInfo(transactionHash: string | Promise<string>): Promise<TransactionInfoView>;
    getEventsOfTransaction(transactionHash: HashValue): Promise<TransactionEventView[]>;
    getTransactionEvents(filter: Filter | Promise<Filter>): Promise<Array<TransactionEventView>>;
    _getBlockTag(blockTag: number | Promise<number>): Promise<BlockNumber>;
    abstract perform(method: string, params: any): Promise<any>;
    _startEvent(event: Event): void;
    _stopEvent(event: Event): void;
    _addEventListener(eventName: EventType, listener: Listener, once: boolean): this;
    on(eventName: EventType, listener: Listener): this;
    once(eventName: EventType, listener: Listener): this;
    emit(eventName: EventType, ...args: Array<any>): boolean;
    listenerCount(eventName?: EventType): number;
    listeners(eventName?: EventType): Array<Listener>;
    off(eventName: EventType, listener?: Listener): this;
    removeAllListeners(eventName?: EventType): this;
}
