import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { TraitHelpers } from './traitHelpers';
export abstract class Transaction {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): Transaction {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return TransactionVariantUserTransaction.load(deserializer);
      case 1:
        return TransactionVariantBlockMetadata.load(deserializer);
      default:
        throw new Error('Unknown variant index for Transaction: ' + index);
    }
  }
}

import { SignedUserTransaction } from './SignedUserTransaction';

export class TransactionVariantUserTransaction extends Transaction {
  constructor(public readonly value: SignedUserTransaction) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): TransactionVariantUserTransaction {
    const value = SignedUserTransaction.deserialize(deserializer);
    return new TransactionVariantUserTransaction(value);
  }
}
import { BlockMetadata } from './BlockMetadata';

export class TransactionVariantBlockMetadata extends Transaction {
  constructor(public readonly value: BlockMetadata) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
    this.value.serialize(serializer);
  }

  static load(deserializer: Deserializer): TransactionVariantBlockMetadata {
    const value = BlockMetadata.deserialize(deserializer);
    return new TransactionVariantBlockMetadata(value);
  }
}
