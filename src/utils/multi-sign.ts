
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
  const accountInfo = showAccount(privateKeys[0]);
  return accountInfo;
}
