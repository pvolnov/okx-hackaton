from enum import Enum

with open(".env", "r") as f:
    content = f.readlines()
content = [x.strip().split("=") for x in content if "=" in x]
ENV_CONF = {c[0]: c[1] for c in content}


class TokenEnum(int, Enum):
    MATIC = 0
    OKT = 1


RPC_BY_CHAIN = {
    TokenEnum.MATIC: "https://matic-mainnet.chainstacklabs.com",
    TokenEnum.OKT: "https://exchainrpc.okex.org",
}


ABI = [
    {"inputs": [], "stateMutability": "nonpayable", "type": "constructor"},
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": False,
                "internalType": "address",
                "name": "addressId",
                "type": "address",
            }
        ],
        "name": "newDispute",
        "type": "event",
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": False,
                "internalType": "address",
                "name": "addressId",
                "type": "address",
            },
            {
                "indexed": False,
                "internalType": "address",
                "name": "tokenAddress",
                "type": "address",
            },
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "amountFrom",
                "type": "uint256",
            },
            {
                "indexed": False,
                "internalType": "address",
                "name": "addressTo",
                "type": "address",
            },
            {
                "indexed": False,
                "internalType": "address",
                "name": "tokenAddressTo",
                "type": "address",
            },
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "amountTo",
                "type": "uint256",
            },
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "chainId",
                "type": "uint256",
            },
        ],
        "name": "newRequest",
        "type": "event",
    },
    {
        "inputs": [{"internalType": "address", "name": "accountId", "type": "address"}],
        "name": "closeRequest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "confirmRequest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "address", "name": "tokenAddress", "type": "address"},
            {"internalType": "uint256", "name": "amountFrom", "type": "uint256"},
            {"internalType": "address", "name": "addressTo", "type": "address"},
            {"internalType": "address", "name": "tokenAddressTo", "type": "address"},
            {"internalType": "uint256", "name": "amountTo", "type": "uint256"},
            {"internalType": "uint256", "name": "chainId", "type": "uint256"},
        ],
        "name": "createRequest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "disputeRequest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "address", "name": "addressId", "type": "address"}],
        "name": "getRequest",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "tokenAddress",
                        "type": "address",
                    },
                    {
                        "internalType": "uint256",
                        "name": "amountFrom",
                        "type": "uint256",
                    },
                    {"internalType": "address", "name": "addressTo", "type": "address"},
                    {
                        "internalType": "address",
                        "name": "tokenAddressTo",
                        "type": "address",
                    },
                    {"internalType": "uint256", "name": "amountTo", "type": "uint256"},
                    {"internalType": "uint256", "name": "chainId", "type": "uint256"},
                    {
                        "internalType": "uint256",
                        "name": "lastUpdateTs",
                        "type": "uint256",
                    },
                    {"internalType": "string", "name": "proofHash", "type": "string"},
                ],
                "internalType": "struct LiteBridge.Request",
                "name": "",
                "type": "tuple",
            }
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "address", "name": "addressId", "type": "address"},
            {"internalType": "string", "name": "proofHash", "type": "string"},
        ],
        "name": "proofRequest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "requests",
        "outputs": [
            {"internalType": "address", "name": "tokenAddress", "type": "address"},
            {"internalType": "uint256", "name": "amountFrom", "type": "uint256"},
            {"internalType": "address", "name": "addressTo", "type": "address"},
            {"internalType": "address", "name": "tokenAddressTo", "type": "address"},
            {"internalType": "uint256", "name": "amountTo", "type": "uint256"},
            {"internalType": "uint256", "name": "chainId", "type": "uint256"},
            {"internalType": "uint256", "name": "lastUpdateTs", "type": "uint256"},
            {"internalType": "string", "name": "proofHash", "type": "string"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [
            {"internalType": "address", "name": "addressId", "type": "address"},
            {"internalType": "bool", "name": "status", "type": "bool"},
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "votes",
        "outputs": [
            {"internalType": "uint256", "name": "totalVotes", "type": "uint256"},
            {"internalType": "int256", "name": "result", "type": "int256"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
]
