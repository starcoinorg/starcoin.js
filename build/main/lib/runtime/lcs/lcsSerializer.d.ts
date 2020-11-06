import { BinarySerializer } from '../serde/binarySerializer';
export declare class LcsSerializer extends BinarySerializer {
    constructor();
    serializeU32AsUleb128(value: number): void;
    serializeLen(value: number): void;
    serializeVariantIndex(value: number): void;
    sortMapEntries(offsets: number[]): void;
}
