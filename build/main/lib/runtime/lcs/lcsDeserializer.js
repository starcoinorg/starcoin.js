"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LcsDeserializer = void 0;
const binaryDeserializer_1 = require("../serde/binaryDeserializer");
class LcsDeserializer extends binaryDeserializer_1.BinaryDeserializer {
    constructor(data) {
        super(data);
    }
    deserializeUleb128AsU32() {
        let value = 0;
        for (let shift = 0; shift < 32; shift += 7) {
            const x = this.deserializeU8();
            const digit = x & 0x7f;
            value = value | (digit << shift);
            if (value < 0 || value > LcsDeserializer.MAX_UINT_32) {
                throw new Error('Overflow while parsing uleb128-encoded uint32 value');
            }
            if (digit == x) {
                if (shift > 0 && digit == 0) {
                    throw new Error('Invalid uleb128 number (unexpected zero digit)');
                }
                return value;
            }
        }
        throw new Error('Overflow while parsing uleb128-encoded uint32 value');
    }
    deserializeLen() {
        return this.deserializeUleb128AsU32();
    }
    deserializeVariantIndex() {
        return this.deserializeUleb128AsU32();
    }
    checkThatKeySlicesAreIncreasing(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    key1, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    key2) {
        return;
    }
}
exports.LcsDeserializer = LcsDeserializer;
LcsDeserializer.MAX_UINT_32 = 2 ** 32 - 1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGNzRGVzZXJpYWxpemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2xpYi9ydW50aW1lL2xjcy9sY3NEZXNlcmlhbGl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsb0VBQWlFO0FBRWpFLE1BQWEsZUFBZ0IsU0FBUSx1Q0FBa0I7SUFHckQsWUFBWSxJQUFnQjtRQUMxQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDZCxDQUFDO0lBRU0sdUJBQXVCO1FBQzVCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNkLEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxFQUFFLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRTtZQUMxQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDL0IsTUFBTSxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUN2QixLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxLQUFLLEdBQUcsZUFBZSxDQUFDLFdBQVcsRUFBRTtnQkFDcEQsTUFBTSxJQUFJLEtBQUssQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO2FBQ3hFO1lBQ0QsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO2dCQUNkLElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO29CQUMzQixNQUFNLElBQUksS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7aUJBQ25FO2dCQUNELE9BQU8sS0FBSyxDQUFDO2FBQ2Q7U0FDRjtRQUNELE1BQU0sSUFBSSxLQUFLLENBQUMscURBQXFELENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBRUQsY0FBYztRQUNaLE9BQU8sSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUVNLHVCQUF1QjtRQUM1QixPQUFPLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFFTSwrQkFBK0I7SUFDcEMsNkRBQTZEO0lBQzdELElBQXNCO0lBQ3RCLDZEQUE2RDtJQUM3RCxJQUFzQjtRQUV0QixPQUFPO0lBQ1QsQ0FBQzs7QUF6Q0gsMENBMENDO0FBekN5QiwyQkFBVyxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDIn0=