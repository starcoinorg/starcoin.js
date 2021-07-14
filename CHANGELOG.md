# Changelog

All notable changes to this project will be documented in this file, as of version `0.2.0`.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.3] - 2021-07-14
- add test case for deploy contract using blob hex
    * `yarn test:unit src/providers/jsonrpc-provider.spec.ts --testNamePattern="deploy contract"`

- add test case for decode SignedMessage
    * `yarn test:unit src/utils/signed-message.spec.ts --testNamePattern="decode"`

- add chain_id in SignedMessage

- add encoding.packageHexToTransactionPayload / packageHexToTransactionPayloadHex

- support contract.dry_run_raw

## [1.4.2] - 2021-07-11
- add 2 functions in utils.signedMessage
    * encodeSignedMessage
    * recoverSignedMessageAddress
    
- add 2 test cases
    * `yarn test:unit src/utils/signed-message.spec.ts --testNamePattern="encode SignedMessage: simple-keyring"`
    * `yarn test:unit src/utils/signed-message.spec.ts --testNamePattern="encode SignedMessage: hd-keyring"`

- support `Personal Sign` in [starmask-test-dapp](https://github.com/starcoinorg/starmask-test-dapp)

## [1.3.0] - 2021-06-27
- add utils.tx.encodeStructTypeTags

## [1.2.1] - 2021-06-14
- fix: hexStripZeros will delete the first 0 if address is start with 0x0, use addHexPrefix indeed

## [1.2.0] - 2021-06-12
- payload of generateRawUserTransaction should be caculated from outside and be passed in 
- add test case for 0x1::DaoVoteScripts::cast_vote

## [1.1.0] - 2021-06-11

### Changed
- add Web3Provider
- replace JsonrpcProvider with JsonRpcProvider
- support `Send STC` in [starmask-test-dapp](https://github.com/starcoinorg/starmask-test-dapp)

###
## [1.0.3] - 2021-06-09

### Changed
- Remove jsSHA package and still use js-sha3 to hash
- Fix buffer error in browser

## [0.2.7] - 2021-05-07

### Changed
- Remove util TextEncoder & TextDecoder

## [0.2.5] - 2021-05-07

### Changed
- Use 'util' package to get 'util.TextEncoder', supporting node.js 10

## [0.2.4] - 2021-05-06

### Changed
- Add utils.tx.generateRawUserTransaction
- Add utils.tx.signRawUserTransaction
- Remove utils.tx.generateSignedUserTransactionHex
- Modify related test cases in encoding/index.spec.ts and providers/jsonrpc-provider.spec.ts

## [0.2.3] - 2021-04-30

### Changed
- Add functions to convert private key to public key and public key to auth key & address (#16)

## [0.2.2] - 2021-04-28

### Changed
- Add event decoding

## [0.2.1] - 2021-04-28

### Changed
- Add utils.tx.generateSignedUserTransactionHex
