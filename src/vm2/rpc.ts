/**
 * VM2 RPC method mappings.
 *
 * VM2 uses separate RPC namespaces with "2" suffix:
 * - txpool.submit_transaction2 (instead of txpool.submit_hex_transaction)
 * - contract2.dry_run_raw (instead of contract.dry_run_raw)
 * - state2.get_resource (instead of contract.get_resource)
 * - chain2.get_transaction_info (instead of chain.get_transaction_info)
 */

/**
 * Mapping from VM1 RPC method names to VM2 equivalents.
 */
export const VM2_RPC_METHODS: Record<string, string> = {
  // Transaction submission
  'txpool.submit_hex_transaction': 'txpool.submit_hex_transaction2',
  'txpool.submit_transaction': 'txpool.submit_transaction2',

  // Contract / dry-run
  'contract.dry_run': 'contract2.dry_run',
  'contract.dry_run_raw': 'contract2.dry_run_raw',
  'contract.get_code': 'contract2.get_code',
  'contract.get_resource': 'state2.get_resource',
  'contract.resolve_function': 'contract2.resolve_function',
  'contract.resolve_struct': 'contract2.resolve_struct',
  'contract.call': 'contract2.call',
  'contract.call_v2': 'contract2.call_v2',

  // State
  'state.get_account_state_set': 'state2.get_account_state_set',

  // Chain queries (transaction info uses same method but response has vm_type tag)
  'chain.get_transaction': 'chain.get_transaction',
  'chain.get_transaction_info': 'chain.get_transaction_info',
  'chain.get_events_by_txn_hash': 'chain.get_events_by_txn_hash',
};

/**
 * Convert a VM1 RPC method to its VM2 equivalent.
 * Returns the original method if no VM2 mapping exists.
 */
export function vm1MethodToVM2(method: string): string {
  return VM2_RPC_METHODS[method] || method;
}
