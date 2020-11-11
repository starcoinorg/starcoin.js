import { LcsSerializer } from '../lib/runtime/lcs';
import { bytes } from '../lib/runtime/serde/types';
import * as starcoin_types from '../lib/runtime/starcoin_types';
import { TransactionArgument, TypeTag } from '../types';

import { toHexString } from './hex';
import { txnArgument_from_json, typeTag_from_json } from './lcs_to_json';

export function encode_tx_payload(
  code: bytes,
  ty_args: TypeTag[],
  args: TransactionArgument[]
): string {
  const script = new starcoin_types.Script(
    code,
    ty_args.map((t) => typeTag_from_json(t)),
    args.map((t) => txnArgument_from_json(t))
  );
  const payload = new starcoin_types.TransactionPayloadVariantScript(script);
  const se = new LcsSerializer();
  payload.serialize(se);
  return toHexString(se.getBytes());
}
