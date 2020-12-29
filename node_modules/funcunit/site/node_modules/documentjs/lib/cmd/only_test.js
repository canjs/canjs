var only = require("./only"),
	assert = require("assert"),
	path = require('path');
	
describe("cmd/only", function(){
	
	it("it is able to convert to a useful object", function(){
		var data = only(["2.1.2@../foo","3.2.1"]);
		
		assert.deepEqual(data,[
			{name: "2.1.2", resource: path.join(process.cwd(),"../foo")},
			{name: "3.2.1"}]);
	});
});