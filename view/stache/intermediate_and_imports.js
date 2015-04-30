steal("can/view/stache/mustache_core.js", "can/view/parser",
			"can/view/import", function(mustacheCore, parser){

	return function(source){

		var template = mustacheCore.cleanLineEndings(source);
		var imports = [],
			inImport = false,
			inFrom = false;

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
				}
			},
			attrEnd:   function( attrName ){
				if(attrName === "from") {
					inFrom = false;
				}
			},
			attrValue: function( value ){
				if(inFrom && inImport) {
					imports.push(value);
				}
			},
			close: function(tagName){
				if(tagName === "can-import") {
					imports.pop();
				}
			}
		}, true);

		return {intermediate: intermediate, imports: imports};
	};

});


