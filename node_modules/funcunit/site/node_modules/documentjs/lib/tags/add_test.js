var process = require("../process/process"),
	add = require("./add"),
	assert = require("assert");




describe("documentjs/lib/tags/add", function(){
	
	it("basic",function(){
		
		var docMap = {Foo: {name: "Foo",type: "constructor"}};
		
		process.comment({
			comment: "@add Foo",
			docMap: docMap,
			docObject: {},
			tags: {add: add}
		}, function(newDoc, newScope){
			assert.equal(newScope, docMap.Foo);
		});
	});

});