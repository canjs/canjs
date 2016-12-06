/*!
 * CanJS - 2.0.0-pre
 * http://canjs.us/
 * Copyright (c) 2013 Bitovi
 * Wed, 16 Oct 2013 21:43:53 GMT
 * Licensed MIT
 * Includes: CanJS default build
 * Download from: http://canjs.us/
 */
steal("can/util","can/control","can/observe","can/view/mustache","can/view/bindings",function(can){
	
	var ignoreAttributesRegExp = /data-view-id|class|id/i
	/**
	 * @add can.Component
	 */
	var Component = can.Component = can.Construct.extend(
	/**
	 * @static
	 */
	{
		setup: function(){
			can.Construct.setup.apply( this, arguments );
			
			if(can.Component){
				var self = this;
				this.Control = can.Control.extend({
					_lookup: function(options){
						return [options.scope, options, window]
					}
				},can.extend({
					setup: function(el, options){
						var res = can.Control.prototype.setup.call(this, el, options)
						this.scope = options.scope;
						// call on() whenever scope changes
						var self = this;
						this.on(this.scope,"change",function(){
							self.on();
							self.on(this.scope,"change",arguments.callee);
						});
						return res;
					}
				},this.prototype.events));
				
				var attributeScopeMappings = {};
				// go through scope and get attribute ones
				can.each(this.prototype.scope, function(val, prop){
					if(val === "@") {
						attributeScopeMappings[prop] = prop;
					}
				}) 
				this.attributeScopeMappings = attributeScopeMappings;
				
				// setup inheritance right away
				if(! this.prototype.scope || typeof this.prototype.scope === "object" ){
					this.Map = can.Map.extend( this.prototype.scope||{} );
				}
				
				
				
				
				if(this.prototype.template){
					if(typeof this.prototype.template == "function"){
						var temp = this.prototype.template
						this.renderer = function(){
							return can.view.frag(temp.apply(null, arguments))
						}
					} else {
						this.renderer =can.view.mustache( this.prototype.template );
					}
				}
				
				
				
				can.view.Scanner.tag(this.prototype.tag,function(el, options){
					new self(el, options)
				});
			}
			
		}
	},{
		/**
		 * @prototype
		 */
		setup: function(el, hookupOptions){
			// Setup values passed to component
			var initalScopeData = {},
				component = this;
			
			// scope prototype properties marked with an "@" are added here
			can.each(this.constructor.attributeScopeMappings,function(val, prop){
				initalScopeData[prop] = el.getAttribute(val)
			})
			
			// get the value in the scope for each attribute
			// the hookup should probably happen after?
			can.each(can.makeArray(el.attributes), function(node, index){
				
				var name = node.nodeName.toLowerCase(),
					value = node.value;
				
				// ignore attributes already in ScopeMappings
				if(component.constructor.attributeScopeMappings[name] || ignoreAttributesRegExp.test(name)){
					return;
				}
				
				// get the value from the current scope
				var scopeValue = hookupOptions.scope.attr(value);
				if(can.isFunction(scopeValue) && !scopeValue.isComputed){
					
					var data = hookupOptions.scope.get(value)
					
					scopeValue = data.value.call(data.parent)
					
				} 
				initalScopeData[name] = scopeValue;
				
				// if this is something that we can auto-update, lets do that
				var compute = hookupOptions.scope.compute(value),
					handler = function(ev, newVal){
						componentScope.attr(name, newVal)
					}
				// compute only returned if bindable
				if(compute){
					compute.bind("change", handler);
					can.bind.call(el,"removed",function(){
						compute.unbind("change", handler);
					})
				}
			})
			
			var componentScope
			// save the scope
			if(this.constructor.Map){
				componentScope = new this.constructor.Map(initalScopeData);
			} else if(can.isFunction(this.scope)){
				var scopeResult = this.scope(initalScopeData, hookupOptions.scope, el);
				// if the function returns a can.Map, use that as the scope
				if(scopeResult instanceof can.Map){
					componentScope = scopeResult
				} else if(typeof scopeResult == "function" && typeof scopeResult.extend == "function"){
					componentScope = new scopeResult(initalScopeData);
				} else {
					componentScope = new ( can.Map.extend(scopeResult) )(initalScopeData);
				}
				
			}
			
			this.scope = componentScope;
			can.data(can.$(el),"scope", this.scope)
			
			// create a real Scope object out of the scope property
			var renderedScope = hookupOptions.scope.add( this.scope ),
			
				// setup helpers to callback with `this` as the component
				helpers = this.helpers || {};
			can.each(helpers, function(val, prop){
				if(can.isFunction(val)) {
					helpers[prop] = function(){
						return val.apply(componentScope, arguments)
					}
				}
			});
			
			// create a control to listen to events
			this._control = new this.constructor.Control(el, {scope: this.scope});
			
			// if this component has a template (that we've already converted to a renderer)
			if( this.constructor.renderer ) {
				// add content to tags
				if(!helpers._tags){
					helpers._tags = {};
				}
				
				// we need be alerted to when a <content> element is rendered so we can put the original contents of the widget in its place
				helpers._tags.content = function(el, rendererOptions){
					// first check if there was content within the custom tag
					// otherwise, render what was within <content>, the default code
					var subtemplate = hookupOptions.subtemplate || rendererOptions.subtemplate
					if(subtemplate) {
						var frag = can.view.frag( subtemplate(renderedScope, rendererOptions.options.add(helpers) ) );
						can.insertBefore(el.parentNode, frag, el);
						can.remove( can.$(el) );
					}
				}
				// render the component's template
				var frag = this.constructor.renderer( renderedScope, helpers);
			} else {
				// otherwise render the contents between the 
				var frag = can.view.frag( hookupOptions.subtemplate ? hookupOptions.subtemplate(renderedScope, hookupOptions.options.add(helpers)) : "");
			}
			can.appendChild(el, frag);
		}
	})
	
	if(window.$ && $.fn){
		$.fn.scope = function(attr){
			if( attr ) {
				return this.data("scope").attr(attr)
			} else {
				return this.data("scope")
			}
		}
	}
	
	
	can.scope = function(el, attr){
		var el = can.$(el);
		if( attr ){
			return can.data(el,"scope").attr(attr)
		} else {
			return can.data(el, "scope")
		}
	}
	
	return Component;
})
