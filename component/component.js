steal("can/util","can/control","can/observe","can/view/mustache","can/view/mustache/bindings",function(can){
	
	var Component = can.Component = can.Construct.extend({
		setup: function(){
			can.Construct.setup.apply( this, arguments );
			
			if(can.Component){
				var self = this;
				this.Control = can.Control.extend(can.extend({
					init: function(el, options){
						this.scope = options.scope;
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
				
				this.Map = can.Map.extend(this.prototype.scope);
				if(this.prototype.template){
					this.renderer = typeof this.prototype.template == "function" ?
						this.prototype.template : can.view.mustache( this.prototype.template );
				}
				
				
				
				can.view.Scanner.tag(this.prototype.tag,function(el, options){
					new self(el, options)
				});
			}
			
		}
	},{
		setup: function(el, options){
			
			var data = {},
				component = this;
			
			can.each(this.constructor.attributeScopeMappings,function(val, prop){
				data[prop] = el.getAttribute(val)
			})
			
			can.each(can.makeArray(el.attributes), function(node, index){
				var name = node.nodeName.toLowerCase();
				
				if(!component.constructor.attributeScopeMappings[name] && name !== "data-view-id"){
					data[name] = options.scope.attr(name);
					var compute = options.scope.compute(name),
						handler = function(ev, newVal){
							componentScope.attr(name, newVal)
						}
					// compute only given if bindable
					if(compute){
						compute.bind("change", handler);
						can.bind.call(el,"removed",function(){
							compute.unbind("change", handler);
						})
					}
					
				}
			})
			
			var componentScope = this.scope = new this.constructor.Map(data);
			
			$(el).data("scope", this.scope)
			
			
			var renderedScope = options.scope.add( this.scope );
			
			this._control = new this.constructor.Control(el, {scope: this.scope});
			
			var renderer = typeof options.subtemplate == "string" ?
				can.view.mustache(options.subtemplate) : options.subtemplate;
			
			if( this.constructor.renderer ) {
				// add content to tags
				var helpers = this.helpers || {};
				if(!helpers._tags){
					helpers._tags = {};
				}
				helpers._tags.content = function(el, rendererOptions){
					if(options.subtemplate){
						var subtemplate = can.view.frag( options.subtemplate.call(renderedScope, helpers) );
						$(el).replaceWith(subtemplate)
					} else {
						return rendererOptions.scope;
					}
				}
				can.each(helpers, function(val, prop){
					if(can.isFunction(val)) {
						helpers[prop] = function(){
							return val.apply(componentScope, arguments)
						}
					}
				});
				
				// somehow need to get <content>, and put subtemplate in there
				var frag = this.constructor.renderer( renderedScope, helpers);
				// render subtemplate
				
			} else {
				var frag = can.view.frag( options.subtemplate.call(renderedScope) );
			}
			$(el).html(  frag )
		}
	})
	
	
	$.fn.scope = function(attr){
		if( attr ) {
			return this.data("scope").attr(attr)
		} else {
			return this.data("scope")
		}
	}
	
	return Component;
	
})
