import stache from 'can/view/stache/stache';

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

export

function translate(load) {

	return "define(['can/view/stache/stache'],function(stache){" +
		"return stache(\"" + esc(load.source) + "\")" +
		"})";

};
