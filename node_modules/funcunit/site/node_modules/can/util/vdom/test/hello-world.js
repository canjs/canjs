steal("can/util", "can/view/stache", "can/component",function(can, stache){
	
	can.Component.extend({
		tag: "hello-world",
		template: stache("<h1>Hello World</h1>")
	});
	
});
