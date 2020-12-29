"use strict";
var observer = new MutationObserver( function(mutations){
	var mutation;
	for(var i = 0; i < mutations.length; i++) {
		mutation = mutations[i];
		for(var j = 0 ; j < mutation.removedNodes.length; j++ ){
			if(removeHandlers.has(mutation.removedNodes[j])) {
				removeHandlers.get(mutation.removedNodes[j])();
				removeHandlers["delete"](mutation.removedNodes[j]);
			}
		}
	}
});

observer.observe(document.documentElement, {childList: true, subtree: true});

var removeHandlers = new Map(); // jshint ignore:line

module.exports = function(element, cb){
	removeHandlers.set(element, cb);
};
