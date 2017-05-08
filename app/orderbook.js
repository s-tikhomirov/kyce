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
    $.extend(this, obj);

    this.amount_str = this.amount + VM.Exchange.token_symbol();
}



module.exports = OrderBook
