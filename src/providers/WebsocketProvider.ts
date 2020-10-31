import Client, {
  RequestManager,
  WebSocketTransport
} from '@open-rpc/client-js';

import { IJSONRPCRequest, IProvider } from '../IProvider';

export class WebsocketProvider implements IProvider {
  public uri: string;
  public client: Client;

  constructor(uri = 'http://127.0.0.1:9870') {
    this.uri = uri;
    const transport = new WebSocketTransport(uri);
    this.client = new Client(new RequestManager([transport]));
  }

  close(): void {
    this.client.close();
  }

  async request(arg: IJSONRPCRequest): Promise<unknown> {
    return this.client.request(arg);
  }

}
