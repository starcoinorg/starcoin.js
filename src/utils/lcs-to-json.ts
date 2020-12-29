import { arrayify, BytesLike } from '@ethersproject/bytes';
import { LcsDeserializer } from '../lib/runtime/lcs';
import * as starcoin_types from '../lib/runtime/starcoin_types';
import {
  AccountAddress,
  StructTag,
  TransactionArgument,
  TypeTag
} from '../types';
import { fromHexString, toHexString } from './hex';

// export function parseTxnPayload(payload: BytesLike): TransactionPayload {
//   const bytes = arrayify(payload);
//   const de = new LcsDeserializer(bytes);
//   const lcsTxnPayload = starcoin_types.TransactionPayload.deserialize(de);
//   if (lcsTxnPayload instanceof starcoin_types.TransactionPayloadVariantScript) {
//     const script = lcsTxnPayload.value;
//     return {
//       Script: {
//         code: script.code,
//         ty_args: script.ty_args.map(t => type_tag_to_json(t)),
//         args: [],
//       }
//     };
//   } else if (lcsTxnPayload instanceof starcoin_types.TransactionPayloadVariantPackage) {
//     const packagePayload = lcsTxnPayload.value;
//     return {
//       Package: {
//         package_address: packagePayload.package_address,
//         modules: packagePayload.modules,
//         init_script: packagePayload.init_script,
//       }
//     };
//   }
// }

export function address_from_json(
  addr: AccountAddress
): starcoin_types.AccountAddress {
  // AccountAddress should be 16 bytes, in hex, it's 16 * 2.
  const bytes = fromHexString(addr, 16 * 2);
  return starcoin_types.AccountAddress.deserialize(new LcsDeserializer(bytes));
}

export function decodeAddress(
  addr: starcoin_types.AccountAddress
): AccountAddress {
  return toHexString(addr.value.map(([t]) => t));
}

export function typeTag_from_json(ty: TypeTag): starcoin_types.TypeTag {
  if (ty === 'Bool') {
    return new starcoin_types.TypeTagVariantBool();
  } else if (ty === 'U8') {
    return new starcoin_types.TypeTagVariantU8();
  } else if (ty === 'U128') {
    return new starcoin_types.TypeTagVariantU128();
  } else if (ty === 'U64') {
    return new starcoin_types.TypeTagVariantU64();
  } else if (ty === 'Address') {
    return new starcoin_types.TypeTagVariantAddress();
  } else if (ty === 'Signer') {
    return new starcoin_types.TypeTagVariantSigner();
  } else if ('Vector' in ty) {
    return new starcoin_types.TypeTagVariantVector(
      typeTag_from_json(ty.Vector)
    );
  } else if ('Struct' in ty) {
    return new starcoin_types.TypeTagVariantStruct(
      structTag_from_json(ty.Struct)
    );
  } else {
    // @ts-ignore
    throw new Error(`invalid type tag: ${ty.toString()}`);
  }
}

export function structTag_from_json(data: StructTag): starcoin_types.StructTag {
  return new starcoin_types.StructTag(
    address_from_json(data.address),
    new starcoin_types.Identifier(data.module),
    new starcoin_types.Identifier(data.name),
    data.type_params ?  data.type_params.map((t) => typeTag_from_json(t)) : []
  );
}

export function struct_tag_to_json(
  lcs_data: starcoin_types.StructTag
): StructTag {
  return {
    module: lcs_data.module.value,
    name: lcs_data.name.value,
    type_params: lcs_data.type_params.map((t) => type_tag_to_json(t)),
    address: decodeAddress(lcs_data.address),
  };
}

// @ts-ignore
export function type_tag_to_json(lcs_data: starcoin_types.TypeTag): TypeTag {
  if (lcs_data instanceof starcoin_types.TypeTagVariantAddress) {
    return 'Address';
  } else if (lcs_data instanceof starcoin_types.TypeTagVariantBool) {
    return 'Bool';
  } else if (lcs_data instanceof starcoin_types.TypeTagVariantU8) {
    return 'U8';
  } else if (lcs_data instanceof starcoin_types.TypeTagVariantU64) {
    return 'U64';
  } else if (lcs_data instanceof starcoin_types.TypeTagVariantU128) {
    return 'U128';
  } else if (lcs_data instanceof starcoin_types.TypeTagVariantSigner) {
    return 'Signer';
  } else if (lcs_data instanceof starcoin_types.TypeTagVariantStruct) {
    return {
      Struct: struct_tag_to_json(lcs_data.value),
    };
  } else if (lcs_data instanceof starcoin_types.TypeTagVariantVector) {
    return {
      Vector: type_tag_to_json(lcs_data.value),
    };
  }
}

export function txnArgument_from_json(
  data: TransactionArgument
): starcoin_types.TransactionArgument {
  if ('U8' in data) {
    return new starcoin_types.TransactionArgumentVariantU8(data.U8);
  } else if ('U64' in data) {
    return new starcoin_types.TransactionArgumentVariantU64(BigInt(data.U64));
  } else if ('U128' in data) {
    return new starcoin_types.TransactionArgumentVariantU128(BigInt(data.U128));
  } else if ('Address' in data) {
    return new starcoin_types.TransactionArgumentVariantAddress(
      address_from_json(data.Address)
    );
  } else if ('U8Vector' in data) {
    return new starcoin_types.TransactionArgumentVariantU8Vector(data.U8Vector);
  } else if ('Bool' in data) {
    return new starcoin_types.TransactionArgumentVariantBool(data.Bool);
  } else {
    // @ts-ignore
    throw new Error('invalid txn argument' + data.toString());
  }
}
