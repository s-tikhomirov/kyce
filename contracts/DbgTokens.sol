pragma solidity ^0.4.2;

contract DbgTokens {
  event Transfer (address indexed _from, address indexed _to, uint256 _value);
  event Approval (
    address indexed _owner, address indexed _spender, uint256 _value);

    mapping(address => uint256) balances;

    // Owner of account approves the transfer of an amount to another account
    mapping(address => mapping (address => uint256)) allowed;

    // Pre-allocale tokens to addresses hard-coded in the browser compiler
    // https://ethereum.github.io/browser-solidity/
    function DbgTokens() {
    }
    function debug_set_balance(address who, uint value) {
        balances[who] = value;
    }

    // What is the balance of a particular account?
    function balanceOf(address _owner) constant returns (uint256 balance) {
        return balances[_owner];
    }

    // Transfer the balance from owner's account to another account
    function transfer(address _to, uint256 _amount) returns (bool success) {
        if (balances[msg.sender] >= _amount
        && _amount > 0
        && balances[_to] + _amount > balances[_to]) {
            balances[msg.sender] -= _amount;
            balances[_to] += _amount;
            Transfer(msg.sender, _to, _amount);
            return true;
        } else {
            return false;
        }
    }


}

