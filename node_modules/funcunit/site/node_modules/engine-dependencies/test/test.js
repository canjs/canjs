var engineDependencies = require("../engine-dependencies");
var assert = require("assert"),
	path = require("path");

var engineVersion = process.version;
var engineMajorVersion = +engineVersion.substr(1, engineVersion.indexOf(".") - 1);
var app = engineVersion.substr(0, 3) === "v0." ? "node" :
	engineMajorVersion >= 4 ? "node" : "iojs";

var engineMajor = engineVersion.substr(0,3) === "v0." ?
	engineVersion.substr(0, 5) : engineVersion.replace(/\..*/,"");

describe("Install dependency version based on engine used", function(){
	this.timeout(10000);

	it("basics works", function(done){
		var jqueryVersion;
		if(app === "iojs") {
			jqueryVersion = "2.1.4";
		} else if(engineMajor === "v0.12") {
			jqueryVersion = "1.11.2";
		} else if(engineMajor === "v0.10") {
			jqueryVersion = "1.11.0";
		} else if(engineMajor === "v4") {
			jqueryVersion = "2.1.4";
		} else if(engineMajor === "v5") {
			jqueryVersion = "2.2.0";
		} else if(engineMajor === "v10") {
			jqueryVersion = "3.0.0";
		}


		engineDependencies({
			"node": {
				"0.10.x": {
					"devDependencies": {
						"jquery": "1.11.0"
					}
				},
				"0.12.x": {
					"jquery": "1.11.2"
				},
				"^4.0.0": {
					"jquery": "2.1.4"
				},
				"^5.0.0": {
					"jquery": "2.2.0"
				},
				"^10.0.0": {
					"jquery": "3.0.0"
				}
			},
			"iojs": {
				"^3.0.0": {
					"devDependencies": {
						"jquery": "2.1.4"
					}
				}
			}
		}, function(err){
			if(err) {
				return done(err);
			}
			var pkg = require(path.join(__dirname, "..","node_modules","jquery","package.json"));
			assert.equal(pkg.version, jqueryVersion, "got the correct version of jquery");
			done();
		});
	});
});
