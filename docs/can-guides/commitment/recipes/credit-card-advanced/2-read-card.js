import { Component, kefir as Kefir } from "//unpkg.com/can@5/ecosystem.mjs";

Component.extend({
	tag: "cc-payment",
	view: `
		<form>
		
			User Entered: {{ this.userCardNumber.value }},
			Card Number: {{ this.cardNumber.value }}

			<input type="text" name="number" placeholder="Card Number"
				on:input:value:to="this.userCardNumber.value"/>
		
			<input type="text" name="expiry" placeholder="MM-YY"/>
		
			<input type="text" name="cvc" placeholder="CVC"/>
		
			<button>Pay \${{ this.amount.value }}</button>
		</form>
	`,
	ViewModel: {
		amount: {
			default: () => Kefir.constant(1000)
		},
		
		userCardNumber: {
			default: () => Kefir.emitterProperty()
		},

		get cardNumber() {
			return this.userCardNumber.map((card) => {
				if (card) {
					return card.replace(/[\s-]/g, "");
				}
			});
		}
	}
});