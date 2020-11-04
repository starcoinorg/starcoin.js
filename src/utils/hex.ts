export function toHexString(byteArray: Iterable<number>): string {
  return '0x' + Buffer.from(byteArray).toString('hex');
}

export function fromHexString(hex: string): Uint8Array {
  if (hex.startsWith('0x')) {
    hex = hex.substring(2);
  }
  if (hex.length % 2 != 0) {
    hex = '0' + hex;
  }
  const buf = Buffer.from(hex, 'hex');
  return new Uint8Array(buf);
}
