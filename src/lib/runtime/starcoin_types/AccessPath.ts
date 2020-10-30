import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { AccountAddress } from './AccountAddress';
import { TraitHelpers } from './traitHelpers';
// eslint-disable-next-line functional/no-class
export class AccessPath {
  constructor(
    public readonly address: AccountAddress,
    public readonly path: Uint8Array
  ) {}

  // eslint-disable-next-line functional/no-return-void
  public serialize(serializer: Serializer): void {
    // eslint-disable-next-line functional/no-this-expression
    this.address.serialize(serializer);
    // eslint-disable-next-line functional/no-this-expression
    serializer.serializeBytes(this.path);
  }

  static deserialize(deserializer: Deserializer): AccessPath {
    const address = AccountAddress.deserialize(deserializer);
    const path = deserializer.deserializeBytes();
    return new AccessPath(address, path);
  }
}
