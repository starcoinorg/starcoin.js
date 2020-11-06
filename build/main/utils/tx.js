"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode_tx_payload = void 0;
const lcs_1 = require("../lib/runtime/lcs");
const starcoin_types = __importStar(require("../lib/runtime/starcoin_types"));
const hex_1 = require("./hex");
function encode_tx_payload(code, ty_args, args) {
    const script = new starcoin_types.Script(code, ty_args, args);
    let payload = new starcoin_types.TransactionPayloadVariantScript(script);
    const se = new lcs_1.LcsSerializer();
    payload.serialize(se);
    return hex_1.toHexString(se.getBytes());
}
exports.encode_tx_payload = encode_tx_payload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvdHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDRDQUFtRDtBQUVuRCw4RUFBZ0U7QUFFaEUsK0JBQW9DO0FBRXBDLFNBQWdCLGlCQUFpQixDQUMvQixJQUFXLEVBQ1gsT0FBaUMsRUFDakMsSUFBMEM7SUFFMUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUQsSUFBSSxPQUFPLEdBQUcsSUFBSSxjQUFjLENBQUMsK0JBQStCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekUsTUFBTSxFQUFFLEdBQUcsSUFBSSxtQkFBYSxFQUFFLENBQUM7SUFDL0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN0QixPQUFPLGlCQUFXLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDcEMsQ0FBQztBQVZELDhDQVVDIn0=