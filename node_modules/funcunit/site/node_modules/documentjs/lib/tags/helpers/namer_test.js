
var namer = require("./namer"),
	typer = require("./typer"),
	assert = require("assert");
	
describe("documentjs/lib/tags/helpers/namer", function(){
	
	it("name",function(){
		assert.deepEqual(namer.name("foo",{}),{
			name: "foo"
		});
	});
	
	it("optional",function(){
		assert.deepEqual(namer.name("[foo]",{}),{
			name: "foo",
			optional: true
		});
	});
	
	it("optional / default", function(){
		assert.deepEqual(namer.name("[foo=bar]",{}),{
			name: "foo",
			optional: true,
			defaultValue: "bar",
		});
	});
	
	it("function",function(){
		
		var res = typer.type("function(jQuery.Event,*...)",{})
		
		
		assert.deepEqual(namer.name("handler(event,args)", res),
		{
			name: "handler",
			types: [{
				type: "function",
				context: undefined,
				constructs: undefined,
				params: [
					{types: [{type: "jQuery.Event"}], name: "event" },
					{types: [{type: "*"}], variable: true, name: "args" }
				],
				returns: {types: [{type: "undefined"}] }
			}]
		}
		
		);
	});
	
	it("function without corresponding types",function(){
		
		var res = typer.type("function",{})
		
		
		assert.deepEqual(namer.name("handler(event,args)", res),
		{
			name: "handler",
			types: [{
				type: "function",
				context: undefined,
				constructs: undefined,
				params: [
					{ name: "event" },
					{ name: "args" }
				],
				returns: {types: [{type: "undefined"}] }
			}]
		}
		
		);
		
	});
	
	
	it("special characters",function(){
		assert.deepEqual(namer.name("f\\=oo",{}),{
			name: "f=oo"
		});
		assert.deepEqual(namer.name("\\(args\\...\\)",{}),{
			name: "(args...)"
		});
		assert.deepEqual(namer.name('[foo=\'<%\\=bar%>\']',{}),{
			name: "foo",
			optional: true,
			defaultValue: "'<%=bar%>'"
		});
		//assert.deepEqual(namer.name("\\...",{}),{
		//	name: "..."
		//});
	});
	
	
});
