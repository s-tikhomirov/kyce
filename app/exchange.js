var Exchange_cls_hack = require('../contracts/bin/exchange.js').Exchange;

function Exchange() {
    var self = this;

    self.stuff = function() {
        console.log("Debug orders", self.exchange.address);
        console.log(web3.eth.coinbase)
        console.log(web3.eth.defaultAccount)
        console.log(web3.personal.unlockAccount(web3.eth.coinbase, "account0", 3))
        web3.eth.defaultAccount = web3.eth.coinbase;

        self.exchange.debug_add_order(false, 743, 43953, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(false, 3465, 43952, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(false, 500, 43951, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(false, 43955, 43900, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(false, 10000, 43600, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(false, 2250, 43500, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(false, 3196, 43101, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(false, 42000, 43100, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(false, 12500, 43010, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(false, 114867, 43005, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(false, 51546, 43000, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(false, 29272, 42600, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(false, 54633, 42500, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(false, 8, 42308, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(false, 10000, 42200, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })

        self.exchange.debug_add_order(true, 500, 44851, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(true, 190436, 44901, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(true, 73985, 44950, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(true, 2945, 44970, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(true, 50000, 44997, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(true, 51000, 44998, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(true, 400241, 44999, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(true, 177693, 45000, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(true, 15000, 45047, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(true, 51566, 45100, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(true, 380, 45266, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(true, 38143, 45300, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(true, 9700, 45444, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(true, 10500, 45500, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        self.exchange.debug_add_order(true, 500, 45600, {gas: 1000000}, function(err, result){ console.log("error?", err, result); })
        alert("Doing")
        console.log("Debug orders done")
    }

    self.token = ko.observable("USD")
    self.token_symbol = ko.observable("$")

    self.exchange_address = ko.observable();
    self.exchange_address.subscribe(function (new_address) {
        if (new_address.length != 42) {
            self.error("Invalid exchange addresss!")
            self.status("")
        }
        else if (new_address != self.exchange_address) {
            self.go(new_address);
        }
    });
    self.go = function(new_address) {
        self.error("")
        self.status("Processing")

        self.exchange_address(new_address);
        var e = Exchange_cls_hack(web3);
        try {
            self.exchange = web3.eth.contract(e.abi).at(new_address);
            self.exchange.getOrderBookLengths()
        } catch (e) {
            self.error("Invalid exchange addresss!")
            self.status("")
            return
        }
        window.localStorage.last_exchange_address = new_address;
        VM.OrderBook.update();
    }
    self.check_saved = function() {
        var addr = window.localStorage.last_exchange_address;
        if (addr.length == 42) {
            self.go(addr);
        }
    }
    self.exchange = null;

    self.error = ko.observable()
    self.status = ko.observable()

    self.get_order = function(is_bid, index) {
        var res = self.exchange.getOrderBookItem(0, is_bid, index);
        return {
          addr: res[0] + "",
          amount: res[1]|0,
          price: res[2]|0,
          is_bid: is_bid
        };
    }
    self.get_bids = function() {
      var ls = self.exchange.getOrderBookLengths();
      var nbids = ls[0]|0;
      var nasks = ls[1]|0;
      var lst = [];
      for(var i = 0; i < nbids; i++) {
        lst.push(self.get_order(1, i));
      }
      return sort_orders(lst, false);
    }
    self.get_asks = function() {
      var ls = self.exchange.getOrderBookLengths();
      var nbids = ls[0]|0;
      var nasks = ls[1]|0;
      var lst = [];
      for(var i = 0; i < nasks; i++) {
        lst.push(self.get_order(0, i));
      }
      return sort_orders(lst, false);
    }
}

function sort_orders(lst, asc) {
  lst.sort(function(a, b){
      var keyA = a.price,
          keyB = b.price;
      if(keyA < keyB) return -1;
      if(keyA > keyB) return 1;
      return 0;
  });
  if (!asc) lst.reverse();
  return lst;
}


module.exports = Exchange
