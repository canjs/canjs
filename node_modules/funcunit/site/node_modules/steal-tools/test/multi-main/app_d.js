define(['./dep_all','./dep_c_d'], function(all, cd){
	// needed to make dep_a_b.js create its own package
	window.app = {
		all: all,
		name: "d",
		cd: cd
	};
});