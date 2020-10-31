# starcoin-typescript-sdk

Starcoin chain node rpc client implemented in typescript.

## Usage

``` typescript
const httpProvider = new HttpProvider();
// or 
const websocketProvider = new WebsocketProvider();


// then call starcoin rpc methods.

let block = await starcoin.chain.get_block_by_number(httpProvider, 1);
``` 

## Types

See ./src/types.ts for details. 
