import { AnnotatedMoveValue, MoveValue } from '../types';

export function formatMoveValue(v: AnnotatedMoveValue): MoveValue {
  if ('Bool' in v) {
    return v.Bool;
  }
  if ('U8' in v) {
    return v.U8;
  }
  if ('U64' in v) {
    return v.U64;
  }
  if ('U128' in v) {
    return v.U128;
  }
  if ('Address' in v) {
    return v.Address;
  }
  if ('Bytes' in v) {
    return v.Bytes;
  }
  if ('Vector' in v) {
    return v.Vector.map((elem) => formatMoveValue(elem));
  }
  if ('Struct' in v) {
    const struct = v.Struct;
    // eslint-disable-next-line unicorn/no-reduce
    return struct.value.reduce(
      (o, [k, field]) => ({ ...o, [k]: formatMoveValue(field) }),
      {}
    );
  }
  throw new Error(`invalid annotated move value, ${JSON.stringify(v)}`);

}
