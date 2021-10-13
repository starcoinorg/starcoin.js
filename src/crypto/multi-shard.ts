/* eslint-disable max-classes-per-file */
import { concat, arrayify, hexlify } from '@ethersproject/bytes';
import {
    CryptoMaterialError,
    MAX_NUM_OF_KEYS,
    ED25519_PUBLIC_KEY_LENGTH,
    ED25519_PRIVATE_KEY_LENGTH,
    MultiEd25519PublicKey,
} from './multi-ed25519';
import { U8, Ed25519PrivateKey, Ed25519PublicKey, } from '../types';
import { privateKeyToPublicKey } from "../encoding";

// Part of private keys in the multi-key Ed25519 structure along with the threshold.
// note: the private keys must be a sequential part of the MultiEd25519PrivateKey
export class MultiEd25519KeyShard {
    constructor(private public_keys: Ed25519PublicKey[], public threshold: U8, private private_keys: Record<U8, Ed25519PrivateKey>) {
        const num_of_public_keys = public_keys.length;
        const num_of_private_keys = Object.keys(private_keys).length;
        if (threshold === 0 || num_of_private_keys === 0 || num_of_public_keys < threshold) {
            throw new Error(CryptoMaterialError.ValidationError)
        } else if (num_of_private_keys > MAX_NUM_OF_KEYS || num_of_public_keys > MAX_NUM_OF_KEYS) {
            throw new Error(CryptoMaterialError.WrongLengthError)
        }
    }

    public serialize(): Uint8Array {
        const arrHead = new Uint8Array(3);
        arrHead[0] = this.public_keys.length
        arrHead[1] = this.threshold
        arrHead[2] = this.len()
        const arrPub = []
        this.public_keys.forEach((pub) => {
            arrPub.push(arrayify(pub))
        })
        const arrPriv = []
        Object.values(this.private_keys).forEach((priv) => {
            arrPriv.push(arrayify(priv))
        })
        const bytes = concat([arrHead, ...arrPub, ...arrPriv])
        return bytes;
    }

    static async deserialize(bytes: Uint8Array): Promise<MultiEd25519KeyShard> {
        const HEADER_LEN = 3;
        const bytes_len = bytes.length;
        if (bytes_len < HEADER_LEN) {
            throw new Error(CryptoMaterialError.WrongLengthError);
        }
        const public_key_len = bytes[0] as U8;
        const threshold = bytes[1] as U8;
        // const private_key_len = bytes[2] as U8;

        const public_key_bytes_len = public_key_len * ED25519_PUBLIC_KEY_LENGTH;
        // const private_key_bytes_len = private_key_len * ED25519_PRIVATE_KEY_LENGTH;

        let i: U8
        let j: U8
        const public_keys = []
        for (i = HEADER_LEN, j = HEADER_LEN + public_key_bytes_len; i < j; i += ED25519_PUBLIC_KEY_LENGTH) {
            const temp = bytes.slice(i, i + ED25519_PUBLIC_KEY_LENGTH);
            public_keys.push(hexlify(temp))
        }
        const private_keys = []
        for (i = HEADER_LEN + public_key_bytes_len, j = bytes.length; i < j; i += ED25519_PRIVATE_KEY_LENGTH) {
            const temp = bytes.slice(i, i + ED25519_PUBLIC_KEY_LENGTH);
            private_keys.push(hexlify(temp))
        }
        const pos_verified_private_keys = {};
        await Promise.all(
            private_keys.map((priv) => {
                return privateKeyToPublicKey(priv).then((pub) => {
                    const idx = public_keys.indexOf(pub)
                    if (idx > -1) {
                        pos_verified_private_keys[idx] = priv
                    }
                    return pub;
                }).catch((error) => {
                    throw new Error(`invalid private key: ${ error }`)
                })
            })
        )
        return new MultiEd25519KeyShard(public_keys, threshold, pos_verified_private_keys)
    }

    public publicKey(): MultiEd25519PublicKey {
        return new MultiEd25519PublicKey(this.public_keys, this.threshold);
    }

    public privateKeys(): Ed25519PrivateKey[] {
        return Object.values(this.private_keys);
    }

    public len(): U8 {
        return Object.values(this.private_keys).length;
    }

    public isEmpty(): boolean {
        return this.len() === 0;
    }
}