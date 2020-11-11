import { abi } from '../src';
import * as fs from 'fs';
import path = require('path');
import { encodeTxnPayload } from '../src/utils/tx';

describe('abi', () => {
  test('decode', () => {
    let buffer = fs.readFileSync(
      path.join(__dirname, 'fixtures', 'create_account.abi')
    );
    const script_abi = abi.decodeABI(new Uint8Array(buffer));
    console.log(JSON.stringify(script_abi));
    let hex_str = encodeTxnPayload(script_abi.code, [], []);
  });
});
