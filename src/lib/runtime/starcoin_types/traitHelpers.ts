import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

import { AccessPath } from './AccessPath';
import { Ed25519PublicKey } from './Ed25519PublicKey';
import { KeyRotationCapabilityResource } from './KeyRotationCapabilityResource';
import { Module } from './Module';
export type ListModule = readonly Module[];
import { TransactionArgument } from './TransactionArgument';
export type ListTransactionArgument = readonly TransactionArgument[];
export type ListTupleAccessPathWriteOp = readonly TupleAccessPathWriteOp[];
export type ListTuplenumber = readonly number[];
import { TypeTag } from './TypeTag';
export type ListTypeTag = readonly TypeTag[];
export type Listnumber = readonly number[];
export type OptionalEd25519PublicKey = Ed25519PublicKey | null;
export type OptionalKeyRotationCapabilityResource = KeyRotationCapabilityResource | null;
import { Script } from './Script';
export type OptionalScript = Script | null;
import { WithdrawCapabilityResource } from './WithdrawCapabilityResource';
export type OptionalWithdrawCapabilityResource = WithdrawCapabilityResource | null;
import { WriteOp } from './WriteOp';
export type TupleAccessPathWriteOp = readonly [AccessPath, WriteOp];
export class TraitHelpers {
  static serializeListModule(value: ListModule, serializer: Serializer): void {
    serializer.serializeLen(value.length);
    value.forEach((item: Module) => {
      item.serialize(serializer);
    });
  }

  static deserializeListModule(deserializer: Deserializer): ListModule {
    const length = deserializer.deserializeLen();
    const list: ListModule = [];
    for (let i = 0; i < length; i++) {
      list.push(Module.deserialize(deserializer));
    }
    return list;
  }

  static serializeListTransactionArgument(
    value: ListTransactionArgument,
    serializer: Serializer
  ): void {
    serializer.serializeLen(value.length);
    value.forEach((item: TransactionArgument) => {
      item.serialize(serializer);
    });
  }

  static deserializeListTransactionArgument(
    deserializer: Deserializer
  ): ListTransactionArgument {
    const length = deserializer.deserializeLen();
    const list: ListTransactionArgument = [];
    for (let i = 0; i < length; i++) {
      list.push(TransactionArgument.deserialize(deserializer));
    }
    return list;
  }

  static serializeListTupleAccessPathWriteOp(
    value: ListTupleAccessPathWriteOp,
    serializer: Serializer
  ): void {
    serializer.serializeLen(value.length);
    value.forEach((item: TupleAccessPathWriteOp) => {
      TraitHelpers.serializeTupleAccessPathWriteOp(item, serializer);
    });
  }

  static deserializeListTupleAccessPathWriteOp(
    deserializer: Deserializer
  ): ListTupleAccessPathWriteOp {
    const length = deserializer.deserializeLen();
    const list: ListTupleAccessPathWriteOp = [];
    for (let i = 0; i < length; i++) {
      list.push(TraitHelpers.deserializeTupleAccessPathWriteOp(deserializer));
    }
    return list;
  }

  static serializeListTuplenumber(
    value: ListTuplenumber,
    serializer: Serializer
  ): void {
    value.forEach((item) => {
      serializer.serializeU8(item);
    });
  }

  static deserializeListTuplenumber(
    deserializer: Deserializer
  ): ListTuplenumber {
    const list: ListTuplenumber = [];
    for (let i = 0; i < 16; i++) {
      list.push(deserializer.deserializeU8());
    }
    return list;
  }

  static serializeListTypeTag(
    value: ListTypeTag,
    serializer: Serializer
  ): void {
    serializer.serializeLen(value.length);
    value.forEach((item: TypeTag) => {
      item.serialize(serializer);
    });
  }

  static deserializeListTypeTag(deserializer: Deserializer): ListTypeTag {
    const length = deserializer.deserializeLen();
    const list: ListTypeTag = [];
    for (let i = 0; i < length; i++) {
      list.push(TypeTag.deserialize(deserializer));
    }
    return list;
  }

  static serializeListnumber(value: Listnumber, serializer: Serializer): void {
    serializer.serializeLen(value.length);
    value.forEach((item: number) => {
      serializer.serializeU8(item);
    });
  }

  static deserializeListnumber(deserializer: Deserializer): Listnumber {
    const length = deserializer.deserializeLen();
    const list: Listnumber = [];
    for (let i = 0; i < length; i++) {
      list.push(deserializer.deserializeU8());
    }
    return list;
  }

  static serializeOptionalEd25519PublicKey(
    value: OptionalEd25519PublicKey,
    serializer: Serializer
  ): void {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  }

  static deserializeOptionalEd25519PublicKey(
    deserializer: Deserializer
  ): OptionalEd25519PublicKey {
    const tag = deserializer.deserializeOptionTag();
    if (!tag) {
      return null;
    } else {
      return Ed25519PublicKey.deserialize(deserializer);
    }
  }

  static serializeOptionalKeyRotationCapabilityResource(
    value: OptionalKeyRotationCapabilityResource,
    serializer: Serializer
  ): void {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  }

  static deserializeOptionalKeyRotationCapabilityResource(
    deserializer: Deserializer
  ): OptionalKeyRotationCapabilityResource {
    const tag = deserializer.deserializeOptionTag();
    if (!tag) {
      return null;
    } else {
      return KeyRotationCapabilityResource.deserialize(deserializer);
    }
  }

  static serializeOptionalScript(
    value: OptionalScript,
    serializer: Serializer
  ): void {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  }

  static deserializeOptionalScript(deserializer: Deserializer): OptionalScript {
    const tag = deserializer.deserializeOptionTag();
    if (!tag) {
      return null;
    } else {
      return Script.deserialize(deserializer);
    }
  }

  static serializeOptionalWithdrawCapabilityResource(
    value: OptionalWithdrawCapabilityResource,
    serializer: Serializer
  ): void {
    if (value) {
      serializer.serializeOptionTag(true);
      value.serialize(serializer);
    } else {
      serializer.serializeOptionTag(false);
    }
  }

  static deserializeOptionalWithdrawCapabilityResource(
    deserializer: Deserializer
  ): OptionalWithdrawCapabilityResource {
    const tag = deserializer.deserializeOptionTag();
    if (!tag) {
      return null;
    } else {
      return WithdrawCapabilityResource.deserialize(deserializer);
    }
  }

  static serializeTupleAccessPathWriteOp(
    value: TupleAccessPathWriteOp,
    serializer: Serializer
  ): void {
    value[0].serialize(serializer);
    value[1].serialize(serializer);
  }

  static deserializeTupleAccessPathWriteOp(
    deserializer: Deserializer
  ): TupleAccessPathWriteOp {
    return [
      AccessPath.deserialize(deserializer),
      WriteOp.deserialize(deserializer),
    ];
  }
}
