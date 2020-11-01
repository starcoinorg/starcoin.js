import { IJSONRPCRequest, IProvider } from './IProvider';
import * as errors from './utils/errors';

/**
 * @public
 */
export class Method<T extends any[] = [], V = any> {
  callName: string;
  params: number;
  inputFormatter?: ((...args: any[]) => any)[];
  outputFormatter?: (something: any) => V;

  constructor(options: {
    callName: string;
    params: number;
    inputFormatter?: any[];
    outputFormatter?: (val: any) => V;
  }) {
    this.callName = options.callName;
    this.params = options.params || 0;
    this.inputFormatter = options.inputFormatter;
    this.outputFormatter = options.outputFormatter;
  }

  /**
   * Should be called to check if the number of arguments is correct
   *
   * @param arguments - The list of arguments
   */
  validateArgs(args: any[]) {
    if (args.length !== this.params) {
      throw errors.InvalidNumberOfRPCParams(
        this.callName,
        args.length,
        this.params
      );
    }
  }

  /**
   * Should be called to format input args of method
   *
   * @param args - The array of arguments
   */
  formatInput(args: T) {
    if (!this.inputFormatter) {
      return args;
    }

    return this.inputFormatter.map(function (formatter, index) {
      return formatter ? formatter(args[index]) : args[index];
    });
  }

  /**
   * Should be called to format output(result) of method
   *
   * @param result - The result to be formatted
   */
  formatOutput(result: any): V {
    if (!this.outputFormatter) {
      return result;
    }
    return this.outputFormatter(result);
  }

  /**
   * Should create payload from given input args
   *
   * @param args - The given input arguments
   */
  toPayload(args: T): IJSONRPCRequest {
    const params = this.formatInput(args);

    this.validateArgs(params);

    return {
      method: this.callName,
      params: params,
    };
  }

  async execute(provider: IProvider, ...args: T): Promise<V> {
    const payload = this.toPayload(args);
    if (!provider) throw new Error('Missing Provider in method#exec');
    const result = await provider.request(payload);
    return this.formatOutput(result);
  }
}
