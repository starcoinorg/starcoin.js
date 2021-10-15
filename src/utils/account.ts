
import { utils } from '@starcoin/stc-ed25519';
import { addHexPrefix, stripHexPrefix } from 'ethereumjs-util';
import { hexlify } from '@ethersproject/bytes';
import { privateKeyToPublicKey, publicKeyToAuthKey, publicKeyToAddress, encodeReceiptIdentifier } from "../encoding";
import { MultiEd25519KeyShard } from "../crypto";

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

export function showMultiEd25519Account(shard: MultiEd25519KeyShard): Record<string, string> {
  const privateKey = hexlify(shard.privateKey())

  const multiEd25519PublicKey = shard.publicKey()
  const publicKey = hexlify(multiEd25519PublicKey.serialize())

  const authKey = publicKeyToAuthKey(publicKey, 1)

  const address = publicKeyToAddress(publicKey, 1)

  // same with Rust, receiptIdentifier do not include authKey
  const receiptIdentifier = encodeReceiptIdentifier(stripHexPrefix(address))

  return {
    privateKey,
    publicKey,
    address,
    authKey,
    receiptIdentifier
  };
}