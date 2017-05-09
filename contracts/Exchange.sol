pragma solidity ^0.4.11;

import "contracts/Tokens.sol";

contract Exchange {
    
    event OrderCreated(uint idx);
    event OrderEdited(address tokenAddress, uint idx);
    event OrdersExecuted(uint bidIdx, uint askIdx, uint agreedPrice, uint agreedAmount);
	
	event Deposit(address indexed _sender, uint  indexed _amount);
    event Withdraw(address indexed _sender, uint  indexed _amount);
    
	
    address owner;
    modifier onlyOwner() { if (msg.sender != owner) throw; _; }
    
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
    
    function deposit() external payable {
        balance[msg.sender] += msg.value;
		Deposit(msg.sender, msg.value);
    }
    
    // can only withdraw ether
    function withdraw(uint amount) external {
        if (balance[msg.sender] < amount) throw;
        if (msg.sender.send(amount)) {
            balance[msg.sender] -= amount;
        }
		Withdraw(msg.sender,amount);
    }
    
    function isCorrect(address tokenAddress, uint amount, uint price, bool isBid) 
    public constant
    returns (bool)
    {
        // can not buy or sell 0 tokens or at price 0
        if (amount == 0 || price == 0) return false;
        
        // must have enough tokens to sell 
        if (!isBid && Token(tokenAddress).allowance(msg.sender, this) < amount)
            return false;
	
        
        // must have enough ether to buy (at declared price)
        if (isBid && balance[msg.sender] < amount * price)
            return false;
        
        return true;
    }
    
    function createBid(address tokenAddress, uint amount, uint price) {
        return placeOrder(tokenAddress, amount, price, true);
    }
    
    function createAsk(address tokenAddress, uint amount, uint price) {
        return placeOrder(tokenAddress, amount, price, false);
    }
    
    function placeOrder(address tokenAddress, uint amount, uint price, bool isBid)
    internal
    {
        //if (!isCorrect(tokenAddress, amount, price, isBid)) throw;
        Order memory order = Order({
            author: msg.sender,
            amount: amount,
            price: price
        });
        isBid ? orderBook[tokenAddress].bid.push(order) : orderBook[tokenAddress].ask.push(order);
        OrderCreated(isBid ? orderBook[tokenAddress].bid.length-1 : orderBook[tokenAddress].ask.length-1);
    }
    
    function editOrder(address tokenAddress, uint idx, uint _newAmount, uint _newPrice, bool isBid)
    external
    {
        var book = isBid ? orderBook[tokenAddress].bid : orderBook[tokenAddress].ask;
        if (msg.sender != book[idx].author) throw;
        if (_newAmount == 0 && _newPrice == 0)
            deleteOrder(tokenAddress, idx, isBid);
        //if (!isCorrect(tokenAddress, _newAmount, _newPrice, isBid)) throw;
        book[idx].amount = _newAmount;
        book[idx].price = _newPrice;
        OrderEdited(tokenAddress, idx);
    }
    
    // delete function is internal
    // user must call editOrder(..., 0, 0, ...) to delete order
    function deleteOrder(address tokenAddress, uint idx, bool isBid) 
    {
        var book = isBid ? orderBook[tokenAddress].bid : orderBook[tokenAddress].ask;
        if (book.length > 1)
            book[idx] = book[book.length-1];    // move last element to this slot
        delete book[book.length-1];
        book.length--;
    }
    
    function findAgreedPrice(Order bid, Order ask)
    internal
    returns (uint _agreedPrice) {
        return (bid.price < ask.price) ? 0 : (bid.price + ask.price ) / 2;
    }
    
    // matches only orders with same amount
    // TODO: implement partial execution
    function findAgreedAmount(Order bid, Order ask)
    internal
    returns(uint _agreedAmount) {
        return (bid.amount == ask.amount) ? bid.amount : 0;
    }
    
    function matchBestOrders(address tokenAddress)
    returns (bool didMatch) {
        
        var bidBook = orderBook[tokenAddress].bid;
        var askBook = orderBook[tokenAddress].ask;
        
        if ( bidBook.length == 0 || askBook.length == 0 )
            return false;
            
        var bidIdx = findBestBid(bidBook);
        var askIdx = findBestAsk(askBook);
        
        var bid = orderBook[tokenAddress].bid[bidIdx];
        var ask = orderBook[tokenAddress].ask[askIdx];
        
        var agreedPrice = findAgreedPrice(bid, ask);
        var agreedAmount = findAgreedAmount(bid, ask);
        
        // seller wants more than buyer is ready to pay: no match
        if ( agreedPrice == 0 ) {
            return false;
        } else {
            
            if(!Token(tokenAddress).transferFrom(ask.author, bid.author, agreedAmount))
                return false;
        
            balance[bid.author] -= agreedAmount * agreedPrice;
            balance[ask.author] += agreedAmount * agreedPrice;
            
            deleteOrder(tokenAddress, bidIdx, true);
            deleteOrder(tokenAddress, askIdx, false);
            
            OrdersExecuted(bidIdx, askIdx, agreedPrice, agreedAmount);
            
            return true;
        }
    }
    
    function findBestBid(Order[] book)
    internal
    returns (uint idx) {
        return findBestOrder(book, true);
    }
    
    function findBestAsk(Order[] book)
    internal
    returns (uint idx) {
        return findBestOrder(book, false);
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
    constant    returns (uint numberOfAsks, uint numberOfBids) {
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
    function debug_add_order(address token, bool is_bid, uint _amount, uint _price) payable {
        if (is_bid)
            balance[msg.sender] += msg.value;
//        createBid(token, _amount, _price);
        Order memory order = Order({
            author: msg.sender,
            amount: _amount,
            price: _price
        });
        if (is_bid)
            orderBook[token].bid.push(order);
        else
            orderBook[token].ask.push(order);
    }
    function() { throw; }

}

contract KYCExchange is Exchange{
	function KYCExchange(){
		//do nothing
	}
	
	/*Returns true if the order author is eligible for operations with tokens
	* @param _tokenAddress must be a KYC token
	*/
	function isOrderEligible(address _tokenAddress, uint _idx, bool _isBid) constant returns (bool)
	{
		Order order = (_isBid ? orderBook[_tokenAddress].bid : orderBook[_tokenAddress].ask)[_idx]; //order we look for
		var token = KYCToken(_tokenAddress);   //its token contract
		KYC KYCContract = token.KYCContract(); //KYC approver for this token
		return KYCContract.isEligible(_tokenAddress, order.author);
	}
}