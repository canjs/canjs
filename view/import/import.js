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
		if(root && can.isFunction(root.waitFor)) {
			root.waitFor(importPromise);
		}

		// Set the viewModel to the promise
		can.viewModel(el, importPromise);

		// If there is a can-tag present we will hand-off rendering to that tag.
		var handOffTag = el.getAttribute("can-tag");
		if(handOffTag) {
			var scope = tagData.scope.add(importPromise);
			var callback = can.view.callbacks._tags[handOffTag];
			callback(el, can.extend(tagData, {
				scope: scope
			}));
		} else if(tagData.subtemplate) {
			var scope = tagData.scope.add(importPromise);
			var frag = tagData.subtemplate(scope, tagData.options);

			var nodeList = can.view.nodeLists.register([], undefined, true);
			can.one.call(el, "removed", function(){
				can.view.nodeLists.unregister(nodeList);
			});

			can.appendChild(el, frag, can.document);
			can.view.nodeLists.update(nodeList, can.childNodes(el));
		}
	});

});
