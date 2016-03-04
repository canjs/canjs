@page TheDefinePlugin The Define Plugin
@parent Tutorial 4
@disableTableOfContents

@body

<div class="getting-started">

- - -
**In this Chapter**
 - The Define Plugin

*There is no code to download for this chapter*
- - -

The `define` plugin allows you to finely control the the behavior of the
attributes on a `can.Map`. For any property you declare in the `define` plugin,
you can control its:

- [set](#set)
- [get](#get)
- [type](#type)
- [value](#value)
- [remove](#remove)
- [serialization](#serialization)

Before we get into the properties of the define plugin, however, let’s look at how to set it up.
Creating a define is as simple as adding a define property to the instance properties
of the `can.Map`. This property is an object literal. Remember from our conversation on 
[`can.Construct`](Constructors.html) that passing in one argument to a `can.Construct` will set 
its instance properties. This is important to know should you create a `can.Map` that has both
instance and static properties, and you want to use the define plugin. Below are two examples:

```
//can.Map with one argument
var Person = can.Map.extend({
    define: {
        //define properties go here
        myProperty: {
           //property attributes
        }
    }
});

//can.Map with two arguments
var Person = can.Map.extend(
{
   //static properties go here
},
{
    define: {
        //define properties go here
        myProperty: {
           //property attributes
        }
    }
});
```

<a name="set"></a>
### set 
A [set](../docs/can.Map.prototype.define.set.html) function defines what happens when a value is set on a `can.Map`.
It is typically used to update other attributes on the `can.Map` as a side
effect, or coerce the set value into specific format.

The setter function can take two optional arguments:

- `newVal`: The type function coerced value the user intends to set on the `can.Map`
- `setVal`: A callback that can set the value of the property asynchronously.

When using a setter function, the final value of the attribute is determined
by the value the setter function returns. If the function returns a value,
that value is used as the value of the attribute. If `undefined` is
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

<a name="get"></a>
### get 
A [get](../docs/can.Map.prototype.define.get.html) function defines what happens when a value is read on a `can.Map`.
It is typically used to provide properties that derive their value from other
properties of the map, as below: 

```
var Person = can.Map.extend({
    define: {
        fullName: {
            get: function () {
                return this.attr("first") + " " + this.attr("last");
            }
        }
    }
});
```

`get` is passed two optional arguments: `lastSetValue` and `resolve`.  

`lastSetValue` is the last value the property was set to.  This, among other uses,
can be used to update a list in place instead of replacing it.  The following
keeps `taskIds` updated with all of `tasks`' ids:

```
var Person = can.Map.extend({
    define: {
        taskIds: {
            Value: can.List,
            get: function(initialValue){
                var ids = this.attr('tasks').map(function(task){
                    return task.attr("id");
                });
                return initialValue.replace(ids);
            }
        }
    }
});
```



`resolve` can asynchronously set the retrived value of a 
"bound" property.  The following makes `person` update when `personId` changes. 
`person` will be a `Person` instance retrieved from the server.

```
var AppViewModel = can.Map.extend({
  define: {
    person: {
      get: function(lastSetValue, resolve){
        Person.findOne({id: this.attr("personId")})
            .then(resolve);
      }
    }
  }
});
```

Asynchronous getters must be bound to to behave correctly.  In most apps, this happens
automatically because observables are "bound" by a template.  However,
when testing, you'll need to remember to [bind](../docs/can.Map.prototype.bind.html)
on that property before reading it. Here's how one might test the previous `AppViewModel`:

```
var appVM = new AppViewModel({
  personId: 5
});

appVM.bind("person", function(ev, newVal, oldVal){
  // `person` will change from undefined to a
  // Person instance.
  ok(newVal instanceof Person)
});

// appVM is `undefined` here because 
// `Person.findOne` hasn't returned yet
appVM.attr("person") //-> undefined
```













<a name="type"></a>
### type 
The [type](/docs/can.Map.prototype.define.type.html) property converts a value passed to an `attr` setter function
into a specific value type. The type can be specified as either a type
function, or one of the following strings:

- `string` - Converts the value to a string.
- `date` - Converts the value to a date or `null` if the date can not be converted.
- `number` - Passes the value through `parseFloat`.
- `boolean` - Converts falsey values (such as `""` or `0`) to `false` and everything else to `true`.
- `*` - Prevents the default coercion of Objects to can.Maps and Arrays to can.Lists.

There are two ways to define the `type` property: 

 - `Type`
 - `type` 

`Type`, uppercase, makes sure that the set value is an 
[instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) the provided
constructor function.  If not, the constructor function will be called with `new` and passed the set value as the first
argument.

In contrast, `type`, lowercase, is called no matter what and expected to return the value that should be set on the map.

```
define: {
  items: {
    type: function(newValue){
      return typeof newValue === "string" ?  newValue.split(",") : newValue;
    }
  }
}
```

<a name="value"></a>
### value 

Sets the default value for instances of the `can.Map`. If the default
value should be an object of some type, it should be specified as the return
value of a function, so that all instances of the map don't point to the same
object. This is because JavaScript passes primitives by value, and all other
values (objects, arrays, etc.) by reference.

```
define: {
  prop: {
    value: function(){ return []; }
  }
}
```

As with `type`, above, there are two ways to define the `value` property: `Value`,
or `value`. [Value](../docs/can.Map.prototype.define.ValueConstructor.html), uppercase, provides a constructor function, ensuring that
a new instance of `Value` is made for each map instance. If [value](../docs/can.Map.prototype.define.value.html) is not an function,
that value will be the default value of the attribute. If `value` is a function, 
that function's return value will be used as the default value of the attribute.

<a name="remove"></a>
### remove 

The [remove](../docs/can.Map.prototype.define.remove.html) property is called  when an attribute is removed. This is often used to remove other related properties.

<a name="serialization"></a>
### serialization 
The last property we’ll talk about is [serialization](https://en.wikipedia.org/wiki/Serialization). The
[serialize](../docs/can.Map.prototype.define.serialize.html) property defines how the attribute will behave when the map is
serialized. Managing this property can be useful when serializing complex types like dates,
arrays, or objects into strings. You can also control whether or not a
given property can be serialized. Returning `undefined` from a serialization
function for any property means this property will not be part of the
serialized object. Managing serialization is an important consideration in [routing](AppStateAndRouting.html). 
We’ll see how this works when we discuss routing in a later chapter.

```
define: {
  locationIds: {
    serialize: false
  }
}
```

- - -

<span class="pull-left">[&lsaquo; Observables](Observables.html)</span>
<span class="pull-right">[Stache Templates &rsaquo;](StacheTemplates.html)</span>

</div>
