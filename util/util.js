Can = {};
steal('./zepto/zepto',function(){
	
	if($.event.trigger){
		Can.trigger= function(parent, ev, args){
			$.event.trigger(ev, args, parent, true)
		}
	}
	
})



