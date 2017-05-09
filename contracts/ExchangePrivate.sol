/*

Two parties want to trade privately without revealing their orders before execution.
1. Alice and Bob commit to orders
2. Alice and Bob reveal orders
3. Orders get matched and executed.
Advantage: parties can not change orders they commited to.
Problem: if Alice reveals first, Bob can abort and not reveal (deal cancelled).
Solution: legal contract forbiding such behavior (Alice and Bob are banks).

*/

pragma solidity ^0.4.11;

import "./Tokens.sol";

contract ExchangePrivate {
    
    mapping (address => uint) balance;
    
    struct Order {
        bool isBid;
        address tokenAddress;
        address author;
        uint amount;
        uint price;
    }

    // store dummy order as value until it is decrypted
    mapping(bytes32 => Order) orders;
    
    // submit sha3(key || nonce) ^ sha3(order)
    function commitToOrder(bytes32 commitment) {
        Order memory order = Order({
            isBid: false,
            tokenAddress: 0x0,
            author: 0x0,
            amount: 0,
            price: 0
        });
        orders[commitment] = order;
    }
    
    // check validity; if valid replace value in mapping with actual order
    function revealOrder(bytes32 commitment, bytes32 key, uint32 nonce,
        bool _isBid, address _tokenAddress, uint _amount, uint _price)
    returns (bool valid) {
        Order memory order = Order({
            isBid: _isBid,
            tokenAddress: _tokenAddress,
            author: msg.sender,
            amount: _amount,
            price: _price
        });
        if (isValid(commitment, order, key))
            orders[commitment] = order;
    }
    
    // TODO: add nonce?
    function isValid(bytes32 commitment, Order order, bytes32 key)
    internal
    returns (bool valid) {
        return ((sha3(key) ^ sha3(order)) == commitment);
    }
    
    function matchOrders(bytes32 bidId, bytes32 askId)
    returns (bool didMatch, uint price) {
        var bid = orders[bidId];
        var ask = orders[askId];
        uint256 agreedPrice = 0;
        
        // bid must be bid, ask must be ask
        if (bid.isBid != true || ask.isBid != false || 
            bid.tokenAddress != ask.tokenAddress ||
            bid.amount != ask.amount)
            return (false, agreedPrice);
        
        var tokenAddress = bid.tokenAddress;
        var agreedAmount = bid.amount;
        
        if (bid.price < ask.price) {
            agreedPrice = (bid.price + ask.price / 2);
            
            if(!Token(tokenAddress).transferFrom(ask.author, bid.author, agreedAmount))
                return (false, agreedPrice);
        
            balance[bid.author] -= agreedAmount * agreedPrice;
            balance[ask.author] += agreedAmount * agreedPrice;
            
            delete orders[bidId];
            delete orders[askId];
            
            return (true, agreedPrice);
        }
    }
    
    
    
}

