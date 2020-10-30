import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { RawUserTransaction } from './RawUserTransaction';
import { TransactionAuthenticator } from './TransactionAuthenticator';
import { TraitHelpers } from './traitHelpers';
export class SignedUserTransaction {
  constructor(
    public readonly raw_txn: RawUserTransaction,
    public readonly authenticator: TransactionAuthenticator
  ) {}

  public serialize(serializer: Serializer): void {
    this.raw_txn.serialize(serializer);
    this.authenticator.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): SignedUserTransaction {
    const raw_txn = RawUserTransaction.deserialize(deserializer);
    const authenticator = TransactionAuthenticator.deserialize(deserializer);
    return new SignedUserTransaction(raw_txn, authenticator);
  }
}
