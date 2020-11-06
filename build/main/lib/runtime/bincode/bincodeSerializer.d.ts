import { BinarySerializer } from '../serde/binarySerializer';
export declare class BincodeSerializer extends BinarySerializer {
    serializeLen(value: number): void;
    serializeVariantIndex(value: number): void;
    sortMapEntries(offsets: number[]): void;
}
