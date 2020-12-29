/*!
 * CanJS - 2.2.4
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 03 Apr 2015 23:27:46 GMT
 * Licensed MIT
 */

/*can@2.2.4#view/mustache/system*/
"format steal";
steal("can/view/mustache", function(can){

	function translate(load) {
		return "define(['can/view/mustache/mustache'],function(can){" +
			"return can.view.preloadStringRenderer('" + load.metadata.pluginArgument + "'," +
			'can.Mustache(function(scope,options) { ' + new can.Mustache({
				text: load.source,
				name: load.name
			})
			.template.out + ' })' +
			")" +
			"})";
	}

	return {
		translate: translate
	};

});

