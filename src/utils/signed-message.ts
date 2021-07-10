import * as ed from '@starcoin/stc-ed25519';
import { arrayify, hexlify } from '@ethersproject/bytes';
import { BcsSerializer, BcsDeserializer } from '../lib/runtime/bcs';
import { createSigningMessageHasher } from "../crypto_hash";
import {
  Ed25519PublicKey, Ed25519Signature, TransactionAuthenticator, TransactionAuthenticatorVariantEd25519,
  SignedMessage, SigningMessage
} from '../lib/runtime/starcoin_types';
import { bytes } from '../lib/runtime/serde/types';
import { privateKeyToPublicKey, publicKeyToAuthKey, publicKeyToAddress, addressToSCS } from "../encoding";

export function encodeTransactionAuthenticatorEd25519(signatureBytes: bytes, publicKeyBytes: bytes): TransactionAuthenticatorVariantEd25519 {
  const ed25519PublicKey = new Ed25519PublicKey(publicKeyBytes)
  const ed25519Signature = new Ed25519Signature(signatureBytes)
  const authenticatorEd25519 = new TransactionAuthenticatorVariantEd25519(ed25519PublicKey, ed25519Signature)
  return authenticatorEd25519;
}

async function getSignatureBytes(
  signingMessage: SigningMessage,
  privateKeyBytes: bytes,
): Promise<bytes> {

  const hasher = createSigningMessageHasher();
  const hashSeedBytes = hasher.get_salt();

  const signingMessageBytes = (function () {
    const se = new BcsSerializer();
    signingMessage.serialize(se);
    return se.getBytes();
  })();

  const msgBytes = ((a, b) => {
    const tmp = new Uint8Array(a.length + b.length);
    tmp.set(a, 0);
    tmp.set(b, a.length);
    return tmp;
  })(hashSeedBytes, signingMessageBytes);

  const signatureBytes = await ed.sign(msgBytes, privateKeyBytes)

  return signatureBytes
}

export async function generateSignedMessage(rawMsgBytes: bytes, privateKeyBytes: bytes): Promise<SignedMessage> {
  const publicKeyBytes = await ed.getPublicKey(privateKeyBytes);
  const addressHex = publicKeyToAddress(hexlify(publicKeyBytes))

  const accountAddress = addressToSCS(addressHex)

  const signingMessage = new SigningMessage(rawMsgBytes);

  const signatureBytes = await getSignatureBytes(signingMessage, privateKeyBytes)
  console.log({ signatureBytes })
  console.log('signatureHex', hexlify(signatureBytes))
  const transactionAuthenticatorEd25519 = encodeTransactionAuthenticatorEd25519(signatureBytes, publicKeyBytes);
  console.log({ transactionAuthenticatorEd25519 })
  console.log('public_key', transactionAuthenticatorEd25519.public_key)
  console.log('signature', transactionAuthenticatorEd25519.signature)


  const signedMessage = new SignedMessage(accountAddress, signingMessage, transactionAuthenticatorEd25519)

  return Promise.resolve(signedMessage);
}

export async function encodeSignedMessage(msgBytes: bytes, privateKeyBytes: bytes): Promise<string> {
  const signedMessage = await generateSignedMessage(msgBytes, privateKeyBytes)

  const se = new BcsSerializer();
  signedMessage.serialize(se);

  const signedMessageHex = hexlify(se.getBytes());
  return Promise.resolve(signedMessageHex);
}

// export function verifyPersonalMessage(signature: string, msgBytes: bytes, publicKeyBytes: bytes): Promise<boolean> {
//   const transactionAuthenticatorHex = encodeTransactionAuthenticator(msgBytes, publicKeyBytes)
//   return ed.verify(signature, transactionAuthenticatorHex, publicKeyBytes);
// }