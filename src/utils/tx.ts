import { bytes } from '../lib/runtime/serde';
import * as starcoin_types from '../lib/runtime/starcoin_types';
import { FunctionId, parseFunctionId, TransactionArgument, TypeTag } from '../types';
import { addressToSCS, txnArgToSCS, typeTagToSCS } from '../encoding';


export function encodeTransactionScript(
  code: bytes,
  ty_args: TypeTag[],
  args: TransactionArgument[]
): starcoin_types.TransactionPayloadVariantScript {
  const script = new starcoin_types.Script(
    code,
    ty_args.map((t) => typeTagToSCS(t)),
    args.map((t) => txnArgToSCS(t))
  );
  return new starcoin_types.TransactionPayloadVariantScript(script);
}

export function encodeScriptFunction(functionId: FunctionId,
                                     tyArgs: TypeTag[],
                                     args: TransactionArgument[]): starcoin_types.TransactionPayloadVariantScriptFunction {
  let funcId = parseFunctionId(functionId);
  const scriptFunction = new starcoin_types.ScriptFunction(
    new starcoin_types.ModuleId(addressToSCS(funcId.address), new starcoin_types.Identifier(funcId.module)),
    new starcoin_types.Identifier(funcId.function_name),
    tyArgs.map((t) => typeTagToSCS(t)),
    args.map((t) => txnArgToSCS(t))
  );
  return new starcoin_types.TransactionPayloadVariantScriptFunction(scriptFunction);
}

export function encodePackage(
  moduleAddress: string,
  moduleCodes: bytes[],
  initScriptFunction?: { code: bytes; ty_args: TypeTag[]; args: TransactionArgument[] }
): starcoin_types.TransactionPayloadVariantPackage {
  const modules = moduleCodes.map((m) => new starcoin_types.Module(m));
  let script = null;
  if (initScriptFunction) {
    script = new starcoin_types.Script(
      initScriptFunction.code,
      initScriptFunction.ty_args.map((t) => typeTagToSCS(t)),
      initScriptFunction.args.map((t) => txnArgToSCS(t))
    );
  }
  const packageData = new starcoin_types.Package(
    addressToSCS(moduleAddress),
    modules,
    script
  );
  return new starcoin_types.TransactionPayloadVariantPackage(
    packageData
  );
}
