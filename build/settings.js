steal(function () {
	return {
		"jquery" : {
			exclude : ["jquery", "jquery/jquery.js"],
			wrapInner : ['(function(window, $, undefined) {\n', '\n})(this, jQuery);']
		},
		"zepto" : {
			exclude : ["can/util/zepto/zepto.1.0rc1.js"],
			wrapInner : ['(function(window, $, undefined) {\n', '\n})(this, Zepto)']
		},
		"mootools" : {
			exclude : [ "can/util/mootools/mootools-core-1.4.5.js", "can/util/mootools/mootools-core-1.4.3.js" ]
		},
		"dojo" : {
			exclude : ["can/util/dojo/dojo-1.8.1.js"]
			/* TODO probably needs to look somehow like this
			wrapInner : [
				'\ndefine("can/dojo", ["dojo/query", "dojo/NodeList-dom", "dojo/NodeList-traverse"], function(){\n',
				'\nreturn can;\n});\n'
			]
			*/
		},
		"yui" : {
			exclude : ["can/util/yui/yui-3.7.3.js"]
			/* TODO probably needs to look somehow like this
			wrapInner : [
				'(function(can, window, undefined){\nYUI().add("can", function(Y) {\ncan.Y = Y;\n',
				'}, "0.0.1", {\n' +
					'requires: ["node", "io-base", "querystring", "event-focus", "array-extras"],' +
					'\n optional: ["selector-css2", "selector-css3"]\n});\n})(can = {}, this );'
			]
			*/
		}
	}
});