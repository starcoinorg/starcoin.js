import { createHash } from ".";
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
});