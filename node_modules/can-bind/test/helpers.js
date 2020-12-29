// Helper for taking a value and incrementing it by one
function incrementByOne(newValue) {
	return newValue + 1;
}

// Helper returns a function that can only be called 10 times before it throws an error
function protectAgainstInfiniteLoops(func) {
	var counter = 0;
	return function() {
		counter += 1;
		if (counter > 10) {
			throw new Error("Infinite loop");
		}
		return func.apply(null, arguments);
	};
}

module.exports = {
	incrementByOne: incrementByOne,
	protectAgainstInfiniteLoops: protectAgainstInfiniteLoops,
	moduleHooks: {
		setup: function(){
			this.groupCollapsed = console.groupCollapsed;
			if(this.groupCollapsed) {
				console.groupCollapsed = null; //no op
			}

		},
		teardown: function(){
			if(this.groupCollapsed) {
				console.groupCollapsed = this.groupCollapsed;
			}
		}
	}
};
