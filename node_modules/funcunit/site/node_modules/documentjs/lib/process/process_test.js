var process = require("./process"),
	tnd = require("../tags/helpers/typeNameDescription"),
	getParent = require("../tags/helpers/getParent"),
	assert = require("assert"),
	tags = require("../tags/tags"),
	Handlebars = require("handlebars"),
	finalizeDocMap = require("./finalize_doc_map"),
	fs = require("fs"),
	path = require("path");


	var propertyTag = {
		codeMatch: function( code ) {
			return code.match(/(\w+)\s*[:=]\s*/) && !code.match(/(\w+)\s*[:=]\s*function\(([^\)]*)/);
		},
		code: function( code, scope, docMap ) {
			var parts = code.match(/(\w+)\s*[:=]\s*/);
			if ( parts ) {
				var parentAndName = getParent.andName({
					parents: "*",
					useName: ["constructor","static","prototype","function"],
					scope: scope,
					docMap: docMap,
					name: parts[1]
				});
				return {
					name: parentAndName.name,
					parent: parentAndName.parent,
					type: "property"
				};
			}
		},
		add: function(line, curData, scope, docMap){
			var data = tnd(line);
			this.types = data.types
			this.description = data.description;

			var parentAndName = getParent.andName({
				parents: "*",
				useName: ["constructor","static","prototype","function"],
				scope: scope,
				docMap: docMap,
				name: data.name
			});
			this.name = parentAndName.name;
			this.parent = parentAndName.parent;
			this.type = "property";
		},
		parentTypes: ["constructor"],
		useName: true
	};

	describe("documentjs/lib/process", function(){


		describe(".comment", function(){
			
			it("adds to parent",function(){
				var docMap = {Foo: {name: "Foo",type: "constructor"}};
	
				process.comment({
					comment: "@property {Object} tags Tags for something",
					scope: docMap.Foo,
					docMap: docMap,
					docObject: {},
					tags: {property: propertyTag}
				},function(newDoc, newScope){
					assert.equal(newScope, docMap.Foo, "same scope scope");
					assert.equal(newDoc.name, "Foo.tags");
				});
			});
	
			it("change scope", function(){
				var tags = {
					constructor: {
						add : function(){
							this.name = "constructed";
							this.type = "constructor";
							return ["scope",this];
						}
					},
					parent: {
						add: function(){
							this.parent = "parented"
						}
					},
					property: propertyTag
				};
	
				var docMap = {Foo: {name: "Foo",type: "constructor"}},
					props = {};
	
				process.comment({
					comment:   ["@constructor",
								"@parent tang"],
					scope: docMap.Foo,
					docMap: docMap,
					docObject: props,
					tags: tags
				},function(newDoc, newScope){
					assert.equal(newDoc, newScope, "new doc item is new scope");
					assert.equal(newDoc, props, "props is the new doc object");
	
					assert.deepEqual(newDoc,{
						name: "constructed",
						type: "constructor",
						parent: "parented",
						body: "",
						description: ""
					});
				});
	
			});
			
			var example = {
				add: function(line){
					return {
						lines: []
					};
				},
				addMore: function(line, curData) {
					curData.lines.push(line);
				},
				end: function( curData ){
					this.body += "```\n"+curData.lines.join("\n")+"\n```\n";
				}
			};
			
			it("is able to end a current tag", function(){

				var docMap = {Foo: {name: "Foo",type: "constructor"}};
	
				process.comment({
					comment: [
						"@property {Object} tags Tags for something",
						"description",
						"",
						"body",
						"@example",
						"_.extend()",
						"@example",
						"_.clone()",
						"@body",
						"endbody"
					].join("\n"),
					scope: docMap.Foo,
					docMap: docMap,
					docObject: {},
					tags: {
						property: propertyTag, 
						example: example,
						body: {
							add: function( line ) {
								return ["default","body"];
							}
						}
					}
				},function(newDoc, newScope){
					assert.equal(newDoc.body, '\nbody\n```\n_.extend()\n```\n```\n_.clone()\n```\nendbody\n');
				});
				
			});
			
			it("ends a current tag that is the last tag",function(){
				var docMap = {Foo: {name: "Foo",type: "constructor"}};
	
				process.comment({
					comment: [
						"@property {Object} tags Tags for something",
						"description",
						"",
						"body",
						"@example",
						"_.extend()",
					].join("\n"),
					scope: docMap.Foo,
					docMap: docMap,
					docObject: {},
					tags: {
						property: propertyTag, 
						example: example,
						body: {
							add: function( line ) {
								return ["default","body"];
							}
						}
					}
				},function(newDoc, newScope){
					assert.equal(newDoc.body, '\nbody\n```\n_.extend()\n```\n');
				});
			});
			
			it("handles indentation", function(done){
				fs.readFile(
					path.join(__dirname,"test","indentation.md"), 
					function(err, content){
						
						if(err) {
							return done(err);
						}
						
						var docMap = {};
						
						process.comment({
							comment: ""+content,
							scope: {},
							docMap: docMap,
							docObject: {}
						},function(newDoc, newScope){
							
							var options = newDoc.params[0].types[0].options,
								func = options[0].types[0],
								returns = func.returns;
							
							// return indentation
							assert.deepEqual(returns.types[0], {type:"Boolean"},"return indented inside function option");
							assert.deepEqual(newDoc.returns.types[0], {type: "String"}, "not indented normal return still works");
							
							// option
							var barOptions = options[1].types[0].options;
							assert.deepEqual(barOptions, [
								{name: "first", types: [{type: "String"}], description: "\n"},
								{name: "second", types: [{type: "String"}], description: "\n"}
							]);
							
							// param
							assert.equal(func.params[0].description, "newName description.\n", "params in params");
							
							// context / @this
							assert.equal(func.context.description,"An object\na\n", "a description");
							
							done();
						});
						
					});
			});
		
		});
		

		it(".code",function(){
			var tags = {
				constructor: {
					codeMatch: /some constructor/,
					code: function(code, scope, objects){
						return {
							type: "constructor",
							name: "Bar"
						};
					},
					codeScope: true
				},
				property: propertyTag
			};
			var docMap = {Foo: {name: "Foo",type: "constructor"}};
			process.code({
				code: "some constructor",
				docMap: docMap,
				scope: docMap.Foo,
				tags: tags
			}, function(constructorDoc, constructorScope){
				assert.equal(constructorDoc, constructorScope, "scope is the constructor");

				process.code({
					code: "prop = 'something'",
					scope: constructorScope,
					docMap: docMap,
					tags: tags
				}, function(propDoc, propScope){
					assert.equal(propScope, constructorScope, "prop doesn't change scope");
					assert.equal(propDoc.name,"Bar.prop");
					assert.equal(propDoc.parent,"Bar");

				});

			});
		});
		
		

		var makeDescription = function( comment, cb ){
			var docMap = {Foo: {name: "Foo",type: "constructor"}},
				props = {};

			var tags = {
				constructor: {
					add : function(){
						this.name = "constructed";
					}
				}
			};

			process.comment({
				comment:   comment,
				scope: docMap.Foo,
				docMap: docMap,
				docObject: props,
				tags: tags
			},cb);
		};


		it("description",function(){

			makeDescription(
				["This is a description.",
				 "Another line."], function(newDoc){
					assert.equal(newDoc.description, "This is a description.\nAnother line.\n")
			});

		});


		it("description then body",function(){

			makeDescription(
				["This is a description.",
				 "Another line.",
				 "",
				 "the body"], function(newDoc){
					assert.equal(newDoc.description, "This is a description.\nAnother line.\n");

					assert.equal(newDoc.body, "\nthe body\n");
			});

		});
		// no longer works because @prototype is fixed, but not sure how to still errors this without creating
		// an evil tag
		/*it.only("process.file errors if name is changed", function(){
			assert.throws(function(){
				process.file("/** @constructor foo.bar *"+"/\n// \n/** @add foo.bar\n@prototype *"+"/",{},"foo.js");
			}, function(e){
				console.log(e);
				return e.message.indexOf("Changing name") >= 0;
			});
		});*/
		it("@prototype adds its own object", function(){
			var docMap = {};
			process.file("/** @constructor foo.bar *"+"/\n// \n/** @add foo.bar\n@prototype *"+"/",docMap,"foo.js");
			assert.ok(docMap["foo.bar"], "foo.bar exists");
			assert.ok(docMap["foo.bar.prototype"], "foo.bar.prototype exists");
		});

		it("processing mustache files", function(){
			var docMap = {};
			var originalRenderer = function(){};
			originalRenderer.layout = function(data){
				return data.content;
			};
			originalRenderer.Handlebars =Handlebars;
			process.file("{{name}}",docMap,"foo.mustache");
			assert.ok(docMap.foo.renderer, "got renderer");

			var result = docMap.foo.renderer(docMap.foo, originalRenderer);
			assert.equal(result,"foo", "got back holler");
		});

		it("end is not called twice", function(){
			var docMap = {};
			var timesCalled = 0;
			tags.foo = {done: function(){
				timesCalled++;
			}};
			process.file("/** @constructor foo.bar *"+"/\n// \n/** @add foo.bar *"+"/",docMap,"foo.js");

			assert.equal(timesCalled, 0, "done should only be called at the end");

			finalizeDocMap(docMap,tags);
			assert.equal(timesCalled, 1, "done should only be called at the end");

		});

		it("can document a module with multiple exports", function(done){
			fs.readFile(path.join(__dirname,"test","module_with_multiple_exports.js"), function(err, data){
				if(err) {
					return done(err);
				}
				var docMap = {};
				process.file(""+data,docMap,"utils/math.js");
				assert.ok(docMap["utils/math"], "got the module");
				assert.ok(docMap["utils/math.sum"], "got the sum docObject");
				assert.ok(docMap["utils/math.constants"], "got the constants docObject");

				done();
			});

		});

		it("can document a module that exports a single function", function(done){
			fs.readFile(path.join(__dirname,"test","module_with_single_export_function.js"), function(err, data){
				if(err) {
					return done(err);
				}
				var docMap = {};
				process.file(""+data,docMap,"utils/add.js");

				assert.equal(docMap["utils/add"].types[0].params[0].name, "first", "got a param");
				assert.equal(docMap["utils/add"].types[0].params[1].name, "second", "got a param");

				done();
			});
		});


		it("@function and @property assumes a parent name", function(done){
			fs.readFile(path.join(__dirname,"test","function_assumes_parent_name.js"), function(err, data){
				if(err) {
					return done(err);
				}
				var docMap = {};
				process.file(""+data,docMap,"utils/date-helpers.js");
				//console.log(docMap);
				assert.ok(docMap["util/date-helpers"], "date-helpers object");
				assert.ok(docMap["util/date-helpers.isTomorrow"], "util/date-helpers.isTomorrow object");
				assert.ok(docMap["util/date-helpers.isYesterday"], "util/date-helpers.isYesterday object");
				assert.ok(docMap["util/date-helpers.isNext"], "util/date-helpers.isNext object");

				assert.ok(docMap["util/date-helpers.tomorrow"], "util/date-helpers.tomorrow object");
				assert.ok(docMap["util/date-helpers.yesterday"], "util/date-helpers.yesterday object");
				assert.ok(docMap["util/date-helpers.next"], "util/date-helpers.next object");

				// assert parents
				assert.equal(docMap["util/date-helpers.isTomorrow"].parent ,"util/date-helpers", "util/date-helpers.isTomorrow parent");
				assert.equal(docMap["util/date-helpers.isYesterday"].parent ,"util/date-helpers", "util/date-helpers.isYesterday parent");
				assert.equal(docMap["util/date-helpers.isNext"].parent ,"util/date-helpers", "util/date-helpers.isNext parent");

				assert.equal(docMap["util/date-helpers.tomorrow"].parent ,"util/date-helpers", "util/date-helpers.tomorrow parent");
				assert.equal(docMap["util/date-helpers.yesterday"].parent ,"util/date-helpers", "util/date-helpers.yesterday parent");
				assert.equal(docMap["util/date-helpers.next"].parent ,"util/date-helpers", "util/date-helpers.next parent");


				done();
			});
		});
		
		it("process.getComments is able to get a comment directly after another comment (#62)", function(done){
			fs.readFile(path.join(__dirname,"test","comment_after_comment.js"), function(err, data){
				if(err) {
					return done(err);
				}
				var result = process.getComments(""+data);
				assert.deepEqual([
					{ comment: ["a",""], code: "", line: 0},
					{ comment: ["b",""], code: "", line: 3},
					{ comment: ["c "], code: "", line: 6},
					{ comment:  ["d",""], code: 'foo = "bar";', line: 8, codeLine: 11},
					{ comment:  ["e",""], code: '', line: 12}
				], result);
				done();
			});
			
		});

		it("process.file provides filename and line if available to tags", function(done){
			var count = 0;
			tags.filetest = {
				add: function(line, curData, scope, docMap){
					this.type = "filetest";
					this.name ="filetest"+(++count);
					assert.ok(this.src,"a src");
					assert.equal(typeof this.line, "number","a line");
				}
			};
			
			fs.readFile(path.join(__dirname,"test","filename_and_line.js"), function(err, data){
				if(err) {
					return done(err);
				}
				
				var docMap = {};
				process.file(""+data,docMap,"utils/date-helpers.js");
				done();
			});
			
		});
		
		
		it(".code keeps options.docObject's src and  line", function(done){
			var count = 0;
			tags.filetest = {
				add: function(line, curData, scope, docMap){
					this.type = "filetest";
					this.name ="filetest"+(++count);
					assert.ok(this.src,"a src");
					assert.ok(this.codeLine, "got the codeLine");
					assert.equal(typeof this.line, "number","a line");
				},
				codeMatch: function( code ) {
					return true;
				},
				code: function( code, scope, docMap ) {
					return {
						type: "filetest"
					};
				}
			};
			
			fs.readFile(path.join(__dirname,"test","filename_and_line.js"), function(err, data){
				if(err) {
					return done(err);
				}
				
				var docMap = {};
				process.file(""+data,docMap,"utils/date-helpers.js");
				done();
			});
		});

	});
