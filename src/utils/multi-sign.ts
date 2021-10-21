/* eslint-disable no-bitwise */

import { cloneDeep } from 'lodash';
import { privateKeyToPublicKey } from "../encoding";
import { MultiEd25519KeyShard } from "../crypto";

export function dec2bin(dec: number): string {
  const bin = (dec >>> 0).toString(2)
  const prefixed = `00000000000000000000000000000000${ bin }`
  return prefixed.slice(-32);
}

export function bin2dec(bin: string): number {
  return Number.parseInt(Number.parseInt(bin, 2).toString(10), 10);
}

// index from left to right
export function setBit(n: number, idx: number): number {
  if (idx > 31 || idx < 0) {
    throw new Error(`mask: invalid idx at ${ idx }, should be between 0 and 31`)
  }
  const mask = 1 << (32 - idx - 1)
  return n | mask
}

// index from left to right
export function isSetBit(n: number, idx: number): boolean {
  if (idx > 31 || idx < 0) {
    throw new Error(`mask: invalid idx at ${ idx }, should be between 0 and 31`)
  }
  // const mask = 1 << (32 - idx - 1)
  // let isSet = false
  // if ((n & mask) !== 0) {
  //   isSet = true
  // }
  // return isSet
  return ((n >> (32 - idx - 1)) % 2 !== 0)
}

/**
 * simillar to this command in the starcoin console:
 * starcoin% account import-multisig --pubkey <PUBLIC_KEY> --pubkey <PUBLIC_KEY> --prikey <PRIVATE_KEY> -t 2
 *
 * @param originPublicKeys  
 * @param originPrivateKeys
 * @param thresHold
 * @returns 
 */
export async function createMultiEd25519KeyShard(originPublicKeys: Array<string>, originPrivateKeys: Array<string>, thresHold: number): Promise<MultiEd25519KeyShard> {
  if (originPrivateKeys.length === 0) {
    throw new Error('require at least one private key');
  }

  const publicKeys = cloneDeep(originPublicKeys)
  const pubPrivMap = {}

  // 1. merge privateKeys' publicKey into publicKeys
  // 2. generate pub->priv map
  await Promise.all(
    originPrivateKeys.map((priv) => {
      return privateKeyToPublicKey(priv).then((pub) => {
        publicKeys.push(pub);
        pubPrivMap[pub] = priv;
        return pub;
      }).catch((error) => {
        throw new Error(`invalid private key: ${ error }`)
      })
    })
  )

  // 3. sort all public keys by its bytes in asc order to make sure same public key set always generate same auth key.
  publicKeys.sort((a, b) => {
    return a > b ? 1 : -1
  })

  // 4. remove repeat public keys, if use add repeat public_key or private key.
  const uniquePublicKeys = publicKeys.filter((v, i, a) => a.indexOf(v) === i)

  // 5. generate pos_verified_private_keys
  const pos_verified_private_keys = {};
  await Promise.all(
    originPrivateKeys.map((priv) => {
      return privateKeyToPublicKey(priv).then((pub) => {
        const idx = uniquePublicKeys.indexOf(pub)
        if (idx > -1) {
          pos_verified_private_keys[idx] = priv
        }
        return pub;
      }).catch((error) => {
        throw new Error(`invalid private key: ${ error }`)
      })
    })
  )

  const shard = new MultiEd25519KeyShard(uniquePublicKeys, thresHold, pos_verified_private_keys)
  return shard;
}
