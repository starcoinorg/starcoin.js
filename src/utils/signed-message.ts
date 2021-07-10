import * as ed from '@starcoin/stc-ed25519';
import { stripHexPrefix } from 'ethereumjs-util';
import { arrayify, hexlify, BytesLike } from '@ethersproject/bytes';
import { BcsSerializer, BcsDeserializer } from '../lib/runtime/bcs';
import { createSigningMessageHasher } from "../crypto_hash";
import {
  Ed25519PublicKey, Ed25519Signature, TransactionAuthenticator,
  TransactionAuthenticatorVariantEd25519, TransactionAuthenticatorVariantMultiEd25519,
  SignedMessage, SigningMessage, AccountAddress
} from '../lib/runtime/starcoin_types';
import { bytes } from '../lib/runtime/serde/types';
import { privateKeyToPublicKey, publicKeyToAuthKey, publicKeyToAddress, addressToSCS, addressFromSCS } from "../encoding";

export function encodeTransactionAuthenticatorEd25519(signatureBytes: bytes, publicKeyBytes: bytes): TransactionAuthenticatorVariantEd25519 {
  const ed25519PublicKey = new Ed25519PublicKey(publicKeyBytes)
  const ed25519Signature = new Ed25519Signature(signatureBytes)
  const authenticatorEd25519 = new TransactionAuthenticatorVariantEd25519(ed25519PublicKey, ed25519Signature)
  return authenticatorEd25519;
}

function getEd25519SignMsgBytes(
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

async function getSignatureBytes(
  signingMessage: SigningMessage,
  privateKeyBytes: bytes,
): Promise<bytes> {

  const msgBytes = getEd25519SignMsgBytes(signingMessage)

  const signatureBytes = await ed.sign(msgBytes, privateKeyBytes)

  return signatureBytes
}

export async function generateSignedMessage(rawMsgBytes: bytes, privateKeyBytes: bytes): Promise<SignedMessage> {
  const publicKeyBytes = await ed.getPublicKey(privateKeyBytes);
  const addressHex = publicKeyToAddress(hexlify(publicKeyBytes))

  const accountAddress = addressToSCS(addressHex)

  const signingMessage = new SigningMessage(rawMsgBytes);

  const signatureBytes = await getSignatureBytes(signingMessage, privateKeyBytes)

  const transactionAuthenticatorEd25519 = encodeTransactionAuthenticatorEd25519(signatureBytes, publicKeyBytes);

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

export function decodeSignedMessage(
  data: BytesLike
): SignedMessage {
  const dataBytes = arrayify(data);
  const scsData = (function () {
    const de = new BcsDeserializer(dataBytes);
    return SignedMessage.deserialize(de);
  })();

  return scsData;

  // let authenticator;
  // if (
  //   scsData.authenticator instanceof TransactionAuthenticatorVariantEd25519
  // ) {
  //   const publicKey = hexlify(scsData.authenticator.public_key.value);
  //   const signature = hexlify(scsData.authenticator.signature.value);
  //   authenticator = { Ed25519: { public_key: publicKey, signature } };
  // } else {
  //   const auth = scsData.authenticator as TransactionAuthenticatorVariantMultiEd25519;
  //   const publicKey = hexlify(auth.public_key.value);
  //   const signature = hexlify(auth.signature.value);
  //   authenticator = { MultiEd25519: { public_key: publicKey, signature } };
  // }
  // const rawTxn = scsData.raw_txn;
  // const payload = (function () {
  //   const se = new BcsSerializer();
  //   rawTxn.payload.serialize(se);
  //   return hexlify(se.getBytes());
  // })();
  // return {
  //   transaction_hash: createUserTransactionHasher().crypto_hash(bytes),
  //   raw_txn: {
  //     sender: addressFromSCS(rawTxn.sender),
  //     sequence_number: rawTxn.sequence_number,
  //     payload,
  //     max_gas_amount: rawTxn.max_gas_amount,
  //     gas_unit_price: rawTxn.gas_unit_price,
  //     gas_token_code: rawTxn.gas_token_code,
  //     expiration_timestamp_secs: rawTxn.expiration_timestamp_secs,
  //     chain_id: rawTxn.chain_id.id,
  //   },
  //   authenticator,
  // };
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

function checkAccount(publicKeyBytes: bytes, accountAddress: AccountAddress): boolean {
  const address = publicKeyToAddress(hexlify(publicKeyBytes));
  if (address === addressFromSCS(accountAddress)) {
    return true;
  }
  return false;
}