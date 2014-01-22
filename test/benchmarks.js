steal("steal","benchmark", function(steal){
	
	var suite = new Benchmark.Suite;
	
	suite.on('cycle', function(event) {
	  console.log(String(event.target));
	})
	
	var benchmarks =  {
		add: function(name, setup, benchmark, teardown){
			if(!benchmark){
				benchmark = setup;
				setup = undefined
			}
			suite.add(name, benchmark, {
				setup: setup,
				teardown: teardown
			});
			return this;
		},
		run: function(){
			suite.run({ 'async': true, 'queued': true });
		},
		suite: suite,
		on: function(){
			return suite.on.apply(this, arguments)
		}
	}
	steal.bind("done", function(){
		benchmarks.run();
	})
	
	return benchmarks;
})
