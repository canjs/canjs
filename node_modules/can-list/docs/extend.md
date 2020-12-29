@function can-list.extend extend
@parent can-list.static

@signature `List.extend([name,] [staticProperties,] instanceProperties)`

Creates a new extended constructor function. Learn more at [can.Construct.extend].

```js
var MyList = List.extend({}, {
	// silly unnecessary method
	count: function(){
		return this.attr('length');
	}
});

var list = new MyList([{}, {}]);
console.log(list.count()); // -> 2
```

@param {String} [name] If provided, adds the extened List constructor function to the window at the given name.

@param {Object} [staticProperties] Properties and methods directly on the constructor function. The most common property to set is [can-list.Map].

@param {Object} [instanceProperties] Properties and methods on instances of this list type.
