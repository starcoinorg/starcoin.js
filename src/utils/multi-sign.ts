
import { utils } from '@starcoin/stc-ed25519';
import { addHexPrefix, stripHexPrefix } from 'ethereumjs-util';
import { privateKeyToPublicKey, publicKeyToAuthKey, publicKeyToAddress, encodeReceiptIdentifier } from "../encoding";
import { showAccount } from "./account"

/**
 * simillar to this command in the starcoin console:
 * starcoin% account import-multisig --pubkey <PUBLIC_KEY> --pubkey <PUBLIC_KEY> --prikey <PRIVATE_KEY> -t 2
 *
 * @param publicKeys  
 * @param privateKeys
 * @param thresHold
 * @returns 
 */
export async function createMultiSignAccount(publicKeys: Array<string>, privateKeys: Array<string>, thresHold: number): Promise<Record<string, string>> {
  if (privateKeys.length === 0) {
    throw new Error('require at least one private key');
  }

  const pubPrivMap = {}

  // 1. merge privateKeys' publicKey into publicKeys
  // 2. generate pub->priv map
  await Promise.all(
    privateKeys.map((priv) => {
      return privateKeyToPublicKey(priv).then((pub) => {
        publicKeys.push(pub);
        pubPrivMap[pub] = priv;
        return pub;
      }).catch((error) => {
        throw new Error(`invalid private key: ${ error }`)
      })
    })
  )

  console.log(publicKeys);
  console.log(pubPrivMap);

  // sort all public keys by its bytes to make sure same public key set always generate same auth key.

  // remove repeat public keys, if use add repeat public_key or private key.

  const accountInfo = showAccount(privateKeys[0]);
  return accountInfo;
}
