var find = require("./find"),
	assert = require("assert"),
	path = require("path");
	

describe("documentjs/lib/find",function(){
	
	it("is able to ignore", function(done){
		var fileEventEmitter = find.files({ 
			glob: {
				pattern: "**/*.{js,md}",
				cwd: path.join(__dirname,"test"),
				ignore: "node_mods/**/*"
			}
		});
		
		fileEventEmitter.on("match",function(src){

			if(src.indexOf("node_mods") >= 0) {
				assert.ok(false, "Got something that should have been ignored - "+src);
			}
			
		});
		fileEventEmitter.on("end",function(){
			done();
		});
	});
	
});
