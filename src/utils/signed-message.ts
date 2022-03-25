import * as ed from '@noble/ed25519';
import { addHexPrefix, stripHexPrefix } from 'ethereumjs-util';
import { arrayify, hexlify, BytesLike } from '@ethersproject/bytes';
import { BcsSerializer, BcsDeserializer } from '../lib/runtime/bcs';
import { createSigningMessageHasher } from "../crypto_hash";
import {
  Ed25519PublicKey, Ed25519Signature, TransactionAuthenticator,
  TransactionAuthenticatorVariantEd25519, TransactionAuthenticatorVariantMultiEd25519,
  SignedMessage, SigningMessage, AccountAddress, ChainId
} from '../lib/runtime/starcoin_types';
import { bytes, uint8 } from '../lib/runtime/serde/types';
import { privateKeyToPublicKey, publicKeyToAuthKey, publicKeyToAddress, addressToSCS, addressFromSCS, bcsEncode } from "../encoding";

export function encodeTransactionAuthenticatorEd25519(signatureBytes: bytes, publicKeyBytes: bytes): TransactionAuthenticatorVariantEd25519 {
  const ed25519PublicKey = new Ed25519PublicKey(publicKeyBytes)
  const ed25519Signature = new Ed25519Signature(signatureBytes)
  const authenticatorEd25519 = new TransactionAuthenticatorVariantEd25519(ed25519PublicKey, ed25519Signature)
  return authenticatorEd25519;
}

export function getEd25519SignMsgBytes(
  signingMessage: SigningMessage,
): bytes {
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

  return msgBytes;
}

// simulate OneKeyConnect.starcoinSignMessage with the same response payload
export async function signMessage(msg: string, privateKeyHex: string): Promise<Record<string, string>> {
  const msgBytes = new Uint8Array(Buffer.from(msg, 'utf8'))
  const signingMessage = new SigningMessage(msgBytes);
  const signingMessageBytes = getEd25519SignMsgBytes(signingMessage)
  const publicKeyBytes = await ed.getPublicKey(stripHexPrefix(privateKeyHex));
  const publicKeyHex = hexlify(publicKeyBytes)
  const signatureBytes = await ed.sign(signingMessageBytes, stripHexPrefix(privateKeyHex))
  const signatureHex = hexlify(signatureBytes)
  return Promise.resolve({ publicKey: publicKeyHex, signature: signatureHex })
}

export async function generateSignedMessage(signingMessage: SigningMessage, id: uint8, publicKeyHex: string, signatureHex: string): Promise<string> {
  const publicKeyBytes = arrayify(addHexPrefix(publicKeyHex))
  const addressHex = publicKeyToAddress(publicKeyHex)
  const accountAddress = addressToSCS(addressHex)
  const signatureBytes = arrayify(addHexPrefix(signatureHex))
  const transactionAuthenticatorEd25519 = encodeTransactionAuthenticatorEd25519(signatureBytes, publicKeyBytes);
  const chainId = new ChainId(id);
  const signedMessage = new SignedMessage(accountAddress, signingMessage, transactionAuthenticatorEd25519, chainId)

  const signedMessageBytes = bcsEncode(signedMessage);
  const signedMessageHex = hexlify(signedMessageBytes);
  return Promise.resolve(signedMessageHex);
}

export async function encodeSignedMessage(msg: string, privateKeyBytes: bytes, chainId: uint8): Promise<string> {
  const msgBytes = new Uint8Array(Buffer.from(msg, 'utf8'))
  const signingMessage = new SigningMessage(msgBytes);
  const { publicKey, signature } = await signMessage(msg, hexlify(privateKeyBytes))

  const signedMessageHex = await generateSignedMessage(signingMessage, chainId, publicKey, signature)
  return Promise.resolve(signedMessageHex);
}

export function decodeSignedMessage(
  data: BytesLike
): SignedMessage {
  const dataBytes = arrayify(data);
  const scsData = (function () {
    const de = new BcsDeserializer(dataBytes);
    return SignedMessage.deserialize(de);
  })();
  return scsData;
}

export async function recoverSignedMessageAddress(signedMessageHex: string): Promise<string> {
  const signedMessage = decodeSignedMessage(signedMessageHex)

  // const rawMessageBytes = signedMessage.message.message
  // const rawMessageHex = hexlify(rawMessageBytes)
  // const rawMessage = Buffer.from(stripHexPrefix(rawMessageHex), 'hex').toString('utf8')

  let address

  if (signedMessage.authenticator instanceof TransactionAuthenticatorVariantEd25519) {
    const signatureBytes = signedMessage.authenticator.signature.value;
    const msgBytes = getEd25519SignMsgBytes(signedMessage.message);
    const publicKeyBytes = signedMessage.authenticator.public_key.value;
    address = publicKeyToAddress(hexlify(publicKeyBytes));
    const isSigned = await ed.verify(signatureBytes, msgBytes, publicKeyBytes);
    if (!isSigned) {
      throw new Error('Failed verify signature and message')
    }
    const isOk = checkAccount(publicKeyBytes, signedMessage.account)
    if (!isOk) {
      throw new Error('Failed: address are not match')
    }
  }
  return Promise.resolve(address)
}

// TODO: check onchain authkey using chain_id
function checkAccount(publicKeyBytes: bytes, accountAddress: AccountAddress): boolean {
  const address = publicKeyToAddress(hexlify(publicKeyBytes));
  if (address === addressFromSCS(accountAddress)) {
    return true;
  }
  return false;
}