import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { TraitHelpers } from './traitHelpers';
export abstract class Kind {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): Kind {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return KindVariantnewHeads.load(deserializer);
      case 1:
        return KindVariantevents.load(deserializer);
      case 2:
        return KindVariantnewPendingTransactions.load(deserializer);
      case 3:
        return KindVariantnewMintBlock.load(deserializer);
      default:
        throw new Error('Unknown variant index for Kind: ' + index);
    }
  }
}

export class KindVariantnewHeads extends Kind {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
  }

  static load(deserializer: Deserializer): KindVariantnewHeads {
    return new KindVariantnewHeads();
  }
}

export class KindVariantevents extends Kind {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
  }

  static load(deserializer: Deserializer): KindVariantevents {
    return new KindVariantevents();
  }
}

export class KindVariantnewPendingTransactions extends Kind {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(2);
  }

  static load(deserializer: Deserializer): KindVariantnewPendingTransactions {
    return new KindVariantnewPendingTransactions();
  }
}

export class KindVariantnewMintBlock extends Kind {
  constructor() {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(3);
  }

  static load(deserializer: Deserializer): KindVariantnewMintBlock {
    return new KindVariantnewMintBlock();
  }
}
