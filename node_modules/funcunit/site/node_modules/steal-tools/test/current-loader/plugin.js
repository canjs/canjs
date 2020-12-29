define(["@loader"], function(loader){

	// This shouldn't throw.
	loader.map.foo;

	function translate(load){
		return "";
	}

	return {
		translate: translate
	};

});
