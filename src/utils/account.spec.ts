import { stripHexPrefix } from 'ethereumjs-util';
import { generatePrivateKey, generateAccount, showAccount } from "./account";

test('show account', async () => {
  const privateKey = '0x4715fd6f1caa3bc06da311526b31598beb5a5301a871640550f06963b5edaf20';
  const accountInfo = await showAccount(privateKey)
  console.log('accountInfo', accountInfo);
  expect(accountInfo.privateKey).toBe(privateKey);
  expect(accountInfo.publicKey).toBe('0x9e337a5b8e530483377cbf87668194894a1362031c5bd5b5739d1493c3c16120');
  expect(accountInfo.address).toBe('0x46ece7c1e39fb6943059565e2621b312');
  expect(accountInfo.authKey).toBe('0x64064dbba7aa59ec05c5d3fe354851e446ece7c1e39fb6943059565e2621b312');
  expect(accountInfo.receiptIdentifier).toBe('stc1pgmkw0s0rn7mfgvze2e0zvgdnzfjqvndm5749nmq9chflud2g28jydm88c83eld55xpv4vh3xyxe3ynl36h4');
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
