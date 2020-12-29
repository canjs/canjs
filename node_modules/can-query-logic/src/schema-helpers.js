var canReflect = require("can-reflect");
var set = require("./set");
var canSymbol = require("can-symbol");
var schemaHelpers;
module.exports = schemaHelpers = {

    // Number is a ranged type
    isRangedType: function(Type){
        return Type && canReflect.isConstructorLike(Type) &&
            !set.hasComparisons(Type) &&
            !Type[canSymbol.for("can.SetType")] &&
            Type.prototype.valueOf && Type.prototype.valueOf !== Object.prototype.valueOf;
    },
    categorizeOrValues: function categorizeOrValues(values){

    	var categories = {
    		primitives: [],
    		valueOfTypes: [],
    		others: []
    	};

    	values.forEach(function(value){
    		if( canReflect.isPrimitive( value ) ) {
    			categories.primitives.push(value);
    		}
    		else if( schemaHelpers.isRangedType(value) ) {
    			categories.valueOfTypes.push(value);
    		}
    		else {
    			categories.others.push(value);
    		}
    	});
    	return categories;
    }
};
