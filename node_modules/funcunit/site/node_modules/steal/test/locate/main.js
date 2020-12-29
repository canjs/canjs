define(["resources/template.stache!"], function(template){
	
	if(typeof window !== "undefined" && window.QUnit) {
		template = template.split("\n");

		QUnit.deepEqual(template, [
			"../node_modules/bootstrap/hello-world.png",
			"../steal.svg",
			'deep/deep.less'
		], 'locate:// works as expected from importing file in a directory');

		QUnit.start();
		removeMyself();
	} else {
		console.log("basics loaded", template);
	}
});
