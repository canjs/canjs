steal("can/view/stache", "can/view/stache/mustache_core.js",function(stache, mustacheCore){

	var escMap = {
		'\n': "\\n",
		'\r': "\\r",
		'\u2028': "\\u2028",
		'\u2029': "\\u2029"
	};

	var esc = function (string) {
		return ('' + string)
			.replace(/["'\\\n\r\u2028\u2029]/g, function (character) {
				if ("'\"\\".indexOf(character) >= 0) {
					return "\\" + character;
				} else {
					return escMap[character];
				}
			});
	};

	function translate(load) {
		var template = mustacheCore.cleanLineEndings(load.source);
		var imports = [],
			inImport = false,
			inFrom = false;
		
		var intermediate = can.view.parser(template, {
			start:     function( tagName, unary ){
				if(tagName === "can-import") {
					inImport = true;
				}
			},
			end:       function( tagName, unary ){
				if(tagName === "can-import") {
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
			chars:     function( value ){},
			comment:   function( value ){},
			special:   function( value ){},
			done:      function( ){}
	    }, true);

	    imports.unshift('can/view/stache/stache');
	    
		return "define("+JSON.stringify(imports)+",function(stache){" +
			"return stache(" + JSON.stringify(intermediate) + ")" +
		"})";

	}

	return {
		translate: translate
	};

});
