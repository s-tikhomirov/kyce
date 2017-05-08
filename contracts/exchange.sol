pragma solidity ^0.4.2;

contract Exchange {
    // TODO: introduce Events

    address owner;

    enum Token { USD, EUR, BTC, ETH }
    Token baseToken;

    mapping ( uint => uint ) internal max_deposit;

    // set by owner, stops trades, deposits, withdrawals
    bool private emergency = false;

    mapping (address => mapping(uint => uint)) balance;
    uint orderCounter = 0;

    struct Order {
        address author;
        uint amount;
        uint price;
    }

    struct OrderBook {
        Order[] bid;
        Order[] ask;
    }

    mapping ( uint => OrderBook) orderBook;

    modifier onlyOwner() {
        if (msg.sender != owner) throw;
        _;
    }

    function getOrderBookLengths(Token token) constant returns (uint, uint) {
        var books = orderBook[uint(token)];
        return (
            books.bid.length,
            books.ask.length
        );
    }
    function getOrderBookItem(Token token, bool isBid, uint index) constant returns (address, uint, uint) {
        var book = (isBid) ? orderBook[uint(token)].bid[index] : orderBook[uint(token)].ask[index];
        return (
            book.author,
            book.amount,
            book.price
        );
    }

    function Exchange(/*Token _baseToken*/) {
        // set owner: only owner can add / remove order books, etc
        owner = msg.sender;

        // base token: all other tokens are priced in base token (e.g., $)
        baseToken = Token.USD; //_baseToken;

        max_deposit[uint(Token.USD)] = 100;
        max_deposit[uint(Token.EUR)] = 100;
        max_deposit[uint(Token.BTC)] = 1;
        max_deposit[uint(Token.ETH)] = 10;

        Order memory order = Order({
            author: msg.sender,
            amount: 123,
            price: 311337
        });
        orderBook[0].bid.push(order);
        order.price = 123;
        orderBook[0].bid.push(order);
        order.price = 200;
        orderBook[0].ask.push(order);
        order.price = 300;
        orderBook[0].ask.push(order);
        order.price = 400;
        orderBook[0].ask.push(order);
    }

    function getBalance(Token token) constant returns (uint) {
        return balance[msg.sender][uint(token)];
    }

    function deposit(Token token, uint amount) external payable {
        // TODO: check if deposited tokens are sent
        if (emergency) throw;
        if (balance[msg.sender][uint(token)] + amount > max_deposit[uint(token)])
            throw;  // security measure: limit exposure in case of hack
        balance[msg.sender][uint(token)] += amount;
    }

    function withdraw(Token token, uint amount) external {
        if (emergency) throw;
        if (balance[msg.sender][uint(token)] < amount)
            throw;
        balance[msg.sender][uint(token)] -= amount;
        // TODO: send withdrawn tokens
        // do not throw on failed send:
        // http://vessenes.com/ethereum-griefing-wallets-send-w-throw-considered-harmful/
        // "If the execution of the whole contract was dependent on this send,
        // the whole contract would be stalled and investors could not withdraw
        // because of this investor's griefing wallet. "
        // Not so critical here.
        // https://github.com/Bunjin/Rouleth/blob/master/Security.md (3)
        /*
        if (!msg.sender.send(amount)) {
            balance[msg.sender][uint(token)] += amount;
        }
        */
    }

    function isCorrect(Token token, uint amount, uint price, bool isBid)
    internal
    returns (bool)
    {
        // can not exchange token to itself, buy or sell 0 tokens or at price 0
        if (token == baseToken || amount == 0 || price == 0) return false;

        // must have enough tokens to sell
        if (!isBid && balance[msg.sender][uint(token)] < amount) return false;

        // must have enough base tokens to buy (at declared price)
        if (isBid && balance[msg.sender][uint(baseToken)] < amount * price) return false;

        return true;
    }

    function placeOrder(Token token, uint amount, uint price, bool isBid)
    external
    returns (uint orderId) {
        if (emergency) throw;
        if (!isCorrect(token, amount, price, isBid)) throw;
        Order memory order = Order({
            author: msg.sender,
            amount: amount,
            price: price
        });

        if (isBid)
            orderBook[uint(token)].bid.push(order);
        else
            orderBook[uint(token)].ask.push(order);

        return orderCounter++;
    }

    // newAmount, newPrice: either 0 -- leave as is; both 0 -- delete order
    function editOrder(Token token, uint idx, uint _newAmount, uint _newPrice, bool isBid)
    external
    {
        if (emergency) throw;
        var book = isBid ? orderBook[uint(token)].bid : orderBook[uint(token)].ask;

        if (msg.sender != book[idx].author) throw;

        if (_newAmount == 0 && _newPrice == 0) {
            book[idx] = book[book.length-1];
            book.length--;
            return;
        }

        var newAmount = (_newAmount == 0) ? book[idx].amount : _newAmount;
        var newPrice = (_newPrice == 0) ? book[idx].price : _newPrice;

        if (!isCorrect(token, newAmount, newPrice, isBid)) throw;

        book[idx].price = newPrice;
        book[idx].amount = newAmount;

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

        uint bestAskIdx = findBestOrder(askBook, false);
        uint bestBidIdx = findBestOrder(bidBook, true);

        var bestAsk = askBook[bestAskIdx];
        var bestBid = bidBook[bestBidIdx];

        // TODO: implement 'average' price
        if ( bestAsk.price != bestBid.price )
            return (false, bestAsk.price, bestBid.price);

        // only matches if prices equal
        var agreedPrice = bestBid.price;

        // min of bid and ask amounts
        var agreedAmount = (bestAsk.amount < bestBid.amount) ? bestAsk.amount : bestBid.amount;

        balance[bestBid.author][uint(token)] += agreedAmount;
        balance[bestBid.author][uint(baseToken)] -= agreedAmount * agreedPrice;
        balance[bestAsk.author][uint(token)] -= agreedAmount;
        balance[bestAsk.author][uint(baseToken)] += agreedAmount * agreedPrice;

        askBook[uint(bestAskIdx)] = askBook[askBook.length-1];
        askBook.length--;
        bidBook[uint(bestBidIdx)] = bidBook[bidBook.length-1];
        bidBook.length--;

        return (true, bestAsk.price, bestBid.price);
    }

    // TODO: fix DOS via loop
    // https://blog.ethereum.org/2016/06/10/smart-contract-security/
    function findBestOrder(Order[] book, bool bid)
    internal
    returns (uint idx) {

        // array must contain elements -- checked in matchOrders
        uint bestOrderIdx = 0;
        uint bestPrice = book[0].price;

        for (uint i = 0; i < book.length; i++) {
            if (isBetter(bestPrice, book[i].price, bid)) {
                bestPrice = book[i].price;
                bestOrderIdx = i;
            }
        }
        return bestOrderIdx;
    }

    function isBetter(uint price, uint newPrice, bool bid)
    internal
    returns (bool isBetter) {
        return bid ? (newPrice > price) : (newPrice < price);
    }

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

    function setMaxDeposit(Token token, uint amount)
    internal
    onlyOwner
    returns (uint _max_deposit) {
        max_deposit[uint(token)] = amount;
        return max_deposit[uint(token)];
    }

    // TODO: setMaxWithdrawal: prevent many smaller withdrawals? 1 per block?

    function() { throw; }

    //////////////////////////////////
    // do we need these?
    /*

    function kill() {
        if (msg.sender != owner)
            throw;
        else
            selfdestruct(owner);
    }
    */
}
