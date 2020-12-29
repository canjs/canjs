var tree = require('./tree'),
	typer = require("./typer"),
	_ = require("lodash");

	/**
	 * @typedef {STRING} documentjs.nameExpression NAME-EXPRESSION
	 * @parent documentjs.tags
	 * 
	 * Adds the `name` and other properties to [documentjs.process.valueData valueData] in
	 * using the [documentjs.tags.param @param] or 
	 * [documentjs.tags.param @option] tags. 
	 * 
	 * @signature `[name(args...)=default]`
	 * 
	 * Example:
	 * 
	 *     [success(item)=updater]
	 * 
	 * @param {String} name
	 * 
	 * Provides the name of the type.
	 * 
	 * @param {String} \[\]
	 * 
	 * Indicates that the option or param is optional.
	 * 
	 * @param {String} \(args\...\) 
	 * If `name` is a function,
	 * `()` provides the names of each argument.
	 * 
	 * 
	 * @param {String} '\...' An argument is variable. The argument can
	 * be given 0 or more times.
	 * 
	 * @param {String} \=default `=default` provides
	 * the default value for the type. For example:
	 * 
	 * @codestart javascript
	 * /**
	 *  * @param {Number} [age=0]
	 *  *|
	 * @codeend
	 * 
	 * @body
	 * 
	 * ## Examples
	 * 
	 * - `eventType` The param is named "eventType".
	 * - `[eventType]` The param is optional.
	 * - `[eventType="change"]` The param is optional and has a default value of "change".
	 * - `handler(foo,bar)` The param is named "handler" and takes a foo and bar argument.
	 */
	
	
	var eachBetweenCommas = function(arr,cb,betweener){
		var cur = [],
			i = 0,
			betweener = betweener || ",",
			index = 0;
		while(i < arr.length){
			
			if(arr[i].token == betweener){
				if(cur.length){
					cb(cur,index++);
					cur  = [];
				} 
			} else {
				cur.push(arr[i])
			}
			i++
		}
		if(cur.length){
			cb(cur, index++);
		} 
	};
	
	var getAll = function(children, obj){
		
	};
	
	var process = function(children, obj, state){
		state = state || {};
		if(!children || !children.length){
			return obj;
		} else {
		
			switch(children[0].token) {
				case "=": 
					obj.optional = true;
					if(children[1]){
						obj.defaultValue = children[1].token;
					}
					process(children.slice(2), obj,_.extend(state,{inDefaultValue: true}));
					break;
				
				case "?": 
					obj.nullable = true;
					process(children.slice(1), obj);
					break;
				case "!":
					obj.nonnull = true;
					process(children.slice(1), obj);
					break;
				case "function":
					var types = obj.types || (obj.types = []),
						type = {type: "function"};
					types.push(type);
					
					type.constructs = undefined;
					type.returns = {types: [{type: "undefined"}]};
					type.params = [];
					type.context = undefined;
					
					var next = children[1];
					if(next) {
						eachBetweenCommas(next.children, function(typeChildren){
							if(typeChildren[1] == ":"){
								if(typeChildren[0] == "new"){
									type.constructs = process( typeChildren.slice(2), {} );
								} else if(typeChildren[0] == "this"){
									type.context = process( typeChildren.slice(2), {} );
								}
							} else {
								type.params.push(
									process(typeChildren, {})
								);
							}
						});
					}
					// children[2] === ":"
					if( children[3] ) {
						type.returns = process( children.slice(3), {} )
					};
					break;
				case "...":
					obj.variable = true;
					process(children.slice(1), obj);
					break;
				case "[":
					obj.optional = true;
					process(children[0].children,obj)
					break;
				case "{": // Record object {foo: Bar, cat, dog}
				
					var types = obj.types || (obj.types = []),
						type = {type: "Object"};
					types.push(type);
					type.options = [],
					eachBetweenCommas(children[0].children, function(typeChildren){
						var option = {
							name: typeChildren[0]
						}
						if(typeChildren[2]){
							process(typeChildren.slice(2), option)
						}
						type.options.push(option)
					});
					break;
					
				case "(": // params
					
					eachBetweenCommas(children[0].children,function(typeChildren, index){
						if(!obj.types[0].params){
							console.log("WARNING! "+obj.types[0].name+" does not appear to be a function."+
							  " If it is a typedef, you can not specify the params to the typedef.")
							return;
						}
						
						
						// this should really be trying to find the function by looking in types
						if(!obj.types[0].params[index]) {
							// sometimes types of args is not specified
							obj.types[0].params[index] = {}
						}

						process(typeChildren, obj.types[0].params[index] );
					});
					break;
					
				default:
					if(state.inDefaultValue) {
						// once in the default state
						// add everything to the defaultValue
						obj.defaultValue += children[0].token;
						if(children[0].children) {
							process(children[0].children, obj,state);
							obj.defaultValue += tree.matches[children[0].token];
						}
					} else {
						obj.name = children[0].token;
					}
					
					process(children.slice(1), obj, state);
					
			}
		} 
		return obj
	};

	module.exports = {
		tokens: ["\\?", "\\!", "\\=","function", "\\.\\.\\.", ",", "\\:", "\\|", "="],
		process: process,
		name: function(str, typeData){
			return process(this.tree(str), typeData)
		},
		tree: function(str){
			return tree(str, "("+this.tokens.join("|")+")", "(\\s)" );
		}
	};
	
