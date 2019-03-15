import { Component } from "//unpkg.com/can@5/core.mjs";

Stripe.setPublishableKey("pk_test_zCC2JrO3KSMeh7BB5x9OUe2U");

Component.extend({
	tag: 'cc-payment',
	view: `
		<form>

			<input type="text" name="number" placeholder="Card Number"
				value:bind="this.userCardNumber"/>

			<input type="text" name="expiry" placeholder="MM-YY"
				value:bind="this.userExpiry"/>

			<input type="text" name="cvc" placeholder="CVC"
				value:bind="this.userCVC"/>

			<button>Pay $\{{ this.amount }}</button>

			<p>{{ this.userCardNumber }}, {{ this.userExpiry }}, {{ this.userCVC }}</p>
			
		</form>
	`,
	ViewModel: {
		amount: {
			default: 9.99
		},

		userCardNumber: "string",

		userExpiry: "string",

		userCVC: "string"
	}
});