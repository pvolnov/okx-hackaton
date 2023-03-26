# Lite bridge

A fast and universal crosschain bridge+sdk that serves small transfers and focuses on the user experience. This allows OKEX dApps users pay with USDT from Polygon in one click

#### CODE

- [Trader](https://github.com/pvolnov/okx-hackaton/tree/main/backend)
- [Backend api](https://github.com/pvolnov/okx-hackaton/tree/main/backend)
- [Oracle sdk](https://github.com/pvolnov/okx-hackaton/tree/main/backend/utils.py)
- [Smart contract code](https://github.com/pvolnov/okx-hackaton/tree/main/bridge-contract/contracts/LiteBridge.sol)
- [Chrome extension](https://github.com/pvolnov/okx-hackaton/tree/main/extension)


## The problem

For many game and NFT users, a single purchase rarely exceeds $25. Existing bridges are focused on large payments, which makes them redundant in terms of security and with a high entry threshold (from $30-50). The need to wait 20-30 minutes to transfer $2-5 raises the entry threshold for those who want to explore OKEX ecosystems


## The solution

**Lite bridge** allows you to crosschain transfers for $3-5 from any network to any network due to the use of a pool of independent traders

## How Lite bridge works:

1. When a user wants to perform a transfer from one network to another, instead of using swaps and bridges, they create a request for a group of traders to execute.

2. The trader closes the request on the network specified by the user and proves it by transmitting the transaction hash.

3. If the user wants to dispute the transaction, they can bring in oracles to verify the correctness of the hash and potentially return the funds and penalize the trader.

## Why Lite bridge will work:

- For transfers between 5-50$, having little liquidity is sufficient and anyone can be a trader.
- High commission (up to 2%) is a good motivation for traders. For small transactions, speed and UX are more important than commission.
- With many traders available, they can quickly fulfill requests on any network.

### Contracts:

Polygon bridge contract: `0x8667e2d2550fd86728d25022ca11dbed68005fc9`

OKEX bridge contract: `0xfe86f88b7954036fc4406611a422c648a566ac62`
