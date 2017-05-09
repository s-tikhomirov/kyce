var Exchange_cls_hack = require('../contracts/bin/exchange.js').Exchange;
var Sender = require('./tx-sender.js').Sender;

// const contract_addr = "0xd6312ae19712494d9d8ed765d71d158c662b0f37";
const contract_addr = "0x3fBce813dE604aec7cc235128d871623d2bfA67A";

function Exchange() {
    var self = this;

    self.stuff = async function() {

        var sender = new Sender(self.exchange, web3);

        VM.Contract.update(contract_addr)

        var sender2 = new Sender(VM.Contract.tokens, web3);

        const acc = "0x1d07e9216cdb5ef32d713aa1f12d1fb64a347c3f"
        const acc2 = "0xD105Af488616566A8e13776bc4647f04245F3deF"
        const acc3 = "0x545b8caf7a54d352ba7cc310ef20035aeb9e2d29"
        VM.unlock(acc)
        VM.unlock(acc2)
        VM.unlock(acc3)

        // ??? whats that: 0xd8C6737f8dd028D15D236a599357750fD87Ecb64

        var promises = [
          // sender.send("debug_set_contract", [contract_addr], acc).promise,

          sender.send('debug_add_order', [contract_addr, true, 743, 43953], acc3).promise,
          sender.send('debug_add_order', [contract_addr, true, 3465, 43952], acc2).promise,
          sender.send('debug_add_order', [contract_addr, true, 500, 43951], acc3).promise,
          sender.send('debug_add_order', [contract_addr, true, 43955, 43900], acc3).promise,
          sender.send('debug_add_order', [contract_addr, true, 10000, 43600], acc2).promise,
          sender.send('debug_add_order', [contract_addr, true, 2250, 43500], acc3).promise,
          sender.send('debug_add_order', [contract_addr, true, 3196, 43101], acc3).promise,
          sender.send('debug_add_order', [contract_addr, true, 42000, 43100], acc3).promise,
          sender.send('debug_add_order', [contract_addr, true, 12500, 43010], acc3).promise,
          sender.send('debug_add_order', [contract_addr, true, 114867, 43005], acc).promise,
          sender.send('debug_add_order', [contract_addr, true, 51546, 43000], acc).promise,
          sender.send('debug_add_order', [contract_addr, true, 29272, 42600], acc3).promise,
          sender.send('debug_add_order', [contract_addr, true, 54633, 42500], acc3).promise,
          sender.send('debug_add_order', [contract_addr, true, 8, 42308], acc3).promise,
          sender.send('debug_add_order', [contract_addr, true, 10000, 42200], acc3).promise,

          sender.send('debug_add_order', [contract_addr, false, 500, 44851], acc2).promise,
          sender.send('debug_add_order', [contract_addr, false, 190436, 44901], acc3).promise,
          sender.send('debug_add_order', [contract_addr, false, 73985, 44950], acc3).promise,
          sender.send('debug_add_order', [contract_addr, false, 2945, 44970], acc3).promise,
          sender.send('debug_add_order', [contract_addr, false, 50000, 44997], acc).promise,
          sender.send('debug_add_order', [contract_addr, false, 51000, 44998], acc3).promise,
          sender.send('debug_add_order', [contract_addr, false, 400241, 44999], acc3).promise,
          sender.send('debug_add_order', [contract_addr, false, 177693, 45000], acc3).promise,
          sender.send('debug_add_order', [contract_addr, false, 15000, 45047], acc3).promise,
          sender.send('debug_add_order', [contract_addr, false, 51566, 45100], acc3).promise,
          sender.send('debug_add_order', [contract_addr, false, 380, 45266], acc3).promise,
          sender.send('debug_add_order', [contract_addr, false, 38143, 45300], acc3).promise,
          sender.send('debug_add_order', [contract_addr, false, 9700, 45444], acc3).promise,
          sender.send('debug_add_order', [contract_addr, false, 10500, 45500], acc3).promise,
          sender.send('debug_add_order', [contract_addr, false, 500, 45600, acc3]).promise,

          // sender2.send("debug_set_balance", [acc, 111], acc).promise,
          // sender2.send("debug_set_balance", [acc2, 222], acc).promise,
        ];

        try {
          await Promise.all(promises);
          alert('All done!');
        } catch (err) {
          console.log(err);
        }

        console.log("Debug orders done")
    }

    self.token = ko.observable("XLM")
    self.eth = ko.observable("ETH")
    self.token_symbol = ko.observable("☀")
    self.eth_symbol = ko.observable("♦")

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
    self.go = async function(new_address) {
        self.error("")
        self.status("Processing")

        self.exchange_address(new_address);
        var e = Exchange_cls_hack(web3);
        try {
            self.exchange = web3.eth.contract(e.abi).at(new_address);
            self.exchange.getOrderBookLengths(contract_addr)
        } catch (e) {
            self.error("Invalid exchange addresss!")
            self.status("")
            return
        }
        window.localStorage.last_exchange_address = new_address;

        // const token_contract = await new Promise((resolve, reject) => {
        //   self.exchange.token_contract.call( (err, res) => {
        //     if (err)
        //       reject(err);
        //     else
        //       resolve(res);
        //   })
        // });

        VM.Contract.update(contract_addr);
        VM.Wallet.update();
        VM.OrderBook.update();
    }
    self.check_saved = function() {
        var addr = window.localStorage.last_exchange_address;
        if (addr && addr.length == 42) {
            self.go(addr);
        }
    }
    self.exchange = null;

    self.error = ko.observable()
    self.status = ko.observable()

    self.get_order = function(is_bid, index) {
        var res = self.exchange.getOrderBookItem(contract_addr, is_bid, index);
        return {
          address: res[0] + "",
          amount: res[1]|0,
          price: res[2]|0,
          is_bid: is_bid
        };
    }
    self.get_bids = function() {
      var ls = self.exchange.getOrderBookLengths(contract_addr);
      var nbids = ls[0]|0;
      var nasks = ls[1]|0;
      var lst = [];
      for(var i = 0; i < nbids; i++) {
        lst.push(self.get_order(1, i));
      }
      return sort_orders(lst, false);
    }
    self.get_asks = function() {
      var ls = self.exchange.getOrderBookLengths(contract_addr);
      var nbids = ls[0]|0;
      var nasks = ls[1]|0;
      var lst = [];
      for(var i = 0; i < nasks; i++) {
        lst.push(self.get_order(0, i));
      }
      return sort_orders(lst, true);
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
