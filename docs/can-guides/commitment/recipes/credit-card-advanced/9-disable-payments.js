const viewModel = {
	amount: Kefir.constant(1000),

	userCardNumber: Kefir.emitterProperty(),
	userCardNumberBlurred: Kefir.emitterProperty(),

	userExpiry: Kefir.emitterProperty(),
	userExpiryBlurred: Kefir.emitterProperty(),

	userCVC: Kefir.emitterProperty(),
	userCVCBlurred: Kefir.emitterProperty(),

	payClicked: Kefir.emitterProperty(),

	pay: function(event) {
		event.preventDefault();
		this.payClicked.emitter.value(true)
	}
};

viewModel.cardNumber = viewModel.userCardNumber.map((card) => {
	if (card) {
		return card.replace(/[\s-]/g, "");
	}
});
viewModel.cardError = viewModel.cardNumber.map(validateCard).toProperty(); // we’ll need this in the future
viewModel.showCardError = showOnlyWhenBlurredOnce(viewModel.cardError, viewModel.userCardNumberBlurred);

// EXPIRY
viewModel.expiry = viewModel.userExpiry.map((expiry) => {
	if (expiry) {
		return expiry.split("-")
	}
});
viewModel.expiryError = viewModel.expiry.map(validateExpiry).toProperty();
viewModel.showExpiryError = showOnlyWhenBlurredOnce(viewModel.expiryError, viewModel.userExpiryBlurred);

// CVC
viewModel.cvc = viewModel.userCVC;
viewModel.cvcError = viewModel.cvc.map(validateCVC).toProperty();
viewModel.showCVCError = showOnlyWhenBlurredOnce(viewModel.cvcError, viewModel.userCVCBlurred);

viewModel.isCardInvalid = Kefir.combine([viewModel.cardError, viewModel.expiryError, viewModel.cvcError],
	function(cardError, expiryError, cvcError) {
		return !!(cardError || expiryError || cvcError)
	});

viewModel.card = Kefir.combine([viewModel.cardNumber, viewModel.expiry, viewModel.cvc],
	function(cardNumber, expiry, cvc) {
		return {cardNumber , expiry , cvc};
	});

// STREAM< Promise<Number> | undefined >
const paymentPromises = Kefir.combine([viewModel.payClicked], [viewModel.card], (payClicked, card) => {
	if (payClicked) {
		console.log("Asking for token with", card);
		return new Promise(function(resolve) {
			setTimeout(function() {
				resolve(1000);
			}, 2000);
		})
	}
});

// STREAM< STREAM<STATUS> >
// This is a stream of streams of status objects.
const paymentStatusStream = paymentPromises.map((promise) => {
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

// STREAM<STATUS> //{status: "waiting"} | {status: "resolved"}
viewModel.paymentStatus = paymentStatusStream.flatMap().toProperty();

viewModel.disablePaymentButton = Kefir.combine([viewModel.isCardInvalid, viewModel.paymentStatus],
	function(isCardInvalid, paymentStatus) {
		return (isCardInvalid === true) || !paymentStatus || paymentStatus.status === "pending";
	}).toProperty(function() {
	return true;
});

const view = can.stache.from("app-view");

document.body.appendChild( view(viewModel) );

// HELPER FUNCTIONS
function validateCard(card) {
	if (!card) {
		return "There is no card"
	}
	if (card.length !== 16) {
		return "There should be 16 characters in a card";
	}
}

function validateExpiry(expiry) {
	if (!expiry) {
		return "There is no expiry. Format  MM-YY";
	}
	if (expiry.length !== 2 || expiry[0].length !== 2 || expiry[1].length !== 2) {
		return "Expirty must be formatted like MM-YY";
	}
}

function validateCVC(cvc) {
	if (!cvc) {
		return "There is no CVC code";
	}
	if (cvc.length !== 3) {
		return "The CVC must be at least 3 numbers";
	}
	if (isNaN(parseInt(cvc))) {
		return "The CVC must be numbers";
	}
}

function showOnlyWhenBlurredOnce(errorStream, blurredStream) {
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
