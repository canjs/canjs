var Steal = require("steal"),
	path = require('path');


var steal =  Steal.clone();

var System = global.System = steal.System;

System.config({
	config: path.join(__dirname, "..","package.json!npm"),
	main: "@empty",
	env: "server-development"
});


steal.import('can-simple-dom').then(function(simpleDOMMod){

	return steal.import('can-simple-dom/simple-dom/default-tokenize').then(function(tokenizeMod){

		var document = global.document = new simpleDOMMod.Document();
		document.__addSerializerAndParser(
			new simpleDOMMod.HTMLSerializer(simpleDOMMod.voidMap),
			new simpleDOMMod.HTMLParser(tokenizeMod["default"], document, simpleDOMMod.voidMap)
		);

		global.location = {};

		console.log("importing jQuery");
		return steal.import('jquery');


	});
	
}).then(function(){
	console.log("worked");
}, function(e){
	console.log("fail",e);

	setTimeout(function(){
		throw e;
	},1);
});
