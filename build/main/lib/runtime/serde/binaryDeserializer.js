"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryDeserializer = void 0;
class BinaryDeserializer {
    constructor(data) {
        // As we can't be sure about the origin of the data, it's better to copy it to a new buffer
        // e.g. if the data originated by: Buffer.from('16a9', 'hex'), the internal buffer would be much longer and/or different (as Buffer is some sort of a view)
        this.buffer = new ArrayBuffer(data.length);
        new Uint8Array(this.buffer).set(data, 0);
        this.offset = 0;
    }
    read(length) {
        const bytes = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;
        return bytes;
    }
    deserializeStr() {
        const value = this.deserializeBytes();
        return BinaryDeserializer.textDecoder.decode(value);
    }
    deserializeBytes() {
        const len = this.deserializeLen();
        if (len < 0) {
            throw new Error("Length of a bytes array can't be negative");
        }
        return new Uint8Array(this.read(len));
    }
    deserializeBool() {
        const bool = new Uint8Array(this.read(1))[0];
        return bool == 1;
    }
    deserializeUnit() {
        return null;
    }
    deserializeU8() {
        return new DataView(this.read(1)).getUint8(0);
    }
    deserializeU16() {
        return new DataView(this.read(2)).getUint16(0, true);
    }
    deserializeU32() {
        return new DataView(this.read(4)).getUint32(0, true);
    }
    deserializeU64() {
        const low = this.deserializeU32();
        const high = this.deserializeU32();
        // combine the two 32-bit values and return (little endian)
        return (BigInt(high) << BinaryDeserializer.BIG_32) | BigInt(low);
    }
    deserializeU128() {
        const low = this.deserializeU64();
        const high = this.deserializeU64();
        // combine the two 64-bit values and return (little endian)
        return (BigInt(high) << BinaryDeserializer.BIG_64) | BigInt(low);
    }
    deserializeI8() {
        return new DataView(this.read(1)).getInt8(0);
    }
    deserializeI16() {
        return new DataView(this.read(2)).getInt16(0, true);
    }
    deserializeI32() {
        return new DataView(this.read(4)).getInt32(0, true);
    }
    deserializeI64() {
        const low = this.deserializeI32();
        const high = this.deserializeI32();
        // combine the two 32-bit values and return (little endian)
        return (BigInt(high) << BinaryDeserializer.BIG_32) | BigInt(low);
    }
    deserializeI128() {
        const low = this.deserializeI64();
        const high = this.deserializeI64();
        // combine the two 64-bit values and return (little endian)
        return (BigInt(high) << BinaryDeserializer.BIG_64) | BigInt(low);
    }
    deserializeOptionTag() {
        return this.deserializeBool();
    }
    getBufferOffset() {
        return this.offset;
    }
    deserializeChar() {
        throw new Error('Method deserializeChar not implemented.');
    }
    deserializeF32() {
        return new DataView(this.read(4)).getFloat32(0, true);
    }
    deserializeF64() {
        return new DataView(this.read(8)).getFloat64(0, true);
    }
}
exports.BinaryDeserializer = BinaryDeserializer;
BinaryDeserializer.BIG_32 = BigInt(32);
BinaryDeserializer.BIG_64 = BigInt(64);
BinaryDeserializer.textDecoder = new TextDecoder();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluYXJ5RGVzZXJpYWxpemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9ydW50aW1lL3NlcmRlL2JpbmFyeURlc2VyaWFsaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxNQUFzQixrQkFBa0I7SUFPdEMsWUFBc0IsSUFBZ0I7UUFDcEMsMkZBQTJGO1FBQzNGLDJKQUEySjtRQUMzSixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRU8sSUFBSSxDQUFDLE1BQWM7UUFDekIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDO1FBQ25FLElBQUksQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDO1FBQ3RCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQVdNLGNBQWM7UUFDbkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDdEMsT0FBTyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFTSxnQkFBZ0I7UUFDckIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ2xDLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtZQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztTQUM5RDtRQUNELE9BQU8sSUFBSSxVQUFVLENBQUMsSUFB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