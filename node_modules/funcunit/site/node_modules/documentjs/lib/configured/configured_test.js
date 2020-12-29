var configured = require("./configured"),
	assert = require("assert"),
	path = require("path"),
	fs = require("fs");


var Browser = require("zombie"),
	connect = require("connect"),
	rmdir = require('rimraf');


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
var waitFor = function(browser, checker, callback, done){
	var start = new Date();
	var check = function(){
		if(checker(browser.window)) {
			callback(browser.window);
		} else if(new Date() - start < 2000){
			setTimeout(check, 20);
		} else {
			done(new Error("checker was never true"));
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
			})
		}).catch(function(e){
			server.close();
			done(e)
		});
};


describe("lib/configured", function(){

	it(".getProject is able to get a github url", function(done){
		this.timeout(20000);

		rmdir(path.join(__dirname,"test","tmp"), function(e){

			if(e){
				done(e)
			} else {
				configured.getProject({
					source: "git://github.com/bitovi/comparify#master",
					path: path.join(__dirname,"test","tmp","comparify")
				}).then(function(){
					fs.exists(
						path.join(__dirname, "test","tmp" , "comparify","package.json"),
						function(exists){
							assert.ok(exists, "comparify exists");
							done();
						});
				},done);
			}

		});

	});

	it(".getProject is able to get a folder", function(done){
		this.timeout(10000);
		configured.getProject({
			source: path.join(__dirname,"test","example_project"),
			path: path.join(__dirname,"test","tmp","example_project")
		}).then(function(){
			fs.exists(
				path.join(__dirname, "test","tmp" , "example_project"),
				function(exists){
					assert.ok(exists, "example_project exists");
					done();
				});
		},done);
	});

	it(".getProject is able to get a github url and npm install specific dependencies", function(done){
		// really long timeout incase github is slow
		this.timeout(240000);

		rmdir(path.join(__dirname,"test","tmp"), function(e){

			if(e){
				done(e)
			} else {
				configured.getProject({
					source: "git://github.com/bitovi/canjs#minor",
					path: path.join(__dirname,"test","tmp","canjs"),
					npmInstall: ["stealjs/steal#master"]
				}).then(function(){
					fs.exists(
						path.join(__dirname, "test","tmp" , "canjs","node_modules","steal","package.json"),
						function(exists){
							assert.ok(exists, "steal exists");
							done();
						});
				},done);
			}

		});
	});


	it(".geneateProject is able to read the documentjs.json without versions and build a site", function(done){
		this.timeout(10000);
		rmdir(path.join(__dirname,"test","api"), function(e){
			if(e) {
				done(e);
			}

			configured.generateProject({path: path.join(__dirname,"test","example_project")}).then(function(){
				if(fs.existsSync(path.join(__dirname,"test","api","index.html"))) {
					done();
				} else {
					done(new Error("test/api/index.html does not exist"));
				}
			},done);
		});


	});

	it(".geneateProject is able to take a docObject instead of reading one", function(done){
		this.timeout(10000);
		rmdir(path.join(__dirname,"test","tmp","example_project"), function(e){
			if(e) {
				done(e);
			}

			configured.generateProject({
				path: path.join(__dirname,"test","example_project"),
				docConfig: {
					"sites": {
						"api": {
							"parent": "mylib",
							"dest": "../tmp/example_project/api"
						}
					}
				}
			}).then(function(){
				if(fs.existsSync(path.join(__dirname,"test","tmp","example_project","api","index.html"))) {
					done();
				} else {
					done(new Error("test/api/index.html does not exist"));
				}
			},done);
		});


	});


	it(".generateProject is able to document multiple versions", function(done){
		// switch from old to old
		var check1 = function(next, done){
			open("test/tmp/multiple_versions/1.0.0/api/index.html",function(browser, close){
				var select = browser.window.document.getElementsByTagName("select")[0],
					$ = browser.window.$;
					$(select).val("3.0.0").trigger("change");

					waitFor(browser, function(window){
						return window.location.href == "http://localhost:8081/test/tmp/multiple_versions/3.0.0/api/index.html"
					}, function(){
						assert.ok(true,"updated page");
						close();
						next();
					}, close);

			},done);
		};
		// switch from new to old
		var check2 = function(next, done){
			open("test/tmp/multiple_versions/api/index.html",function(browser, close){
				var select = browser.window.document.getElementsByTagName("select")[0],
					$ = browser.window.$;
					$(select).val("3.0.0").trigger("change");

					waitFor(browser, function(window){
						return window.location.href == "http://localhost:8081/test/tmp/multiple_versions/3.0.0/api/index.html"
					}, function(){
						assert.ok(true,"updated page");
						close();
						next();
					}, close);

			},done);
		};
		// check old to new
		var check3 = function(next, done){
			open("test/tmp/multiple_versions/3.0.0/api/index.html",function(browser, close){
				var select = browser.window.document.getElementsByTagName("select")[0],
					$ = browser.window.$;
					$(select).val("2.0.0").trigger("change");

					waitFor(browser, function(window){
						return window.location.href == "http://localhost:8081/test/tmp/multiple_versions/api/index.html"
					}, function(){
						assert.ok(true,"updated page");
						close();
						next();
					}, close);

			},done);
		};

		this.timeout(240000);
		rmdir(path.join(__dirname,"test","tmp","multiple_versions"), function(e){
			if(e) {
				done(e);
			}

			configured.generateProject({path: __dirname+"/test/multiple_versions"}).then(function(){
				check1(function(){
					check2(function(){
						check3(done, done);
					}, done);
				}, done);
			},done);
		});
	});

	it(".generateProject is able to build when passed a version's branch name", function(done){
		this.timeout(60000);
		rmdir(path.join(__dirname,"test","tmp","multiple_versions"), function(e){
			if(e) {
				done(e);
			}

			configured.generateProject({path: __dirname+"/test/multiple_versions"}, undefined, {only:[{name:"master"}]}).then(function(){
				open("test/tmp/multiple_versions/api/index.html",function(browser, close){
					assert.ok(true,"page built and opened");
					done();
					close();
				},done);
			},done);
		});
	});


	it(".generateProject is able to build something without a documentjs.json", function(done){
		this.timeout(10000);
		rmdir(path.join(__dirname,"test","docs"), function(e){
			if(e) {
				done(e);
			}

			configured.generateProject({path: __dirname+"/test/no_config"}).then(function(){
				if(fs.existsSync(path.join(__dirname,"test","docs","Ignored.html"))) {
					done(new Error("test/docs/Ignored.html exists"));
				} else if(!fs.existsSync(path.join(__dirname,"test","docs","index.html"))) {
					done(new Error("test/docs/index.html does not exist"));
				} else {
					done();
				}

			},done);
		});


	});


	it("sites can be on projects", function(done){

		this.timeout(10000);
		rmdir(path.join(__dirname,"test","tmp","project_sites"), function(e){
			if(e) {
				done(e);
			}

			configured.generateProject({path: __dirname+"/test/project_sites"}).then(function(){
				if(!fs.existsSync(path.join(__dirname,"test","tmp","project_sites","api","index.html"))) {
					done(new Error("test/tmp/project_sites/api/index.html does not exist"));
				} else if(fs.existsSync(path.join(__dirname,"test","tmp","project_sites","docs","index.html"))) {
					done(new Error("test/tmp/project_sites/docs/index.html exists"));
				} else {
					done();
				}

			},done);
		});
	});

	it("is able to change where versions is located", function(done){
		this.timeout(10000);
		var check = function(done){
			open("test/tmp/version_placement/1.0.0/api/index.html",function(browser, close){
				var option = browser.window.document.getElementsByTagName("option")[0];

				assert.equal(option.text || option.textContent, "Project 1.0.0");

				close();
				done();

			},done);
		};


		rmdir(path.join(__dirname,"test","tmp","version_placement"), function(e){
			if(e) {
				done(e);
			}

			configured.generateProject({path: __dirname+"/test/version_placement"}).then(function(){
				check(done);
			},done);
		});


	});

	it("is able to import other tags", function(done){
		this.timeout(20000);
		// check that docObjects has a returns
		var check = function(done){
			open("test/tmp/custom_tags/index.html",function(browser, close){

				var rets = browser.window.document.getElementsByClassName("returns")

				assert.ok(rets.length, "has a returns object")

				close();
				done();

			},done);
		};


		rmdir(path.join(__dirname,"test","tmp","custom_tags"), function(e){
			if(e) {
				done(e);
			}
			configured.generateProject({path: __dirname+"/test/custom_tags"}).then(function(){
				check(done);
			},done);
		});

	});

	it(".getProject is able to get a github url and npm install package.json's docDependencies", function(done){
		this.timeout(20000);

		rmdir(path.join(__dirname,"test","tmp"), function(e){

			if(e){
				done(e)
			} else {
				configured.getProject({
					source: "git://github.com/documentjs/docjs-test-npm-dev-deps#master",
					path: __dirname+"/test/tmp/docjs-test-npm-dev-deps"
				}).then(function(){
					fs.exists(
						path.join(__dirname, "test","tmp" , "docjs-test-npm-dev-deps","node_modules","can-set","package.json"),
						function(exists){
							assert.ok(exists, "can-set exists");
							done();
						});
				},done);
			}

		});
	});



});
