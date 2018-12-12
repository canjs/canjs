import view from "./template.stache";

steal.import("can-component").then(function(Component) {
	Component.extend({
		tag: "my-app",
		view: view,
		ViewModel: {}
	});

	if(window.DONE) {
		window.DONE();
	}
});
