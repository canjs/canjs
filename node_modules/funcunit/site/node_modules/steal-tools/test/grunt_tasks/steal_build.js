var assert = require("assert");
var winston = require("winston");
var Grunt = require("./grunt_mock");
var registerBuild = require("../../tasks/build");

describe("steal-build grunt task", function(){
	beforeEach(function(){
		this.myLog = winston.info;
		winston.info = function(){};
	});

	afterEach(function(){
		winston.info = this.myLog;
	});

	it("buildOptions is optional", function(done){
		var grunt = new Grunt();
		registerBuild(grunt);

		grunt.run({
			system: {
				config: __dirname + "/config.js",
				main: "main"
			}
		}).then(done);
	});

	it("fails if there is an error in the build", function(done){
		var grunt = new Grunt();
		registerBuild(grunt);

		grunt.run({
			system: {
				config: __dirname + "/config.js",
				main: "main_with_error"
			}
		}).then(function(){
			assert(false, "This passed when it shouldn't have");
			done();
		}, function(error){
			assert(error);
			done();
		});
	});
});
