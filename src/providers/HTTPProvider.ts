import {
  RpcClient,
  RpcClientOptions,
  RpcRequest,
  RpcResponse
} from 'jsonrpc-ts';

export type HTTPProviderOptions = {
  headers?: { [key: string]: string }
  timeout?: number
}

declare type ReturnTypeOfMethod<T> = T extends (...args: Array<any>) => any ? ReturnType<T> : any;
declare type ReturnTypeOfMethodIfExists<T, S> = S extends keyof T ? ReturnTypeOfMethod<T[S]> : any;
declare type MethodParams<T> = T extends (...args: infer P) => any ? P[0] : T;
declare type MethodParamsIfExists<T, S> = S extends keyof T ? MethodParams<T[S]> : S;

/**
 * @public
 *
 * HttpProvider should be used to send rpc calls over http
 */
export class HTTPProvider<TMethods = any> {
  debug = false;
  client: RpcClient<TMethods>;

  constructor(public options: RpcClientOptions = { url: 'http://localhost:9850' }) {
    this.client = new RpcClient<TMethods>(options);
  }

  async makeRequest<K extends keyof TMethods, TError = any>(request: RpcRequest<K, MethodParamsIfExists<TMethods, K>>): Promise<RpcResponse<ReturnTypeOfMethodIfExists<TMethods, K>, TError>> {
    const response = await this.client.makeRequest(request);
    if (response.status != 200) {
      if (this.debug) {
        console.error('ERR << ', JSON.stringify(response));

      }
      throw new Error('External error. response code: ' + response.status);
    } else {
      if (this.debug) {
        console.log('RECV << ' + JSON.stringify(response.data));
      }
      return response.data;
    }

  }
}
