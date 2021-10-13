/* eslint-disable max-classes-per-file */
import { concat, arrayify, hexlify } from '@ethersproject/bytes';
import {
    U8,
    Ed25519PublicKey,
} from '../types';

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
