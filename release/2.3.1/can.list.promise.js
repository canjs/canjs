/*!
 * CanJS - 2.3.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 29 Oct 2015 18:42:07 GMT
 * Licensed MIT
 */

/*[global-shim-start]*/
(function (exports, global){
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
		modules[moduleName] = module && module.exports ? module.exports : result;
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
				eval("(function() { " + __load.source + " \n }).call(global);");
			}
		};
	});
})({},window)
/*can@2.3.1#list/promise/promise*/
define('can/list/promise/promise', [
    'can/util/can',
    'can/list/list'
], function (can) {
    var oldReplace = can.List.prototype.replace;
    can.List.prototype.replace = function (data) {
        var result = oldReplace.apply(this, arguments);
        if (can.isDeferred(data)) {
            can.batch.start();
            this.attr('state', data.state());
            this.removeAttr('reason');
            can.batch.stop();
            var self = this;
            var deferred = this._deferred = new can.Deferred();
            data.then(function () {
                self.attr('state', data.state());
                deferred.resolve(self);
            }, function (reason) {
                can.batch.start();
                self.attr('state', data.state());
                self.attr('reason', reason);
                can.batch.stop();
                deferred.reject(reason);
            });
        }
        return result;
    };
    can.each({
        isResolved: 'resolved',
        isPending: 'pending',
        isRejected: 'rejected'
    }, function (value, method) {
        can.List.prototype[method] = function () {
            return this.attr('state') === value;
        };
    });
    can.each([
        'then',
        'done',
        'fail',
        'always',
        'promise'
    ], function (name) {
        can.List.prototype[name] = function () {
            if (!this._deferred) {
                this._deferred = new can.Deferred();
                this._deferred.resolve(this);
            }
            return this._deferred[name].apply(this._deferred, arguments);
        };
    });
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();