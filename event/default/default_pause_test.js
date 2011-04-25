steal.plugins('funcunit/qunit','jquery/event/default','jquery/event/pause').then(function(){

module("jquery/event/default_pause");


test("default and pause with delegate", function(){
	var order = [];
	stop();
	$("#qunit-test-area").html("<div id='foo'><p id='bar'>hello</p></div>")
	
	$("#foo").delegate("#bar","default.show", function(){
		order.push("default")
	});
	
	$("#foo").delegate("#bar","show", function(ev){
		order.push('show')
		ev.pause();
		setTimeout(function(){
			ev.resume();
			
			setTimeout(function(){
				start();
				same(order,['show','default'])
			},30)
			
		},50)
	});
	
	
	$("#bar").trigger("show")
	
});

test("default and pause with live", function(){
	$("#qunit-test-area").html("<div id='foo'>hello</div>")
	
	var order = [];
	stop();
	
	$("#foo").live("default.show", function(){
		order.push("default")
	});
	$("#foo").live("show", function(ev){
		order.push('show')
		ev.pause();
		setTimeout(function(){
			ev.resume();
			setTimeout(function(){
				start();
				same(order,['show','default'])
			},30)
		},50)
	});
	
	
	$("#foo").trigger("show")
	
});

});