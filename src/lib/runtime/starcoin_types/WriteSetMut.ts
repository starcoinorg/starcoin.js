import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { TraitHelpers } from './traitHelpers';
import { ListTupleAccessPathWriteOp } from './traitHelpers';
export class WriteSetMut {
  constructor(public readonly write_set: ListTupleAccessPathWriteOp) {}

  public serialize(serializer: Serializer): void {
    TraitHelpers.serializeListTupleAccessPathWriteOp(
      this.write_set,
      serializer
    );
  }

  static deserialize(deserializer: Deserializer): WriteSetMut {
    const write_set = TraitHelpers.deserializeListTupleAccessPathWriteOp(
      deserializer
    );
    return new WriteSetMut(write_set);
  }
}
