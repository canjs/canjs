@property {Object<String,can.Map.prototype.define.attrDefinition>} can.Map.prototype.define define
@parent can.Map.plugins

Defines the
type, initial value, get, set, remove, and serialize behavior for attributes 
of a [can.Map].

@option {Object<String,can.Map.prototype.define.attrDefinition>} A map of 
attribute names to [can.Map::define.attrDefinition attribute definition]
objects.

@body

## Use

The [can.Map::define can.Map.define] plugin allows you to completely control the behavior
of attributes on a [can.Map]. To use it, you specify 
an define object that is a mapping of properties 
to [can.Map::define.attrDefinition attribute definitions]. The following example 
specifies a Paginate Map:

    var Paginate = can.Map.extend({
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

## Overview

This plugin is a replacement for the now deprecated [can.Map.attributes attributes] and [can.Map.setter setter] plugins. It intends to provide a single place to define the behavior of all the properties of a can.Map.

Here is the cliffnotes version of this plugin.  To define...

* The default value for a property - use [can.Map.prototype.define.value value]
* That default value as a constructor function - use [can.Map.prototype.define.ValueConstructor Value]
* What value is returned when a property is read - use [can.Map.prototype.define.get get]
* Behavior when a property is set - use [can.Map.prototype.define.set set]
* How a property is serialized when [can.Map::serialize serialize] is called on it - use [can.Map.prototype.define.serialize serialize]
* Behavior when a property is removed - use [can.Map.prototype.define.remove remove]
* A custom converter method or a pre-defined standard converter called whenever a property is set - use [can.Map.prototype.define.type type]
* That custom converter method as a constructor function - use [can.Map.prototype.define.TypeConstructor Type]

## Demo

The following shows picking cars by make / model / year:

@demo can/map/define/doc/examples/makeModelYear.html




