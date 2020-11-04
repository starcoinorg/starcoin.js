import { abi } from '../src';
import * as fs from 'fs';
import path = require('path');

describe('abi', () => {
  test('decode', () => {
    let buffer = fs.readFileSync(path.join(__dirname, 'create_account.abi'));
    const script_abi = abi.decodeABI(new Uint8Array(buffer));
    console.log(JSON.stringify(script_abi));
  });
});
