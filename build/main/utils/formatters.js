"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputMoveValuesFormatter = void 0;
function outputMoveValuesFormatter(output) {
    return output.map((elem) => transformMoveValue(elem));
}
exports.outputMoveValuesFormatter = outputMoveValuesFormatter;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function transformMoveValue(v) {
    if ('U8' in v) {
        return v.U8;
    }
    else if ('U64' in v) {
        return v.U64;
    }
    else if ('U128' in v) {
        return v.U128;
    }
    else if ('Address' in v) {
        return v.Address;
    }
    else if ('Bytes' in v) {
        return v.Bytes;
    }
    else if ('Vector' in v) {
        return v.Vector.map((elem) => transformMoveValue(elem));
    }
    else if ('Struct' in v) {
        const struct = v.Struct;
        return struct.value.reduce((o, [k, v]) => (Object.assign(Object.assign({}, o), { [k]: transformMoveValue(v) })), {});
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0dGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9mb3JtYXR0ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLFNBQWdCLHlCQUF5QixDQUN2QyxNQUE0QjtJQUU1QixPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDeEQsQ0FBQztBQUpELDhEQUlDO0FBRUQsNkRBQTZEO0FBQzdELGFBQWE7QUFDYixTQUFTLGtCQUFrQixDQUFDLENBQXFCO0lBQy9DLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRTtRQUNiLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQztLQUNiO1NBQU0sSUFBSSxLQUFLLElBQUksQ0FBQyxFQUFFO1FBQ3JCLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQztLQUNkO1NBQU0sSUFBSSxNQUFNLElBQUksQ0FBQyxFQUFFO1FBQ3RCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztLQUNmO1NBQU0sSUFBSSxTQUFTLElBQUksQ0FBQyxFQUFFO1FBQ3pCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQztLQUNsQjtTQUFNLElBQUksT0FBTyxJQUFJLENBQUMsRUFBRTtRQUN2QixPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7S0FDaEI7U0FBTSxJQUFJLFFBQVEsSUFBSSxDQUFDLEVBQUU7UUFDeEIsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUN6RDtTQUFNLElBQUksUUFBUSxJQUFJLENBQUMsRUFBRTtRQUN4QixNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3hCLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQ3hCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxpQ0FBTSxDQUFDLEtBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsSUFBRyxFQUNyRCxFQUFFLENBQ0gsQ0FBQztLQUNIO0FBQ0gsQ0FBQyJ9