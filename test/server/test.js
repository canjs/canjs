var assert = require("assert");
var Steal = require("steal");

describe("Running on the server", function(){
	this.timeout(20000);
	
	describe("With Steal", function(){
		before(function(){
			var steal = this.steal = Steal.clone();

			var System = global.System = this.System = steal.System;

			System.config({
				config: __dirname + "/../../package.json!npm",
				main: "@empty",
				env: "server-development"
			});
		});

		it("Works with no config", function(done){
			var steal = this.steal;

			steal.import("can/util/").then(function(){
				assert(true, "it worked");
			}).then(done);
		});
	});
});
