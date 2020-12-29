var generate = require("../generate"),
	assert = require("assert");
	rmdir = require('rimraf'),
	Browser = require("zombie"),
	connect = require("connect"),
	path = require("path"),
	slash = require("../../slash");
	
// Helpers
var find = function(browser, property, callback, done){
	var start = new Date();
	var check = function(){
		if(browser.window && browser.window[property]) {
			callback(browser.window[property]);
		} else if(new Date() - start < 2000){
			setTimeout(check, 20);
		} else {
			done("failed to find "+property);
		}
	};
	check();
};

var open = function(url, callback, done){
	var server = connect().use(connect.static(path.join(__dirname))).listen(8081);
	var browser = new Browser();
	browser.visit("http://localhost:8081/"+url)
		.then(function(){
			callback(browser, function(){
				server.close();
				done();
			})
		}).catch(function(e){
			server.close();
			done(e)
		});
};
	
describe("documentjs/lib/generate/generate",function(){
	
	it("works",function(done){
		this.timeout(30000);
		rmdir(__dirname+"/out",function(error){
		
			generate({
				glob: slash( path.join(__dirname,"example") )+"/*.js",
				dest: path.join(__dirname,"out"),
				parent: "mylib",
				forceBuild: true,
				minifyBuild: false
			}).then(function(){
				open("out/Foo.html",function(browser, close){
					var code = browser.window.document.getElementsByTagName("code")[0];
					assert.ok( /prettyprinted/.test(code.className), "code blocks added" )
					close();
				},done);
				
			}, done);
		
		});
		
	});
	
	it("@outline works", function(done){
		generate({
			glob: __dirname+"/example/*.js",
			dest: __dirname+"/out",
			parent: "mylib",
			forceBuild: true,
			minifyBuild: false
		}).then(function(){
			open("out/index.html",function(browser, close){
				var code = browser.window.document.getElementsByClassName("contents")[0];
				var lis = code.getElementsByTagName("li")
				assert.equal( lis.length, 5, "outline added "+lis.length );
				close();
			},done);
			
		}, done);
	});
	
});


