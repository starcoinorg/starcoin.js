import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { StructTag } from './StructTag';
import { TraitHelpers } from './traitHelpers';
export abstract class TypeTag {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): TypeTag {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return TypeTagVariantBool.load(deserializer);
      case 1:
        return TypeTagVariantU8.load(deserializer);
      case 2:
        return TypeTagVariantU64.load(deserializer);
      case 3:
        return TypeTagVariantU128.load(deserializer);
      case 4:
        return TypeTagVariantAddress.load(deserializer);
      case 5:
        return TypeTagVariantSigner.load(deserializer);
      case 6:
        return TypeTagVariantVector.load(deserializer);
      case 7:
        return TypeTagVariantStruct.load(deserializer);
      default:
        throw new Error('Unknown variant index for TypeTag: ' + index);
    }
  }
}

export class TypeTagVariantBool extends TypeTag {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
  }

  static load(deserializer: Deserializer): TypeTagVariantBool {
    return new TypeTagVariantBool();
  }
}

export class TypeTagVariantU8 extends TypeTag {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
  }

  static load(deserializer: Deserializer): TypeTagVariantU8 {
    return new TypeTagVariantU8();
  }
}

export class TypeTagVariantU64 extends TypeTag {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(2);
  }

  static load(deserializer: Deserializer): TypeTagVariantU64 {
    return new TypeTagVariantU64();
  }
}

export class TypeTagVariantU128 extends TypeTag {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(3);
  }

  static load(deserializer: Deserializer): TypeTagVariantU128 {
    return new TypeTagVariantU128();
  }
}

export class TypeTagVariantAddress extends TypeTag {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(4);
  }

  static load(deserializer: Deserializer): TypeTagVariantAddress {
    return new TypeTagVariantAddress();
  }
}

export class TypeTagVariantSigner extends TypeTag {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(5);
  }

  static load(deserializer: Deserializer): TypeTagVariantSigner {
    return new TypeTagVariantSigner();
  }
}

export class TypeTagVariantVector extends TypeTag {
  constructor(public readonly value: TypeTag) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(6);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): TypeTagVariantVector {
    const value = TypeTag.deserialize(deserializer);
    return new TypeTagVariantVector(value);
  }
}

export class TypeTagVariantStruct extends TypeTag {
  constructor(public readonly value: StructTag) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(7);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): TypeTagVariantStruct {
    const value = StructTag.deserialize(deserializer);
    return new TypeTagVariantStruct(value);
  }
}
