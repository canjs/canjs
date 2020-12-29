/*!
 * CanJS - 2.2.2
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Tue, 31 Mar 2015 17:29:12 GMT
 * Licensed MIT
 */

/*can@2.2.2#view/ejs/system*/
"format steal";
steal("can/view/ejs", function(can){

	function translate(load) {
		return "define(['can/view/ejs/ejs'],function(can){" +
			"return can.view.preloadStringRenderer('" + load.metadata.pluginArgument + "'," +
			'can.EJS(function(_CONTEXT,_VIEW) { ' + new can.EJS({
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

