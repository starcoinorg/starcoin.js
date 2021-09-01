---
title: providers
weight: 8
---

## JsonRpcProvider

### Initialize the Provider

```
  // import { providers } from '@starcoin/starcoin';
  const { providers } = require('@starcoin/starcoin');

  // Use your own node such as http://localhost:8500;
  const nodeUrl = 'https://main-seed.starcoin.org';

  // Main: 1, Barnard: 251
  const chainId = 1;

  const provider = new providers.JsonRpcProvider(nodeUrl);
```

### getNetwork()

Return the current network running on the node.

```
  const network = await provider.getNetwork();
```

### 