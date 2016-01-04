// Everything CanJS+jquery app needs to run to pass
// if you are doing almost everything with the can.util layer
steal("can/util/can.js", "can-simple-dom", "./build_fragment/make_parser", function(can, simpleDOM, makeParser){
	var document = new simpleDOM.Document();
	var serializer = new simpleDOM.HTMLSerializer(simpleDOM.voidMap);
	var parser = makeParser(document);

	if(Object.defineProperty) {
		var descriptor = function(outerHtml){
			return {
				get: function(){
					return serializer.serialize(outerHtml ? this : this.firstChild);
				},
				set: function(html){
					// remove all children
					var cur = this.firstChild;
					while(cur) {
						this.removeChild(cur);
						cur = this.firstChild;
					}
					if(""+html) {
						var frag ;
						if (this.nodeName === "SCRIPT") {
							frag = document.createTextNode(""+html);
						} else {
							frag = parser.parse(""+html);
						}
						this.appendChild(frag);
					}
				}
			};
		};
		Object.defineProperty(simpleDOM.Element.prototype, "innerHTML", descriptor());
		Object.defineProperty(simpleDOM.Element.prototype, "outerHTML", descriptor(true));
	}
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
