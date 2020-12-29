"use strict";
module.exports = {
	makeStateChecker: function(assert, done, names){

		return {
			check: function(assert, value){
				var state = names.shift();
				assert.equal( state, value, "state check "+state );
				if(state !== value) {
					done();
				}
				return state;
			},
			get: function(){
				return names[0];
			},
			next: function(){
				return names.shift();
			},
			toString: function(){
				return this.get();
			}
		};



	},
	later: function(fn){
		return function(){
			setTimeout(fn, 1);
		};
	},
	logErrorAndStart: function(assert, done) {
		return function(e) {
			assert.ok(false,"Error "+e);
			setTimeout(function(){
				throw e;
			},1);
			done();
		};
	},
	getId: function(o){
		return o.id;
	},
	asyncResolve: function(data) {
		var def = new Promise(function(resolve){
			setTimeout(function(){
				resolve(data);
			},1);
		});
		return def;
	},
	asyncReject: function(data) {
		var def = new Promise(function(resolve, reject){
			setTimeout(function(){
				reject(data);
			},1);
		});
		return def;
	}

};
