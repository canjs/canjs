steal("can/view/parser","can/view/target", function(parser, target){
	
	
	
	return can.stash = function(template){
		var targetData = [];
		var stack = [];
		
		parser(template,{
			start: function(tagName, attrs, unary){
				var nodeData = {
					tag: tagName,
					children: []
				}
				if(attrs && attrs.length) {
					var nodeAttrs = nodeData.attrs = {};
					for(var i = 0 ; i < attrs.length; i++){
						nodeAttrs[attrs[i].name] = attrs[i].value
					}
				}
				if(stack.length) {
					stack[stack.length-1].children.push(nodeData)
				} else {
					targetData.push(nodeData);
				}
				if(!unary){
					stack.push(nodeData)
				}
			},
			end: function( tag ) {
				stack.pop();
			},
			chars: function( text ) {
				if(stack.length) {
					stack[stack.length-1].children.push(text)
				} else {
					targetData.push(text);
				}
			},
			comment: function( text ) {
				// create comment node
			}
		})
		
		var compiled = target(targetData);
		
		return function(){
			return compiled.hydrate();
		}
	};
	
	
	
})
