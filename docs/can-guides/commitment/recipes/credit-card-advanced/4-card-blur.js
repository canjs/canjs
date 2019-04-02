import { Component, kefir as Kefir } from "//unpkg.com/can@5/ecosystem.mjs";

Component.extend({
    tag: "cc-payment",
    view: `
		<form>
		
			{{# if(this.showCardError.value) }}
				<div class="message">{{ this.cardError.value }}</div>
			{{/ if }}

			<input type="text" name="number" placeholder="Card Number"
				on:input:value:to="this.userCardNumber.value"
				on:blur="this.userCardNumberBlurred.emitter.value(true)"
				{{# if(this.showCardError.value) }}class="is-error"{{/ if }}/>
		
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
        userCardNumberBlurred: {
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
        // HELPER FUNCTIONS
        validateCard(card) {
            if (!card) {
                return "There is no card"
            }
            if (card.length !== 16) {
                return "There should be 16 characters in a card";
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