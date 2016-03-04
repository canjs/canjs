var assert = require("assert"),
	Browser = require("zombie"),
	connect = require("connect"),
	stealTools = require("steal-tools"),
	path = require("path"),
	rmdir = require("rimraf"),
	fs = require("fs");

var exists = function(dest){
	try {
		return !!fs.readFileSync(dest, "utf8");
	} catch(err){
		return false;
	}
};

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
	var browser = new Browser();
	browser.visit("http://localhost:8081/"+url)
		.then(function(e){
			callback(browser, function(err){
				server.close();
				done(err);
			})
		}).catch(function(e){
			server.close();
			done(e)
		});
	return browser;
};

describe("Building steal projects", function(){
	this.timeout(20000);

	it("works with stache", function(done){
			rmdir(__dirname+"/bundles", function(error){
				if(error){
					done(error)
				}
				// build the project that
				// uses a plugin
				stealTools.build({
					config: __dirname+"/config.js",
					main: "app"
				}, {
					minify: false,
					quiet: true
				}).then(function(){
					open("test/builders/steal-tools/prod.html", function(browser, close) {
						find(browser, "MODULE", function(m){
							var div = browser.document.createElement('div');
							div.appendChild(m.stache);

							assert.equal(div.getElementsByTagName('h1')[0].textContent, "Stache HI", "Stache generated correctly");
							close();
						}, close);
					}, done);
				}).catch(done);
			});
	});

	it("works with bundles", function(done){
		rmdir(__dirname + "bundle/dist", function(error){
			if(error) return done(error);

			stealTools.build({
				config: __dirname + "/bundle/config.js",
				main: "main"
			}, {
				quiet: true,
				minify: false
			}).then(function(){

				open("test/builders/steal-tools/bundle/prod.html", function(browser, close){
					find(browser, "MODULE", function(m){
						assert(typeof m, "object", "Correctly returned the module");
						assert.equal(m.html, "Main", "Rendered the div correctly");
						close();
					}, close);
				}, done);
			}).catch(done);
		});
	});

	it("works bundled with autorender", function(done){
		rmdir(__dirname + "bundle/dist", function(error){
			if(error) return done(error);

			stealTools.build({
				config: __dirname + "/config.js",
				main: "app"
			}, {
				quiet: true,
				minify: false,
				bundleSteal: true
			}).then(function(){

				var browser = open("test/builders/steal-tools/prod-bundled.html", function(browser, close){
					// If we got here it worked.
					close();
				}, done);
				browser.on("response", function(req, resp){
					if(resp.statusCode === 404) {
						done(new Error("Tried to load " + resp.url));
					}
				});
			}).catch(done);
		});
	});

	it("adds dynamically imported modules to the bundle", function(done){
		rmdir(__dirname + "/import/dist", function(error){
			if(error) return done(error);

			stealTools.build({
				config: __dirname + "/config.js",
				main: "import/app",
				bundlesPath: __dirname + "/import/dist/bundles"
			}, {
				quiet: true,
				minify: false,
				bundleSteal: true
			}).then(function(buildResult){
				var loader = buildResult.loader;
				assert.equal(loader.bundle[0], "import/thing", "import/thing added a bundle");

				assert(exists(__dirname + "/import/dist/bundles/import/thing.js"), "thing.js bundle written out");

				done();
			});
		});
	});


});
