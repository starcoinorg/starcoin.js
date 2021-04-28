
import { Serializer } from '../serde/serializer';
import { Deserializer } from '../serde/deserializer';
import { Optional, Seq, Tuple, ListTuple, unit, bool, int8, int16, int32, int64, int128, uint8, uint16, uint32, uint64, uint128, float32, float64, char, str, bytes} from '../serde/types';

export class AcceptTokenEvent {

constructor (public token_code: TokenCode) {
}

public serialize(serializer: Serializer): void {
  this.token_code.serialize(serializer);
}

static deserialize(deserializer: Deserializer): AcceptTokenEvent {
  const token_code = TokenCode.deserialize(deserializer);
  return new AcceptTokenEvent(token_code);
}

}
export class AccountAddress {

constructor (public value: ListTuple<[uint8]>) {
}

public serialize(serializer: Serializer): void {
  Helpers.serializeArray16U8Array(this.value, serializer);
}

static deserialize(deserializer: Deserializer): AccountAddress {
  const value = Helpers.deserializeArray16U8Array(deserializer);
  return new AccountAddress(value);
}

}
export class BlockRewardEvent {

constructor (public block_number: uint64, public block_reward: uint128, public gas_fees: uint128, public miner: AccountAddress) {
}

public serialize(serializer: Serializer): void {
  serializer.serializeU64(this.block_number);
  serializer.serializeU128(this.block_reward);
  serializer.serializeU128(this.gas_fees);
  this.miner.serialize(serializer);
}

static deserialize(deserializer: Deserializer): BlockRewardEvent {
  const block_number = deserializer.deserializeU64();
  const block_reward = deserializer.deserializeU128();
  const gas_fees = deserializer.deserializeU128();
  const miner = AccountAddress.deserialize(deserializer);
  return new BlockRewardEvent(block_number,block_reward,gas_fees,miner);
}

}
export class BurnEvent {

constructor (public amount: uint128, public token_code: TokenCode) {
}

public serialize(serializer: Serializer): void {
  serializer.serializeU128(this.amount);
  this.token_code.serialize(serializer);
}

static deserialize(deserializer: Deserializer): BurnEvent {
  const amount = deserializer.deserializeU128();
  const token_code = TokenCode.deserialize(deserializer);
  return new BurnEvent(amount,token_code);
}

}
export class DepositEvent {

constructor (public amount: uint128, public token_code: TokenCode, public metadata: Seq<uint8>) {
}

public serialize(serializer: Serializer): void {
  serializer.serializeU128(this.amount);
  this.token_code.serialize(serializer);
  Helpers.serializeVectorU8(this.metadata, serializer);
}

static deserialize(deserializer: Deserializer): DepositEvent {
  const amount = deserializer.deserializeU128();
  const token_code = TokenCode.deserialize(deserializer);
  const metadata = Helpers.deserializeVectorU8(deserializer);
  return new DepositEvent(amount,token_code,metadata);
}

}
export class MintEvent {

constructor (public amount: uint128, public token_code: TokenCode) {
}

public serialize(serializer: Serializer): void {
  serializer.serializeU128(this.amount);
  this.token_code.serialize(serializer);
}

static deserialize(deserializer: Deserializer): MintEvent {
  const amount = deserializer.deserializeU128();
  const token_code = TokenCode.deserialize(deserializer);
  return new MintEvent(amount,token_code);
}

}
export class NewBlockEvent {

constructor (public number: uint64, public author: AccountAddress, public timestamp: uint64, public uncles: uint64) {
}

public serialize(serializer: Serializer): void {
  serializer.serializeU64(this.number);
  this.author.serialize(serializer);
  serializer.serializeU64(this.timestamp);
  serializer.serializeU64(this.uncles);
}

static deserialize(deserializer: Deserializer): NewBlockEvent {
  const number = deserializer.deserializeU64();
  const author = AccountAddress.deserialize(deserializer);
  const timestamp = deserializer.deserializeU64();
  const uncles = deserializer.deserializeU64();
  return new NewBlockEvent(number,author,timestamp,uncles);
}

}
export class ProposalCreatedEvent {

constructor (public proposal_id: uint64, public proposer: AccountAddress) {
}

public serialize(serializer: Serializer): void {
  serializer.serializeU64(this.proposal_id);
  this.proposer.serialize(serializer);
}

static deserialize(deserializer: Deserializer): ProposalCreatedEvent {
  const proposal_id = deserializer.deserializeU64();
  const proposer = AccountAddress.deserialize(deserializer);
  return new ProposalCreatedEvent(proposal_id,proposer);
}

}
export class TokenCode {

constructor (public address: AccountAddress, public module: str, public name: str) {
}

public serialize(serializer: Serializer): void {
  this.address.serialize(serializer);
  serializer.serializeStr(this.module);
  serializer.serializeStr(this.name);
}

static deserialize(deserializer: Deserializer): TokenCode {
  const address = AccountAddress.deserialize(deserializer);
  const module = deserializer.deserializeStr();
  const name = deserializer.deserializeStr();
  return new TokenCode(address,module,name);
}

}
export class VoteChangedEvent {

constructor (public proposal_id: uint64, public proposer: AccountAddress, public voter: AccountAddress, public agree: bool, public vote: uint128) {
}

public serialize(serializer: Serializer): void {
  serializer.serializeU64(this.proposal_id);
  this.proposer.serialize(serializer);
  this.voter.serialize(serializer);
  serializer.serializeBool(this.agree);
  serializer.serializeU128(this.vote);
}

static deserialize(deserializer: Deserializer): VoteChangedEvent {
  const proposal_id = deserializer.deserializeU64();
  const proposer = AccountAddress.deserialize(deserializer);
  const voter = AccountAddress.deserialize(deserializer);
  const agree = deserializer.deserializeBool();
  const vote = deserializer.deserializeU128();
  return new VoteChangedEvent(proposal_id,proposer,voter,agree,vote);
}

}
export class WithdrawEvent {

constructor (public amount: uint128, public token_code: TokenCode, public metadata: Seq<uint8>) {
}

public serialize(serializer: Serializer): void {
  serializer.serializeU128(this.amount);
  this.token_code.serialize(serializer);
  Helpers.serializeVectorU8(this.metadata, serializer);
}

static deserialize(deserializer: Deserializer): WithdrawEvent {
  const amount = deserializer.deserializeU128();
  const token_code = TokenCode.deserialize(deserializer);
  const metadata = Helpers.deserializeVectorU8(deserializer);
  return new WithdrawEvent(amount,token_code,metadata);
}

}
export class Helpers {
  static serializeArray16U8Array(value: ListTuple<[uint8]>, serializer: Serializer): void {
    value.forEach((item) =>{
        serializer.serializeU8(item[0]);
    });
  }

  static deserializeArray16U8Array(deserializer: Deserializer): ListTuple<[uint8]> {
    const list: ListTuple<[uint8]> = [];
    for (let i = 0; i < 16; i++) {
        list.push([deserializer.deserializeU8()]);
    }
    return list;
  }

  static serializeVectorU8(value: Seq<uint8>, serializer: Serializer): void {
    serializer.serializeLen(value.length);
    value.forEach((item: uint8) => {
        serializer.serializeU8(item);
    });
  }

  static deserializeVectorU8(deserializer: Deserializer): Seq<uint8> {
    const length = deserializer.deserializeLen();
    const list: Seq<uint8> = [];
    for (let i = 0; i < length; i++) {
        list.push(deserializer.deserializeU8());
    }
    return list;
  }

}

