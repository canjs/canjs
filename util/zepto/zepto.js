steal('./zepto.0.8.js').then('./data').then('./fill', function(){

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