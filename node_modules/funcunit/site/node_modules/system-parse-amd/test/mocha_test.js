var path = require("path");
var assert = require("assert");

var System = require("systemjs");
var BuildSystem = System.clone();
var trace = require("./trace");

var amd = require("../system-parse-amd");
var onFulfilled, onRejected;

amd(System);

trace(System, BuildSystem, function(){
	onFulfilled.apply(this, arguments);
}, function(){
	onRejected.apply(this, arguments);
});

System.baseURL = path.join(__dirname,"..");


describe("amd extension", function(){
	
	it("is able to load jQuery", function(done){
		System.paths["jquery"] = "node_modules/jquery/dist/jquery.js";
		System.import("jquery").then(function(){
			assert.ok(true, "finished loading");
			
			done();
			
		}, done);
		onFulfilled = function(load, deps){
			assert.equal(load.name, "jquery");
			assert.deepEqual(deps,[], "dependencies");
		};
		
		onRejected = function(e){
			done(e);
		};
	});
	
});
