steal('jquery/lang/observe',function(){
	
	// tells if the parts part of a delegate matches the broken up props of the event
	var matches = function(delegate, props){
		//check props parts are the same or 
		var parts = delegate.parts,
			len = parts.length,
			i =0;
		
		// if the event matches
		for(i; i< len; i++){
			if(parts[i] == "**") {
				return true;
			} else if( props[i] && ( props[i] === parts[i] || parts[i] === "*" ) ) {
				
			} else {
				return false;
			}
		}
		return len === props.length;
	},
		delegate = function(event, prop, how, newVal, oldVal){
			var props = prop.split("."),
				delegates = $.data(this,"_observe_delegates") || [],
				delegate;
			
			for(var i =0; i < delegates.length; i++){
				// check delegate.event
				delegate = delegates[i];
				
				if(  delegate.event === 'change' && matches(delegate, props) ){
					delegate.callback.apply(this.attr(prop), arguments);
				} else if(delegate.event === how && matches(delegate, props) ){
					delegate.callback.apply(this.attr(prop), [event,newVal, oldVal]);
				} else if(delegate.event === 'set' && how == 'add' && matches(delegates[i], props)) {
					delegate.callback.apply(this.attr(prop), [event,newVal, oldVal]);
				}
			}
		};
		
	$.extend($.Observe.prototype,{
		/**
		 * listens for changes in a child from the parent
		 * 
		 * observe.delegate("foo.bar","change", function(){
		 *   // foo.bar has been added, set, or removed
		 * });
		 * 
		 * @param {String} attr
		 * @param {String} event
		 * @param {Function} cb
		 */
		delegate :  function(attr, event, cb){
			attr = $.trim(attr);
			var delegates = $.data(this, "_observe_delegates") ||
				$.data(this, "_observe_delegates", []);
			attr = $.trim(attr);
			delegates.push({
				attr : attr,
				parts : attr.split('.'),
				callback : cb,
				event: event
			});
			if(delegates.length === 1){
				this.bind("change",delegate)
			}
			return this;
		},
		undelegate : function(attr, event, cb){
			attr = $.trim(attr);
			
			var i =0,
				delegates = $.data(this, "_observe_delegates") || [],
				delegate;
			if(attr){
				while(i < delegates.length){
					delegate = delegates[i];
					if( delegate.callback === cb ||
						(!cb && delegate.attr === attr) ){
						delegates.splice(i,1)
					} else {
						i++;
					}
				}
			} else {
				delegates = [];
			}
			if(!delegates.length){
				$.removeData(this, "_observe_delegates");
				this.unbind("change",delegate)
			}
			return this;
		}
	})
})
