/*[global-shim-start]*/
(function(exports, global, doEval){ // jshint ignore:line
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var set = function(name, val){
		var parts = name.split("."),
			cur = global,
			i, part, next;
		for(i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if(!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var useDefault = function(mod){
		if(!mod || !mod.__esModule) return false;
		var esProps = { __esModule: true, "default": true };
		for(var p in mod) {
			if(!esProps[p]) return false;
		}
		return true;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		result = module && module.exports ? module.exports : result;
		modules[moduleName] = result;

		// Set global exports
		var globalExport = exports[moduleName];
		if(globalExport && !get(globalExport)) {
			if(useDefault(result)) {
				result = result["default"];
			}
			set(globalExport, result);
		}
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				doEval(__load.source, global);
			}
		};
	});
}
)({"can-namespace":"can"},window,function(__$source__, __$global__) { // jshint ignore:line
	eval("(function() { " + __$source__ + " \n }).call(__$global__);");
}
)
/*can-namespace@1.0.0#can-namespace*/
define('can-namespace', function (require, exports, module) {
    module.exports = {};
});
/*can-ndjson-stream@0.1.5#can-ndjson-stream*/
define('can-ndjson-stream', function (require, exports, module) {
    var namespace = require('can-namespace');
    var ndjsonStream = function (response) {
        var is_reader, cancellationRequest = false;
        return new ReadableStream({
            start: function (controller) {
                var reader = response.getReader();
                is_reader = reader;
                var decoder = new TextDecoder();
                var data_buf = '';
                reader.read().then(function processResult(result) {
                    if (result.done) {
                        if (cancellationRequest) {
                            return;
                        }
                        data_buf = data_buf.trim();
                        if (data_buf.length !== 0) {
                            try {
                                var data_l = JSON.parse(data_buf);
                                controller.enqueue(data_l);
                            } catch (e) {
                                controller.error(e);
                                return;
                            }
                        }
                        controller.close();
                        return;
                    }
                    var data = decoder.decode(result.value, { stream: true });
                    data_buf += data;
                    var lines = data_buf.split('\n');
                    for (var i = 0; i < lines.length - 1; ++i) {
                        var l = lines[i].trim();
                        if (l.length > 0) {
                            try {
                                var data_line = JSON.parse(l);
                                controller.enqueue(data_line);
                            } catch (e) {
                                controller.error(e);
                                cancellationRequest = true;
                                reader.cancel();
                                return;
                            }
                        }
                    }
                    data_buf = lines[lines.length - 1];
                    return reader.read().then(processResult);
                });
            },
            cancel: function (reason) {
                console.log('Cancel registered due to ', reason);
                cancellationRequest = true;
                is_reader.cancel();
            }
        });
    };
    module.exports = namespace.ndjsonStream = ndjsonStream;
});
/*[global-shim-end]*/
(function(){ // jshint ignore:line
	window._define = window.define;
	window.define = window.define.orig;
}
)();