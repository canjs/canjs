var canReflect = require("can-reflect");
var live = require("can-view-live");
var Observation = require("can-observation");
var domMutate = require("can-dom-mutate");
var domMutateNode = require("can-dom-mutate/node");
var canSymbol = require("can-symbol");
var liveHelpers = require("can-view-live/lib/helpers");

var keepNodeSymbol = canSymbol.for("done.keepNode");

function portalHelper(elementObservable, options){
	var debugName = "portal(" + canReflect.getName(elementObservable) + ")";

	function portalContents() {
		var frag = options.fn(
			options.scope
			.addLetContext({}),
			options.options
		);

		var child = frag.firstChild;
		while(child) {
			// makes sure DoneJS does not remove these nodes
			child[keepNodeSymbol] = true;
			child = child.nextSibling;
		}


		return frag;
	}

	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		Object.defineProperty(portalContents,"name",{
			value: debugName+" contents"
		});
	}
	//!steal-remove-end


	// Where we are portalling
	var portalElement,
		startPortalledPlaceholder,
		endPortalledPlaceholder,
		commentPlaceholderDispose;
	function teardownPortalledContent() {

		if(portalElement) {
			canReflect.offValue(elementObservable, getElementAndRender);
			portalElement = null;
		}

		if(startPortalledPlaceholder && endPortalledPlaceholder) {
			var parentNode = startPortalledPlaceholder.parentNode;
			if(parentNode) {
				liveHelpers.range.remove({start: startPortalledPlaceholder, end: endPortalledPlaceholder});
				domMutateNode.removeChild.call(parentNode, startPortalledPlaceholder );
				domMutateNode.removeChild.call(parentNode, endPortalledPlaceholder );
				startPortalledPlaceholder = endPortalledPlaceholder = null;
			}
		}
	}
	function teardownEverything(){
		if(commentPlaceholderDispose) {
			commentPlaceholderDispose();
		}
		teardownPortalledContent();
	}
	// The element has changed
	function getElementAndRender() {
		// remove the old rendered content and unbind if we've bound before
		teardownPortalledContent();

		canReflect.onValue(elementObservable, getElementAndRender);

		portalElement = canReflect.getValue(elementObservable);

		if(portalElement) {
			startPortalledPlaceholder = portalElement.ownerDocument.createComment(debugName+" contents");
			endPortalledPlaceholder = portalElement.ownerDocument.createComment("can-end-placeholder");
			startPortalledPlaceholder[keepNodeSymbol] = true;
			endPortalledPlaceholder[keepNodeSymbol] = true;
			portalElement.appendChild(startPortalledPlaceholder);
			portalElement.appendChild(endPortalledPlaceholder);

			var observable = new Observation(portalContents, null, {isObservable: false});

			live.html(startPortalledPlaceholder, observable);
		} else {
			options.metadata.rendered = true;
		}

	}

	getElementAndRender();

	return function(placeholderElement) {
		var commentPlaceholder = placeholderElement.ownerDocument.createComment(debugName);

		placeholderElement.parentNode.replaceChild(commentPlaceholder, placeholderElement);
		commentPlaceholderDispose = domMutate.onNodeRemoved(commentPlaceholder, teardownEverything);
		return commentPlaceholder;
	};
}

portalHelper.isLiveBound = true;
portalHelper.requiresOptionsArgument = true;

module.exports = portalHelper;
