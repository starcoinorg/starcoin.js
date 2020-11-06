"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BincodeSerializer = void 0;
const binarySerializer_1 = require("../serde/binarySerializer");
class BincodeSerializer extends binarySerializer_1.BinarySerializer {
    serializeLen(value) {
        this.serializeU64(value);
    }
    serializeVariantIndex(value) {
        this.serializeU32(value);
    }
    sortMapEntries(offsets) {
        return;
    }
}
exports.BincodeSerializer = BincodeSerializer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmluY29kZVNlcmlhbGl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbGliL3J1bnRpbWUvYmluY29kZS9iaW5jb2RlU2VyaWFsaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxnRUFBNkQ7QUFFN0QsTUFBYSxpQkFBa0IsU0FBUSxtQ0FBZ0I7SUFDckQsWUFBWSxDQUFDLEtBQWE7UUFDeEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRU0scUJBQXFCLENBQUMsS0FBYTtRQUN4QyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFTSxjQUFjLENBQUMsT0FBaUI7UUFDckMsT0FBTztJQUNULENBQUM7Q0FDRjtBQVpELDhDQVlDIn0=