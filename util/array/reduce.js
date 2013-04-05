steal('can/util/can.js','can/util/array/each.js','can/util/array/makeArray.js',function (can) {

  // ## reduce.js  
  // `can.util.reduce`  
  // _Wrapper for the Array reduce functions from ECMAScript 5._ 
  //   

  can.each({

    /**
     * @function can.reduce
     * @parent can.util
     * Iterates over an array and returns a single value.  At each step
     * in iteration the previous return value is supplied alongside the
     * current array element.
     *
     *     can.reduce([1, 2, 3], function(t, n){ return t + n; }, 10) 
     *          // -> 16
     *
     * Supplying an optional initial element passes it through to the first
     * iteration.  If no initial element is supplied, the first iteration will
     * execute with the first and second elements from the array.
     *
     *     can.reduce([1, 2, 3], function(t, n){ return t + n; }) 
     *          // -> 6
     *     
     * The current index and original array are passed in as the third and fourth 
     * positional parameters.
     * 
     *     can.reduce(["a", "b", "c"], 
     *        function(t, n, i, a){ 
     *           return t + i + n + (a.length - 1 === i ? "" : " "); 
     *        }, "") 
     *          // -> "0a 1b 2c"
     * 
     * @param {Array} elements The arrary of elements to be iterated over
     * @param {Function} callback The callback to execute each iteration
     * @param {Any} [initial] An optional initial value
     * @return {Any} The result of applying the callback over the array
     */
    reduce : function(index, elements) {
      return index;
    }
    /**
     * @function can.reduceRight
     * @parent can.util
     *
     * Iterates over an array and returns a single value.  At each step
     * in iteration the previous return value is supplied alongside the
     * current array element.  <code>reduceRight</code> differs from
     * <code>reduce</code> in that the iteration starts at the end of the
     * array and moves toward the beginning.
     * 
     *     can.reduceRight(["a", "b", "c"], 
     *        function(t, n, i, a){ 
     *           return t + i + n + (0 === i ? "" : " "); 
     *        }, "") 
     *          // -> "2c 1b 0a"
     * 
     * If no initial value is supplied, the array's last element is provided
     * as the first positional parameter in the first iteration.
     *  
     *     can.reduceRight(["b", "a"], function(t, n) { return t + n; })
     *          // -> "ab"
     * 
     * @param {Array} elements The arrary of elements to be iterated over
     * @param {Function} callback The callback to execute each iteration
     * @param {Any} [initial] An optional initial value
     * @return {Any} The result of applying the callback over the array
     */
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
