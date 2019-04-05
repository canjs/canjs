import { Component, kefir as Kefir } from "//unpkg.com/can@5/ecosystem.mjs";

Component.extend({
	tag: "cc-payment",
	view: `
		<form on:submit="this.pay(scope.event)">
		
			{{# if(this.showCardError.value) }}
				<div class="message">{{ this.cardError.value }}</div>
			{{/ if }}

			{{# if(this.showExpiryError.value) }}
				<div class="message">{{ this.expiryError.value }}</div>
			{{/ if }}

			{{# if(this.showCVCError.value) }}
				<div class="message">{{ this.cvcError.value }}</div>
			{{/ if }}

			<input type="text" name="number" placeholder="Card Number"
				on:input:value:to="this.userCardNumber.value"
				on:blur="this.userCardNumberBlurred.emitter.value(true)"
				{{# if(this.showCardError.value) }}class="is-error"{{/ if }}/>
		
			<input type="text" name="expiry" placeholder="MM-YY"
				on:input:value:to="this.userExpiry.value"
				on:blur="this.userExpiryBlurred.emitter.value(true)"
				{{# if(this.showExpiryError.value) }}class="is-error"{{/ if }}/>
		
			<input type="text" name="cvc" placeholder="CVC"
				on:input:value:to="this.userCVC.value"
				on:blur="this.userCVCBlurred.emitter.value(true)"
				{{# if(this.showCVCError.value) }}class="is-error"{{/ if }}/>
		
			<button disabled:from="this.isCardInvalid.value">
				{{# eq(this.paymentStatus.value.status, "pending") }}Paying{{ else }}Pay{{/ eq }} \${{ this.amount.value }}
			</button>
		</form>
	`,
	ViewModel: {
		amount: {
			default: () => Kefir.constant(1000)
		},

		userCardNumber: {
			default: () => Kefir.emitterProperty()
		},
		userCardNumberBlurred: {
			default: () => Kefir.emitterProperty()
		},

		userExpiry: {
			default: () => Kefir.emitterProperty()
		},
		userExpiryBlurred: {
			default: () => Kefir.emitterProperty()
		},

		userCVC: {
			default: () => Kefir.emitterProperty(),
		},
		userCVCBlurred: {
			default: () => Kefir.emitterProperty()
		},

		payClicked: {
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
		get showCardError() {
			return this.showOnlyWhenBlurredOnce(this.cardError, this.userCardNumberBlurred);
		},

		// EXPIRY
		get expiry() {
			return this.userExpiry.map((expiry) => {
				if (expiry) {
					return expiry.split("-")
				}
			});
		},
		get expiryError() {
			return this.expiry.map(this.validateExpiry).toProperty();
		},
		get showExpiryError() {
			return this.showOnlyWhenBlurredOnce(this.expiryError, this.userExpiryBlurred);
		},

		// CVC
		get cvc () {
			return this.userCVC;
		},
		get cvcError() {
			return this.cvc.map(this.validateCVC).toProperty();
		},
		get showCVCError() {
			return this.showOnlyWhenBlurredOnce(this.cvcError, this.userCVCBlurred);
		},

		get isCardInvalid(){
			return Kefir.combine([this.cardError, this.expiryError, this.cvcError],
				(cardError, expiryError, cvcError) => {
					return !!(cardError || expiryError || cvcError)
			});
		},

		get card() {
			return Kefir.combine([this.cardNumber, this.expiry, this.cvc],
				(cardNumber, expiry, cvc) => {
					return {cardNumber , expiry , cvc};
			});
		},

		// STREAM< Promise<Number> | undefined >
		get paymentPromises(){
			return Kefir.combine([this.payClicked], [this.card], (payClicked, card) => {
				if (payClicked) {
					console.log("Asking for token with", card);
					return new Promise((resolve) => {
						setTimeout(() => {
							resolve(1000);
						}, 2000);
					})
				}
			});
		},

		// STREAM< STREAM<STATUS> >
		// This is a stream of streams of status objects.
		get paymentStatusStream () {
			return this.paymentPromises.map((promise) => {
				if (promise) {
					// STREAM<STATUS>
					return Kefir.concat([
						Kefir.constant({
							status: "pending"
						}),
						Kefir.fromPromise(promise).map((value) => {
							return {
								status: "resolved",
								value: value
							};
						})
					]);
				} else {
					// STREAM
					return Kefir.constant({
						status: "waiting"
					});
				}
			});
		},

		// STREAM<STATUS> //{status: "waiting"} | {status: "resolved"}
		get paymentStatus(){
			return this.paymentStatusStream.flatMap().toProperty();
		},

		pay(event) {
			event.preventDefault();
			this.payClicked.emitter.value(true)
		},

		// HELPER FUNCTIONS
		validateCard(card) {
			if (!card) {
				return "There is no card"
			}
			if (card.length !== 16) {
				return "There should be 16 characters in a card";
			}
		},
		validateExpiry(expiry) {
			if (!expiry) {
				return "There is no expiry. Format  MM-YY";
			}
			if (expiry.length !== 2 || expiry[0].length !== 2 || expiry[1].length !== 2) {
				return "Expiry must be formatted like MM-YY";
			}
		},
		validateCVC(cvc) {
			if (!cvc) {
				return "There is no CVC code";
			}
			if (cvc.length !== 3) {
				return "The CVC must be at least 3 numbers";
			}
			if (isNaN(parseInt(cvc))) {
				return "The CVC must be numbers";
			}
		},
		showOnlyWhenBlurredOnce(errorStream, blurredStream) {
			const errorEvent = errorStream.map((error) => {
				if (!error) {
					return {
						type: "valid"
					}
				} else {
					return {
						type: "invalid",
						message: error
					}
				}
			});

			const focusEvents = blurredStream.map((isBlurred) => {
				if (isBlurred === undefined) {
					return {};
				}
				return isBlurred ? {
					type: "blurred"
				} : {
					type: "focused"
				};
			});

			return Kefir.merge([errorEvent, focusEvents])
				.scan((previous, event) => {
					switch (event.type) {
						case "valid":
							return Object.assign({}, previous, {
								isValid: true,
								showCardError: false
							});
						case "invalid":
							return Object.assign({}, previous, {
								isValid: false,
								showCardError: previous.hasBeenBlurred
							});
						case "blurred":
							return Object.assign({}, previous, {
								hasBeenBlurred: true,
								showCardError: !previous.isValid
							});
						default:
							return previous;
					}
				}, {
					hasBeenBlurred: false,
					showCardError: false,
					isValid: false
				}).map((state) => {
					return state.showCardError
				});
		}
	}
});
