import { Component } from "//unpkg.com/can@5/core.mjs";

Stripe.setPublishableKey("pk_test_zCC2JrO3KSMeh7BB5x9OUe2U");

Component.extend({
	tag: 'cc-payment',
	view: `
		<form on:submit="this.pay(scope.event)">
			
			{{# if(this.errorMessage) }}
				<div class="message">{{ this.errorMessage }}</div>
			{{/ if }}

			<input type="text" name="number" placeholder="Card Number"
					{{# if(this.cardError) }}class="is-error"{{/ if }}
				value:bind="this.userCardNumber"/>

			<input type="text" name="expiry" placeholder="MM-YY"
				{{# if(this.expiryError) }}class="is-error"{{/ if }}
				value:bind="this.userExpiry"/>

			<input type="text" name="cvc" placeholder="CVC"
			{{# if(this.cvcError) }}class="is-error"{{/ if }}
				value:bind="this.userCVC"/>

			<button disabled:from="this.isCardInvalid">Pay $\{{ this.amount }}</button>
		
		</form>
	`,
	ViewModel: {
		amount: { default: 9.99 },
		
		userCardNumber: "string",
		get cardNumber() {
			return this.userCardNumber ? this.userCardNumber.replace(/-/g, ""): null;
		},
		get cardError() {
			if( this.cardNumber && !Stripe.card.validateCardNumber(this.cardNumber) ) {
				return "Invalid card number (ex: 4242-4242-4242).";
			}
		},

		userExpiry: "string",
		get expiryParts() {
			if(this.userExpiry) {
				return this.userExpiry.split("-").map(function(p){
					return parseInt(p, 10);
				});
			}
		},
		get expiryMonth() {
			return this.expiryParts && this.expiryParts[0];
		},
		get expiryYear() {
			return this.expiryParts && this.expiryParts[1];
		},
		get expiryError() {
			if( (this.expiryMonth || this.expiryYear) &&
				 !Stripe.card.validateExpiry(this.expiryMonth, this.expiryYear) ) {
				return "Invalid expiration date (ex: 01-22).";
			}
		},

		userCVC: "string",
		get cvc() {
			return this.userCVC ?
				parseInt(this.userCVC, 10) : null;
		},
		get cvcError() {
			if( this.cvc && !Stripe.card.validateCVC(this.cvc) ) {
				return "Invalid CVC (ex: 123).";
			}
		},
		pay: function(event) {
			event.preventDefault();
	
			Stripe.card.createToken({
				number: this.cardNumber,
				cvc: this.cvc,
				exp_month: this.expiryMonth,
				exp_year: this.expiryYear
			}, function(status, response){
				if(status === 200) {
					alert("Token: "+response.id);
					// stripe.charges.create({
					//   amount: this.amount,
					//   currency: "usd",
					//   description: "Example charge",
					//   source: response.id,
					// })
				} else {
					alert("Error: "+response.error.message);
				}
			});
		},

		get isCardValid() {
			return Stripe.card.validateCardNumber(this.cardNumber) &&
				Stripe.card.validateExpiry(this.expiryMonth, this.expiryYear) &&
				Stripe.card.validateCVC(this.cvc);
		},
		get isCardInvalid() {
			return !this.isCardValid;
		},
		get errorMessage() {
			return this.cardError || this.expiryError || this.cvcError;
		}
	}
});