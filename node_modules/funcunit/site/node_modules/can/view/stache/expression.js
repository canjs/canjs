steal("can/util",
	"./utils",
	"./mustache_helpers",
	"can/view/scope",
	function(can, utils, mustacheHelpers, Scope){
	
	
	// ## Helpers
	
	// Helper for getting a bound compute in the scope.
	var getKeyComputeData = function (key, scope, readOptions) {

			var data = scope.computeData(key, readOptions);
	
			can.compute.temporarilyBind(data.compute);
	
			return data;
		},
		// Looks up a value in the scope and returns a compute if the value is
		// observable and the value if not.
		lookupValue = function(key, scope, helperOptions, readOptions){
			var computeData = getKeyComputeData(key, scope, readOptions);
			// If there are no dependencies, just return the value.
			if (!computeData.compute.computeInstance.hasDependencies) {
				return {value: computeData.initialValue, computeData: computeData};
			} else {
				return {value: computeData.compute, computeData: computeData};
			}
		},
		// Looks up a value in the scope, and if it is `undefined`, looks up
		// the value as a helper.
		lookupValueOrHelper = function(key, scope, helperOptions, readOptions){
			var res = lookupValue(key, scope, helperOptions, readOptions);
	
			// If it doesn't look like a helper and there is no value, check helpers
			// anyway. This is for when foo is a helper in `{{foo}}`.
			if( res.computeData.initialValue === undefined ) {
				if(key.charAt(0) === "@" && key !== "@index") {
					key = key.substr(1);
				}
				var helper = mustacheHelpers.getHelper(key, helperOptions);
				res.helper = helper && helper.fn;
			}
			return res;
		},
		// If not a Literal or an Arg, convert to an arg for caching.
		convertToArgExpression = function(expr){
			if(!(expr instanceof Arg) && !(expr instanceof Literal) && !(expr instanceof Hashes)) {
				return new Arg(expr);
			} else {
				return expr;
			}
			
		};
	
	// ## Expression Types
	//
	// These expression types return a value. They are assembled by `expression.parse`.
	
	// ### Literal
	// For inline static values like `{{"Hello World"}}`
	var Literal = function(value){
		this._value = value;
	};
	Literal.prototype.value = function(){
		return this._value;
	};
	
	// ### Lookup
	// `new Lookup(String, [Expression])`
	// Finds a value in the scope or a helper.
	var Lookup = function(key, root) {
		this.key = key;
		this.rootExpr = root;
	};
	Lookup.prototype.value = function(scope, helperOptions){
		var result = lookupValueOrHelper(this.key, scope, helperOptions);
		// TODO: remove this.  This is hacky.
		this.isHelper = result.helper && !result.helper.callAsMethod;
		return result.helper || result.value;
	};
	
	// ### ScopeLookup
	// Looks up a value in the scope, returns a compute for the value it finds.
	// If passed an expression, that is used to lookup data
	var ScopeLookup = function(key, root) {
		Lookup.apply(this, arguments);
	};
	ScopeLookup.prototype.value = function(scope, helperOptions){
		return lookupValue(this.key, scope, helperOptions).value;
	};
	
	// ### Arg
	// `new Arg(Expression [,modifierOptions] )`
	// Used to identify an expression that should return a value.
	var Arg = function(expression, modifiers){
		this.expr = expression;
		this.modifiers = modifiers || {};
		this.isCompute = false;
	};
	Arg.prototype.value = function(){
		return this.expr.value.apply(this.expr, arguments);
	};
	
	// ### Hashes
	// A placeholder. This isn't actually used.
	var Hashes = function(hashExpressions){
		this.hashExprs = hashExpressions;
	};
	Hashes.prototype.value = function(){
		var hash = {};
		for(var prop in this.hashExprs) {
			var val = this.hashExprs[prop],
				value = val.value.apply(val, arguments);
				
			hash[prop] = {
				call: value && value.isComputed && (!val.modifiers || !val.modifiers.compute),
				value: value
			};
		}
		return can.compute(function(){
			var finalHash = {};
			for(var prop in hash) {
				finalHash[prop] = hash[prop].call ? hash[prop].value() : hash[prop].value;
			}
			return finalHash;
		});
	};

	
	// ### Call
	// `new Call( new Lookup("method"), [new ScopeExpr("name")], {})`
	// A call expression like `method(arg1, arg2)` that, by default,
	// calls `method` with non compute values.
	var Call = function(methodExpression, argExpressions, hashes){
		if(hashes && !can.isEmptyObject(hashes)) {
			argExpressions.push(new Hashes(hashes));
		}
		this.methodExpr = methodExpression;
		this.argExprs = can.map(argExpressions, convertToArgExpression);
	};
	Call.prototype.args = function(scope, helperOptions){
		var args = [];
		for(var i = 0, len = this.argExprs.length; i < len; i++) {
			var arg = this.argExprs[i];
			var value = arg.value.apply(arg, arguments);
			args.push({
				call: value && value.isComputed  && (!arg.modifiers || !arg.modifiers.compute),
				value: value
			});
		}
		return function(){
			var finalArgs = [];
			for(var i = 0, len = args.length; i < len; i++) {
				finalArgs[i] = args[i].call ? args[i].value() : args[i].value;
			}
			return finalArgs;
		};
	};
	
	
	Call.prototype.value = function(scope, helperScope, helperOptions){
		
		var method = this.methodExpr.value(scope, helperScope);
		// TODO: remove this hack
		this.isHelper = this.methodExpr.isHelper;
		
		var getArgs = this.args(scope, helperScope);
		
		return can.compute(function(newVal){
			var func = method;
			if(func && func.isComputed) {
				func = func();
			}
			if(typeof func === "function") {
				var args = getArgs();
				
				// if fn/inverse is needed
				if(helperOptions) {
					args.push(helperOptions);
				}
				if(arguments.length) {
					args.unshift(new expression.SetIdentifier(newVal));
				}
				
				return func.apply(null, args);
			}
			
		});
		
	};
	
	
	
	// ### HelperLookup
	// An expression that looks up a value in the helper or scope.
	// Any functions found prior to the last one are called with
	// the context and scope.
	var HelperLookup = function(){
		Lookup.apply(this, arguments);
	};
	HelperLookup.prototype.value = function(scope, helperOptions){
		var result = lookupValueOrHelper(this.key, scope, helperOptions, {isArgument: true, args: [scope.attr('.'), scope]});
		return result.helper || result.value;
	};
	
	// ### HelperScopeLookup
	// An expression that looks up a value in the scope.
	// Any functions found prior to the last one are called with
	// the context and scope.
	var HelperScopeLookup = function(){
		Lookup.apply(this, arguments);
	};
	HelperScopeLookup.prototype.value = function(scope, helperOptions){
		return lookupValue(this.key, scope, helperOptions, {callMethodsOnObservables: true, isArgument: true, args: [scope.attr('.'), scope]}).value;
	};
	
	var Helper = function(methodExpression, argExpressions, hashExpressions){
		this.methodExpr = methodExpression;
		this.argExprs = argExpressions;
		this.hashExprs = hashExpressions;
		this.mode = null;
	};
	Helper.prototype.args = function(scope, helperOptions){
		var args = [];
		for(var i = 0, len = this.argExprs.length; i < len; i++) {
			var arg = this.argExprs[i];
			args.push( arg.value.apply(arg, arguments) );
		}
		return args;
	};
	Helper.prototype.hash = function(scope, helperOptions){
		var hash = {};
		for(var prop in this.hashExprs) {
			var val = this.hashExprs[prop];
			hash[prop] = val.value.apply(val, arguments);
		}
		return hash;
	};
	// looks up the name key in the scope
	// returns a `helper` property if there is a helper for the key.
	// returns a `value` property if the value is looked up.
	Helper.prototype.helperAndValue = function(scope, helperOptions){
		
		//{{foo bar}}
		var looksLikeAHelper = this.argExprs.length || !can.isEmptyObject(this.hashExprs),
			helper,
			value,
			// If a literal, this means it should be treated as a key. But helpers work this way for some reason.
			// TODO: fix parsing so numbers will also be assumed to be keys.
			methodKey = this.methodExpr instanceof Literal ?
				""+this.methodExpr._value : this.methodExpr.key,
			initialValue,
			args;
			
		// If the expression looks like a helper, try to get a helper right away.
		if (looksLikeAHelper) {
			// Try to find a registered helper.
			helper = mustacheHelpers.getHelper(methodKey, helperOptions);

			// If a function is on top of the context, call that as a helper.
			var context = scope.attr(".");
			if(!helper && typeof context[methodKey] === "function") {
				//!steal-remove-start
				can.dev.warn('can/view/stache/mustache_core.js: In 3.0, method "' + methodKey + '" will not be called as a helper, but as a method.');
				//!steal-remove-end
				helper = {fn: context[methodKey]};
			}

		}
		if(!helper) {
			args = this.args(scope, helperOptions);
			// Get info about the compute that represents this lookup.
			// This way, we can get the initial value without "reading" the compute.
			var computeData = getKeyComputeData(methodKey, scope, {
				isArgument: false,
				args: args && args.length ? args : [scope.attr('.'), scope]
			}),
				compute = computeData.compute;

			initialValue = computeData.initialValue;

			// Set name to be the compute if the compute reads observables,
			// or the value of the value of the compute if no observables are found.
			if(computeData.compute.computeInstance.hasDependencies) {
				value = compute;
			} else {
				value = initialValue;
			}

			// If it doesn't look like a helper and there is no value, check helpers
			// anyway. This is for when foo is a helper in `{{foo}}`.
			if( !looksLikeAHelper && initialValue === undefined ) {
				helper = mustacheHelpers.getHelper(methodKey, helperOptions);
			}

		}
		
		//!steal-remove-start
		if ( !helper && initialValue === undefined) {
			if(looksLikeAHelper) {
				can.dev.warn('can/view/stache/mustache_core.js: Unable to find helper "' + methodKey + '".');
			} else {
				can.dev.warn('can/view/stache/mustache_core.js: Unable to find key or helper "' + methodKey + '".');
			}
		}
		//!steal-remove-end
		
		return {
			value: value,
			args: args,
			helper: helper && helper.fn
		};
	};
	Helper.prototype.evaluator = function(helper, scope, helperOptions, /*REMOVE*/readOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly){

		var helperOptionArg = {
			fn: function () {},
			inverse: function () {},
			stringOnly: stringOnly
		},
			context = scope.attr("."),
			args = this.args(scope, helperOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly),
			hash = this.hash(scope, helperOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);

		// Add additional data to be used by helper functions
		utils.convertToScopes(helperOptionArg, scope,helperOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);

		can.simpleExtend(helperOptionArg, {
			context: context,
			scope: scope,
			contexts: scope,
			hash: hash,
			nodeList: nodeList,
			exprData: this,
			helperOptions: helperOptions,
			helpers: helperOptions
		});

		args.push(helperOptionArg);
		// Call the helper.
		return function () {
			return helper.apply(context, args);
		};
	};
	
	Helper.prototype.value = function(scope, helperOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly){
		
		var helperAndValue = this.helperAndValue(scope, helperOptions);
		
		var helper = helperAndValue.helper;
		// a method could have been called, resulting in a value
		if(!helper) {
			return helperAndValue.value;
		}
		
		var fn = this.evaluator(helper, scope, helperOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);
		
		var compute = can.compute(fn);
		
		can.compute.temporarilyBind(compute);
		
		if (!compute.computeInstance.hasDependencies) {
			return compute();
		} else {
			return compute;
		}
	};
	
	
	// NAME - \w
	// KEY - foo, foo.bar, foo@bar, %foo (special), &foo (references), ../foo, ./foo
	// ARG - ~KEY, KEY, CALLEXPRESSION, PRIMITIVE
	// CALLEXPRESSION = KEY(ARG,ARG, NAME=ARG)
	// HELPEREXPRESSION = KEY ARG ARG NAME=ARG
	// DOT .NAME
	// AT @NAME
	// 
	var keyRegExp = /[\w\.\\\-_@\/\&%]+/,
		tokensRegExp = /('.*?'|".*?"|=|[\w\.\\\-_@\/*%\$:]+|[\(\)]|,|\~)/g,
		literalRegExp = /^('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false|null|undefined)$/;
	
	var isTokenKey = function(token){
		return keyRegExp.test(token);
	};
	
	var testDot = /^[\.@]\w/;
	var isAddingToExpression = function(token) {
		
		return isTokenKey(token) && testDot.test(token);
	};
	
	var ensureChildren = function(type) {
		if(!type.children) {
			type.children = [];
		}
		return type;
	};
	
	var Stack = function(){
		
		this.root = {children: [], type: "Root"};
		this.current = this.root;
		this.stack = [this.root];
	};
	can.simpleExtend(Stack.prototype,{
		top: function(){
			return can.last(this.stack);
		},
		isRootTop: function(){
			return this.top() === this.root;
		},
		popTo: function(types){
			this.popUntil(types);
			if(!this.isRootTop()) {
				this.stack.pop();
			}
		},
		firstParent: function(types){
			var curIndex = this.stack.length- 2;
			while( curIndex > 0 && can.inArray(  this.stack[curIndex].type, types) === -1 ) {
				curIndex--;
			}
			return this.stack[curIndex];
		},
		popUntil: function(types){
			while( can.inArray(  this.top().type, types) === -1 && !this.isRootTop() ) {
				this.stack.pop();
			}
			return this.top();
		},
		addTo: function(types, type){
			var cur = this.popUntil(types);
			ensureChildren(cur).children.push(type);
		},
		addToAndPush: function(types, type){
			this.addTo(types, type);
			this.stack.push(type);
		},
		topLastChild: function(){
			return can.last(this.top().children);
		},
		replaceTopLastChild: function(type){
			var children = ensureChildren(this.top()).children;
			children.pop();
			children.push(type);
			return type;
		},
		replaceTopLastChildAndPush: function(type) {
			this.replaceTopLastChild(type);
			this.stack.push(type);
		},
		replaceTopAndPush: function(type){
			var children;
			if(this.top() === this.root) {
				children = ensureChildren(this.top()).children;
			} else {
				this.stack.pop();
				// get parent and clean
				children = ensureChildren(this.top()).children;
			}
			
			children.pop();
			children.push(type);
			this.stack.push(type);
			return type;
		}
	});
	
	// converts 
	// - "../foo" -> "../@foo", 
	// - "foo" -> "@foo", 
	// - ".foo" -> "@foo", 
	// - "./foo" -> "./@foo"
	// - "foo.bar" -> "foo@bar"
	var convertKeyToLookup = function(key){
		var lastPath = key.lastIndexOf("./");
		var lastDot = key.lastIndexOf(".");
		if(lastDot > lastPath) {
			return key.substr(0, lastDot)+"@"+key.substr(lastDot+1);
		}
		var firstNonPathCharIndex = lastPath === -1 ? 0 : lastPath+2;
		var firstNonPathChar = key.charAt(firstNonPathCharIndex);
		if(firstNonPathChar === "." || firstNonPathChar === "@" ) {
			return key.substr(0, firstNonPathCharIndex)+"@"+key.substr(firstNonPathCharIndex+1);
		} else {
			return key.substr(0, firstNonPathCharIndex)+"@"+key.substr(firstNonPathCharIndex);
		}
	};
	var convertToAtLookup = function(ast){
		if(ast.type === "Lookup") {
			ast.key = convertKeyToLookup(ast.key);
		}
		return ast;
	};
	
	var convertToHelperIfTopIsLookup = function(stack){
		var top = stack.top();
		// if two scopes, that means a helper
		if(top && top.type === "Lookup") {
			
			var base = stack.stack[stack.stack.length - 2];
			// That lookup shouldn't be part of a Helper already or
			if(base.type !== "Helper" && base) {
				stack.replaceTopAndPush({
					type: "Helper",
					method: top
				});
			}
		}
	};
	
	var expression = {
		convertKeyToLookup: convertKeyToLookup,
		Literal: Literal,
		Lookup: Lookup,
		ScopeLookup: ScopeLookup,
		
		Arg: Arg,
		Hashes: Hashes,
		Call: Call,
		Helper: Helper,
		HelperLookup: HelperLookup,
		HelperScopeLookup: HelperScopeLookup,
		
		
		SetIdentifier: function(value){ this.value = value; },
		tokenize: function(expression){
			var tokens = [];
			(can.trim(expression) + ' ').replace(tokensRegExp, function (whole, arg) {
				tokens.push(arg);
			});
			return tokens;
		},
		lookupRules: {
			"default": function(ast, methodType, isArg){
				var name = (methodType === "Helper" && !ast.root ? "Helper" : "")+(isArg ? "Scope" : "")+"Lookup";
				return expression[name];
			},
			"method": function(ast, methodType, isArg){
				return ScopeLookup;
			}
		},
		methodRules: {
			"default": function(ast){
				
				return ast.type === "Call" ? Call : Helper;
			},
			"call": function(ast){
				return Call;
			}
		},
		// ## expression.parse
		// 
		// - {String} expressionString - A stache expression like "abc foo()"
		// - {Object} options
		//   - baseMethodType - Treat this like a Helper or Call.  Default to "Helper"
		//   - lookupRule - "default" or "method"
		//   - methodRule - "default" or "call"
		parse: function(expressionString, options){
			options =  options || {};
			var ast = this.ast(expressionString);
			
			if(!options.lookupRule) {
				options.lookupRule = "default";
			}
			if(typeof options.lookupRule === "string") {
				options.lookupRule = expression.lookupRules[options.lookupRule];
			}
			if(!options.methodRule) {
				options.methodRule = "default";
			}
			if(typeof options.methodRule === "string") {
				options.methodRule = expression.methodRules[options.methodRule];
			}
			
			var expr = this.hydrateAst(ast, options, options.baseMethodType || "Helper");
			
			return expr;
		},
		hydrateAst: function(ast, options, methodType, isArg){
			var hashes,
				self = this;
			if(ast.type === "Lookup") {
				return new (options.lookupRule(ast, methodType, isArg))(ast.key, ast.root && this.hydrateAst(ast.root, options, methodType) );
			}
			else if(ast.type === "Literal") {
				return new Literal(ast.value);
			}
			else if(ast.type === "Arg") {
				return new Arg(this.hydrateAst(ast.children[0], options, methodType, isArg),{compute: true});
			}
			else if(ast.type === "Hashes") {
				hashes = {};
				can.each(ast.children, function(child){
					hashes[child.prop] = self.hydrateAst( child.children[0], options, ast.type, true );
				});
				return new Hashes(hashes);
			}
			else if(ast.type === "Hash") {
				throw new Error("");
			}
			else if(ast.type === "Call" || ast.type === "Helper") {
				//get all arguments and hashes
				
				var args = [];
				hashes = {};
				
				can.each(ast.children, function(child){
					if(child.type === "Hash") {
						hashes[child.prop] = self.hydrateAst( child.children[0], options, ast.type, true );
					} else {
						args.push( self.hydrateAst(child, options, ast.type, true) );
					}
				});
				
				return new (options.methodRule(ast))(this.hydrateAst(ast.method, options, ast.type), args, hashes);
			}
		},
		ast: function(expression){
			var tokens = this.tokenize(expression);
			return this.parseAst(tokens, {
				index: 0
			});
		},
		parseAst: function(tokens, cursor) {
			var stack = new Stack(),
				top;
			
			while(cursor.index < tokens.length) {
				var token = tokens[cursor.index],
					nextToken = tokens[cursor.index+1];
				
				cursor.index++;
				
				// Literal
				if(literalRegExp.test( token )) {
					convertToHelperIfTopIsLookup(stack);
					stack.addTo(["Helper", "Call", "Hash"], {type: "Literal", value: utils.jsonParse( token )});
				}
				// Hash 
				else if(nextToken === "=") {
					//convertToHelperIfTopIsLookup(stack);
					top = stack.top();
					
					// If top is a Lookup, we might need to convert to a helper.
					if(top && top.type === "Lookup") {
						
						// Check if current Lookup is part of a Call, Helper, or Hash
						// If it happens to be first within a Call or Root, that means
						// this is helper syntax.
						var firstParent = stack.firstParent(["Call","Helper","Hash"]);
						if(firstParent.type === "Call" || firstParent.type === "Root") {
							
							stack.popUntil(["Call"]);
							top = stack.top();
							stack.replaceTopAndPush({
								type: "Helper",
								method: top.type === "Root" ? can.last(top.children) : top
							});
							
						}
					}
					// if top is a call expression
					// then we are added this as a hashes
					top = stack.popUntil(["Helper", "Call","Hashes"]);
					// Call expressions group hash in hashes
					if(top.type === "Call") {
						stack.addToAndPush(["Call"], {type: "Hashes"});
					}

					stack.addToAndPush(["Helper", "Hashes"], {type: "Hash", prop: token});
					cursor.index++;
					
				}
				// Lookup
				else if(keyRegExp.test(token)) {
					var last = stack.topLastChild();

					// if we had `foo().bar`, we need to change to a Lookup that looks up from last.
					if(last && last.type === "Call" && isAddingToExpression(token)) {
						stack.replaceTopLastChildAndPush({
							type: "Lookup",
							root: last,
							key: token
						});
					} else {
						// if two scopes, that means a helper
						convertToHelperIfTopIsLookup(stack);
						
						stack.addToAndPush(["Helper", "Call","Hash","Arg"], {type: "Lookup", key: token});
					}
					
				}
				// Arg
				else if(token === "~") {
					convertToHelperIfTopIsLookup(stack);
					stack.addToAndPush(["Helper", "Call","Hash"], {type: "Arg", key: token});
				}
				// Call
				else if(token === "(") {
					top = stack.top();
					if(top.type === "Lookup") {
						stack.replaceTopAndPush({
							type: "Call",
							method: convertToAtLookup(top)
						});
					} else {
						throw new Error("Unable to understand expression "+tokens.join(''));
					}
				}
				// End Call
				else if(token === ")") {
					stack.popTo(["Call"]);
				}
				// End Call argument
				else if(token === ",") {
					stack.popUntil(["Call"]);
				}
			}
			return stack.root.children[0];
		}
	};

	can.expression = expression;
	return expression;
	
});

