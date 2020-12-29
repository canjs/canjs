"use strict";
var mustacheLineBreakRegExp = /(?:(^|\r?\n)(\s*)(\{\{([\s\S]*)\}\}\}?)([^\S\n\r]*)($|\r?\n))|(\{\{([\s\S]*)\}\}\}?)/g,
	mustacheWhitespaceRegExp = /(\s*)(\{\{\{?)(-?)([\s\S]*?)(-?)(\}\}\}?)(\s*)/g;

function splitModeFromExpression(expression, state){
	expression = expression.trim();
	var mode = expression.charAt(0);

	if( "#/{&^>!<".indexOf(mode) >= 0 ) {
		expression =  expression.substr(1).trim();
	} else {
		mode = null;
	}
	// Triple braces do nothing within a tag.
	if(mode === "{" && state.node) {
		mode = null;
	}
	return {
		mode: mode,
		expression: expression
	};
}

function cleanLineEndings(template) {
		// Finds mustache tags with space around them or no space around them.
		return template.replace( mustacheLineBreakRegExp,
			function(whole,
				returnBefore,
				spaceBefore,
				special,
				expression,
				spaceAfter,
				returnAfter,
				// A mustache magic tag that has no space around it.
				spaceLessSpecial,
				spaceLessExpression,
				matchIndex){

			// IE 8 will provide undefined
			spaceAfter = (spaceAfter || "");
			returnBefore = (returnBefore || "");
			spaceBefore = (spaceBefore || "");

			var modeAndExpression = splitModeFromExpression(expression || spaceLessExpression,{});

			// If it's a partial or tripple stache, leave in place.
			if(spaceLessSpecial || ">{".indexOf( modeAndExpression.mode) >= 0) {
				return whole;
			}  else if( "^#!/".indexOf(  modeAndExpression.mode ) >= 0 ) {
				// Return the magic tag and a trailing linebreak if this did not
				// start a new line and there was an end line.
				// Add a normalized leading space, if there was any leading space, in case this abuts a tag name
				spaceBefore = (returnBefore + spaceBefore) && " ";
				return spaceBefore+special+( matchIndex !== 0 && returnAfter.length ? returnBefore+"\n" :"");


			} else {
				// There is no mode, return special with spaces around it.
				return spaceBefore+special+spaceAfter+(spaceBefore.length || matchIndex !== 0 ? returnBefore+"\n" : "");
			}
		});
}

function whiteSpaceReplacement(
	whole,
	spaceBefore,
	bracketBefore,
	controlBefore,
	expression,
	controlAfter,
	bracketAfter,
	spaceAfter
) {

	if (controlBefore === '-') {
		spaceBefore = '';
	}

	if (controlAfter === '-') {
		spaceAfter = '';
	}

	return spaceBefore + bracketBefore + expression + bracketAfter + spaceAfter;
}

function cleanWhitespaceControl(template) {
	return template.replace(mustacheWhitespaceRegExp, whiteSpaceReplacement);
}

exports.cleanLineEndings = cleanLineEndings;
exports.cleanWhitespaceControl = cleanWhitespaceControl;
