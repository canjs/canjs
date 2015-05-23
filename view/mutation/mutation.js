/**
 * Mutates the DOM or a virtualDOM
 */
steal("can/util", 'can/view/parser',"can/view/elements.js", function(can, parser, elements){
	
	var getAttributeParts = function (newVal) {
		var attrs = {},
			attr;
		parser.parseAttrs(newVal,{
			attrStart: function(name){
				attrs[name] = "";
				attr = name;
			},
			attrValue: function(value){
				attrs[attr] += value;
			},
			attrEnd: function(){}
		});
		return attrs;
	};
	
	
	var mutation = {
		setAttribute: function(node, attr, value){
			if(node.nodeType) {
				can.attr.set(node, attr, value);
			} else {
				var child = node.parent.children[node.index];
				if(!child.attrs) {
					child.attrs = {};
				}
				child.attrs[attr] = value;
			}
		},
		setAttributes: function(node, attributes){
			var attrs = getAttributeParts(attributes);
			for(var name in attrs) {
				mutation.setAttribute(node, name, attrs[name]);
			}
			if(!node.nodeType) {
				delete node.parent.children[node.index].attributes;
			}
		},
		replace: function(node, value){
			if(this.nodeName) {
				elements.replace([node], can.frag(value));
			} else {
				var children = node.parent.children;
				children.splice.apply(children, [node.index, 1].concat( value ) );
			}
		},
		text: function(node, value){
			if(node.nodeName) {
				node.nodeValue = value;
			} else {
				// should we be escaping this text?  all text nodes will be escaped
				// but someone could put in an object
				var children = node.parent.children;
				children.splice.apply(children, [node.index, 1].concat( value ) );
			}
		},
		remove: function(node) {
			
		}
	};
	return mutation;
});

