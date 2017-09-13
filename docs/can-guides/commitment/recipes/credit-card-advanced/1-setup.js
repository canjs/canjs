var viewModel = {
	amount: Kefir.constant(1000)
};

var view = can.stache.from("app-view");

document.body.appendChild( view(viewModel) );
