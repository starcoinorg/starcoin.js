export declare function InvalidNumberOfMoveArgs(given: number, expected: number): Error;
export declare function InvalidNumberOfRPCParams(methodName: string, given: number, expected: number): Error;
export declare function InvalidConnection(host: string): Error;
export declare function InvalidProvider(): Error;
export declare function InvalidResponse(result: any): Error;
export declare function ConnectionTimeout(ms: number): Error;
