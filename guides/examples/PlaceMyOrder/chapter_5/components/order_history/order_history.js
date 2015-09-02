var HistoryViewModel = can.Map.extend({
  define: {
    orders: {
      get: function(){
        return Order.findAll({});
      }
    }
  }
});

can.Component.extend({
  tag: 'pmo-order-history',
  viewModel: HistoryViewModel,
  template: can.view('components/order_history/order_history.stache')
});
