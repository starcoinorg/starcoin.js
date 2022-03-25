// eslint-disable-next-line max-classes-per-file
import { Bytes } from '@ethersproject/bytes';
import { deepCopy, Deferrable, defineReadOnly, resolveProperties, shallowCopy } from '@ethersproject/properties';
import { Logger } from '@ethersproject/logger';
import { Provider } from '../abstract-provider';
import { version } from '../version';
import { U128, U64, BlockTag, TransactionRequest, TransactionResponse } from '../types';

const logger = new Logger(version);

const allowedTransactionKeys = new Set([
  'sender',
  'sender_public_key',
  'sequence_number',
  'script',
  'modules',
  'max_gas_amount',
  'gas_unit_price',
  'gas_token_code',
  'chain_id'
]);

// FIXME: change the error data.
const forwardErrors = new Set([
  Logger.errors.INSUFFICIENT_FUNDS,
  Logger.errors.NONCE_EXPIRED,
  Logger.errors.REPLACEMENT_UNDERPRICED
]);


export abstract class Signer {
  readonly provider?: Provider;

  // Sub-classes MUST implement these

  // Returns the address
  abstract getAddress(): Promise<string>;

  // Returns the signed prefixed-message. This MUST treat:
  // - Bytes as a binary message
  // - string as a UTF8-message
  // i.e. "0x1234" is a SIX (6) byte string, NOT 2 bytes of data
  // abstract signMessage(message: Bytes | string): Promise<string>;
  abstract signMessage(message: string): Promise<string>;

  // Signs a transaction and returns the fully serialized, signed transaction.
  // The EXACT transaction MUST be signed, and NO additional properties to be added.
  // - This MAY throw if signing transactions is not supports, but if
  //   it does, sentTransaction MUST be overridden.
  abstract signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string>;

  // Returns a new instance of the Signer, connected to provider.
  // This MAY throw if changing providers is not supported.
  abstract connect(provider: Provider): Signer;

  readonly _isSigner: boolean;


  // Sub-classes MUST call super
  constructor() {
    logger.checkAbstract(new.target, Signer);
    defineReadOnly(this, '_isSigner', true);
  }


  // Sub-classes MAY override these

  async getBalance(token: string, blockTag?: BlockTag): Promise<U128> {
    this.checkProvider('getBalance');
    return this.provider.getBalance(this.getAddress(), token, blockTag);
  }

  // FIXME: check pending txn in txpool
  async getSequenceNumber(blockTag?: BlockTag): Promise<U64> {
    this.checkProvider('getSequenceNumber');
    return this.provider.getSequenceNumber(this.getAddress(), blockTag);
  }

  // Populates "from" if unspecified, and estimates the gas for the transation
  async estimateGas(transaction: Deferrable<TransactionRequest>): Promise<U64> {
    this.checkProvider('estimateGas');

    const tx = await resolveProperties(this.checkTransaction(transaction));
    const txnOutput = await this.provider.dryRun(tx);
    if (typeof txnOutput.gas_used === 'number') {
      return 3 * txnOutput.gas_used;
    }
    return BigInt(3) * txnOutput.gas_used.valueOf();
  }

  // calls with the transaction

  // async call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag): Promise<string> {
  //   this.checkProvider('call');
  //   const tx = await resolveProperties(this.checkTransaction(transaction));
  //   return await this.provider.call(tx, blockTag);
  // }

  // Populates all fields in a transaction, signs it and sends it to the network
  sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
    this.checkProvider('sendTransaction');
    return this.populateTransaction(transaction).then((tx) => {
      return this.signTransaction(tx).then((signedTx) => {
        return this.provider.sendTransaction(signedTx);
      });
    });
  }

  async getChainId(): Promise<number> {
    this.checkProvider('getChainId');
    const network = await this.provider.getNetwork();
    return network.chainId;
  }

  async getGasPrice(): Promise<U64> {
    this.checkProvider('getGasPrice');
    return this.provider.getGasPrice();
  }

  // Checks a transaction does not contain invalid keys and if
  // no "from" is provided, populates it.
  // - does NOT require a provider
  // - adds "from" is not present
  // - returns a COPY (safe to mutate the result)
  // By default called from: (overriding these prevents it)
  //   - call
  //   - estimateGas
  //   - populateTransaction (and therefor sendTransaction)
  checkTransaction(transaction: Deferrable<TransactionRequest>): Deferrable<TransactionRequest> {
    // eslint-disable-next-line no-restricted-syntax
    for (const key of Object.keys(transaction)) {
      if (!allowedTransactionKeys.has(key)) {
        logger.throwArgumentError(`invalid transaction key: ${ key }`, 'transaction', transaction);
      }
    }

    const tx = shallowCopy(transaction);

    if (tx.sender === undefined) {
      tx.sender = this.getAddress();
    } else {
      // Make sure any provided address matches this signer
      tx.sender = Promise.all([
        Promise.resolve(tx.sender),
        this.getAddress()
      ]).then((result) => {
        if (result[0] !== result[1]) {
          logger.throwArgumentError('from address mismatch', 'transaction', transaction);
        }
        return result[0];
      });
    }

    return tx;
  }

  // Populates ALL keys for a transaction and checks that "from" matches
  // this Signer. Should be used by sendTransaction but NOT by signTransaction.
  // By default called from: (overriding these prevents it)
  //   - sendTransaction
  async populateTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionRequest> {

    const tx: Deferrable<TransactionRequest> = await resolveProperties(this.checkTransaction(transaction));
    if (tx.gas_unit_price === undefined) {
      tx.gas_unit_price = this.getGasPrice();
    }
    if (tx.sequence_number === undefined) {
      tx.sequence_number = this.getSequenceNumber('pending');
    }
    if (tx.chain_id === undefined) {
      tx.chain_id = this.getChainId();
    } else {
      tx.chain_id = Promise.all([
        Promise.resolve(tx.chain_id),
        this.getChainId()
      ]).then((results) => {
        if (results[1] !== 0 && results[0] !== results[1]) {
          logger.throwArgumentError('chainId address mismatch', 'transaction', transaction);
        }
        return results[0];
      });
    }

    if (tx.max_gas_amount === undefined) {
      tx.max_gas_amount = this.estimateGas(tx).catch((error) => {
        if (forwardErrors.has(error.code)) {
          throw error;
        }
        console.log(`err: ${ error }`);
        return logger.throwError('cannot estimate gas; transaction may fail or may require manual gas limit', Logger.errors.UNPREDICTABLE_GAS_LIMIT, {
          error,
          tx
        });
      });
    }

    return resolveProperties(tx);
  }


  // Sub-classes SHOULD leave these alone

  // eslint-disable-next-line no-underscore-dangle
  checkProvider(operation?: string): void {
    if (!this.provider) {
      logger.throwError('missing provider', Logger.errors.UNSUPPORTED_OPERATION, {
        operation: (operation || '_checkProvider')
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static isSigner(value: any): value is Signer {
    // eslint-disable-next-line no-underscore-dangle
    return !!(value && value._isSigner);
  }
}

export class VoidSigner extends Signer {
  readonly address: string;

  constructor(address: string, provider?: Provider) {
    logger.checkNew(new.target, VoidSigner);
    super();
    defineReadOnly(this, 'address', address);
    defineReadOnly(this, 'provider', provider);
  }

  getAddress(): Promise<string> {
    return Promise.resolve(this.address);
  }

  // eslint-disable-next-line no-underscore-dangle,class-methods-use-this
  private fail(message: string, operation: string): Promise<any> {
    // eslint-disable-next-line promise/always-return
    return Promise.resolve().then(() => {
      logger.throwError(message, Logger.errors.UNSUPPORTED_OPERATION, { operation });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signMessage(message: string): Promise<string> {
    return this.fail('VoidSigner cannot sign messages', 'signMessage');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string> {
    return this.fail('VoidSigner cannot sign transactions', 'signTransaction');
  }

  connect(provider: Provider): VoidSigner {
    return new VoidSigner(this.address, provider);
  }
}

