import * as starcoin_types from '../lib/runtime/starcoin_types';
import { AccountAddress, StructTag, TypeTag } from '../types';
export declare function address_from_json(addr: AccountAddress): starcoin_types.AccountAddress;
export declare function address_to_json(addr: starcoin_types.AccountAddress): AccountAddress;
export declare function struct_tag_to_json(lcs_data: starcoin_types.StructTag): StructTag;
export declare function type_tag_to_json(lcs_data: starcoin_types.TypeTag): TypeTag;
