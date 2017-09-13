var viewModel = {
	amount: Kefir.constant(1000),

	userCardNumber: Kefir.emitterProperty()
};

viewModel.cardNumber = viewModel.userCardNumber.map((card) => {
	if (card) {
		return card.replace(/[\s-]/g, "");
	}
});

var view = can.stache.from("app-view");

document.body.appendChild( view(viewModel) );
