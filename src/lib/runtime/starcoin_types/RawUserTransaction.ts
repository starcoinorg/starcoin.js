import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { AccountAddress } from './AccountAddress';
import { ChainId } from './ChainId';
import { TransactionPayload } from './TransactionPayload';
import { TraitHelpers } from './traitHelpers';
export class RawUserTransaction {
  constructor(
    public readonly sender: AccountAddress,
    public readonly sequence_number: Uint64LE,
    public readonly payload: TransactionPayload,
    public readonly max_gas_amount: Uint64LE,
    public readonly gas_unit_price: Uint64LE,
    public readonly gas_token_code: string,
    public readonly expiration_timestamp_secs: Uint64LE,
    public readonly chain_id: ChainId
  ) {}

  public serialize(serializer: Serializer): void {
    this.sender.serialize(serializer);
    serializer.serializeU64(this.sequence_number);
    this.payload.serialize(serializer);
    serializer.serializeU64(this.max_gas_amount);
    serializer.serializeU64(this.gas_unit_price);
    serializer.serializeStr(this.gas_token_code);
    serializer.serializeU64(this.expiration_timestamp_secs);
    this.chain_id.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): RawUserTransaction {
    const sender = AccountAddress.deserialize(deserializer);
    const sequence_number = deserializer.deserializeU64();
    const payload = TransactionPayload.deserialize(deserializer);
    const max_gas_amount = deserializer.deserializeU64();
    const gas_unit_price = deserializer.deserializeU64();
    const gas_token_code = deserializer.deserializeStr();
    const expiration_timestamp_secs = deserializer.deserializeU64();
    const chain_id = ChainId.deserialize(deserializer);
    return new RawUserTransaction(
      sender,
      sequence_number,
      payload,
      max_gas_amount,
      gas_unit_price,
      gas_token_code,
      expiration_timestamp_secs,
      chain_id
    );
  }
}
