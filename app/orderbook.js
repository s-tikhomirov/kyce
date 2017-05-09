var TOP_ORDERS = 200;

function OrderBook() {
  var self = this;

  self.bids = ko.observableArray([]);
  self.asks = ko.observableArray([]);

  self.update = function() {
      var bids = VM.Exchange.get_bids();
      var asks = VM.Exchange.get_asks();
      self.bids.removeAll();
      $.each(bids.slice(0, TOP_ORDERS), function(i, v) {
        self.add(v);
      });
      self.asks.removeAll();
      $.each(asks.slice(0, TOP_ORDERS), function(i, v) {
        self.add(v);
      });

      if (VM.Trade.price() == 0 && asks.length > 0) {
        VM.Trade.amount( asks[0].amount );
        VM.Trade.price( asks[0].price );
      }

      VM.Exchange.status("")
  }

  self.add = function(obj) {
      var order = new Order(obj);
      if (order.is_bid)
        self.bids.push(order);
      else
        self.asks.push(order);
  }
}

function Order(obj) {
    var self = this;
    $.extend(self, obj);

    self.amount_str = self.amount + VM.Exchange.token_symbol();
    self.price_str = Math.round(100*self.price)/100 + VM.Exchange.eth_symbol();
    self.address_text = "From " + self.address;
    const wal = VM.Wallet.by_address(self.address);
    if (wal) {
      self.address_text = "From " + wal.alias() + " (" + wal.address.substr(0, 12) + "..." + ")";
    }

    self.is_own_order = ko.computed(function() {
      if (self.address == VM.Wallet.current().address) return false;
      const arr = VM.Wallet.addresses();
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].address == self.address) {
          return true;
        }
      }
      return false;
    })
    self.is_current_wallet_order = ko.computed(function() {
      return (self.address == VM.Wallet.current().address);
    })
}



module.exports = OrderBook
