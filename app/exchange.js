var Exchange_cls_hack = require('../contracts/bin/exchange.js').Exchange;

function Exchange() {
    var self = this;

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
          amount: res[1] + "",
          price: res[2] + "",
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
