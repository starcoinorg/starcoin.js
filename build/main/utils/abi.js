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
exports.decodeABI = void 0;
const lcs_1 = require("../lib/runtime/lcs");
const starcoin_types = __importStar(require("../lib/runtime/starcoin_types"));
const lcs_to_json = __importStar(require("../utils/lcs_to_json"));
function decodeABI(bytes) {
    const de = new lcs_1.LcsDeserializer(bytes);
    const abi = starcoin_types.ScriptABI.deserialize(de);
    return {
        args: abi.args.map((a) => ({
            name: a.name,
            type_tag: lcs_to_json.type_tag_to_json(a.type_tag),
        })),
        code: abi.code,
        doc: abi.doc,
        name: abi.name,
        ty_args: abi.ty_args.map((t) => ({
            name: t.name,
        })),
    };
}
exports.decodeABI = decodeABI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL2FiaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNENBQXFEO0FBQ3JELDhFQUFnRTtBQUVoRSxrRUFBb0Q7QUFFcEQsU0FBZ0IsU0FBUyxDQUFDLEtBQWlCO0lBQ3pDLE1BQU0sRUFBRSxHQUFHLElBQUkscUJBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN0QyxNQUFNLEdBQUcsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNyRCxPQUFPO1FBQ0wsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pCLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtZQUNaLFFBQVEsRUFBRSxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztTQUNuRCxDQUFDLENBQUM7UUFDSCxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7UUFDZCxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUc7UUFDWixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7UUFDZCxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDL0IsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJO1NBQ2IsQ0FBQyxDQUFDO0tBQ0osQ0FBQztBQUNKLENBQUM7QUFmRCw4QkFlQyJ9