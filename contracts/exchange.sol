pragma solidity ^0.4.11;


contract ERC20Token {
  
     // Get the account balance of another account with address _owner
     function balanceOf(address _owner) constant returns (uint256 balance);
  
     // Send _value amount of tokens to address _to
     function transfer(address _to, uint256 _value) returns (bool success);
  
     // Send _value amount of tokens from address _from to address _to
     function transferFrom(address _from, address _to, uint256 _value) returns (bool success);
  
     // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
     // If this function is called again it overwrites the current allowance with _value.
     // this function is required for some DEX functionality
     function approve(address _spender, uint256 _value) returns (bool success);
  
     // Returns the amount which _spender is still allowed to withdraw from _owner
     function allowance(address _owner, address _spender) constant returns (uint256 remaining);
  
     // Triggered when tokens are transferred.
     event Transfer(address indexed _from, address indexed _to, uint256 _value);
  
     // Triggered whenever approve(address _spender, uint256 _value) is called.
     event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}


contract TestToken is ERC20Token {
    
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



contract Exchange {
    // TODO: introduce Events
    
    address owner;
    modifier onlyOwner() { if (msg.sender != owner) throw; _; }
    
    // set by owner, stops trades, deposits, withdrawals
    bool private emergency = false;
    modifier noEmergency() { if (emergency) throw; _; }
    
    function Exchange() { owner = msg.sender; }
    
    mapping (address => uint) balance;
    
    struct Order {
        address author;
        uint amount;
        uint price;
    }
    
    // Order book for one token
    struct OrderBook {
        Order[] bid;
        Order[] ask;
    }
    
    // An ERC20 token address to a pair of its order books
    mapping (address => OrderBook) orderBook;
    
    function getMyBalance() constant returns (uint) {
        return balance[msg.sender];
    }
    
    function getMyTokenBalance(address tokenAddress) constant returns (uint) {
        return ERC20Token(tokenAddress).allowance(msg.sender, this);
    }
    
    function deposit() external payable {
        if (emergency) throw;
        balance[msg.sender] += msg.value;
    }
    
    function depositToken(address tokenAddress, uint amount) {
        ERC20Token(tokenAddress).approve(this, amount);
    }
    
    // can only withdraw ether
    function withdraw(uint amount) external noEmergency {
        if (balance[msg.sender] < amount) throw;
        if (msg.sender.send(amount)) {
            balance[msg.sender] -= amount;
        }
    }
    
    // TODO: re-implement with ERC20
    function isCorrect(address tokenAddress, uint amount, uint price, bool isBid) 
    internal
    returns (bool)
    {
        // can not buy or sell 0 tokens or at price 0
        if (amount == 0 || price == 0) return false;
        
        // must have enough tokens to sell
        if (!isBid && getMyTokenBalance(tokenAddress) < amount) return false;
        
        // must have enough ether to buy (at declared price)
        if (isBid && balance[msg.sender] < amount * price) return false;
        
        return true;
    }
    
    function placeOrder(address tokenAddress, uint amount, uint price, bool isBid)
    external noEmergency
    //returns (uint orderId)
    {
        //if (!isCorrect(token, amount, price, isBid)) throw;
        Order memory order = Order({
            author: msg.sender,
            amount: amount,
            price: price
        });
        isBid ? orderBook[tokenAddress].bid.push(order) : orderBook[tokenAddress].ask.push(order);
    }
    
    function editOrder(address tokenAddress, uint idx, uint _newAmount, uint _newPrice, bool isBid)
    external noEmergency
    {
        if (!isCorrect(tokenAddress, _newAmount, _newPrice, isBid)) throw;
        var book = isBid ? orderBook[tokenAddress].bid : orderBook[tokenAddress].ask;
        if (msg.sender != book[idx].author) throw;
        book[idx].amount = _newAmount;
        book[idx].price = _newPrice;
        return;
    }
    
    function deleteOrder(address tokenAddress, uint idx, bool isBid) 
    external noEmergency
    {
        var book = isBid ? orderBook[tokenAddress].bid : orderBook[tokenAddress].ask;
        if (msg.sender != book[idx].author) throw;
        book[idx] = book[book.length-1];
        book.length--;
        return;
    }
    
    function findAgreedPrice(Order bid, Order ask)
    internal
    returns (uint _agreedPrice) {
        return (bid.price < ask.price) ? 0 : (bid.price + ask.price ) / 2;
    }
    
    // match only orders with same amount
    // TODO: implement partial execution
    function findAgreedAmount(Order bid, Order ask)
    internal
    returns(uint _agreedAmount) {
        return (bid.amount == ask.amount) ? bid.amount : 0;
    }
    
    function matchOrders(address tokenAddress)
    noEmergency //TODO: internal
    returns (bool didMatch, uint _agreedPrice) {
        
        var bidBook = orderBook[tokenAddress].bid;
        var askBook = orderBook[tokenAddress].ask;
        
        if ( bidBook.length == 0 || askBook.length == 0 )
            return (false, 0);   // uint value has no meaning here
        
        uint bestBidIdx = findBestOrder(bidBook, true);     // isBid == true
        uint bestAskIdx = findBestOrder(askBook, false);    // isBid == false
        
        var bestBid = bidBook[bestBidIdx];
        var bestAsk = askBook[bestAskIdx];
        
        var agreedPrice = findAgreedPrice(bestBid, bestAsk);
        var agreedAmount = findAgreedAmount(bestBid, bestAsk);
        
        // seller wants more than buyer is ready to pay: no match
        if ( agreedPrice == 0 ) {
            return (false, 0);
        } else {
            if(!ERC20Token(tokenAddress).transferFrom(bestAsk.author, bestBid.author, agreedAmount))
                throw;
            
            balance[bestBid.author] -= agreedAmount * agreedPrice;
            balance[bestAsk.author] += agreedAmount * agreedPrice;
            
            askBook[uint(bestAskIdx)] = askBook[askBook.length-1];
            askBook.length--;
            bidBook[uint(bestBidIdx)] = bidBook[bidBook.length-1];
            bidBook.length--;
            
            return (true, agreedPrice);
        }
    }
    
    // Find the best order in the book w.r.t. isBetter comparison function
    function findBestOrder(Order[] book, bool bid)
    internal
    returns (uint idx) {
        if (book.length == 0) throw;
        uint bestOrderIdx = 0;
        uint bestPrice = book[0].price;
        // iterating over array: might not scale
        for (uint i = 0; i < book.length; i++) {
            if (isBetter(bestPrice, book[i].price, bid)) {
                bestPrice = book[i].price;
                bestOrderIdx = i;
            }
        }
        return bestOrderIdx;
    }
    
    // Comparing orders by price
    // Bids: higher is better. Asks: lower is better
    function isBetter(uint price, uint newPrice, bool bid)
    internal
    returns (bool isBetter) {
        return bid ? (newPrice > price) : (newPrice < price);
    }
    
    
    /***** HELPER FUNCTIONS *****/
    
    function getStats(address tokenAddress)
    constant
    onlyOwner
    returns (uint numberOfAsks, uint numberOfBids) {
        return (orderBook[tokenAddress].ask.length, orderBook[tokenAddress].bid.length);
    }
    
    function getOrderInfo(address tokenAddress, uint idx, bool isBid)
    constant
    onlyOwner
    returns (address author, uint amount, uint price)
    {
        Order order = (isBid ? orderBook[tokenAddress].bid : orderBook[tokenAddress].ask)[idx];
        return (order.author, order.amount, order.price);
    }
    
    function setEmergency(bool _emergency)
    internal
    onlyOwner
    returns (bool)
    {
        emergency = _emergency;
        return emergency;
    }
    
    function() { throw; }

}
