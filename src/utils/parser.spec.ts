import { parseTypeTag } from './parser';
import { TypeTag } from '../types';

// test('parse_txn_arg_positive', () => {
//   let testCases = [
//     ['  0u8', { U8: 0 }],
//     ['0u8', { U8: 0 }],
//     ['255u8', { U8: 255 }],
//     ['0', { U64: 0n }],
//     ['0123', { U64: 123n }],
//     ['0u64', { U64: 0n }],
//     ['18446744073709551615', { U64: 18446744073709551615n }],
//     ['18446744073709551615u64', { U64: 18446744073709551615n }],
//     ['0u128', { U128: 0n }],
//     [
//       '340282366920938463463374607431768211455u128',
//       { U128: 340282366920938463463374607431768211455n }
//     ],
//     ['true', { Bool: true }],
//     ['false', { Bool: false }],
//     [
//       '0x0',
//       { Address: '0x0' }
//     ],
//     [
//       '0x54afa3526',
//       { Address: '0x54afa3526' }
//     ],
//     [
//       '0X54afa3526',
//       { Address: '0x54afa3526' }
//     ],
//     ['x"7fff"', { U8Vector: new Uint8Array([0x7f, 0xff]) }],
//     ['x""', { U8Vector: new Uint8Array([]) }],
//     ['x"00"', { U8Vector: new Uint8Array([0x00]) }],
//     ['x"deadbeef"', { U8Vector: new Uint8Array([0xde, 0xad, 0xbe, 0xef]) }]
//   ];
//   for (let c of testCases) {
//     let [s, expected] = c;
//     // @ts-ignore
//     let actual = parseTransactionArgument(s);
//     expect(actual).toStrictEqual(expected);
//   }
// });
//
// test('parse_txn_arg_negative', () => {
//   let testCases = [
//     '-3',
//     '0u42',
//     '0u645',
//     '0u64x',
//     '0u6 4',
//     '0u',
//     // "256u8",
//     // "18446744073709551616",
//     // "18446744073709551616u64",
//     // "340282366920938463463374607431768211456u128",
//     '0xg',
//     '0x00g0',
//     '0x',
//     '0x_',
//     '',
//     'x"ffff',
//     'x"a "',
//     'x" "',
//     'x"0g"',
//     // "x\"0\"",
//     'garbage',
//     'true3',
//     '3false',
//     '3 false',
//     ''
//   ];
//   // testCases = ["garbage"];
//   for (let c of testCases) {
//     expect(() => {
//         let args = parseTransactionArgument(c);
//         console.log(`parse ${c} into ${args}`);
//       }
//     ).toThrowError();
//   }
// });

test('parse type_tag', () => {
  let testCases: Array<[string, TypeTag]> = [
    ['u8', 'U8'],
    ['u64', 'U64'],
    ['u128', 'U128'],
    ['address', 'Address'],
    ['bool', 'Bool'],
    ['vector<0x1::M1::S1>', {
      Vector: {
        Struct: {
          address: '0x1',
          module: 'M1',
          name: 'S1',
          type_params: []
        }
      }
    }],
    ['0x1::M1::S2', {
      Struct: {
        address: '0x1',
        module: 'M1',
        name: 'S2',
        type_params: []
      }
    }],
    ['0x1::M1::S2<0x1::M1::S3, 0x1::M1::S4, u128>', {
      Struct: {
        address: '0x1',
        module: 'M1',
        name: 'S2',
        type_params: [
          {
            Struct: {
              address: '0x1',
              module: 'M1',
              name: 'S3',
              type_params: []
            }
          },
          {
            Struct: {
              address: '0x1',
              module: 'M1',
              name: 'S4',
              type_params: []
            }
          },
          'U128'
        ]
      }
    }]
  ];

  for (let c of testCases) {
    let [s, expected] = c;
    let tag = parseTypeTag(s);
    expect(tag).toStrictEqual(expected);
  }
});
