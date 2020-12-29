@module {Object} can-map-define can-map-define
@parent can-observables
@collection can-legacy
@package ../package.json

Defines the
`type`, initial `value`, `get`, `set`, `remove`, and `serialize` behavior for attributes
of a [can-map Map].

@option {Object} define Exports object with helper methods internal to
`can-map-define`.  The export of `can-map-define` is not used directly, instead
the module is imported and all [can-map]'s can have their properties defined like:

```js
var CanMap = require("can-map");
require("can-map-define");

var Person = CanMap.extend({
    define: {
        fullName: {
          get () {
              return this.attr("first") + " "+ this.attr("last");
          }
        }
    }
})
```

@body

## Use

The [can-map-define define] plugin allows you to completely control the behavior
of attributes on a [can-map Map]. To use it, you specify
an `define` object that is a mapping of properties
to [can-map-define.attrDefinition attribute definitions]. The following example
specifies a Paginate Map:

    var Paginate = Map.extend({
      define: {
        count: {
          type: "number",
          value: Infinity,
          // Keeps count above 0.
          set: function(newCount){
            return newCount < 0 ? 0 : newCount;
          }
        },
        offset: {
          type: "number",
          value: 0,
          // Keeps offset between 0 and count
          set: function(newOffset){
            var count = this.attr("count");
            return newOffset < 0 ?
		      0 :
		      Math.min(newOffset, !isNaN( count - 1) ?
		        count - 1 :
		        Infinity);
          }
        },
        limit: {
          type: "number",
          value: 5
        },
        page: {
          // Setting page changes the offset
          set: function(newVal){
            this.attr('offset', (parseInt(newVal) - 1) *
                                 this.attr('limit'));
          },
          // The page value is derived from offset and limit.
          get: function (newVal) {
		    return Math.floor(this.attr('offset') /
		                      this.attr('limit')) + 1;
		  }
        }
      }
    });

## Default behaviors

The [can-map-define define] plugin not only allows you to define
individual attribute behaviors on a [can-map Map], but you can also define default
behaviors that would apply to any unspecified attribute. This is particularly
helpful for when you need a particular behavior to apply to every attribute on
a [can-map Map] but won't be certain of what every attribute will be.

The following example is a [can-map Map] that is tied to [can-route route] where only
specified attributes that are serialized will be updated in the location hash:

    var State = Map.extend({
      define: {
        foo: {
          serialize: true
        },
        '*': {
          serialize: false
        }
      }
    });

    var state = new State();

    // tie State map to the route
    route.map(state);
    route.ready();

    state.attr('foo', 'bar');
    state.attr('bar', 'baz');

    window.location.hash; // -> #!foo=bar


## Overview

This plugin is a replacement for the now deprecated attributes and setter plugins. It intends to provide a single place to define the behavior of all the properties of a [can-map Map].

Here is the cliffnotes version of this plugin.  To define...

* The default value for a property - use [can-map-define.value value]
* That default value as a constructor function - use [can-map-define.ValueConstructor Value]
* What value is returned when a property is read - use [can-map-define.get get]
* Behavior when a property is set - use [can-map-define.set set]
* How a property is serialized when [can-map.prototype.serialize serialize] is called on it - use [can-map-define.serialize serialize]
* Behavior when a property is removed - use [can-map-define.remove remove]
* A custom converter method or a pre-defined standard converter called whenever a property is set - use [can-map-define._type type]
* That custom converter method as a constructor function - use [can-map-define.TypeConstructor Type]

## Demo

The following shows picking cars by make / model / year:


@demo demos/can-map-define/make-model-year.html
