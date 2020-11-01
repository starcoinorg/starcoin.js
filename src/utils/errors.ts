export function InvalidNumberOfMoveArgs(given: number, expected: number) {
  return new Error(
    `Invalid number of arguments to Move function. given: ${given}, expected: ${expected}`
  );
}

export function InvalidNumberOfRPCParams(
  methodName: string,
  given: number,
  expected: number
) {
  return new Error(
    `Invalid number of input parameters to RPC method "${methodName}" given: ${given}, expected: ${expected}`
  );
}

export function InvalidConnection(host: string) {
  return new Error("CONNECTION ERROR: Couldn't connect to node " + host + '.');
}

export function InvalidProvider() {
  return new Error('Provider not set or invalid');
}

export function InvalidResponse(result: any) {
  const message =
    !!result && !!result.error && !!result.error.message
      ? result.error.message
      : 'Invalid JSON RPC response: ' + JSON.stringify(result);
  return new Error(message);
}

export function ConnectionTimeout(ms: number) {
  return new Error('CONNECTION TIMEOUT: timeout of ' + ms + ' ms achived');
}
