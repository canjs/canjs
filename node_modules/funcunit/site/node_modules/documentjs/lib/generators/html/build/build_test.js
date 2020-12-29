

var getRenderer = require('./get_renderer'),
	getPartials = require('./get_partials'),
	build = require("./build"),
	assert = require('assert'),
	Q = require('q'),
	path = require('path');
	
describe("documentjs/lib/generators/html/build",function(){
	
	it("get_renderer and get_partial work",function(done){
		Q.all([
			getRenderer('lib/generators/html/build/test/templates'),
			getPartials('lib/generators/html/build/test/templates')
		]).then(function(results){

			var renderer = results[0];
			
			var result = renderer({subject: "World"});
			
			assert.equal(result, "<html><h1>Hello World</h1></html>")
			done();
		},done).catch(done);
	});
	
	it("build.renderer build.templates build.helpers",function(done){
		var options = {
			templates: path.join(__dirname,"test","templates_with_helpers"),
			dest: "XXXXYYYZZZ",
			forceBuild: true,
			pageConfig: {
				project: {
					source: "http://test.com"
				}
			}
		};
		buildTemplatesPromise = build.templates(options);
		
		var data = {subject: "World", message: "hello"};
		var getCurrent = function(){
			return data;
		};
		
		
		Q.all([
			build.renderer(buildTemplatesPromise, options),
			build.helpers(buildTemplatesPromise, {}, options, getCurrent)
		]).then(function(results){

			var renderer = results[0];
			
			var result = renderer({
				subject: "World",
				src: "./index.js",
				type: "",
				line: "100"
			});
			
			assert.equal(result, "<html><h1>HELLO World</h1>\n\n<p>http://test.com/index.js#L100</p>\n</html>")
			done();
		},done).catch(done);
		
	});

	it("Does ignoreTemplateRender",function(done){
		var options = {
			templates: path.join(__dirname,"test","render_body_option"),
			dest: "XXXXYYYZZZ",
			forceBuild: true,
			ignoreTemplateRender: true,
			pageConfig: {
				project: {
					source: "http://test.com"
				}
			}
		};
		buildTemplatesPromise = build.templates(options);
		
		var data = {message: "this isnt doing anything"};
		var getCurrent = function(){
			return data;
		};

		Q.all([
			build.renderer(buildTemplatesPromise, options),
			build.helpers(buildTemplatesPromise, {}, options, getCurrent)
		]).then(function(results){

			var renderer = results[0];
			
			var result = renderer({body: "{{message}} stuff"});
			
			assert.equal(result, "<html><h1>{{message}} stuff</h1>\n<p>static</p></html>")
			done();
		},done).catch(done);
		
	});

});
