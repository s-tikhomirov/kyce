function Wallet() {
  var self = this;

  self.addresses = ko.observableArray(web3.personal.listAccounts);
  self.current = ko.observable();
  self.token_balance = ko.observable("?");
  self.eth_balance = ko.observable("?");

  self.current.subscribe(address => {
    if (VM.Contract.tokens) {
      self.update(address)
    }
  });

  self.update = function(address) {
    self.token_balance("?");
    if (!address) address = self.current()
    self.eth_balance(web3.eth.getBalance(address)+"")
    VM.Contract.get_balance(address).then(res => {
      console.log("got token_balance of", address, ":", res+"");
      if (self.current() == address)
        self.token_balance(res)
    });
  }
}

module.exports = Wallet
