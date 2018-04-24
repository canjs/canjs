const viewModel = {
	amount: Kefir.constant(1000),

	userCardNumber: Kefir.emitterProperty(),
	userCardNumberBlurred: Kefir.emitterProperty()
};

viewModel.cardNumber = viewModel.userCardNumber.map((card) => {
	if (card) {
		return card.replace(/[\s-]/g, "");
	}
});
viewModel.cardError = viewModel.cardNumber.map(validateCard).toProperty();
viewModel.showCardError = showOnlyWhenBlurredOnce(viewModel.cardError, viewModel.userCardNumberBlurred);

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
