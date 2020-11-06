import { fromHexString, toHexString } from '../src/utils/hex';
import { address_from_json } from '../src/utils/lcs_to_json';

test('hex encode', () => {
  expect(toHexString([1, 2, 3])).toBe('0x010203');
});

test('hex decode', () => {
  expect(fromHexString('0x1')).toStrictEqual(new Uint8Array([1]));
  expect(fromHexString('0x01')).toStrictEqual(new Uint8Array([1]));
  expect(address_from_json('0x1').value.length).toBe(16);
  expect(address_from_json('0x01').value.length).toBe(16);
});
