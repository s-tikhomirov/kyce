var Sender = require('./tx-sender.js').Sender;

function Trade() {
  var self = this;

  self.amount = ko.observable(0)
  self.price = ko.observable(0)
  self.total = ko.computed(function(){
    return (0|self.amount()) * (0|self.price());
  })
  self.disabled = ko.observable()

  self.buy = async function() {
    alert("BUY " + self.amount() + " x " + self.price())
    self.disabled(true)
    self.buy_status("Making bid on " + self.amount() + " " + VM.Exchange.token() + " with price " + self.price() + " " + VM.Exchange.eth() + "...")

    web3.personal.unlockAccount("0x1d07e9216cdb5ef32d713aa1f12d1fb64a347c3f", "account0", 3);
    web3.personal.unlockAccount("0xD105Af488616566A8e13776bc4647f04245F3deF", "qwe", 3);
    web3.personal.unlockAccount("0x545b8caf7a54d352ba7cc310ef20035aeb9e2d29", "qwe", 3);

    const sender = new Sender(VM.Exchange.exchange, web3);
    const acc = VM.Wallet.current().address;

    sender.send('debug_add_order', [true, self.amount(), self.price()], acc).sent.then(r => {
      console.log("buy ok", r);
      VM.OrderBook.update();
    })
    .catch(e => {
      console.log("buy error", e);
    })
  }
  self.sell = function() {
    alert("SELL " + self.amount() + " x " + self.price())
    // self.disabled(true)

  }

  self.buy_status = ko.observable()
  self.sell_status = ko.observable()
  self.buy_error = ko.observable()
  self.sell_error = ko.observable()

  self.init = function() {
    self.trigger(true)
  }
  self.trigger = ko.observable(false)

  self.not_enough_to_buy = ko.computed(function() {
    if (!self.trigger()) return true;
    if (self.disabled()) return true;
    const have = VM.Wallet.current().eth_balance()|0;
    if (have < self.total()|0) {
      self.buy_error("Not enough " + VM.Exchange.eth());
      return true;
    }
    self.buy_error("")
    return false;
  })
  self.not_enough_to_sell = ko.computed(function() {
    if (!self.trigger()) return true;
    if (self.disabled()) return true;
    const have = VM.Wallet.current().token_balance()|0;
    if (have < self.amount()|0) {
      self.sell_error("Not enough " + VM.Exchange.token());
      return true;
    }
    self.sell_error("")
    return false;
  })
}

module.exports = Trade
