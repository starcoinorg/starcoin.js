import { createHash, publicKeyToAuthKey, publicKeyToAddress, privateKeyToPublicKey } from ".";
const assert = require('assert');

describe("crypo hash", () => {
  test("should hash correct", () => {
    const hasher = createHash("test");
    const data = new Uint8Array(Buffer.from("test"));
    const value = hasher.crypto_hash(data);
    expect(value).toBe(
      "0x7875f210ee3a08253dc4cdfde9ea7c170ec7dca3866c819c622e671ce7df5d60"
    );
  });
  test("should convert public key to auth key correctly", () => {
    // work on barnard network
    const public_key = '0xe8eba2c517d0b5012c20737b3627c58447ccd6098aaae84027520afcc82a4ded'
    const value = publicKeyToAuthKey(public_key)
    console.log({auth_key: value})
    expect(value).toBe(
      "0x049ad0f8c75341261eb354aba13b3a4f400e8f6e15f47c92519e2527fcd64b3a"
    );
  });
  test("should convert public key to address correctly", () => {
    const public_key = '0xe8eba2c517d0b5012c20737b3627c58447ccd6098aaae84027520afcc82a4ded'
    const value = publicKeyToAddress(public_key)
    console.log({address: value})
    expect(value).toBe(
      "0x400e8f6e15f47c92519e2527fcd64b3a"
    );
  });
  test("should convert private key to publick key correctly", async () => {
    const private_key = '0xa6d8991ca3d6813f493d13216d6dedd30211a649d21b2ca102b860bea51045fd'
    const value = await privateKeyToPublicKey(private_key)
    console.log({public_key: value})
    expect(value).toBe(
      "0xe8eba2c517d0b5012c20737b3627c58447ccd6098aaae84027520afcc82a4ded"
    );
  });
});