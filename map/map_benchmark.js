steal('can/map', 'can/list','can/test/benchmarks.js',function(Map, List, benchmarks){
	
	benchmarks.add(
		"Adding a big array to an object",
		function(){
			var map = new can.Map(),
                objects = [];

	        for (var i = 0; i < 10; i++){
	            objects.push({prop: 'prop', nest: {prop: 'prop', nest: {prop: 'prop'}}})
	        }
		},
		function(){
            map.attr('obj', objects)
		});

	
})
