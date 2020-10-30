import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { WriteSetMut } from './WriteSetMut';
import { TraitHelpers } from './traitHelpers';
export class WriteSet {
  constructor(public readonly value: WriteSetMut) {}

  public serialize(serializer: Serializer): void {
    this.value.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): WriteSet {
    const value = WriteSetMut.deserialize(deserializer);
    return new WriteSet(value);
  }
}
