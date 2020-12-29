"use strict";
var reflect = require( "can-reflect" );

// ## Helpers
// The following implement helper functions useful to `can-key-tree`'s main methods.

// ### isBuiltInPrototype
// Returns if `obj` is the prototype of a built-in JS type like `Map`.
// Built in types' `toString` returns `[object TYPENAME]`.
function isBuiltInPrototype ( obj ) {
	if ( obj === Object.prototype ) {
		return true;
	}
	var protoString = Object.prototype.toString.call( obj );
	var isNotObjObj = protoString !== '[object Object]';
	var isObjSomething = protoString.indexOf( '[object ' ) !== -1;
	return isNotObjObj && isObjSomething;
}

// ### getDeepSize
// Recursively returns the number of leaf values below `root` node.
function getDeepSize ( root, level ) {
	if ( level === 0 ) {
		return reflect.size( root );
	} else if ( reflect.size( root ) === 0 ) {
		return 0;
	} else {
		var count = 0;
		reflect.each( root, function ( value ) {
			count += getDeepSize( value, level - 1 );
		});
		return count;
	}
}

// ### getDeep
// Adds all leaf values under `node` to `items`.
// `depth` is how deep `node` is in the tree.
// `maxDepth` is the total depth of the tree structure.
function getDeep ( node, items, depth, maxDepth ) {
	if ( !node ) {
		return;
	}
	if ( maxDepth === depth ) {
		if ( reflect.isMoreListLikeThanMapLike( node ) ) {
			reflect.addValues( items, reflect.toArray( node ) );
		} else {
			throw new Error( "can-key-tree: Map-type leaf containers are not supported yet." );
		}
	} else {
		reflect.each( node, function ( value ) {
			getDeep( value, items, depth + 1, maxDepth );
		});
	}
}

// ### clearDeep
// Recursively removes value from all child nodes of `node`.
function clearDeep ( node, keys, maxDepth, deleteHandler ) {
	if ( maxDepth === keys.length ) {
		if ( reflect.isMoreListLikeThanMapLike( node ) ) {
			var valuesToRemove = reflect.toArray( node );
			if(deleteHandler) {
				valuesToRemove.forEach(function(value){
					deleteHandler.apply(null, keys.concat(value));
				});
			}
			reflect.removeValues( node, valuesToRemove );
		} else {
			throw new Error( "can-key-tree: Map-type leaf containers are not supported yet." );
		}
	} else {
		reflect.each( node, function ( value, key ) {
			clearDeep( value, keys.concat(key), maxDepth, deleteHandler );
			reflect.deleteKeyValue( node, key );
		});
	}
}

// ## KeyTree
// Creates an instance of the KeyTree.
var KeyTree = function ( treeStructure, callbacks ) {
	var FirstConstructor = treeStructure[0];
	if ( reflect.isConstructorLike( FirstConstructor ) ) {
		this.root = new FirstConstructor();
	} else {
		this.root = FirstConstructor;
	}
	this.callbacks = callbacks || {};
	this.treeStructure = treeStructure;
	// An extra bit of state held for performance
	this.empty = true;
};

// ## Methods
reflect.assign(KeyTree.prototype,{
    // ### Add
    add: function ( keys ) {
    	if ( keys.length > this.treeStructure.length ) {
    		throw new Error( "can-key-tree: Can not add path deeper than tree." );
    	}
        // The place we will add the final leaf value.
    	var place = this.root;

        // Record if the root was empty so we know to call `onFirst`.
    	var rootWasEmpty = this.empty === true;

        // For each key, try to get the corresponding childNode.
        for ( var i = 0; i < keys.length - 1; i++ ) {
    		var key = keys[i];
    		var childNode = reflect.getKeyValue( place, key );
    		if ( !childNode ) {
                // If there is no childNode, create it and add it to the parent node.
    			var Constructor = this.treeStructure[i + 1];
    			if ( isBuiltInPrototype( Constructor.prototype ) ) {
    				childNode = new Constructor();
    			} else {
    				childNode = new Constructor( key );
    			}
    			reflect.setKeyValue( place, key, childNode );
    		}
    		place = childNode;
    	}

        // Add the final leaf value in the tree.
    	if ( reflect.isMoreListLikeThanMapLike( place ) ) {
    		reflect.addValues( place, [keys[keys.length - 1]] );
    	} else {
    		throw new Error( "can-key-tree: Map types are not supported yet." );
    	}

        // Callback `onFirst` if appropriate.
    	if ( rootWasEmpty ) {
			this.empty = false;
			if(this.callbacks.onFirst) {
				this.callbacks.onFirst.call( this );
			}

    	}

    	return this;
    },
    // ### getNode
    getNode: function ( keys ) {
        var node = this.root;
        // For each key, try to read the child node.
        // If a child is not found, return `undefined`.
        for ( var i = 0; i < keys.length; i++ ) {
            var key = keys[i];
            node = reflect.getKeyValue( node, key );
            if ( !node ) {
                return;
            }
        }
        return node;
    },
    // ### get
    get: function ( keys ) {
        // Get the node specified by keys.
    	var node = this.getNode( keys );

        // If it's a leaf, return it.
    	if ( this.treeStructure.length === keys.length ) {
    		return node;
    	} else {
    		// Otherwise, create a container for leaf values and
            // recursively walk the node's children.
    		var Type = this.treeStructure[this.treeStructure.length - 1];
    		var items = new Type();
    		getDeep( node, items, keys.length, this.treeStructure.length - 1 );
    		return items;
    	}
    },
    // ### delete
    delete: function ( keys, deleteHandler ) {

        // `parentNode` will eventually be the parent nodde of the
        // node specified by keys.
        var parentNode = this.root,
            // The nodes traversed to the node specified by `keys`.
            path = [this.root],
            lastKey = keys[keys.length - 1];

        // Set parentNode to the node specified by keys
        // and record the nodes in `path`.
        for ( var i = 0; i < keys.length - 1; i++ ) {
    		var key = keys[i];
    		var childNode = reflect.getKeyValue( parentNode, key );
    		if ( childNode === undefined ) {
    			return false;
    		} else {
    			path.push( childNode );
    		}
    		parentNode = childNode;
    	}


        // Depending on which keys were specified and the content of the
        // key, do various cleanups ...
        if ( !keys.length ) {
            // If there are no keys, recursively clear the entire tree.
    		clearDeep( parentNode, [], this.treeStructure.length - 1, deleteHandler );
    	}
        else if ( keys.length === this.treeStructure.length ) {
            // If removing a leaf, remove that value.
    		if ( reflect.isMoreListLikeThanMapLike( parentNode ) ) {
				if(deleteHandler) {
					deleteHandler.apply(null, keys.concat(lastKey));
				}
    			reflect.removeValues( parentNode, [lastKey] );
    		} else {
    			throw new Error( "can-key-tree: Map types are not supported yet." );
    		}
    	}
        else {
            // If removing a node 'within' the tree, recursively clear
            // that node and then delete the key from parent to node.
            var nodeToRemove = reflect.getKeyValue( parentNode, lastKey );
    		if ( nodeToRemove !== undefined ) {
    			clearDeep( nodeToRemove, keys, this.treeStructure.length - 1, deleteHandler );
    			reflect.deleteKeyValue( parentNode, lastKey );
    		} else {
    			return false;
    		}
    	}

        // After deleting the node, check if its parent is empty and
        // recursively prune parent nodes that are now empty.
    	for ( i = path.length - 2; i >= 0; i-- ) {
    		if ( reflect.size( parentNode ) === 0 ) {
    			parentNode = path[i];
    			reflect.deleteKeyValue( parentNode, keys[i] );
    		} else {
    			break;
    		}
    	}
        // Call `onEmpty` if the tree is now empty.
    	if (  reflect.size( this.root ) === 0 ) {
			this.empty = true;
			if(this.callbacks.onEmpty) {
				this.callbacks.onEmpty.call( this );
			}
    	}
    	return true;
    },
    // ### size
    // Recursively count the number of leaf values.
    size: function () {
    	return getDeepSize( this.root, this.treeStructure.length - 1 );
    },
	isEmpty: function(){
		return this.empty;
	}
});

module.exports = KeyTree;
