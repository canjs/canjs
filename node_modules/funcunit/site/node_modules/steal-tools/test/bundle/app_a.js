define(['dep_a_b', 'dep_all'], function(ab){
	var mod = {
		name: "a",
		ab: ab,
		all: "all"
	};

	//!steal-remove-start
	mod.clean = false;
	//!steal-remove-end

	steal.dev.assert(true);
	steal.dev.log("foo bar");
	steal.dev.warn("a warning!");

	return mod;
});
