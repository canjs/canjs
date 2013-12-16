steal('can/util',"can/view/elements.js",function(can){


	// text node expando test
	var canExpando = true;
	try {
		document.createTextNode('')._ = 0;
	} catch (ex) {
		canExpando = false;
	}


	// A mapping of element ids to nodeList id
	var nodeMap = {},
	// A mapping of ids to text nodes
	textNodeMap = {},
	expando = "ejs_1",
	_id=0,
	id = function(node){
		if(canExpando || node.nodeType !== 3) {
			if(node[expando]) {
				return node[expando];
			}
			else {
				return node[expando] = (node.nodeName ? "element_" : "obj_")+(++_id);
			}
		}
		else {
			for(var textNodeID in textNodeMap) {
				if(textNodeMap[textNodeID] === node) {
					return textNodeID;
				}
			}

			textNodeMap["text_" + (++_id)] = node;
			return "text_" + _id;
		}
	},
	// removes a nodeListId from a node's nodeListIds
	removeNodeListId= function(node, nodeListId){
		var nodeListIds = nodeMap[id(node)];
		if( nodeListIds ) {
			var index = can.inArray(nodeListId, nodeListIds);
		
			if ( index >= 0 ) {
				nodeListIds.splice( index ,  1 );
			}
			if(!nodeListIds.length){
				delete nodeMap[id(node)];
			}
		}
	},
	addNodeList = function(node, nodeList){
		var nodeId = id(node),
			nodeLists = nodeMap[nodeId];
		
		if(!nodeLists){
			nodeLists = nodeMap[nodeId] = [];
		}
		nodeLists.push(nodeList);
		return nodeLists;
	},
		splice = [].splice;


	var nodeLists = {
		id: id,
		// Replaces the contents of one node list with the nodes in another list.
		// 
		replace: function(oldNodeList, newNodes){
			// unregister all childNodes
			can.each(oldNodeList.childNodeLists, function(nodeList){
				nodeLists.unregister(nodeList)
			})
			oldNodeList.childNodeLists = [];
			
			// remove old node pointers to this list
			can.each(oldNodeList, function(node){
				delete nodeMap[id(node)];
			});
			
			var newNodes = can.makeArray(newNodes);
			
			// indicate the new nodes belong to this list
			can.each(newNodes, function(node){
				console.log("replace",id(node))
				nodeMap[id(node)] = oldNodeList;
			});
			
			
			var oldListLength = oldNodeList.length,
				firstNode = oldNodeList[0];
			
			splice.apply( oldNodeList, [0, oldListLength ].concat(newNodes) );
			
			// update all parent nodes so they are able to replace the correct elements
			var parentNodeList = oldNodeList;
			while(parentNodeList = parentNodeList.parentNodeList) {
				splice.apply(parentNodeList, [can.inArray(firstNode, parentNodeList), oldListLength ].concat(newNodes))
			}
			
			
		},
		/**
		 * Registers an element (typically a <span>) that is 
		 * going to be setup for live-binding.
		 * 
		 * A higher level live-binding will do
		 * 
		 * 
		 * 
		 * var topElements = [<span>]
		 * nodeLists.register(elements);
		 * 
		 * nodeLists.replace(elements, [<p>,<span>])
		 * 
		 * // that span will be regsitered
		 * 
		 * nodeLists.register([<span>])
		 * // and immediatley replaced
		 * nodeLists.replace(elements, [<p>,<div>])
		 * 
		 * 
		 * @param {Object} nodeList
		 */
		register: function(nodeList, unregistered, parent){
			
			// add an id to the nodeList
			nodeList.unregistered = unregistered, 
			
			nodeList.childNodeLists = [];
			
			if(!parent) {
				// find the parent by looking up where this node is
				if(nodeList.length > 1) {
					throw "does not work"
				}
				var nodeId = id(nodeList[0]);
				console.log(nodeId)
				parent =  nodeMap[nodeId];
				
			}
			nodeList.parentNodeList = parent;
			parent && parent.childNodeLists.push( nodeList );
			return nodeList;
		},
		// removes node in all parent nodes and unregisters all childNodes
		unregister: function(nodeList){
			if(!nodeList.isUnregistered) {
				nodeList.isUnregistered = true;
				// unregister all childNodeLists
				delete nodeList.parentNodeList;
				can.each(nodeList, function(node){
					var nodeId = id(node);
					delete nodeMap[nodeId]
				});
				// this can unbind which will call itself
				nodeList.unregistered && nodeList.unregistered();
				can.each( nodeList.childNodeLists, function(nodeList){
					nodeLists.unregister(nodeList)
				});
			}
		},
		nodeMap: nodeMap,
	}
	var ids = function(nodeList){
		return nodeList.map(function(n){
			return id(n)+":"+(n.innerHTML  || n.nodeValue||n.id)  
		})
	}
	return nodeLists;


})