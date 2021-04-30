import { arrayify, BytesLike } from '@ethersproject/bytes';
import { stripHexPrefix } from 'ethereumjs-util';
import sha3 from 'js-sha3';
const jsSHA = require('jssha/dist/sha3');
const Buffer = require('safe-buffer').Buffer;
const ed = require('noble-ed25519');
const sha3_256 = require('js-sha3').sha3_256;
const assert = require('assert');

const STARCOIN_HASH_PREFIX = 'STARCOIN::';

class DefaultHasher {
  readonly salt?: Uint8Array;

  constructor(typename?: string) {
    if (typename) {
      const data = new Uint8Array(Buffer.from(STARCOIN_HASH_PREFIX + typename));
      const hasher = sha3.sha3_256.create();
      hasher.update(data);
      this.salt = new Uint8Array(hasher.arrayBuffer());
    }
  }

  crypto_hash(data: BytesLike): string {
    const hasher = sha3.sha3_256.create();
    if (this.salt) {
      hasher.update(this.salt);
    }
    hasher.update(arrayify(data));
    return '0x' + hasher.hex();
  }

  get_salt(): Uint8Array {
    return this.salt;
  }
}
export interface CryptoHash {
  crypto_hash(data: BytesLike): string;
  get_salt(): Uint8Array;
}

export function createHash(typename: string): CryptoHash {
  return new DefaultHasher(typename);
}


export function createUserTransactionHasher(): CryptoHash {
  return createHash("SignedUserTransaction");
}

export function createRawUserTransactionHasher(): CryptoHash {
  return createHash("RawUserTransaction");
}

export function publicKeyToAuthKey(public_key: string): string {
  const shaObj = new jsSHA("SHA3-256", "HEX", { encoding: "UTF8" });
  shaObj.update(stripHexPrefix(public_key));
  shaObj.update("00");
  const hash = shaObj.getHash("HEX");
  return '0x' + hash
}

export function publicKeyToAddress(public_key: string): string {
  const shaObj = new jsSHA("SHA3-256", "HEX", { encoding: "UTF8" });
  shaObj.update(stripHexPrefix(public_key));
  shaObj.update("00");
  const hash = shaObj.getHash("HEX");
  const address = hash.slice(hash.length/2);
  return '0x' + address
}

export async function privateKeyToPublicKey(private_key: string): Promise<string> {
  const public_key = await ed.getPublicKey(stripHexPrefix(private_key))
  return '0x' + public_key
}