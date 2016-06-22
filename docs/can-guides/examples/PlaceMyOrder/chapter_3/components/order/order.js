var OrderViewModel = can.Map.extend({
  define: {
    slug: {
      type: 'string'
    },
    order: {
      Value: Order
    },
    restaurant: {
      get: function(old) {
        var id = this.attr('slug');

        if (!old && id) {
          var setOrderSlug = can.proxy(function(restaurant){
            this.attr('order.slug', restaurant.attr('slug'));
            return restaurant;
          }, this);

          return Restaurant.findOne({ id: id }).then(setOrderSlug);
        }

        return old;
      }
    }
  },

  placeOrder: function() {
  },

  startNewOrder: function() {
    this.attr('order', new Order());
    this.attr('saveStatus', null);
    return false;
  }
});

can.Component.extend({
  tag: 'pmo-order',
  viewModel: OrderViewModel,
  template: can.view('components/order/order.stache')
});
