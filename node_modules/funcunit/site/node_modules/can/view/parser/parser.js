/* jshint maxdepth:7,node:true*/
steal(function(){

	function each(items, callback){
		for ( var i = 0; i < items.length; i++ ) {
			callback(items[i], i);
		}
	}

	function makeMap(str){
		var obj = {}, items = str.split(",");
		each(items, function(name){
			obj[name] = true;
		});
		return obj;
	}

	function handleIntermediate(intermediate, handler){
		for(var i = 0, len = intermediate.length; i < len; i++) {
			var item = intermediate[i];
			handler[item.tokenType].apply(handler, item.args);
		}
		return intermediate;
	}

	var alphaNumeric = "A-Za-z0-9",
		alphaNumericHU = "-:_"+alphaNumeric,
		attributeNames = "[^=>\\s\\/]+",
		spaceEQspace = "\\s*=\\s*",
		singleCurly = "\\{[^\\}\\{]\\}",
		doubleCurly = "\\{\\{[^\\}]\\}\\}\\}?",
		attributeEqAndValue = "(?:"+spaceEQspace+"(?:"+
		  "(?:"+doubleCurly+")|(?:"+singleCurly+")|(?:\"[^\"]*\")|(?:'[^']*')|[^>\\s]+))?",
		matchStash = "\\{\\{[^\\}]*\\}\\}\\}?",
		stash = "\\{\\{([^\\}]*)\\}\\}\\}?",
		startTag = new RegExp("^<(["+alphaNumeric+"]["+alphaNumericHU+"]*)"+
				"(" +
					"(?:\\s*"+
						"(?:(?:"+
							"(?:"+attributeNames+")?"+
							attributeEqAndValue+")|"+
	                   "(?:"+matchStash+")+)"+
	                ")*"+
	            ")\\s*(\\/?)>"),
		endTag = new RegExp("^<\\/(["+alphaNumericHU+"]+)[^>]*>"),
		mustache = new RegExp(stash,"g"),
		txtBreak = /<|\{\{/,
		space = /\s/;

	// Empty Elements - HTML 5
	var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

	// Block Elements - HTML 5
	// For an INLINE element which can have BLOCK children, include that element in BOTH lists
	var block = makeMap("a,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video");

	// Inline Elements - HTML 5
	var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

	// Elements for which tag case matters - shouldn't be lowercased.
	var caseMatters = makeMap("altGlyph,altGlyphDef,altGlyphItem,animateColor,animateMotion,animateTransform,clipPath,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,foreignObject,glyphRef,linearGradient,radialGradient,textPath");

	// Elements that you can, intentionally, leave open
	// (and which close themselves)
	var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

	// Attributes that have their values filled in disabled="disabled"
	// var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

	// Special Elements (can contain anything)
	var special = makeMap("script");

	// Callback names on `handler`.
	var tokenTypes = "start,end,close,attrStart,attrEnd,attrValue,chars,comment,special,done".split(",");

	var fn = function(){};

	var HTMLParser = function (html, handler, returnIntermediate) {
		if(typeof html === "object") {
			return handleIntermediate(html, handler);
		}
		var intermediate = [];
		handler = handler || {};
		if(returnIntermediate) {
			// overwrite handlers so they add to intermediate
			each(tokenTypes, function(name){
				var callback = handler[name] || fn;
				handler[name] = function(){
					if( callback.apply(this, arguments) !== false ) {
						intermediate.push({tokenType: name, args: [].slice.call(arguments, 0) });
					}
				};
			});
		}

		function parseStartTag(tag, tagName, rest, unary) {
			tagName = caseMatters[tagName] ? tagName : tagName.toLowerCase();

			if (block[tagName] && !inline[tagName]) {
				var last = stack.last();
				while (last && inline[last] && !block[last]) {
					parseEndTag("", last);
					last = stack.last();
				}
			}

			if (closeSelf[tagName] && stack.last() === tagName) {
				parseEndTag("", tagName);
			}

			unary = empty[tagName] || !!unary;

			handler.start(tagName, unary);

			if (!unary) {
				stack.push(tagName);
			}
			// find attribute or special
			HTMLParser.parseAttrs(rest, handler);


			handler.end(tagName,unary);

		}

		function parseEndTag(tag, tagName) {
			// If no tag name is provided, clean shop
			var pos;
			if (!tagName) {
				pos = 0;
			}


				// Find the closest opened tag of the same type
			else {
				tagName = caseMatters[tagName] ? tagName : tagName.toLowerCase();
				for (pos = stack.length - 1; pos >= 0; pos--) {
					if (stack[pos] === tagName) {
						break;
					}
				}

			}


			if (pos >= 0) {
				// Close all the open elements, up the stack
				for (var i = stack.length - 1; i >= pos; i--) {
					if (handler.close) {
						handler.close(stack[i]);
					}
				}

				// Remove the open elements from the stack
				stack.length = pos;
			}
		}

		function parseMustache(mustache, inside){
			if(handler.special){
				handler.special(inside);
			}
		}
		var callChars = function(){
			if(charsText) {
				if(handler.chars) {
					handler.chars(charsText);
				}
			}
			charsText = "";
		};

		var index,
			chars,
			match,
			stack = [],
			last = html,
			// an accumulating text for the next .chars callback
			charsText = "";
		stack.last = function () {
			return this[this.length - 1];
		};

		while (html) {

			chars = true;

			// Make sure we're not in a script or style element
			if (!stack.last() || !special[stack.last()]) {

				// Comment
				if (html.indexOf("<!--") === 0) {
					index = html.indexOf("-->");

					if (index >= 0) {
						callChars();
						if (handler.comment) {
							handler.comment(html.substring(4, index));
						}
						html = html.substring(index + 3);
						chars = false;
					}

					// end tag
				} else if (html.indexOf("</") === 0) {
					match = html.match(endTag);

					if (match) {
						callChars();
						html = html.substring(match[0].length);
						match[0].replace(endTag, parseEndTag);
						chars = false;
					}

					// start tag
				} else if (html.indexOf("<") === 0) {
					match = html.match(startTag);

					if (match) {
						callChars();
						html = html.substring(match[0].length);
						match[0].replace(startTag, parseStartTag);
						chars = false;
					}
				} else if (html.indexOf("{{") === 0 ) {
					match = html.match(mustache);

					if (match) {
						callChars();
						html = html.substring(match[0].length);
						match[0].replace(mustache, parseMustache);
					}
				}

				if (chars) {
					index = html.search(txtBreak);
					if(index === 0 && html === last) {
						charsText += html.charAt(0);
						html = html.substr(1);
						index = html.search(txtBreak);
					}

					var text = index < 0 ? html : html.substring(0, index);
					html = index < 0 ? "" : html.substring(index);

					if (text) {
						charsText += text;
					}

				}

			} else {
				html = html.replace(new RegExp("([\\s\\S]*?)<\/" + stack.last() + "[^>]*>"), function (all, text) {
					text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2");
					if (handler.chars) {
						handler.chars(text);
					}
					return "";
				});

				parseEndTag("", stack.last());
			}

			if (html === last) {
				throw new Error("Parse Error: " + html);
			}

			last = html;
		}
		callChars();
		// Clean up any remaining tags
		parseEndTag();


		handler.done();
		return intermediate;
	};
	
	var callAttrStart = function(state, curIndex, handler, rest){
		state.attrStart = rest.substring(typeof state.nameStart === "number" ? state.nameStart : curIndex, curIndex);
		handler.attrStart(state.attrStart);
		state.inName = false;
	};
	
	var callAttrEnd = function(state, curIndex, handler, rest){
		if(state.valueStart !== undefined && state.valueStart < curIndex) {
			handler.attrValue(rest.substring(state.valueStart, curIndex));
		}
		// if this never got to be inValue, like `DISABLED` then send a attrValue
		else if(!state.inValue){
			//handler.attrValue(state.attrStart);
		}
		handler.attrEnd(state.attrStart);
		state.attrStart = undefined;
		state.valueStart = undefined;
		state.inValue = false;
		state.inName = false;
		state.lookingForEq = false;
		state.inQuote = false;
		state.lookingForName = true;
	};
	
	HTMLParser.parseAttrs = function(rest, handler){
		if(!rest) {
			return;
		}
		var i = 0;
		var curIndex;
		var state = {
			inDoubleCurly: false,
			inName: false,
			nameStart: undefined,
			inValue: false,
			valueStart: undefined,
			inQuote: false,
			attrStart: undefined,
			lookingForName: true,
			lookingForValue: false,
			lookingForEq : false
		};
		while(i < rest.length) {
			curIndex = i;
			var cur = rest.charAt(i);
			var next = rest.charAt(i+1);
			var nextNext = rest.charAt(i+2);
			i++;
			//debugger;
			if(cur === "{" && next === "{") {
				if(state.inValue && curIndex > state.valueStart) {
					handler.attrValue(rest.substring(state.valueStart, curIndex));
				}
				// `{{#foo}}DISABLED{{/foo}}`
				else if(state.inName && state.nameStart < curIndex) {
					callAttrStart(state, curIndex, handler, rest);
					callAttrEnd(state, curIndex, handler, rest);
				}
				// foo={{bar}}
				else if(state.lookingForValue){
					state.inValue = true;
				}
				// a {{bar}}
				else if(state.lookingForEq && state.attrStart) {
					callAttrEnd(state, curIndex, handler, rest);
				}
				state.inDoubleCurly = true;
				state.doubleCurlyStart = curIndex+2;
				i++;
			}
			else if(state.inDoubleCurly) {
				if(cur === "}" && next === "}") {
					// for `{{{}}}`
					var isTriple = nextNext === "}" ?  1: 0;
					handler.special(rest.substring(state.doubleCurlyStart, curIndex));
					state.inDoubleCurly = false;
					if(state.inValue) {
						state.valueStart = curIndex+2+isTriple;
					}
					i += (1+isTriple);
				}
			}
			else if(state.inValue) {
				if(state.inQuote) {
					if(cur === state.inQuote) {
						callAttrEnd(state, curIndex, handler, rest);
					}
				}
				else if(space.test(cur)) {
					callAttrEnd(state, curIndex, handler, rest);
				}
			}
			// if we hit an = outside a value
			else if(cur === "=" && (state.lookingForEq || state.lookingForName || state.inName)) {
				
				// if we haven't yet started this attribute `{{}}=foo` case:
				if(!state.attrStart) {
					callAttrStart(state, curIndex, handler, rest);
				}
				state.lookingForValue = true;
				state.lookingForEq = false;
				state.lookingForName = false;
			}
			// if we are currently in a name, check if we found a space
			else if(state.inName) {
				if(space.test(cur)) {
					callAttrStart(state, curIndex, handler, rest);
					state.lookingForEq = true;
				}
			}
			else if(state.lookingForName) {
				if(!space.test(cur)) {
					// might have just started a name, we need to close it
					if(state.attrStart) {
						callAttrEnd(state, curIndex, handler, rest);
					}
					state.nameStart = curIndex;
					state.inName = true;
				}
			}
			else if(state.lookingForValue) {
				if(!space.test(cur)) {
					state.lookingForValue = false;
					state.inValue = true;
					if(cur === "'" || cur === '"') {
						state.inQuote = cur;
						state.valueStart = curIndex+1;
					} else {
						state.valueStart = curIndex;
					}
				}
			}
		}
		
		if(state.inName) {
			callAttrStart(state, curIndex+1, handler, rest);
			callAttrEnd(state, curIndex+1, handler, rest);
		} else if(state.lookingForEq) {
			callAttrEnd(state, curIndex+1, handler, rest);
		} else if(state.inValue) {
			callAttrEnd(state, curIndex+1, handler, rest);
		}

		
	};

	return HTMLParser;

});
