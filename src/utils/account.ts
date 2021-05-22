
import { utils } from 'noble-ed25519';
import { addHexPrefix, stripHexPrefix } from 'ethereumjs-util';
import { privateKeyToPublicKey, publicKeyToAuthKey, publicKeyToAddress, encodeReceiptIdentifier } from "../encoding";

export function generatePrivateKey(): string {
  // 32-byte Uint8Array
  const privateKeyBytes = utils.randomPrivateKey();
  const privateKey = Buffer.from(privateKeyBytes).toString('hex');
  return addHexPrefix(privateKey);
}

export async function generateAccount(): Promise<Record<string, string>> {
  const privateKey = generatePrivateKey();
  const accountInfo = showAccount(privateKey);
  return accountInfo;
}

/**
 * simillar to these 2 commands in starcoin console:
 * starcoin% account import -i <PRIVATEKEY>
 * starcoin% account show <ACCOUNT_ADDRESS>
 * @param privateKey
 * @returns 
 */
export async function showAccount(privateKey: string): Promise<Record<string, string>> {
  const publicKey = await privateKeyToPublicKey(privateKey)
  const address = publicKeyToAddress(publicKey)
  const authKey = publicKeyToAuthKey(publicKey)
  const receiptIdentifier = encodeReceiptIdentifier(stripHexPrefix(address), stripHexPrefix(authKey))
  return {
    privateKey,
    publicKey,
    address,
    authKey,
    receiptIdentifier
  };
}