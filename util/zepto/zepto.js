steal('./zepto.0.8.js').then('./data').then('./fill', function(){


Can.trigger = function(obj, event, args){
	$([obj]).trigger(event, args)
}

	
})