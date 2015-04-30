steal("can-simple-dom", "can/view/parser", function(simpleDOM, canParser){

	var document = new simpleDOM.Document();
	var serializer = new simpleDOM.HTMLSerializer(simpleDOM.voidMap);

	var parser = new simpleDOM.HTMLParser(function(string){

		var tokens = [];
		var currentTag,
			currentAttr;

		canParser(string, {
			start: function( tagName, unary ){
				currentTag = { type: "StartTag", attributes: [], tagName: tagName };
			},
			end: function( tagName, unary ){
				tokens.push(currentTag);
				currentTag = undefined;
			},
			close:     function( tagName ){
				tokens.push({type: "EndTag", tagName: tagName});
			},
			attrStart: function( attrName ){
				currentAttr = [attrName, ''];
				currentTag.attributes.push(currentAttr);
			},
			attrEnd:   function( attrName ){},
			attrValue: function( value ){
				currentAttr[1] += value;
			},
			chars:     function( value ){
				tokens.push({type:"Chars", chars: value});
			},
			comment:   function( value ){
				tokens.push({type:"Comment", chars: value});
			},
			special:   function( value ){},
			done:      function( ){}
		});

		return tokens;
	}, document, simpleDOM.voidMap);

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
