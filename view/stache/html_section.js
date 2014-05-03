steal("can/util","can/view/target","./utils.js","./mustache_core.js",function( can, target, utils, mustacheCore ) {

	
	var decodeHTML = (function(){
		var el = document.createElement('div');
		return function(html){
			if(html.indexOf("&") === -1) {
				return html.replace(/\r\n/g,"\n");
			}
			el.innerHTML = html;
			return el.childNodes.length === 0 ? "" : el.childNodes[0].nodeValue;
		};
	})();
	// ## HTMLSectionBuilder
	//
	// Contains a stack of HTMLSections.
	// An HTMLSection is created everytime a subsection is found. For example:
	// 
	//     {{#if items}} {{#items}} X
	//
	// At the point X was being processed, their would be 2 HTMLSections in the 
	// stack.  One for the content of `{{#if items}}` and the other for the
	// content of `{{#items}}`
	var HTMLSectionBuilder = function(){
		this.stack = [new HTMLSection()];
	};
	
	can.extend(HTMLSectionBuilder.prototype,utils.mixins);
	
	can.extend(HTMLSectionBuilder.prototype,{
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
				return can.proxy(htmlSection.compiled.hydrate, htmlSection.compiled);
			}
		},
		startSection: function( process ) {
			var newSection = new HTMLSection(process);
			this.last().add(newSection.targetCallback);
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
			
			return function(scope, options){
				if ( !(scope instanceof can.view.Scope) ) {
					scope = new can.view.Scope(scope || {});
				}
				if ( !(options instanceof mustacheCore.Options) ) {
					options = new mustacheCore.Options(options || {});
				}
				return compiled.hydrate(scope, options);
			};
		},
		push: function(chars){
			this.last().push(chars);
		},
		pop: function(){
			return this.last().pop();
		}
	});
	
	var HTMLSection = function(process){
		this.data = "targetData";
		this.targetData = [];
		// A record of what targetData element we are within.
		this.targetStack = [];
		var self = this;
		this.targetCallback = function(scope, options){
			process.call(this,
				scope,
				options,
				can.proxy(self.compiled.hydrate, self.compiled),
				self.inverseCompiled && can.proxy(self.inverseCompiled.hydrate, self.inverseCompiled)  ) ;
		};
	};
	can.extend(HTMLSection.prototype,{
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
				this.targetStack[this.targetStack.length-1].children.push(data);
			} else {
				this[this.data].push(data);
			}
		},
		compile: function(){
			this.compiled = target(this.targetData);
			if(this.inverseData) {
				this.inverseCompiled = target(this.inverseData);
				delete this.inverseData;
			}
			delete this.targetData;
			delete this.targetStack;
			return this.compiled;
		},
		children: function(){
			if(this.targetStack.length) {
				return this.targetStack[this.targetStack.length-1].children;
			} else {
				return this[this.data];
			}
		},
		// Returns if a section is empty
		isEmpty: function(){
			return !this.targetData.length;
		}
	});
	
	return HTMLSectionBuilder;
	
});