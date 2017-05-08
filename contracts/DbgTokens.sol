pragma solidity ^0.4.2;

contract Token {
  function totalSupply () constant returns (uint256 supply);
  function balanceOf (address _owner) constant returns (uint256 balance);
  function transfer (address _to, uint256 _value) returns (bool success);
  function transferFrom (address _from, address _to, uint256 _value)
  returns (bool success);
  function approve (address _spender, uint256 _value) returns (bool success);
  function allowance (address _owner, address _spender) constant
  returns (uint256 remaining);

  event Transfer (address indexed _from, address indexed _to, uint256 _value);
  event Approval (
    address indexed _owner, address indexed _spender, uint256 _value);
}

contract TestToken is Token {

    mapping(address => uint256) balances;

    // Owner of account approves the transfer of an amount to another account
    mapping(address => mapping (address => uint256)) allowed;

    // Pre-allocale tokens to addresses hard-coded in the browser compiler
    // https://ethereum.github.io/browser-solidity/
    function TestToken() {
        balances[0xca35b7d915458ef540ade6068dfe2f44e8fa733c] = 1000;
        balances[0x14723a09acff6d2a60dcdf7aa4aff308fddc160c] = 1000;
        balances[0x4b0897b0513fdc7c541b6d9d7e929c4e5364d2db] = 1000;
        balances[0x583031d1113ad414f02576bd6afabfb302140225] = 1000;
        balances[0xdd870fa1b7c4700f2bd7f44238821c26f7392148] = 1000;
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

    // Send _value amount of tokens from address _from to address _to
    // The transferFrom method is used for a withdraw workflow, allowing contracts to send
    // tokens on your behalf, for example to "deposit" to a contract address and/or to charge
    // fees in sub-currencies; the command should fail unless the _from account has
    // deliberately authorized the sender of the message via some mechanism; we propose
    // these standardized APIs for approval:
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) returns (bool success) {
        if (balances[_from] >= _amount
            && allowed[_from][msg.sender] >= _amount
            && _amount > 0
            && balances[_to] + _amount > balances[_to]) {
            balances[_from] -= _amount;
            allowed[_from][msg.sender] -= _amount;
            balances[_to] += _amount;
            Transfer(_from, _to, _amount);
            return true;
        } else {
            return false;
        }
    }

    // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
    // If this function is called again it overwrites the current allowance with _value.
    function approve(address _spender, uint256 _amount) returns (bool success) {
        allowed[msg.sender][_spender] = _amount;
        Approval(msg.sender, _spender, _amount);
        return true;
    }

    function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }
}

