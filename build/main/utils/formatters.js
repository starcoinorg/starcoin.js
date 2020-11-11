"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outputMoveValuesFormatter = void 0;
function outputMoveValuesFormatter(output) {
    return output.map((elem) => transformMoveValue(elem));
}
exports.outputMoveValuesFormatter = outputMoveValuesFormatter;
function transformMoveValue(v) {
    if ('Bool' in v) {
        return v.Bool;
    }
    else if ('U8' in v) {
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
    else {
        throw new Error('invalid annotated move value' + JSON.stringify(v));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0dGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9mb3JtYXR0ZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLFNBQWdCLHlCQUF5QixDQUN2QyxNQUE0QjtJQUU1QixPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDeEQsQ0FBQztBQUpELDhEQUlDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxDQUFxQjtJQUMvQyxJQUFJLE1BQU0sSUFBSSxDQUFDLEVBQUU7UUFDZixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7S0FDZjtTQUFNLElBQUksSUFBSSxJQUFJLENBQUMsRUFBRTtRQUNwQixPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUM7S0FDYjtTQUFNLElBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtRQUNyQixPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUM7S0FDZDtTQUFNLElBQUksTUFBTSxJQUFJLENBQUMsRUFBRTtRQUN0QixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7S0FDZjtTQUFNLElBQUksU0FBUyxJQUFJLENBQUMsRUFBRTtRQUN6QixPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUM7S0FDbEI7U0FBTSxJQUFJLE9BQU8sSUFBSSxDQUFDLEVBQUU7UUFDdkIsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDO0tBQ2hCO1NBQU0sSUFBSSxRQUFRLElBQUksQ0FBQyxFQUFFO1FBQ3hCLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDekQ7U0FBTSxJQUFJLFFBQVEsSUFBSSxDQUFDLEVBQUU7UUFDeEIsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUN4QixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsaUNBQU0sQ0FBQyxLQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLElBQUcsRUFDckQsRUFBRSxDQUNILENBQUM7S0FDSDtTQUFNO1FBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDckU7QUFDSCxDQUFDIn0=