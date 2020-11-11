import { LcsSerializer } from '../lib/runtime/lcs';
import { bytes } from '../lib/runtime/serde/types';
import * as starcoin_types from '../lib/runtime/starcoin_types';
import { TransactionArgument, TypeTag } from '../types';

import { toHexString } from './hex';
import {
  address_from_json,
  txnArgument_from_json,
  typeTag_from_json,
} from './lcs_to_json';

export function encodeTxnPayload(
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

export function encodeDeployModulesPayload(
  moduleAddress: string,
  moduleCodes: bytes[],
  initTxn?: { code: bytes; ty_args: TypeTag[]; args: TransactionArgument[] }
): string {
  const modules = moduleCodes.map((m) => new starcoin_types.Module(m));
  let script = null;
  if (initTxn) {
    script = new starcoin_types.Script(
      initTxn.code,
      initTxn.ty_args.map((t) => typeTag_from_json(t)),
      initTxn.args.map((t) => txnArgument_from_json(t))
    );
  }
  const packageData = new starcoin_types.Package(
    address_from_json(moduleAddress),
    modules,
    script
  );
  const payload = new starcoin_types.TransactionPayloadVariantPackage(
    packageData
  );
  const se = new LcsSerializer();
  payload.serialize(se);
  return toHexString(se.getBytes());
}
