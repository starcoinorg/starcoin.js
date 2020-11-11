import { bytes } from '../lib/runtime/serde/types';
import { TransactionArgument, TypeTag } from '../types';
export declare function encodeTxnPayload(code: bytes, ty_args: TypeTag[], args: TransactionArgument[]): string;
export declare function encodeDeployModulesPayload(moduleAddress: string, moduleCodes: bytes[], initTxn?: {
    code: bytes;
    ty_args: TypeTag[];
    args: TransactionArgument[];
}): string;
