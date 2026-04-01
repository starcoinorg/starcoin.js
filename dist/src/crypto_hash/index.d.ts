import { BytesLike } from '@ethersproject/bytes';
export interface CryptoHash {
    crypto_hash(data: BytesLike): string;
    get_salt(): Uint8Array;
}
export declare function createHash(typename: string): CryptoHash;
export declare function createUserTransactionHasher(): CryptoHash;
export declare function createRawUserTransactionHasher(): CryptoHash;
export declare function createSigningMessageHasher(): CryptoHash;
