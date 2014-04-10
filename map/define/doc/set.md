@function can.Map.prototype.define.set set
@parent can.Map.prototype.define

Specify what happens when a value is set on a map attribute.

@signature `set( [newVal,] [setValue] )`

A set function defines the behavior of what happens when a value is set on a
[can.Map]. It is typically used to:

 - Add or remove other attributes as side effects
 - Coerce the set value into an appropriate action
 
The behavior of the setter depends on the number of arguments specified. This means that a
setter like:

    define: {
      prop: {
        set: function(){}
      }
    }

behaves differently than:

    define: {
      prop: {
        set: function(newVal){}
      }
    }

@param {*} [newVal] The [can.Map::define.type type function] coerced value the user intends to set on the
can.Map. 

@param {function(*)} [setValue(newValue)] A callback that can set the value of the property 
asyncronously. 

@return {*|undefined} If a non-undefined value is returned, that value is set as 
the attribute value. 


If an `undefined` value is returned, the behavior depends on the number of
arguments the setter declares:

 - If the setter _does not_ specify the `newValue` argument, the attribute value is set
   to whatever was passed to [can.Map::attr attr].
 - If the setter specifies the `newValue` argument only, the attribute value will be removed.
 - If the setter specifies both `newValue` and `setValue`, the value of the property will not be 
   updated until `setValue` is called.


@body 

## Use

An attribute's `set` function can be used to customize the behavior of when an attribute value is set 
via [can.Map::attr].  Lets see some common cases:

#### Side effects

The following makes setting a `page` property update the `offset`:

    define: {
      page: {
        set: function(newVal){
          this.attr('offset', (parseInt(newVal) - 1) * 
                               this.attr('limit'));
        }
      }
    }
    
The following makes changing `makeId` remove the `modelId` property: 

    define: {
      makeId: {
        set: function(newValue){
          // Check if we are changing.
          if(newValue !== this.attr("makeId")) {
            this.removeAttr("modelId");
          }
          // Must return value to set as we have a `newValue` argument.
          return newValue;
        }
      }
    }
    
#### Asynchronous Setter

The following shows an async setter:

    define: {
      prop: {
        set: function( newVal, setVal){
          $.get("/something", {}, setVal );
        }
      }
    }


## Behavior depends on the number of arguments.

When a setter returns `undefined`, its behavior changes depending on the number of arguments.

With 0 arguments, the original set value is set on the attribute.

    MyMap = can.Map.extend({
      define: {
        prop: {set: function(){}}
      }
    })

    var map = new MyMap({prop : "foo"});

    map.attr("prop") //-> "foo"

With 1 argument, `undefined` will remove the property.  


    MyMap = can.Map.extend({
      define: {
        prop: {set: function(newVal){}}
      }
    })

    var map = new MyMap({prop : "foo"});

    can.Map.keys(map) //-> []

With 2 arguments, `undefined` leaves the property in place.  Its expected
that `setValue` will be called:

    MyMap = can.Map.extend({
      define: {
        prop: {set: function(newVal, setVal){}}
      }
    })

    var map = new MyMap({prop : "foo"});

    map.attr("prop") //-> "foo"

## Side effects

## Merging

## Batched Changes