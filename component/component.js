steal("can/util","can/control","can/observe","can/view/mustache",function(can){
	
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
			
			var data = {};
			can.each(this.constructor.attributeScopeMappings,function(val, prop){
				data[prop] = el.getAttribute(val)
			})
			
			this.scope = new this.constructor.Map(data);
			
			$(el).data("scope", this.scope)
			
			
			var renderedScope = options.scope.add( this.scope );
			
			this._control = new this.constructor.Control(el, {scope: this.scope});
			
			var renderer = typeof options.subtemplate == "string" ?
				can.view.mustache(options.subtemplate) : options.subtemplate;
			
			
			
			if( this.constructor.renderer ) {
				
				
				var frag = this.constructor.renderer( renderedScope, this.helpers );
				// render subtemplate
				if(options.subtemplate){
					var subtemplate = can.view.frag( options.subtemplate.call(renderedScope) );
					// find content
					var children = $(frag).children("content");
					if(!children.length){
						children = $(frag).children().find("content")
					} 
					children.replaceWith(subtemplate)
				}
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
