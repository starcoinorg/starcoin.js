import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { TraitHelpers } from './traitHelpers';
export abstract class ContractEvent {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): ContractEvent {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return ContractEventVariantV0.load(deserializer);
      default:
        throw new Error('Unknown variant index for ContractEvent: ' + index);
    }
  }
}

import { ContractEventV0 } from './ContractEventV0';

export class ContractEventVariantV0 extends ContractEvent {
  constructor(public readonly value: ContractEventV0) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): ContractEventVariantV0 {
    const value = ContractEventV0.deserialize(deserializer);
    return new ContractEventVariantV0(value);
  }
}
