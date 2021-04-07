# Starcoin SDK

starcoin.js is a full featured sdk for developing dapp on [Starcoin](https://github.com/starcoinorg/starcoin) blockchain network.

## Usage

First start a Starcoin node with websocket and http APIs open, for example:

``` shell
./starcoin -n barnard --miner-thread 4 --websocket-apis all --http-apis all
```


``` typescript
let provider = new JsonrpcProvider("http:localhost:9850");

/// Get txn data.
const txnData = await provider.getTransaction(txnHash);
const txnInfoData = await provider.getTransactionInfo(txnHash);

/// Send Transaction

let signer = provider.getSigner();
await signer.unlock(""); // put password into the quotes
// starcoin node should enable account jsonrpc api.
const txnRequest = {
    script: {
      code: '0x1::TransferScripts::peer_to_peer',
      type_args: ['0x1::STC::STC'],
      args: ['0xc13b50bdb12e3fdd03c4e3b05e34926a', 'x"29b6012aee31a216af67c3d05e21a092c13b50bdb12e3fdd03c4e3b05e34926a"', '100000u128'],
    }
};
let txn = await signer.sendTransaction(txnRequest);
// wait for 7 confirmations.
const txnInfo = await txn.wait(7);
console.log(txnInfo);
```

## Develop

```shell
> cd <project>
> npm install
> npm dev
```

Welcome for your PRs! 
