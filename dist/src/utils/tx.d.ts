import { bytes } from '../lib/runtime/serde';
import * as starcoin_types from '../lib/runtime/starcoin_types';
import { FunctionId, HexString, TypeTag, U64, U8 } from '../types';
export declare function encodeTransactionScript(code: bytes, ty_args: TypeTag[], args: HexString[]): starcoin_types.TransactionPayloadVariantScript;
export declare function encodeStarcoinTypesScriptFunction(functionId: FunctionId, tyArgs: TypeTag[], args: bytes[]): starcoin_types.ScriptFunction;
export declare function encodeScriptFunction(functionId: FunctionId, tyArgs: TypeTag[], args: bytes[]): starcoin_types.TransactionPayloadVariantScriptFunction;
export declare function encodeStarcoinTypesPackage(moduleAddress: string, moduleCodes: HexString[], initScriptFunction?: {
    functionId: FunctionId;
    tyArgs: TypeTag[];
    args: bytes[];
}): starcoin_types.Package;
export declare function encodePackage(moduleAddress: string, moduleCodes: HexString[], initScriptFunction?: {
    functionId: FunctionId;
    tyArgs: TypeTag[];
    args: bytes[];
}): starcoin_types.TransactionPayloadVariantPackage;
export declare function generateRawUserTransaction(senderAddress: HexString, payload: starcoin_types.TransactionPayload, maxGasAmount: U64, gasUnitPrice: U64, senderSequenceNumber: U64, expirationTimestampSecs: U64, chainId: U8): starcoin_types.RawUserTransaction;
export declare function getSignatureHex(rawUserTransaction: starcoin_types.RawUserTransaction, senderPrivateKey: HexString): Promise<string>;
export declare function signTxn(senderPublicKey: string, signatureHex: string, rawUserTransaction: starcoin_types.RawUserTransaction): starcoin_types.SignedUserTransaction;
export declare function getSignedUserTransaction(senderPrivateKey: HexString, rawUserTransaction: starcoin_types.RawUserTransaction): Promise<starcoin_types.SignedUserTransaction>;
export declare function signRawUserTransaction(senderPrivateKey: HexString, rawUserTransaction: starcoin_types.RawUserTransaction): Promise<string>;
/**
 * while generate ScriptFunction, we need to encode a string array:
[
  'address1::module1::name1<address2::module2::name2>'
]

into a TypeTag array:

[
  {
    "Struct": {
      "address": "address1",
      "module": "module1",
      "name": "name1",
      "type_params": [
        {
          "Struct": {
            "address": "address2",
            "module": "module2",
            "name": "name2",
            "type_params": []
          }
        }
      ]
    }
  }
]
 */
export declare function encodeStructTypeTags(typeArgsString: string[]): TypeTag[];
export declare function encodeScriptFunctionArgs(argsType: any[], args: any[]): bytes[];
export declare function encodeScriptFunctionByResolve(functionId: FunctionId, typeArgs: string[], args: any[], nodeUrl: string): Promise<starcoin_types.TransactionPayloadVariantScriptFunction>;
