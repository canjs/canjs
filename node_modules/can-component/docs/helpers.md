@property {Object.<String,can-stache.helper>} can-component.prototype.helpers helpers
@parent can-component.deprecated

@deprecated {4.0} Add methods to your component’s ViewModel instead. See [can-stache can-stache] [can-stache#Creatinghelpers can-stache’s “creating helpers” documentation] for more information.

@description Helper functions used with the component’s view.

@option {Object.<String,can-stache.helper>}

An object of [can-stache] helper names and methods. The helpers are only
available within the component’s view and source html. Helpers
are always called back with `this` as the [can-component::ViewModel] instance.

@body

## Use

[can-component]’s helper object lets you provide helper functions that are localized to
the component’s [can-component::view view].  The following example
uses an `isSelected` helper to render content for selected items. Click
one of the following libraries to toggle them within the `selected` array.

@demo demos/can-component/selected.html
