define(['./dep_all'], function(all){
	// needed to make dep_a_b.js create its own package
	return {
		all: all,
		name: "d"
	};
});