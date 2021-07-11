import { arrayify, BytesLike } from '@ethersproject/bytes';
import { addHexPrefix } from 'ethereumjs-util';

const Buffer = require('safe-buffer').Buffer;
const sha3_256 = require('js-sha3').sha3_256;

const STARCOIN_HASH_PREFIX = 'STARCOIN::';

class DefaultHasher {
  readonly salt?: Uint8Array;

  constructor(typename?: string) {
    if (typename) {
      const data = new Uint8Array(Buffer.from(STARCOIN_HASH_PREFIX + typename));
      const hasher = sha3_256.create();
      hasher.update(data);
      this.salt = new Uint8Array(hasher.arrayBuffer());
    }
  }

  crypto_hash(data: BytesLike): string {
    const hasher = sha3_256.create();
    if (this.salt) {
      hasher.update(this.salt);
    }
    hasher.update(arrayify(data));
    return addHexPrefix(hasher.hex());
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

export function createSigningMessageHasher(): CryptoHash {
  return createHash("SigningMessage");
}
