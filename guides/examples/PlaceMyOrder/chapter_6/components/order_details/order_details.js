var OrderDetailsViewModel = can.Map.extend({});

can.Component.extend({
  tag: 'pmo-order-details',
  viewModel: OrderDetailsViewModel,
  template: can.view('components/order_details/order_details.stache')
});
