const globals = require("can-globals");
const domMutate = require("can-dom-mutate");
const domMutateNode = require("can-dom-mutate/node");

const helpers = {
	afterMutation: function(cb) {
		var doc = globals.getKeyValue("document");
		var div = doc.createElement("div");
		var insertionDisposal = domMutate.onNodeInsertion(div, function(){
			insertionDisposal();
			doc.body.removeChild(div);
			setTimeout(cb, 5);
		});
		setTimeout(function(){
			domMutateNode.appendChild.call(doc.body, div);
		}, 10);
	},
	browserSupports: {
		customElements: "customElements" in window,
		shadowDom: typeof document.body.attachShadow === "function"
	}
};

module.exports = helpers;
