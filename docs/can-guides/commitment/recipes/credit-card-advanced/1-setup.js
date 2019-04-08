import { Component, kefir as Kefir } from "//unpkg.com/can@5/ecosystem.mjs";

Component.extend({
	tag: "cc-payment",
	view: `
		<form>
			<input type="text" name="number" placeholder="Card Number"/>
		
			<input type="text" name="expiry" placeholder="MM-YY"/>
		
			<input type="text" name="cvc" placeholder="CVC"/>
		
			<button>Pay \${{ this.amount.value }}</button>
		</form>
	`,
	ViewModel: {
		amount: {
			default: () => Kefir.constant(1000)
		}
	}
});