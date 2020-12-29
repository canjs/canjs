// This a weird plugin that takes the source from a module and defines
// a new virtual module with that source, and then makes that virtual module
// a dependency of the first.
exports.translate = function(load){
	var source = load.source;
	var loader = this;

	loader.define("foo", source);

	return "def" + "ine(['foo'], function(foo){\n" +
	"\treturn foo;\n" +
	"});\n";
};
