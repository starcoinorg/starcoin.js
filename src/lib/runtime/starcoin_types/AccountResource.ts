import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { EventHandle } from './EventHandle';
import { TraitHelpers } from './traitHelpers';
import { Listnumber } from './traitHelpers';
import { OptionalWithdrawCapabilityResource } from './traitHelpers';
import { OptionalKeyRotationCapabilityResource } from './traitHelpers';
export class AccountResource {
  constructor(
    public readonly authentication_key: Listnumber,
    public readonly withdrawal_capability: OptionalWithdrawCapabilityResource,
    public readonly key_rotation_capability: OptionalKeyRotationCapabilityResource,
    public readonly received_events: EventHandle,
    public readonly sent_events: EventHandle,
    public readonly accept_token_events: EventHandle,
    public readonly sequence_number: Uint64LE
  ) {}

  public serialize(serializer: Serializer): void {
    TraitHelpers.serializeListnumber(this.authentication_key, serializer);
    TraitHelpers.serializeOptionalWithdrawCapabilityResource(
      this.withdrawal_capability,
      serializer
    );
    TraitHelpers.serializeOptionalKeyRotationCapabilityResource(
      this.key_rotation_capability,
      serializer
    );
    this.received_events.serialize(serializer);
    this.sent_events.serialize(serializer);
    this.accept_token_events.serialize(serializer);
    serializer.serializeU64(this.sequence_number);
  }

  static deserialize(deserializer: Deserializer): AccountResource {
    const authentication_key = TraitHelpers.deserializeListnumber(deserializer);
    const withdrawal_capability = TraitHelpers.deserializeOptionalWithdrawCapabilityResource(
      deserializer
    );
    const key_rotation_capability = TraitHelpers.deserializeOptionalKeyRotationCapabilityResource(
      deserializer
    );
    const received_events = EventHandle.deserialize(deserializer);
    const sent_events = EventHandle.deserialize(deserializer);
    const accept_token_events = EventHandle.deserialize(deserializer);
    const sequence_number = deserializer.deserializeU64();
    return new AccountResource(
      authentication_key,
      withdrawal_capability,
      key_rotation_capability,
      received_events,
      sent_events,
      accept_token_events,
      sequence_number
    );
  }
}
