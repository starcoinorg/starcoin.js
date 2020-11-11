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
exports.txnArgument_from_json = exports.type_tag_to_json = exports.struct_tag_to_json = exports.structTag_from_json = exports.typeTag_from_json = exports.address_to_json = exports.address_from_json = void 0;
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
function typeTag_from_json(ty) {
    if (ty === 'Bool') {
        return new starcoin_types.TypeTagVariantBool();
    }
    else if (ty === 'U8') {
        return new starcoin_types.TypeTagVariantU8();
    }
    else if (ty === 'U128') {
        return new starcoin_types.TypeTagVariantU128();
    }
    else if (ty === 'U64') {
        return new starcoin_types.TypeTagVariantU64();
    }
    else if (ty === 'Address') {
        return new starcoin_types.TypeTagVariantAddress();
    }
    else if (ty === 'Signer') {
        return new starcoin_types.TypeTagVariantSigner();
    }
    else if ('Vector' in ty) {
        return new starcoin_types.TypeTagVariantVector(typeTag_from_json(ty.Vector));
    }
    else if ('Struct' in ty) {
        return new starcoin_types.TypeTagVariantStruct(structTag_from_json(ty.Struct));
    }
    else {
        // @ts-ignore
        throw new Error(`invalid type tag: ${ty.toString()}`);
    }
}
exports.typeTag_from_json = typeTag_from_json;
function structTag_from_json(data) {
    return new starcoin_types.StructTag(address_from_json(data.address), new starcoin_types.Identifier(data.module), new starcoin_types.Identifier(data.name), data.type_params.map((t) => typeTag_from_json(t)));
}
exports.structTag_from_json = structTag_from_json;
function struct_tag_to_json(lcs_data) {
    return {
        module: lcs_data.module.value,
        name: lcs_data.name.value,
        type_params: lcs_data.type_params.map((t) => type_tag_to_json(t)),
        address: address_to_json(lcs_data.address),
    };
}
exports.struct_tag_to_json = struct_tag_to_json;
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
function txnArgument_from_json(data) {
    if ('U8' in data) {
        return new starcoin_types.TransactionArgumentVariantU8(data.U8);
    }
    else if ('U64' in data) {
        return new starcoin_types.TransactionArgumentVariantU64(BigInt(data.U64));
    }
    else if ('U128' in data) {
        return new starcoin_types.TransactionArgumentVariantU128(BigInt(data.U128));
    }
    else if ('Address' in data) {
        return new starcoin_types.TransactionArgumentVariantAddress(address_from_json(data.Address));
    }
    else if ('U8Vector' in data) {
        return new starcoin_types.TransactionArgumentVariantU8Vector(data.U8Vector);
    }
    else if ('Bool' in data) {
        return new starcoin_types.TransactionArgumentVariantBool(data.Bool);
    }
    else {
        // @ts-ignore
        throw new Error('invalid txn argument' + data.toString());
    }
}
exports.txnArgument_from_json = txnArgument_from_json;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGNzX3RvX2pzb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvbGNzX3RvX2pzb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDRDQUFxRDtBQUNyRCw4RUFBZ0U7QUFRaEUsK0JBQW1EO0FBRW5ELFNBQWdCLGlCQUFpQixDQUMvQixJQUFvQjtJQUVwQiwwREFBMEQ7SUFDMUQsTUFBTSxLQUFLLEdBQUcsbUJBQWEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzFDLE9BQU8sY0FBYyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxxQkFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDL0UsQ0FBQztBQU5ELDhDQU1DO0FBRUQsU0FBZ0IsZUFBZSxDQUM3QixJQUFtQztJQUVuQyxPQUFPLGlCQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pELENBQUM7QUFKRCwwQ0FJQztBQUVELFNBQWdCLGlCQUFpQixDQUFDLEVBQVc7SUFDM0MsSUFBSSxFQUFFLEtBQUssTUFBTSxFQUFFO1FBQ2pCLE9BQU8sSUFBSSxjQUFjLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztLQUNoRDtTQUFNLElBQUksRUFBRSxLQUFLLElBQUksRUFBRTtRQUN0QixPQUFPLElBQUksY0FBYyxDQUFDLGdCQUFnQixFQUFFLENBQUM7S0FDOUM7U0FBTSxJQUFJLEVBQUUsS0FBSyxNQUFNLEVBQUU7UUFDeEIsT0FBTyxJQUFJLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0tBQ2hEO1NBQU0sSUFBSSxFQUFFLEtBQUssS0FBSyxFQUFFO1FBQ3ZCLE9BQU8sSUFBSSxjQUFjLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztLQUMvQztTQUFN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