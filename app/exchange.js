var Exchange_cls_hack = require('../contracts/bin/exchange.js').Exchange;
var Tokens_cls_hack = require('../contracts/bin/dbgtoken.js').Exchange;
var Sender = require('./tx-sender.js').Sender;
var TOP_ORDERS = 20;

function Exchange() {
    var self = this;

    self.stuff = async function() {

        var sender = new Sender(self.exchange, web3);

        // console.log(web3.personal.unlockAccount(web3.eth.coinbase, "account0", 3))
        console.log(web3.personal.unlockAccount("0xD105Af488616566A8e13776bc4647f04245F3deF", "qwe", 3))
        web3.eth.defaultAccount = web3.eth.coinbase;

        const promises = [
          sender.send("debug_set_contract", ["0x1234"]).promise,
          sender.send('debug_add_order', [true, 743, 43953]).promise,
          sender.send('debug_add_order', [true, 3465, 43952]).promise,
          sender.send('debug_add_order', [true, 500, 43951]).promise,
          sender.send('debug_add_order', [true, 43955, 43900]).promise,
          sender.send('debug_add_order', [true, 10000, 43600]).promise,
          sender.send('debug_add_order', [true, 2250, 43500]).promise,
          sender.send('debug_add_order', [true, 3196, 43101]).promise,
          sender.send('debug_add_order', [true, 42000, 43100]).promise,
          sender.send('debug_add_order', [true, 12500, 43010]).promise,
          sender.send('debug_add_order', [true, 114867, 43005]).promise,
          sender.send('debug_add_order', [true, 51546, 43000]).promise,
          sender.send('debug_add_order', [true, 29272, 42600]).promise,
          sender.send('debug_add_order', [true, 54633, 42500]).promise,
          sender.send('debug_add_order', [true, 8, 42308]).promise,
          sender.send('debug_add_order', [true, 10000, 42200]).promise,

          sender.send('debug_add_order', [false, 500, 44851]).promise,
          sender.send('debug_add_order', [false, 190436, 44901]).promise,
          sender.send('debug_add_order', [false, 73985, 44950]).promise,
          sender.send('debug_add_order', [false, 2945, 44970]).promise,
          sender.send('debug_add_order', [false, 50000, 44997]).promise,
          sender.send('debug_add_order', [false, 51000, 44998]).promise,
          sender.send('debug_add_order', [false, 400241, 44999]).promise,
          sender.send('debug_add_order', [false, 177693, 45000]).promise,
          sender.send('debug_add_order', [false, 15000, 45047]).promise,
          sender.send('debug_add_order', [false, 51566, 45100]).promise,
          sender.send('debug_add_order', [false, 380, 45266]).promise,
          sender.send('debug_add_order', [false, 38143, 45300]).promise,
          sender.send('debug_add_order', [false, 9700, 45444]).promise,
          sender.send('debug_add_order', [false, 10500, 45500]).promise,
          sender.send('debug_add_order', [false, 500, 45600]).promise
        ];

        try {
          await Promise.all(promises);
          alert('All done!');
        } catch (err) {
          console.log(err);
        }
      
        // Promise.all(promises)
        //   .then(() => {
        //     alert('Done!')
        //     self.exchange.token_contract.call( (err, res) => {
        //       console.log("resultr", res, err)
        //     });
        //   })
        //   .catch(err => alert(err));

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
          address: res[0] + "",
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
      return sort_orders(lst, true).slice(0, TOP_ORDERS);
    }
    self.get_asks = function() {
      var ls = self.exchange.getOrderBookLengths();
      var nbids = ls[0]|0;
      var nasks = ls[1]|0;
      var lst = [];
      for(var i = 0; i < nasks; i++) {
        lst.push(self.get_order(0, i));
      }
      return sort_orders(lst, false).slice(0, TOP_ORDERS);
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
