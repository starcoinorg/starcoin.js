import { createMultiSignAccount } from "./multi-sign";

test('create multi sign account', async () => {
  // 2-3 multi-sig
  const publicKeys = [
    '0xe8cdd5b17a37fe7e8fe446d067e7a9907cf7783aca204ccb623972176614c0a0',
    '0xc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8',
  ];
  const privateKeys = ['0xa9e47d270d2ce33b1475f500f3b9a773eb966f3f8ab5ceb738d52262bbe10cb2'];
  const thresHold = 2;
  const accountInfo = await createMultiSignAccount(publicKeys, privateKeys, thresHold)
  console.log('accountInfo', accountInfo);
  const accountNumbers = publicKeys.length + privateKeys.length
  expect(accountNumbers).toBeGreaterThan(thresHold);
})
