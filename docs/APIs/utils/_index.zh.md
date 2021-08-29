---
title: utils
weight: 9
---

### utils.tx.signRawUserTransaction(senderPrivateKey,rawUserTransaction) => `Promise<string>`

用私钥签名一个RawUserTransaction, 返回transaction的hash, 提供给Restful API `txpool.submit_hex_transaction`使用

| Param | Type | Desc |
|-------|------|------|
|senderPrivateKey| HexString | |
|rawUserTransaction| starcoin_types.RawUserTransaction | |

### utils.tx.encodeScriptFunctionByResolve(functionId, typeArgs, args, nodeUrl) => `Promise<starcoin_types.TransactionPayloadVariantScriptFunction>`

utils.tx.encodeScriptFunction的增强版本: 不再需要客户端自己转换args每一个参数的js数据类型到bsc数据类型. 
encodeScriptFunctionByResolve 会在内部先去查询 argsType, 再调用encodeScriptFunction生成一个TransactionPayload, 用于生成RawUserTransaction. 

| Param | Type| Desc |
|-------|-----|------|
|functionId| FunctionId | |
|typeArgs| string[] | |
|args| any[] | |
|nodeUrl| string | |