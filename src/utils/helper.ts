/* eslint-disable no-bitwise */

export function dec2bin(dec: number): string {
  const bin = (dec >>> 0).toString(2)
  const prefixed = `00000000000000000000000000000000${ bin }`
  return prefixed.slice(-32);
}

export function bin2dec(bin: string): number {
  return Number.parseInt(Number.parseInt(bin, 2).toString(10), 10);
}

// the 3rd and 31st positions are set.
// 268435457
// 0b00010000000000000000000000000001
// [0b0001_0000, 0b0000_0000, 0b0000_0000, 0b0000_0001]
// Uint8Array(4)[ 16, 0, 0, 1 ]
export function dec2uint8array(n: number): Uint8Array {
  const arr = dec2bin(n).match(/.{1,8}/g);
  const bitmap = Uint8Array.from(arr.map((str) => bin2dec(str)))
  return bitmap
}

export function uint8array2dec(bitmap: Uint8Array): number {
  const binArr = []
  bitmap.forEach((n) => binArr.push(dec2bin(n).slice(-8)))
  return bin2dec(binArr.join(''))
}



// index from left to right
export function setBit(n: number, idx: number): number {
  if (idx > 31 || idx < 0) {
    throw new Error(`mask: invalid idx at ${ idx }, should be between 0 and 31`)
  }
  const mask = 1 << (32 - idx - 1)
  return n | mask
}

// index from left to right
export function isSetBit(n: number, idx: number): boolean {
  if (idx > 31 || idx < 0) {
    throw new Error(`mask: invalid idx at ${ idx }, should be between 0 and 31`)
  }
  // const mask = 1 << (32 - idx - 1)
  // let isSet = false
  // if ((n & mask) !== 0) {
  //   isSet = true
  // }
  // return isSet
  return ((n >> (32 - idx - 1)) % 2 !== 0)
}
