// Everything CanJS+jquery app needs to run to pass
// if you are doing almost everything with the can.util layer
var can = require('can/util/can');
var document = require('./document/document'); // jshint ignore:line

var global = can.global; // jshint ignore:line
global.document = document;
global.window = global;
global.addEventListener = function(){};
global.removeEventListener = function(){};
global.navigator = {
	userAgent: "",
	platform: "",
	language: "",
	languages: [],
	plugins: [],
	onLine: true
};
global.location = {
	href: '',
	protocol: '',
	host: '',
	hostname: '',
	port: '',
	pathname: '',
	search: '',
	hash: ''
};
global.history = {
	pushState: can.k,
	replaceState: can.k
};
