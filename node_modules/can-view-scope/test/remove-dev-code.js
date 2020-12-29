var loader = require('@loader');

var translate = loader.translate;
loader.translate = function(load) {
	if(this.isEnv("production")) {
		load.source = clean(load.source, {});
	}

	return translate.apply(this, arguments);
};

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
		"(\\s?)//!(\\s?)" + tag + "-start((.|\n)*?)//!(\\s?)" + tag + "-end",
		"gim"
	);
}

clean.makeTagRegEx = makeTagRegEx;
