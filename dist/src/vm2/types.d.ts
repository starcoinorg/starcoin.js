/**
 * VM type definitions for dual-VM support.
 */
export declare enum VMType {
    VM1 = "vm1",
    VM2 = "vm2"
}
/**
 * RPC response wrapper that includes vm_type tagging.
 * Chain returns responses like: { "vm_type": "vm1", ...fields } or { "vm_type": "vm2", ...fields }
 */
export interface VMTagged<T> {
    vm_type: VMType;
    [key: string]: any;
}
/**
 * Multi-VM signed transaction view as returned by RPC.
 * Tagged enum: either VM1 or VM2 variant.
 */
export interface MultiSignedUserTransactionView {
    VM1?: any;
    VM2?: any;
}
/**
 * TransactionInfoViewEnum as returned by chain.get_transaction_info
 * Tagged with vm_type field.
 */
export interface TransactionInfoViewEnum {
    vm_type: VMType;
    transaction_hash: string;
    block_hash: string;
    state_root_hash: string;
    event_root_hash: string;
    gas_used: string;
    status: any;
}
/**
 * Determine VM type from an RPC response that includes vm_type field.
 */
export declare function getVMType(response: any): VMType;
/**
 * Check if a transaction info response is from VM2.
 */
export declare function isVM2Transaction(response: any): boolean;
