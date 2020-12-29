"use strict";
// ## Expression Types
//
// These expression types return a value. They are assembled by `expression.parse`.
var Arg = require("../expressions/arg");
var Literal = require("../expressions/literal");
var Hashes = require("../expressions/hashes");
var Bracket = require("../expressions/bracket");
var Call = require("../expressions/call");
var Helper = require("../expressions/helper");
var Lookup = require("../expressions/lookup");

var SetIdentifier = require("./set-identifier");
var expressionHelpers = require("../src/expression-helpers");

var utils = require('./utils');
var assign = require('can-assign');
var last = utils.last;
var canReflect = require("can-reflect");
var canSymbol = require("can-symbol");

var sourceTextSymbol = canSymbol.for("can-stache.sourceText");

// ### Hash
// A placeholder. This isn't actually used.
var Hash = function(){ }; // jshint ignore:line

// NAME - \w
// KEY - foo, foo.bar, foo@bar, %foo (special), &foo (references), ../foo, ./foo
// ARG - ~KEY, KEY, CALLEXPRESSION, PRIMITIVE
// CALLEXPRESSION = KEY(ARG,ARG, NAME=ARG)
// HELPEREXPRESSION = KEY ARG ARG NAME=ARG
// DOT .NAME
// AT @NAME
//
var keyRegExp = /[\w\.\\\-_@\/\&%]+/,
	tokensRegExp = /('.*?'|".*?"|=|[\w\.\\\-_@\/*%\$]+|[\(\)]|,|\~|\[|\]\s*|\s*(?=\[))/g,
	bracketSpaceRegExp = /\]\s+/,
	literalRegExp = /^('.*?'|".*?"|-?[0-9]+\.?[0-9]*|true|false|null|undefined)$/;

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
assign(Stack.prototype,{
	top: function(){
		return last(this.stack);
	},
	isRootTop: function(){
		return this.top() === this.root;
	},
	popTo: function(types){
		this.popUntil(types);
		this.pop();
	},
	pop: function() {
		if(!this.isRootTop()) {
			this.stack.pop();
		}
	},
	first: function(types){
		var curIndex = this.stack.length - 1;
		while( curIndex > 0 && types.indexOf(this.stack[curIndex].type) === -1 ) {
			curIndex--;
		}
		return this.stack[curIndex];
	},
	firstParent: function(types){
		var curIndex = this.stack.length - 2;
		while( curIndex > 0 && types.indexOf(this.stack[curIndex].type) === -1 ) {
			curIndex--;
		}
		return this.stack[curIndex];
	},
	popUntil: function(types){
		while( types.indexOf(this.top().type) === -1 && !this.isRootTop() ) {
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
	push: function(type) {
		this.stack.push(type);
	},
	topLastChild: function(){
		return last(this.top().children);
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
		canReflect.setKeyValue(ast, sourceTextSymbol, ast.key);
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
	toComputeOrValue: expressionHelpers.toComputeOrValue,
	convertKeyToLookup: convertKeyToLookup,

	Literal: Literal,
	Lookup: Lookup,
	Arg: Arg,
	Hash: Hash,
	Hashes: Hashes,
	Call: Call,
	Helper: Helper,
	Bracket: Bracket,

	SetIdentifier: SetIdentifier,
	tokenize: function(expression){
		var tokens = [];
		(expression.trim() + ' ').replace(tokensRegExp, function (whole, arg) {
			if (bracketSpaceRegExp.test(arg)) {
				tokens.push(arg[0]);
				tokens.push(arg.slice(1));
			} else {
				tokens.push(arg);
			}
		});
		return tokens;
	},
	lookupRules: {
		"default": function(ast, methodType, isArg){
			return ast.type === "Helper" ? Helper : Lookup;
		},
		"method": function(ast, methodType, isArg){
			return Lookup;
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
		var hashes;
		if(ast.type === "Lookup") {
			var LookupRule = options.lookupRule(ast, methodType, isArg);
			var lookup = new LookupRule(ast.key, ast.root && this.hydrateAst(ast.root, options, methodType), ast[sourceTextSymbol] );
			return lookup;
		}
		else if(ast.type === "Literal") {
			return new Literal(ast.value);
		}
		else if(ast.type === "Arg") {
			return new Arg(this.hydrateAst(ast.children[0], options, methodType, isArg),{compute: true});
		}
		else if(ast.type === "Hash") {
			throw new Error("");
		}
		else if(ast.type === "Hashes") {
			hashes = {};
			ast.children.forEach(function(hash){
				hashes[hash.prop] = this.hydrateAst( hash.children[0], options, methodType, true );
			}, this);
			return new Hashes(hashes);
		}
		else if(ast.type === "Call" || ast.type === "Helper") {
			//get all arguments and hashes
			hashes = {};
			var args = [],
				children = ast.children,
				ExpressionType = options.methodRule(ast);
			if(children) {
				for(var i = 0 ; i <children.length; i++) {
					var child = children[i];
					if(child.type === "Hashes" && ast.type === "Helper" &&
						(ExpressionType !== Call)) {

						child.children.forEach(function(hash){
							hashes[hash.prop] = this.hydrateAst( hash.children[0], options, ast.type, true );
						}, this);

					} else {
						args.push( this.hydrateAst(child, options, ast.type, true) );
					}
				}
			}


			return new ExpressionType(this.hydrateAst(ast.method, options, ast.type),
																args, hashes);
		} else if (ast.type === "Bracket") {
			var originalKey;
			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				originalKey = ast[canSymbol.for("can-stache.originalKey")];
			}
			//!steal-remove-end
			return new Bracket(
				this.hydrateAst(ast.children[0], options),
				ast.root ? this.hydrateAst(ast.root, options) : undefined,
				originalKey
			);
		}
	},
	ast: function(expression){
		var tokens = this.tokenize(expression);
		return this.parseAst(tokens, {
			index: 0
		});
	},
	parseAst: function(tokens, cursor) {
		// jshint maxdepth: 6
		var stack = new Stack(),
			top,
			firstParent,
			lastToken;

		while(cursor.index < tokens.length) {
			var token = tokens[cursor.index],
				nextToken = tokens[cursor.index+1];

			cursor.index++;

			// Hash
			if(nextToken === "=") {
				//convertToHelperIfTopIsLookup(stack);
				top = stack.top();

				// If top is a Lookup, we might need to convert to a helper.
				if(top && top.type === "Lookup") {
					// Check if current Lookup is part of a Call, Helper, or Hash
					// If it happens to be first within a Call or Root, that means
					// this is helper syntax.
					firstParent = stack.firstParent(["Call","Helper","Hash"]);
					if(firstParent.type === "Call" || firstParent.type === "Root") {

						stack.popUntil(["Call"]);
						top = stack.top();
						stack.replaceTopAndPush({
							type: "Helper",
							method: top.type === "Root" ? last(top.children) : top
						});

					}
				}

				firstParent = stack.first(["Call","Helper","Hashes","Root"]);
				// makes sure we are adding to Hashes if there already is one
				// otherwise we create one.
				var hash = {type: "Hash", prop: token};
				if(firstParent.type === "Hashes") {
					stack.addToAndPush(["Hashes"], hash);
				} else {
					stack.addToAndPush(["Helper", "Call","Root"], {
						type: "Hashes",
						children: [hash]
					});
					stack.push(hash);
				}
				cursor.index++;

			}
			// Literal
			else if(literalRegExp.test( token )) {
				convertToHelperIfTopIsLookup(stack);
				// only add to hash if there's not already a child.
				firstParent = stack.first(["Helper", "Call", "Hash", "Bracket"]);
				if(firstParent.type === "Hash" && (firstParent.children && firstParent.children.length > 0)) {
					stack.addTo(["Helper", "Call", "Bracket"], {type: "Literal", value: utils.jsonParse( token )});
				} else if(firstParent.type === "Bracket" && (firstParent.children && firstParent.children.length > 0)) {
					stack.addTo(["Helper", "Call", "Hash"], {type: "Literal", value: utils.jsonParse( token )});
				} else {
					stack.addTo(["Helper", "Call", "Hash", "Bracket"], {type: "Literal", value: utils.jsonParse( token )});
				}

			}
			// Lookup
			else if(keyRegExp.test(token)) {
				lastToken = stack.topLastChild();
				firstParent = stack.first(["Helper", "Call", "Hash", "Bracket"]);

				// if we had `foo().bar`, we need to change to a Lookup that looks up from lastToken.
				if(lastToken && (lastToken.type === "Call" || lastToken.type === "Bracket" ) && isAddingToExpression(token)) {
					stack.replaceTopLastChildAndPush({
						type: "Lookup",
						root: lastToken,
						key: token.slice(1) // remove leading `.`
					});
				}
				else if(firstParent.type === 'Bracket') {
					// a Bracket expression without children means we have
					// parsed `foo[` of an expression like `foo[bar]`
					// so we know to add the Lookup as a child of the Bracket expression
					if (!(firstParent.children && firstParent.children.length > 0)) {
						stack.addToAndPush(["Bracket"], {type: "Lookup", key: token});
					} else {
						// check if we are adding to a helper like `eq foo[bar] baz`
						// but not at the `.baz` of `eq foo[bar].baz xyz`
						if(stack.first(["Helper", "Call", "Hash", "Arg"]).type === 'Helper' && token[0] !== '.') {
							stack.addToAndPush(["Helper"], {type: "Lookup", key: token});
						} else {
							// otherwise, handle the `.baz` in expressions like `foo[bar].baz`
							stack.replaceTopAndPush({
								type: "Lookup",
								key: token.slice(1),
								root: firstParent
							});
						}
					}
				}
				else {
					// if two scopes, that means a helper
					convertToHelperIfTopIsLookup(stack);

					stack.addToAndPush(["Helper", "Call", "Hash", "Arg", "Bracket"], {type: "Lookup", key: token});
				}

			}
			// Arg
			else if(token === "~") {
				convertToHelperIfTopIsLookup(stack);
				stack.addToAndPush(["Helper", "Call", "Hash"], {type: "Arg", key: token});
			}
			// Call
			// foo[bar()]
			else if(token === "(") {
				top = stack.top();
				lastToken = stack.topLastChild();
				if(top.type === "Lookup") {
					stack.replaceTopAndPush({
						type: "Call",
						method: convertToAtLookup(top)
					});

				// Nested Call
				// foo()()
				} else if (lastToken && lastToken.type === "Call") {
					stack.replaceTopAndPush({
						type: "Call",
						method: lastToken
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
				// The {{let foo=zed, bar=car}} helper is not in a call
				// expression.
				var call = stack.first(["Call"]);
				if(call.type !== "Call") {
					stack.popUntil(["Hash"]);
				} else {
					stack.popUntil(["Call"]);
				}

			}
			// Bracket
			else if(token === "[") {
				top = stack.top();
				lastToken = stack.topLastChild();

				// foo()[bar] => top -> root, lastToken -> {t: call, m: "@foo"}
				// foo()[bar()] => same as above last thing we see was a call expression "rotate"
				// test['foo'][0] => lastToken => {root: test, t: Bracket, c: 'foo' }
				// log(thing['prop'][0]) =>
				//
				//     top -> {Call, children|args: [Bracket(Lookup(thing), c: ['[prop]'])]}
				//     last-> Bracket(Lookup(thing), c: ['[prop]'])
				if (lastToken && (lastToken.type === "Call" || lastToken.type === "Bracket"  )  ) {
					// must be on top of the stack as it recieves new stuff ...
					// however, what we really want is to
					stack.replaceTopLastChildAndPush({type: "Bracket", root: lastToken});
				} else if (top.type === "Lookup" || top.type === "Bracket") {
					var bracket = {type: "Bracket", root: top};
					//!steal-remove-start
					if (process.env.NODE_ENV !== 'production') {
						canReflect.setKeyValue(bracket, canSymbol.for("can-stache.originalKey"), top.key);
					}
					//!steal-remove-end
					stack.replaceTopAndPush(bracket);
				} else if (top.type === "Call") {
					stack.addToAndPush(["Call"], { type: "Bracket" });
				} else if (top === " ") {
					stack.popUntil(["Lookup", "Call"]);
					convertToHelperIfTopIsLookup(stack);
					stack.addToAndPush(["Helper", "Call", "Hash"], {type: "Bracket"});
				} else {
					stack.replaceTopAndPush({type: "Bracket"});
				}
			}
			// End Bracket
			else if(token === "]") {
				stack.pop();
			}
			else if(token === " ") {
				stack.push(token);
			}
		}
		return stack.root.children[0];
	}
};

module.exports = expression;
