steal('can/util/can.js', function (can) {
	// # can.inserted
	// Given a list of elements, check if they are in the dom, if they 
	// are in the dom, trigger the `inserted` event on them.
	can.inserted = function (elems) {
		// Prevent mutations from changing the looping
		elems = can.makeArray(elems);
		var inDocument = false,
			// Not all browsers implement document.contains (Android)
			doc = can.$(document.contains ? document : document.body),
			children;
		// Go through `elems` and trigger the `inserted` event.
		// If the first element is not in the document (a Document Fragment)
		// exit the function.
		for (var i = 0, elem;
			(elem = elems[i]) !== undefined; i++) {
			// If we haven't already found an element in the document
			if (!inDocument) {
				if (elem.getElementsByTagName) {
					// If it is in the document
					if (can.has(doc, elem)
						.length) {
						inDocument = true;
					} else {
						// Document Fragment, exit the function
						return;
					}
				} else {
					// Continue on to the next element
					continue;
				}
			}

			if (inDocument && elem.getElementsByTagName) {
				// We've found an element in the document and will now
				// trigger `inserted` for `elem` and all of its children.
				children = can.makeArray(elem.getElementsByTagName("*"));
				can.trigger(elem, "inserted", [], false);
				for (var j = 0, child;
					(child = children[j]) !== undefined; j++) {
					// Trigger the inserted event
					can.trigger(child, "inserted", [], false);
				}
			}
		}
	};

	// ## Create can.appendChild and can.insertBefore
	can.appendChild = function (el, child) {
		var children;
		// Document Fragment
		if (child.nodeType === 11) {
			children = can.makeArray(child.childNodes);
		} else {
			children = [child];
		}
		el.appendChild(child);
		// Trigger the inserted event on the children
		can.inserted(children);
	};
	can.insertBefore = function (el, child, ref) {
		var children;
		// Document Fragment
		if (child.nodeType === 11) {
			children = can.makeArray(child.childNodes);
		} else {
			children = [child];
		}
		el.insertBefore(child, ref);
		// Trigger the inserted event on the children
		can.inserted(children);
	};
});
