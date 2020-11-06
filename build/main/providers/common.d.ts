export declare type Callback = (err: Error | null, message?: any) => void;
export declare type RPCMessage = {
    jsonrpc: '2.0';
    id: number;
    method: string;
    params: any[] | {
        [key: string]: any;
    };
};
export declare function toRPC(message: RPCMessage): RPCMessage;
