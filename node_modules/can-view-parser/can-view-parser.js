"use strict";
/* jshint maxdepth:7,node:true, latedef:false */
var namespace = require('can-namespace'),
	dev = require('can-log/dev/dev'),
	encoder = require('can-attribute-encoder');

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

//!steal-remove-start
if (process.env.NODE_ENV !== 'production') {
	//assign the function to a var to avoid jshint
	//"Function declarations should not be placed in blocks"
	var countLines = function countLines(input) {
		// TODO: optimize?
		return input.split('\n').length - 1;
	};
}
//!steal-remove-end

var alphaNumeric = "A-Za-z0-9",
	alphaNumericHU = "-:_"+alphaNumeric,
	magicStart = "{{",
	endTag = new RegExp("^<\\/(["+alphaNumericHU+"]+)[^>]*>"),
	magicMatch = new RegExp("\\{\\{(![\\s\\S]*?!|[\\s\\S]*?)\\}\\}\\}?","g"),
	space = /\s/,
	alphaRegex = new RegExp('['+ alphaNumeric + ']'),
	attributeRegexp = new RegExp("["+alphaNumericHU+"]+\s*=\s*(\"[^\"]*\"|'[^']*')");

// Empty Elements - HTML 5
var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

// Elements for which tag case matters - shouldn't be lowercased.
var caseMattersElements = makeMap("altGlyph,altGlyphDef,altGlyphItem,animateColor,animateMotion,animateTransform,clipPath,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,foreignObject,glyphRef,linearGradient,radialGradient,textPath");

// Elements that you can, intentionally, leave open
// (and which close themselves)
var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

// Special Elements (can contain anything)
var special = makeMap("script");

// Callback names on `handler`.
var tokenTypes = "start,end,close,attrStart,attrEnd,attrValue,chars,comment,special,done".split(",");

//maps end characters to start characters
var startOppositesMap = {"{": "}", "(":")"};

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
					var end = arguments.length;

					// the intermediate is stringified in the compiled stache templates
					// so we want to trim the last item if it is the line number
					if (arguments[end - 1] === undefined) {
						end = arguments.length - 1;
					}

					//!steal-remove-start
					if (process.env.NODE_ENV !== 'production') {
						// but restore line number in dev mode
						end = arguments.length;
					}
					//!steal-remove-end

					intermediate.push({
						tokenType: name,
						args: [].slice.call(arguments, 0, end),
					});
				}
			};
		});
	}

	function parseStartTag(tag, tagName, rest, unary) {
		tagName = caseMattersElements[tagName] ? tagName : tagName.toLowerCase();

		if (closeSelf[tagName] && stack.last() === tagName) {
			parseEndTag("", tagName);
		}

		unary = empty[tagName] || !!unary;
		handler.start(tagName, unary, lineNo);
		if (!unary) {
			stack.push(tagName);
		}

		// find attribute or special
		HTMLParser.parseAttrs(rest, handler, lineNo);

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			lineNo += countLines(tag);
		}
		//!steal-remove-end


		handler.end(tagName, unary, lineNo);

		if(tagName === "html") {
			skipChars = true;
		}
	}

	function parseEndTag(tag, tagName) {
		// If no tag name is provided, clean shop
		var pos;
		if (!tagName) {
			pos = 0;
		}
		// Find the closest opened tag of the same type
		else {
			tagName = caseMattersElements[tagName] ? tagName : tagName.toLowerCase();
			for (pos = stack.length - 1; pos >= 0; pos--) {
				if (stack[pos] === tagName) {
					break;
				}
			}
		}

		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			if (typeof tag === 'undefined') {
				if (stack.length > 0) {
					if (handler.filename) {
						dev.warn(handler.filename + ": expected closing tag </" + stack[pos] + ">");
					}
					else {
						dev.warn("expected closing tag </" + stack[pos] + ">");
					}
				}
			} else if (pos < 0 || pos !== stack.length - 1) {
				if (stack.length > 0) {
					if (handler.filename) {
						dev.warn(handler.filename + ":" + lineNo + ": unexpected closing tag " + tag + " expected </" + stack[stack.length - 1] + ">");
					}
					else {
						dev.warn(lineNo + ": unexpected closing tag " + tag + " expected </" + stack[stack.length - 1] + ">");
					}
				} else {
					if (handler.filename) {
						dev.warn(handler.filename + ":" + lineNo + ": unexpected closing tag " + tag);
					}
					else {
						dev.warn(lineNo + ": unexpected closing tag " + tag);
					}
				}
			}
		}
		//!steal-remove-end

		if (pos >= 0) {
			// Close all the open elements, up the stack
			for (var i = stack.length - 1; i >= pos; i--) {
				if (handler.close) {
					handler.close(stack[i], lineNo);
				}
			}

			// Remove the open elements from the stack
			stack.length = pos;

			// Don't add TextNodes after the <body> tag
			if(tagName === "body") {
				skipChars = true;
			}
		}
	}

	function parseMustache(mustache, inside){
		if(handler.special){
			handler.special(inside, lineNo);
		}
	}

	var callChars = function(){
		if(charsText && !skipChars) {
			if(handler.chars) {
				handler.chars(charsText, lineNo);
			}

			//!steal-remove-start
			if (process.env.NODE_ENV !== 'production') {
				lineNo += countLines(charsText);
			}
			//!steal-remove-end
		}

		skipChars = false;
		charsText = "";
	};

	var index,
		chars,
		skipChars,
		match,
		lineNo,
		stack = [],
		last = html,
		// an accumulating text for the next .chars callback
		charsText = "";

	//!steal-remove-start
	if (process.env.NODE_ENV !== 'production') {
		lineNo = 1;
	}
	//!steal-remove-end

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
						handler.comment(html.substring(4, index), lineNo);
					}

					//!steal-remove-start
					if (process.env.NODE_ENV !== 'production') {
						lineNo += countLines(html.substring(0, index + 3));
					}
					//!steal-remove-end

					html = html.substring(index + 3);
					chars = false;
				}

				// end tag
			} else if (html.indexOf("</") === 0) {
				match = html.match(endTag);

				if (match) {
					callChars();
					match[0].replace(endTag, parseEndTag);

					//!steal-remove-start
					if (process.env.NODE_ENV !== 'production') {
						lineNo += countLines(html.substring(0, match[0].length));
					}
					//!steal-remove-end

					html = html.substring(match[0].length);
					chars = false;
				}

				// start tag
			} else if (html.indexOf("<") === 0) {
				var res = HTMLParser.searchStartTag(html);

				if(res) {
					callChars();
					parseStartTag.apply(null, res.match);

					html = res.html;
					chars = false;
				}

				// magic tag
			} else if (html.indexOf(magicStart) === 0 ) {
				match = html.match(magicMatch);

				if (match) {
					callChars();
					match[0].replace(magicMatch, parseMustache);

					//!steal-remove-start
					if (process.env.NODE_ENV !== 'production') {
						lineNo += countLines(html.substring(0, match[0].length));
					}
					//!steal-remove-end

					html = html.substring(match[0].length);
				}
			}

			if (chars) {
				index = findBreak(html, magicStart);
				if(index === 0 && html === last) {
					charsText += html.charAt(0);
					html = html.substr(1);
					index = findBreak(html, magicStart);
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
					handler.chars(text, lineNo);
				}

				//!steal-remove-start
				if (process.env.NODE_ENV !== 'production') {
					lineNo += countLines(text);
				}
				//!steal-remove-end

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


	handler.done(lineNo);
	return intermediate;
};

var callAttrStart = function(state, curIndex, handler, rest, lineNo){
	var attrName = rest.substring(typeof state.nameStart === "number" ? state.nameStart : curIndex, curIndex),
		newAttrName = encoder.encode(attrName);

	state.attrStart = newAttrName;
	handler.attrStart(state.attrStart, lineNo);
	state.inName = false;
};

var callAttrEnd = function(state, curIndex, handler, rest, lineNo){
	if(state.valueStart !== undefined && state.valueStart < curIndex) {
		var val = rest.substring(state.valueStart, curIndex);
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			var quotedVal, closedQuote;
			quotedVal = rest.substring(state.valueStart - 1, curIndex + 1);
			quotedVal = quotedVal.trim();
			closedQuote = quotedVal.charAt(quotedVal.length - 1);

			if (state.inQuote !== closedQuote) {
				if (handler.filename) {
					dev.warn(handler.filename + ":" + lineNo + ": End quote is missing for " + val);
				} else {
					dev.warn(lineNo + ": End quote is missing for " + val);
				}
			}
		}
		//!steal-remove-end
		handler.attrValue(val, lineNo);
	}
	// if this never got to be inValue, like `DISABLED` then send a attrValue
	// else if(!state.inValue){
	// 	handler.attrValue(state.attrStart, lineNo);
	// }

	handler.attrEnd(state.attrStart, lineNo);
	state.attrStart = undefined;
	state.valueStart = undefined;
	state.inValue = false;
	state.inName = false;
	state.lookingForEq = false;
	state.inQuote = false;
	state.lookingForName = true;
};

var findBreak = function(str, magicStart) {
	var magicLength = magicStart.length;
	for(var i = 0, len = str.length; i < len; i++) {
		if(str[i] === "<" || str.substr(i, magicLength) === magicStart) {
			return i;
		}
	}
	return -1;
};

HTMLParser.parseAttrs = function(rest, handler, lineNo){
	if(!rest) {
		return;
	}

	var i = 0;
	var curIndex;
	var state = {
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
		i++;

		if(magicStart === rest.substr(curIndex, magicStart.length) ) {
			if(state.inValue && curIndex > state.valueStart) {
				handler.attrValue(rest.substring(state.valueStart, curIndex), lineNo);
			}
			// `{{#foo}}DISABLED{{/foo}}`
			else if(state.inName && state.nameStart < curIndex) {
				callAttrStart(state, curIndex, handler, rest, lineNo);
				callAttrEnd(state, curIndex, handler, rest, lineNo);
			}
			// foo={{bar}}
			else if(state.lookingForValue){
				state.inValue = true;
			}
			// a {{bar}}
			else if(state.lookingForEq && state.attrStart) {
				callAttrEnd(state, curIndex, handler, rest, lineNo);
			}

			magicMatch.lastIndex = curIndex;
			var match = magicMatch.exec(rest);
			if(match) {
				handler.special(match[1], lineNo);
				// i is already incremented
				i = curIndex + (match[0].length);
				if(state.inValue) {
					state.valueStart = curIndex+match[0].length;
				}
			}
		}
		else if(state.inValue) {
			if(state.inQuote) {
				if(cur === state.inQuote) {
					callAttrEnd(state, curIndex, handler, rest, lineNo);
				}
			}
			else if(space.test(cur)) {
				callAttrEnd(state, curIndex, handler, rest, lineNo);
			}
		}
		// if we hit an = outside a value
		else if(cur === "=" && (state.lookingForEq || state.lookingForName || state.inName)) {
			// if we haven't yet started this attribute `{{}}=foo` case:
			if(!state.attrStart) {
				callAttrStart(state, curIndex, handler, rest, lineNo);
			}
			state.lookingForValue = true;
			state.lookingForEq = false;
			state.lookingForName = false;
		}
		// if we are currently in a name:
		//  when the name starts with `{` or `(`
		//  it isn't finished until the matching end character is found
		//  otherwise, a space finishes the name
		else if(state.inName) {
			var started = rest[ state.nameStart ],
					otherStart, otherOpposite;
			if(startOppositesMap[started] === cur) {
				//handle mismatched brackets: `{(})` or `({)}`
				otherStart = started === "{" ? "(" : "{";
				otherOpposite = startOppositesMap[otherStart];

				if(rest[curIndex+1] === otherOpposite){
					callAttrStart(state, curIndex+2, handler, rest, lineNo);
					i++;
				}else{
					callAttrStart(state, curIndex+1, handler, rest, lineNo);
				}

				state.lookingForEq = true;
			}
			else if(space.test(cur) && started !== "{" && started !== "(") {
					callAttrStart(state, curIndex, handler, rest, lineNo);
					state.lookingForEq = true;
			}
		}
		else if(state.lookingForName) {
			if(!space.test(cur)) {
				// might have just started a name, we need to close it
				if(state.attrStart) {
					callAttrEnd(state, curIndex, handler, rest, lineNo);
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
				// if we are looking for a value
				// at the end of the loop we need callAttrEnd
			} else if (i === rest.length){
				callAttrEnd(state, curIndex, handler, rest, lineNo);
			}
		}
	}

	if(state.inName) {
		callAttrStart(state, curIndex+1, handler, rest, lineNo);
		callAttrEnd(state, curIndex+1, handler, rest, lineNo);
	} else if(state.lookingForEq || state.lookingForValue || state.inValue) {
		callAttrEnd(state, curIndex+1, handler, rest, lineNo);
	}
	magicMatch.lastIndex = 0;
};

HTMLParser.searchStartTag = function (html) {
	var closingIndex = html.indexOf('>');

	// The first closing bracket we find might be in an attribute value.
	// Move through the attributes by regexp.
	var attributeRange = attributeRegexp.exec(html.substring(1));
	var afterAttributeOffset = 1;
	// if the closing index is after the next attribute...
	while(attributeRange && closingIndex >= afterAttributeOffset + attributeRange.index) {

		// prepare to move to the attribute after this one by increasing the offset
		afterAttributeOffset += attributeRange.index + attributeRange[0].length;
		// if the closing index is before the new offset, then this closing index is inside
		//  an attribute value and should be ignored.  Find the *next* closing character.
		while(closingIndex < afterAttributeOffset) {
			closingIndex += html.substring(closingIndex + 1).indexOf('>') + 1;
		}

		// find the next attribute by starting from the new offset.
		attributeRange = attributeRegexp.exec(html.substring(afterAttributeOffset));
	}

	// if there is no closing bracket
	// <input class=
	// or if the tagName does not start with alphaNumer character
	// <_iaois>
	// it is not a startTag
	if(closingIndex === -1 || !(alphaRegex.test(html[1]))){
		return null;
	}

	var tagName, tagContent, match, rest = '', unary = '';
	var startTag = html.substring(0, closingIndex + 1);
	var isUnary = startTag[startTag.length-2] === '/';
	var spaceIndex = startTag.search(space);

	if(isUnary){
		unary = '/';
		tagContent = startTag.substring(1, startTag.length-2).trim();
	} else {
		tagContent = startTag.substring(1, startTag.length-1).trim();
	}

	if(spaceIndex === -1){
		tagName = tagContent;
	} else {
		//spaceIndex needs to shift one to the left
		spaceIndex--;
		tagName = tagContent.substring(0, spaceIndex);
		rest = tagContent.substring(spaceIndex);
	}

	match = [startTag, tagName, rest, unary];

	return {
		match: match,
		html: html.substring(startTag.length),
	};


};

module.exports = namespace.HTMLParser = HTMLParser;
