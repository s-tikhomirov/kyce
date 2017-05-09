function Wallets() {
  var self = this;

  self.addresses = ko.observableArray();
  self.current = ko.observable();
  self.trigger = ko.observable();

  self.token_balance = ko.computed(function() {
    self.trigger();
    const lst = self.addresses();
    var res = 0;
    for (var i = 0; i < lst.length; i++) {
      res += lst[i].token_balance()|0;
    }
    return res;
  })
  self.eth_balance = ko.computed(function() {
    self.trigger();
    const lst = self.addresses();
    var res = 0;
    for (var i = 0; i < lst.length; i++) {
      res += lst[i].eth_balance()|0;
    }
    res = Math.round(res * 100) / 100;
    return res;
  })
  self.current_token_balance = ko.computed(function() {
    if (!self.current()) return "?";
    return self.current().token_balance();
  })
  self.current_eth_balance = ko.computed(function() {
    if (!self.current()) return "?";
    return self.current().eth_balance();
  })

  self.current.subscribe(wal => {
    if (VM.Contract.tokens) {
      self.update(wal)
    }
  });
  self.init = function() {
    $.each(web3.personal.listAccounts, function(i, addr) {
      var wal = new OneWallet(i, addr);
      if (addr == "0x545b8caf7a54d352ba7cc310ef20035aeb9e2d29") return;
      self.addresses.push(wal);
    });
    self.trigger.notifySubscribers()
  }

  self.update = function(wal) {
    if (!wal) {
      $.each(self.addresses(), function(index, walx) {
        self.update(walx);
      })
      return;
    }
    wal.token_balance("?");
    const address = wal.address;
    const eth = web3.fromWei(web3.eth.getBalance(address));
    wal.eth_balance(Math.round(eth*100, 2)/100)
    VM.Contract.get_balance(address).then(res => {
      // console.log("got token_balance of", address, ":", res+"");
      // if (self.current().address == address) {
      wal.token_balance(res)
      self.addresses.valueHasMutated();
      // }
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

  self.token_balance = ko.observable("?");
  self.eth_balance = ko.observable("?");

  self.alias = ko.observable(window.localStorage[self.key])
  self.item_str = ko.computed(function(){
    var res = self.alias();
    res += " [" + self.token_balance() + VM.Exchange.token_symbol();
    res += ", " + self.eth_balance() + VM.Exchange.eth_symbol();
    res += "]";
    res += " (" + self.address.substr(0, 12) + "..." + ")";
    return res;
  })
  console.log(index, addr, self.alias(), self.item_str())
}

module.exports = Wallets
