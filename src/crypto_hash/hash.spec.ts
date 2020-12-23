import { createHash } from ".";

describe("crypo hash", () => {
  test("should hash correct", () => {
    const hasher = createHash("test");
    const data = new Uint8Array(Buffer.from("test"));
    const value = hasher.crypto_hash(data);
    expect(value).toBe(
      "0x9dae4c4ba135963b54816df6488296e9441a88f0bedd39810e94bdf05a2d5ba6"
    );
  });
});
