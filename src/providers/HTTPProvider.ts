import { Client, HTTPTransport, RequestManager } from '@open-rpc/client-js';

import { IJSONRPCRequest, IProvider } from '../IProvider';

/**
 * @public
 *
 * HttpProvider should be used to send rpc calls over http
 */
export class HTTPProvider implements IProvider{
  client: Client;

  constructor(uri = 'http://127.0.0.1:9850', headers?: Record<string, string>) {
    const transport = new HTTPTransport(uri, headers);
    this.client = new Client(new RequestManager([transport]));
  }

  close(): void {
    this.client.close();
  }

  async request(args: IJSONRPCRequest): Promise<unknown> {
    return await this.client.request(args);
  }
}
