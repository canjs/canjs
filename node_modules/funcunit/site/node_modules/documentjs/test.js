require("./lib/find/find_test");

require("./lib/tags/tags_tests");

require("./lib/process/process_test");

require("./lib/generators/html/html_test");

require("./lib/generate/test/generate_test");

require("./lib/configured/configured_test");

var assert = require("assert");
var docjs = require("./main.js");

describe("documentjs/main",function(){
    it("exports configured", function(){
        assert.deepEqual(docjs.configured, require('./lib/configured/configured'), "configured is exported");
    });
    it("exports find", function(){
        assert.deepEqual(docjs.find, require('./lib/find/find'), "find is exported");
    });
    it("exports generators", function(){
        assert.ok(typeof docjs.generators !== "undefined", "generators is exported");
    });
    it("exports process", function(){
        assert.deepEqual(docjs.process, require('./lib/process/process'), "process is exported");
    });
    it("exports tag", function(){
        assert.deepEqual(docjs.tag, require('./lib/tags/tags'), "tag is exported");
    });
});

/*
var buildStaticDist = require('../lib/generate/build_static_dist');


describe('build_static_dist', function(){
	
    it('should work', function(done){
		buildStaticDist({}).then(
		function(){
			done();
		}).done();
	});
	
});*/