steal('can', function(can){
	
	
	
	
	var events = [],
		transactionCount = 0,
		originalBatchTrigger = can.batch.trigger,
		changedBatchTrigger = function(obj, ev){
			originalBatchTrigger.apply(this, arguments);
			if(ev === "change"){
				var args = can.makeArray(arguments);
				args[1] = "changed";
				originalBatchTrigger.apply(this, args);
			}
		},
		recordingBatchTrigger = function(obj, ev){
			originalBatchTrigger.apply(this, arguments);
			if(ev === "change"){
				var args = can.makeArray(arguments);
				args[1] = "changed";
				events.push( args );
			}
		};
	
	can.batch.trigger = changedBatchTrigger;
	
	can.transaction = function(){
		if( transactionCount === 0 ) {
			can.batch.trigger = recordingBatchTrigger;
		}
		
		
		transactionCount++;
		
		
		return function(){
			transactionCount--;
			if( transactionCount === 0 ) {
				var myEvents = events.slice(0)
				events = [];
				can.batch.trigger = changedBatchTrigger;
				can.each(myEvents, function(eventArgs){
					originalBatchTrigger.apply(can, eventArgs);
				});
			}
		}
	};
	
	return can.Map;
	
});
