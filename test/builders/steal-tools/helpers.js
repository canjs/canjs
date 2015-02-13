var can = require('can/util/');
var stache = require('can/view/stache/');

can.stache.registerHelper("templateName", function(){
	return "Stache";
});
