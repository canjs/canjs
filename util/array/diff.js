steal(function(){
	
	var slice = [].slice;
	// a b c
	// a b c d
	// [[2,0, d]]
	return function(oldList, newList){
		var oldIndex = 0,
			newIndex =  0,
			oldLength = oldList.length,
			newLength = newList.length,
			patches = [];

		while(oldIndex < oldLength && newIndex < newLength) {
			var oldItem = oldList[oldIndex],
				newItem = newList[newIndex];
				
			if( oldItem === newItem ) {
				oldIndex++;
				newIndex++;
				continue;
			}
			// look for single insert, does the next newList item equal the current oldList.
			// 1 2 3
			// 1 2 4 3
			if(  newIndex+1 < newLength && newList[newIndex+1] === oldItem) {
				patches.push({index: newIndex, deleteCount: 0, insert: [ newList[newIndex] ]});
				oldIndex++;
				newIndex += 2;
				continue;
			}
			// look for single removal, does the next item in the oldList equal the current newList item.
			// 1 2 3
			// 1 3
			else if( oldIndex+1 < oldLength  && oldList[oldIndex+1] === newItem ) {
				patches.push({index: newIndex, deleteCount: 1, insert: []});
				oldIndex += 2;
				newIndex++;
				continue;
			}
			// just clean up the rest and exit
			// 1 2 3 
			// 1 2 5 6 7
			else {
				patches.push(
					{index: newIndex,
					 deleteCount: oldLength-oldIndex,
					 insert: slice.call(newList, newIndex) } );
				return patches;
			}
		}
		if( (newIndex === newLength) && (oldIndex === oldLength) ) {
			return patches;
		}
		// a b 
		// a b c d e
		patches.push(
					{index: newIndex,
					 deleteCount: oldLength-oldIndex,
					 insert: slice.call(newList, newIndex) } );
		
		return patches;
	};
});

// a b c
// a d e b c