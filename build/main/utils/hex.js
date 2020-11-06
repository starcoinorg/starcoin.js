"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.padRight = exports.padLeft = exports.fromHexString = exports.toHexString = void 0;
function toHexString(byteArray) {
    return '0x' + Buffer.from(byteArray).toString('hex');
}
exports.toHexString = toHexString;
function fromHexString(hex, padding) {
    if (hex.startsWith('0x')) {
        hex = hex.substring(2);
    }
    if (padding) {
        if (hex.length < padding) {
            hex = padLeft(hex, padding);
        }
    }
    else {
        if (hex.length % 2 != 0) {
            hex = '0' + hex;
        }
    }
    const buf = Buffer.from(hex, 'hex');
    return new Uint8Array(buf);
}
exports.fromHexString = fromHexString;
/**
 * @public
 * Should be called to pad string to expected length
 */
function padLeft(str, chars, sign) {
    return new Array(chars - str.length + 1).join(sign ? sign : '0') + str;
}
exports.padLeft = padLeft;
/**
 * @public
 * Should be called to pad string to expected length
 */
function padRight(str, chars, sign) {
    return str + new Array(chars - str.length + 1).join(sign ? sign : '0');
}
exports.padRight = padRight;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL2hleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxTQUFnQixXQUFXLENBQUMsU0FBMkI7SUFDckQsT0FBTyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDdkQsQ0FBQztBQUZELGtDQUVDO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLEdBQVcsRUFBRSxPQUFnQjtJQUN6RCxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDeEIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDeEI7SUFDRCxJQUFJLE9BQU8sRUFBRTtRQUNYLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxPQUFPLEVBQUU7WUFDeEIsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDN0I7S0FDRjtTQUFNO1FBQ0wsSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDdkIsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7U0FDakI7S0FDRjtJQUNELE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLE9BQU8sSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQWZELHNDQWVDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBZ0IsT0FBTyxDQUFDLEdBQVcsRUFBRSxLQUFhLEVBQUUsSUFBYTtJQUMvRCxPQUFPLElBQUksS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3pFLENBQUM7QUFGRCwwQkFFQztBQUVEOzs7R0FHRztBQUNILFNBQWdCLFFBQVEsQ0FBQyxHQUFXLEVBQUUsS0FBYSxFQUFFLElBQWE7SUFDaEUsT0FBTyxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6RSxDQUFDO0FBRkQsNEJBRUMifQ==