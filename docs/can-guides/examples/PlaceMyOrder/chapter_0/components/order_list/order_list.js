var OrderHistoryItemViewModel = can.Map.extend({});

can.Component.extend({
  tag: 'pmo-orders-list',
  viewModel: OrderHistoryItemViewModel,
  template: can.view('components/order_list/order_list.stache')
});
