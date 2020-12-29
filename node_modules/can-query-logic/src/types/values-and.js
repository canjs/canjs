var keysLogic = require("./types");
var set = require("../set");

function ValuesAnd(values) {
	this.values = values;
}

ValuesAnd.prototype.isMember = function(props) {
	return this.values.every(function(value){
            return value && value.isMember ?
                value.isMember( props ) : value === props;
    });
};

// Or comparisons
set.defineComparison(set.UNIVERSAL, ValuesAnd, {
    difference: function(){
        return set.UNDEFINABLE;
    }
});

module.exports = keysLogic.ValuesAnd = ValuesAnd;
