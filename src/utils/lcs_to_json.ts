import { LcsDeserializer } from '../lib/runtime/lcs';
import * as starcoin_types from '../lib/runtime/starcoin_types';
import { AccountAddress, StructTag, TypeTag } from '../types';

import { fromHexString, toHexString } from './hex';

export function address_from_json(
  addr: AccountAddress
): starcoin_types.AccountAddress {
  // AccountAddress should be 16 bytes, in hex, it's 16 * 2.
  const bytes = fromHexString(addr, 16 * 2);
  return starcoin_types.AccountAddress.deserialize(new LcsDeserializer(bytes));
}

export function address_to_json(
  addr: starcoin_types.AccountAddress
): AccountAddress {
  return toHexString(addr.value.map(([t]) => t));
}

export function struct_tag_to_json(
  lcs_data: starcoin_types.StructTag
): StructTag {
  return {
    module: lcs_data.module.value,
    name: lcs_data.name.value,
    type_params: lcs_data.type_params.map((t) => type_tag_to_json(t)),
    address: address_to_json(lcs_data.address),
  };
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
