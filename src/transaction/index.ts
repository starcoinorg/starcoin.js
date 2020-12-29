import { arrayify, BytesLike, hexlify } from "@ethersproject/bytes";

import { createHash, CryptoHash } from "../crypto_hash";
import { LcsDeserializer, LcsSerializer } from "../lib/runtime/lcs";
import {
  SignedUserTransaction,
  TransactionAuthenticatorVariantEd25519,
  TransactionAuthenticatorVariantMultiEd25519,
} from "../lib/runtime/starcoin_types";
import {
  AccountAddress,
  HashValue,
  HexString,
  TransactionAuthenticator,
  U64,
  U8,
} from "../types";
import { decodeAddress } from "../utils/lcs-to-json";

export function createUserTransactionHasher(): CryptoHash {
  return createHash("SignedUserTransaction");
}
export interface RawUserTransactionView {
  /// Sender's address.
  sender: AccountAddress;
  // Sequence number of this transaction corresponding to sender's account.
  sequence_number: U64;
  // The transaction script to execute.
  payload: HexString;

  // Maximal total gas specified by wallet to spend for this transaction.
  max_gas_amount: U64;
  // Maximal price can be paid per gas.
  gas_unit_price: U64;
  // The token code for pay transaction gas, Default is STC token code.
  gas_token_code: string;
  // Expiration timestamp for this transaction. timestamp is represented
  // as u64 in seconds from Unix Epoch. If storage is queried and
  // the time returned is greater than or equal to this time and this
  // transaction has not been included, you can be certain that it will
  // never be included.
  // A transaction that doesn't expire is represented by a very large value like
  // u64::max_value().
  expiration_timestamp_secs: U64;
  chain_id: U8;
}

export interface SignedUserTransactionView {
  transaction_hash: HashValue;
  raw_txn: RawUserTransactionView;
  authenticator: TransactionAuthenticator;
}

export function parseUserTransaction(
  data: BytesLike
): SignedUserTransactionView {
  const bytes = arrayify(data);
  const scsData = (function () {
    const se = new LcsDeserializer(bytes);
    return SignedUserTransaction.deserialize(se);
  })();

  let authenticator = null;
  if (scsData.authenticator instanceof TransactionAuthenticatorVariantEd25519) {
    const publicKey = hexlify(scsData.authenticator.public_key.value);
    const signature = hexlify(scsData.authenticator.signature.value);
    authenticator = { Ed25519: { public_key: publicKey, signature } };
  } else {
    const auth = scsData.authenticator as TransactionAuthenticatorVariantMultiEd25519;
    const publicKey = hexlify(auth.public_key.value);
    const signature = hexlify(auth.signature.value);
    authenticator = { MultiEd25519: { public_key: publicKey, signature } };
  }
  const rawTxn = scsData.raw_txn;
  const payload = (function () {
    const se = new LcsSerializer();
    rawTxn.payload.serialize(se);
    return hexlify(se.getBytes());
  })();
  return {
    transaction_hash: createUserTransactionHasher().crypto_hash(bytes),
    raw_txn: {
      sender: decodeAddress(rawTxn.sender),
      sequence_number: rawTxn.sequence_number,
      payload: payload,
      max_gas_amount: rawTxn.max_gas_amount,
      gas_unit_price: rawTxn.gas_unit_price,
      gas_token_code: rawTxn.gas_token_code,
      expiration_timestamp_secs: rawTxn.expiration_timestamp_secs,
      chain_id: rawTxn.chain_id.id,
    },
    authenticator,
  };
}
