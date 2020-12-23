import * as fs from "fs";
import path from "path";

import * as abi from "./abi";
import { encodeTxnPayload } from "./tx";

describe("abi", () => {
  test("decode", () => {
    const buffer = fs.readFileSync(
      path.join(__dirname, "fixtures", "create_account.abi")
    );
    const scriptABI = abi.decodeABI(new Uint8Array(buffer));
    console.log(JSON.stringify(scriptABI, undefined, 2));
    encodeTxnPayload(scriptABI.code, [], []);
  });
});
