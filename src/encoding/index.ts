import { arrayify, BytesLike, hexlify } from '@ethersproject/bytes';
import { BcsDeserializer, BcsSerializer } from '../lib/runtime/bcs';
import * as starcoin_types from '../lib/runtime/starcoin_types';
import * as serde from '../lib/runtime/serde';
import {
  ACCOUNT_ADDRESS_LENGTH,
  AccountAddress, EVENT_KEY_LENGTH, SignedUserTransactionView,
  StructTag,
  TransactionArgument, TransactionPayload,
  TypeTag
} from '../types';
import { fromHexString, toHexString } from '../utils/hex';
import { createUserTransactionHasher} from '../crypto_hash';


export interface SerdeSerializable {
  serialize(serializer: serde.Serializer): void;
}

export function serializeBCSData(data: SerdeSerializable): string {
  const se = new BcsSerializer();
  data.serialize(se);
  return toHexString(se.getBytes());
}

export function decodeSignedUserTransaction(
  data: BytesLike
): SignedUserTransactionView {
  const bytes = arrayify(data);
  const scsData = (function () {
    const se = new BcsDeserializer(bytes);
    return starcoin_types.SignedUserTransaction.deserialize(se);
  })();

  let authenticator;
  if (scsData.authenticator instanceof starcoin_types.TransactionAuthenticatorVariantEd25519) {
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
export function decodeTransactionPayload(payload: BytesLike): TransactionPayload {
  const bytes = arrayify(payload);
  const de = new BcsDeserializer(bytes);
  const bcsTxnPayload = starcoin_types.TransactionPayload.deserialize(de);
  if (bcsTxnPayload instanceof starcoin_types.TransactionPayloadVariantScript) {
    const script = bcsTxnPayload.value;
    return {
      Script: {
        code: toHexString(script.code),
        ty_args: script.ty_args.map(t => typeTagFromSCS(t)),
        args: script.args.map(arg => txnArgFromSCS(arg))
      }
    };
  }

  if (bcsTxnPayload instanceof starcoin_types.TransactionPayloadVariantScriptFunction) {
    let scriptFunction  = bcsTxnPayload.value;
    return {
      ScriptFunction: {
        func: {
          address: addressFromSCS( scriptFunction.module.address),
          module: scriptFunction.module.name.value,
          function_name: scriptFunction.func.value,
        },
        ty_args: scriptFunction.ty_args.map(t => typeTagFromSCS(t)),
        args: scriptFunction.args.map(arg => txnArgFromSCS(arg)),
      }
    };
  }

  if (bcsTxnPayload instanceof starcoin_types.TransactionPayloadVariantPackage) {
    const packagePayload = bcsTxnPayload.value;
    return {
      Package: {
        package_address: addressFromSCS(packagePayload.package_address),
        modules: packagePayload.modules.map(m => ({ code: toHexString(m.code) })),
        init_script: packagePayload.init_script === null ? undefined : {
          func: {
            address: addressFromSCS(packagePayload.init_script.module.address),
            module: packagePayload.init_script.module.name.value,
            function_name: packagePayload.init_script.func.value,
          },
          args: packagePayload.init_script.args.map(arg => txnArgFromSCS(arg)),
          ty_args: packagePayload.init_script.ty_args.map(ty => typeTagFromSCS(ty))
        }
      }
    };
  }

  throw new TypeError(`cannot decode bcs data ${bcsTxnPayload}`);
}

/// Decode a hex view or raw bytes of event key into parts.
/// EventKey is constructed by `Salt+AccountAddress`.
export function decodeEventKey(eventKey: BytesLike): { address: AccountAddress, salt: BigInt } {
  const bytes = arrayify(eventKey);
  if (bytes.byteLength !== EVENT_KEY_LENGTH) {
    throw new Error(`invalid eventkey data, expect byte length to be ${EVENT_KEY_LENGTH}, actual: ${bytes.byteLength}`);
  }
  const saltBytes = bytes.slice(0, EVENT_KEY_LENGTH - ACCOUNT_ADDRESS_LENGTH);
  const salt = Buffer.from(saltBytes).readBigUInt64LE();
  const addressBytes = bytes.slice(EVENT_KEY_LENGTH - ACCOUNT_ADDRESS_LENGTH);
  const address = toHexString(addressBytes);
  return { address, salt };
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
    return new starcoin_types.TypeTagVariantVector(
      typeTagToSCS(ty.Vector)
    );
  }
  if ('Struct' in ty) {
    return new starcoin_types.TypeTagVariantStruct(
      structTagToSCS(ty.Struct)
    );
  }
  throw new Error(`invalid type tag: ${ty}`);
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
    address: addressFromSCS(bcs_data.address)
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
      Struct: structTagFromSCS(bcs_data.value)
    };
  }
  if (bcs_data instanceof starcoin_types.TypeTagVariantVector) {
    return {
      Vector: typeTagFromSCS(bcs_data.value)
    };
  }
  throw new TypeError(`invalid bcs type tag: ${bcs_data}`);
}

export function txnArgFromSCS(data: starcoin_types.TransactionArgument): TransactionArgument {
  if (data instanceof starcoin_types.TransactionArgumentVariantBool) {
    return { Bool: data.value };
  }
  if (data instanceof starcoin_types.TransactionArgumentVariantU8) {
    return { U8: data.value };
  }
  if (data instanceof starcoin_types.TransactionArgumentVariantU64) {
    return { U64: data.value };
  }
  if (data instanceof starcoin_types.TransactionArgumentVariantU128) {
    return { U128: data.value };
  }
  if (data instanceof starcoin_types.TransactionArgumentVariantAddress) {
    return { Address: addressFromSCS(data.value) };
  }
  if (data instanceof starcoin_types.TransactionArgumentVariantU8Vector) {
    return { U8Vector: data.value };
  }
  throw new TypeError(`cannot decode bcs type: ${data}`);
}

export function txnArgToSCS(
  data: TransactionArgument
): starcoin_types.TransactionArgument {
  if ('U8' in data) {
    return new starcoin_types.TransactionArgumentVariantU8(data.U8);
  }
  if ('U64' in data) {
    return new starcoin_types.TransactionArgumentVariantU64(BigInt(data.U64));
  }
  if ('U128' in data) {
    return new starcoin_types.TransactionArgumentVariantU128(BigInt(data.U128));
  }
  if ('Address' in data) {
    return new starcoin_types.TransactionArgumentVariantAddress(
      addressToSCS(data.Address)
    );
  }
  if ('U8Vector' in data) {
    return new starcoin_types.TransactionArgumentVariantU8Vector(data.U8Vector);
  }
  if ('Bool' in data) {
    return new starcoin_types.TransactionArgumentVariantBool(data.Bool);
  }
  throw new Error(`invalid txn argument${data}`);

}
