import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { EventKey } from './EventKey';
import { TypeTag } from './TypeTag';
import { TraitHelpers } from './traitHelpers';
export class ContractEventV0 {
  constructor(
    public readonly key: EventKey,
    public readonly sequence_number: Uint64LE,
    public readonly type_tag: TypeTag,
    public readonly event_data: Uint8Array
  ) {}

  public serialize(serializer: Serializer): void {
    this.key.serialize(serializer);
    serializer.serializeU64(this.sequence_number);
    this.type_tag.serialize(serializer);
    serializer.serializeBytes(this.event_data);
  }

  static deserialize(deserializer: Deserializer): ContractEventV0 {
    const key = EventKey.deserialize(deserializer);
    const sequence_number = deserializer.deserializeU64();
    const type_tag = TypeTag.deserialize(deserializer);
    const event_data = deserializer.deserializeBytes();
    return new ContractEventV0(key, sequence_number, type_tag, event_data);
  }
}
