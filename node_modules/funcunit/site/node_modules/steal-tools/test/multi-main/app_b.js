define(['dep_a_b', './dep_all'], function(ab, all){
	window.app = {
		ab: ab,
		all: all,
		name: "b"
	};
});