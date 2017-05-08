function Order(obj) {
    $.extend(this, obj);

    this.amount_str = this.amount + VM.token_symbol;
}

function sort_orders(lst, asc) {
  lst.sort(function(a, b){
      var keyA = a.price,
          keyB = b.price;
      if(keyA < keyB) return -1;
      if(keyA > keyB) return 1;
      return 0;
  });
  if (!asc) lst.reverse();
  return lst;
}

function get_order(is_bid, index) {
    var res = exchange.getOrderBookItem(0, is_bid, index);
    return {
      addr: res[0] + "",
      amount: res[1] + "",
      price: res[2] + "",
      is_bid: true
    };
}
function OrderBook() {
  var self = this;

  self.bids = ko.observableArray([]);
  self.asks = ko.observableArray([]);

  self.update = function() {
      self.bids.removeAll();
      self.asks.removeAll();

      ls = exchange.getOrderBookLengths();
      var nbids = ls[0]|0;
      var nasks = ls[1]|0;
      var lst = [];
      for(i = 0; i < nbids; i++) {
        lst.push(get_order(1, i));
      }
      lst = self.sort_orders(lst, false);
      for(i = 0; i < nasks; i++) {
        lst.push(get_order(0, i));
      }
      lst = sort_orders(lst, false);
      $.each(lst, function(i, v) {
        self.add(v);
      });
  }

  self.add = function(obj) {
      var order = new Order(obj);
      if (order.is_bid)
        self.bids.push(order);
      else
        self.asks.push(order);
  }
}

module.exports =  OrderBook
