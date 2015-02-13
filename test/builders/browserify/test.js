/**
 * Test that the dist works
 */
var assert = require("assert"),
	Browser = require("zombie"),
	connect = require("connect"),
	path = require("path"),
	rmdir = require("rimraf");
	
var browserify = require('browserify');
var fs = require('fs'), path = require("path");


// Helpers
var find = function(browser, property, callback, done){
	var start = new Date();
	var check = function(){
		if(browser.window && browser.window[property]) {
			callback(browser.window[property]);
		} else if(new Date() - start < 2000){
			setTimeout(check, 20);
		} else {
			done("failed to find "+property+" in "+browser.window.location.href);
		}
	};
	check();
};

var open = function(url, callback, done){
	var server = connect().use(connect.static(path.join(__dirname,"../../.."))).listen(8081);
	var browser = Browser.create();
	browser.visit("http://localhost:8081/"+url)
		.then(function(){
			callback(browser, function(err){
				server.close();
				done(err);
			})
		}).catch(function(e){
			server.close();
			done(e)
		});
};


describe("browserify", function(){
	it("is able to build an app that does not use templates", function(done){
		this.timeout(10000);
		var b = browserify();
		b.add(path.join(__dirname, "main.js"));
		var out = fs.createWriteStream(path.join(__dirname, "out.js"));
		b.bundle().pipe(out);
		out.on('finish', function(){
			open("test/builders/browserify/prod.html", function(browser, close) {
				find(browser, "PAGE_READY", function(m){
					var helloWorld = browser.document.getElementsByTagName("hello-world")[0];
					assert.equal(helloWorld.innerHTML, "Hello World", "right text");
					close();
				}, close);
			}, done);
		});
		
	});
});

