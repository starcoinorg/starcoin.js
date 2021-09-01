---
title: providers
weight: 8
---

## JsonRpcProvider

`JsonRpcProvider` provides interface to the Starcoin node.

### Initialize the Provider

```js
// import { providers } from '@starcoin/starcoin';
const { providers } = require('@starcoin/starcoin');

// Use your own Starcoin node URL, such as http://localhost:9850;
const nodeUrl = 'https://main-seed.starcoin.org';

// Main: 1, Barnard: 251
const chainId = 1;

const provider = new JsonRpcProvider(nodeUrl)
```

---

### getNetwork(): `Promise<Network>`

Return the current network running on the node.

```js
const network = await provider.getNetwork();
console.log(network);
```

Result: 
```js
{ name: 'main', chainId: 1, _defaultProvider: null }
```

---

### getBlockNumber(): `Promise<number>`

Return the latest block number.

```js
const blockNumber = await provider.getBlockNumber();
console.log(blockNumber);
```

Result:
```js
1701672
```

---

### getBlock(`blockTag: number | string | Promise<number | string>`): `Promise<BlockWithTransactions>`

Return information of a specific block.

```js
const block = await provider.getBlock(1234567);
console.log(block);
```

Result:
```js
{
  header: {
    block_hash: '0x7e593747b8e3936c36a5be82386d5932a2e23c76c3181b6f6b7e70d60bb6f645',
    parent_hash: '0x5bb15016baa9ca7a09da17493b4f99f056627a11f8b9552371de650917c917fc',
    timestamp: 1627627621351,
    number: 1234567,
    author: '0x5555ad74ce032cae631e7c8379688029',
    author_auth_key: null,
    txn_accumulator_root: '0xf4223375387f845f6c9d5927aedaec6445b9b88f1caf272653bc8a9900e10bbd',
    block_accumulator_root: '0x856930ead81c4ac32721585e1f8b64db51d067fbf290c8e495e408054f3b8c20',
    state_root: '0x3dc7670f60669bfb9e9b1622dc70a366114659a3fd0920b0138ea35f778374d1',
    gas_used: 0,
    difficulty: '0x042ad4a2',
    nonce: 843055456,
    body_hash: '0xc01e0329de6d899348a8ef4bd51db56175b3fa0988e57c3dcec8eaf13a164d97',
    chain_id: 1
  },
  transactions: [],
  confirmations: 482125
}
```

---

###  getTransaction(`transactionHash: string | Promise<string>`): `Promise<TransactionResponse>`

Return raw data and payload of a specific transaction.

```js
const txnHash = '0xac1cb95763abebf95837a5c92f748e2f5dbd451c9976e8e4be1d303d2ef73a3e';
const txn = await provider.getTransaction(txnHash);
console.log(txn);
```

Result:
```js
{
  block_hash: '0x1c86d0f8cddd0f1861693bfc90fb30c8a55cc689803291398a07e4dd75f5e24b',
  block_number: '1716480',
  transaction_hash: '0xac1cb95763abebf95837a5c92f748e2f5dbd451c9976e8e4be1d303d2ef73a3e',
  transaction_index: 1,
  block_metadata: null,
  user_transaction: {
    transaction_hash: '0xac1cb95763abebf95837a5c92f748e2f5dbd451c9976e8e4be1d303d2ef73a3e',
    raw_txn: {
      sender: '0x5525e778cc477ebdbe61f330ca1dfc27',
      sequence_number: '2',
      payload: '0x02000000000000000000000000000000010f5472616e73666572536372697074730f706565725f746f5f706565725f76320107000000000000000000000000000000010353544303535443000210c45b469ec2ebe4d23c3cde49bf53fe4110cab203476a0000000000000000000000',
      max_gas_amount: '10000000',
      gas_unit_price: '1',
      gas_token_code: '0x1::STC::STC',
      expiration_timestamp_secs: '1630463615',
      chain_id: 1
    },
    authenticator: { Ed25519: [Object] }
  },
  confirmations: 270,
  wait: [Function (anonymous)]
}
```

---

### getTransactionInfo(`transactionHash: string | Promise<string>`): `Promise<TransactionInfoView>`

Return summary information of a specific transaction.

```js
const txnHash = '0xac1cb95763abebf95837a5c92f748e2f5dbd451c9976e8e4be1d303d2ef73a3e';
const txnInfo = await provider.getTransactionInfo(txnHash);
console.log(txnInfo);
```

Result:
```js
{
  state_root_hash: '0xb0cbfc5c0b24262a56f5640b0ad0c857a91020b55ab20127705bf0fe2d9afed3',
  event_root_hash: '0xc0c830b24e6eb5a6a89bcaa02c4c003a8bf0ed00a186d419e01f8320d8a5a81a',
  gas_used: 124191,
  status: 'Executed',
  txn_events: null,
  block_hash: '0x1c86d0f8cddd0f1861693bfc90fb30c8a55cc689803291398a07e4dd75f5e24b',
  block_number: 1716480,
  transaction_hash: '0xac1cb95763abebf95837a5c92f748e2f5dbd451c9976e8e4be1d303d2ef73a3e',
  transaction_index: 1,
  confirmations: 405
}
```

---

### getEventsOfTransaction(transactionHash: HashValue): `Promise<TransactionEventView[]>`

Return event list of a specific transaction.

```js
const txnHash = '0xac1cb95763abebf95837a5c92f748e2f5dbd451c9976e8e4be1d303d2ef73a3e';
const txnEvents = await provider.getEventsOfTransaction(txnHash);
console.log(txnEvents);
```

Result:
```js
[
  {
    data: '0xcab203476a000000000000000000000000000000000000000000000000000001035354430353544300',
    event_key: '0x00000000000000005525e778cc477ebdbe61f330ca1dfc27',
    event_seq_number: 2,
    block_hash: '0x1c86d0f8cddd0f1861693bfc90fb30c8a55cc689803291398a07e4dd75f5e24b',
    block_number: 1716480,
    transaction_hash: '0xac1cb95763abebf95837a5c92f748e2f5dbd451c9976e8e4be1d303d2ef73a3e',
    transaction_index: 1
  },
  {
    data: '0xcab203476a000000000000000000000000000000000000000000000000000001035354430353544300',
    event_key: '0x0100000000000000c45b469ec2ebe4d23c3cde49bf53fe41',
    event_seq_number: 6,
    block_hash: '0x1c86d0f8cddd0f1861693bfc90fb30c8a55cc689803291398a07e4dd75f5e24b',
    block_number: 1716480,
    transaction_hash: '0xac1cb95763abebf95837a5c92f748e2f5dbd451c9976e8e4be1d303d2ef73a3e',
    transaction_index: 1
  }
]
```

---

### getTransactionEvents(transactionHash: HashValue): `Promise<TransactionEventView[]>`

Return event detail with event keys between 2 block heights.

```js
const eventKey_1 = '0x00000000000000005525e778cc477ebdbe61f330ca1dfc27';
const eventKey_2 = '0x0100000000000000c45b469ec2ebe4d23c3cde49bf53fe41';
const events = await provider.getTransactionEvents({
    event_keys: [eventKey_1, evenytKey_2],
    from_block: 1716480,
    to_block: 1716480
 });
console.log(JSON.stringify(events, undefined, 2));
```

Result:
```js
[
  {
    "data": "0xcab203476a000000000000000000000000000000000000000000000000000001035354430353544300",
    "event_key": "0x0100000000000000c45b469ec2ebe4d23c3cde49bf53fe41",
    "event_seq_number": 6,
    "block_hash": "0x1c86d0f8cddd0f1861693bfc90fb30c8a55cc689803291398a07e4dd75f5e24b",
    "block_number": 1716480,
    "transaction_hash": "0xac1cb95763abebf95837a5c92f748e2f5dbd451c9976e8e4be1d303d2ef73a3e",
    "transaction_index": 1
  },
  {
    "data": "0xcab203476a000000000000000000000000000000000000000000000000000001035354430353544300",
    "event_key": "0x00000000000000005525e778cc477ebdbe61f330ca1dfc27",
    "event_seq_number": 2,
    "block_hash": "0x1c86d0f8cddd0f1861693bfc90fb30c8a55cc689803291398a07e4dd75f5e24b",
    "block_number": 1716480,
    "transaction_hash": "0xac1cb95763abebf95837a5c92f748e2f5dbd451c9976e8e4be1d303d2ef73a3e",
    "transaction_index": 1
  }
]
```

---

### getCode(`moduleId: ModuleId | Promise<ModuleId>, blockTag?: BlockTag | Promise<BlockTag>`): `Promise<string | undefined>` {

Return code of a module.

```js
const module = '0x1::Account';
const code = await provider.getCode(module);
console.log(code);
```

Result:
```js
0xa11ceb0b020000000d01001a021a34034e970304e5035405b904810307ba07eb0c08......
```

---

### getResource(`address: AccountAddress | Promise<AccountAddress>, resource_struct_tag: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>`): `Promise<MoveStruct | undefined>`

Return an account's specific resource.

```js
const account = '0x0000000000000000000000000a550c18';
const resourceType = '0x1::Account::Account';
const resource = await provider.getResource(account, resourceType);
console.log(resource);
```

Result:
```js
{
  authentication_key: '0xf71aa6875d9deb103c4d3b713e784443ce489b11d974896da4f3765de2ffcd20',
  withdrawal_capability: { vec: [ [Object] ] },
  key_rotation_capability: { vec: [ [Object] ] },
  withdraw_events: { counter: 14, guid: '0xa550c18' },
  deposit_events: {
    counter: 2,
    guid: '0x1000000000000000000000000000000000000000a550c18'
  },
  accept_token_events: {
    counter: 1,
    guid: '0x2000000000000000000000000000000000000000a550c18'
  },
  sequence_number: 15
}
```

---


### getResources(` address: AccountAddress | Promise<AccountAddress>, blockTag?: BlockTag | Promise<BlockTag>)`): `Promise<{ [k: string]: MoveStruct } | undefined>` {

Return an account's all resources.

```js
const account = '0x0000000000000000000000000a550c18';
const resources = await provider.getResources(account);
console.log(resources);
```

Result:
```js
{
  '0x00000000000000000000000000000001::Account::Account': {
    authentication_key: '0xf71aa6875d9deb103c4d3b713e784443ce489b11d974896da4f3765de2ffcd20',
    withdrawal_capability: { vec: [Array] },
    key_rotation_capability: { vec: [Array] },
    withdraw_events: { counter: 14, guid: '0xa550c18' },
    deposit_events: {
      counter: 2,
      guid: '0x1000000000000000000000000000000000000000a550c18'
    },
    accept_token_events: {
      counter: 1,
      guid: '0x2000000000000000000000000000000000000000a550c18'
    },
    sequence_number: 15
  },
  '0x00000000000000000000000000000001::Account::Balance<0x00000000000000000000000000000001::STC::STC>': { token: { value: 16836917340515700n } },
  '0x00000000000000000000000000000001::Event::EventHandleGenerator': { counter: 3, addr: '0x0000000000000000000000000a550c18' },
  '0x00000000000000000000000000000001::Treasury::LinearWithdrawCapability<0x00000000000000000000000000000001::STC::STC>': {
    total: 477770400000000000n,
    withdraw: 5779558350000000,
    start_time: 1621311100,
    period: 94608000
  }
}
```

---

### getBalances(`address: AccountAddress | Promise<AccountAddress>, blockTag?: BlockTag | Promise<BlockTag>`): `Promise<{ [k: string]: U128 } | undefined>`

Return an account's all token balances.

```js
const account = '0x0000000000000000000000000a550c18';
const balances = await provider.getBalances(account);
console.log(balances);
```

Result:
```js
{ '0x00000000000000000000000000000001::STC::STC': 16836917340515700n }
```

---

### getBalance(`address: AccountAddress | Promise<AccountAddress>, token?: string, blockTag?: BlockTag | Promise<BlockTag>`): `Promise<U128 | undefined>`

Return an account's balance of a specific token, default token is `0x1::STC::STC`.

```js
const account = '0x0000000000000000000000000a550c18';
const tokenType = '0x1::STC::STC';
const balance = await provider.getBalance(account, tokenType);
console.log(balance);
```

Result:
```js
16836917340515700n
```

---

### getSequenceNumber(`address: AccountAddress | Promise<AccountAddress>, blockTag?: BlockTag | Promise<BlockTag>`): `Promise<U64 | undefined>`

Return an account's sequence number.

```js
const account = '0x0000000000000000000000000a550c18';
const seqNumber = await provider.getSequenceNumber(account);
console.log(seqNumber);
```

Result:
```js
15
```