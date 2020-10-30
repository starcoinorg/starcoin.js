import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { TraitHelpers } from './traitHelpers';
import { ListTypeTag } from './traitHelpers';
import { ListTransactionArgument } from './traitHelpers';
export class Script {
  constructor(
    public readonly code: Uint8Array,
    public readonly ty_args: ListTypeTag,
    public readonly args: ListTransactionArgument
  ) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.code);
    TraitHelpers.serializeListTypeTag(this.ty_args, serializer);
    TraitHelpers.serializeListTransactionArgument(this.args, serializer);
  }

  static deserialize(deserializer: Deserializer): Script {
    const code = deserializer.deserializeBytes();
    const ty_args = TraitHelpers.deserializeListTypeTag(deserializer);
    const args = TraitHelpers.deserializeListTransactionArgument(deserializer);
    return new Script(code, ty_args, args);
  }
}
