import time

from utils import (
    get_new_bridge_events,
    NewRequestEvent,
    get_request,
    send_token,
    confirm_request_pol,
)


def process_event(ev: NewRequestEvent):
    req = get_request(ev.address_id)
    print(req)
    if not req.proof_hash:
        try:
            hsh = confirm_request_pol(ev.address_id, "121212")
            print("hsh", hsh)
        except Exception as e:
            print(e)
            pass

        try:
            proof_hash = send_token(
                req.address_to, min(req.amount_to, 0.001), req.chain_id
            )
            print(f"Transfer {req.amount_to} on {req.chain_id.name}: {proof_hash}")
        except Exception as e:
            print(e)
            pass


while True:
    events = get_new_bridge_events()
    for e in events:
        process_event(e)
    print("-")
    time.sleep(1)
