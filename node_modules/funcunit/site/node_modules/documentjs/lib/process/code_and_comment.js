var processCode = require("./code"),
	processComment = require("./comment");

var typeCheckReg = /^\s*@(\w+)/;
/**
 * @function documentjs.process.codeAndComment
 * @parent documentjs.process.methods
 * 
 * @signature `documentjs.process.codeAndComment(options, callback)`
 * 
 * Processes a code suggestion and then a comment and produces a docObject.
 * 
 * @param {documentjs.process.processOptions} options An options object that contains
 * the code and comment to process.
 * 
 * @param {function(documentjs.process.docObject,documentjs.process.docObject)} callback(newDoc,newScope)
 * 
 * A function that is called back with a docObject created from the code and the scope
 * `docObject`.  If
 * no docObject is created, `newDoc` will be null.  
 * 
 * @option newDoc the new documentation object
 * @option newScope the new scope
 */
module.exports = function(options, callback){
	var self = this,
		comment = options.comment;
	
	var firstLine = (typeof comment == 'string' ? comment : comment[0]) || "",
		check = firstLine.match(typeCheckReg);
	
	if(check){
		if(!options.docObject){
			options.docObject = {};
		}
		options.docObject.type = check[1].toLowerCase();
	}
	
	if(options.code){
		processCode(options, function(newDoc, newScope){
			processComment({
				comment: options.comment,
				scope: newScope || options.scope,
				docMap: options.docMap,
				docObject: newDoc || options.docObject || {},
				tags: options.tags || {}
			}, function(newDoc, newScope){
				callback(newDoc, newScope);
			});
			
			
		});
	} else {
		processComment({
			comment: options.comment,
			scope: options.scope,
			docMap: options.docMap,
			docObject:  {},
			tags: options.tags || {}
		}, function(newDoc, newScope){
			callback(newDoc, newScope);
		});
	}
};