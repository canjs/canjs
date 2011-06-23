steal.plugins('jquery/lang/observe').then(function(){
	
	
	var matches = function(delegate, props){
		//check props parts are the same or 
		var parts = delegate.parts,
			len = parts.length,
			i =0;
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
		delegate = function(event, prop, how, value, current){
			var props = prop.split("."),
				delegates = $([this]).data("_observe_delegates") || [];
			
			for(var i =0; i < delegates.length; i++){
				if(matches(delegates[i], props)){
					delegates[i].callback.apply(this.attr(prop), arguments);
				}
			}
		};
		
	$.extend($.Observe.prototype,{
		delegate :  function(attr, event, cb){
			var delegates = $.data(this, "_observe_delegates") ||
				$.data(this, "_observe_delegates", []);
				
			delegates.push({
				attr : attr,
				parts : attr.split('.'),
				callback : cb
			});
			if(delegates.length === 1){
				this.bind("change",delegate)
			}
			return this;
		},
		undelegate : function(attr, event, cb){
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
