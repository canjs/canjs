var canReflect = require("can-reflect");

function comparator(a, b) {
    return a.localeCompare(b);
}

module.exports = function sort(obj) {
    if(canReflect.isPrimitive(obj)) {
        return obj;
    }
    var out;
    if (canReflect.isListLike(obj)) {
        out = [];
        canReflect.eachKey(obj, function(item){
            out.push(sort(item));
        });
        return out;
    }
    if( canReflect.isMapLike(obj) ) {

        out = {};

        canReflect.getOwnKeys(obj).sort(comparator).forEach(function (key) {
            out[key] = sort( canReflect.getKeyValue(obj, key) );
        });

        return out;
    }


    return obj;
};
