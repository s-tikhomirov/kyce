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
    self.disabled(true)
    self.buy_status("Making bid on " + self.amount() + " " + VM.Exchange.token() + " with price " + self.price() + " " + VM.Exchange.eth() + "...")

    const sender = new Sender(VM.Exchange.exchange, web3);
    const acc = VM.Wallet.current().address;
    VM.unlock(acc)

    sender.send('debug_add_order', [true, self.amount(), self.price()], acc).sent
    .then(r => {
      console.log("buy ok", r);
      const placed = "Bid placed, waiting for confirmation"
      self.buy_status(placed)

      setTimeout(function() {
        self.disabled(false)
        if (self.buy_status() == placed) {
          self.buy_status("")
        }
        VM.OrderBook.update();
        setTimeout(function() {VM.OrderBook.update();}, 5000)
        setTimeout(function() {VM.OrderBook.update();}, 15000)
        setTimeout(function() {VM.OrderBook.update();}, 25000)
      }, 15000)
      setTimeout(function() {
      }, 10)

    })
    .catch(e => {
      self.disabled(false)
      self.buy_status("")
      self.buy_error("Buy error: " + e)
    })
    console.log("after send")
  }
  self.sell = function() {
    self.disabled(true)
    self.sell_status("Making ask on " + self.amount() + " " + VM.Exchange.token() + " with price " + self.price() + " " + VM.Exchange.eth() + "...")

    const sender = new Sender(VM.Exchange.exchange, web3);
    const acc = VM.Wallet.current().address;
    VM.unlock(acc)

    sender.send('debug_add_order', [false, self.amount(), self.price()], acc).sent
    .then(r => {
      console.log("sell ok", r);
      const placed = "Ask placed, waiting for confirmation"
      self.sell_status(placed)

      setTimeout(function() {
        self.disabled(false)
        if (self.sell_status() == placed) {
          self.sell_status("")
        }
        VM.OrderBook.update();
        setTimeout(function() {VM.OrderBook.update();}, 5000)
        setTimeout(function() {VM.OrderBook.update();}, 15000)
        setTimeout(function() {VM.OrderBook.update();}, 25000)
      }, 15000)
      setTimeout(function() {
      }, 10)

    })
    .catch(e => {
      self.disabled(false)
      self.sell_status("")
      self.sell_error("Sell error: " + e)
    })
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
