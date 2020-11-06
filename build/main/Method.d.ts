import { IJSONRPCRequest, IProvider } from './IProvider';
/**
 * @public
 */
export declare class Method<T extends any[] = [], V = any> {
    callName: string;
    params: number;
    inputFormatter?: ((...args: any[]) => any)[];
    outputFormatter?: (something: any) => V;
    constructor(options: {
        callName: string;
        params: number;
        inputFormatter?: any[];
        outputFormatter?: (val: any) => V;
    });
    /**
     * Should be called to check if the number of arguments is correct
     *
     * @param arguments - The list of arguments
     */
    validateArgs(args: any[]): void;
    /**
     * Should be called to format input args of method
     *
     * @param args - The array of arguments
     */
    formatInput(args: T): any[];
    /**
     * Should be called to format output(result) of method
     *
     * @param result - The result to be formatted
     */
    formatOutput(result: any): V;
    /**
     * Should create payload from given input args
     *
     * @param args - The given input arguments
     */
    toPayload(args: T): IJSONRPCRequest;
    execute(provider: IProvider, ...args: T): Promise<V>;
}
