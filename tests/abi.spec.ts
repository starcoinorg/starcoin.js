import { abi } from '../src';
import * as fs from 'fs';
import path = require('path');
import { encode_tx_payload } from '../src/utils/tx';

describe('abi', () => {
  test('decode', () => {
    let buffer = fs.readFileSync(
      path.join(__dirname, 'fixtures', 'create_account.abi')
    );
    const script_abi = abi.decodeABI(new Uint8Array(buffer));
    console.log(JSON.stringify(script_abi));
    let hex_str = encode_tx_payload(script_abi.code, [], []);
  });
});
