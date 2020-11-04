import { LcsSerializer } from '../lib/runtime/lcs';
import { bytes } from '../lib/runtime/serde/types';
import * as starcoin_types from '../lib/runtime/starcoin_types';

import { toHexString } from './hex';

export function encode_tx_payload(
  code: bytes,
  ty_args: starcoin_types.TypeTag[],
  args: starcoin_types.TransactionArgument[]
): string {
  const script = new starcoin_types.Script(code, ty_args, args);
  const se = new LcsSerializer();
  script.serialize(se);
  return toHexString(se.getBytes());
}
