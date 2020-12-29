"format cjs";

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


exports.locateScheme = true;


exports.translate = function(load) {
	return "define([], function() {\n" +
		"return '" + esc(load.source) + "';\n});";
}
