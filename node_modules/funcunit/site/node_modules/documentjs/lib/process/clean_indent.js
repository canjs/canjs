var spaceReg = /\S/g;

module.exports  = function cleanIndent(lines) {
	// first calculate the amount of space to remove
	// and get lines starting with text content 
	var removeSpace = Infinity,
		match, contentLines = [],
		hasContent = false,
		line, l;
		
	spaceReg.lastIndex = 0;
	// for each line
	for (l = 0; l < lines.length; l++) {
		line = lines[l];
		// test if it has something other than a space
		match = spaceReg.exec(line);
		// if it does, and it's less than our current maximum
		if (match && line && spaceReg.lastIndex < removeSpace) {
			// update our current maximum
			removeSpace = spaceReg.lastIndex;
			// mark as starting to have content
			hasContent = true;
		}
		// if we have content now, add to contentLines
		if (hasContent) {
			contentLines.push(line);
		}
		// update the regexp position
		spaceReg.lastIndex = 0;
	}
	// remove from the position before the last char
	removeSpace = removeSpace - 1;

	// go through content lines and remove the removeSpace
	if (isFinite(removeSpace) && removeSpace !== 0) {
		for (l = 0; l < contentLines.length; l++) {
			contentLines[l] = contentLines[l].substr(removeSpace);
		}
	}
	return contentLines;
};