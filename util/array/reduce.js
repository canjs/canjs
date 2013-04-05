steal('can/util/can.js','can/util/array/each.js',function (can) {
	can.reduce = function (elements, callback, initial) {
    var current = initial;

    function(a, f, i) { var j = i==null ? a[0] : i; can.each(a.slice(i==null ? 1 : 0), function(b, x) { j = f(j, b, x, a); }); return j };
    if (elements && elements.reduce) {
      current = elements.reduce.call(elements, callback, initial);
    } else if(elements && elements.length) {
      if(initial == null) {
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
