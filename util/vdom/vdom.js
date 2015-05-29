// Everything CanJS+jquery app needs to run to pass
// if you are doing almost everything with the can.util layer
steal("can-simple-dom", "./build_fragment/make_parser", function(simpleDOM, makeParser){

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
						var frag = parser.parse(""+html);
						this.appendChild(frag);
					}
				}
			};
		};
		Object.defineProperty(simpleDOM.Element.prototype, "innerHTML", descriptor());
		Object.defineProperty(simpleDOM.Element.prototype, "outerHTML", descriptor(true));
	}
	global.document = document;
	global.window = global;
	global.addEventListener = function(){};
	global.removeEventListener = function(){};

});
