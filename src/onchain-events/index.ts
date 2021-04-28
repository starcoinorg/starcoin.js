import {
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
import { uint128, uint8 } from '../lib/runtime/serde';
import { addressFromSCS } from '../encoding';
import * as onchain_events from '../lib/runtime/onchain_events';

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
