steal("./mustache_core.js", "steal-qunit", function(){
	
	var mustacheCore = can.view.mustacheCore;
	QUnit.module("can/view/stache/mustache_core");
	
	
	test("expressionData with sub-expressions", function(){
		var exprData = mustacheCore.expressionData("{{helperA (helperB 1 valueA propA=valueB propC=2) 'def' nested.prop outerPropA=(helperC 2 valueB)}}");
		
		var oneExpr = new mustacheCore.Expression(1),
			twoExpr = new mustacheCore.Expression(2),
			def = new mustacheCore.Expression('def'),
			
			valueA = new mustacheCore.ScopeExpression("valueA"),
			valueB = new mustacheCore.ScopeExpression("valueB"),
			nested = new mustacheCore.ScopeExpression("nested.prop"),
			
			helperA = new mustacheCore.ScopeExpression("helperA"),
			helperB = new mustacheCore.ScopeExpression("helperB"),
			helperC = new mustacheCore.ScopeExpression("helperC");
		
		var callHelperB = new mustacheCore.MethodExpression(
			helperB,
			[oneExpr, valueA],
			{
				propA: valueB,
				propC: twoExpr
			}
		);
		var callHelperC = new mustacheCore.MethodExpression(
			helperC,
			[twoExpr, valueB],
			{}
		);
		
		var callHelperA = new mustacheCore.MethodExpression(
			helperA,
			[callHelperB, def, nested],
			{
				outerPropA: callHelperC
			}
		);
		
		
		deepEqual( exprData, callHelperA);
		
	});
	
	test("numeric expressions", function(){
		var exprData = mustacheCore.expressionData("{{3}}");
		
		var result = new mustacheCore.MethodExpression(
			new mustacheCore.ScopeExpression("3"),
			[],
			{}
		);
		deepEqual( exprData, result);
		
	});
	
	test("MethodExpression.value non-observable values", function(){
		// {{fullName 'marshall' 'thompson'}}
		
		var scope = new can.view.Scope({
			fullName: function(first, last){
				return first+" "+last;
			}
		});
		
		var callFullName = new mustacheCore.MethodExpression(
			new mustacheCore.ScopeExpression("fullName"),
			[new mustacheCore.Expression('marshall'), new mustacheCore.Expression('thompson')],
			{}
		);
		
		var result = callFullName.value(scope, new can.view.Scope({}));
		
		equal(result, "marshall thompson");
	});
	
	test("MethodExpression.value non-observable values", function(){
		// {{fullName first 'thompson'}}
		
		var scope = new can.view.Scope({
			fullName: function(first, last){
				return first()+" "+last;
			},
			first: can.compute("marshall")
		});
		
		var callFullName = new mustacheCore.MethodExpression(
			new mustacheCore.ScopeExpression("fullName"),
			[new mustacheCore.ScopeExpression("first"), new mustacheCore.Expression('thompson')],
			{}
		);
		
		var result = callFullName.value(scope, new can.view.Scope({}));
		
		equal(result(), "marshall thompson");
	});
	
});
