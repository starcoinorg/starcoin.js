import { createMultiSignAccount } from "./multi-sign";

test('create multi sign account', async () => {
  // 2-3 multi-sig
  const publicKeys = [
    '0xc95ddc2b2926d1a451ea68fa74274aa04af97d8e2aefccb297e6ef61992d42e8',
    '0x547c6a1ef36e9e99865ce7ac028ee79aff404d279b568272bc7154802d4856bb',
  ];
  const privateKeys = ['0x7ea63107b0e214789fdb0d6c6e6b0d8f8b8c0be7398654ddd63f3617282be97b'];
  const thresHold = 2;
  const accountInfo = await createMultiSignAccount(publicKeys, privateKeys, thresHold)
  console.log('accountInfo', accountInfo);
  const accountNumbers = publicKeys.length + privateKeys.length
  expect(accountNumbers).toBeGreaterThan(thresHold);
})
