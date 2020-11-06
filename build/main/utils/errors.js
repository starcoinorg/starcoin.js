"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionTimeout = exports.InvalidResponse = exports.InvalidProvider = exports.InvalidConnection = exports.InvalidNumberOfRPCParams = exports.InvalidNumberOfMoveArgs = void 0;
function InvalidNumberOfMoveArgs(given, expected) {
    return new Error(`Invalid number of arguments to Move function. given: ${given}, expected: ${expected}`);
}
exports.InvalidNumberOfMoveArgs = InvalidNumberOfMoveArgs;
function InvalidNumberOfRPCParams(methodName, given, expected) {
    return new Error(`Invalid number of input parameters to RPC method "${methodName}" given: ${given}, expected: ${expected}`);
}
exports.InvalidNumberOfRPCParams = InvalidNumberOfRPCParams;
function InvalidConnection(host) {
    return new Error("CONNECTION ERROR: Couldn't connect to node " + host + '.');
}
exports.InvalidConnection = InvalidConnection;
function InvalidProvider() {
    return new Error('Provider not set or invalid');
}
exports.InvalidProvider = InvalidProvider;
function InvalidResponse(result) {
    const message = !!result && !!result.error && !!result.error.message
        ? result.error.message
        : 'Invalid JSON RPC response: ' + JSON.stringify(result);
    return new Error(message);
}
exports.InvalidResponse = InvalidResponse;
function ConnectionTimeout(ms) {
    return new Error('CONNECTION TIMEOUT: timeout of ' + ms + ' ms achived');
}
exports.ConnectionTimeout = ConnectionTimeout;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL2Vycm9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxTQUFnQix1QkFBdUIsQ0FBQyxLQUFhLEVBQUUsUUFBZ0I7SUFDckUsT0FBTyxJQUFJLEtBQUssQ0FDZCx3REFBd0QsS0FBSyxlQUFlLFFBQVEsRUFBRSxDQUN2RixDQUFDO0FBQ0osQ0FBQztBQUpELDBEQUlDO0FBRUQsU0FBZ0Isd0JBQXdCLENBQ3RDLFVBQWtCLEVBQ2xCLEtBQWEsRUFDYixRQUFnQjtJQUVoQixPQUFPLElBQUksS0FBSyxDQUNkLHFEQUFxRCxVQUFVLFlBQVksS0FBSyxlQUFlLFFBQVEsRUFBRSxDQUMxRyxDQUFDO0FBQ0osQ0FBQztBQVJELDREQVFDO0FBRUQsU0FBZ0IsaUJBQWlCLENBQUMsSUFBWTtJQUM1QyxPQUFPLElBQUksS0FBSyxDQUFDLDZDQUE2QyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztBQUMvRSxDQUFDO0FBRkQsOENBRUM7QUFFRCxTQUFnQixlQUFlO0lBQzdCLE9BQU8sSUFBSSxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztBQUNsRCxDQUFDO0FBRkQsMENBRUM7QUFFRCxTQUFnQixlQUFlLENBQUMsTUFBVztJQUN6QyxNQUFNLE9BQU8sR0FDWCxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU87UUFDbEQsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTztRQUN0QixDQUFDLENBQUMsNkJBQTZCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM3RCxPQUFPLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFORCwwQ0FNQztBQUVELFNBQWdCLGlCQUFpQixDQUFDLEVBQVU7SUFDMUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsR0FBRyxFQUFFLEdBQUcsYUFBYSxDQUFDLENBQUM7QUFDM0UsQ0FBQztBQUZELDhDQUVDIn0=