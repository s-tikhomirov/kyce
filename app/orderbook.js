function OrderBook() {
  var self = this;

  self.bids = ko.observableArray([]);
  self.asks = ko.observableArray([]);

  self.update = function() {
      self.bids.removeAll();
      self.asks.removeAll();

      var bids = VM.Exchange.get_bids();
      $.each(bids, function(i, v) {
        self.add(v);
      });
      var asks = VM.Exchange.get_asks();
      $.each(asks, function(i, v) {
        self.add(v);
      });

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
    self.address_text = "From " + self.address;

    self.is_own_order = function() {
      return (self.address == web3.eth.defaultAccount);
    }
}



module.exports = OrderBook
