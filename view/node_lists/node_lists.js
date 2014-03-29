// # can/view/node_lists/node_list.js
// Consider the following template:
//
//	<div>
//  {{#if items.length}}
//		Items:
//		{{#items}}
//      	<label></label>
//      {{/items}}
//	{{/if}}
//  </div>
//
// The `{{#if}}` and `{{#items}}` seconds are "directly nested" because
// they share the same `<div>` parent element.
//
// If `{{#items}}` changes the DOM by adding more `<labels>`,
// `{{#if}}` needs to know about the `<labels>` to remove them
// if `{{#if}}` is re-rendered.  `{{#if}}` would be re-rendered, for example, if
// all items were removed.
// 
// `can.view.nodeLists` are used to make sure "directly nested" live-binding
// sections update content correctly.

steal('can/util', 'can/view/elements.js', function (can) {
	// Some browsers don't allow expando properties on HTMLTextNodes
	// so let's try to assign a custom property, an 'expando' property.
	// We use this boolean to determine how we are going to hold on
	// to HTMLTextNode within a nodeList.  More about this in the 'id'
	// function.
	var canExpando = true;
	try {
		document.createTextNode('')._ = 0;
	} catch (ex) {
		canExpando = false;
	}

	// ## Helpers
	
	// A mapping of element ids to nodeList id
	var nodeMap = {},

		// A mapping of ids to text nodes, this map will be used in the 
		// case of the browser not supporting expando properties
		textNodeMap = {},

		// The id used as the key in our nodeMap, this integer
		// will be preceded by 'element_' or 'obj_' depending on whether
		// the element has a nodeName.
		_id = 0,

		// The name of the expando property; the value returned 
		// given a nodeMap key.
		expando = 'ejs_' + Math.random(),

		// ## nodeLists.id
		// Given a template node, create an id on the node as a expando
		// property, or if the node is an HTMLTextNode and the browser
		// doesn't support expando properties store the id with a
		// reference to the text node in an internal collection then return
		// the lookup id.
		/**
		 * @hide
		 * Returns the id of the newly registered node or the lookup id of
		 * an already registered node.
		 * @param  {HTMLElement} node The HTMLElement to be stored in the nodeList
		 * @return {String} The lookup id of the node
		 */
		id = function (node) {
			// If the browser supports expando properties and the node
			// provided is not an HTMLTextNode, we don't need to work
			// with the internal textNodeMap and we can place the property
			// on the node.
			if (canExpando || node.nodeType !== 3) {
				// If the node already has an (internal) id, then just 
				// return the key of the nodeMap. This would be the case
				// in updating and unregistering a nodeList.
				if (node[expando]) {
					return node[expando];
				} else {
					// If the node isn't already referenced in the map we need
					// to generate a lookup id and place it on the node itself.
					++_id;
					return node[expando] = (node.nodeName ? 'element_' : 'obj_') + _id;
				}
			} else {
				// The nodeList has a specific collection for HTMLTextNodes for 
				// (older) browsers that do not support expando properties.   
				for (var textNodeID in textNodeMap) {
					if (textNodeMap[textNodeID] === node) {
						return textNodeID;
					}
				}
				// If we didn't find the node, we need to register it and return
				// the id used.
				++_id;
				// We have to store the node itself because of the browser's lack
				// of support for expando properties (i.e. we can't use a look-up
				// table and store the id on the node as a custom property).
				textNodeMap['text_' + _id] = node;
				return 'text_' + _id;
			}
		}, splice = [].splice;
	var nodeLists = {
		id: id,

		// ## Registering & Updating
		// 
		// To keep all live-bound sections knowing which elements they are managing,
		// all live-bound elments are [can.view.nodeLists.register registered] and
		// [can.view.nodeLists.update updated] when the change.
		//
		// For example, the above template, when rendered with data like:
		// 
		//      data = new can.Map({
		//        items: ["first","second"]
		//      })
		//
		// This will first render the following content:
		// 
		//		<div>
		//         <span data-view-id='5'/>
		//      </div>
		// 
		// When the `5` [can.view.hookup hookup] callback is called, this will register the `<span>` like:
		// 
		//      var ifsNodes = [<span 5>]
		//      nodeLists.register(ifsNodes);
		// 
		// And then render `{{if}}`'s contents and update `ifsNodes` with it:
		//
		//     nodeLists.update( ifsNodes, [<"\nItems:\n">, <span data-view-id="6">] );
		//
		// Next, hookup `6` is called which will regsiter the `<span>` like:
		//
		//     var eachsNodes = [<span 6>];
		//     nodeLists.register(eachsNodes);
		//
		// And then it will render `{{#each}}`'s content and update `eachsNodes` with it:
		//
		//     nodeLists.update(eachsNodes, [<label>,<label>]);
		//
		// As `nodeLists` knows that `eachsNodes` is inside `ifsNodes`, it also updates
		// `ifsNodes`'s nodes to look like:
		//
		//     [<"\nItems:\n">,<label>,<label>]
		//
		// Now, if all items were removed, `{{#if}}` would be able to remove
		// all the `<label>` elements.
		//
		// When you regsiter a nodeList, you can also provide a callback to know when
		// that nodeList has been replaced by a parent nodeList.  This is
		// useful for tearing down live-binding.

		// ## nodeLists.register
		// Registers a nodeList and returns the nodeList passed to register
		/**
		 * Registers a nodeList.
		 *
		 * @param {Array.<HTMLElement>} nodeList An array of elements. This array will 
		 * be kept live if child nodeLists update themselves.
		 * @param {function} [unregistered] An optional callback that is called when 
		 * the `nodeList` is replaced due to a parentNode list being updated.
		 * @param {Array.<HTMLElement>} [parent] An optional parent nodeList.  If no 
		 * parentNode list is found, the first element in `nodeList`'s current nodeList 
		 * will be used.
		 * @return {Array.<HTMLElement>} The `nodeList` passed to `register`.
		 */
		register: function (nodeList, unregistered, parent) {
			// if a unregistered callback has been provided assign it to the nodeList
			// as a property to be called when the nodeList is unregistred.
			nodeList.unregistered = unregistered;
			// Until this nodeLists is passed as the 'parent' paremeter of another
			// nodeList this array will remain empty.
			nodeList.childNodeLists = [];
			if (!parent) {
				// find the parent by looking up where this node is
				if (nodeList.length > 1) {
					throw 'does not work';
				}
				// if no parent is specified, look up the 0th element of nodeMap
				// and assign that to the parent slot.
				var nodeId = id(nodeList[0]);
				parent = nodeMap[nodeId];
			}
			nodeList.parentNodeList = parent;
			if (parent) {
				// now that we have found our parent, whether passed in as an
				// argument or the 0th element of the list assign the nodeList
				// as a child of that parent nodeList
				parent.childNodeLists.push(nodeList);
			}
			return nodeList;
		},

		// ## nodeLists.update
		// Updates a nodeList with new items, i.e. when values for the template have changed.
		/**
		 * Updates a nodeList with new items.
		 * @param {Array.<HTMLElement>} nodeList A registered nodeList.
		 * @param {Array.<HTMLElement>} newNodes HTML nodes that should be placed in the nodeList.
		 */
		update: function (nodeList, newNodes) {
			// Unregister all childNodes.
			can.each(nodeList.childNodeLists, function (nodeList) {
				nodeLists.unregister(nodeList);
			});
			nodeList.childNodeLists = [];
			// Remove old node pointers to this list.
			can.each(nodeList, function (node) {
				delete nodeMap[id(node)];
			});
			newNodes = can.makeArray(newNodes);
			// indicate the new nodes belong to this list
			can.each(newNodes, function (node) {
				nodeMap[id(node)] = nodeList;
			});
			var oldListLength = nodeList.length,
				firstNode = nodeList[0];
			// Replace oldNodeLists's contents'
			splice.apply(nodeList, [
				0,
				oldListLength
			].concat(newNodes));
			// update all parent nodes so they are able to replace the correct elements
			var parentNodeList = nodeList;
			while (parentNodeList = parentNodeList.parentNodeList) {
				splice.apply(parentNodeList, [
					can.inArray(firstNode, parentNodeList),
					oldListLength
				].concat(newNodes));
			}
		},

		// ## nodeLists.unregister
		// Unregister's a nodeList.  Call if the nodeList is no longer
		// being updated. This will also unregister all child nodeLists.
		/**
		 * Unregister's a nodeList.  Call if the nodeList is no longer
		 * being updated. This will also unregister all child nodeLists.
		 * @param {Array.<HTMLElement>} nodeList The nodeList to unregister.
		 */
		unregister: function (nodeList) {
			if (!nodeList.isUnregistered) {
				// if the nodeList isn't already unregistered, mark it as
				// unregistered so we don't do more work than necessary
				nodeList.isUnregistered = true;
				// we only want to unregister 'down' the prototype chain, so
				// we need to to detach the parent nodeList by deleting the 
				// pointer
				delete nodeList.parentNodeList;
				// for each node in the nodeList we want to compute it's id
				// and delete it from the nodeList's internal map
				can.each(nodeList, function (node) {
					var nodeId = id(node);
					delete nodeMap[nodeId];
				});
				// if an 'unregisted' function was provided during registration
				// then call that function
 				if (nodeList.unregistered) {
					nodeList.unregistered();
				}
				// now recursive down through the child node preforming the
				// same unregister process
				can.each(nodeList.childNodeLists, function (nodeList) {
					nodeLists.unregister(nodeList);
				});
			}
		},
		nodeMap: nodeMap
	};
	return nodeLists;
});
