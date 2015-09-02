// # can/util/inserted
// Used to alert interested parties of when an element is inserted into the DOM.
// Given a list of elements, check if the first is in the DOM, and if so triggers the `inserted` event on all elements and their descendants.

steal('can/util/can.js', function (can) {
	can.inserted = function (elems, document) {
		if(!elems.length) {
			return;
		}
		// Turn the `elems` property into an array to prevent mutations from changing the looping.
		elems = can.makeArray(elems);
		var doc = document || elems[0].ownerDocument || elems[0],
			inDocument = false,
			// Gets the `doc` to use as a reference for finding out whether the element is in the document.
			root = can.$(doc.contains ? doc : doc.body),
			children;

		// Go through `elems` and trigger the `inserted` event.
		// If the first element is not in the document (a Document Fragment) it will exit the function. If it is in the document it sets the `inDocument` flag to true. This means that we only check for the first element and either exit the function or start triggering "inserted" for child elements.
		for (var i = 0, elem;
			(elem = elems[i]) !== undefined; i++) {
			if (!inDocument) {
				if (elem.getElementsByTagName) {
					if (can.has(root, elem)
						.length) {
						inDocument = true;
					} else {
						return;
					}
				} else {
					continue;
				}
			}

			// If we've found an element in the document then we can now trigger **"inserted"** for `elem` and all of its children. We are using `getElementsByTagName("*")` so that we grab all of the descendant nodes.
			if (inDocument && elem.getElementsByTagName) {
				children = can.makeArray(elem.getElementsByTagName("*"));
				can.trigger(elem, "inserted", [], false);
				for (var j = 0, child;
					(child = children[j]) !== undefined; j++) {
					can.trigger(child, "inserted", [], false);
				}
			}
		}
	};

	// ## can.appendChild
	// Used to append a node to an element and trigger the "inserted" event on all of the newly inserted children. Since `can.inserted` takes an array we convert the child to an array, or in the case of a DocumentFragment we first convert the childNodes to an array and call inserted on those.
	can.appendChild = function (el, child, document) {
		var children;
		if (child.nodeType === 11) {
			children = can.makeArray(can.childNodes(child));
		} else {
			children = [child];
		}
		el.appendChild(child);
		can.inserted(children, document);
	};

	// ## can.insertBefore
	// Like can.appendChild, used to insert a node to an element before a reference node and then trigger the "inserted" event.
	can.insertBefore = function (el, child, ref, document) {
		var children;
		if (child.nodeType === 11) {
			children = can.makeArray(can.childNodes(child));
		} else {
			children = [child];
		}
		el.insertBefore(child, ref);
		can.inserted(children, document);
	};
});
