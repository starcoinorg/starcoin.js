import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { TraitHelpers } from './traitHelpers';
export abstract class TransactionPayload {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): TransactionPayload {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return TransactionPayloadVariantScript.load(deserializer);
      case 1:
        return TransactionPayloadVariantPackage.load(deserializer);
      default:
        throw new Error(
          'Unknown variant index for TransactionPayload: ' + index
        );
    }
  }
}

import { Script } from './Script';

export class TransactionPayloadVariantScript extends TransactionPayload {
  constructor(public readonly value: Script) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): TransactionPayloadVariantScript {
    const value = Script.deserialize(deserializer);
    return new TransactionPayloadVariantScript(value);
  }
}
import { Package } from './Package';

export class TransactionPayloadVariantPackage extends TransactionPayload {
  constructor(public readonly value: Package) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): TransactionPayloadVariantPackage {
    const value = Package.deserialize(deserializer);
    return new TransactionPayloadVariantPackage(value);
  }
}
