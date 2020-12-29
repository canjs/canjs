var typer = require("./typer"),
	assert = require("assert");

	
describe("documentjs/tags/helpers/typer", function(){
	
	it("name",function(){
		assert.deepEqual( typer.type("can.Control"), {
			types: [{
				type: "can.Control"
			}]
		});
	});
	
	it("application",function(){
		
		assert.deepEqual( typer.type("foo"), {
			types: [{type: "foo"}]
		}, "basic");
		
		assert.deepEqual( typer.type("foo.<bar,car>"), {
			types: [{
				type: "foo",
				template: [
					{types: [{type: "bar"}] },
					{types: [{type: "car"}] }
				]
			}]
		}, "application");
		
		assert.deepEqual( typer.type("Object.<String,DocProps>"), {
			types: [{
				type: "Object",
				template: [
					{types: [{type: "String"}] },
					{types: [{type: "DocProps"}] }
				]
			}]
		}, "Object.<String,DocProps>");
		
		
		
	});
	
	it("union",function(){
		assert.deepEqual( typer.type("(can.Control|can.Model)"), {
			types: [{
				type: "can.Control"
			},{
				type: "can.Model"
			}]
		});
	});
	
	it("record",function(){
		
		assert.deepEqual( typer.type("{myNum:number,myObject}"), {
			types: [{
				type: "Object",
				options: [
					{name: "myNum", types:[{type: "number"}]},
					{name: "myObject"}
				]
			}]
		}, "record type");
		
	});
	
	it("nullable",function(){
		assert.deepEqual( typer.type("?can.Control"), {
			types: [{
				type: "can.Control"
			}],
			nullable: true
		});
		
		assert.deepEqual( typer.type("?can.Control"), {
			types: [{
				type: "can.Control"
			}],
			nullable: true
		});
		
	});
	
	
	it("nonnullable",function(){
		assert.deepEqual( typer.type("!can.Control"), {
			types: [{
				type: "can.Control"
			}],
			nonnull: true
		});
	});
	
	it("function",function(){
		
		assert.deepEqual( typer.type("function(this:foo,new:bar,string):number"), {
			types: [{
				type: "function",
				context: {types: [{type: "foo"}] },
				constructs: {types: [{type: "bar"}] },
				params: [
					{types: [{type: "string"}] }
				],
				returns: {types: [{type: "number"}] }
			}]
		}, "function");
		
		
		assert.deepEqual( typer.type("function( this:foo, new:bar, string ) :number "), {
			types: [{
				type: "function",
				context: {types: [{type: "foo"}] },
				constructs: {types: [{type: "bar"}] },
				params: [
					{types: [{type: "string"}] }
				],
				returns: {types: [{type: "number"}] }
			}]
		}, "function with spaces");
		
	});
	
	it("variable params",function(){
		assert.deepEqual( typer.type("...can.Control"), {
			types: [{
				type: "can.Control"
			}],
			variable: true
		});
	})
	
	it("variable params",function(){
		assert.deepEqual( typer.type("...can.Control"), {
			types: [{
				type: "can.Control"
			}],
			variable: true
		});
	});

	
	it("variable params",function(){
		
		assert.deepEqual( typer.type("function(...can.Observe){}"), {
			types: [{
				type: "function",
				constructs: undefined,
				context: undefined,
				returns: {types: [{type: "undefined"}]},
				params: [
					{types: [{type: "can.Observe"}], variable: true}
				]
			}],
		});
		
	});
	
	// NON-STANDARD types ...
	it("optional",function(){
		assert.deepEqual( typer.type("can.Control="), {
			types: [{
				type: "can.Control"
			}],
			optional: true
		});
	});
	
	it("optional / default", function(){
		assert.deepEqual( typer.type("context=foo"), {
			types: [{
				type: "context"
			}],
			defaultValue: {type: "foo"},
			optional: true
		});
	});
	
	it("parenthesis-less union", function(){
		assert.deepEqual( typer.type("can.Control|can.Model"), {
			types: [{
				type: "can.Control"
			},{
				type: "can.Model"
			}]
		});
	})
	
	it("parenthesis-less union with function", function(){
		assert.deepEqual( typer.type("function|can.Model"), {
			types: [{
				type: "function",
				type: "function",
				constructs: undefined,
				context: undefined,
				returns: {types: [{type: "undefined"}]},
				params: []
			},{
				type: "can.Model"
			}]
		});
	});
	
	
});
