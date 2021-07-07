import * as ed from '@starcoin/stc-ed25519';
import { arrayify, hexlify } from '@ethersproject/bytes';
import { encodeTransactionAuthenticator, decodeTransactionAuthenticator } from "./sign";
import { publicKeyToAddress } from "../encoding";

// const exampleMessage = 'helloworld'
const exampleMessage = 'Example `personal_sign` message 中文 1'
const msgBytes = new Uint8Array(Buffer.from(exampleMessage, 'utf8'))
// const msgHex = Buffer.from(exampleMessage, 'utf8').toString('hex')
const publicKey = '0x32ed52d319694aebc5b52e00836e2f7c7d2c7c7791270ede450d21dbc90cbfa1'
const privateKey = '0x587737ebefb4961d377a3ab2f9ceb37b1fa96eb862dfaf954a4a1a99535dfec0'
const address = '0xd7f20befd34b9f1ab8aeae98b82a5a51'
const publicKeyBytes = arrayify(publicKey)
const privateKeyBytes = arrayify(privateKey)

test('encode and decode transactionAuthenticator', async () => {
  const transactionAuthenticatorHex = encodeTransactionAuthenticator(publicKeyBytes, msgBytes)
  // console.log({ transactionAuthenticatorHex })

  const transactionAuthenticator = decodeTransactionAuthenticator(transactionAuthenticatorHex)
  // console.log(transactionAuthenticator.publicKey, transactionAuthenticator.signature)
  // console.log('decoded publicKey:', hexlify(transactionAuthenticator.publicKey))
  const arraybuffer = transactionAuthenticator.signature.buffer
  const buffer = Buffer.from(arraybuffer);
  // console.log('decoded Message:', buffer.toString('utf-8'))

  (async () => {
    const addressSigned = publicKeyToAddress(hexlify(transactionAuthenticator.publicKey))
    // console.log({ addressSigned })
    expect(addressSigned).toBe(address);
  })();

  expect(hexlify(transactionAuthenticator.publicKey)).toBe(publicKey)
  expect(buffer.toString('utf-8')).toBe(exampleMessage)
})

test('sign and verify', () => {
  (async () => {
    const transactionAuthenticatorHex = encodeTransactionAuthenticator(publicKeyBytes, msgBytes)
    // console.log({ transactionAuthenticatorHex })
    const signature = await ed.sign(transactionAuthenticatorHex, privateKeyBytes);
    const isSigned = await ed.verify(signature, transactionAuthenticatorHex, publicKeyBytes);
    // console.log({ signature })
    expect(isSigned).toBe(true);
  })();
})
