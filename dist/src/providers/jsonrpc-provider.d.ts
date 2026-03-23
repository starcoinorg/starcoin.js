import { Deferrable } from '@ethersproject/properties';
import { ConnectionInfo } from '@ethersproject/web';
import { Bytes } from '@ethersproject/bytes';
import { Network, Networkish } from '../networks';
import { BaseProvider, Event } from './base-provider';
import { TransactionRequest } from '../types';
import { Signer } from '../abstract-signer';
import { Provider } from '../abstract-provider';
export declare class JsonRpcSigner extends Signer {
    readonly provider: JsonRpcProvider;
    _index?: number;
    _address?: string;
    constructor(constructorGuard: any, provider: JsonRpcProvider, addressOrIndex?: string | number);
    connect(provider: Provider): JsonRpcSigner;
    getAddress(): Promise<string>;
    sendUncheckedTransaction(transaction: Deferrable<TransactionRequest>): Promise<string>;
    signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string>;
    signMessage(message: Bytes | string): Promise<string>;
    unlock(password: string): Promise<void>;
}
export declare class JsonRpcProvider extends BaseProvider {
    readonly connection: ConnectionInfo;
    _pendingFilter: Promise<number>;
    _nextId: number;
    constructor(url?: ConnectionInfo | string, network?: Networkish);
    static defaultUrl(): string;
    detectNetwork(): Promise<Network>;
    getSigner(addressOrIndex?: string | number): JsonRpcSigner;
    getNowSeconds(): Promise<number>;
    isAptos(): boolean;
    send(method: string, params: Array<any>): Promise<any>;
    prepareRequest(method: string, params: any): [string, Array<any>];
    perform(method: string, params: any): Promise<any>;
    _startEvent(event: Event): void;
    _stopEvent(event: Event): void;
    static hexlifyTransaction(transaction: TransactionRequest, allowExtra?: {
        [key: string]: boolean;
    }): {
        [key: string]: string;
    };
}
