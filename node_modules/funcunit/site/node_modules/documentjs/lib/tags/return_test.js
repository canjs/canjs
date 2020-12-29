var ret = require("./return"),
	assert = require("assert");

describe("documentjs/lib/tags/return",function(){

	it("@return",function(){
		var obj = {}
		ret.add.call(obj,"@return {String} a description");

		assert.deepEqual(obj.returns,{
			description: "a description",
			types: [{type: "String"}]
		});
	});

	it("gracefully handles empty expression", function(){
		var obj = {}
		try {
			ret.add.call(obj, "@return");
		} catch (e) {
			assert.ok(false, 'error thrown');
		}
	});
});
