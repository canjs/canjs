steal("./expression.js", "steal-qunit", function(){
	
	var expression = can.expression;
	QUnit.module("can/view/stache/expression");
	
	
	test("expression.tokenize", function(){
		var literals = "'quote' \"QUOTE\" 1 undefined null true false 0.1";
		var res = expression.tokenize(literals);
		
		deepEqual(res, literals.split(" "));
		
		var keys = "key foo.bar foo@bar %foo *foo foo/bar";
		res = expression.tokenize(keys);
		deepEqual(res, keys.split(" "));
		
		var syntax = "( ) , ~ =";
		res = expression.tokenize(syntax);
		deepEqual(res, syntax.split(" "));
		
		var curly = "{{ }}";
		res = expression.tokenize(curly);
		deepEqual(res, []);
		
	});
	
	test("expression.ast - helper followed by hash", function(){
		var ast = expression.ast("print_hash prop=own_prop");
		
		deepEqual(ast, {
			type: "Helper",
			method: {
				type: "Lookup",
				key: "print_hash"
			},
			children: [
				{
					type: "Hash",
					prop: "prop",
					children: [{type: "Lookup", key: "own_prop"}]
				}
			]
		});
		
	});
	
	test("expression.ast - everything", function(){
		var ast = expression.ast("helperA helperB(1, valueA, propA=~valueB propC=2).zed() 'def' nested@prop outerPropA=helperC(2,valueB)");
		
		var helperBCall = {
			type: "Call",
			method: {type: "Lookup", key: "@helperB"},
			children: [
				{type: "Literal", value: 1},
				{type: "Lookup", key: "valueA"},
				{
					type: "Hash",
					prop: "propA",
					children: [{type: "Arg", key: "~", children: [{type: "Lookup", key: "valueB"} ]}]
				},
				{
					type: "Hash",
					prop: "propC",
					children: [{type: "Literal", value: 2}]
				}
			]
		};
		var helperCCall = {
			type: "Call",
			method: {type: "Lookup", key: "@helperC"},
			children: [
				{type: "Literal", value: 2},
				{type: "Lookup", key: "valueB"}
			]
		};
		
		deepEqual(ast, {
			type: "Helper",
			method: {
				type: "Lookup",
				key: "helperA"
			},
			children: [
				{
					type: "Call",
					method: {
						type: "Lookup",
						root: helperBCall,
						key: "@zed"
					}
				},
				{type: "Literal", value: 'def'},
				{type: "Lookup", key: "nested@prop"},
				{
					type: "Hash",
					prop: "outerPropA",
					children: [helperCCall]
				}
			]
		});
	});
	
	test("expression.parse - everything", function(){
		
		var exprData = expression.parse("helperA helperB(1, valueA, propA=~valueB propC=2).zed 'def' nested@prop outerPropA=helperC(2,valueB)");
		
		var oneExpr = new expression.Literal(1),
			twoExpr = new expression.Literal(2),
			def = new expression.Literal('def'),
		
			valueA = new expression.ScopeLookup("valueA"),
			valueB = new expression.ScopeLookup("valueB"),
			nested = new expression.HelperScopeLookup("nested@prop"),
			
			helperA = new expression.HelperLookup("helperA"),
			helperB = new expression.Lookup("@helperB"),
			helperC = new expression.Lookup("@helperC");
		
		var callHelperB = new expression.Call(
			helperB,
			[oneExpr, valueA],
			{
				propA: new expression.Arg(valueB, {compute: true}),
				propC: twoExpr
			}
		);
		
		var callHelperBdotZed = new expression.ScopeLookup(".zed", callHelperB);
		
		var callHelperC = new expression.Call(
			helperC,
			[twoExpr, valueB],
			{}
		);
		
		var callHelperA = new expression.Helper(
			helperA,
			[callHelperBdotZed, def, nested],
			{
				outerPropA: callHelperC
			}
		);
		
		deepEqual(callHelperB, exprData.argExprs[0].rootExpr, "call helper b");
		
		deepEqual(callHelperC, exprData.hashExprs.outerPropA, "helperC call");
		
		deepEqual(callHelperBdotZed, exprData.argExprs[0], "call helper b.zed");
		
		var expectedArgs = [callHelperBdotZed, def, nested];
		can.each(exprData.argExprs, function(arg, i){
			deepEqual(arg, expectedArgs[i], "helperA arg["+i);
		});
		
		
		deepEqual( exprData, callHelperA, "full thing");
	});
	
	test("numeric expression.Literal", function(){
		var exprData = expression.parse("3");
		
		var result = new expression.Literal(3);
		deepEqual( exprData, result);
		
	});
	
	test("expression.Helper:value non-observable values", function(){
		// {{fullName 'marshall' 'thompson'}}
		
		var scope = new can.view.Scope({
			fullName: function(first, last){
				return first+" "+last;
			}
		});
		
		var callFullName = new expression.Helper(
			new expression.HelperLookup("fullName"),
			[new expression.Literal('marshall'), new expression.Literal('thompson')],
			{}
		);
		
		var result = callFullName.value(scope, new can.view.Scope({}),  {});
		
		equal(result, "marshall thompson");
	});
	
	test("expression.Helper:value observable values", function(){
		// {{fullName first 'thompson'}}
		
		var scope = new can.view.Scope({
			fullName: function(first, last){
				return first()+" "+last;
			},
			first: can.compute("marshall")
		});
		
		var callFullName = new expression.Helper(
			new expression.HelperLookup("fullName"),
			[new expression.HelperLookup("first"), new expression.Literal('thompson')],
			{}
		);
		
		var result = callFullName.value(scope, new can.view.Scope({}) );
		
		equal(result(), "marshall thompson");
	});
	
	test("methods can return values (#1887)", function(){
		var MyMap = can.Map.extend({
			getSomething: function(arg){
				return this.attr("foo") + arg();
			}
		});
		
		var scope =
			new can.view.Scope(new MyMap({foo: 2, bar: 3}))
				.add({});
		
		var callGetSomething = new expression.Helper(
			new expression.HelperLookup("getSomething"),
			[new expression.ScopeLookup("bar")],
			{}
		);
		
		var result = callGetSomething.value(scope, new can.view.Scope({}), {asCompute: true});
		
		equal(result(), 5);
	});
	
	test("methods don't update correctly (#1891)", function(){
		var map = new can.Map({
		  num: 1,
		  num2: function () {
		    return this.attr('num') * 2;
		  },
		  runTest: function () {
		    this.attr('num', this.attr('num') * 2);
		  }
		});
		
		var scope =
			new can.view.Scope(map);
		
		var num2Expression = new expression.Lookup("num2");
		var num2 = num2Expression.value( scope, new can.view.Scope({}), {asCompute: true} );
		
		num2.bind("change", function(ev, newVal){
			
		});
		
		map.runTest();
		
		equal( num2(), 4, "num2 updated correctly");
		
	});
	
	test("call expressions called with different scopes give different results (#1791)", function(){
		var exprData = expression.parse("doSomething(number)");
		
		var res = exprData.value(new can.view.Scope({
			doSomething: function(num){
				return num*2;
			},
			number: can.compute(2)
		}));
		
		equal( res(), 4);
		
		res = exprData.value(new can.view.Scope({
			doSomething: function(num){
				return num*3;
			},
			number: can.compute(4)
		}));
		
		equal( res(), 12);
	});
	
	test("convertKeyToLookup", function(){
		
		equal( expression.convertKeyToLookup("../foo"), "../@foo" );
		equal( expression.convertKeyToLookup("foo"), "@foo" );
		equal( expression.convertKeyToLookup(".foo"), "@foo" );
		equal( expression.convertKeyToLookup("./foo"), "./@foo" );
		equal( expression.convertKeyToLookup("foo.bar"), "foo@bar" );
		
	});
});
