steal('can/view', function(can){

/**
 * Helper(s)
 */
var newLine = /(\r|\n)+/g,
	tagToContentPropMap= {
		option: "textContent",
		textarea: "value"
	},
	// Escapes characters starting with `\`.
	clean = function( content ) {
		return content
			.split('\\').join("\\\\")
			.split("\n").join("\\n")
			.split('"').join('\\"')
			.split("\t").join("\\t");
	},
	bracketNum = function(content){
		return (--content.split("{").length) - (--content.split("}").length);
	},
	 myEval = function( script ) {
		eval(script);
	},
	attrReg = /([^\s]+)=$/,
	// Commands for caching.
	startTxt = 'var ___v1ew = [];',
	finishTxt = "return ___v1ew.join('')",
	put_cmd = "___v1ew.push(",
	insert_cmd = put_cmd,
	// Global controls (used by other functions to know where we are).
	// Are we inside a tag?
	htmlTag = null,
	// Are we within a quote within a tag?
	quote = null,
	// What was the text before the current quote? (used to get the `attr` name)
	beforeQuote = null,
	// Used to mark where the element is.
	status = function(){
		// `t` - `1`.
		// `h` - `0`.
		// `q` - String `beforeQuote`.
		return quote ? "'"+beforeQuote.match(attrReg)[1]+"'" : (htmlTag ? 1 : 0);
	};

can.view.Scanner = Scanner = function( options ) {
  // Set options on self
  can.extend(this, {
  	tokens: {},
		tokenReg: []
  }, options);
	
	// Cache the token registry.
	this.tokenReg = new RegExp("(" + this.tokenReg.slice(0).concat(["<", ">", '"', "'"]).join("|") + ")","g");
};

/**
 * Extend can.View to add scanner support.
 */
Scanner.prototype = {

	helpers:[
		/**
		 * Check if its a func like `()->`.
		 * @param {String} content
		 */
		function(content){
			var quickFunc = /\s*\(([\$\w]+)\)\s*->([^\n]*)/;
			if(quickFunc.test(content)){
				var parts = content.match(quickFunc);
				content = "function(__){var " + parts[1] + "=can.$(__);" + parts[2] + "}";
			}
			return content;
		}
	],

	scan: function(source, name){
		var tokens = [],
			last = 0;
		
		source = source.replace(newLine, "\n");
		source.replace(this.tokenReg, function(whole, part, offset){
			// if the next token starts after the last token ends
			// push what's in between
			if(offset > last){
				tokens.push( source.substring(last, offset) );
			}

			// push the token 
			tokens.push(part);

			// update the position of the last part of the last token
			last = offset+part.length;
		});

		// if there's something at the end, add it
		if(last < source.length){
			tokens.push(source.substr(last));
		}
		
		var content = '',
			buff = [startTxt],
			// Helper `function` for putting stuff in the view concat.
			put = function( content, bonus ) {
				buff.push(put_cmd, '"', clean(content), '"'+(bonus||'')+');');
			},
			// A stack used to keep track of how we should end a bracket
			// `}`.  
			// Once we have a `<%= %>` with a `leftBracket`,
			// we store how the file should end here (either `))` or `;`).
			endStack =[],
			// The last token, used to remember which tag we are in.
			lastToken,
			// The corresponding magic tag.
			startTag = null,
			// Was there a magic tag inside an html tag?
			magicInTag = false,
			// The current tag name.
			tagName = '',
			// stack of tagNames
			tagNames = [],
			// Declared here.
			bracketCount,
			i = 0,
			token,
			tmap = this.tokens;

		// Reinitialize the tag state goodness.
		htmlTag = quote = beforeQuote = null;

		for (; (token = tokens[i++]) !== undefined;) {

			if ( startTag === null ) {
				switch ( token ) {
				case tmap.left:
				case tmap.reLeft:
				case tmap.rLeft:
				case tmap.rLeft2:
					magicInTag = 1;
				case tmap.cmntLeft:
					// A new line -- just add whatever content within a clean.  
					// Reset everything.
					startTag = token;
					if ( content.length ) {
						put(content);
					}
					content = '';
					break;
				case tmap.tLeft:
					content += tmap.left;
					break;
				case '<':
					// Make sure we are not in a comment.
					if(tokens[i].indexOf("!--") !== 0) {
						htmlTag = 1;
						magicInTag = 0;
					}
					content += token;
					break;
				case '>':
					htmlTag = 0;
					// if there was a magic tag
					// or it's an element that has text content between its tags, 
					// but content is not other tags add a hookup
					// TODO: we should only add `can.EJS.pending()` if there's a magic tag 
					// within the html tags.
					if(magicInTag || tagToContentPropMap[ tagNames[tagNames.length -1] ]){
						put(content, ",can.view.pending(),\">\"");
						content = '';
					} else {
						content += token;
					}
					// if it's a tag like <input/>
					if(lastToken.substr(-1) == "/"){
						// remove the current tag in the stack
						tagNames.pop();
						// set the current tag to the previous parent
						tagName = tagNames[tagNames.length-1];
					}
					break;
				case "'":
				case '"':
					// If we are in an html tag, finding matching quotes.
					if(htmlTag){
						// We have a quote and it matches.
						if(quote && quote === token){
							// We are exiting the quote.
							quote = null;
							// Otherwise we are creating a quote.
							// TODO: does this handle `\`?
						} else if(quote === null){
							quote = token;
							beforeQuote = lastToken;
						}
					}
				default:
					// Track the current tag
					if(lastToken === '<'){
						tagName = token.split(/\s/)[0];
						// If 
						if( tagName.indexOf("/") === 0 && tagNames.pop() === tagName.substr(1) ) {
							tagName = tagNames[tagNames.length-1]|| tagName.substr(1);
						} else {
							tagNames.push(tagName);
						}
					}
					content += token;
					break;
				}
			}
			else {
				// We have a start tag.
				switch ( token ) {
				case tmap.right:
				case tmap.rRight:
					switch ( startTag ) {
					case tmap.left:
						// Get the number of `{ minus }`
						bracketCount = bracketNum(content);
						
						// We are ending a block.
						if (bracketCount == 1) {

							// We are starting on.
							buff.push(insert_cmd, "can.view.txt(0,'"+tagName+"'," + status() + ",this,function(){", startTxt, content);
							
							endStack.push({
								before: "",
								after: finishTxt+"}));\n"
							});
						}
						else {
							
							// How are we ending this statement?
							last = // If the stack has value and we are ending a block...
								endStack.length && bracketCount == -1 ? // Use the last item in the block stack.
								endStack.pop() : // Or use the default ending.
							{
								after: ";"
							};
							
							// If we are ending a returning block, 
							// add the finish text which returns the result of the
							// block.
							if (last.before) {
								buff.push(last.before);
							}
							// Add the remaining content.
							buff.push(content, ";",last.after);
						}
						break;
					case tmap.reLeft:
					case tmap.rLeft:
					case tmap.rLeft2:
						// We have an extra `{` -> `block`.
						// Get the number of `{ minus }`.
						bracketCount = bracketNum(content);
						// If we have more `{`, it means there is a block.
						if( bracketCount ){
							// When we return to the same # of `{` vs `}` end with a `doubleParent`.
							endStack.push({
								before : finishTxt,
								after: "}));"
							});
						} 

						// go through and apply helpers
						for(var ii=0;ii<this.helpers.length;ii++){
							content = this.helpers[ii](content);
						}
						
						// If we have `<%== a(function(){ %>` then we want
						// `can.EJS.text(0,this, function(){ return a(function(){ var _v1ew = [];`.
						buff.push(insert_cmd, "can.view.txt("+(startTag === tmap.reLeft ? 1 : 0)+",'"+tagName+"'," + status()+",this,function(){ return ", content, 
							// If we have a block.
							bracketCount ? 
							// Start with startTxt `"var _v1ew = [];"`.
							startTxt : 
							// If not, add `doubleParent` to close push and text.
							"}));"
							);
						break;
					}
					startTag = null;
					content = '';
					break;
				case tmap.tLeft:
					content += tmap.left;
					break;
				default:
					content += token;
					break;
				}
			}
			lastToken = token;
		}
		
		// Put it together...
		if ( content.length ) {
			// Should be `content.dump` in Ruby.
			put(content);
		}
		buff.push(";");
		
		var template = buff.join(''),
			out = {
				out: 'with(_VIEW) { with (_CONTEXT) {' + template + " "+finishTxt+"}}"
			};
		// Use `eval` instead of creating a function, because it is easier to debug.
		myEval.call(out, 'this.fn = (function(_CONTEXT,_VIEW){' + out.out + '});\r\n//@ sourceURL=' + name + ".js");
		return out;
	}
};

});