Can = {};
steal('./jquery.js',function(){
	Can.trigger= function(parent, ev, args){
		$.event.trigger(ev, args, parent, true)
	}
})



