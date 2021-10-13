
import { utils } from '@starcoin/stc-ed25519';
import { addHexPrefix, stripHexPrefix } from 'ethereumjs-util';
import { hexlify } from '@ethersproject/bytes';
import { cloneDeep } from 'lodash';
import { showAccount } from "./account"
import { privateKeyToPublicKey, publicKeyToAuthKey, publicKeyToAddress, encodeReceiptIdentifier } from "../encoding";
import { MultiEd25519KeyShard } from "../crypto";

/**
 * simillar to this command in the starcoin console:
 * starcoin% account import-multisig --pubkey <PUBLIC_KEY> --pubkey <PUBLIC_KEY> --prikey <PRIVATE_KEY> -t 2
 *
 * @param originPublicKeys  
 * @param originPrivateKeys
 * @param thresHold
 * @returns 
 */
export async function createMultiSignAccount(originPublicKeys: Array<string>, originPrivateKeys: Array<string>, thresHold: number): Promise<Record<string, string>> {
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

  console.log({ uniquePublicKeys, thresHold, pos_verified_private_keys })

  const x = new MultiEd25519KeyShard(uniquePublicKeys, thresHold, pos_verified_private_keys)
  console.log({ x })



  console.log(x.privateKeys())
  console.log(x.publicKey())
  console.log(x.threshold)

  const pub = x.publicKey()
  console.log({ pub })
  console.log(pub.serialize())
  console.log(hexlify(pub.serialize()))

  // const bytes = new Uint8Array(x.serialize());

  // const x2 = await MultiEd25519KeyShard.deserialize(bytes)
  // console.log({ x2 })

  const accountInfo = showAccount(originPrivateKeys[0]);
  return accountInfo;
}
