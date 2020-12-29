var addDocObjectToDocMap = require("./add_doc_object_to_doc_map"),
	defaultTags = require("../tags/tags"),
	_ = require("lodash");

var	doubleAt = /@@/g,
	matchTag = /^\s*@(\w+)/,
	matchSpace = /^\s*/;
/**
 * @function documentjs.process.comment
 * @parent documentjs.process.methods
 * 
 * @signature `documentjs.process.comment(options, callback)`
 * 
 * Processes a comment and produces a docObject.
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
 * @body
 * 
 * ## Processing rules
 * 
 * The processing rules can be found in the [documentjs.Tag Tag interface].
 */
module.exports = function(options, callback){
		
	var docObject = options.docObject || {}, 
		comment = options.comment, 
		docMap = options.docMap,
		scope = options.scope,
		tags = options.tags || defaultTags;
		
	
	var i = 0,
		lines = typeof comment == 'string' ? comment.split("\n") : comment,
		len = lines.length,
		// a stack of the tagData and tag
		typeDataStack = [],
		tagName,
		curTag, 
		// the docData that a th
		curTagData, 

		indentation,
		indentationStack = [];

	var state = {
		defaultWriteProp: undefined,
		docObject: docObject,
		scope: scope,
		docMap: docMap
	};

	_.defaults(docObject,{
		body: "",
		description: ""
	});

	// for each line
	for ( var l = 0; l < len; l++ ) {

		// see if it starts with something that looks like a @tag
		var line = lines[l],
			match = line.match(matchTag);

		//console.log(">",line, indentationStack.map(function(foo){ return foo.tag.name }) );

		// if we have a tag
		if ( match ) {

			// get the tag object
			tagName = match[1].toLowerCase();
			curTag = tags[tagName];

			indentation = line.match( matchSpace )[0];
			
			// get the current data
			curTagData = getFromStack(indentationStack, indentation, state.docObject, curTag && curTag.keepStack);
			
			// if we don't have a tag object
			if (!curTag ) {
				// do default behavior
				tags._default.add.call(state.docObject, line, curTagData, state.scope, docMap, state.defaultWriteProp, options );				
				continue;
			} 
			
			// call the tag types add method
			try{
				curTagData = curTag.add.call(state.docObject, line, curTagData, state.scope, docMap, state.defaultWriteProp, options );
			} catch(e){
				console.log("ERROR:");
				console.log("   tag -", tagName);
				console.log("   line-",line);
				throw e;
			}
			
			if(Array.isArray(curTagData) && typeof curTagData[0] === "string") {
				
				handleCtrl(curTagData, state, indentationStack, addDocObjectToDocMap);
				
			} else if ( curTagData ) {
					
				indentationStack.push({
					tag: curTag,
					tagData: curTagData,
					indentation: indentation
				});
				
			} // if no curTag data, it's a single line tag, keep things where they are

		}
		else {
			// we have a normal line
			//clean up @@abc becomes @abc
			line = line.replace(doubleAt, "@");

			var last = _.last(indentationStack);

			// if we a lastTag (we are on a multi-line tag)
			if ( last && last.tag ) {
				// we should probably clean up the line
				line = line.replace(last.indentation,"");
				
				last.tag.addMore.call(state.docObject, line, last.tagData, state.scope, docMap);
			} else {
				// write to the default place
				writeToDefault(state, state.docObject, line);
			}
		}
	}

	// call end on any tags still left
	getFromStack(indentationStack, "", state.docObject);
	callback(state.docObject, state.scope);
};

// pop off the stack until indentation matches
var getFromStack = function(indentationStack, indentation, docObject, keepStack ){
	if(!keepStack) {
		while(indentationStack.length && _.last(indentationStack).indentation >= indentation) {
			var top = indentationStack.pop();
			if(top.tag && top.tag.end) {
				top.tag.end.call(docObject, top.tagData);
			}
		}
	}
	return indentationStack.length ? _.last(indentationStack).tagData : docObject;
};

var writeToDefault = function(state, docObject, line) {
	if(state.defaultWriteProp){
		docObject[state.defaultWriteProp] += line + "\n";
	} else {
		// if we don't have two newlines, keep adding to description
		if( docObject.body ){
			docObject.body += line + "\n";
		} else if(!docObject.description){
			docObject.description += line + "\n";
		} else if(!line ||  /^[\s]/.test( line ) ){
			state.defaultWriteProp = "body";
			docObject[state.defaultWriteProp] += line + "\n";
		} else {
			docObject.description += line + "\n";
		}
	}
};

var handleCtrl = function(curTagData, state, stack, addDocObjectToDocMap){
	// depending on curTagData, we do different things:
	// if we get ['push',{DATA}], this means we are an
	// 'inline' tag, meaning we are going to add
	// content to whatever tag we are currently in
	// @codestart and @codeend are the best examples of this
	var command = curTagData[0];
	
	if ( command == 'push' ) { //
		// sets as the current object to add to
		stack.push({
			tag: lastTag,
			tagData: lastTagData,
			indentation: ""
		});
		// set ourselves as the current lastTag and the 2nd
		// item in the array as curTagData
		curData = curTagData[1];
		lastTag = curTag;
	}
	// if we get ['pop', text],
	// add text to the previous parent tag
	else if ( command == 'pop' || command == 'poppop' ) {
		// get the last tag
		var last = stack.pop();
		if ( command === 'poppop' ) {
			last = stack.pop();
		}
		// as long as we had a previous tag
		if ( last && last.tag ) {
			//call the previous tag's addMore
			last.tag.addMore.call(state.docObject, curTagData[1], last.tagData);
		} else {
			// otherwise, add to the default place to write to
			state.docObject[state.defaultWriteProp || "body"] += "\n" + curTagData[1]
		}
	} else if ( command == 'scope') {
		// allow the total replacement of docObject for @add
		if(curTagData[2]) {
			state.docObject = curTagData[2];
		}
		
		// might need to change the head of the scope
		// curData = 
		state.scope = curTagData[1];
		
	} else if ( command == 'default' ) {
		// if we get ['default',PROPNAME]
		// we change default write to prop name
		// this will make it so if we aren't in a tag, all default
		// lines to to the defaultWriteProp
		// this is used by @constructor
		state.defaultWriteProp = curTagData[1];
		stack.splice(0, stack.length);
	} else if( command == 'add') {
		// we are adding something docMap
		addDocObjectToDocMap(curTagData[1], state.docMap);
	}
};