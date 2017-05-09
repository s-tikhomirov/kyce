const OrderBook_cls = require("./orderbook.js")
const Exchange_cls = require("./exchange.js")
const Contract_cls = require("./contract.js")
const Wallet_cls = require("./wallet.js")
const Trade_cls = require("./trade.js")

function VM() {
  var self = this;

  self.OrderBook = new OrderBook_cls();
  self.Exchange = new Exchange_cls();
  self.Contract = new Contract_cls();
  self.Wallet = new Wallet_cls();
  self.Trade = new Trade_cls();

  self.unlocked = false;
  self.unlock = function(acc) {
    console.log(acc, self.unlocked)
    if (self.unlocked) return;
    console.log("do unlock", acc)

    self.unlocked = true;
  }
// STUB, hardcoded passwords
// TODO: ask user and erase after unlock
// or use password for all sends?
  setTimeout(function(){
    web3.personal.unlockAccount("0x1d07e9216cdb5ef32d713aa1f12d1fb64a347c3f", "account0", 3);
  }, 500)
  setTimeout(function(){
    web3.personal.unlockAccount("0xD105Af488616566A8e13776bc4647f04245F3deF", "qwe", 3);
  }, 500)
  setTimeout(function(){
    web3.personal.unlockAccount("0x545b8caf7a54d352ba7cc310ef20035aeb9e2d29", "qwe", 3);
  }, 500)
}

module.exports = VM
