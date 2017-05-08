var OrderBook_cls = require("./orderbook.js")
window.Exchange_cls = require("./exchange.js")


function VM() {
  var self = this;

  self.OrderBook = new OrderBook_cls();
  self.Exchange = new Exchange_cls();
}

module.exports = VM
