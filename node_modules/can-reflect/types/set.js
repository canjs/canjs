"use strict";
var shape = require("../reflections/shape/shape");
var CanSymbol = require("can-symbol");

if (typeof Set !== "undefined") {
  shape.assignSymbols(Set.prototype, {
    "can.isMoreListLikeThanMapLike": true,
    "can.updateValues": function(index, removing, adding) {
      if (removing !== adding) {
        shape.each(
          removing,
          function(value) {
            this.delete(value);
          },
          this
        );
      }
      shape.each(
        adding,
        function(value) {
          this.add(value);
        },
        this
      );
    },
    "can.size": function() {
      return this.size;
    }
  });

  // IE11 doesn't support Set.prototype[@@iterator]
  if (typeof Set.prototype[CanSymbol.iterator] !== "function") {
	  Set.prototype[CanSymbol.iterator] = function() {
		  var arr = [];
		  var currentIndex = 0;

		  this.forEach(function(val) {
			  arr.push(val);
		  });

		  return {
			  next: function() {
				  return {
					  value: arr[currentIndex],
					  done: (currentIndex++ === arr.length)
				  };
			  }
		  };
	  };
  }
}
if (typeof WeakSet !== "undefined") {
  shape.assignSymbols(WeakSet.prototype, {
    "can.isListLike": true,
    "can.isMoreListLikeThanMapLike": true,
    "can.updateValues": function(index, removing, adding) {
      if (removing !== adding) {
        shape.each(
          removing,
          function(value) {
            this.delete(value);
          },
          this
        );
      }
      shape.each(
        adding,
        function(value) {
          this.add(value);
        },
        this
      );
    },
    "can.size": function() {
      throw new Error("can-reflect: WeakSets do not have enumerable keys.");
    }
  });
}
