
var multiLineCommentReg = /(?:\/\*\*((?:[^*]|(?:\*+[^*\/]))*)\*+\/)/g;

var commentReg = /\r?\n(?:\s*\*+)?/g;

var nextCodeLineReg = /[^\w\{\(\["'\$]*([^\r\n]*)/g,
	startsWithComment = /^\s*\/\*/;

var cleanIndent = require("./clean_indent");
	
module.exports = function getComments(source) {
	var start = new Date;
	//var source = source.replace('\r\n','\n')
	var comments = [],
		match, 
		getLine = lineNumber(source),
		nextCodeLineMatch,
		nextCodeLine,
		code;

	multiLineCommentReg.lastIndex = 0;


	while (match = multiLineCommentReg.exec(source)) {
		
		
		var origComment = match[1],
			lines = cleanIndent( origComment.replace(commentReg, '\n').split("\n") ),
			lastIndex = multiLineCommentReg.lastIndex;
		
		nextCodeLineReg.lastIndex = lastIndex;
		nextCodeLineMatch = nextCodeLineReg.exec(source);;
		
		if(nextCodeLineMatch) {
			
			if(startsWithComment.test( nextCodeLineMatch[0] ) ) {
				code = '';
			} else {
				code = nextCodeLineMatch[1];
			}
		} else {
			code = '';
		}
		var docObject = {
			comment: lines,
			code: code,
			line: getLine(lastIndex - match[0].length)
		};
		if(code) {
			docObject.codeLine = getLine(nextCodeLineReg.lastIndex);
		}
		comments.push(docObject);
	}
	return comments;
};


function lineNumber(source) {

	var curLine = 0,
		curIndex, lines, len;


	return function (index) {
		if (!lines) {
			lines = source.split('\n');
			curIndex = lines[0].length + 1;
			len = lines.length;
		}
		// if we haven't already, split the 	
		if (index < curIndex) {
			return curLine;
		}
		curLine++;
		while (curLine < len && (curIndex += lines[curLine].length + 1) <= index) {
			curLine++;
		}
		return curLine;
	};

};