// this loads traceur to make sure lib/clean_traceur_compile
var traceur = require('traceur');

var es62cjs = 		require("../lib/es6_cjs"),
	cjs2steal = 	require("../lib/cjs_steal"),
	amd2cjs = 		require("../lib/amd_cjs"),
	steal2amd =		require("../lib/steal_amd"),
	global2amd =	require("../lib/global_amd"),
	amd2amd = 		require("../lib/amd_amd"),
	cjs2amd =			require("../lib/cjs_amd"),
	fs = require("fs"),
	assert = require("assert"),
	transpile = require("../main"),
	generate = require("../lib/generate");

var isWin = /^win/.test(process.platform);

var extend = function(d, s) {
	for(var prop in s) {
		d[prop] = s[prop];
	}
	return d;
};

var convert = function(moduleName, converter, result, options, done, load){
	if(typeof options === "function") {
		load = done;
		done = options;
		options = {};
	}
	if(!load) {
		load = {};
	}

	fs.readFile(__dirname+"/tests/"+moduleName+".js", function(err, data){
		if(err) {
			assert.fail(err, null, "reading "+__dirname+"/tests/"+file+" failed");
		}
		load = extend({source: ""+data, address: __dirname+"/tests/"+moduleName+".js", name: moduleName}, load);
		var res = generate(converter(load, options)).code;
		assert.ok(res, "got back a value");

		fs.readFile(__dirname+"/tests/expected/"+result, function(err, resultData){
			if(err) {
				assert.fail(err, null, "reading "+__dirname+"/tests/expected/"+result+" failed");
			}

			if(isWin) {
				resultData = (""+resultData).replace(/[\n\r]/g, "");
				res = (""+res).replace(/[\n]/g, "");
			}

			assert.equal(""+res, ""+resultData,"expected equals result");
			done()
		});
	});
};

var doTranspile = function(moduleName, format, result, resultFormat, options, done){
	if(typeof options === "function") {
		done = options;
		options = {};
	}
	fs.readFile(__dirname+"/tests/"+moduleName+".js", function(err, data){
		if(err) {
			assert.fail(err, null, "reading "+__dirname+"/tests/"+file+" failed");
		}
		var res = transpile.to({
			source: ""+data,
			address: __dirname+"/tests/"+moduleName+".js",
			name: moduleName,
			metadata: {format: format}
		}, resultFormat, options);
		assert.ok(res, "got back a value");

		fs.readFile(__dirname+"/tests/expected/"+result, function(err, resultData){
			if(err) {
				assert.fail(err, null, "reading "+__dirname+"/tests/expected/"+result+" failed");
			}
			var code = res.code;
			if(options.sourceMaps) {
				code += " //# sourceMappingURL="+result+".map";
			}

			if(isWin) {
				resultData = (""+resultData).replace(/[\n\r]/g, "");
				code = (""+code).replace(/[\n]/g, "");
			}

			assert.equal(""+code,""+resultData,"expected equals result");

			if(!options.sourceMaps) {
				done();
				return;
			}
			fs.readFile(__dirname+"/tests/expected/"+result+".map", function(err, expectedMap){
				if(err) {
					assert.fail(err, null, "reading "+__dirname+"/tests/expected/"+result+".map failed");
				}

				var resultMap = res.map+"";

				if(isWin) {
					resultMap = resultMap.replace(/\\r/g, "");
				}

				assert.equal(resultMap, expectedMap+"", "expected map equals result");
				done();
			});
		});
	});
};

describe('es6 - cjs', function(){
	it('should work', function(done){
		convert("es6", es62cjs, "es6_cjs.js", done);
	});

	it('works if global.System is something else (#14)', function(done){
		global.System = {};
		convert("es6",es62cjs,"es6_cjs.js", done);
	});

	it('works with babel', function(done){
		convert("es6", es62cjs, "es6_cjs_babel.js", {
			transpiler: "babel"
		}, done);
	});
});

describe('cjs - steal', function(){
    it('should work', function(done){
		convert("cjs",cjs2steal,"cjs_steal.js", done);
    });
    it('should work with objects', function(done){
		convert("cjs2",cjs2steal,"cjs2_steal.js", done);
    });
	it('should work with npm names', function(done){
		convert("cjs_npm", cjs2steal,"cjs_npm_steal.js", done);
	});
});

describe('amd - cjs', function(){
    it('should work', function(done){
		convert("amd",amd2cjs,"amd_cjs.js", done);
    });
});

describe('steal - amd', function(){
    it('should work', function(done){
		convert("steal",steal2amd,"steal_amd.js", done);
    });

    it('should work with namedDefines', function(done){
		convert("steal",steal2amd,"steal_amd_named_defines.js", {namedDefines: true}, done);
    });

    it('should leave nested steals alone', function(done){
		convert("nested_steal",steal2amd,"nested_steal_amd.js", done);
    });
});

describe('global - amd', function(){
    it('should work', function(done){
		var load = { metadata: { format: "global", exports: "GLOBAL" } };
		convert("global",global2amd,"global_amd.js", {}, done, load);
    });

	it("should include the export name", function(done){
		var load = {
			metadata: {
				format: "global",
				deps: ["foo"],
				exports: "GLOBAL"
			}
		};
		convert("global", global2amd, "global_amd_export.js", {}, done, load);
	});

	it("if no export is defined do not pass the exportname", function(done){
		var load = {
			metadata: {
				format: "global",
				deps: []
			}
		};
		convert("global", global2amd, "global_amd_noexport.js", {}, done, load);
	});

	it("exports: false passes the value false", function(done){
		var load = {
			metadata: {
				format: "global",
				exports: false
			}
		};
		convert("global", global2amd, "global_amd_exportfalse.js", {}, done, load);
	});

	it("works with an init function passed", function(done){
		var load = {
			metadata: {
				format: "global",
				init: function(){
					return window.FOO;
				}
			}
		};
		convert("global", global2amd, "global_amd_init.js", {}, done, load);
	});
});

describe("transpile", function(){

	it('able to steal to cjs', function(){
		var res = transpile.able("steal","cjs");
		assert.deepEqual(res,["steal","amd"]);
    });

	it('able to steal to amd', function(){
		var res = transpile.able("steal","amd");
		assert.deepEqual(res,["steal"]);
    });

    it('able to es6 to amd', function(){
		var res = transpile.able("es6","amd");
		assert.deepEqual(res,["es6"]);
    });

	it('to steal to cjs', function(done){
		doTranspile("steal","steal","steal_cjs.js","cjs", done);
    });

	it('able to global to amd', function(done){
		doTranspile("global","global","global_amd_with_format.js","amd", done);
	});

	it('able to steal to cjs with missing args', function(done){

		doTranspile("steal_no_value_arg","steal","steal_no_value_arg_cjs.js","cjs",done);
	});
});


describe('amd - amd', function(){
	it('should work', function(done){
		convert("amd",amd2amd,"amd_amd.js", {namedDefines: true},done);
	});

	it("works with transpile", function(done){
		doTranspile("amd","amd","amd_amd.js","amd",{namedDefines: true}, done);
	});

	it('should work with a normalizeMap', function(done){
		var options = {
			normalizeMap: {
				'./baz': 'baz'
			},
			namedDefines: true
		};
		convert("amd_deps",amd2amd,"amd_deps.js", options, done);
	});

	it("should rename the define name if able", function(done){
		convert("amd_named",amd2amd,"amd_named_amd.js", {namedDefines: true},done,{
			name: "redefined"
		});
	});
});

describe('metadata.format', function(){
	it("should be detected from amd source", function(done){
		doTranspile("amd",undefined,"amd_amd.js","amd", {namedDefines: true}, done);
    });
	it("should be detected from steal source", function(done){
		doTranspile("steal",undefined,"steal_cjs.js","cjs", done);
    });
    it('should be detected from es6 source', function(done){
		doTranspile("es6",undefined,"es6_cjs.js", "cjs", done);
    });
});

describe('es6 - amd', function(){
	it("should work with bangs", function(done){
		doTranspile("es_with_bang", "es6", "es_with_bang_amd.js", "amd",
					{ namedDefines: true },  done);
	});

	it("should work with babel", function(done){
		doTranspile("es6", "es6", "es6_amd_babel.js","amd", {
			transpiler: "babel"
		}, done);
	});

	it("should work with babel in loose mode", function(done){
		doTranspile("es6", "es6", "es6_amd_babel_loose_mode.js","amd", {
			transpiler: "babel",
			babelOptions: {
				loose: "es6.modules"
			}
		}, done);
	});

	it("should work with traceurOptions", function(done){
		doTranspile("es6", "es6", "es_with_traceur_options.js", "amd", {
			traceurOptions: {
				properTailCalls: true
			}
		},  done);
	});
});

describe('cjs - amd', function(){
	it("should work with relative dependencies", function(done){
		var options = {
			normalizeMap: {
				'./b': 'b'
			}
		};

		convert("cjs_deps", cjs2amd, "cjs_deps.js", options, done);
	});
	it('should be able to add named defines',function(done){

		var options = {
			normalizeMap: {
				'./b': 'b'
			},
			namedDefines: true
		};

		convert("cjs_deps", cjs2amd, "cjs_deps_named_defines.js", options, done);
	});
	it('converts a module that uses global', function(done){
		convert("cjs_global", cjs2amd, "cjs_global.js", done);
	});
	it('converts a module that uses global without dot operator', function(done){
		convert("cjs_global_without_dot", cjs2amd, "cjs_global_without_dot.js", done);
	});
	it('converts a module that uses __dirname', function(done){
		convert("cjs_dirname", cjs2amd, "cjs_dirname.js", done);
	});
	it('converts a module that uses global and __dirname', function(done){
		convert("cjs_global_dirname", cjs2amd, "cjs_global_dirname.js", done);
	});
});

describe('normalize options', function(){
	it('steal - amd + normalizeMap', function(done){
		var options = {
			normalizeMap: {
				'./baz': 'baz'
			},
			namedDefines: true
		};
		convert("steal_deps",steal2amd,"steal_amd_dep.js", options, done);
	});
	it('steal - amd + normalize',function(done){
		convert("steal_deps",steal2amd,"steal_amd_normalize.js", {
			normalizeMap: {
				'./baz': 'baz'
			},
			normalize: function(name){
				var parts = name.split("/"),
					len = parts.length;
				if( parts[len-1] === parts[len-2] ) {
					parts.pop();
				}
				return parts.join("/");
			},
			namedDefines: true
		}, done);
	});

	it('es6 - cjs + normalize',function(done){

		convert("es_needing_normalize",es62cjs,"es_needing_normalize_cjs.js", {
			normalize: function(name){

				if(name.lastIndexOf("/") === name.length - 1) {
					var parts = name.split("/");
					parts[parts.length - 1] =  parts[parts.length - 2];
					return parts.join("/");
				} else if( name.indexOf("!") >= 0 ) {
					return name.substr(0, name.indexOf("!") );
				}
				return name;
			}
		}, done);

	});

	it('amd - cjs + normalize',function(done){

		convert("amd_needing_normalize",amd2cjs,"amd_needing_normalize_cjs.js", {
			normalize: function(name){

				if(name.lastIndexOf("/") === name.length - 1) {
					var parts = name.split("/");
					parts[parts.length - 1] =  parts[parts.length - 2];
					return parts.join("/");
				} else if( name.indexOf("!") >= 0 ) {
					return name.substr(name.indexOf("!")+1);
				}
				return name;
			}
		}, done);

	});

	it('steal - cjs + normalize',function(done){

		doTranspile("steal_needing_normalize","steal","steal_needing_normalize_cjs.js","cjs", {
			normalize: function(name){
				return name+"-normalized";
			}
		},done);

	});

	it("cjs - cjs + normalize", function(done){
		doTranspile("cjs_needing_normalize", "cjs", "cjs_needing_normalize_cjs.js", "cjs", {
			normalize: function(name){
				return name + "-normalized";
			}
		}, done);
	});

});

describe("transpile options", function(){
	it("es6 - cjs + normalize",function(done){
		var options = {
			transpile: function(source, compileOptions, options){
				return {
					code: 'require("foo")'
				};
			}
		};

		convert("es_needing_normalize",es62cjs,"es_self_transpile.js", options,
				done);
	});

});

describe("Source Maps", function(){
	var normal = { sourceMaps: true };
	var content = { sourceMaps: true, sourceMapsContent: true };
	[normal, content].forEach(function(opts) {
		opts.baseURL = __dirname + "/tests";
		opts.sourceRoot = "../";
	});

	describe("External file", function(){
		it("steal - amd works", function(done){
			doTranspile("steal", "steal", "steal_amd_sm.js", "amd", normal, done);
		});

		it("steal - cjs works", function(done){
			doTranspile("steal", "steal", "steal_cjs_sm.js", "cjs", normal, done);
		});

		it("cjs - amd works", function(done){
			doTranspile("cjs", "cjs", "cjs_amd_sm.js", "amd", normal, done);
		});

		it("amd - cjs works", function(done){
			doTranspile("amd", "amd", "amd_cjs_sm.js", "cjs", normal, done);
		});

		it("amd - amd works", function(done){
			doTranspile("amd", "amd", "amd_amd_sm.js", "amd", normal, done);
		});

		it("es6(traceur) - amd works", function(done){
			doTranspile("es6", "es6", "es6_amd_sm.js", "amd", normal, done);
		});

		it("es6(babel) - amd works", function(done){
			var opts = extend({ transpiler: "babel" }, normal);
			doTranspile("es6", "es6", "es62_amd_sm.js", "amd", opts, done);
		});

		it("es6(traceur) - cjs works", function(done){
			doTranspile("es6", "es6", "es6_cjs_sm.js", "cjs", normal, done);
		});

		it("es6(babel) - cjs works", function(done){
			var opts = extend({ transpiler: "babel" }, normal);
			doTranspile("es6", "es6", "es62_cjs_sm.js", "cjs", opts, done);
		});
	});

	describe("Content included", function(){
		it("steal - amd works", function(done){
			doTranspile("steal", "steal", "steal_amd_cont_sm.js", "amd", content, done);
		});

		it("steal - cjs works", function(done){
			doTranspile("steal", "steal", "steal_cjs_cont_sm.js", "cjs", content, done);
		});

		it("amd - cjs works", function(done){
			doTranspile("amd", "amd", "amd_cjs_cont_sm.js", "cjs", content, done);
		});

		it("es6(traceur) - amd works", function(done){
			doTranspile("es6", "es6", "es6_amd_cont_sm.js", "amd", content, done);
		});

		it("es6(babel) - amd works", function(done){
			var opts = extend({ transpiler: "babel" }, content);
			doTranspile("es6", "es6", "es62_amd_cont_sm.js", "amd", opts, done);
		});

	});
});
