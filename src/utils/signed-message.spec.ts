import { arrayify } from '@ethersproject/bytes';
import { addHexPrefix, stripHexPrefix } from 'ethereumjs-util';
import { encodeSignedMessage, recoverSignedMessageAddress } from "./signed-message";

const chainId = 254
const exampleMessage = 'Example `personal_sign` message 中文'
// const exampleMessage = 'helloworld'
// const msgBytes = new Uint8Array(Buffer.from(exampleMessage, 'utf8'))
// const msgHex = Buffer.from(exampleMessage, 'utf8').toString('hex')
// console.log({ msgHex })
// console.log(Buffer.from(stripHexPrefix(msgHex), 'hex').toString('utf8'))

test('encode SignedMessage: simple-keyring', async () => {
  // simple-keyring
  const publicKey = '0x32ed52d319694aebc5b52e00836e2f7c7d2c7c7791270ede450d21dbc90cbfa1'
  const privateKey = '0x587737ebefb4961d377a3ab2f9ceb37b1fa96eb862dfaf954a4a1a99535dfec0'
  const address = '0xd7f20befd34b9f1ab8aeae98b82a5a51'
  const privateKeyBytes = arrayify(privateKey)
  const signedMessageHex = await encodeSignedMessage(exampleMessage, privateKeyBytes, chainId);
  console.log({ chainId, exampleMessage, privateKey, publicKey, address, signedMessageHex })

  try {
    const recoverAddress = await recoverSignedMessageAddress(signedMessageHex);
    console.log({ recoverAddress })
    expect(recoverAddress).toBe(address);
  } catch (error) {
    console.log(error)
  }
})


test('encode SignedMessage: hd-keyring', async () => {
  // hd-keyring
  const publicKey = '0xfe18b0900baa684231da3519ff5387c4b18f76ae5209b474b8dd06cb5f7ff464'
  const privateKey = '0xda82fa47266c40c84d76e20b0a278d1b27ae4a14c9c318e54457722d739371b0'
  const address = '0xfa0d5060eb2622e26b4dc307a481db0c'
  const privateKeyBytes = arrayify(privateKey)
  const signedMessageHex = await encodeSignedMessage(exampleMessage, privateKeyBytes, chainId);
  console.log({ chainId, exampleMessage, privateKey, publicKey, address, signedMessageHex })

  try {
    const recoverAddress = await recoverSignedMessageAddress(signedMessageHex);
    console.log({ recoverAddress })
    expect(recoverAddress).toBe(address);
  } catch (error) {
    console.log(error)
  }
})

test('decode SignedMessage', async () => {
  const signedMessageHex = '0x024f69ff412b2c1bb1dd394d79554f30264578616d706c652060706572736f6e616c5f7369676e60206d65737361676520e4b8ade69687002006898c96a2abfa44ba4d5db6f9f3751595bb868eaac01c8f3c6bb4424ee882a640eabc37378028c905b47a52c3b74645b31e539cc1a27d24d4a2c09af62c6b3d1cbc4a235f702ec4878e286a06a9b87a55dfdd8e051f6422cc92981c975d18f805fe';
  console.log({ signedMessageHex })

  try {
    const recoverAddress = await recoverSignedMessageAddress(signedMessageHex);
    console.log({ recoverAddress })
    expect(recoverAddress).toBe(signedMessageHex.substr(0, 34));
  } catch (error) {
    console.log(error)
  }
})

test('testMultiEd25519', async () => {
  const signedMessageHex = '0x0000000000000000000000000a550c180a68656c6c6f776f726c640141b9c6ee1630ef3e711144a648db06bbb2284f7274cfbee53ffcee503cc1a49200aef3f4a4b8eca1dfc343361bf8e436bd42de9259c04b8314eb8e2054dd6e82ab014492176b2470347af23b292fbc7362f169abfde1d13ed8298eb92ad5296a48341d34c14eb5b5e1bebcc0ab371bbb6ff5fb24eb933cb15f76521e018c8ad431140440000000';
  // console.log({ exampleMessage, privateKey, publicKey, address, signedMessageHex })

  try {
    const recoverAddress = await recoverSignedMessageAddress(signedMessageHex);
    console.log({ recoverAddress })
    // expect(recoverAddress).toBe(address);
  } catch (error) {
    console.log(error)
  }
})