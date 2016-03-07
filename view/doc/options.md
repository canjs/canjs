@constructor can.view.Options
@inherits can.view.Scope
@parent can.view.static


@description Create a helper lookup node
for [can.stache.key keys].  Options are where stache helpers,
partials, local tags, and other non-data objects are found.

@signature `new can.view.Options(options, [parent])`

@release 2.1


@param {Object} options An object with at least one of the following properties:

 - `helpers` - Stache helpers will be found within this object.
 - `partials` - Stache partials will be found within this object.
 - `tags` - Local tag hookups will be found within this object.

If none of these properties are found, the object is assumed to be a
helpers object.s


@param {can.view.Options} [parent] The parent options object. If a `key` value
is not found in the current options object, it will then look in the parent
scope.

@return {can.view.Options} Returns a options instance.

@body

## Use

`can.view.Options` is rarely used directly. However, they are indirectly created in several places:

 - The `helpers` argument of [can.view]
 - [can.Component::helpers]
 - A [can.stache.sectionRenderer stache section renderer]'s `helpers` argument.

And `can.view.Options` are provided several places:

 - A Stache [can.stache.helperOptions helper options]'s `options` property.
 - An attribute callback's [can.view.attrData data]'s `options` property.
 - A tag callback's [can.view.tagData data]'s `options` property.

 Options works just like [can.view.Scope] except it contains references to local non-data values like:

 - Stache helpers
 - partial templates
 - tag hookups

When a stache template is rendered, these can be specified like:


    var options = {
      helpers: {
        isSelected: function( helperOptions ){ ... }
      },
      partials: {
        person: can.view("person")
      },
      tags: {
        people: function(el, tagData){ ... }
      }
    }
    can.view("people.stache", data, options)

If no `helpers`, `partials` or `tags` properties are found, options are assumed to be
helpers.  The following would pass a loal `isSelected` to "people.stache":

    can.view("people.stache", data, {
        isSelected: function( helperOptions ){ ... }
    })
