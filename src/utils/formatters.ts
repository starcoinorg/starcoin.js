import { AnnotatedMoveValue, MoveValue } from '..';

export function outputMoveValuesFormatter(output: AnnotatedMoveValue[]): MoveValue[] {
  return output.map(elem => transformMoveValue(elem))
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function transformMoveValue(v: AnnotatedMoveValue): MoveValue {
  if ("U8" in v) {
    return v.U8;
  } else if ("U64" in v) {
    return v.U64;
  } else if ("U128" in v) {
    return v.U128;
  } else if ("Address" in v) {
    return v.Address;
  } else if ("Bytes" in v) {
    return v.Bytes;
  } else if ("Vector" in v) {
    return v.Vector.map(elem => transformMoveValue(elem));
  } else if ("Struct" in v) {
    const struct = v.Struct;
    return struct.value.reduce((o, [k, v]) =>
        ({...o, [k]: transformMoveValue(v)})
      , {});
  }
}

