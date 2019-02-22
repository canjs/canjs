import { Component } from "can";

Stripe.setPublishableKey("pk_test_zCC2JrO3KSMeh7BB5x9OUe2U");

Component.extend({
	tag: 'cc-payment',
	view: `
	<form>

		<input type="text" name="number" placeholder="Card Number"/>

		<input type="text" name="expiry" placeholder="MM-YY"/>

		<input type="text" name="cvc" placeholder="CVC"/>

		<button>Pay $\{{ amount }}</button>

	</form>
	`,
	ViewModel: {
		amount: { default: 9.99 }
	}
});
