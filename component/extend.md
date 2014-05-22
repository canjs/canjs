@function can.Component.extend
@parent can.Component.static

Extends the [can.Component] constructor function.

@signature `can.Component.extend(proto)`

Extends the [can.Component] constructor function with prototype 
properties and methods.

@param {{}} proto An object set as the prototype of the 
constructor function. You will typically provide the following values
on the prototype object.

@option {can.Component.prototype.tag} tag Defines the
tag on which instances of the component constructor function will be
created.

@option {can.Component.prototype.events} [events] Defines events on
dom elements or observable objects the component listens to.


@option {can.Component.prototype.helpers} [helpers] Specifies mustache helpers
used to render the component's template.

@option {can.Component.prototype.scope} [scope] Specifies an object
that is is used to render the component's template.

@option {can.Component.prototype.tempate} [template] Specifies the template
rendered within the custom element.