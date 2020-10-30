import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { TraitHelpers } from './traitHelpers';
export class ChainId {
  constructor(public readonly id: number) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeU8(this.id);
  }

  static deserialize(deserializer: Deserializer): ChainId {
    const id = deserializer.deserializeU8();
    return new ChainId(id);
  }
}
