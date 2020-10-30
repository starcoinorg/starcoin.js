import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { TraitHelpers } from './traitHelpers';
export abstract class WriteOp {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): WriteOp {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return WriteOpVariantDeletion.load(deserializer);
      case 1:
        return WriteOpVariantValue.load(deserializer);
      default:
        throw new Error('Unknown variant index for WriteOp: ' + index);
    }
  }
}

export class WriteOpVariantDeletion extends WriteOp {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
  }

  static load(deserializer: Deserializer): WriteOpVariantDeletion {
    return new WriteOpVariantDeletion();
  }
}

export class WriteOpVariantValue extends WriteOp {
  constructor(public readonly value: Uint8Array) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
    serializer.serializeBytes(this.value);
  }

  static load(deserializer: Deserializer): WriteOpVariantValue {
    const value = deserializer.deserializeBytes();
    return new WriteOpVariantValue(value);
  }
}
