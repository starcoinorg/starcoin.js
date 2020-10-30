import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { TraitHelpers } from './traitHelpers';
export abstract class DataType {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): DataType {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return DataTypeVariantCODE.load(deserializer);
      case 1:
        return DataTypeVariantRESOURCE.load(deserializer);
      default:
        throw new Error('Unknown variant index for DataType: ' + index);
    }
  }
}

export class DataTypeVariantCODE extends DataType {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
  }

  static load(deserializer: Deserializer): DataTypeVariantCODE {
    return new DataTypeVariantCODE();
  }
}

export class DataTypeVariantRESOURCE extends DataType {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
  }

  static load(deserializer: Deserializer): DataTypeVariantRESOURCE {
    return new DataTypeVariantRESOURCE();
  }
}
