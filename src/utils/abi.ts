import { LcsDeserializer } from "../lib/runtime/lcs";
import * as starcoin_types from "../lib/runtime/starcoin_types";
import { ScriptABI } from "../types";
import * as lcs_to_json from "../encoding";

export function decodeABI(bytes: Uint8Array): ScriptABI {
  const de = new LcsDeserializer(bytes);
  const abi = starcoin_types.ScriptABI.deserialize(de);
  return {
    args: abi.args.map((a) => ({
      name: a.name,
      type_tag: lcs_to_json.typeTagFromSCS(a.type_tag),
    })),
    code: abi.code,
    doc: abi.doc,
    name: abi.name,
    ty_args: abi.ty_args.map((t) => ({
      name: t.name,
    })),
  };
}
