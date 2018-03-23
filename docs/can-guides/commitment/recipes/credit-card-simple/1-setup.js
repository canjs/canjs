Stripe.setPublishableKey("pk_test_zCC2JrO3KSMeh7BB5x9OUe2U");

const PaymentVM = can.DefineMap.extend({
  amount: { default: 9.99 }
});

const viewModel = new PaymentVM();

const paymentView = can.stache.from("payment-view");
const fragment = paymentView( viewModel );
document.body.appendChild( fragment );
