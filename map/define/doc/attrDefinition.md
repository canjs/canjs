@typedef {{}} can.Map.prototype.define.attrDefinition attrDefinition
@parent can.Map.prototype.define

Defines the type, initial value, and get, set, and remove behavior for an attribute of a [can.Map].

@option {can.Map.prototype.define.value|*} value Specifies the initial value of the attribute or
a function that returns the initial value. For example, a default value of `0` can be 
specified like:

    define: {
      prop: {
        value: 0
      }
    }

`Object` types should not be specified directly on `value` because that same object will
be shared on every instance of the Map.  Instead, a [can.Map::define.value value function] that 
returns a fresh copy can be provided:

    define: {
      prop: {
        value: function(){
          return {foo: "bar"}
        }
      }
    }

@option {function} Value Specifies a function that will be called with `new` whose result is
set as the initial value of the attribute. For example, if the default value should be a can.List:

    define: {
      prop: {
        Value: can.List
      }
    }

@option {can.Map.prototype.define.type|String} type Specifies the type of the 
attribute.  The type can be specified as either a [can.Map.prototype.define.type type function] 
that returns the type coerced value or one of the following strings:

 - `"string"` - Converts the value to a string.
 - `"date"` - Converts the value to a date or `null if the date can not be converted.
 - `"number"` - Passes the value through `parseFloat`.
 - `"boolean"` - Converts falsey, `"false"` or `"0"` to `false` and everything else to true.
 - `"*"` - Prevents the default type coersion of converting Objects to [can.Map]s and Arrays to [can.List]s.

The following example converts the `count` property to a number and the `items` property to an array:

     define: {
       count: {type: "number"},
       items: function(newValue){
         if(typeof newValue === "string") {
           return newValue.split(",")
         } else if( can.isArray(newValue) ) {
           return newValue;
         }
       }
     }

@option {function} Type A constructor function that takes 
the value passed to [can.Map::attr attr] as the first argument and called with 
new. For example, if you want whatever
gets passed to go through `new Array(newValue)` you can do that like:

    define: {
      items: {
        Type: Array
      }
    }

If the value passed to [can.Map::attr attr] is already an Array, it will be left as is.

@option {can.Map.prototype.define.set} set A set function that specifies what should happen when an attribute
is set on a [can.Map]. `set` is called with the result of `type` or `Type`. The following
defines a `page` setter that updates the map's offset:

    define: {
      page: {
        set: function(newVal){
          this.attr('offset', (parseInt(newVal) - 1) * 
                               this.attr('limit'));
        }
      }
    }

@option {can.Map.prototype.define.get} get A function that specifies how the value is retrieved.  The get function is 
converted to an [can.compute.async async compute].  It should derive its value from other values
on the map. The following
defines a `page` getter that reads from a map's offset and limit:

    define: {
      page: {
        get: function (newVal) {
		  return Math.floor(this.attr('offset') / 
		                    this.attr('limit')) + 1;
		}
      }
    }

@option {can.Map.prototype.define.remove} remove A function that specifies what should happen when an attribute is removed
with [can.Map::removeAttr removeAttr]. The following removes a `modelId` when `makeId` is removed:

    define: {
      makeId: {
        remove: function(){
          this.removeAttr("modelId");
        }
      }
    }

@option {can.Map.prototype.define.serialize} serialize A function that specifies what should happen when an attribute is serialized
with [can.Map::serialize serialize]. The following causes the serialized form of the map to contain a locationIds property, which contains comma separated id values derived from the locations property:

    define: {
      locationIds: {
        serialize: function(locationIds){
            return locationIds.join(',');
          }
      }
    }

Setting serialize to false for any property means this property will not be part of the serialized object.