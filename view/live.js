steal('can/util', './elements.js','can/view','./node_lists.js',
	function(can, elements,view,nodeLists){
	// ## live.js
	// 
	// The live module provides live binding for computes
	// and can.Observe.List.
	// 
	// Currently, it's API is designed for `can/view/render`, but
	// it could easily be used for other purposes.


	// ### Helper methods
	// 
	// #### setup
	// 
	// `setup(HTMLElement, bind(data), unbind(data)) -> data`
	// 
	// Calls bind right away, but will call unbind
	// if the element is "destroyed" (removed from the DOM).
	var setup = function(el, bind, unbind){
		var teardown = function(){
			unbind(data)
			can.unbind.call(el,'destroyed', teardown);
		},
			data = {
				teardownCheck: function(parent){
					if(!parent){
						teardown();
					}
				}
			}

		can.bind.call(el,'destroyed', teardown);
		bind(data)
		return data;
	},
		// #### listen
		// Calls setup, but presets bind and unbind to 
		// operate on a compute
		listen = function(el, compute, change){
			return setup(el, function(){
				compute.bind("change", change);
			},function(data){
				compute.unbind("change", change);
				if(data.nodeList){
					nodeLists.unregister( data.nodeList );
				}
			});
		},
		// #### getAttributeParts
		// Breaks up a string like foo='bar' into ["foo","'bar'""]
		getAttributeParts = function(newVal){
			return (newVal|| "").replace(/['"]/g, '').split('=')
		}
		// #### insertElementsAfter
		// Appends elements after the last item in oldElements.
		insertElementsAfter = function(oldElements, newFrag){
			var last = oldElements[oldElements.length - 1];
					
			// Insert it in the `document` or `documentFragment`
			if( last.nextSibling ){
				last.parentNode.insertBefore(newFrag, last.nextSibling);
			} else {
				last.parentNode.appendChild(newFrag);
			}
		};


	var live = {
		nodeLists : nodeLists,
		list: function(el, list, func, context, parentNode){
			// A mapping of the index to an array
			// of elements that represent the item.
			// Each array is registered so child or parent
			// live structures can update the elements
			var nodesMap = [],

				add = function(ev, items, index){

					// Collect new html and mappings
					var frag = document.createDocumentFragment(),
						newMappings = [];
					can.each(items, function(item){
						var itemHTML = func.call(context,item),
							itemFrag = can.view.frag(itemHTML, parentNode);

						newMappings.push(can.makeArray(itemFrag.childNodes));
						frag.appendChild(itemFrag);
					})

					// Inserting at the end of the list
					if(!nodesMap[index]){
						insertElementsAfter(
							index == 0 ?
								[text] :
								nodesMap[index-1], frag)
					} else {
						var el = nodesMap[index][0];
						el.parentNode.insertBefore(frag, el)
					}
					// register each item
					can.each(newMappings,function(nodeList){
						nodeLists.register(nodeList)
					});
					[].splice.apply(nodesMap, [index, 0].concat(newMappings));
				},
				remove = function(ev, items, index){
					var removedMappings = nodesMap.splice(index, items.length),
						itemsToRemove = [];

					can.each(removedMappings,function(nodeList){
						// add items that we will remove all at once
						[].push.apply(itemsToRemove, nodeList)
						// Update any parent lists to remove these items
						nodeLists.replace(nodeList,[]);
						// unregister the list
						nodeLists.unregister(nodeList);

					});
					can.remove( can.$(itemsToRemove) );
				},
				parentNode = elements.getParentNode(el, parentNode),
				text = document.createTextNode("");

			// Setup binding and teardown to add and remove events
			setup(parentNode, function(){
				list.bind("add", add).bind("remove", remove)
			},function(){
				list.unbind("add", add).unbind("remove", remove);
				can.each(nodesMap, function(nodeList){
					nodeLists.unregister( nodeList );
				})
			})

			insertElementsAfter([el],text);
			can.remove( can.$(el) );
			add({}, list, 0);
/*
			list.each(function(item, i){
				
				var itemFrag = func.call(context,item),
					newNodes = can.makeArray(itemFrag.childNodes);

				frag.appendChild(itemFrag);

				nodesMap[i] = newNodes;
				nodeLists.register(newNodes);
			})
			replaceElements([el], frag);*/
		},
		html: function(el, compute, parentNode){
			var parentNode = elements.getParentNode(el, parentNode),

				data = listen(parentNode, compute, function(ev, newVal, oldVal){
				var attached = nodes[0].parentNode;
				// update the nodes in the DOM with the new rendered value
				if( attached ) {
					makeAndPut(newVal);
				}
				data.teardownCheck(nodes[0].parentNode);
			});

			var nodes,
				makeAndPut = function(val){
					// create the fragment, but don't hook it up
					// we need to insert it into the document first
					var frag = can.view.frag(val, parentNode),
						// keep a reference to each node
						newNodes = can.makeArray(frag.childNodes);
					// Insert it in the `document` or `documentFragment`
					insertElementsAfter(nodes || [el], frag)
					// nodes hasn't been set yet
					if( !nodes ) {
						can.remove( can.$(el) );
						nodes = newNodes;
						// set the teardown nodeList
						data.nodeList = nodes;
						nodeLists.register(nodes);
					} else {
						// Update node Array's to point to new nodes
						// and then remove the old nodes.
						// It has to be in this order for Mootools
						// and IE because somehow, after an element
						// is removed from the DOM, it loses its
						// expando values.
						var nodesToRemove = can.makeArray(nodes);
						nodeLists.replace(nodes,newNodes);
						can.remove( can.$(nodesToRemove) );
					}
				};
				makeAndPut(compute(), [el]);

		},
		text: function(el, compute, parentNode){
			var parent = elements.getParentNode(el, parentNode);

			// setup listening right away so we don't have to re-calculate value
			var data  = listen( el.parentNode !== parent ? el.parentNode : parent, compute, function(ev, newVal, oldVal){
				// Sometimes this is 'unknown' in IE and will throw an exception if it is
				if ( typeof node.nodeValue != 'unknown' ) {
					node.nodeValue = ""+newVal;
				}
				data.teardownCheck(node.parentNode);
			});

			var node = document.createTextNode(compute());

			if ( el.parentNode !== parent ) {
				parent = el.parentNode;
				parent.insertBefore(node, el);
				parent.removeChild(el);
			} else {
				parent.insertBefore(node, el);
				parent.removeChild(el);
			}
		},
		attributes: function(el, compute, currentValue){
			var setAttrs = function(newVal){
				var parts = getAttributeParts(newVal),
					newAttrName = parts.shift();
				
				// Remove if we have a change and used to have an `attrName`.
				if((newAttrName != attrName) && attrName){
					elements.removeAttr(el,attrName);
				}
				// Set if we have a new `attrName`.
				if(newAttrName){
					elements.setAttr(el, newAttrName, parts.join('='));
					attrName = newAttrName;
				}
			}

			listen(el, compute, function(ev, newVal){
				setAttrs(newVal)
			})
			// current value has been set
			if(arguments.length >= 3) {
				var attrName = getAttributeParts(currentValue)[0]
			} else {
				setAttrs(compute())
			}
		},
		attributePlaceholder: '__!!__',
		attributeReplace: /__!!__/g,
		attribute: function(el, attributeName, compute){
			listen(el, compute, function(ev, newVal){
				elements.setAttr( el, attributeName, hook.render() );
			})

			var wrapped = can.$(el),
				hooks;
			
			// Get the list of hookups or create one for this element.
			// Hooks is a map of attribute names to hookup `data`s.
			// Each hookup data has:
			// `render` - A `function` to render the value of the attribute.
			// `funcs` - A list of hookup `function`s on that attribute.
			// `batchNum` - The last event `batchNum`, used for performance.
			hooks = can.data(wrapped,'hooks');
			if ( ! hooks ) {
				can.data(wrapped, 'hooks', hooks = {});
			}
			
			// Get the attribute value.
			var attr = elements.getAttr(el, attributeName ),
				// Split the attribute value by the template.
				// Only split out the first __!!__ so if we have multiple hookups in the same attribute, 
				// they will be put in the right spot on first render
				parts = attr.split(live.attributePlaceholder),
				goodParts = [],
				hook;
				goodParts.push(parts.shift(), 
							   parts.join(live.attributePlaceholder));

			// If we already had a hookup for this attribute...
			if(hooks[attributeName]) {
				// Just add to that attribute's list of `function`s.
				hooks[attributeName].computes.push(compute);
			} else {
				// Create the hookup data.
				hooks[attributeName] = {
					render: function() {
						var i =0,
							// attr doesn't have a value in IE
							newAttr = attr
								? attr.replace(live.attributeReplace, function() {
										return elements.contentText( hook.computes[i++]() );
									})
								: elements.contentText( hook.computes[i++]() );
						return newAttr;
					},
					computes: [compute],
					batchNum : undefined
				};
			}

			// Save the hook for slightly faster performance.
			hook = hooks[attributeName];

			// Insert the value in parts.
			goodParts.splice(1,0,compute());

			// Set the attribute.
			elements.setAttr(el, attributeName, goodParts.join("") );




		}
	}
	return live;

})