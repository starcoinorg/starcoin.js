/**
 * VM2 RPC method mappings.
 *
 * VM2 RPC naming follows TWO patterns (verified from starcoin Rust source):
 *   Prefix pattern: state2.*, contract2.*, account2.* (defined in vm2/rpc/api/)
 *   Suffix pattern: chain.method2, txpool.method2 (defined in rpc/api/)
 * Examples:
 * - txpool.submit_hex_transaction2 (suffix)
 * - contract2.dry_run_raw (prefix)
 * - state2.get_resource (prefix)
 * - chain.get_transaction_info2 (suffix, NOT chain2.get_transaction_info)
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
  'state.list_resource': 'state2.list_resource',
  'state.get_resource': 'state2.get_resource',

  // Chain queries (suffix pattern: chain.method2)
  'chain.get_transaction': 'chain.get_transaction2',
  'chain.get_transaction_info': 'chain.get_transaction_info2',
  'chain.get_events_by_txn_hash': 'chain.get_events_by_txn_hash2',
  'chain.get_block_txn_infos': 'chain.get_block_txn_infos2',
  'chain.get_block_info_by_number': 'chain.get_block_info_by_number2',
  'chain.get_transaction_infos': 'chain.get_transaction_infos2',

  // Account
  'account.get_sequence_number': 'account2.get_sequence_number',
};

/**
 * Convert a VM1 RPC method to its VM2 equivalent.
 * Returns the original method if no VM2 mapping exists.
 */
export function vm1MethodToVM2(method: string): string {
  return VM2_RPC_METHODS[method] || method;
}
