var canReflect = require("can-reflect");
var ObservationRecorder = require("can-observation-recorder");

function isVariable(scope) {
	return scope._meta.variable === true;
}

// This sets variables so it needs to not causes changes.
var letHelper = ObservationRecorder.ignore(function(options){
	if(options.isSection){
		return options.fn( options.scope.addLetContext( options.hash ) );
	}
	var variableScope = options.scope.getScope(isVariable);
	if(!variableScope) {
		throw new Error("There is no variable scope!");
	}

	canReflect.assignMap(variableScope._context, options.hash);
	return document.createTextNode("");
});

module.exports = letHelper;
