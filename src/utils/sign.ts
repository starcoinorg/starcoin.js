import { arrayify, hexlify } from '@ethersproject/bytes';
import { BcsSerializer, BcsDeserializer } from '../lib/runtime/bcs';
import { Ed25519PublicKey, Ed25519Signature, TransactionAuthenticator, TransactionAuthenticatorVariantEd25519 } from '../lib/runtime/starcoin_types';
import { bytes } from '../lib/runtime/serde/types';

export function encodeTransactionAuthenticator(publicKey: bytes, msgBytes: bytes): string {
  const ed25519PublicKey = new Ed25519PublicKey(publicKey)
  const ed25519Signature = new Ed25519Signature(msgBytes)
  const authenticatorEd25519 = new TransactionAuthenticatorVariantEd25519(ed25519PublicKey, ed25519Signature)
  // console.log(authenticatorEd25519)
  const se = new BcsSerializer();
  authenticatorEd25519.serialize(se);
  // console.log('se.getBytes():', se.getBytes())
  const hex = hexlify(se.getBytes());
  return hex;
}

export function decodeTransactionAuthenticator(signatureHex: string): { publicKey: bytes, signature: bytes } {
  const signatureBytes = arrayify(signatureHex)
  const de = new BcsDeserializer(signatureBytes);
  const authenticatorEd25519 = <TransactionAuthenticatorVariantEd25519>TransactionAuthenticator.deserialize(de);
  const publicKey = authenticatorEd25519.public_key.value
  const signature = authenticatorEd25519.signature.value
  return { publicKey, signature }
}

