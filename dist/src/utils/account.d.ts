import { MultiEd25519KeyShard } from "../lib/runtime/starcoin_types";
export declare function generatePrivateKey(): string;
export declare function generateAccount(): Promise<Record<string, string>>;
/**
 * simillar to these 2 commands in starcoin console:
 * starcoin% account import -i <PRIVATEKEY>
 * starcoin% account show <ACCOUNT_ADDRESS>
 * @param privateKey
 * @returns
 */
export declare function showAccount(privateKey: string): Promise<Record<string, string>>;
export declare function getMultiEd25519AccountPrivateKey(shard: MultiEd25519KeyShard): string;
export declare function getMultiEd25519AccountPublicKey(shard: MultiEd25519KeyShard): string;
export declare function getMultiEd25519AccountAddress(shard: MultiEd25519KeyShard): string;
export declare function getMultiEd25519AccountReceiptIdentifier(shard: MultiEd25519KeyShard): string;
export declare function showMultiEd25519Account(shard: MultiEd25519KeyShard): Record<string, string>;
export declare function decodeMultiEd25519AccountPrivateKey(privateKey: string): Record<string, any>;
