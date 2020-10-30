import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { AccountAddress } from './AccountAddress';
import { Identifier } from './Identifier';
import { TraitHelpers } from './traitHelpers';
import { ListTypeTag } from './traitHelpers';
export class StructTag {
  constructor(
    public readonly address: AccountAddress,
    public readonly module: Identifier,
    public readonly name: Identifier,
    public readonly type_params: ListTypeTag
  ) {}

  public serialize(serializer: Serializer): void {
    this.address.serialize(serializer);
    this.module.serialize(serializer);
    this.name.serialize(serializer);
    TraitHelpers.serializeListTypeTag(this.type_params, serializer);
  }

  static deserialize(deserializer: Deserializer): StructTag {
    const address = AccountAddress.deserialize(deserializer);
    const module = Identifier.deserialize(deserializer);
    const name = Identifier.deserialize(deserializer);
    const type_params = TraitHelpers.deserializeListTypeTag(deserializer);
    return new StructTag(address, module, name, type_params);
  }
}
