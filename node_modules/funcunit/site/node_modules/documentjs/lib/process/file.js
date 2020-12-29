var processComment = require("./comment"),
	processCodeAndComment = require("./code_and_comment"),
	addDocObjectToDocMap = require("./add_doc_object_to_doc_map"),
	_ = require('lodash'),
	getComments = require("./get_comments");

var ignoreCheck = new RegExp("@"+"documentjs-ignore");
/**
 * @function documentjs.process.file
 * @parent documentjs.process.methods
 * 
 * Processes a file's source.  Adds created [documentjs.process.docObject docObjects] to docMap.
 * 
 * @signature `documentjs.process.file(source, docMap, [filename])`
 * 
 * Processes a file's source and calls [documentjs.process.codeAndComment] accordingly. If
 * the file ends with `.js`, each comment will be processed individually.  Otherwise,
 * it treats the entire source as one big comment.
 * 
 * 
 * @param {String} source A files source
 * @param {documentjs.process.docMap} docMap A map of the name of each DocObject to the DocObject
 * 
 * @param {String} [filename] The filename.  If a filename is not provided, 
 * the entire file is treated as one big comment block.  If a filename is provided
 * and is not a .md or .markdown file, it is assumed to be a source file.
 * 
 * @param {{}} [options] An options object. Currently only the `tags` option is used.
 * 
 * @option {Object} tags A collection of tags.  If `options` or `options.tags` is not
 * provided, the default tags will be used.
 * 
 * @body
 * 
 * ## Use
 * 
 *     var docMap = {}; 
 *     documentjs.process.file("import $ from 'jquery' ... ",
 *          docMap,
 *          "myproject.js");
 * 
 */
module.exports = function processFile(source, docMap, filename, options ) {
	if (ignoreCheck.test(source)) {
		return;
	}
	if(!options) {
		options = {};
	}
	if(!options.tags) {
		options.tags = require("../tags/tags");
	}
	
	// The current scope is a script.  It will be the parent
	// if there is no other parent.
	var scope = {
			type: "script",
			name: filename + ""
		},
		// which comment block we are on
		comment;
		
	// A callback that gets called with the docObject created and the scope
	function typeCreateHandler(docObject, newScope) {
		
		docObject && addDocObjectToDocMap(docObject, docMap, filename, comment && comment.line);
		if (newScope) {
			scope = newScope;
		}
	}
	// makes a docObject with a src and line
	function makeDocObject(base, line, codeLine){
		var docObject = _.extend({}, base);
		if(filename) {
			docObject.src = filename + "";
		} 
		if (typeof line === 'number') {
			docObject.line = line;
		}
		if (typeof codeLine === 'number') {
			docObject.codeLine = codeLine;
		}
		return docObject;
	}
	
	if (!filename || /\.(md|markdown)$/.test(filename) ) {

		processComment({
			comment: source,
			docMap: docMap,
			scope: scope,
			docObject: makeDocObject({
				type: 'page',
				name: (filename+"").match(/([^\/]+)\.(md|markdown)$/)[1]
			}),
			tags: options.tags
		}, typeCreateHandler);

		return;
	} else if( /\.(mustache|handlebars)$/.test(filename) ) {
		typeCreateHandler(makeDocObject({
			name: (filename+"").match(/([^\/]+)\.(mustache|handlebars)$/)[1],
			renderer: function(data, originalRenderer){
				var contentRenderer = originalRenderer.Handlebars.compile(source);
				var content = contentRenderer(data);
				// pass that content to the layout
				return originalRenderer.layout(_.extend({
					content: content
				}, data));
			},
			type: "template"
		}));
	} else {
		getComments(source).forEach(function(comment){
			processCodeAndComment({
				code: comment.code,
				comment: comment.comment,
				docMap: docMap,
				scope: scope,
				tags: options.tags,
				docObject: makeDocObject({},comment.line, comment.codeLine)
			}, typeCreateHandler);
		});
	}
};


