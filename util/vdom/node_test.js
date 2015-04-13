var steal = require("steal");
var path = require("path");

var localSteal =  steal.clone( steal.addSteal( steal.System.clone() ) );

localSteal.startup({
	config: path.join(__dirname,"..","..", "package.json!npm"),
	main: "@empty"
}).then(function(){
	
	localSteal.System.import("can/view/vdom/test/dom").then(function(){
		localSteal.System.import("can/view/vdom/test/main.stache!").then(function(renderer){
			var res = renderer({});
			var div = document.createElement("div");
			div.appendChild(res);
			console.log("got it!", div.innerHTML);
		}, function(e){
			console.log(e);
		});
		
		console.log("done!");
	}, function(e){
		console.log(e);
	});
	
	
});

