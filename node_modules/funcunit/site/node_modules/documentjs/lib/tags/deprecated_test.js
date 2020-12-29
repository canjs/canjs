var deprecated = require('./deprecated'),
	assert = require('assert');
	

	
describe("documentjs/lib/tags/deprecated",function(){
	
	it("@deprecated",function(){
		
		var obj = {}
		deprecated.add.call(obj,"@deprecated {2.1} a description");
		deprecated.add.call(obj, "@deprecated {2.2} another description");
		
		assert.deepEqual(obj.deprecated,
		[
			{version: "2.1", description: "a description"},
			{version: "2.2", description: "another description"}
		]);
		
	});
	

	
});
