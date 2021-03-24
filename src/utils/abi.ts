import { BcsDeserializer } from "../lib/runtime/bcs";
import * as starcoin_types from "../lib/runtime/starcoin_types";
import { ScriptABI } from "../types";
import * as bcs_to_json from "../encoding";

export function decodeTransactionScriptABI(bytes: Uint8Array): ScriptABI {
  const de = new BcsDeserializer(bytes);
  const abi = starcoin_types.TransactionScriptABI.deserialize(de);
  return {
    args: abi.args.map((a) => ({
      name: a.name,
      type_tag: bcs_to_json.typeTagFromSCS(a.type_tag),
    })),
    code: abi.code,
    doc: abi.doc,
    name: abi.name,
    ty_args: abi.ty_args.map((t) => ({
      name: t.name,
    })),
  };
}
