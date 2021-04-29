import { createHash, publicKeyToAuthKey } from ".";

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
    const public_key = '0xc51dada886afe59d4651f36b56f3c4a1a84da53dfbddf396d81a5b36ab5cdc26'
    const value = publicKeyToAuthKey(public_key)
    console.log({auth_key: value})
    expect(value).toBe(
      "0xc804cb6c5652488f61386a0107bc88cd3f19d5422824f47e6c021978cee98f35"
    );
  });
});
