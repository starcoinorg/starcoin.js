import { arrayify, BytesLike } from '@ethersproject/bytes';
import {
  AccountAddress,
  AcceptTokenEvent,
  BlockRewardEvent,
  BurnEvent,
  DepositEvent,
  MintEvent,
  NewBlockEvent,
  ProposalCreatedEvent,
  TokenCode,
  VoteChangedEvent,
  WithdrawEvent,
} from '../types';
import { addressFromSCS, bcsDecode } from '../encoding';
import { toHexString } from '../utils/hex';
import { uint128, uint8 } from '../lib/runtime/serde';
import * as onchain_events from '../lib/runtime/onchain_events';

const ACCOUNT_ADDRESS_LENGTH = 16;
const EVENT_KEY_LENGTH = ACCOUNT_ADDRESS_LENGTH + 8;

declare module '../lib/runtime/onchain_events' {
  interface TokenCode {
    toJS(): any;
  }
  interface AcceptTokenEvent {
    toJS(): any;
  }
  interface BlockRewardEvent {
    toJS(): any;
  }
  interface BurnEvent {
    toJS(): any;
  }
  interface MintEvent {
    toJS(): any;
  }
  interface DepositEvent {
    toJS(): any;
  }
  interface WithdrawEvent {
    toJS(): any;
  }
  interface NewBlockEvent {
    toJS(): any;
  }
  interface VoteChangedEvent {
    toJS(): any;
  }
  interface ProposalCreatedEvent {
    toJS(): any;
  }
}

onchain_events.TokenCode.prototype.toJS = function (): TokenCode {
  return {
    address: addressFromSCS(this.address),
    module: this.module,
    name: this.name,
  };
};

onchain_events.DepositEvent.prototype.toJS = function (): {
  amount: uint128;
  token_code: TokenCode;
  metadata: uint8[];
} {
  return {
    amount: this.amount,
    metadata: this.metadata,
    token_code: this.token_code.toJS(),
  };
};

onchain_events.AcceptTokenEvent.prototype.toJS = function (): AcceptTokenEvent {
  return { token_code: this.token_code.toJS() };
};

onchain_events.BlockRewardEvent.prototype.toJS = function (): BlockRewardEvent {
  return {
    block_number: this.block_number,
    block_reward: this.block_reward,
    gas_fees: this.gas_fees,
    miner: addressFromSCS(this.miner),
  };
};

onchain_events.BurnEvent.prototype.toJS = function (): BurnEvent {
  return {
    amount: this.amount,
    token_code: this.token_code.toJS(),
  };
};

onchain_events.MintEvent.prototype.toJS = function (): MintEvent {
  return {
    amount: this.amount,
    token_code: this.token_code.toJS(),
  };
};
onchain_events.NewBlockEvent.prototype.toJS = function (): NewBlockEvent {
  return {
    number: this.number,
    author: addressFromSCS(this.author),
    timestamp: this.timestamp,
    uncles: this.uncles,
  };
};
onchain_events.ProposalCreatedEvent.prototype.toJS = function (): ProposalCreatedEvent {
  return {
    proposal_id: this.proposal_id,
    proposer: addressFromSCS(this.proposer),
  };
};

onchain_events.VoteChangedEvent.prototype.toJS = function (): VoteChangedEvent {
  return {
    agree: this.agree,
    vote: this.vote,
    voter: addressFromSCS(this.voter),
    proposal_id: this.proposal_id,
    proposer: addressFromSCS(this.proposer),
  };
};

onchain_events.WithdrawEvent.prototype.toJS = function (): WithdrawEvent {
  return {
    amount: this.amount,
    metadata: this.metadata,
    token_code: this.token_code.toJS(),
  };
};
onchain_events.DepositEvent.prototype.toJS = function (): DepositEvent {
  return {
    amount: this.amount,
    metadata: this.metadata,
    token_code: this.token_code.toJS(),
  };
};

// Uint8Array is a general-purpose byte-array that’s available in both nodejs and browsers. 
// Buffer is a subclass of Uint8Array that’s only available in nodejs
// So we must use Uint8Array, instead of Buffer
// https://github.com/oBusk/read-bigint/blob/main/src/read-bigint-64-le.ts
function readBigInt64LE(data: Uint8Array, offset = 0): bigint {
  const first = data[offset] as number | undefined;
  const last = data[offset + 7] as number | undefined;
  const val =
    data[offset + 4] +
    data[offset + 5] * 2 ** 8 +
    data[offset + 6] * 2 ** 16 +
    (last << 24); // Overflow
  return (
    (BigInt(val) << BigInt(32)) +
    BigInt(
      first +
      data[++offset] * 2 ** 8 +
      data[++offset] * 2 ** 16 +
      data[++offset] * 2 ** 24,
    )
  );
}

/// Decode a hex view or raw bytes of event key into parts.
/// EventKey is constructed by `Salt+AccountAddress`.
export function decodeEventKey(
  eventKey: BytesLike
): { address: AccountAddress; salt: BigInt } {
  const bytes = arrayify(eventKey);
  if (bytes.byteLength !== EVENT_KEY_LENGTH) {
    throw new Error(
      `invalid eventkey data, expect byte length to be ${ EVENT_KEY_LENGTH }, actual: ${ bytes.byteLength }`
    );
  }
  const saltBytes = bytes.slice(0, EVENT_KEY_LENGTH - ACCOUNT_ADDRESS_LENGTH);
  const data = new Uint8Array(Buffer.from(saltBytes));
  const salt = readBigInt64LE(data);
  const addressBytes = bytes.slice(EVENT_KEY_LENGTH - ACCOUNT_ADDRESS_LENGTH);
  const address = toHexString(addressBytes);
  return { address, salt };
}

export function decodeEventData(eventName: string, eventData: string): any {
  const eventType = onchain_events[eventName];
  const d = bcsDecode(
    eventType,
    eventData
  );
  return d;
}