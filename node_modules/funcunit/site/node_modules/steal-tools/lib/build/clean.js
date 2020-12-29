module.exports = function(original, options) {
	var result = original;
	var removeTags = options.removeTags || [];

	if(!options.dev) {
		removeTags.push('steal-remove');
	}

	removeTags.forEach(function(tag) {
		result = result.replace(new RegExp('(\\s?)\/\/!' + tag + '-start((.|\n)*?)\/\/!' + tag + '-end', 'gim'), '');
	});

	return result;
};
