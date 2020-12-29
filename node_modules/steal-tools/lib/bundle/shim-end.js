function(global) { // jshint ignore:line
	global._define = global.define;
	global.define = global.define.orig;
}
