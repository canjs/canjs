var assert = require("assert");
var asap = require("pdenodeify");
var multiBuild = require("../lib/build/multi");
var rmdir = asap(require("rimraf"));
var testHelpers = require("./helpers");

var find = testHelpers.find;
var open = testHelpers.open;

describe("Continuous Build", function(){
	beforeEach(function(done){
		rmdir(__dirname+"/bundle/dist").then(done);
	});

	it("works", function(done){
		var stream = multiBuild({
			config: __dirname + "/bundle/stealconfig.js",
			main: "bundle"
		}, {
			watch: true,
			quiet: true,
			minify: false
		});

		stream.on("data", function(){
			open("test/bundle/bundle.html#a",function(browser, close){
				find(browser,"appA", function(appA){
					assert(true, "got A");
					assert.equal(appA.name, "a", "got the module");
					assert.equal(appA.ab.name, "a_b", "a got ab");
					assert.equal(appA.clean, undefined, "removed dev code");
					close();
				}, close);
			}, done);

		});
	});
});
