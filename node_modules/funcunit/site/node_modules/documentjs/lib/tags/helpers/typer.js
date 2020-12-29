var tree = require("./tree");
	

	var eachBetweenCommas = function(arr,cb,betweener){
		var cur = [],
			i = 0,
			betweener = betweener || ",";
		while(i < arr.length){
			
			if(arr[i].token == betweener){
				if(cur.length){
					cb(cur);
					cur  = [];
				} 
			} else {
				cur.push(arr[i])
			}
			i++
		}
		if(cur.length){
			cb(cur);
		} 
	};

	
	var process = function(children, obj){
		
		if(!children || !children.length){
			return obj;
		} else {

			switch(children[0].token){
				case "|":
					process(children.slice(1), obj);
					break;
				case "=": 
					obj.optional = true;
					// get default value
					if(children[1]){
						obj.defaultValue = process([children[1]],{}).types[0];
					}
					process(children.slice(2), obj);
					break;
				
				case "?": 
					obj.nullable = true;
					process(children.slice(1), obj);
					break;
				case "!":
					obj.nonnull = true;
					process(children.slice(1), obj);
					break;
				case "Function":
				case "function":
					var types = obj.types || (obj.types = []),
						type = {type: "function"};
					types.push(type);
					
					type.constructs = undefined;
					type.returns = {types: [{type: "undefined"}]};
					type.params = [];
					type.context = undefined;
					
					var next = children[1];
					if(next && next.token == "(") {
						eachBetweenCommas(next.children, function(typeChildren){
							if(typeChildren[1] && typeChildren[1].token == ":"){
								if(typeChildren[0].token == "new"){
									type.constructs = process( typeChildren.slice(2), {} );
								} else if(typeChildren[0].token == "this"){
									type.context = process( typeChildren.slice(2), {} );
								}
							} else {
								type.params.push(
									process(typeChildren, {})
								)
							}
						});
						if( children[3] ) {
							type.returns = process( children.slice(3), {} )
						};
					} else {
						process( children.slice(1), obj )
					}
					// children[2] === ":"
					
					break;
				case "...":
					obj.variable = true;
					process(children.slice(1), obj);
					break;
				case "{": // Record object {foo: Bar, cat, dog}
				
					var types = obj.types || (obj.types = []),
						type = {type: "Object"};
					types.push(type);
					type.options = [],
					eachBetweenCommas(children[0].children, function(typeChildren){
						var option = {
							name: typeChildren[0].token
						};
						if(typeChildren[2]){
							process(typeChildren.slice(2), option)
						}
						type.options.push(option)
					});
					break;
					
				case "(": // Union (foo|bar)

					eachBetweenCommas(children[0].children,function(typeChildren){
						process(typeChildren, obj );
					},"|");
					break;
				default: // a type name like {Animal}
					var types = obj.types || (obj.types = []),
						type = {type: 
						// correct for Foo.<>
						children[0].token.replace(/\.$/,"")
					};
					
					if(type.type == "Function"){
						type.constructs = undefined;
						type.returns = {types: [{type: "undefined"}]};
						type.params = [];
						type.context = undefined;
					}
					
					
					types.push(type);
					
					var next = children[1];
					if(next) {
						switch(next.token){
							case "<":
								type.template = [];
								eachBetweenCommas(next.children, function(typeChildren){
									type.template.push(
										process(typeChildren, {})
									);
								});
								break;
							default: 
								// do anything at the end ...
								process(children.slice(1), obj);
								break;
						}
					} else {
						// if a normally defined type
						if(type.type == "Object" || type.type == "Array"){
							type.options = [];
						}
					}
			}
		} 
		return obj
	};

module.exports = {
	tokens: ["\\?", "\\!", "function", "\\.\\.\\.", ",", "\\:", "\\|", "="],
	process: process,
	type: function(str){
		return process(this.tree(str), {});
	},
	tree: function(str){
		return tree(str, "("+this.tokens.join("|")+")", "(\\s)" );
	}
};
	


