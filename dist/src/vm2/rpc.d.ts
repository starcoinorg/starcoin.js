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
export declare const VM2_RPC_METHODS: Record<string, string>;
/**
 * Convert a VM1 RPC method to its VM2 equivalent.
 * Returns the original method if no VM2 mapping exists.
 */
export declare function vm1MethodToVM2(method: string): string;
