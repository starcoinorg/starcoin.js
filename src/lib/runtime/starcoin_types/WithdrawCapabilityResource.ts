import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { AccountAddress } from './AccountAddress';
import { TraitHelpers } from './traitHelpers';
export class WithdrawCapabilityResource {
  constructor(public readonly account_address: AccountAddress) {}

  public serialize(serializer: Serializer): void {
    this.account_address.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): WithdrawCapabilityResource {
    const account_address = AccountAddress.deserialize(deserializer);
    return new WithdrawCapabilityResource(account_address);
  }
}
