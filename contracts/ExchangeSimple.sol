pragma solidity ^0.4.10;

contract ERC20Token{
    function transferFrom (address _from, address _to, uint256 _value)
    returns (bool success);
    
      function transfer (address _to, uint256 _value)
    returns (bool success);
    
    function allowance(address _owner, address _spender)
    constant
    returns (uint256 remaining);
    
    function balanceOf (address _owner) constant returns (uint256 balance);
    
}

contract Exchange{
    
    struct Order{
        address tokenContract;
        uint tokens;
        uint value;
        address sender;
        bool isBid; //1 if bid 0 if ask
        uint index; //internal indexing
    }
    
    mapping (bytes32 => Order) orders;
    bytes32[] ordersIndex;
    
    event OrderPlaced(address indexed _token, uint _tokens, uint _value, 
        address indexed _sender, bool isBid, uint _index, bytes32 _id);
	event Executed(address indexed orders[id].tokenContract, address indexed  orders[id].sender, uint orders[id].tokens, 
	uint orders[id].value, 
        address indexed  msg.sender, bool orders[id].isBid);
	event Removed(bytes32);
    
    //Want to buy _tokens of type  _tokenContract for msg.value
    function ask(address _tokenContract, uint _tokens) payable returns (bytes32){
        bytes32 id  = sha3(block.number, msg.data);
        orders[id] = 
            Order(_tokenContract,  _tokens, msg.value, msg.sender,false, ordersIndex.length++);
        ordersIndex[orders[id].index] = id;
        OrderPlaced(orders[id].tokenContract, orders[id].tokens, orders[id].value, 
        orders[id].sender, orders[id].isBid, orders[id].index, id);
        return id;
    }
    
    //Want to sell _tokens of  type  _tokenContract for value
    function bid(address _tokenContract, uint _tokens, uint _value) returns (bytes32){
        bytes32 id = sha3(block.number, msg.data);
        orders[id] = 
            Order(_tokenContract,  _tokens, _value, msg.sender,true, ordersIndex.length++);
        ordersIndex[orders[id].index] = id;
        OrderPlaced(orders[id].tokenContract, orders[id].tokens, orders[id].value, 
        orders[id].sender, orders[id].isBid, orders[id].index, id);
        return id;
    }
	
	function revokeOrder(bytes32 _id)
	{
		if(orders[_id].sender!= msg.sender) throw;
		if(!orders[_id].isBid)
			if(!msg.sender.send(orders[_id].value)) throw;
		remove(_id);
	}
    
    function getOrder(uint _index) constant returns (address _tokenContract,
        uint _tokens,  uint _value, address _sender, bool _isBid, bytes32 _id)
        {
            return (orders[ordersIndex[_index]].tokenContract, orders[ordersIndex[_index]].tokens,
            orders[ordersIndex[_index]].value,orders[ordersIndex[_index]].sender,
            orders[ordersIndex[_index]].isBid, ordersIndex[_index]);
        }
    
	//Execute a bid or an ask
    function execute(bytes32 id) payable returns (bool){
        if(orders[id].tokenContract==0) throw;
        ERC20Token token = ERC20Token(orders[id].tokenContract);
        if(orders[id].isBid){  //it is bid
            if(orders[id].value != msg.value)
                throw;
            if(!token.transferFrom(orders[id].sender, msg.sender,orders[id].tokens))
                throw;
            if(!orders[id].sender.send(orders[id].value))
                throw;
        }
        else { //it is ask
            if(msg.value!=0)  //do not accept Ether here
                throw;
            if(!token.transferFrom(msg.sender, orders[id].sender, orders[id].tokens))
                throw;
            if(!msg.sender.send(orders[id].value))
                throw;
        }
		Executed(orders[id].tokenContract, orders[id].sender, orders[id].tokens, orders[id].value, 
        msg.sender, orders[id].isBid);
		remove(id);
	}
	
	function remove(bytes32 _id) internal
    {
        //removing order
        if(orders[_id].index == ordersIndex.length-1){//last one
            ordersIndex.length--;
            delete orders[_id];
        }
        else{
             ordersIndex[orders[_id].index] = ordersIndex[ordersIndex.length-1];
             orders[ordersIndex[orders[_id].index]].index = orders[_id].index;
             ordersIndex.length--;
            delete orders[_id];
        }
		Removed(_id);
    }
}

