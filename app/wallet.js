function Wallets() {
  var self = this;

  self.addresses = ko.observableArray();
  $.each(web3.personal.listAccounts, function(i, addr) {
    self.addresses.push(new OneWallet(i, addr))
  });
  self.current = ko.observable();
  self.token_balance = ko.observable("?");
  self.eth_balance = ko.observable("?");

  self.current.subscribe(address_obj => {
    if (VM.Contract.tokens) {
      self.update(address_obj)
    }
  });

  self.update = function(address_obj) {
    self.token_balance("?");
    if (!address_obj) address_obj = self.current();
    const address = address_obj.address;
    const eth = web3.fromWei(web3.eth.getBalance(address));
    self.eth_balance(Math.round(eth*100, 2)/100)
    VM.Contract.get_balance(address).then(res => {
      console.log("got token_balance of", address, ":", res+"");
      if (self.current().address == address)
        self.token_balance(res)
    });
  }
  self.rename_current_wallet = function() {
    const wal = self.current();
    const new_name = prompt("Enter new label for wallet " + wal.address, wal.alias());
    window.localStorage[wal.key] = new_name;
    wal.alias(new_name);
  }
}

function OneWallet(index, addr) {
  const self = this;
  self.address = addr;
  self.key = "alias_" + self.address;

  if (!window.localStorage[self.key])
    window.localStorage[self.key] = "Wallet #" + index;

  self.alias = ko.observable(window.localStorage[self.key])
  self.item_str = ko.computed(function(){
    return self.alias() + " (" + self.address + ")";
  })
  console.log(index, addr, self.alias(), self.item_str())
}

module.exports = Wallets
