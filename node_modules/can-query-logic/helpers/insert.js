// This helper is used to add something to a set of data.
// if the set algebra doesn't know where to put it, we add it at the end.
module.exports = function(algebra, query, items, item){
	var index = algebra.index(query, items, item);
	if(index === undefined) {
		index = items.length;
	}

	var copy = items.slice(0);
	copy.splice(index, 0, item);

	return copy;
};
