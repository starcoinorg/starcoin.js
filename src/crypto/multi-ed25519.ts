/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-classes-per-file */
import { defineReadOnly } from "@ethersproject/properties";
import { concat, arrayify, hexlify } from '@ethersproject/bytes';
import {
    U8,
    Ed25519PublicKey,
    Ed25519Signature,
} from '../types';
import { createMultiEd25519KeyShard, dec2bin, bin2dec, setBit, isSetBit } from "../utils/multi-sign";

export const CryptoMaterialError = {
    SerializationError: 'Struct to be signed does not serialize correctly',
    DeserializationError: 'Key or signature material does not deserialize correctly',
    ValidationError: 'Key or signature material deserializes, but is otherwise not valid',
    WrongLengthError: 'Key, threshold or signature material does not have the expected size',
    CanonicalRepresentationError: 'Part of the signature or key is not canonical resulting to malleability issues',
    SmallSubgroupError: 'A curve point (i.e., a public key) lies on a small group',
    PointNotOnCurveError: 'A curve point (i.e., a public key) does not satisfy the curve equation',
    BitVecError: 'BitVec errors in accountable multi-sig schemes',
}

export const MAX_NUM_OF_KEYS = 32
export const BITMAP_NUM_OF_BYTES = 4

// The length of the Ed25519PrivateKey
export const ED25519_PRIVATE_KEY_LENGTH = 32;
// The length of the Ed25519PublicKey
export const ED25519_PUBLIC_KEY_LENGTH = 32;
// The length of the Ed25519Signature
export const ED25519_SIGNATURE_LENGTH = 32;



export class MultiEd25519PublicKey {
    constructor(public public_keys: Ed25519PublicKey[], public threshold: U8) {
        const num_of_public_keys = public_keys.length;
        if (threshold === 0 || num_of_public_keys < threshold) {
            throw new Error(CryptoMaterialError.ValidationError)
        } else if (num_of_public_keys > MAX_NUM_OF_KEYS) {
            throw new Error(CryptoMaterialError.WrongLengthError)
        }
    }

    public serialize(): Uint8Array {
        const arrPub = []
        this.public_keys.forEach((pub) => {
            arrPub.push(arrayify(pub))
        })

        const arrThreshold = new Uint8Array(1);
        arrThreshold[0] = this.threshold

        const bytes = concat([...arrPub, ...arrThreshold])
        return bytes;
    }
}

export class MultiEd25519Signature {

    public signatures: Ed25519Signature[];

    // 0b00010000000000000000000000000001(268435457), the 3rd and 31st positions are set.
    public bitmap: U8;

    constructor(origin_signatures: [Ed25519Signature, U8][]) {
        const num_of_sigs = origin_signatures.length;
        if (num_of_sigs === 0 || num_of_sigs > MAX_NUM_OF_KEYS) {
            throw new Error(CryptoMaterialError.ValidationError)
        }
        const sorted_signatures = origin_signatures
        sorted_signatures.sort((a, b) => {
            return a[1] > b[1] ? 1 : -1
        })
        const sigs = []
        let bitmap = 0b00000000000000000000000000000000
        sorted_signatures.forEach((k, v) => {
            console.log(k, v)
            if (k[1] >= MAX_NUM_OF_KEYS) {
                throw new Error(`${ CryptoMaterialError.BitVecError }: Signature index is out of range`)
            } else if (isSetBit(bitmap, k[1])) {
                throw new Error(`${ CryptoMaterialError.BitVecError }: Duplicate signature index`)
            } else {
                sigs.push(k[0])
                bitmap = setBit(bitmap, k[1])
            }
        })
        defineReadOnly(this, 'signatures', sigs)
        defineReadOnly(this, 'bitmap', bitmap)
    }
}
