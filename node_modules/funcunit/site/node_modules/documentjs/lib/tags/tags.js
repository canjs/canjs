/**
 * @property {Object<String,tag>} documentjs.tags tags
 * @parent DocumentJS.apis.document
 * 
 * @option {Object<String,tag>}
 * 
 * The collection of tags used by [documentjs.process.file] to process
 * comments and code. The default tags are listed on your left.
 * 
 * @body
 * 
 * ## Use
 * 
 * A tag adds additional information to the comment being processed.
 * For example, if you want the current comment to include the author,
 * include an `@@author` tag.
 * 
 * 
 * ## Creating your own tag
 * 
 * To create a tag, you need to add to `documentjs.tags` an object with an add and an optional
 * addMore method like:
 * 
 *     documentjs.tags.mytag = {
 *       add : function(line){ ... },
 *       addMore : function(line, last){ ... }
 *     }
 */

var tags = {
	_default: require("./_default"),
	add: require("./add"),
	alias: require("./alias"),
	api: require("./api"),
	author: require("./author"),
	body: require("./body"),
	codeend: require("./codeend"),
	codestart: require("./codestart"),
	constructor: require("./constructor"),
	"class": require("./class"),
	demo: require("./demo"),
	description: require("./description"),
	deprecated: require("./deprecated"),
	download: require("./download"),
	"function": require("./function"),
	hide: require("./hide"),
	iframe: require("./iframe"),
	image: require("./image"),
	inherits: require("./inherits"),
	link: require("./link"),
	"module": require("./module"),
	option: require("./option"),
	page: require("./page"),
	param: require("./param"),
	parent: require("./parent"),
	plugin: require("./plugin"),
	property: require("./property"),
	"prototype" : require("./prototype"),
	release: require("./release"),
	"return": require("./return"),
	signature: require("./signature"),
	"static": require("./static"),
	stylesheet: require("./stylesheet"),
	styles: require("./styles"),
	tag: require("./tag"),
	test: require("./test"),
	"this": require("./this"),
	typedef: require("./typedef"),
	group: require("./group"),
	outline: require("./outline")
};

for(var name in tags) {
	tags[name].name = name;
}

module.exports = tags;