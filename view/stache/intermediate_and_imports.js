steal("can/view/stache/mustache_core.js", "can/view/parser",
			"can/view/import", function(mustacheCore, parser){

	return function(source){

		var template = mustacheCore.cleanLineEndings(source);
		var imports = [],
			ases = {},
			inImport = false,
			inFrom = false,
			inAs = false,
			currentAs = "",
			currentFrom = "";

		var intermediate = parser(template, {
			start: function( tagName, unary ){
				if(tagName === "can-import") {
					inImport = true;
				} else if(inImport) {
					inImport = false;
				}
			},
			attrStart: function( attrName ){
				if(attrName === "from") {
					inFrom = true;
				} else if(inImport && attrName === "[.]") {
					inAs = true;
					currentAs = "viewModel";
					return false;
				}
			},
			attrEnd: function( attrName ){
				if(attrName === "from") {
					inFrom = false;
				} else if(inImport && attrName === "[.]") {
					inAs = false;
					return false;
				}
			},
			attrValue: function( value ){
				if(inFrom && inImport) {
					imports.push(value);
					currentFrom = value;
				} else if(inAs && currentAs === "viewModel") {
					return false;
				}
			},
			end: function(tagName){
				if(tagName === "can-import") {
					// Set the as value to the from
					if(currentAs) {
						ases[currentAs] = currentFrom;
						currentAs = "";
						inAs = false;
					}
				}
			},
			close: function(tagName){
				if(tagName === "can-import") {
					imports.pop();
				}
			}
		}, true);

		return {intermediate: intermediate, imports: imports, ases: ases};
	};

});


