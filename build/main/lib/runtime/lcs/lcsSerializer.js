"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LcsSerializer = void 0;
const binarySerializer_1 = require("../serde/binarySerializer");
class LcsSerializer extends binarySerializer_1.BinarySerializer {
    constructor() {
        super();
    }
    serializeU32AsUleb128(value) {
        const valueArray = [];
        while (value >>> 7 != 0) {
            valueArray.push((value & 0x7f) | 0x80);
            value = value >>> 7;
        }
        valueArray.push(value);
        this.serialize(new Uint8Array(valueArray));
    }
    serializeLen(value) {
        this.serializeU32AsUleb128(value);
    }
    serializeVariantIndex(value) {
        this.serializeU32AsUleb128(value);
    }
    sortMapEntries(offsets) {
        // leaving it empty for now, should be implemented soon
    }
}
exports.LcsSerializer = LcsSerializer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGNzU2VyaWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9saWIvcnVudGltZS9sY3MvbGNzU2VyaWFsaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxnRUFBNkQ7QUFFN0QsTUFBYSxhQUFjLFNBQVEsbUNBQWdCO0lBQ2pEO1FBQ0UsS0FBSyxFQUFFLENBQUM7SUFDVixDQUFDO0lBQ00scUJBQXFCLENBQUMsS0FBYTtRQUN4QyxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDdEIsT0FBTyxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN2QixVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLEtBQUssR0FBRyxLQUFLLEtBQUssQ0FBQyxDQUFDO1NBQ3JCO1FBQ0QsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVELFlBQVksQ0FBQyxLQUFhO1FBQ3hCLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRU0scUJBQXFCLENBQUMsS0FBYTtRQUN4QyxJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVNLGNBQWMsQ0FBQyxPQUFpQjtRQUNyQyx1REFBdUQ7SUFDekQsQ0FBQztDQUNGO0FBekJELHNDQXlCQyJ9