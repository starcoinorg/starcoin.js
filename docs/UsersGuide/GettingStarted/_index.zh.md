---
title: 准备开始
weight: 1
---

## 使用说明

1. 安装依赖库

```bash
npm install @starcoin/starcoin
```

2. 按需引入相关package

```typescript
import { providers, utils, bcs, encoding } from '@starcoin/starcoin'；
```
3. 检查Starmask插件是否安装
如果是web dapps， 必须做这一步检查，否则不需要(比如在只是用来decrpyt一个字符串)

```typescript
import StarMaskOnboarding from '@starcoin/starmask-onboarding'

const { isStarMaskInstalled } = StarMaskOnboarding

let onboarding

try {
    onboarding = new StarMaskOnboarding({ forwarderOrigin })
} catch (error) {
    console.error(error)
}

if (!isStarMaskInstalled()) {
    onboardButton.innerText = 'Click here to install StarMask!'
    onboardButton.onclick = onClickInstall
    onboardButton.disabled = false
} else if (isStarMaskConnected()) {
    onboardButton.innerText = 'Connected'
    onboardButton.disabled = true
    if (onboarding) {
        onboarding.stopOnboarding()
    }
} else {
    onboardButton.innerText = 'Connect'
    onboardButton.onclick = onClickConnect
    onboardButton.disabled = false
}

const onClickInstall = () => {
    onboardButton.innerText = 'Onboarding in progress'
    onboardButton.disabled = true
    onboarding.startOnboarding()
}


const accountButtonsDisabled = !isStarMaskInstalled() || !isStarMaskConnected()

```

4. 连接远程节点

必须先检查 Starmask 插件是否安装, 否则无法连接远程节点

```typescript
let starcoinProvider

try {
    // window.starcoin is injected by Starmask(chrome extension)
    if (window.starcoin) {
      // We must specify the network as 'any' for starcoin to allow network changes
      starcoinProvider = new providers.Web3Provider(window.starcoin, 'any')
    }
  } catch (error) {
    console.error(error)
  }
```

5. 注册全局的监听事件

```typescript
// 钱包网络切换
window.starcoin.on('chainChanged', handleNewChain)
window.starcoin.on('networkChanged', handleNewNetwork)

// 钱包帐号切换
window.starcoin.on('accountsChanged', handleNewAccounts)
```

6. 连接Starmask钱包

```typescript
const onClickConnect = async () => {
    try {
        const newAccounts = await window.starcoin.request({
            method: 'stc_requestAccounts',
        })
        handleNewAccounts(newAccounts)
    } catch (error) {
        console.error(error)
    }
}
```

7. 发起一个交易
```typescript
const functionId = '0xb987F1aB0D7879b2aB421b98f96eFb44::MerkleDistributorScript::claim_script'
const tyArgs = ['0x00000000000000000000000000000001::STC::STC']
const record = {
    airDropId: 1629220858501,
    ownerAddress: '0x3f19d5422824f47e6c021978cee98f35',
    root: '0xaacff971f163f956a24068dc5f50e03313e374a1725a8806ff275441f9aa6109',
    address: '0x3f19d5422824f47e6c021978cee98f35',
    idx: 0,
    amount: 1000000000,
    proof: [
      '0xac47a36f0bc7f19afd2baba9c8182e7e8d6dbe2a3eff03f9519fd4b50e6f1960'
    ]
}
const args = [record.ownerAddress, record.airDropId, record.root, record.idx, record.amount, record.proof]

const nodeUrl = 'https://barnard-seed.starcoin.org'

const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)

// // Multiple BcsSerializers should be used in different closures, otherwise, the latter will be contaminated by the former.
const payloadInHex = (function () {
    const se = new bcs.BcsSerializer()
    scriptFunction.serialize(se)
    return hexlify(se.getBytes())
})()

const txParams = {
    data: payloadInHex,
}

const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
console.log({ transactionHash })
```

## 参考
在线demo: [Starmask-test-dapp](https://starmask-test-dapp.starcoin.org/)

源码仓库: [github](https://github.com/starcoinorg/starmask-test-dapp) 