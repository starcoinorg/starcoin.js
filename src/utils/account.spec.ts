import { stripHexPrefix } from 'ethereumjs-util';
import { generatePrivateKey, generateAccount, showAccount } from "./account";

test('show account', async () => {
  const privateKey = 'e424e16db235e3f3b9ef2475516c51d4c15aa5287ceb364213698bd551eab4f2';
  const accountInfo = await showAccount(privateKey)
  console.log('accountInfo', accountInfo);
  expect(accountInfo.privateKey).toBe(privateKey);
  expect(accountInfo.publicKey).toBe('0x65994ce732bb6a0219099fc93c68583d591b5667161ea08f3b7064319a177228');
  expect(accountInfo.address).toBe('0x701514f6880c1aed801b1710fc8479c9');
  expect(accountInfo.authKey).toBe('0x5e08117aaa458f738fd55d33ae68b17f701514f6880c1aed801b1710fc8479c9');
  expect(accountInfo.receiptIdentifier).toBe('stc1pwq23fa5gpsdwmqqmzug0epree90qsyt64fzc7uu064wn8tngk9lhq9g576yqcxhdsqd3wy8us3uujdmvk0m');
})

test('generate privateKey', () => {
  const privateKey = generatePrivateKey();
  console.log('privateKey', privateKey);
  expect(stripHexPrefix(privateKey).length).toBe(64);
})

test('generate account', async () => {
  const account = await generateAccount();
  console.log('account', account);
  expect(stripHexPrefix(account.privateKey).length).toBe(64);
})
