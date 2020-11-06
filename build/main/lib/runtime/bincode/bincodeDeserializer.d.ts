import { BinaryDeserializer } from '../serde/binaryDeserializer';
export declare class BincodeDeserializer extends BinaryDeserializer {
    deserializeLen(): number;
    deserializeVariantIndex(): number;
    checkThatKeySlicesAreIncreasing(key1: [number, number], key2: [number, number]): void;
}
