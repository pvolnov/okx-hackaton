// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

    function transfer(address receiver, uint256 amount) external returns (bool);
}

contract LiteBridge {
    struct Request {
        address tokenAddress;
        uint amountFrom;
        address addressTo;
        address tokenAddressTo;
        uint amountTo;
        uint chainId;
        uint lastUpdateTs;
        string proofHash;
    }

    struct Vote {
        uint totalVotes;
        int result;
        mapping(address => bool) electors;
    }

    event newRequest(
        address addressId,
        address tokenAddress,
        uint amountFrom,
        address addressTo,
        address tokenAddressTo,
        uint amountTo,
        uint chainId
    );

    event newDispute(address addressId);

    mapping(address => Request) public requests;
    mapping(address => Vote) public votes;
    address TRADER = 0x1a42D40B01bfD13e7938312672D72DF09fCfb939;

    constructor() {
        // constructor code here
    }

    function createRequest(
        address tokenAddress,
        uint amountFrom,
        address addressTo,
        address tokenAddressTo,
        uint amountTo,
        uint chainId
    ) public {
        IERC20 token = IERC20(tokenAddress);
        // Transfer the tokens from the user's account to the contract
        require(
            token.transferFrom(msg.sender, address(this), amountFrom),
            "Transfer failed"
        );
        Request memory r = Request(
            tokenAddress,
            amountFrom,
            addressTo,
            tokenAddressTo,
            amountTo,
            chainId,
            block.timestamp,
            ""
        );
        requests[msg.sender] = r;
        emit newRequest(
            msg.sender,
            tokenAddress,
            amountFrom,
            addressTo,
            tokenAddressTo,
            amountTo,
            chainId
        );
    }

    function proofRequest(address addressId, string memory proofHash) public {
        // require((msg.sender == TRADER), "Incroorecc signer");
        require((bytes(proofHash).length != 0), "Null hash is not allowed");

        Request storage r = requests[addressId];
        require((bytes(r.proofHash).length == 0), "Hash already provided");

        r.proofHash = proofHash;
        r.lastUpdateTs = block.timestamp;
    }

    function confirmRequest() public {
        Request storage r = requests[msg.sender];
        IERC20 token = IERC20(r.tokenAddress);
        require(token.transfer(TRADER, r.amountFrom), "Transfer failed");
        delete requests[msg.sender];
    }

    function closeRequest(address accountId) public {
        // close transfer request from backend
        Request storage r = requests[accountId];
        if (r.lastUpdateTs < block.timestamp - 180) {
            require(
                (bytes(r.proofHash).length > 0),
                "Proof hash was not provided yet"
            );

            IERC20 token = IERC20(r.tokenAddress);
            require(token.transfer(TRADER, r.amountFrom), "Transfer failed");
            delete requests[msg.sender];
        }
    }

    function disputeRequest() public {
        // close transfer request from backend
        Request storage r = requests[msg.sender];
        require(
            r.lastUpdateTs < block.timestamp - 45,
            "Too early for open dispute"
        );
        IERC20 token = IERC20(r.tokenAddress);

        if (bytes(r.proofHash).length == 0) {
            require(
                token.transfer(msg.sender, r.amountFrom),
                "Transfer failed"
            );
            delete requests[msg.sender];
        } else {
            Vote storage v = votes[msg.sender];
            v.totalVotes = 0;
            v.result = 0;
            emit newDispute(msg.sender);
        }
    }

    function vote(address addressId, bool status) public {
        // close transfer request from backend
        Vote storage v = votes[addressId];
        require(!v.electors[msg.sender], "Vote already registered");

        if (status) {
            v.result += 1;
        } else {
            v.result -= 1;
        }
        if (v.totalVotes > 9) {
            Request storage r = requests[addressId];
            IERC20 token = IERC20(r.tokenAddress);

            if (v.result > 0) {
                require(
                    token.transfer(addressId, r.amountFrom),
                    "Transfer failed"
                );
            } else {
                require(
                    token.transfer(TRADER, r.amountFrom),
                    "Transfer failed"
                );
            }
            delete requests[addressId];
            delete votes[addressId];
        } else {
            v.totalVotes += 1;
            v.electors[msg.sender] = true;
        }
    }

    function getRequest(
        address addressId
    ) public view returns (Request memory) {
        Request memory v = requests[addressId];
        return v;
    }
}
