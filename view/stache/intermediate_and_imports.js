steal("can/view/stache/mustache_core.js", "can/view/parser",
			"can/view/import", function(mustacheCore, parser){

	return function(source){

		var template = mustacheCore.cleanLineEndings(source);
		var imports = [],
			dynamicImports = [],
			ases = {},
			inImport = false,
			inFrom = false,
			inAs = false,
			isUnary = false,
			currentAs = "",
			currentFrom = "";

		var intermediate = parser(template, {
			start: function( tagName, unary ){
				isUnary = unary;
				if(tagName === "can-import") {
					inImport = true;
				} else if(inImport) {
					inImport = false;
				}
			},
			attrStart: function( attrName ){
				if(attrName === "from") {
					inFrom = true;
				} else if(attrName === "as") {
					inAs = true;
				}
			},
			attrEnd: function( attrName ){
				if(attrName === "from") {
					inFrom = false;
				} else if(attrName === "as") {
					inAs = false;
				}
			},
			attrValue: function( value ){
				if(inFrom && inImport) {
					imports.push(value);
					if(!isUnary) {
						dynamicImports.push(value);
					}
					currentFrom = value;
				} else if(inAs && inImport) {
					currentAs = value;
				}
			},
			end: function(tagName){
				if(tagName === "can-import") {
					// Set the as value to the from
					if(currentAs) {
						ases[currentAs] = currentFrom;
						currentAs = "";
					}
				}
			},
			close: function(tagName){
				if(tagName === "can-import") {
					imports.pop();
				}
			}
		}, true);

		return {
			intermediate: intermediate,
			imports: imports,
			dynamicImports: dynamicImports,
			ases: ases
		};
	};

});


