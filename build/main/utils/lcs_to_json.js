"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.type_tag_to_json = exports.struct_tag_to_json = exports.address_to_json = exports.address_from_json = void 0;
const lcs_1 = require("../lib/runtime/lcs");
const starcoin_types = __importStar(require("../lib/runtime/starcoin_types"));
const hex_1 = require("./hex");
function address_from_json(addr) {
    // AccountAddress should be 16 bytes, in hex, it's 16 * 2.
    const bytes = hex_1.fromHexString(addr, 16 * 2);
    return starcoin_types.AccountAddress.deserialize(new lcs_1.LcsDeserializer(bytes));
}
exports.address_from_json = address_from_json;
function address_to_json(addr) {
    return hex_1.toHexString(addr.value.map(([t]) => t));
}
exports.address_to_json = address_to_json;
function struct_tag_to_json(lcs_data) {
    return {
        module: lcs_data.module.value,
        name: lcs_data.name.value,
        type_params: lcs_data.type_params.map((t) => type_tag_to_json(t)),
        address: address_to_json(lcs_data.address),
    };
}
exports.struct_tag_to_json = struct_tag_to_json;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function type_tag_to_json(lcs_data) {
    if (lcs_data instanceof starcoin_types.TypeTagVariantAddress) {
        return 'Address';
    }
    else if (lcs_data instanceof starcoin_types.TypeTagVariantBool) {
        return 'Bool';
    }
    else if (lcs_data instanceof starcoin_types.TypeTagVariantU8) {
        return 'U8';
    }
    else if (lcs_data instanceof starcoin_types.TypeTagVariantU64) {
        return 'U64';
    }
    else if (lcs_data instanceof starcoin_types.TypeTagVariantU128) {
        return 'U128';
    }
    else if (lcs_data instanceof starcoin_types.TypeTagVariantSigner) {
        return 'Signer';
    }
    else if (lcs_data instanceof starcoin_types.TypeTagVariantStruct) {
        return {
            Struct: struct_tag_to_json(lcs_data.value),
        };
    }
    else if (lcs_data instanceof starcoin_types.TypeTagVariantVector) {
        return {
            Vector: type_tag_to_json(lcs_data.value),
        };
    }
}
exports.type_tag_to_json = type_tag_to_json;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGNzX3RvX2pzb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvbGNzX3RvX2pzb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDRDQUFxRDtBQUNyRCw4RUFBZ0U7QUFHaEUsK0JBQW1EO0FBRW5ELFNBQWdCLGlCQUFpQixDQUMvQixJQUFvQjtJQUVwQiwwREFBMEQ7SUFDMUQsTUFBTSxLQUFLLEdBQUcsbUJBQWEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzFDLE9BQU8sY0FBYyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxxQkFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDL0UsQ0FBQztBQU5ELDhDQU1DO0FBRUQsU0FBZ0IsZUFBZSxDQUM3QixJQUFtQztJQUVuQyxPQUFPLGlCQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pELENBQUM7QUFKRCwwQ0FJQztBQUVELFNBQWdCLGtCQUFrQixDQUNoQyxRQUFrQztJQUVsQyxPQUFPO1FBQ0wsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSztRQUM3QixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLO1FBQ3pCLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakUsT0FBTyxFQUFFLGVBQWUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO0tBQzNDLENBQUM7QUFDSixDQUFDO0FBVEQsZ0RBU0M7QUFFRCw2REFBNkQ7QUFDN0QsYUFBYTtBQUNiLFNBQWdCLGdCQUFnQixDQUFDLFFBQWdDO0lBQy9ELElBQUksUUFBUSxZQUFZLGNBQWMsQ0FBQyxxQkFBcUIsRUFBRTtRQUM1RCxPQUFPLFNBQVMsQ0FBQztLQUNsQjtTQUFNLElBQUksUUFBUSxZQUFZLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRTtRQUNoRSxPQUFPLE1BQU0sQ0FBQztLQUNmO1NBQU0sSUFBSSxRQUFRLFlBQVksY0FBYyxDQUFDLGdCQUFnQixFQUFFO1FBQzlELE9BQU8sSUFBSSxDQUFDO0tBQ2I7U0FBTSxJQUFJLFFBQVEsWUFBWSxjQUFjLENBQUMsaUJBQWlCLEVBQUU7UUFDL0QsT0FBTyxLQUFLLENBQUM7S0FDZDtTQUFNLElBQUksUUFBUSxZQUFZLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRTtRQUNoRSxPQUFPLE1BQU0sQ0FBQztLQUNmO1NBQU0sSUFBSSxRQUFRLFlBQVksY0FBYyxDQUFDLG9CQUFvQixFQUFFO1FBQ2xFLE9BQU8sUUFBUSxDQUFDO0tBQ2pCO1NBQU0sSUFBSSxRQUFRLFlBQVksY0FBYyxDQUFDLG9CQUFvQixFQUFFO1FBQ2xFLE9BQU87WUFDTCxNQUFNLEVBQUUsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztTQUMzQyxDQUFDO0tBQ0g7U0FBTSxJQUFJLFFBQVEsWUFBWSxjQUFjLENBQUMsb0JBQW9CLEVBQUU7UUFDbEUsT0FBTztZQUNMLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1NBQ3pDLENBQUM7S0FDSDtBQUNILENBQUM7QUF0QkQsNENBc0JDIn0=