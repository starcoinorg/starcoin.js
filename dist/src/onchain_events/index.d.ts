import { BytesLike } from '@ethersproject/bytes';
import { AccountAddress } from '../types';
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
export declare function decodeEventKey(eventKey: BytesLike): {
    address: AccountAddress;
    salt: BigInt;
};
export declare function decodeEventData(eventName: string, eventData: string): any;
