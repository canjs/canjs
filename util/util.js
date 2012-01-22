Can = {};
steal('./zepto').then('./zepto_fill', function(){

if(window.jQuery){
	Can.trigger = function(obj, event, args){
		$.event.trigger(event, args, obj, true)
	}
} else {
	Can.trigger = function(obj, event, args){
		$([obj]).trigger(event, args)
	}
}
	
})



