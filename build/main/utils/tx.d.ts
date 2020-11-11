import { bytes } from '../lib/runtime/serde/types';
import { TransactionArgument, TypeTag } from '../types';
export declare function encode_tx_payload(code: bytes, ty_args: TypeTag[], args: TransactionArgument[]): string;
