function clean(original, options) {
	var result = original;
	var removeTags = options.removeTags || [];

	if (!options.dev) {
		removeTags.push("steal-remove");
	}

	removeTags.forEach(function(tag) {
		result = result.replace(makeTagRegEx(tag), "");
	});

	return result;
}

function makeTagRegEx(tag) {
	return new RegExp(
		"(\\s?)//!(\\s?)" + tag + "-start((.|\r?\n)*?)//!(\\s?)" + tag + "-end",
		"gim"
	);
}

clean.makeTagRegEx = makeTagRegEx;
module.exports = clean;
