/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-bitwise */

import { arrayify, hexlify } from '@ethersproject/bytes';
import { cloneDeep } from 'lodash';
import { privateKeyToPublicKey } from "../encoding";
import { uint8 } from '../lib/runtime/serde/types';
import { getSignatureHex } from "./tx";
import {
  MultiEd25519KeyShard,
  MultiEd25519Signature,
  MultiEd25519SignatureShard,
  Ed25519Signature,
  Ed25519PublicKey,
  Ed25519PrivateKey,
} from "../lib/runtime/starcoin_types";


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
          pos_verified_private_keys[idx] = new Ed25519PrivateKey(arrayify(priv))
        }
        return pub;
      }).catch((error) => {
        throw new Error(`invalid private key: ${ error }`)
      })
    })
  )

  const public_keys = uniquePublicKeys.map((pub) => new Ed25519PublicKey(arrayify(pub)))
  const shard = new MultiEd25519KeyShard(public_keys, thresHold, pos_verified_private_keys)
  return shard;
}

export async function signMultiEd25519KeyShard(multiEd25519KeyShard: MultiEd25519KeyShard, data?: any): Promise<MultiEd25519SignatureShard> {
  const signatures = await Promise.all(
    Object.keys(multiEd25519KeyShard.private_keys).map((k) => {
      const privateKey = hexlify(multiEd25519KeyShard.private_keys[k].value)
      return getSignatureHex(data, privateKey).then((signatureHex) => {
        const signature = new Ed25519Signature(arrayify(signatureHex))
        const pos = Number.parseInt(k, 10)
        return [signature, pos] as [Ed25519Signature, uint8]
      }).catch((error) => {
        throw new Error(`invalid private key: ${ error }`)
      })
    })
  )
  console.log({ signatures })
  const multiEd25519Signature = MultiEd25519Signature.build(signatures)
  console.log({ multiEd25519Signature })
  return new MultiEd25519SignatureShard(multiEd25519Signature, multiEd25519KeyShard.threshold)
}