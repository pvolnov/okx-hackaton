from fastapi import FastAPI
from pydantic import BaseModel

from configs import TokenEnum

app = FastAPI()


class TokenSwap(BaseModel):
    chain: TokenEnum
    token_address: str
    usd_rate: float
    sell: bool


@app.get("/options")
def options():
    return [
        TokenSwap(
            chain=TokenEnum.MATIC,
            token_address="0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            usd_rate=0.98,
            sell=True,
        ),
        TokenSwap(
            chain=TokenEnum.OKT,
            token_address="0x0000000000000000000000000000000000000000",
            usd_rate=20.5,
            sell=False,
        ),
    ]
