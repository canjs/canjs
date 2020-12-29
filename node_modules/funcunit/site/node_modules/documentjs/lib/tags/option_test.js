var option = require('./option'),
	param = require('./param'),
	property = require('./property'),
	returns = require('./return'),
	assert = require("assert");
	
describe("documentjs/lib/tags/option",function(){
	
	it("@option",function(){
		
		var obj = {};
		param.add.call(obj,"@param {{name: String, foo}=} thing a description");
		option.add.call(obj, "@option name name description");
		option.add.call(obj, "@option {Bar} [foo=thing] foo description");
		option.add.call(obj, "@option {Extra} extra extra description");
		
		assert.deepEqual(obj.params[0],
		{
			name: "thing",
			description: "a description",
			types: [{
				type: "Object",
				options: [
					{types: [{type: "String"}], name: "name", description: "name description" },
					{
						types: [{type: "Bar"}], 
						name: "foo", 
						description: "foo description",
						defaultValue: "thing",
						optional: true
					},
					{types: [{type: "Extra"}], name: "extra", description: "extra description" }
				]
			}]
		});
		
	});
	
	it("@option on Object",function(){
		
		var obj = {};
		param.add.call(obj,"@param {Object} thing a description");
		option.add.call(obj, "@option {String} name name description");
		option.add.call(obj, "@option {Bar} [foo=thing] foo description");
		option.add.call(obj, "@option {Extra} extra extra description");
		
		assert.deepEqual(obj.params[0],
		{
			name: "thing",
			description: "a description",
			types: [{
				type: "Object",
				options: [
					{types: [{type: "String"}], name: "name", description: "name description" },
					{
						types: [{type: "Bar"}], 
						name: "foo", 
						description: "foo description",
						defaultValue: "thing",
						optional: true
					},
					{types: [{type: "Extra"}], name: "extra", description: "extra description" }
				]
			}]
		});
		
	});
	
	
	it("@option - for function",function(){
		
		var obj = {}
		param.add.call(obj,"@param {function(String,Bar)} thing(first,second) a description");
		option.add.call(obj, "@option first first description");
		option.add.call(obj, "@option second second description");
		
		assert.deepEqual(obj.params[0],
		{
			name: "thing",
			description: "a description",
			types: [{
				type: "function",
				constructs: undefined,
				context: undefined,
				params: [
					{types: [{type: "String"}], name: "first", description: "first description" },
					{
						types: [{type: "Bar"}], 
						name: "second", 
						description: "second description",
					}
				],
				returns : {types: [{type: "undefined"}]}
			}]
		});
		
	});
	
	it("@option on a property", function(){
		
		var obj = {}
		property.add.call(obj,"@property {String|Thing} thing");
		option.add.call(obj, "@option {String} String description");
		option.add.call(obj, "@option {Thing} Thing description");
		
		assert.deepEqual(obj,
		{
			name: "thing",
			title: "",
			type: "property",
			types: [{
				type: "String",
				description: "String description"
			},{
				type: "Thing",
				description: "Thing description"
			}]
		});
		
	});
	
	it("@option on a @return value", function(){
		
		var obj = {}
		returns.add.call(obj,"@return {Foo|Bar} ret description");
		option.add.call(obj, "@option {Foo} Foo description");
		option.add.call(obj, "@option {Bar} Bar description");
		
		
		assert.deepEqual(obj.returns,
		{
			description: "ret description",
			types: [
				{
					type: "Foo",
					description: "Foo description"
				},
				{
					type: "Bar",
					description: "Bar description"
				}
			]
		});
		
		
	});
	
	it("@property with @function option with @option on returns", function(){
		var obj = {};
		property.add.call(obj,"@property {String|function} thing");
		option.add.call(obj, "@option {String} String description");
		option.add.call(obj, "@option {function} Function description");
		returns.add.call(obj,"@return {Foo|Bar} ret description");
		option.add.call(obj, "@option {Foo} Foo description");
		option.add.call(obj, "@option {Bar} Bar description");
		assert.deepEqual(obj.types[1].returns.types,
			[
				{type: "Foo", description: "Foo description"},
				{type: "Bar", description: "Bar description"}
			]);

	});
	
	it("@option can add on a @param that is not an object (#72)", function(){
		var obj = {};
		param.add.call(obj,"@param {Something} thing a description");
		option.add.call(obj, "@option {Foo} foo foo description");
		
		assert.deepEqual(obj.params[0].types[0].options,
			[
				{name: "foo", types: [{type:"Foo"}], description: "foo description"}
			]);
		
	});
	
	
});
