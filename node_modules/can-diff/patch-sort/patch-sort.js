
module.exports = function(patches) {
	//!steal-remove-start
	if(process.env.NODE_ENV !== 'production') {
		var deletes =[],
			inserts = [],
			moves = [];
		patches.forEach(function(patch){
			if (patch.type === "move") {
				moves.push(patch);
			} else {
				if (patch.deleteCount) {
					deletes.push(patch)
				}
				if (patch.insert && patch.insert.length) {
					inserts.push(inserts);
				}
			}
		})
		if(deletes.length + inserts.length > 2) {
			console.error("unable to group patches",patches);
			throw new Error("unable to group patches");
		}
		if(moves.length &&(deletes.length || inserts.length)) {
			console.error("unable to sort a move with a delete or insert");
			throw new Error("unable to sort a move with a delete or insert");
		}
	}
	//!steal-remove-end


	var splitPatches = [];
	patches.forEach(function(patch){
		if (patch.type === "move") {
			splitPatches.push( {patch: patch, kind: "move"} );
		} else {
			if (patch.deleteCount) {
				splitPatches.push({
					type: "splice",
					index: patch.index,
					deleteCount: patch.deleteCount,
					insert: [],
				});
			}
			if (patch.insert && patch.insert.length) {
				splitPatches.push({
					type: "splice",
					index: patch.index,
					deleteCount: 0,
					insert: patch.insert
				});
			}
		}
	});
	if(patches.length !== 2) {
		return patches;
	}
	var first = splitPatches[0],
		second = splitPatches[1];
	// if insert before a delete
	if(first.insert && first.insert.length && second.deleteCount) {
		// lets swap the order.
		var insert = first,
			remove = second;
		if(insert.index < remove.index) {
			remove.index = remove.index - insert.insert.length;
		} else if(insert.index > remove.index) {
			insert.index = insert.index - remove.deleteCount;
		} else {
			throw "indexes the same!"
		}
		return [remove, insert];
	}
	return patches;
};
