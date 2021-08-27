import { defineReadOnly } from "@ethersproject/properties";
import { Logger } from "@ethersproject/logger";
import { JsonRpcProvider } from './jsonrpc-provider';
import { Networkish } from '../networks';
import { version } from '../version';

const logger = new Logger(version);

// Exported Types
export type ExternalProvider = {
    isStarMask?: boolean;
    host?: string;
    path?: string;
    sendAsync?: (request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void) => void
    send?: (request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void) => void
    request?: (request: { method: string, params?: Array<any> }) => Promise<any>
}

let NextId = 1;

export type JsonRpcFetchFunc = (method: string, params?: Array<any>) => Promise<any>;

type Web3LegacySend = (request: any, callback: (error: Error, response: any) => void) => void;

function buildWeb3LegacyFetcher(provider: ExternalProvider, sendFunc: Web3LegacySend): JsonRpcFetchFunc {
    return function (method: string, params: Array<any>): Promise<any> {

        NextId += 1;
        const request = {
            method,
            params,
            id: (NextId),
            jsonrpc: "2.0"
        };

        return new Promise((resolve, reject) => {
            sendFunc(request, function (error, result) {
                if (error) {
                    return reject(error);
                }

                if (result.error) {
                    const error = new Error(result.error.message);
                    (<any>error).code = result.error.code;
                    (<any>error).data = result.error.data;
                    return reject(error);
                }

                resolve(result.result);
            });
        });
    }
}

export class Web3Provider extends JsonRpcProvider {
    readonly provider: ExternalProvider;

    readonly jsonRpcFetchFunc: JsonRpcFetchFunc;

    constructor(provider: ExternalProvider | JsonRpcFetchFunc, network?: Networkish) {
        logger.checkNew(new.target, Web3Provider);

        if (provider === undefined) {
            logger.throwArgumentError("missing provider", "provider", provider);
        }

        let path: string;
        let jsonRpcFetchFunc: JsonRpcFetchFunc;
        let subprovider: ExternalProvider;

        if (typeof (provider) === "function") {
            path = "unknown:";
            jsonRpcFetchFunc = provider;

        } else {
            path = provider.host || provider.path || "";
            if (!path && provider.isStarMask) {
                path = "starmask";
            }

            subprovider = provider;

            if (provider.sendAsync) {
                jsonRpcFetchFunc = buildWeb3LegacyFetcher(provider, provider.sendAsync.bind(provider));
            } else if (provider.send) {
                jsonRpcFetchFunc = buildWeb3LegacyFetcher(provider, provider.send.bind(provider));
            } else {
                logger.throwArgumentError("unsupported provider", "provider", provider);
            }

            if (!path) { path = "unknown:"; }
        }

        super(path, network);

        defineReadOnly(this, "jsonRpcFetchFunc", jsonRpcFetchFunc);
        defineReadOnly(this, "provider", subprovider);
    }

    send(method: string, params: Array<any>): Promise<any> {
        return this.jsonRpcFetchFunc(method, params);
    }
}
