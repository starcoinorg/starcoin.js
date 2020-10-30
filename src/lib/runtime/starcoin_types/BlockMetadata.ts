import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { AccountAddress } from './AccountAddress';
import { ChainId } from './ChainId';
import { HashValue } from './HashValue';
import { TraitHelpers } from './traitHelpers';
import { OptionalEd25519PublicKey } from './traitHelpers';
export class BlockMetadata {
  constructor(
    public readonly parent_hash: HashValue,
    public readonly timestamp: Uint64LE,
    public readonly author: AccountAddress,
    public readonly author_public_key: OptionalEd25519PublicKey,
    public readonly uncles: Uint64LE,
    public readonly number: Uint64LE,
    public readonly chain_id: ChainId
  ) {}

  public serialize(serializer: Serializer): void {
    this.parent_hash.serialize(serializer);
    serializer.serializeU64(this.timestamp);
    this.author.serialize(serializer);
    TraitHelpers.serializeOptionalEd25519PublicKey(
      this.author_public_key,
      serializer
    );
    serializer.serializeU64(this.uncles);
    serializer.serializeU64(this.number);
    this.chain_id.serialize(serializer);
  }

  static deserialize(deserializer: Deserializer): BlockMetadata {
    const parent_hash = HashValue.deserialize(deserializer);
    const timestamp = deserializer.deserializeU64();
    const author = AccountAddress.deserialize(deserializer);
    const author_public_key = TraitHelpers.deserializeOptionalEd25519PublicKey(
      deserializer
    );
    const uncles = deserializer.deserializeU64();
    const number = deserializer.deserializeU64();
    const chain_id = ChainId.deserialize(deserializer);
    return new BlockMetadata(
      parent_hash,
      timestamp,
      author,
      author_public_key,
      uncles,
      number,
      chain_id
    );
  }
}
