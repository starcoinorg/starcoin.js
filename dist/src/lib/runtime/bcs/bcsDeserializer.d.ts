import { BinaryDeserializer } from '../serde/binaryDeserializer';
export declare class BcsDeserializer extends BinaryDeserializer {
    private static readonly MAX_UINT_32;
    constructor(data: Uint8Array);
    deserializeUleb128AsU32(): number;
    deserializeLen(): number;
    deserializeVariantIndex(): number;
    checkThatKeySlicesAreIncreasing(key1: [number, number], key2: [number, number]): void;
}
