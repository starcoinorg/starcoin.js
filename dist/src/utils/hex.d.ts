export declare function toHexString(byteArray: Iterable<number>): string;
export declare function fromHexString(hex: string, padding?: number): Uint8Array;
/**
 * @public
 * Should be called to pad string to expected length
 */
export declare function padLeft(str: string, chars: number, sign?: string): string;
/**
 * @public
 * Should be called to pad string to expected length
 */
export declare function padRight(str: string, chars: number, sign?: string): string;
