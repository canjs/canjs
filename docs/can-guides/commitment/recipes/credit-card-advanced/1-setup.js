const viewModel = {
	amount: Kefir.constant(1000)
};

const view = can.stache.from("app-view");

document.body.appendChild( view(viewModel) );
