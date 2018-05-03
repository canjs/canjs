const viewModel = {
	amount: Kefir.constant(1000),

	userCardNumber: Kefir.emitterProperty()
};

viewModel.cardNumber = viewModel.userCardNumber.map((card) => {
	if (card) {
		return card.replace(/[\s-]/g, "");
	}
});
viewModel.cardError = viewModel.cardNumber.map(validateCard);

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
