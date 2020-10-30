import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { AccountAddress } from './AccountAddress';
import { TraitHelpers } from './traitHelpers';
export abstract class TransactionArgument {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): TransactionArgument {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return TransactionArgumentVariantU8.load(deserializer);
      case 1:
        return TransactionArgumentVariantU64.load(deserializer);
      case 2:
        return TransactionArgumentVariantU128.load(deserializer);
      case 3:
        return TransactionArgumentVariantAddress.load(deserializer);
      case 4:
        return TransactionArgumentVariantU8Vector.load(deserializer);
      case 5:
        return TransactionArgumentVariantBool.load(deserializer);
      default:
        throw new Error(
          'Unknown variant index for TransactionArgument: ' + index
        );
    }
  }
}

export class TransactionArgumentVariantU8 extends TransactionArgument {
  constructor(public readonly value: number) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
    serializer.serializeU8(this.value);
  }

  static load(deserializer: Deserializer): TransactionArgumentVariantU8 {
    const value = deserializer.deserializeU8();
    return new TransactionArgumentVariantU8(value);
  }
}

export class TransactionArgumentVariantU64 extends TransactionArgument {
  constructor(public readonly value: Uint64LE) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
    serializer.serializeU64(this.value);
  }

  static load(deserializer: Deserializer): TransactionArgumentVariantU64 {
    const value = deserializer.deserializeU64();
    return new TransactionArgumentVariantU64(value);
  }
}

export class TransactionArgumentVariantU128 extends TransactionArgument {
  constructor(public readonly value: BigNumber) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(2);
    serializer.serializeU128(this.value);
  }

  static load(deserializer: Deserializer): TransactionArgumentVariantU128 {
    const value = deserializer.deserializeU128();
    return new TransactionArgumentVariantU128(value);
  }
}

export class TransactionArgumentVariantAddress extends TransactionArgument {
  constructor(public readonly value: AccountAddress) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(3);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): TransactionArgumentVariantAddress {
    const value = AccountAddress.deserialize(deserializer);
    return new TransactionArgumentVariantAddress(value);
  }
}

export class TransactionArgumentVariantU8Vector extends TransactionArgument {
  constructor(public readonly value: Uint8Array) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(4);
    serializer.serializeBytes(this.value);
  }

  static load(deserializer: Deserializer): TransactionArgumentVariantU8Vector {
    const value = deserializer.deserializeBytes();
    return new TransactionArgumentVariantU8Vector(value);
  }
}

export class TransactionArgumentVariantBool extends TransactionArgument {
  constructor(public readonly value: boolean) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(5);
    serializer.serializeBool(this.value);
  }

  static load(deserializer: Deserializer): TransactionArgumentVariantBool {
    const value = deserializer.deserializeBool();
    return new TransactionArgumentVariantBool(value);
  }
}
