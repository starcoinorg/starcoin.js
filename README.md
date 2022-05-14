# Starcoin SDK

starcoin.js is a full featured sdk for developing dapp on [Starcoin](https://github.com/starcoinorg/starcoin) blockchain network.

[Type Architecture Diagram](./src/lib/README.md)

## Docs

[Starcoin Javascript SDK](https://starcoin.org/zh/developer/sdk/javascript/)

## Usage

First, start a Starcoin node with websocket and http APIs opened.

```shell
./starcoin -n dev --miner-thread 4 --websocket-apis all --http-apis all
```

or

```shell
./starcoin -n barnard --miner-thread 4 --websocket-apis all --http-apis all
```

```typescript
let provider = new JsonRpcProvider('http://localhost:9850');

/// Get txn data.
const txnData = await provider.getTransaction(txnHash);
const txnInfoData = await provider.getTransactionInfo(txnHash);

/// Send Transaction

let signer = provider.getSigner();
await signer.unlock(''); // put password into the quotes
// starcoin node should enable account jsonrpc api.
const txnRequest = {
  script: {
    code: '0x1::TransferScripts::peer_to_peer',
    type_args: ['0x1::STC::STC'],
    args: [
      '0xc13b50bdb12e3fdd03c4e3b05e34926a',
      'x"29b6012aee31a216af67c3d05e21a092c13b50bdb12e3fdd03c4e3b05e34926a"',
      '100000u128',
    ],
  },
};
let txn = await signer.sendTransaction(txnRequest);
// wait for 7 confirmations.
const txnInfo = await txn.wait(7);
console.log(txnInfo);
```

## Utils

### Decode Events

TransactionEvents returned from node are encoded in BCS format.
client sdk should decode the data to see the detailed information.

```js
import encoding from 'starcoin';
import 'starcoin';

let provider = new JsonRpcProvider('http://localhost:9850');

// Get txn info.
const txnEvents = await provider.getEventsOfTransaction(txnHash);
// get a txn event.
const txnEvent = txnEvents.pop();
// then decode with pre-determined event type in onchain_event_types.
console.log(encoding.bcsDecode(DepositEvent, txnEvent.data).toJS());
```

You can also see the spec in `src/index.spec.ts`.

## Develop

```shell
> cd <project>
> yarn
> yarn dev
```

## Publish to [npm](https://www.npmjs.com/package/@starcoin/starcoin)

1. change version in `package.json`

2. `npm run build`

3. `npm login`

4. `npm config set registry https://registry.npmjs.org/` # use `npm config ls` to confirm

5. `npm publish --access public --tag latest --dry-run` # test locally before actually publishing to the registry

6. `npm publish --access public --tag latest`

## FAQ

### `Uncaught TypeError: Cannot convert a BigInt value to a number` in create-react-app

If you are using this sdk in your dapp build up by create-react-app, and sdk version >= 2.0.0,
you will get following error in production(`yarn build`), which is not happen in developement(`yarn start`):

`Uncaught TypeError: Cannot convert a BigInt value to a number`

1. Root cause:

The plugin @babel/plugin-transform-exponentiation-operator in create-react-app will convert

```
let x = 10 ** 2;
```

into

```
let x = Math.pow(10, 2);`
```

This operation has no effect on Number, but for the BigInt type of ECMAScript 2020, this conversion is a fatal error. Math.pow() only supports Number type parameters.

and the `browserslist` section in create-react-app's `package.json` is:

```
  "browserslist": {
    "production": [
       ">0.2%",
       "not dead",
       "not op_mini all"
    ],
    "development": [
       "last 1 chrome version",
       "last 1 firefox version",
       "last 1 safari version"
    ]
  },
```

the production taget is too old to support ECMAScript 2020.

2. Solution:

1) change the `browserslist` section in your dapp's `package.json` as following:

```
  "browserslist": {
    "production": [
      "chrome >= 67",
      "edge >= 79",
      "firefox >= 68",
      "opera >= 54",
      "safari >= 14"
    ],
    "development": [
      "chrome >= 67",
      "edge >= 79",
      "firefox >= 68",
      "opera >= 54",
      "safari >= 14"
    ]
  },
```

2. rm -f node_modules/.cache

3. yarn build

Welcome for your PRs!
