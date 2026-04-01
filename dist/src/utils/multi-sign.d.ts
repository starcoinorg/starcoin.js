import { MultiEd25519KeyShard, MultiEd25519Signature, MultiEd25519SignatureShard, RawUserTransaction } from "../lib/runtime/starcoin_types";
/**
 * simillar to this command in the starcoin console:
 * starcoin% account import-multisig --pubkey <PUBLIC_KEY> --pubkey <PUBLIC_KEY> --prikey <PRIVATE_KEY> -t 2
 *
 * @param originPublicKeys
 * @param originPrivateKeys
 * @param thresHold
 * @returns
 */
export declare function generateMultiEd25519KeyShard(originPublicKeys: Array<string>, originPrivateKeys: Array<string>, thresHold: number): Promise<MultiEd25519KeyShard>;
export declare function generateMultiEd25519Signature(multiEd25519KeyShard: MultiEd25519KeyShard, rawUserTransaction: RawUserTransaction): Promise<MultiEd25519Signature>;
export declare function generateMultiEd25519SignatureShard(multiEd25519KeyShard: MultiEd25519KeyShard, rawUserTransaction: RawUserTransaction): Promise<MultiEd25519SignatureShard>;
