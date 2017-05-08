const OrderBook_cls = require("./orderbook.js")
const Exchange_cls = require("./exchange.js")
const Contract_cls = require("./contract.js")
const Wallet_cls = require("./wallet.js")


function VM() {
  var self = this;

  self.OrderBook = new OrderBook_cls();
  self.Exchange = new Exchange_cls();
  self.Contract = new Contract_cls();
  self.Wallet = new Wallet_cls();
}

module.exports = VM
