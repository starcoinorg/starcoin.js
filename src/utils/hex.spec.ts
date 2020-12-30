import { fromHexString, toHexString } from "./hex";
import { addressToSCS } from "../encoding";

test("hex encode", () => {
  expect(toHexString([1, 2, 3])).toBe("0x010203");
});

test("hex decode", () => {
  expect(fromHexString("0x1")).toStrictEqual(new Uint8Array([1]));
  expect(fromHexString("0x01")).toStrictEqual(new Uint8Array([1]));
  expect(addressToSCS("0x1").value.length).toBe(16);
  expect(addressToSCS("0x01").value.length).toBe(16);
});
