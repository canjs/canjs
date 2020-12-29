@function can-map-define._type type
@parent can-map-define

Converts a value passed to [can-map.prototype.attr attr] into an appropriate value.

@param {*} newValue The value passed to `attr`.
@param {String} attrName The attribute name being set.
@this {Map} the instance of the [can-map Map].
@return {*} The value that should be passed to `set` or (if there is no `set` property) the value to set on the map instance.

@body

## Use

The `type` property specifies the type of the attribute.  The type can be specified
as either a type function that returns the type coerced value or one of the following strings:

 - `"string"` - Converts the value to a string except `null` or `undefined`.
 - `"date"` - Converts the value to a date or `null` if the date can not be converted.
 - `"number"` - Passes the value through `parseFloat` except for `null` or `undefined`.
 - `"boolean"` - Converts falsey, `"false"` or `"0"` to `false` and everything else to true.
 - `"htmlbool"` - Like `boolean`, but also converts empty strings to
   `true`. Used, for example, when input is from component attributes like
   `<can-tabs reverse/>`
 - `"compute"` - If the value set is a compute, will allow the returning of the computed value.
 - `"*"` - Prevents the default type coersion of converting Objects to [can-map Map]s and Arrays to [can-list List]s.

### Basic Example

The following example converts the `count` property to a number and the `items` property to an array:

     define: {
       count: {type: "number"},
       items: {
         type: function(newValue){
           if(typeof newValue === "string") {
             return newValue.split(",")
           } else if( Array.isArray(newValue) ) {
             return newValue;
           }
         }
       }
     }

When a user tries to set those properties like:

    map.attr({count: "4", items: "1,2,3"});

The number converter will be used to turn count into 4, and the items type converter function will be used to turn items into [1,2,3].

### Preventing Arrays and Objects from Automatic Conversion

When an array is passed into a Map setter, it is automatically converted into a List. Likewise, objects are converted into Map instances. This behavior can be prevented like the following:

     define: {
       locations: {type: "*"}
     }

When a user tries to set this property, the resulting value will remain an array.

    map.attr('locations', [1, 2, 3]); // locations is an array, not a List

### Working with the 'compute' type

Setting type as [can-compute `compute`] allows for resolving a computed property with the .attr()
method.

```js
MyMap = Map.extend({
  define: {
    value: {
      type: "compute"
    }
  }
});

var myMap = new MyMap();
var c = compute(5);

myMap.attr("value",c);
myMap.attr("value"); //-> 5

c(6);
myMap.attr("value"); //-> 6

//Be sure if setting to pass the new compute
var c2 = compute("a");
myMap.attr("value",c2);
myMap.attr("value"); //-> "a"
```
