"use strict";
var target = require('can-view-target');
var utils = require('./utils');
var getDocument = require("can-globals/document/document");

var assign = require('can-assign');


var last = utils.last;

var decodeHTML = typeof document !== "undefined" && (function(){
	var el = getDocument().createElement('div');
	return function(html){
		if(html.indexOf("&") === -1) {
			return html.replace(/\r\n/g,"\n");
		}
		el.innerHTML = html;
		return el.childNodes.length === 0 ? "" : el.childNodes.item(0).nodeValue;
	};
})();
// ## HTMLSectionBuilder
//
// Contains a stack of HTMLSections.
// An HTMLSection is created everytime a subsection is found. For example:
//
//     {{#if(items)}} {{#items}} X
//
// At the point X was being processed, there would be 2 HTMLSections in the
// stack.  One for the content of `{{#if(items)}}` and the other for the
// content of `{{#items}}`
var HTMLSectionBuilder = function(filename){
	if (filename) {
		this.filename = filename;
	}
	this.stack = [new HTMLSection()];
};


assign(HTMLSectionBuilder.prototype,utils.mixins);

assign(HTMLSectionBuilder.prototype,{
	startSubSection: function(process){
		var newSection = new HTMLSection(process);
		this.stack.push(newSection);
		return newSection;
	},
	// Ends the current section and returns a renderer.
	// But only returns a renderer if there is a template.
	endSubSectionAndReturnRenderer: function(){
		if(this.last().isEmpty()) {
			this.stack.pop();
			return null;
		} else {
			var htmlSection = this.endSection();
			return utils.makeView(htmlSection.compiled.hydrate.bind(htmlSection.compiled));
		}
	},
	startSection: function( process, commentName ) {
		var newSection = new HTMLSection(process);
		this.last().add({
			comment: commentName || "#section",
			callbacks: [newSection.targetCallback]
		});
		this.last().add({
			comment: "can-end-placeholder"
		});
		// adding a section within a section ...
		// the stack has section ...
		this.stack.push(newSection);
	},
	endSection: function(){
		this.last().compile();
		return this.stack.pop();
	},
	inverse: function(){
		this.last().inverse();
	},
	compile: function(){
		var compiled = this.stack.pop().compile();
		// ignore observations here.  the render fn
		//  itself doesn't need to be observable.
		return utils.makeView( compiled.hydrate.bind(compiled) );
	},
	push: function(chars){
		this.last().push(chars);
	},
	pop: function(){
		return this.last().pop();
	},
	removeCurrentNode: function() {
		this.last().removeCurrentNode();
	}
});

var HTMLSection = function(process){
	this.data = "targetData";
	this.targetData = [];
	// A record of what targetData element we are within.
	this.targetStack = [];
	var self = this;
	this.targetCallback = function(scope){
		process.call(this,
			scope,
			self.compiled.hydrate.bind(self.compiled),
			self.inverseCompiled && self.inverseCompiled.hydrate.bind(self.inverseCompiled)  ) ;
	};
};
assign(HTMLSection.prototype,{
	inverse: function(){
		this.inverseData = [];
		this.data = "inverseData";
	},
	// Adds a DOM node.
	push: function(data){
		this.add(data);
		this.targetStack.push(data);
	},
	pop: function(){
		return this.targetStack.pop();
	},
	add: function(data){
		if(typeof data === "string"){
			data = decodeHTML(data);
		}
		if(this.targetStack.length) {
			last(this.targetStack).children.push(data);
		} else {
			this[this.data].push(data);
		}
	},
	compile: function(){
		this.compiled = target(this.targetData, getDocument());
		if(this.inverseData) {
			this.inverseCompiled = target(this.inverseData, getDocument());
			delete this.inverseData;
		}
		this.targetStack = this.targetData = null;
		return this.compiled;
	},
	removeCurrentNode: function() {
		var children = this.children();
		return children.pop();
	},
	children: function(){
		if(this.targetStack.length) {
			return last(this.targetStack).children;
		} else {
			return this[this.data];
		}
	},
	// Returns if a section is empty
	isEmpty: function(){
		return !this.targetData.length;
	}
});
HTMLSectionBuilder.HTMLSection = HTMLSection;

module.exports = HTMLSectionBuilder;
