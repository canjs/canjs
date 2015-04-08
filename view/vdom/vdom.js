steal("can/util", function(){
	
	var REMOVE = function(el){
		var prev = el.previousSibling,
			next = el.nextSibling,
			parent = el.parentNode;
		if(prev) {
			prev.nextSibling = next;
		} else {
			parent.firstChild = next;
		}
		if(next) {
			next.nextSibling = next;
		} else {
			parent.lastChild = prev;
		}
	};
	var SAFE_REMOVE = function(el){
		if(el.parentNode) {
			REMOVE(el);
		}
	};
	
	function CLONE(objectToBeCloned, unique) {
		var teardown;
		if(!unique) {
			teardown = true;
			unique = [];
		}
		if(objectToBeCloned.__can_cloned__) {
			return objectToBeCloned.__can_cloned__;
		}
		
		// Basis.
		if (!(objectToBeCloned instanceof Object)) {
			return objectToBeCloned;
		}
		
		var objectClone;

		// Filter out special objects.
		var Constructor = objectToBeCloned.constructor;
		if(Constructor !== Object) {
			objectClone = new Constructor();
		}
		objectToBeCloned.__can_cloned__ = objectClone;
		
		unique.push(objectToBeCloned);
		
		// Clone each property.
		for (var prop in objectToBeCloned) {
			if(objectToBeCloned.hasOwnProperty(prop) && prop !== "__can_cloned__") {
				objectClone[prop] = CLONE(objectToBeCloned[prop], unique);
			}
		}
		if(teardown) {
			for(var i = 0 ; i < unique.length; i++){
				delete unique[i].__can_cloned__;
			}
		}
		
		return objectClone;
	}
	
	var VNode = function(tag){
		this.nodeName = tag;
		this._attributes = {};
	};
	can.simpleExtend( VNode.prototype, {
		nextSibling: null,
		previousSibling: null,
		firstChild: null,
		lastChild: null,
		parentNode: null,
		cloneNode: function(){
			return CLONE(this);
		},
		appendChild: function(element){
			// remove from it's previous home
			if(element.nodeType === 11) {
				if(element.firstChild) {
					// set all the parent nodes
					var cur = element.firstChild;
					while(cur) {
						cur.parentNode = this;
						cur = cur.nextSibling;
					}
					if(this.lastChild) {
						this.lastChild.nextSibling = element.firstChild;
					} else {
						this.firstChild =  element.firstChild;
					}
					this.lastChild = element.lastChild;
					
					// remove first and last on frag
					element.firstChild = element.lastChild = null;
					
				}
			} else {
				SAFE_REMOVE(element);
				element.parentNode = this;
				
				var last = this.lastChild;
				if(last) {
					last.nextSibling = element;
					element.previousSibling = last;
				} else {
					this.firstChild = element;
				}
				this.lastChild = element;
			}
		},
		removeChild: function(child){
			SAFE_REMOVE(child);
		},
		insertBefore: function(newElement, referenceElement){
			if(!referenceElement) {
				this.appendChild(newElement);
			} else {
				if(newElement.nodeType === 11) {
					if(newElement.firstChild) {
						// set all the parent nodes
						var cur = newElement.firstChild;
						while(cur) {
							cur.parentNode = this;
							cur = cur.nextSibling;
						}
						var prev = referenceElement.previousSibling;
						newElement.firstChild.previousSibling = prev;
						newElement.lastChild.nextSibling = referenceElement;
						referenceElement.previousSibling = newElement.lastChild;
						if(!prev) {
							this.firstChild = newElement.firstChild;
						}
						// remove first and last on frag
						newElement.firstChild = newElement.lastChild = null;
						
					}
				} else {
				
					SAFE_REMOVE(newElement);
					var prev = referenceElement.previousSibling;
					newElement.nextSibling = referenceElement;
					referenceElement.previousSibling = newElement;
					newElement.parentNode = this;
					if(!prev) {
						// inserting first
						this.firstChild = newElement;
					} 
				}
			}
		},
		nodeType: 1,
		setAttribute: function(name, value){
			this._attributes[name] = value;
		},
		getAttribute: function(name){
			return name in this._attributes ? ""+this._attributes[name] : null
		},
		removeAttribute: function(name){
			delete this._attributes[name];
		},
		toDOM: function(){
			var el = document.createElement(this.tagName);
			var cur = element.firstChild;
			while(cur) {
				el.appendChild( cur.toDOM() );
				cur = cur.nextSibling;
			}
			return el;
		},
		childNodes: function(index){
			var cur = this.firstChild;
			for(var i = 0; cur && i < index; i++) {
				cur = cur.nextSibling;
			}
			return cur;
		}
	});
	
	VText = function(text){
		this.nodeValue = text;
	};
	VText.prototype = new VNode();
	can.simpleExtend( VText.prototype, {
		nodeType: 3,
		constructor: VText,
		toDOM: function(){
			return document.createDocumentFragment(this.nodeValue);
		}
	});
	delete VText.prototype.nodeName;
	delete VText.prototype._attributes;
	delete VText.prototype.appendChild;
	delete VText.prototype.insertBefore;
	delete VText.prototype.firstChild;
	delete VText.prototype.lastChild;
	
	
	
	VComment = function(text){
		this.nodeValue = text;
	};
	
	
	VFrag = function(){};
	VFrag.prototype = new VNode();
	VFrag.prototype.nodeType = 11;
	delete VFrag.prototype.nodeName;
	delete VFrag.prototype._attributes;
	VFrag.prototype.constructor = VFrag;
	
	return {
		createElement: function(tag){
			return new VNode(tag);
		},
		createTextNode: function(text){
			return new VText(text);
		},
		createDocumentFragment: function(){
			return new VFrag();
		}
	};
});
