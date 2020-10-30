import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { TraitHelpers } from './traitHelpers';
export class Ed25519PrivateKey {
  constructor(public readonly value: Uint8Array) {}

  public serialize(serializer: Serializer): void {
    serializer.serializeBytes(this.value);
  }

  static deserialize(deserializer: Deserializer): Ed25519PrivateKey {
    const value = deserializer.deserializeBytes();
    return new Ed25519PrivateKey(value);
  }
}
