"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toRPC = void 0;
function toRPC(message) {
    message.jsonrpc = '2.0';
    if (!message.id ||
        typeof message.id !== 'number' ||
        Math.floor(message.id) !== message.id) {
        throw new Error(`Invalid RPC message(invalid id) message: ${JSON.stringify(message)}`);
    }
    if (!message.method ||
        typeof message.method !== 'string' ||
        message.method.trim().length === 0) {
        throw new Error(`Invalid RPC message(invalid method) message: ${JSON.stringify(message)}`);
    }
    if (!message.params || typeof message.params !== 'object') {
        throw new Error(`Invalid RPC message(invalid params) message: ${JSON.stringify(message)}`);
    }
    return message;
}
exports.toRPC = toRPC;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy9jb21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBU0EsU0FBZ0IsS0FBSyxDQUFDLE9BQW1CO0lBQ3ZDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBRXhCLElBQ0UsQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUNYLE9BQU8sT0FBTyxDQUFDLEVBQUUsS0FBSyxRQUFRO1FBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLE9BQU8sQ0FBQyxFQUFFLEVBQ3JDO1FBQ0EsTUFBTSxJQUFJLEtBQUssQ0FDYiw0Q0FBNEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUN0RSxDQUFDO0tBQ0g7SUFFRCxJQUNFLENBQUMsT0FBTyxDQUFDLE1BQU07UUFDZixPQUFPLE9BQU8sQ0FBQyxNQUFNLEtBQUssUUFBUTtRQUNsQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQ2xDO1FBQ0EsTUFBTSxJQUFJLEtBQUssQ0FDYixnREFBZ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUMxRSxDQUFDO0tBQ0g7SUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxPQUFPLE9BQU8sQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFFO1FBQ3pELE1BQU0sSUFBSSxLQUFLLENBQ2IsZ0RBQWdELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FDMUUsQ0FBQztLQUNIO0lBQ0QsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQztBQTdCRCxzQkE2QkMifQ==