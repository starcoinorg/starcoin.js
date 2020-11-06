import Client from '@open-rpc/client-js';
import { IJSONRPCRequest, IProvider } from '../IProvider';
export declare class WebsocketProvider implements IProvider {
    uri: string;
    client: Client;
    constructor(uri?: string);
    close(): void;
    request(arg: IJSONRPCRequest): Promise<unknown>;
}
