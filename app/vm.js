OrderBook = require("./orderbook.js")

function VM() {
  var self = this;

  self.OrderBook = window.OrderBook = new OrderBook();
}

module.exports = VM
