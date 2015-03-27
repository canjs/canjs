@page Define The Define Plugin
@parent Tutorial 9
@disableTableOfContents

@body

<div class="getting-started">

- - -
**In this Chapter**
 - The Define Plugin

*There is no code to download for this chapter*
- - -

The AppState object we created in the last chapter was a `can.Map`.
Here it is, again, below:

```
var AppState = can.Map.extend({
  define: {
    restaurant: {
      value: {},
      serialize: function() {
        return this.attr('restaurant.name');
      },
      set: function(restaurant) {
        var that = this;

        if (restaurant.restaurantId) {
          RestaurantMenusModel.findOne({id: restaurant.restaurantId}).done(function(selectedMenus) {
              that.attr('menus', {
                collection: selectedMenus.menus,
                restaurantName: restaurant.name
              });
            }).fail(function(xhr) {
              alert(xhr.message);
            });
        }
        return restaurant;
      }
    },
    menus: {
        value: null
    },
    confirmation: {
        value: {}
    }
  }
});
```

As mentioned in the last chapter, we've done something different with our
AppState than we’ve done with the other instances of `can.Map` in the past. We’ve
made use of `can.Map`'s `define` plugin (i.e., the `define` attribute of the
`extend` method's parameter) — something we included as part of our CanJS custom
download. In fact, if you noticed, we used the `define` plugin in the
Restaurant List component as well.

The `define` plugin allows you to finely control the the behavior of the
attributes on a can.Map. For any property you declare in the `define` plugin,
you can control its:

- [serialization](#serialization)
- [get](#get)
- [set](#set)
- [type](#type)
- [value](#value), and
- [remove](#remove)

<a name="serialization"></a>
### serialization 
The first property we'll talk about is serialization. The
serialize property defines how the attribute will behave when the map is
serialized. This can be useful for serializing complex types like dates,
arrays, or objects into string formats. You can also control whether or not a
given property can be serialized. Returning "undefined" from a serialization
function for any property means this property will not be part of the
serialized object. Serialization is tied directly to routing. We'll see how
this works when we continue our discussion of routing in the [next chapter](Routing.html).

<a name="get"></a>
### get 
A `get` function defines what happens when a value is read on a `can.Map`.
It is typically used to provide properties that derive their value from other
properties of the map. This is often useful when you are dealing with routing
for creating aliases. We'll see an example of how this is accomplished below.

<a name="set"></a>
### set 
A `set` function defines what happens when a value is set on a `can.Map`.
It is typically used to update other attributes on the `can.Map` as a side
effect, or coerce the set value into specific format. For example, we might
want to update the `menu` attribute of the AppState we defined above
when the `restaurant` attribute is updated.

The setter function can take two optional arguments:

- `newVal`: The type function coerced value the user intends to set on the can.Map
- `setVal`: A callback that can set the value of the property asynchronously.

When using a setter function, the final value of the attribute is determined
by the value the setter function returns. If the function returns a value,
that value is used as the value of the attribute. If an undefined value is
returned, the behavior depends on the number of arguments the setter
*declares*, as below:

```
// If the setter does not specify the newValue argument,
// the attribute value is set to whatever was passed to attr.
set: function() { ... }

// If the setter specifies the newValue argument only,
// the attribute value will be removed
set: function(newValue) { ... }

// If the setter specifies both newValue and setValue, the value of
// the property will not be updated until setValue is called
set: function(newValue, setValue) { ... }
```

<a name="type"></a>
### type 
The `type` property converts a value passed to an `attr` setter function
into a specific value type. The type can be specified as either a type
function, or one of the following strings:

- `string` - Converts the value to a string.
- `date` - Converts the value to a date or `null if the date can not be converted.
- `number` - Passes the value through parseFloat.
- `boolean` - Converts "falsey", "false" or "0" to false and everything else to true.
- `*` - Prevents the default coercion of Objects to can.Maps and Arrays to can.Lists.

There are two ways to define the `type` property: `Type`, or `type`. `Type`,
uppercase, defines a constructor that will be invoked any time the property is
set. Any data passed into the setter will be passed as arguments for the
constructor. `type`, lowercase, is set on the prototype of the object—i.e.,
it is not instance specific.

<a name="value"></a>
### value 
Sets the default value for instances of the `can.Map`. If the default
value should be an object of some type, it should be specified as the return
value of a function, so that all instances of the map don't point to the same
object. This is because JavaScript passes primitives by value, and all other
values (objects, arrays, etc.) by reference.

As with `type`, above, there are two ways to define the `value` property: `Value`,
or `value`. `Value`, uppercase, provides a constructor function, ensuring that
a copy of the value is made for each instance. `value`, lowercase, is set on
the prototype of the object—i.e., it is not instance specific.

<a name="remove"></a>
### remove 
Called when an attribute is removed. Can be used, for example, for
removal validation.

- - -

<span class="pull-left">[&lsaquo; App State & Basic Routing](AppState.html)</span>
<span class="pull-right">[Route Formatting & Serialization &rsaquo;](Routing.html)</span>

</div>
