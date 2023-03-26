# Solidity Bridge Contract

This is a Solidity smart contract written in version 0.8.19 that serves as a bridge between two different blockchain networks, allowing users to transfer tokens between them.

## Prerequisites
- Solidity compiler version ^0.8.19
- EVM compatible blockchain network

## Installation
- Clone the repository
- Compile the smart contract using the Solidity compiler
- Deploy the compiled contract on an EVM compatible blockchain network

The contract implements the `LiteBridge` interface, which contains the following functions:

## Functions

### `createRequest`
This function creates a new token transfer request. It takes the following parameters:

- `tokenAddress`: the address of the ERC20 token to transfer.
- `amountFrom`: the amount of tokens to transfer.
- `addressTo`: the address on the other blockchain where the tokens will be sent.
- `tokenAddressTo`: the address of the token on the other blockchain.
- `amountTo`: the amount of tokens to be received on the other blockchain.
- `chainId`: the ID of the other blockchain network.


### `proofRequest`
This function allows a user to provide a proof hash for a token transfer request. It takes the following parameters:

- `addressId`: the ID of the transfer request.
- `proofHash`: the hash of the proof.


### `confirmRequest`
This function confirms a token transfer request. It takes no parameters.

### `closeRequest`
This function closes a token transfer request if it has not been confirmed within 180 seconds. It takes the following parameter:

- `accountId`: the ID of the transfer request.


### `disputeRequest`
This function allows a user to dispute a transfer request if it has not been confirmed within 45 seconds. It takes no parameters.

### `vote`
This function allows users to vote on a disputed transfer request


[![A mushroom-head robot](./images/howwork.jpg 'Codey the Codecademy mascot')]