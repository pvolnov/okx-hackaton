from pydantic import BaseModel, Field
from web3 import Account
from web3 import Web3
from web3._utils.events import get_event_data
from web3.gas_strategies.time_based import fast_gas_price_strategy
from web3.middleware import geth_poa_middleware

from configs import TokenEnum, RPC_BY_CHAIN, ENV_CONF, ABI


class NewRequestEvent(BaseModel):
    address_id: str = Field(..., alias="addressId")
    token_address: str = Field(..., alias="tokenAddress")
    amount_from: int = Field(..., alias="amountFrom")
    address_to: str = Field(..., alias="addressTo")
    token_address_to: str = Field(..., alias="tokenAddressTo")
    amount_to: int = Field(..., alias="amountTo")
    chain_id: int = Field(..., alias="chainId")
    block_number: int = 0


class BridgeRequest(BaseModel):
    token_address: str
    amount_from: int
    address_to: str
    token_address_to: str
    amount_to: int
    chain_id: TokenEnum
    last_update_ts: int
    proof_hash: str


def send_token(to_, amount: float, chain: TokenEnum):
    w3 = Web3(Web3.HTTPProvider(RPC_BY_CHAIN[chain]))
    w3.eth.set_gas_price_strategy(fast_gas_price_strategy)

    sender_account = Account.from_key(ENV_CONF["PRIVATE_KEY"])

    nonce = w3.eth.get_transaction_count(sender_account.address)

    trx = {
        "to": to_,
        "chainId": w3.eth.chain_id,
        "nonce": nonce,
        "value": w3.to_wei(amount, "ether"),
        "gasPrice": w3.eth.generate_gas_price(),
        "gas": 1000000,
    }
    signed_tx = sender_account.signTransaction(trx)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    return w3.to_hex(tx_hash)


def confirm_request_pol(address, hash_proof):
    w3 = Web3(Web3.HTTPProvider(RPC_BY_CHAIN[TokenEnum.MATIC]))
    w3.eth.set_gas_price_strategy(fast_gas_price_strategy)
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)

    sender_account = Account.from_key(ENV_CONF["PRIVATE_KEY"])
    my_contract = w3.eth.contract(address=ENV_CONF["BRIDGE_CONTRACT_POL"], abi=ABI)

    # gasPrice = w3.eth.generate_gas_price()

    transaction = {
        "from": ENV_CONF["ACCOUNT_ID"],
        "to": my_contract.address,
        "gas": 2000000,
        "chainId": w3.eth.chain_id,
        "gasPrice": w3.to_wei("100", "gwei"),
        "nonce": w3.eth.get_transaction_count(sender_account.address),
        "data": my_contract.encodeABI(
            fn_name="proofRequest", args=[address, hash_proof]
        ),
    }

    signed_txn = sender_account.sign_transaction(transaction)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    return w3.to_hex(tx_hash)


def create_test_request(address):
    w3 = Web3(Web3.HTTPProvider(RPC_BY_CHAIN[TokenEnum.MATIC]))
    w3.eth.set_gas_price_strategy(fast_gas_price_strategy)
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)

    sender_account = Account.from_key(ENV_CONF["PRIVATE_KEY"])
    my_contract = w3.eth.contract(address=ENV_CONF["BRIDGE_CONTRACT_POL"], abi=ABI)

    transaction = {
        "from": ENV_CONF["ACCOUNT_ID"],
        "to": my_contract.address,
        "gas": 2000000,
        "gasPrice": w3.to_wei("100", "gwei"),
        "nonce": w3.eth.get_transaction_count(sender_account.address),
        "data": my_contract.encodeABI(
            fn_name="createRequest",
            args=[
                "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
                1,
                address,
                "0x0000000000000000000000000000000000000000",
                1,
                0,
            ],
        ),
    }

    signed_txn = sender_account.sign_transaction(transaction)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    return w3.to_hex(tx_hash)


def get_new_bridge_events():
    with open("last_block.d", "r") as f:
        block_number = int(f.read() or "0")
        # block_number = 0

    w3 = Web3(Web3.HTTPProvider(RPC_BY_CHAIN[TokenEnum.MATIC]))
    my_contract = w3.eth.contract(address=ENV_CONF["BRIDGE_CONTRACT_POL"], abi=ABI)
    event_template = my_contract.events.newRequest

    last_scanned_block = max(block_number, w3.eth.block_number - 10000)
    events = w3.eth.get_logs(
        {
            "fromBlock": last_scanned_block,
            "toBlock": w3.eth.block_number,
            "address": ENV_CONF["BRIDGE_CONTRACT_POL"],
        }
    )
    res = []
    for event in events:
        result = get_event_data(
            event_template.w3.codec, event_template._get_event_abi(), event
        )
        res.append(NewRequestEvent(**result["args"], block_number=event.blockNumber))

    with open("last_block.d", "w") as f:
        f.write(str(w3.eth.block_number + 1))
    return res


def get_request(address):
    w3 = Web3(Web3.HTTPProvider(RPC_BY_CHAIN[TokenEnum.MATIC]))
    my_contract = w3.eth.contract(address=ENV_CONF["BRIDGE_CONTRACT_POL"], abi=ABI)
    data = my_contract.functions.getRequest(address).call()
    return BridgeRequest(
        token_address=data[0],
        amount_from=data[1],
        address_to=data[2],
        token_address_to=data[3],
        amount_to=data[4],
        chain_id=min(data[5], 1),
        last_update_ts=data[6],
        proof_hash=data[7],
    )


def check_request(r: BridgeRequest):
    w3 = Web3(Web3.HTTPProvider(RPC_BY_CHAIN[r.chain_id]))

    res = w3.eth.get_transaction_receipt("0xfbf597c0f97d915be54d9d53a36ae4b2ff07865a05924961cf6c42f3e81a6882")

    if not r.proof_hash:
        return False
    if res['status'] == 1 and res['to'] == r.token_address_to:
        # TODO check amount
        return True

