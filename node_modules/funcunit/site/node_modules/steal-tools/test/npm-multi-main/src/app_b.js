define(['multi-main/lib/dep_a_b', 'multi-main/lib/dep_all'], function(ab, all){
	window.app = {
		ab: ab,
		all: all,
		name: "b"
	};
});