var escodegen = require("escodegen");

module.exports = generate;

function generate(ast, options, sourceContent){
	var sourceMaps = options && options.sourceMaps;
	var opts = {};
	if(sourceMaps) {
		var includeContent = !!options.sourceMapsContent;

		opts.sourceMap = includeContent ? options.sourceMapFileName : true;
		opts.sourceMapWithCode = true;
		if(options.sourceRoot) {
			opts.sourceMapRoot = options.sourceRoot;
		}
		if(includeContent) {
			opts.sourceContent = sourceContent;
		}
	}
	var result = escodegen.generate(ast, opts);
	if(typeof result === "string") {
		result = {
			code: result
		};
	}
	result.ast = ast;
	return result;
}
