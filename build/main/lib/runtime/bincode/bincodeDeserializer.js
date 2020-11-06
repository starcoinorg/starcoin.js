"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BincodeDeserializer = void 0;
const binaryDeserializer_1 = require("../serde/binaryDeserializer");
class BincodeDeserializer extends binaryDeserializer_1.BinaryDeserializer {
    deserializeLen() {
        return Number(this.deserializeU64());
    }
    deserializeVariantIndex() {
        return this.deserializeU32();
    }
    checkThatKeySlicesAreIncreasing(key1, key2) { }
}
exports.BincodeDeserializer = BincodeDeserializer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluY29kZURlc2VyaWFsaXplci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9saWIvcnVudGltZS9iaW5jb2RlL2JpbmNvZGVEZXNlcmlhbGl6ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsb0VBQWlFO0FBRWpFLE1BQWEsbUJBQW9CLFNBQVEsdUNBQWtCO0lBQ3pELGNBQWM7UUFDWixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRU0sdUJBQXVCO1FBQzVCLE9BQU8sSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFRCwrQkFBK0IsQ0FDN0IsSUFBc0IsRUFDdEIsSUFBc0IsSUFDZixDQUFDO0NBQ1g7QUFiRCxrREFhQyJ9