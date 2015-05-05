steal("can/util", "can/view/callbacks", function(can){

	can.view.tag("can-import", function(el, tagData){
		var moduleName = el.getAttribute("from");
		var importPromise;
		if(moduleName) {
			importPromise = can["import"](moduleName);
		} else {
			importPromise = can.Deferred().reject("No moduleName provided").promise();
		}

		var root = tagData.scope.attr("@root");
		if(root) {
			root.waitFor(importPromise);
		}

		if(tagData.subtemplate) {
			var scope = tagData.scope.add(importPromise);
			var frag = tagData.subtemplate(scope, tagData.options);

			can.appendChild(el, frag);
		}
	});

});
