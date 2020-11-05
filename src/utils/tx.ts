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
  let payload = new starcoin_types.TransactionPayloadVariantScript(script);
  const se = new LcsSerializer();
  payload.serialize(se);
  return toHexString(se.getBytes());
}
