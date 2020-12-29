var set = require("../set");
var keysLogic = require("./types");

function NotIdentity(value) {
    this.value = value;
}

// Not comparisons ---------
var Identity = set.Identity;

// Only difference is needed w/ universal
set.defineComparison(set.UNIVERSAL, Identity,{
    // A \ B -> what's in b, but not in A
    difference: function(universe, value){
        return new NotIdentity(value);
    }
});

// Only difference is needed w/ universal
set.defineComparison(set.UNIVERSAL, NotIdentity,{
    // A \ B -> what's in b, but not in A
    difference: function(universe, not){
        return not.value;
    }
});

set.defineComparison(NotIdentity, NotIdentity,{
    /*
    // not 5 and not 6
    union: function(obj1, obj2){
        // must unroll the value

    },
    // {foo: zed, abc: d}
    intersection: function(obj1, obj2){

    },
    // A \ B -> what's in b, but not in A
    difference: function(obj1, obj2){

    }
    */
});



set.defineComparison(NotIdentity, Identity,{
    // not 5 and not 6
    union: function(not, primitive){
        // NOT(5) U 5
        if( set.isEqual( not.value, primitive) ) {
            return set.UNIVERSAL;
        }
        // NOT(4) U 6
        else {
            throw new Error("Not,Identity Union is not filled out");
        }
    },
    // {foo: zed, abc: d}
    intersection: function(not, primitive){
        return set.isEqual( !not.value, primitive ) ? primitive: set.EMPTY;
    },
    // A \ B -> what's in b, but not in A
    difference: function difference(not, primitive){
        // NOT(5) \ 3 -> UNDEFINABLE
        // NOT(3) \ 3 -> NOT(3)
        if(set.isEqual( not.value, primitive )) {
            return not;
        } else {
            return set.UNDEFINABLE;
        }
    }
});

set.defineComparison(Identity, NotIdentity,{
    difference: function(primitive, not){
        if(set.isEqual(primitive, not.value)) {
            return primitive;
        } else {
            return set.UNDEFINABLE;
        }
    }
});

NotIdentity.prototype.isMember = function(value){
	if(this.value  && typeof this.value.isMember === "function") {
		return !this.value.isMember(value);
	} else {
		var values = set.ownAndMemberValue(this.value, value);
		return values.own !== values.member;
	}

};

module.exports = keysLogic.Not = NotIdentity;
