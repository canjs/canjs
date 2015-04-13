// Everything CanJS+jquery app needs to run to pass
// if you are doing almost everything with the can.util layer
steal("can-simple-dom", "./make_parser", function(simpleDOM, makeParser){
	
	var document = new simpleDOM.Document();
	var serializer = new simpleDOM.HTMLSerializer(simpleDOM.voidMap);
	var parser = makeParser(document);
	
	if(Object.defineProperty) {
		Object.defineProperty(simpleDOM.Element.prototype, "innerHTML", {
			get: function(){
				return serializer.serialize(this.firstChild);
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
		});
	}
	global.document = document;
	global.window = global;
	global.addEventListener = function(){};
	global.removeEventListener = function(){};
	
});
