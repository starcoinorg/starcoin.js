/**
 * VM2 support for Starcoin.
 *
 * Key insight: VM2's EntryFunction is BCS-compatible with VM1's ScriptFunction
 * (same variant index 2, same field layout: module, function, ty_args, args).
 * So the existing starcoin_types BCS classes can be reused for VM2 transaction
 * building and signing.
 *
 * The main differences are:
 * 1. RPC method names use "2" suffix (e.g. txpool.submit_transaction2)
 * 2. RPC responses include a "vm_type" field ("vm1" or "vm2")
 * 3. Conceptual naming: ScriptFunction → EntryFunction
 */

export { VMType, isVM2Transaction, getVMType } from './types';
export {
  encodeEntryFunction,
  encodeEntryFunctionByResolve,
  generateRawUserTransactionV2,
  signRawUserTransactionV2,
  getSignedUserTransactionV2,
} from './tx';
export {
  VM2_RPC_METHODS,
  vm1MethodToVM2,
} from './rpc';
