
import { utils } from '@noble/ed25519';
import { addHexPrefix, stripHexPrefix } from 'ethereumjs-util';
import { hexlify, arrayify } from '@ethersproject/bytes';
import { privateKeyToPublicKey, publicKeyToAuthKey, publicKeyToAddress, encodeReceiptIdentifier, bcsEncode } from "../encoding";
import { MultiEd25519KeyShard, Ed25519PublicKey, Ed25519PrivateKey } from "../lib/runtime/starcoin_types";
import { accountType } from "../types";

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

export function getMultiEd25519AccountPrivateKey(shard: MultiEd25519KeyShard): string {
  const privateKey = hexlify(shard.privateKey())
  return privateKey;
}

export function getMultiEd25519AccountPublicKey(shard: MultiEd25519KeyShard): string {
  const multiEd25519PublicKey = shard.publicKey()
  const publicKey = hexlify(multiEd25519PublicKey.value())
  return publicKey;
}

export function getMultiEd25519AccountAddress(shard: MultiEd25519KeyShard): string {
  const publicKey = getMultiEd25519AccountPublicKey(shard)
  const address = publicKeyToAddress(publicKey, accountType.MULTI)
  return address;
}

export function getMultiEd25519AccountReceiptIdentifier(shard: MultiEd25519KeyShard): string {
  const address = getMultiEd25519AccountAddress(shard)
  // same with Rust, receiptIdentifier do not include authKey
  const receiptIdentifier = encodeReceiptIdentifier(stripHexPrefix(address))
  return receiptIdentifier;
}

export function showMultiEd25519Account(shard: MultiEd25519KeyShard): Record<string, string> {
  const privateKey = getMultiEd25519AccountPrivateKey(shard)
  const publicKey = getMultiEd25519AccountPublicKey(shard)
  const address = getMultiEd25519AccountAddress(shard)
  const receiptIdentifier = getMultiEd25519AccountReceiptIdentifier(shard)
  const authKey = publicKeyToAuthKey(publicKey, accountType.MULTI)

  return {
    privateKey,
    publicKey,
    address,
    authKey,
    receiptIdentifier
  };
}

export function decodeMultiEd25519AccountPrivateKey(privateKey: string): Record<string, any> {
  const bytes = arrayify(privateKey)
  const publicKeysLengthBytes = bytes.slice(0, 1);
  const publicKeysLength = publicKeysLengthBytes[0];

  const thresholdBytes = bytes.slice(1, 2);
  const threshold = thresholdBytes[0];

  const privateKeysLengthBytes = bytes.slice(2, 3);
  const privateKeysLength = privateKeysLengthBytes[0];

  const publicKeys = []
  const privateKeys = []
  let start = 3
  const length = 32
  let end

  for (let i = 0; i < publicKeysLength; i += 1) {
    end = start + length
    const publicKeyBytes = bytes.slice(start, end);
    publicKeys.push(hexlify(publicKeyBytes))
    start = end
  }
  for (let i = 0; i < privateKeysLength; i += 1) {
    end = start + length
    const privateKeyBytes = bytes.slice(start, end);
    privateKeys.push(hexlify(privateKeyBytes))
    start = end
  }

  return { privateKeys, publicKeys, threshold };
}