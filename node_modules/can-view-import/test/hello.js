define(["can-component", "can-stache"], function(Component, stache){

	Component.extend({
		tag: "hello-world",
		view: stache("Hello world!")
	});

});
