var func = require("./function"),
	option = require("./option"),
	assert = require("assert");

	
describe("documentjs/lib/tags/function",function(){
	
	it("basic add",function(){
		
		var obj = {};
		var docMap = {Foo: {name: "Foo", type: "constructor"}}
		func.add.call(obj,"@function bar title",null,docMap.Foo, docMap );
		
		assert.deepEqual(obj,{
			name: "Foo.bar",
			type: "function",
			title: "title",
			parent: "Foo"
		});
		
	});
	
	it("codeMatch", function(){
		assert.ok(func.codeMatch.test("Thing = function(){}"));
		assert.ok(func.codeMatch.test("Thing: function(){}"));
		assert.ok(!func.codeMatch.test("foo: bar"))
	});
	
	it("code",function(){
		
		assert.deepEqual(func.code("method: function(arg1, arg2){"),{
			name: "method",
			params: [
				{name: "arg1", types: [{type: "*"}]},
				{name: "arg2", types: [{type: "*"}]}
			],
			type: "function"
		});
		
	});
	
	it("code with scope",function(){
		
		var docMap = {Foo: {name: "Foo", type: "constructor"}};
		
		assert.deepEqual(func.code("method: function(arg1, arg2){", docMap.Foo, docMap),{
			name: "Foo.method",
			params: [
				{name: "arg1", types: [{type: "*"}]},
				{name: "arg2", types: [{type: "*"}]}
			],
			type: "function",
			parent: "Foo"
		});
		
	});
	
	it("variable set to function before terinary", function(){
		
		var res = func.code("var keys = !nativeKeys ? shimKeys : function(object) {");
		assert.deepEqual(res, {
			name: "keys",
			params: [
				{name: "object", types: [{type: "*"}]}
			],
			type: "function"
		});
		
	});

	
});
