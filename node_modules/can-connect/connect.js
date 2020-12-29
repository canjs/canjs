var behavior = require("./behavior");

/**
 *
 * @param {Array<String,Behavior,function>} behaviors - An array of behavior names or custom behaviors.
 * The order of named execution gets run in order.
 * @param {Object} options
 * @hide
 */
var connect = function(behaviors, options){

	behaviors = behaviors.map(function(behavior, index){
		var sortedIndex = -1;
		if(typeof behavior === "string") {
			sortedIndex = connect.order.indexOf(behavior);
			behavior = behavior.map[behavior];
		} else if(behavior.isBehavior) {
			sortedIndex = connect.order.indexOf(behavior.behaviorName);
		} else {
			behavior = connect.behavior(behavior);
		}

		return {
			originalIndex: index,
			sortedIndex: sortedIndex,
			behavior: behavior
		};
	});

	behaviors.sort(function(b1, b2){
		// if both have a sorted index
		if(~b1.sortedIndex && ~b2.sortedIndex) {
			return b1.sortedIndex - b2.sortedIndex;
		}
		return b1.originalIndex - b2.originalIndex;
	});

	behaviors = behaviors.map(function(b){
		return b.behavior;
	});

	var behavior = connect.base( connect.behavior("options",function(){return options; })() );

	behaviors.forEach(function(behave){
		behavior = behave(behavior);
	});
	if(behavior.init) {
		behavior.init();
	}
	return behavior;
};



connect.order = ["data/localstorage-cache","data/url","data/parse","cache-requests","data/combine-requests",

	"constructor","constructor/store","can/map","can/ref",
	"fall-through-cache",

	"data/worker","real-time",

	"data/callbacks-cache","data/callbacks","constructor/callbacks-once"
];

connect.behavior = behavior;



module.exports= connect;
