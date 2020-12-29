@function can-list.prototype.map map
@parent can-list.prototype

@description Call a function on each element of a List and return a new List instance from the results.
@signature `list.map( callback(item, index, listReference), context )`

@param {function(*, Number, can.List)} callback A function to call with each
element of the list.
@param {Object} context An optional object to use as `this` inside the callback.

@return {can.List} A new can.List instance.

@body
```
var list = new List([1, 10, 100, 1000, 10000, 100000]);
var newList = list.map(function(element, index, listReference) {
  var result;

  switch(index) {
    case 0: {
      result = false;
      break;
    }
    case 1: {
      result = undefined;
      break;
    }
    case 2: {
      result = element;
      break;
    }
    case 3: {
      result = element * 5;
      break;
    }
    default: {
      result = listReference[index] /= 2;
      break;
    }
  }

  return result;
});

console.log(list);    // [    1,        10, 100, 1000, 5000, 50000]
console.log(newList); // [false, undefined, 100, 5000, 5000, 50000]
```
