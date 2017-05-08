var OrderBook_cls = require("./orderbook.js")
var Exchange_cls = require("./exchange.js")
var Contract_cls = require("./contract.js")


function VM() {
  var self = this;

  self.OrderBook = new OrderBook_cls();
  self.Exchange = new Exchange_cls();
  self.Contract = new Contract_cls();
}

module.exports = VM
