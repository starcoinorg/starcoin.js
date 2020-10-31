export interface IJSONRPCNotification {
  jsonrpc: "2.0";
  id?: null | undefined;
  method: string;
  params: unknown[] | unknown;
}

export interface IJSONRPCRequest {
  method: string;
  params: unknown[];
}

export interface IJSONRPCError {
  code: number;
  message: string;
  data: unknown;
}

export interface IJSONRPCResponse {
  jsonrpc: "2.0";
  id?: string | number; // can also be null
  result?: unknown;
  error?: IJSONRPCError;
}

export interface IProvider {
  request(arg: IJSONRPCRequest): Promise<unknown>;
  close(): void;
}
