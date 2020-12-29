require("./build/build_test");



var html = require("./html"),
	assert = require('assert'),
	Q = require('q'),
	path = require('path'),
	fs = require('fs'),
	rmdir = require('rimraf'),
	cleanDocMap = require("../../process/clean_doc_map");
	
describe("documentjs/lib/generators/html",function(){
	it("can push out dev mode static", function(done){
		
		this.timeout(60000);
		rmdir(path.join(__dirname,"test","tmp"), function(e){
			if(e) {
				return done(e);
			}
			var options = {
				dest: path.join(__dirname, "test","tmp"),
				devBuild: true,
				minify: false,
				parent: "index",
				forceBuild: true
			};
			
			
			var docMap = Q.Promise(function(resolve){
				resolve(cleanDocMap({
					index: {name: "index", type: "page", body: "Hello <strong>World</strong>"}
				}, options));
			});
			html.generate(docMap,options).then(function(){
				if(!fs.existsSync(path.join(__dirname,"test","tmp","static","can","can.js"))) {
					done(new Error("canjs does not exist"));
				} else if(fs.existsSync(path.join(__dirname,"test","tmp","static","bundles","static.js"))) {
					done(new Error("static build exists"));
				} else {
					done();
				}
			},done);
		}, done);
	});
	
	it("body is rendered as a mustache template prior to markdown", function(done){
		this.timeout(40000);
		rmdir(path.join(__dirname,"test","tmp"), function(e){
			if(e) {
				return done(e);
			}
			var options = {
				dest: path.join(__dirname, "test","tmp"),
				parent: "index"
			};
			
			
			var docMap = Q.Promise(function(resolve){
				resolve(cleanDocMap({
					index: {
						name: "index", 
						type: "page", 
						body: "Hello `{{thing.params.0.name}}`"
					},
					thing: {
						name: "thing",
						params: [
							{name: "first"}
						]
					}
				}, options));
			});
			
			html.generate(docMap,options).then(function(){
				fs.readFile(
					path.join(__dirname,"test","tmp","index.html"),
					function(err, data){
						if(err) {
							done(err);
						}
						assert.ok( /<code>first<\/code>/.test(""+data), "got first" );
						done();
					});

			},done);
		});
	});
	
	
});