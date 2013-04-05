steal('can/util/can.js','can/util/array/each.js','can/util/array/makeArray.js',function (can) {
  can.each({
    reduce : function(index, elements) {
      return index;
    }
    , reduceRight : function(index, elements) {
      return elements.length - index;
    }
  }, function(idxfunc, reducefunc) {
    can[reducefunc] = function (elements, callback, initial) {
      var current = initial, args;

      if (elements && elements[reducefunc]) {
        args = can.makeArray(arguments).slice(1);
        current = elements[reducefunc].apply(elements, args);
      } else if(elements && elements.length) {
        if(reducefunc === "reduceRight") {
          elements = elements.slice(0).reverse();
        }

        if(arguments.length < 3) {
          current = elements[0];
          elements = elements.slice(1);
        }
  			
        can.each(elements, function(element, index) { 
          current = callback.call(element, current, element, idxfunc(index, elements), elements);
        });
      }
  		return current;
  	};
  });
	return can;
});
