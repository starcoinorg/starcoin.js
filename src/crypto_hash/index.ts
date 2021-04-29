import { arrayify, BytesLike } from '@ethersproject/bytes';
import sha3 from 'js-sha3';
const jsSHA = require('jssha/dist/sha3');

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
  shaObj.update(public_key.slice(2));
  shaObj.update("00");
  const hash = shaObj.getHash("HEX");
  return '0x' + hash
}