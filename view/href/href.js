steal("can/util",
	"can/view/stache/mustache_core.js",
	"can/view/callbacks",
	"can/view/scope", function (can, mustacheCore) {


	var removeCurly = function(value){
		if(value[0] === "{" && value[value.length-1] === "}") {
			return value.substr(1, value.length - 2);
		}
		return value;
	};

	// registers a callback can-href
	can.view.attr("can-href", function(el, attrData){

		// foo='bar' zed=5 abc=myValue
		// Note: 'tmp ' is added because expressionData "Breaks up the name and arguments of a mustache expression.", but we don't use name:
		var attrInfo = mustacheCore.expressionData('tmp ' + removeCurly(el.getAttribute("can-href")));
		// -> {hash: {foo: 'bar', zed: 5, abc: {get: 'myValue'}}}

		var routeHref = can.compute(function(){
			var hash = {};
			can.each(attrInfo.hash, function(val, key) {
				if (val && val.hasOwnProperty("get")) {
					hash[key] = attrData.scope.read(val.get, {}).value;
				} else {
					hash[key] = val;
				}
			});
			return can.route.url(hash);
		});


		el.setAttribute("href", routeHref());

		var handler = function(ev, newVal){
			el.setAttribute("href", newVal);
		};

		routeHref.bind("change", handler );

		can.bind.call(el,"removed", function(){
			routeHref.unbind("change", handler );
		});
	});


});