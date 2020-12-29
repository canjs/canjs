var body = require('./body'),
	assert = require('assert');
	

	
describe("documentjs/lib/tags/body",function(){
	
	var doubleDash = /--/;
	
	it("@body and @description will clear <!-- and -->",function(){
		
		var obj = {
			description: "  <!-- What",
			body: "\n\n--> Hello There"
		};
		body.done.call(obj);
		assert.ok( !doubleDash.test(obj.description), "description has no <!--."+obj.description );
		assert.ok( !doubleDash.test(obj.body), "description has no <!--"+obj.body );
		
	});
	

	
});
