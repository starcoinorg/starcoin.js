import { Deferrable } from '@ethersproject/properties';
import { Provider } from '../abstract-provider';
import { U128, U64, BlockTag, TransactionRequest, TransactionResponse } from '../types';
export declare abstract class Signer {
    readonly provider?: Provider;
    abstract getAddress(): Promise<string>;
    abstract signMessage(message: string): Promise<string>;
    abstract signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string>;
    abstract connect(provider: Provider): Signer;
    readonly _isSigner: boolean;
    constructor();
    getBalance(token: string, blockTag?: BlockTag): Promise<U128>;
    getSequenceNumber(blockTag?: BlockTag): Promise<U64>;
    estimateGas(transaction: Deferrable<TransactionRequest>): Promise<U64>;
    sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse>;
    getChainId(): Promise<number>;
    getGasPrice(): Promise<U64>;
    checkTransaction(transaction: Deferrable<TransactionRequest>): Deferrable<TransactionRequest>;
    populateTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionRequest>;
    checkProvider(operation?: string): void;
    static isSigner(value: any): value is Signer;
}
export declare class VoidSigner extends Signer {
    readonly address: string;
    constructor(address: string, provider?: Provider);
    getAddress(): Promise<string>;
    private fail;
    signMessage(message: string): Promise<string>;
    signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string>;
    connect(provider: Provider): VoidSigner;
}
