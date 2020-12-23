import { arrayify, BytesLike } from '@ethersproject/bytes';
import sha3 from 'js-sha3';

const LIBRA_HASH_PREFIX = 'LIBRA::';

class DefaultHasher {
  readonly salt?: Uint8Array;

  constructor(typename?: string) {
    if (typename) {
      const data = new Uint8Array(new Buffer(LIBRA_HASH_PREFIX + typename));
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
}
export interface CryptoHash {
  crypto_hash(data: BytesLike): string;
}

export function createHash(typename: string): CryptoHash {
  return new DefaultHasher(typename);
}
