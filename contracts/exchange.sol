pragma solidity ^0.4.2;


contract Exchange {
    // TODO: introduce Events
    
    address owner;
    modifier onlyOwner() { if (msg.sender != owner) throw; _; }
    // set by owner, stops trades, deposits, withdrawals
    bool private emergency = false;
    
    function Exchange() { owner = msg.sender; }
    
    // TEST is a token for testing (can be deposited freely)
    enum Token { TEST, USD, EUR, BTC, ETH }
    
    mapping (address => uint) balance;
    mapping (address => mapping(uint => uint)) tokenBalance;
    
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
    
    // A token to a pair of its order books
    mapping (uint => OrderBook) orderBook;
    
    
    function getTokenBalance(Token token) constant returns (uint) {
        return tokenBalance[msg.sender][uint(token)];
    }
    
    function getbalance() constant returns (uint) {
        return balance[msg.sender];
    }
    
    function deposit() external payable {
        if (emergency) throw;
        balance[msg.sender] += msg.value;
    }
    
    function depositTestToken(uint _amount) {
        tokenBalance[msg.sender][uint(Token.TEST)] += _amount;
    }
    
    // can only withdraw ether
    function withdraw(uint amount) external {
        if (emergency) throw;
        if (balance[msg.sender] < amount) throw;
        if (msg.sender.send(amount)) {
            balance[msg.sender] -= amount;
        }
    }
    
    function isCorrect(Token token, uint amount, uint price, bool isBid) 
    internal
    returns (bool)
    {
        // can not buy or sell 0 tokens or at price 0
        if (amount == 0 || price == 0) return false;
        
        // must have enough tokens to sell
        if (!isBid && tokenBalance[msg.sender][uint(token)] < amount) return false;
        
        // must have enough ether to buy (at declared price)
        if (isBid && balance[msg.sender] < amount * price) return false;
        
        return true;
    }
    
    function placeOrder(Token token, uint amount, uint price, bool isBid)
    external
    //returns (uint orderId)
    {
        if (emergency) throw;
        if (!isCorrect(token, amount, price, isBid)) throw;
        Order memory order = Order({
            author: msg.sender,
            amount: amount,
            price: price
        });
        isBid ? orderBook[uint(token)].bid.push(order) : orderBook[uint(token)].ask.push(order);
    }
    
    function editOrder(Token token, uint idx, uint _newAmount, uint _newPrice, bool isBid)
    external
    {
        if (emergency) throw;
        if (!isCorrect(token, _newAmount, _newPrice, isBid)) throw;
        var book = isBid ? orderBook[uint(token)].bid : orderBook[uint(token)].ask;
        if (msg.sender != book[idx].author) throw;
        book[idx].amount = _newAmount;
        book[idx].price = _newPrice;
        return;
    }
    
    function deleteOrder(Token token, uint idx, bool isBid) 
    external
    {
        if (emergency) throw;
        var book = isBid ? orderBook[uint(token)].bid : orderBook[uint(token)].ask;
        if (msg.sender != book[idx].author) throw;
        book[idx] = book[book.length-1];
        book.length--;
        return;
    }
    
    function matchOrders(Token token)
    //TODO: internal
    returns (bool didMatch, uint _bestAsk, uint _bestBid) {
        if (emergency) throw;
        var askBook = orderBook[uint(token)].ask;
        var bidBook = orderBook[uint(token)].bid;
        
        if ( askBook.length == 0 || bidBook.length == 0 )
            return (false, 0, 0);   // uint values have no meaning here
        
        uint bestAskIdx = findBestOrder(askBook, false);    // isBid == false
        uint bestBidIdx = findBestOrder(bidBook, true);     // isBid == true
        
        var bestAsk = askBook[bestAskIdx];
        var bestBid = bidBook[bestBidIdx];
        
        // TODO: implement 'average' price
        if ( bestAsk.price != bestBid.price )
            return (false, bestAsk.price, bestBid.price);
        
        // only matches if prices equal
        var agreedPrice = bestBid.price;
        
        // min of bid and ask amounts
        var agreedAmount = (bestAsk.amount < bestBid.amount) ? bestAsk.amount : bestBid.amount;
        
        tokenBalance[bestBid.author][uint(token)] += agreedAmount;
        balance[bestBid.author] -= agreedAmount * agreedPrice;
        tokenBalance[bestAsk.author][uint(token)] -= agreedAmount;
        balance[bestAsk.author] += agreedAmount * agreedPrice;
        
        askBook[uint(bestAskIdx)] = askBook[askBook.length-1];
        askBook.length--;
        bidBook[uint(bestBidIdx)] = bidBook[bidBook.length-1];
        bidBook.length--;
        
        return (true, bestAsk.price, bestBid.price);
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
    
    function getStats(Token token)
    constant
    onlyOwner
    returns (uint numberOfAsks, uint numberOfBids) {
        return (orderBook[uint(token)].ask.length, orderBook[uint(token)].bid.length);
    }
    
    function getOrderInfo(Token token, uint idx, bool isBid)
    constant
    onlyOwner
    returns (address author, uint amount, uint price)
    {
        Order order = (isBid ? orderBook[uint(token)].bid : orderBook[uint(token)].ask)[idx];
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
