// Everything CanJS+jquery app needs to run to pass
// if you are doing almost everything with the can.util layer
steal("can/util/can.js", "./document/document", function(can, document){
	
	var global = can.global;
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
});
