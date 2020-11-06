import { bytes } from '../lib/runtime/serde/types';
import * as starcoin_types from '../lib/runtime/starcoin_types';
export declare function encode_tx_payload(code: bytes, ty_args: starcoin_types.TypeTag[], args: starcoin_types.TransactionArgument[]): string;
