steal('can/util/can.js','can/util/array/each.js','can/util/array/makeArray.js',function (can) {
	can.reduce = function (elements, callback, initial) {
    var current = initial, args;

    if (elements && elements.reduce) {
      args = can.makeArray(arguments).slice(1);
      current = elements.reduce.apply(elements, args);
    } else if(elements && elements.length) {
      if(arguments.length < 3) {
        current = elements[0];
        elements = elements.slice(1);
      }
			
      can.each(elements, function(element, index) { 
        current = callback.call(element, current, element, index, elements);
      });
    }
		return current;
	};

	return can;
});
