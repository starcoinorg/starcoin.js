import { AnnotatedMoveValue, MoveValue } from '../types';

export function outputMoveValuesFormatter(
  output: AnnotatedMoveValue[]
): MoveValue[] {
  return output.map((elem) => transformMoveValue(elem));
}

function transformMoveValue(v: AnnotatedMoveValue): MoveValue {
  if ('Bool' in v) {
    return v.Bool;
  } else if ('U8' in v) {
    return v.U8;
  } else if ('U64' in v) {
    return v.U64;
  } else if ('U128' in v) {
    return v.U128;
  } else if ('Address' in v) {
    return v.Address;
  } else if ('Bytes' in v) {
    return v.Bytes;
  } else if ('Vector' in v) {
    return v.Vector.map((elem) => transformMoveValue(elem));
  } else if ('Struct' in v) {
    const struct = v.Struct;
    return struct.value.reduce(
      (o, [k, v]) => ({ ...o, [k]: transformMoveValue(v) }),
      {}
    );
  } else {
    throw new Error('invalid annotated move value' + JSON.stringify(v));
  }
}
