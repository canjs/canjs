Can = {};
steal('./jquery.js',function(){

	if($.event.trigger){
		Can.trigger= function(parent, ev, args){
			$.event.trigger(ev, args, parent, true)
		}
	}
	
})



