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
exports.encodeDeployModulesPayload = exports.encodeTxnPayload = void 0;
const lcs_1 = require("../lib/runtime/lcs");
const starcoin_types = __importStar(require("../lib/runtime/starcoin_types"));
const hex_1 = require("./hex");
const lcs_to_json_1 = require("./lcs_to_json");
function encodeTxnPayload(code, ty_args, args) {
    const script = new starcoin_types.Script(code, ty_args.map((t) => lcs_to_json_1.typeTag_from_json(t)), args.map((t) => lcs_to_json_1.txnArgument_from_json(t)));
    const payload = new starcoin_types.TransactionPayloadVariantScript(script);
    const se = new lcs_1.LcsSerializer();
    payload.serialize(se);
    return hex_1.toHexString(se.getBytes());
}
exports.encodeTxnPayload = encodeTxnPayload;
function encodeDeployModulesPayload(moduleAddress, moduleCodes, initTxn) {
    const modules = moduleCodes.map((m) => new starcoin_types.Module(m));
    let script = null;
    if (initTxn) {
        script = new starcoin_types.Script(initTxn.code, initTxn.ty_args.map((t) => lcs_to_json_1.typeTag_from_json(t)), initTxn.args.map((t) => lcs_to_json_1.txnArgument_from_json(t)));
    }
    const packageData = new starcoin_types.Package(lcs_to_json_1.address_from_json(moduleAddress), modules, script);
    const payload = new starcoin_types.TransactionPayloadVariantPackage(packageData);
    const se = new lcs_1.LcsSerializer();
    payload.serialize(se);
    return hex_1.toHexString(se.getBytes());
}
exports.encodeDeployModulesPayload = encodeDeployModulesPayload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvdHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDRDQUFtRDtBQUVuRCw4RUFBZ0U7QUFHaEUsK0JBQW9DO0FBQ3BDLCtDQUl1QjtBQUV2QixTQUFnQixnQkFBZ0IsQ0FDOUIsSUFBVyxFQUNYLE9BQWtCLEVBQ2xCLElBQTJCO0lBRTNCLE1BQU0sTUFBTSxHQUFHLElBQUksY0FBYyxDQUFDLE1BQU0sQ0FDdEMsSUFBSSxFQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLCtCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3hDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLG1DQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQzFDLENBQUM7SUFDRixNQUFNLE9BQU8sR0FBRyxJQUFJLGNBQWMsQ0FBQywrQkFBK0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzRSxNQUFNLEVBQUUsR0FBRyxJQUFJLG1CQUFhLEVBQUUsQ0FBQztJQUMvQixPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3RCLE9BQU8saUJBQVcsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBZEQsNENBY0M7QUFFRCxTQUFnQiwwQkFBMEIsQ0FDeEMsYUFBcUIsRUFDckIsV0FBb0IsRUFDcEIsT0FBMEU7SUFFMUUsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDckUsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLElBQUksT0FBTyxFQUFFO1FBQ1gsTUFBTSxHQUFHLElBQUksY0FBYyxDQUFDLE1BQU0sQ0FDaEMsT0FBTyxDQUFDLElBQUksRUFDWixPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsK0JBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLG1DQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ2xELENBQUM7S0FDSDtJQUNELE1BQU0sV0FBVyxHQUFHLElBQUksY0FBYyxDQUFDLE9BQU8sQ0FDNUMsK0JBQWlCLENBQUMsYUFBYSxDQUFDLEVBQ2hDLE9BQU8sRUFDUCxNQUFNLENBQ1AsQ0FBQztJQUNGLE1BQU0sT0FBTyxHQUFHLElBQUksY0FBYyxDQUFDLGdDQUFnQyxDQUNqRSxXQUFXLENBQ1osQ0FBQztJQUNGLE1BQU0sRUFBRSxHQUFHLElBQUksbUJBQWEsRUFBRSxDQUFDO0lBQy9CLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdEIsT0FBTyxpQkFBVyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUF6QkQsZ0VBeUJDIn0=