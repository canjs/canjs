"use strict";
/* jshint undef: false */

var parser = require('can-view-parser');
var viewCallbacks = require('can-view-callbacks');

var HTMLSectionBuilder = require('./src/html_section');
var TextSectionBuilder = require('./src/text_section');
var mustacheCore = require('./src/mustache_core');
var mustacheHelpers = require('./helpers/core');
var getIntermediateAndImports = require('can-stache-ast').parse;
var utils = require('./src/utils');
var makeRendererConvertScopes = utils.makeRendererConvertScopes;
var last = utils.last;

var attributeEncoder = require('can-attribute-encoder');
var dev = require('can-log/dev/dev');
var namespace = require('can-namespace');
var DOCUMENT = require('can-globals/document/document');
var assign = require('can-assign');
var importer = require('can-import-module');
var canReflect = require('can-reflect');
var Scope = require('can-view-scope');
var TemplateContext = require("can-view-scope/template-context");
var ObservationRecorder = require('can-observation-recorder');
var canSymbol = require("can-symbol");
// Make sure that we can also use our modules with Stache as a plugin

require('can-view-target');


if(!viewCallbacks.tag("content")) {
	// This was moved from the legacy view/scanner.js to here.
	// This makes sure content elements will be able to have a callback.
	viewCallbacks.tag("content", function(el, tagData) {
		return tagData.scope;
	});
}

var isViewSymbol = canSymbol.for("can.isView");

var wrappedAttrPattern = /[{(].*[)}]/;
var colonWrappedAttrPattern = /^on:|(:to|:from|:bind)$|.*:to:on:.*/;
var svgNamespace = "http://www.w3.org/2000/svg",
xmlnsAttrNamespaceURI = "http://www.w3.org/2000/xmlns/",
xlinkHrefAttrNamespaceURI =  "http://www.w3.org/1999/xlink";
var namespaces = {
	"svg": svgNamespace,
	// this allows a partial to start with g.
	"g": svgNamespace,
	"defs": svgNamespace,
	"path": svgNamespace,
	"filter": svgNamespace,
	"feMorphology": svgNamespace,
	"feGaussianBlur": svgNamespace,
	"feOffset": svgNamespace,
	"feComposite": svgNamespace,
	"feColorMatrix": svgNamespace,
	"use": svgNamespace
},
	attrsNamespacesURI = {
		'xmlns': xmlnsAttrNamespaceURI,
		'xlink:href': xlinkHrefAttrNamespaceURI
	},
	textContentOnlyTag = {style: true, script: true};

function stache (filename, template) {
	if (arguments.length === 1) {
		template = arguments[0];
		filename = undefined;
	}

	var inlinePartials = {};

	// Remove line breaks according to mustache's specs.
	if(typeof template === "string") {
		template = mustacheCore.cleanWhitespaceControl(template);
		template = mustacheCore.cleanLineEndings(template);
	}

	// The HTML section that is the root section for the entire template.
	var section = new HTMLSectionBuilder(filename),
		// Tracks the state of the parser.
		state = {
			node: null,
			attr: null,
			// A stack of which node / section we are in.
			// There is probably a better way of doing this.
			sectionElementStack: [],
			// If text should be inserted and HTML escaped
			text: false,
			// which namespace we are in
			namespaceStack: [],
			// for style and script tags
			// we create a special TextSectionBuilder and add things to that
			// when the element is done, we compile the text section and
			// add it as a callback to `section`.
			textContentOnly: null

		},

		// This function is a catch all for taking a section and figuring out
		// how to create a "renderer" that handles the functionality for a
		// given section and modify the section to use that renderer.
		// For example, if an HTMLSection is passed with mode `#` it knows to
		// create a liveBindingBranchRenderer and pass that to section.add.
		// jshint maxdepth:5
		makeRendererAndUpdateSection = function(section, mode, stache, lineNo){

			if(mode === ">") {
				// Partials use liveBindingPartialRenderers
				section.add(mustacheCore.makeLiveBindingPartialRenderer(stache, copyState({ filename: section.filename, lineNo: lineNo })));

			} else if(mode === "/") {

				var createdSection = section.last();
				if ( createdSection.startedWith === "<" ) {
					inlinePartials[ stache ] = section.endSubSectionAndReturnRenderer();
					// Remove *TWO* nodes because we now have a start and an end comment for the section....
					section.removeCurrentNode();
					section.removeCurrentNode();
				} else {
					section.endSection();
				}

				// to avoid "Blocks are nested too deeply" when linting
				//!steal-remove-start
				if (process.env.NODE_ENV !== 'production') {
					if(section instanceof HTMLSectionBuilder) {
						var last = state.sectionElementStack[state.sectionElementStack.length - 1];
						if (last.tag && last.type === "section" && stache !== "" && stache !== last.tag) {
							if (filename) {
								dev.warn(filename + ":" + lineNo + ": unexpected closing tag {{/" + stache + "}} expected {{/" + last.tag + "}}");
							}
							else {
								dev.warn(lineNo + ": unexpected closing tag {{/" + stache + "}} expected {{/" + last.tag + "}}");
							}
						}
					}
				}
				//!steal-remove-end

				if(section instanceof HTMLSectionBuilder) {
					state.sectionElementStack.pop();
				}
			} else if(mode === "else") {

				section.inverse();

			} else {

				// If we are an HTMLSection, we will generate a
				// a LiveBindingBranchRenderer; otherwise, a StringBranchRenderer.
				// A LiveBindingBranchRenderer function processes
				// the mustache text, and sets up live binding if an observable is read.
				// A StringBranchRenderer function processes the mustache text and returns a
				// text value.
				var makeRenderer = section instanceof HTMLSectionBuilder ?
					mustacheCore.makeLiveBindingBranchRenderer:
					mustacheCore.makeStringBranchRenderer;

				if(mode === "{" || mode === "&") {

					// Adds a renderer function that just reads a value or calls a helper.
					section.add(makeRenderer(null,stache, copyState({ filename: section.filename, lineNo: lineNo })));

				} else if(mode === "#" || mode === "^" || mode === "<") {
					// Adds a renderer function and starts a section.
					var renderer = makeRenderer(mode, stache, copyState({ filename: section.filename, lineNo: lineNo }));
					var sectionItem = {
						type: "section"
					};
					section.startSection(renderer, stache);
					section.last().startedWith = mode;

					// If we are a directly nested section, count how many we are within
					if(section instanceof HTMLSectionBuilder) {
						//!steal-remove-start
						if (process.env.NODE_ENV !== 'production') {
							var tag = typeof renderer.exprData.closingTag === 'function' ?
								renderer.exprData.closingTag() : stache;
							sectionItem.tag = tag;
						}
						//!steal-remove-end

						state.sectionElementStack.push(sectionItem);
					}
				} else {
					// Adds a renderer function that only updates text.
					section.add(makeRenderer(null, stache, copyState({text: true, filename: section.filename, lineNo: lineNo })));
				}

			}
		},
		isDirectlyNested = function() {
			var lastElement = state.sectionElementStack[state.sectionElementStack.length - 1];
			return state.sectionElementStack.length ?
				lastElement.type === "section" || lastElement.type === "custom": true;
		},
		// Copys the state object for use in renderers.
		copyState = function(overwrites){

			var cur = {
				tag: state.node && state.node.tag,
				attr: state.attr && state.attr.name,
				// <content> elements should be considered direclty nested
				directlyNested: isDirectlyNested(),
				textContentOnly: !!state.textContentOnly
			};
			return overwrites ? assign(cur, overwrites) : cur;
		},
		addAttributesCallback = function(node, callback){
			if( !node.attributes ) {
				node.attributes = [];
			}
			node.attributes.unshift(callback);
		};

	parser(template, {
		filename: filename,
		start: function(tagName, unary, lineNo){
			var matchedNamespace = namespaces[tagName];

			if (matchedNamespace && !unary ) {
				state.namespaceStack.push(matchedNamespace);
			}

			// either add templates: {} here or check below and decorate
			// walk up the stack/targetStack until you find the first node
			// with a templates property, and add the popped renderer
			state.node = {
				tag: tagName,
				children: [],
				namespace: matchedNamespace || last(state.namespaceStack)
			};
		},
		end: function(tagName, unary, lineNo){
			var isCustomTag =  viewCallbacks.tag(tagName);
			var directlyNested = isDirectlyNested();
			if(unary){
				// If it's a custom tag with content, we need a section renderer.
				section.add(state.node);
				if(isCustomTag) {
					// Call directlyNested now as it's stateful.
					addAttributesCallback(state.node, function(scope){
						//!steal-remove-start
						if (process.env.NODE_ENV !== 'production') {
							scope.set('scope.lineNumber', lineNo);
						}
						//!steal-remove-end
						viewCallbacks.tagHandler(this,tagName, {
							scope: scope,
							subtemplate: null,
							templateType: "stache",
							directlyNested: directlyNested
						});
					});
				}
			} else {
				section.push(state.node);

				state.sectionElementStack.push({
					type: isCustomTag ? "custom" : null,
					tag: isCustomTag ? null : tagName,
					templates: {},
					directlyNested: directlyNested
				});

				// If it's a custom tag with content, we need a section renderer.
				if( isCustomTag ) {
					section.startSubSection();
				} else if(textContentOnlyTag[tagName]) {
					state.textContentOnly = new TextSectionBuilder(filename);
				}
			}


			state.node =null;

		},
		close: function(tagName, lineNo) {
			var matchedNamespace = namespaces[tagName];

			if (matchedNamespace  ) {
				state.namespaceStack.pop();
			}

			var isCustomTag = viewCallbacks.tag(tagName),
				renderer;

			if( isCustomTag ) {
				renderer = section.endSubSectionAndReturnRenderer();
			}

			if(textContentOnlyTag[tagName]) {
				section.last().add(state.textContentOnly.compile(copyState()));
				state.textContentOnly = null;
			}

			var oldNode = section.pop();
			if( isCustomTag ) {
				if (tagName === "can-template") {
					// If we find a can-template we want to go back 2 in the stack to get it's inner content
					// rather than the <can-template> element itself
					var parent = state.sectionElementStack[state.sectionElementStack.length - 2];
					if (renderer) {// Only add the renderer if the template has content
						parent.templates[oldNode.attrs.name] = makeRendererConvertScopes(renderer);
					}
					section.removeCurrentNode();
				} else {
					// Get the last element in the stack
					var current = state.sectionElementStack[state.sectionElementStack.length - 1];
					addAttributesCallback(oldNode, function(scope){
						//!steal-remove-start
						if (process.env.NODE_ENV !== 'production') {
							scope.set('scope.lineNumber', lineNo);
						}
						//!steal-remove-end
						viewCallbacks.tagHandler(this,tagName, {
							scope: scope,
							subtemplate: renderer  ? makeRendererConvertScopes(renderer) : renderer,
							templateType: "stache",
							templates: current.templates,
							directlyNested: current.directlyNested
						});
					});
				}
			}
			state.sectionElementStack.pop();
		},
		attrStart: function(attrName, lineNo){
			if(state.node.section) {
				state.node.section.add(attrName+"=\"");
			} else {
				state.attr = {
					name: attrName,
					value: ""
				};
			}

		},
		attrEnd: function(attrName, lineNo){
			var matchedAttrNamespacesURI = attrsNamespacesURI[attrName];
			if(state.node.section) {
				state.node.section.add("\" ");
			} else {
				if(!state.node.attrs) {
					state.node.attrs = {};
				}

				if (state.attr.section) {
					state.node.attrs[state.attr.name] = state.attr.section.compile(copyState());
				} else if (matchedAttrNamespacesURI) {
					state.node.attrs[state.attr.name] = {
						value: state.attr.value,
						namespaceURI: attrsNamespacesURI[attrName]
					};
				} else {
					state.node.attrs[state.attr.name] = state.attr.value;
				}

				var attrCallback = viewCallbacks.attr(attrName);

				//!steal-remove-start
				if (process.env.NODE_ENV !== 'production') {
					var decodedAttrName = attributeEncoder.decode(attrName);
					var weirdAttribute = !!wrappedAttrPattern.test(decodedAttrName) || !!colonWrappedAttrPattern.test(decodedAttrName);
					if (weirdAttribute && !attrCallback) {
						dev.warn("unknown attribute binding " + decodedAttrName + ". Is can-stache-bindings imported?");
					}
				}
				//!steal-remove-end

				if(attrCallback) {
					if( !state.node.attributes ) {
						state.node.attributes = [];
					}
					state.node.attributes.push(function(scope){
						//!steal-remove-start
						if (process.env.NODE_ENV !== 'production') {
							scope.set('scope.lineNumber', lineNo);
						}
						//!steal-remove-end
						attrCallback(this,{
							attributeName: attrName,
							scope: scope
						});
					});
				}

				state.attr = null;
			}
		},
		attrValue: function(value, lineNo){
			var section = state.node.section || state.attr.section;
			if(section){
				section.add(value);
			} else {
				state.attr.value += value;
			}
		},
		chars: function(text, lineNo) {
			(state.textContentOnly || section).add(text);
		},
		special: function(text, lineNo){
			var firstAndText = mustacheCore.splitModeFromExpression(text, state),
				mode = firstAndText.mode,
				expression = firstAndText.expression;


			if(expression === "else") {
				var inverseSection;
				if(state.attr && state.attr.section) {
					inverseSection = state.attr.section;
				} else if(state.node && state.node.section ) {
					inverseSection = state.node.section;
				} else {
					inverseSection = state.textContentOnly || section;
				}
				inverseSection.inverse();
				return;
			}

			if(mode === "!") {
				return;
			}

			if(state.node && state.node.section) {

				makeRendererAndUpdateSection(state.node.section, mode, expression, lineNo);

				if(state.node.section.subSectionDepth() === 0){
					state.node.attributes.push( state.node.section.compile(copyState()) );
					delete state.node.section;
				}

			}
			// `{{}}` in an attribute like `class="{{}}"`
			else if(state.attr) {

				if(!state.attr.section) {
					state.attr.section = new TextSectionBuilder(filename);
					if(state.attr.value) {
						state.attr.section.add(state.attr.value);
					}
				}
				makeRendererAndUpdateSection(state.attr.section, mode, expression, lineNo);

			}
			// `{{}}` in a tag like `<div {{}}>`
			else if(state.node) {

				if(!state.node.attributes) {
					state.node.attributes = [];
				}
				if(!mode) {
					state.node.attributes.push(mustacheCore.makeLiveBindingBranchRenderer(null, expression, copyState({ filename: section.filename, lineNo: lineNo })));
				} else if( mode === "#" || mode === "^" ) {
					if(!state.node.section) {
						state.node.section = new TextSectionBuilder(filename);
					}
					makeRendererAndUpdateSection(state.node.section, mode, expression, lineNo);
				} else {
					throw new Error(mode+" is currently not supported within a tag.");
				}
			}
			else {
				makeRendererAndUpdateSection(state.textContentOnly || section, mode, expression, lineNo);
			}
		},
		comment: function(text) {
			// create comment node
			section.add({
				comment: text
			});
		},
		done: function(lineNo){
			//!steal-remove-start
			// warn if closing magic tag is missed #675
			if (process.env.NODE_ENV !== 'production') {
				var last = state.sectionElementStack[state.sectionElementStack.length - 1];
				if (last && last.tag && last.type === "section") {
					if (filename) {
						dev.warn(filename + ":" + lineNo + ": closing tag {{/" + last.tag + "}} was expected");
					}
					else {
						dev.warn(lineNo + ": closing tag {{/" + last.tag + "}} was expected");
					}
				}
			}
			//!steal-remove-end
		}
	});

	var renderer = section.compile();

	var scopifiedRenderer = ObservationRecorder.ignore(function(scope, options){
		// if an object is passed to options, assume it is the helpers object
		if (options && !options.helpers && !options.partials && !options.tags) {
			options = {
				helpers: options
			};
		}
		// mark passed in helper so they will be automatically passed
		// helperOptions (.fn, .inverse, etc) when called as Call Expressions
		canReflect.eachKey(options && options.helpers, function(helperValue) {
			helperValue.requiresOptionsArgument = true;
		});

		// helpers, partials, tags, vars
		var templateContext = new TemplateContext(options);

		// copy inline partials over
		canReflect.eachKey(inlinePartials, function(partial, partialName) {
			canReflect.setKeyValue(templateContext.partials, partialName, partial);
		});

		// allow the current renderer to be called with {{>scope.view}}
		canReflect.setKeyValue(templateContext, 'view', scopifiedRenderer);
		//!steal-remove-start
		if (process.env.NODE_ENV !== 'production') {
			canReflect.setKeyValue(templateContext, 'filename', section.filename);
		}
		//!steal-remove-end


		// now figure out the final structure ...
		if ( !(scope instanceof Scope) ) {
			scope = new Scope(templateContext).add(scope);
		} else {
			// we are going to split ...
			var templateContextScope = new Scope(templateContext);
			templateContextScope._parent = scope._parent;
			scope._parent = templateContextScope;
		}

		return renderer(scope.addLetContext());
	});

	// Identify is a view type
	scopifiedRenderer[isViewSymbol] = true;

	return scopifiedRenderer;
}

// At this point, can.stache has been created
assign(stache, mustacheHelpers);

stache.safeString = function(text){

	return canReflect.assignSymbols({},{
		"can.toDOM": function(){
			return text;
		}
	});
};
stache.async = function(source){
	var iAi = getIntermediateAndImports(source);
	var importPromises = iAi.imports.map(function(moduleName){
		return importer(moduleName);
	});
	return Promise.all(importPromises).then(function(){
		return stache(iAi.intermediate);
	});
};
var templates = {};
stache.from = mustacheCore.getTemplateById = function(id){
	if(!templates[id]) {
		var el = DOCUMENT().getElementById(id);
		if(el) {
			templates[id] = stache("#" + id, el.innerHTML);
		}
	}
	return templates[id];
};

stache.registerPartial = function(id, partial) {
	templates[id] = (typeof partial === "string" ? stache(partial) : partial);
};

stache.addBindings = viewCallbacks.attrs;

module.exports = namespace.stache = stache;
