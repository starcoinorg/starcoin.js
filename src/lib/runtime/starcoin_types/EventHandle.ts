import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { EventKey } from './EventKey';
import { TraitHelpers } from './traitHelpers';
export class EventHandle {
  constructor(public readonly count: Uint64LE, public readonly key: EventKey) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeU64(this.count);
    this.key.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): EventHandle {
    const count = deserializer.deserializeU64();
    const key = EventKey.deserialize(deserializer);
    return new EventHandle(count, key);
  }
}
