import { Component, kefir as Kefir } from "//unpkg.com/can@5/ecosystem.mjs";

Component.extend({
	tag: "cc-payment",
	view: `
		<form>
		
			<div class="message">{{ this.cardError.value }}</div>

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
		},
		get cardError() {
			return this.cardNumber.map(this.validateCard);
		},
		// HELPER FUNCTIONS
		validateCard(card) {
			if (!card) {
				return "There is no card"
			}
			if (card.length !== 16) {
				return "There should be 16 characters in a card";
			}
		}
	}
});