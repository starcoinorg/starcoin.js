import { BigNumber } from '@ethersproject/bignumber';
import bytes from '@ethersproject/bytes';
import { Int64LE, Uint64LE } from 'int64-buffer';

import { Deserializer } from '../serde/deserializer';
import { Serializer } from '../serde/serializer';

export abstract class TransactionAuthenticator {
  abstract serialize(serializer: Serializer): void;

  static deserialize(deserializer: Deserializer): TransactionAuthenticator {
    const index = deserializer.deserializeVariantIndex();
    switch (index) {
      case 0:
        return TransactionAuthenticatorVariantEd25519.load(deserializer);
      case 1:
        return TransactionAuthenticatorVariantMultiEd25519.load(deserializer);
      default:
        throw new Error(
          'Unknown variant index for TransactionAuthenticator: ' + index
        );
    }
  }
}

import { Ed25519PublicKey } from './Ed25519PublicKey';
import { Ed25519Signature } from './Ed25519Signature';

export class TransactionAuthenticatorVariantEd25519 extends TransactionAuthenticator {
  constructor(
    public readonly public_key: Ed25519PublicKey,
    public readonly signature: Ed25519Signature
  ) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(0);
    this.public_key.serialize(serializer);
    this.signature.serialize(serializer);
  }

  static load(
    deserializer: Deserializer
  ): TransactionAuthenticatorVariantEd25519 {
    const public_key = Ed25519PublicKey.deserialize(deserializer);
    const signature = Ed25519Signature.deserialize(deserializer);
    return new TransactionAuthenticatorVariantEd25519(public_key, signature);
  }
}
import { MultiEd25519PublicKey } from './MultiEd25519PublicKey';
import { MultiEd25519Signature } from './MultiEd25519Signature';
import { TraitHelpers } from './traitHelpers';

export class TransactionAuthenticatorVariantMultiEd25519 extends TransactionAuthenticator {
  constructor(
    public readonly public_key: MultiEd25519PublicKey,
    public readonly signature: MultiEd25519Signature
  ) {
    super();
  }

  public serialize(serializer: Serializer): void {
    serializer.serializeVariantIndex(1);
    this.public_key.serialize(serializer);
    this.signature.serialize(serializer);
  }

  static load(
    deserializer: Deserializer
  ): TransactionAuthenticatorVariantMultiEd25519 {
    const public_key = MultiEd25519PublicKey.deserialize(deserializer);
    const signature = MultiEd25519Signature.deserialize(deserializer);
    return new TransactionAuthenticatorVariantMultiEd25519(
      public_key,
      signature
    );
  }
}
