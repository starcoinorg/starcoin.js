import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { TraitHelpers } from './traitHelpers';
import { ListTuplenumber } from './traitHelpers';
export class AccountAddress {
  constructor(public readonly value: ListTuplenumber) {}

  public serialize(serializer: Serializer): void {
    TraitHelpers.serializeListTuplenumber(this.value, serializer);
  }

  static deserialize(deserializer: Deserializer): AccountAddress {
    const value = TraitHelpers.deserializeListTuplenumber(deserializer);
    return new AccountAddress(value);
  }
}
