import { concat, arrayify, BytesLike, hexlify } from '@ethersproject/bytes';
import { addHexPrefix, stripHexPrefix } from 'ethereumjs-util';
import * as ed from '@starcoin/stc-ed25519';
import { sha3_256 } from 'js-sha3';
import { createUserTransactionHasher } from "../crypto_hash";
import { BcsDeserializer, BcsSerializer } from '../lib/runtime/bcs';
import * as starcoin_types from '../lib/runtime/starcoin_types';
import * as serde from '../lib/runtime/serde';
import {
  AccountAddress,
  SignedUserTransactionView,
  StructTag,
  TransactionPayload,
  TypeTag,
  ReceiptIdentifierView,
  U8,
  Ed25519PrivateKey,
  Ed25519PublicKey,
} from '../types';
import { fromHexString, toHexString } from '../utils/hex';
import { Deserializer } from '../lib/runtime/serde';

export interface SerdeSerializable {
  serialize(serializer: serde.Serializer): void;
}

export interface Deserializable<T> {
  deserialize(deserializer: Deserializer): T;
}

export function bcsDecode<D extends Deserializable<T>, T>(
  t: D,
  data: BytesLike
): T {
  const de = new BcsDeserializer(arrayify(data));
  return t.deserialize(de);
}

export function bcsEncode(data: SerdeSerializable): string {
  const se = new BcsSerializer();
  data.serialize(se);
  return toHexString(se.getBytes());
}

export function decodeSignedUserTransaction(
  data: BytesLike
): SignedUserTransactionView {
  const bytes = arrayify(data);
  const scsData = (function () {
    const de = new BcsDeserializer(bytes);
    return starcoin_types.SignedUserTransaction.deserialize(de);
  })();

  let authenticator;
  if (
    scsData.authenticator instanceof
    starcoin_types.TransactionAuthenticatorVariantEd25519
  ) {
    const publicKey = hexlify(scsData.authenticator.public_key.value);
    const signature = hexlify(scsData.authenticator.signature.value);
    authenticator = { Ed25519: { public_key: publicKey, signature } };
  } else {
    const auth = scsData.authenticator as starcoin_types.TransactionAuthenticatorVariantMultiEd25519;
    const publicKey = hexlify(auth.public_key.value);
    const signature = hexlify(auth.signature.value);
    authenticator = { MultiEd25519: { public_key: publicKey, signature } };
  }
  const rawTxn = scsData.raw_txn;
  const payload = (function () {
    const se = new BcsSerializer();
    rawTxn.payload.serialize(se);
    return hexlify(se.getBytes());
  })();
  return {
    transaction_hash: createUserTransactionHasher().crypto_hash(bytes),
    raw_txn: {
      sender: addressFromSCS(rawTxn.sender),
      sequence_number: rawTxn.sequence_number,
      payload,
      max_gas_amount: rawTxn.max_gas_amount,
      gas_unit_price: rawTxn.gas_unit_price,
      gas_token_code: rawTxn.gas_token_code,
      expiration_timestamp_secs: rawTxn.expiration_timestamp_secs,
      chain_id: rawTxn.chain_id.id,
    },
    authenticator,
  };
}

/// Decode a hex view or raw bytes of TransactionPayload into js struct.
export function decodeTransactionPayload(
  payload: BytesLike
): TransactionPayload {
  const bytes = arrayify(payload);
  const de = new BcsDeserializer(bytes);
  const bcsTxnPayload = starcoin_types.TransactionPayload.deserialize(de);
  if (bcsTxnPayload instanceof starcoin_types.TransactionPayloadVariantScript) {
    const script = bcsTxnPayload.value;
    return {
      Script: {
        code: toHexString(script.code),
        ty_args: script.ty_args.map((t) => typeTagFromSCS(t)),
        args: script.args.map((arg) => hexlify(arg)),
      },
    };
  }

  if (
    bcsTxnPayload instanceof
    starcoin_types.TransactionPayloadVariantScriptFunction
  ) {
    let scriptFunction = bcsTxnPayload.value;
    return {
      ScriptFunction: {
        func: {
          address: addressFromSCS(scriptFunction.module.address),
          module: scriptFunction.module.name.value,
          functionName: scriptFunction.func.value,
        },
        ty_args: scriptFunction.ty_args.map((t) => typeTagFromSCS(t)),
        args: scriptFunction.args.map((arg) => hexlify(arg)),
      },
    };
  }

  if (
    bcsTxnPayload instanceof starcoin_types.TransactionPayloadVariantPackage
  ) {
    const packagePayload = bcsTxnPayload.value;
    return {
      Package: {
        package_address: addressFromSCS(packagePayload.package_address),
        modules: packagePayload.modules.map((m) => ({
          code: toHexString(m.code),
        })),
        init_script:
          packagePayload.init_script === null
            ? undefined
            : {
              func: {
                address: addressFromSCS(
                  packagePayload.init_script.module.address
                ),
                module: packagePayload.init_script.module.name.value,
                functionName: packagePayload.init_script.func.value,
              },
              args: packagePayload.init_script.args.map((arg) =>
                hexlify(arg)
              ),
              ty_args: packagePayload.init_script.ty_args.map((ty) =>
                typeTagFromSCS(ty)
              ),
            },
      },
    };
  }

  throw new TypeError(`cannot decode bcs data ${ bcsTxnPayload }`);
}

export function packageHexToTransactionPayload(
  packageHex: string
): starcoin_types.TransactionPayload {
  const deserializer = new BcsDeserializer(arrayify(addHexPrefix(packageHex)))
  const transactionPayload = starcoin_types.TransactionPayloadVariantPackage.load(deserializer)
  return transactionPayload
}

export function packageHexToTransactionPayloadHex(
  packageHex: string
): string {
  const transactionPayload = packageHexToTransactionPayload(packageHex)
  return bcsEncode(transactionPayload)
}

export function addressToSCS(
  addr: AccountAddress
): starcoin_types.AccountAddress {
  // AccountAddress should be 16 bytes, in hex, it's 16 * 2.
  const bytes = fromHexString(addr, 16 * 2);
  return starcoin_types.AccountAddress.deserialize(new BcsDeserializer(bytes));
}

export function addressFromSCS(
  addr: starcoin_types.AccountAddress
): AccountAddress {
  return toHexString(addr.value.map(([t]) => t));
}

export function typeTagToSCS(ty: TypeTag): starcoin_types.TypeTag {
  if (ty === 'Bool') {
    return new starcoin_types.TypeTagVariantBool();
  }
  if (ty === 'U8') {
    return new starcoin_types.TypeTagVariantU8();
  }
  if (ty === 'U128') {
    return new starcoin_types.TypeTagVariantU128();
  }
  if (ty === 'U64') {
    return new starcoin_types.TypeTagVariantU64();
  }
  if (ty === 'Address') {
    return new starcoin_types.TypeTagVariantAddress();
  }
  if (ty === 'Signer') {
    return new starcoin_types.TypeTagVariantSigner();
  }
  if ('Vector' in ty) {
    return new starcoin_types.TypeTagVariantVector(typeTagToSCS(ty.Vector));
  }
  if ('Struct' in ty) {
    return new starcoin_types.TypeTagVariantStruct(structTagToSCS(ty.Struct));
  }
  throw new Error(`invalid type tag: ${ ty }`);
}

export function structTagToSCS(data: StructTag): starcoin_types.StructTag {
  return new starcoin_types.StructTag(
    addressToSCS(data.address),
    new starcoin_types.Identifier(data.module),
    new starcoin_types.Identifier(data.name),
    data.type_params ? data.type_params.map((t) => typeTagToSCS(t)) : []
  );
}

export function structTagFromSCS(
  bcs_data: starcoin_types.StructTag
): StructTag {
  return {
    module: bcs_data.module.value,
    name: bcs_data.name.value,
    type_params: bcs_data.type_params.map((t) => typeTagFromSCS(t)),
    address: addressFromSCS(bcs_data.address),
  };
}

// eslint-disable-next-line consistent-return
export function typeTagFromSCS(bcs_data: starcoin_types.TypeTag): TypeTag {
  if (bcs_data instanceof starcoin_types.TypeTagVariantAddress) {
    return 'Address';
  }
  if (bcs_data instanceof starcoin_types.TypeTagVariantBool) {
    return 'Bool';
  }
  if (bcs_data instanceof starcoin_types.TypeTagVariantU8) {
    return 'U8';
  }
  if (bcs_data instanceof starcoin_types.TypeTagVariantU64) {
    return 'U64';
  }
  if (bcs_data instanceof starcoin_types.TypeTagVariantU128) {
    return 'U128';
  }
  if (bcs_data instanceof starcoin_types.TypeTagVariantSigner) {
    return 'Signer';
  }
  if (bcs_data instanceof starcoin_types.TypeTagVariantStruct) {
    return {
      Struct: structTagFromSCS(bcs_data.value),
    };
  }
  if (bcs_data instanceof starcoin_types.TypeTagVariantVector) {
    return {
      Vector: typeTagFromSCS(bcs_data.value),
    };
  }
  throw new TypeError(`invalid bcs type tag: ${ bcs_data }`);
}

export async function privateKeyToPublicKey(privateKey: string): Promise<string> {
  const publicKey = await ed.getPublicKey(stripHexPrefix(privateKey))
  return addHexPrefix(publicKey)
}

export function publicKeyToAuthKey(publicKey: string): string {
  const hasher = sha3_256.create()
  hasher.update(fromHexString(stripHexPrefix(publicKey)))
  hasher.update(fromHexString("00"))
  const hash = hasher.hex()
  return addHexPrefix(hash)
}

export function publicKeyToAddress(publicKey: string): string {
  const hasher = sha3_256.create()
  hasher.update(fromHexString(stripHexPrefix(publicKey)))
  hasher.update(fromHexString("00"))
  const hash = hasher.hex()
  const address = hash.slice(hash.length / 2)
  return addHexPrefix(address)
}

export function encodeReceiptIdentifier(addressStr: string, authKeyStr = ''): string {
  const accountAddress = addressToSCS(addressStr)
  const authKey = new starcoin_types.AuthKey(Buffer.from(authKeyStr, 'hex'))
  return new starcoin_types.ReceiptIdentifier(accountAddress, authKey).encode();
}

export function decodeReceiptIdentifier(value: string): ReceiptIdentifierView {
  const receiptIdentifier = starcoin_types.ReceiptIdentifier.decode(value)
  const accountAddress = stripHexPrefix(addressFromSCS(receiptIdentifier.accountAddress))
  const authKey = receiptIdentifier.authKey.hex()
  const receiptIdentifierView = { accountAddress, authKey }
  return receiptIdentifierView
}

export function publicKeyToReceiptIdentifier(publicKey: string): string {
  const address = publicKeyToAddress(publicKey)
  const authKey = publicKeyToAuthKey(publicKey)
  const receiptIdentifier = encodeReceiptIdentifier(stripHexPrefix(address), stripHexPrefix(authKey))
  return receiptIdentifier
}

// export function txnArgFromSCS(data: starcoin_types.TransactionArgument): TransactionArgument {
//   if (data instanceof starcoin_types.TransactionArgumentVariantBool) {
//     return { Bool: data.value };
//   }
//   if (data instanceof starcoin_types.TransactionArgumentVariantU8) {
//     return { U8: data.value };
//   }
//   if (data instanceof starcoin_types.TransactionArgumentVariantU64) {
//     return { U64: data.value };
//   }
//   if (data instanceof starcoin_types.TransactionArgumentVariantU128) {
//     return { U128: data.value };
//   }
//   if (data instanceof starcoin_types.TransactionArgumentVariantAddress) {
//     return { Address: addressFromSCS(data.value) };
//   }
//   if (data instanceof starcoin_types.TransactionArgumentVariantU8Vector) {
//     return { U8Vector: data.value };
//   }
//   throw new TypeError(`cannot decode bcs type: ${data}`);
// }

// export function txnArgToSCS(
//   data: TransactionArgument
// ): starcoin_types.TransactionArgument {
//   if ('U8' in data) {
//     return new starcoin_types.TransactionArgumentVariantU8(data.U8);
//   }
//   if ('U64' in data) {
//     return new starcoin_types.TransactionArgumentVariantU64(BigInt(data.U64));
//   }
//   if ('U128' in data) {
//     return new starcoin_types.TransactionArgumentVariantU128(BigInt(data.U128));
//   }
//   if ('Address' in data) {
//     return new starcoin_types.TransactionArgumentVariantAddress(
//       addressToSCS(data.Address)
//     );
//   }
//   if ('U8Vector' in data) {
//     return new starcoin_types.TransactionArgumentVariantU8Vector(data.U8Vector);
//   }
//   if ('Bool' in data) {
//     return new starcoin_types.TransactionArgumentVariantBool(data.Bool);
//   }
//   throw new Error(`invalid txn argument${data}`);
//
// }

// Deprecated
// stringToBytes(str) can be replaced with: new Uint8Array(Buffer.from(str))
export function stringToBytes(str: string): BytesLike {
  let bytes = new Array();
  let len, c;
  len = str.length;
  for (let i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    if (c >= 0x010000 && c <= 0x10FFFF) {
      bytes.push(((c >> 18) & 0x07) | 0xF0);
      bytes.push(((c >> 12) & 0x3F) | 0x80);
      bytes.push(((c >> 6) & 0x3F) | 0x80);
      bytes.push((c & 0x3F) | 0x80);
    } else if (c >= 0x000800 && c <= 0x00FFFF) {
      bytes.push(((c >> 12) & 0x0F) | 0xE0);
      bytes.push(((c >> 6) & 0x3F) | 0x80);
      bytes.push((c & 0x3F) | 0x80);
    } else if (c >= 0x000080 && c <= 0x0007FF) {
      bytes.push(((c >> 6) & 0x1F) | 0xC0);
      bytes.push((c & 0x3F) | 0x80);
    } else {
      bytes.push(c & 0xFF);
    }
  }
  return bytes;
}

// Deprecated
// bytesToString(arr) can be replaced with: Buffer.from(arr).toString()
export function bytesToString(arr: BytesLike): string {
  if (typeof arr === 'string') {
    return arr;
  }
  let str = '';
  for (let i = 0; i < arr.length; i++) {
    let one = arr[i].toString(2),
      v = one.match(/^1+?(?=0)/);
    if (v && one.length == 8) {
      let bytesLength = v[0].length;
      let store = arr[i].toString(2).slice(7 - bytesLength);
      for (let st = 1; st < bytesLength; st++) {
        store += arr[st + i].toString(2).slice(2);
      }
      str += String.fromCharCode(parseInt(store, 2));
      i += bytesLength - 1;
    } else {
      str += String.fromCharCode(arr[i]);
    }
  }
  return str;
}

const CryptoMaterialError = {
  SerializationError: 'Struct to be signed does not serialize correctly',
  DeserializationError: 'Key or signature material does not deserialize correctly',
  ValidationError: 'Key or signature material deserializes, but is otherwise not valid',
  WrongLengthError: 'Key, threshold or signature material does not have the expected size',
  CanonicalRepresentationError: 'Part of the signature or key is not canonical resulting to malleability issues',
  SmallSubgroupError: 'A curve point (i.e., a public key) lies on a small group',
  PointNotOnCurveError: 'A curve point (i.e., a public key) does not satisfy the curve equation',
  BitVecError: 'BitVec errors in accountable multi-sig schemes',
}

const MAX_NUM_OF_KEYS = 32
const BITMAP_NUM_OF_BYTES = 4

/// The length of the Ed25519PrivateKey
const ED25519_PRIVATE_KEY_LENGTH = 32;
/// The length of the Ed25519PublicKey
const ED25519_PUBLIC_KEY_LENGTH = 32;
/// The length of the Ed25519Signature
const ED25519_SIGNATURE_LENGTH = 32;

// Part of private keys in the multi-key Ed25519 structure along with the threshold.
// note: the private keys must be a sequential part of the MultiEd25519PrivateKey
export class MultiEd25519KeyShard {
  constructor(public public_keys: Ed25519PublicKey[], public threshold: U8, public private_keys: Record<U8, Ed25519PrivateKey>) {
    const num_of_public_keys = public_keys.length;
    const num_of_private_keys = Object.keys(private_keys).length;
    if (threshold === 0 || num_of_private_keys === 0 || num_of_public_keys < threshold) {
      throw new Error(CryptoMaterialError.ValidationError)
    } else if (num_of_private_keys > MAX_NUM_OF_KEYS || num_of_public_keys > MAX_NUM_OF_KEYS) {
      throw new Error(CryptoMaterialError.WrongLengthError)
    }
  }

  public serialize(): Uint8Array {
    const arrHead = new Uint8Array(3);
    arrHead[0] = this.public_keys.length
    arrHead[1] = this.threshold
    arrHead[2] = this.len()
    const arrPub = []
    this.public_keys.forEach((pub) => {
      arrPub.push(arrayify(pub))
    })
    const arrPriv = []
    Object.values(this.private_keys).forEach((priv) => {
      arrPriv.push(arrayify(priv))
    })
    const bytes = concat([arrHead, ...arrPub, ...arrPriv])
    return bytes;
  }

  static async deserialize(bytes: Uint8Array): Promise<MultiEd25519KeyShard> {
    const HEADER_LEN = 3;
    const bytes_len = bytes.length;
    if (bytes_len < HEADER_LEN) {
      throw new Error(CryptoMaterialError.WrongLengthError);
    }
    const public_key_len = bytes[0] as U8;
    const threshold = bytes[1] as U8;
    const private_key_len = bytes[2] as U8;

    const public_key_bytes_len = public_key_len * ED25519_PUBLIC_KEY_LENGTH;
    const private_key_bytes_len = private_key_len * ED25519_PRIVATE_KEY_LENGTH;

    let i, j
    const public_keys = []
    for (i = HEADER_LEN, j = HEADER_LEN + public_key_bytes_len; i < j; i += ED25519_PUBLIC_KEY_LENGTH) {
      const temp = bytes.slice(i, i + ED25519_PUBLIC_KEY_LENGTH);
      public_keys.push(hexlify(temp))
    }
    const private_keys = []
    for (i = HEADER_LEN + public_key_bytes_len, j = bytes.length; i < j; i += ED25519_PRIVATE_KEY_LENGTH) {
      const temp = bytes.slice(i, i + ED25519_PUBLIC_KEY_LENGTH);
      private_keys.push(hexlify(temp))
    }
    const pos_verified_private_keys = {};
    await Promise.all(
      private_keys.map((priv) => {
        return privateKeyToPublicKey(priv).then((pub) => {
          const idx = public_keys.indexOf(pub)
          if (idx > -1) {
            pos_verified_private_keys[idx] = priv
          }
          return pub;
        }).catch((error) => {
          throw new Error(`invalid private key: ${ error }`)
        })
      })
    )
    return new MultiEd25519KeyShard(public_keys, threshold, pos_verified_private_keys)
  }

  public getThreshold(): U8 {
    return this.threshold;
  }

  public getPublicKeys(): Ed25519PublicKey[] {
    return Object.values(this.public_keys);
  }

  public getPrivateKeys(): Ed25519PrivateKey[] {
    return Object.values(this.private_keys);
  }

  public len(): U8 {
    return Object.values(this.private_keys).length;
  }

  public isEmpty(): boolean {
    return this.len() === 0;
  }
}