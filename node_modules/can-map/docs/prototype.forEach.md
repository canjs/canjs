@function can-map.prototype.forEach forEach
@parent can-map.prototype 5

@description Call a function on each property of a Map.

@signature `map.forEach( callback(item, propName), [thisArg] )`

`forEach` iterates through the Map, calling a function for each property value and key.

@param {function(*,String)} callback(item, propName) the function to call for each property
The value and key of each property will be passed as the first and second arguments, respectively, to the callback. If the callback returns false, the loop will stop.

@param {Object} [thisArg] the object to use as `this` inside the callback

@return {can-map} this Map, for chaining

@body

    var names = [];
    new Map({a: 'Alice', b: 'Bob', e: 'Eve'}).forEach(function(value, key) {
        names.push(value);
    });

    names; // ['Alice', 'Bob', 'Eve']

    names = [];
    new Map({a: 'Alice', b: 'Bob', e: 'Eve'}).forEach(function(value, key) {
        names.push(value);
        if(key === 'b') {
            return false;
        }
    });

    names; // ['Alice', 'Bob']
    
