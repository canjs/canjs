var stmd = require("./stmd");
var parser = new stmd.DocParser();
var renderer = new stmd.HtmlRenderer();
module.exports = function(markdown){
	return renderer.render(parser.parse(markdown));
};
