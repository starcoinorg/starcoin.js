import { Logger } from '@ethersproject/logger';

import { version } from '../version';

import { Network, Networkish } from './types';

export { Network, Networkish };
const logger = new Logger(version);
type DefaultProviderFunc = (providers: any, options?: any) => any;
interface Renetworkable extends DefaultProviderFunc {
  renetwork: (network: Network) => DefaultProviderFunc;
}

function isRenetworkable(value: any): value is Renetworkable {
  return value && typeof value.renetwork === 'function';
}

function stcDefaultProvider(network: string | Network): Renetworkable {
  const func = function (providers: any, options?: any): any {
    if (providers.JsonRpcProvider) {
      return new providers.JsonRpcProvider(options.jsonrpc, network);
    }

    return null;
  };

  func.renetwork = function (network: Network) {
    return stcDefaultProvider(network);
  };

  return func;
}

const STANDARD_NETWORKS: { [name: string]: Network } = {
  test: {
    chainId: 255,
    name: 'test',
    _defaultProvider: stcDefaultProvider('test'),
  },
  dev: {
    chainId: 254,
    name: 'dev',
  },
  barnard: {
    chainId: 251,
    name: 'barnard',
  },
  halley: {
    chainId: 253,
    name: 'halley',
  },
  proxima: {
    chainId: 2,
    name: 'proxima',
  },
  main: {
    chainId: 1,
    name: 'main',
  },
};

const APTOS_NETWORKS: { [name: string]: Network } = {
  test: {
    chainId: 2,
    name: 'testnet',
  },
  dev: {
    chainId: 34,
    name: 'devnet',
  },
  main: {
    chainId: 1,
    name: 'mainnet',
  },
};

export function getNetwork(network: Networkish, isAptos = false): Network {
  if (network == null) {
    return null;
  }
  const NETWORKS = isAptos ? APTOS_NETWORKS : STANDARD_NETWORKS
  if (typeof network === 'number') {
    for (const name in NETWORKS) {
      const standard = NETWORKS[name];
      if (standard.chainId == network) {
        return {
          name: standard.name,
          chainId: standard.chainId,
          _defaultProvider: standard._defaultProvider || null,
        };
      }
    }
    return {
      chainId: network,
      name: 'unknown',
    };
  } else if (typeof network === 'string') {
    const standard = NETWORKS[network];
    if (standard == null) {
      return null;
    }
    return {
      name: standard.name,
      chainId: standard.chainId,
      _defaultProvider: standard._defaultProvider || null,
    };
  } else {
    const standard = NETWORKS[network.name];
    if (!standard) {
      if (typeof network.chainId !== 'number') {
        logger.throwArgumentError(
          'invalid network chainId',
          'network',
          network
        );
      }
      return network;
    }

    // Make sure the chainId matches the expected network chainId (or is 0; disable EIP-155)
    if (network.chainId !== standard.chainId) {
      logger.throwArgumentError('network chainId mismatch', 'network', network);
    }

    // @TODO: In the next major version add an attach function to a defaultProvider
    // class and move the _defaultProvider internal to this file (extend Network)
    let defaultProvider: DefaultProviderFunc = network._defaultProvider || null;
    if (defaultProvider == null && standard._defaultProvider) {
      if (isRenetworkable(standard._defaultProvider)) {
        defaultProvider = standard._defaultProvider.renetwork(network);
      } else {
        defaultProvider = standard._defaultProvider;
      }
    }

    // Standard Network (allow overriding the ENS address)
    return {
      name: network.name,
      chainId: standard.chainId,
      _defaultProvider: defaultProvider,
    };
  }
}
