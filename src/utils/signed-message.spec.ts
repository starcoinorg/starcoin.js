import { arrayify, hexlify } from '@ethersproject/bytes';
import { encodeSignedMessage } from "./signed-message";

// const exampleMessage = 'Example `personal_sign` message 中文'
const exampleMessage = 'helloworld'
const msgBytes = new Uint8Array(Buffer.from(exampleMessage, 'utf8'))
// const msgHex = Buffer.from(exampleMessage, 'utf8').toString('hex')
const publicKey = '0x32ed52d319694aebc5b52e00836e2f7c7d2c7c7791270ede450d21dbc90cbfa1'
const privateKey = '0x587737ebefb4961d377a3ab2f9ceb37b1fa96eb862dfaf954a4a1a99535dfec0'
const address = '0xd7f20befd34b9f1ab8aeae98b82a5a51'
const publicKeyBytes = arrayify(publicKey)
const privateKeyBytes = arrayify(privateKey)

test('encode SignedMessage', async () => {

  const signedMessageHex = await encodeSignedMessage(msgBytes, privateKeyBytes);
  console.log({ exampleMessage, privateKey, publicKey, address, signedMessageHex })

  // const isSigned = await verifyPersonalMessage(signature, msgBytes, publicKeyBytes);
  // expect(isSigned).toBe(true);

})