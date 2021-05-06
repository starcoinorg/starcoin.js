# Changelog

All notable changes to this project will be documented in this file, as of version `0.2.0`.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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