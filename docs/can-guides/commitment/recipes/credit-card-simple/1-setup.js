Stripe.setPublishableKey('pk_test_zCC2JrO3KSMeh7BB5x9OUe2U');

var PaymentVM = can.DefineMap.extend({
  amount: {value: 9.99}
});

var viewModel = new PaymentVM();

var paymentView = can.stache.from("payment-view");
var frag = paymentView( viewModel );
document.body.appendChild( frag );
