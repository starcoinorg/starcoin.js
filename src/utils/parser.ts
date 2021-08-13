import hexadecimal from 'is-hexadecimal';
import decimal from 'is-decimal';
import alphanumerical from 'is-alphanumerical';
import alphabetical from 'is-alphabetical';
import whitespace from 'is-whitespace-character';
import {  TypeTag } from '../types';
import { fromHexString } from './hex';

type Token =
  'U8Type'
  | 'U64Type'
  | 'U128Type'
  | 'BoolType'
  | 'AddressType'
  | 'VectorType'
  | { WhiteSpace: string }
  | { Name: string }
  | { Address: string }
  | { U8: string }
  | { U64: string }
  | { U128: string }
  | { Bytes: string }
  | 'True'
  | 'False'
  | 'ColonColon'
  | 'Lt'
  | 'Gt'
  | 'Comma'
  | 'EOF';


class Parser {
  readonly toks: Token[];
  private cur_idx: number = 0;

  constructor(toks: Token[]) {
    this.toks = toks;
  }

  next_tok(): Token {
    let tok = this.toks[this.cur_idx++];
    if (tok === undefined) {
      throw new Error('out of token, this should not happen');
    }
    return tok;
  }

  peek(): Token | undefined {
    return this.toks[this.cur_idx];
  }

  consume_tok(tok: Token) {
    let t = this.next_tok();
    if (t != tok) {
      throw new Error(`expected tok: ${tok}, got: ${t}`);
    }
  }

  parse_comma_list<R>(parse_list_item: (x: Parser) => R, end_token: Token, allow_trailing_comma: boolean): R[] {
    let v = [];
    const head = this.peek();
    if (!(head === end_token)) {
      while (true) {
        v.push(parse_list_item(this));
        if (this.peek() === end_token) {
          break;
        }
        this.consume_tok('Comma');
        if (this.peek() === end_token && allow_trailing_comma) {
          break;
        }
      }
    }
    return v;
  }

  parseTypeTag(): TypeTag {
    let tok = this.next_tok();
    if (tok === 'U8Type') {
      return 'U8';
    }
    if (tok === 'U64Type') {
      return 'U64';
    }
    if (tok === 'U128Type') {
      return 'U128';
    }
    if (tok === 'BoolType') {
      return 'Bool';
    }
    if (tok === 'AddressType') {
      return 'Address';
    }
    if (tok === 'VectorType') {
      this.consume_tok('Lt');
      let ty = this.parseTypeTag();
      this.consume_tok('Gt');
      return { Vector: ty };
    }
    if (tok['Address'] !== undefined) {
      let addr = tok['Address'];
      this.consume_tok('ColonColon');

      let module_tok = this.next_tok();
      if (module_tok['Name'] === undefined) {
        throw new Error(`expected name, got: ${module_tok}`);
      }
      let module = module_tok['Name'];

      this.consume_tok('ColonColon');
      let struct_tok = this.next_tok();

      if (struct_tok['Name'] === undefined) {
        throw new Error(`expected name, got: ${module_tok}`);
      }

      let struct_name = struct_tok['Name'];

      let tyArgs = [];
      if (this.peek() === 'Lt') {
        this.consume_tok('Lt');
        tyArgs = this.parse_comma_list(p => p.parseTypeTag(), 'Gt', true);
        this.consume_tok('Gt');
      }

      return {
        Struct: {
          address: addr,
          module: module,
          name: struct_name,
          type_params: tyArgs
        }
      };
    }

    throw new Error(`unexpected token ${tok}, expected type tag`);
  }

  // parseTransactionArgument(): TransactionArgument {
  //   let tok = this.next_tok();
  //   // @ts-ignore
  //   if (tok.U8 !== undefined) {
  //     // @ts-ignore
  //     return {U8: Number.parseInt(tok.U8)};
  //   }
  //   // @ts-ignore
  //   if (tok.U64 !== undefined) {
  //     // @ts-ignore
  //     return {U64: BigInt(tok.U64)};
  //   }
  //   // @ts-ignore
  //   if (tok.U128 !== undefined) {
  //     // @ts-ignore
  //     return {U128: BigInt(tok.U128)};
  //   }
  //
  //
  //   if (tok === 'True') {
  //     return {Bool: true};
  //   }
  //   if (tok === 'False') {
  //     return {Bool: false};
  //   }
  //
  //   // @ts-ignore
  //   if (tok.Address!==undefined) {
  //     // @ts-ignore
  //     return {Address: tok.Address };
  //   }
  //   // @ts-ignore
  //   if (tok.Bytes!==undefined) {
  //     // @ts-ignore
  //     return {U8Vector: fromHexString(tok.Bytes)};
  //   }
  //
  //   throw new Error(`unexpected token ${tok}, expected transaction argument`);
  // }
}

// parse a number from string.
function nextNumber(s: string): [Token, number] {
  let num = '';
  let i = 0;
  while (i < s.length) {
    let c = s[i++];
    // parse number
    if (decimal(c)) {
      num = num.concat(c);
    } else if (alphabetical(c)) { // if come across a char, parse as suffix.
      let suffix = c;
      while (i < s.length) {
        let c = s[i++];
        if (alphanumerical(c)) {
          suffix = suffix.concat(c);
        } else {
          break;
        }
      }
      const len = num.length + suffix.length;
      switch (suffix) {
        case 'u8':
          return [{ U8: num }, len];
        case 'u64':
          return [{ U64: num }, len];
        case 'u128':
          return [{ U128: num }, len];
        default:
          throw new Error('invalid suffix');
      }
    } else {
      break;
    }
  }
  return [{ U64: num }, num.length];
}

function nameToken(s: string): Token {
  switch (s) {
    case 'u8':
      return 'U8Type';
    case 'u64':
      return 'U64Type';
    case 'u128':
      return 'U128Type';
    case 'bool':
      return 'BoolType';
    case 'address':
      return 'AddressType';
    case 'vector':
      return 'VectorType';
    case 'true':
      return 'True';
    case 'false':
      return 'False';
    default:
      return { Name: s };
  }
}
function nextToken(s: string): [Token, number] | undefined {
  if (s.length === 0) {
    return undefined;
  }
  let head = s[0];
  if (head === '<') {
    return ['Lt', 1];
  }
  if (head === '>') {
    return ['Gt', 1];
  }
  if (head === ',') {
    return ['Comma', 1];
  }

  if (head === ':') {
    if (s[1] === ':') {
      return ['ColonColon', 2];
    } else {
      throw new Error('unrecognized token');
    }
  }
  if (head === '0' && ['x', 'X'].includes(s[1])) {
    if (hexadecimal(s[2])) {
      let r = '0x';
      for (let i = 2; i < s.length; i++) {
        if (hexadecimal(s[i])) {
          r = r.concat(s[i]);
        } else {
          break;
        }
      }
      return [{ Address: r }, r.length];
    } else {
      throw new Error('unrecognized token');
    }
  }
  if (decimal(head)) {
    return nextNumber(s);
  }

  // parse bytes start with b.
  if (head === 'b' && s[1] === '"') {
    let r = '';
    let i = 2;
    while (true) {
      if (i >= s.length) {
        throw new Error('unrecognized token');
      }
      let c = s[i++];
      if (c === '"') {
        break;
      } else if (isAscii(c)) {
        r = r.concat(c);
      } else {
        throw new Error('unrecognized token');
      }
    }

    return [{ Bytes: r }, r.length + 3];
  }

  // parse bytes start with x.
  if (head === 'x' && s[1] === '"') {
    let r = '';
    let i = 2;
    while (true) {
      if (i >= s.length) {
        throw new Error('unrecognized token');
      }
      let c = s[i++];
      if (c === '"') {
        break;
      } else if (hexadecimal(c)) {
        r = r.concat(c);
      } else {
        throw new Error('unrecognized token');
      }
    }
    return [{ Bytes: r }, r.length + 3];
  }


  // parse name token.
  if (alphabetical(head) || ['-','_'].includes(head)) {
    let r = '';
    for (let i = 0; i < s.length; i++) {
      if (alphanumerical(s[i]) || ['-','_'].includes(s[i])) {
        r = r.concat(s[i]);
      } else {
        break;
      }
    }
    return [nameToken(r), r.length];
  }

  // parse whitespace.
  if (whitespace(head)) {
    let r = '';
    for (let i = 0; i < s.length; i++) {
      if (whitespace(s[i])) {
        r = r.concat(s[i]);
      } else {
        break;
      }
    }
    return [{ WhiteSpace: r }, r.length];
  }

  throw new Error('unrecognized token');
}

function tokenize(s: string): Token[] {
  let v = [];
  while (true) {
    // @ts-ignore
    let nextTok = nextToken(s);
    if (nextTok === undefined) {
      break;
    }
    let [tok, n] = nextTok;
    v.push(tok);
    s = s.substring(n);
  }
  return v;
}




function isAscii(character): boolean {
  var code = typeof character === 'string' ? character.charCodeAt(0) : character;

  return code <= 0x7F;
}


function parse<T>(s: string, f: (p: Parser) => T): T {
  // @ts-ignore
  let toks = tokenize(s).filter(t => t.WhiteSpace === undefined);
  toks.push('EOF');
  let parser = new Parser(toks);
  let res = f(parser);
  parser.consume_tok('EOF');
  return res;
}

export function parseTypeTags(s: string): TypeTag[] {
  return parse(s, p => {
    return p.parse_comma_list(p => p.parseTypeTag(), 'EOF', true);
  });
}
export function parseTypeTag(s: string): TypeTag {
  return parse(s, p => p.parseTypeTag());
}

// export fuction parseTransactionArguments(s: string): TransactionArgument[] {
//   return parse(s, p => {
//     return p.parse_comma_list(p => p.parseTransactionArgument(), 'EOF', true);
//   });
// }
// export function parseTransactionArgument(s: string): TransactionArgument {
//   return parse(s, p => p.parseTransactionArgument());
// }
