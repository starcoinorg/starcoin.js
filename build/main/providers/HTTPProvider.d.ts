import { Client } from '@open-rpc/client-js';
import { IJSONRPCRequest, IProvider } from '../IProvider';
/**
 * @public
 *
 * HttpProvider should be used to send rpc calls over http
 */
export declare class HTTPProvider implements IProvider {
    client: Client;
    constructor(uri?: string, headers?: Record<string, string>);
    close(): void;
    request(args: IJSONRPCRequest): Promise<unknown>;
}
