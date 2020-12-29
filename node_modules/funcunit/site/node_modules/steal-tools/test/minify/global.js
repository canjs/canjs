"format global";

(function() {

	//!steal-remove-start
	var someVarIWantRemoved = "remove this";
	//!steal-remove-end

	var anotherVeryLongName = "from global";

	window.global = {
		value: anotherVeryLongName
	};

})();
