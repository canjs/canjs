var ItemsList = can.List.extend({}, {
  has: function(item) {
    return this.indexOf(item) !== -1;
  },

  toggle: function(item) {
    var index = this.indexOf(item);

    if (index !== -1) {
      this.splice(index, 1);
    } else {
      this.push(item);
    }
  }
});

var Order = can.Model.extend({
  create: 'POST /api/orders',
  findAll: 'GET /api/orders'
}, {
  define: {
    status: {
      value: 'new'
    },
    items: {
      Value: ItemsList
    },
    total: {
      get: function() {
        var total = 0.0;
        this.attr('items').forEach(function(item){
          total += parseFloat(item.attr('price'));
        });
        return total.toFixed(2);
      }
    }
  },

  markAs: function(status) {
    this.attr('status', status);
    this.save();
  }
});

Order.List = Order.List.extend({
},{
  totals: function(){
    return this.map(function(order){
      return order.attr("total");
    });
  },

  filterByStatus: function(status) {
    return this.filter(function(order) {
      return order.attr('status') === status;
    });
  },

  new: function() {
    return this.filterByStatus('new');
  },

  preparing: function() {
    return this.filterByStatus('preparing');
  },

  delivery: function() {
    return this.filterByStatus('delivery');
  },

  delivered: function() {
    return this.filterByStatus('delivered');
  }
});
