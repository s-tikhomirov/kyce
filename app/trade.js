function Trade() {
  var self = this;

  self.amount = ko.observable(0)
  self.price = ko.observable(0)
  self.total = ko.computed(function(){
    return (0|self.amount()) * (0|self.price());
  })

  self.buy = function() {
    alert("BUY " + self.amount() + " x " + self.price())
  }
  self.sell = function() {
    alert("SELL " + self.amount() + " x " + self.price())
  }

  self.buy_error = ko.observable()
  self.sell_error = ko.observable()

  self.init = function() {
    self.trigger(true)
  }
  self.trigger = ko.observable(false)

  self.not_enough_to_buy = ko.computed(function() {
    if (!self.trigger()) return true;
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
