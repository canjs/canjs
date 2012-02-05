steal(function($){
	Can.trigger = function(obj, event, args){
		$.event.trigger(event, args, obj, true)
	}
})