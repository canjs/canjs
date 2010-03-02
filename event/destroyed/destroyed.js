steal.apps('jquery').then(function($){
	$.event.special["destroyed"] = {
		remove: function( ){
			$(this).triggerHandler("destroyed")
		},
		setup : function(handleObj){
			
		}
	}
})