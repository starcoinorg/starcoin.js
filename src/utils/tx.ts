import { BcsSerializer } from '../lib/runtime/bcs';
import { bytes } from '../lib/runtime/serde';
import * as starcoin_types from '../lib/runtime/starcoin_types';
import { TransactionArgument, TypeTag } from "../types";

import { toHexString } from "./hex";
import {
  addressToSCS,
  txnArgToSCS,
  typeTagToSCS,
} from "../encoding";

export function encodeTxnPayload(
  code: bytes,
  ty_args: TypeTag[],
  args: TransactionArgument[]
): string {
  const script = new starcoin_types.Script(
    code,
    ty_args.map((t) => typeTagToSCS(t)),
    args.map((t) => txnArgToSCS(t))
  );
  const payload = new starcoin_types.TransactionPayloadVariantScript(script);
  const se = new BcsSerializer();
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
      initTxn.ty_args.map((t) => typeTagToSCS(t)),
      initTxn.args.map((t) => txnArgToSCS(t))
    );
  }
  const packageData = new starcoin_types.Package(
    addressToSCS(moduleAddress),
    modules,
    script
  );
  const payload = new starcoin_types.TransactionPayloadVariantPackage(
    packageData
  );
  const se = new BcsSerializer();
  payload.serialize(se);
  return toHexString(se.getBytes());
}
