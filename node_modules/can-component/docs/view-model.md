@function can-component.prototype.view-model viewModel
@parent can-component.deprecated

@deprecated {4.0} Use [can-component.prototype.ViewModel] instead.

@description Return the view model instance or type with which the component’s [can-component.prototype.view]
is rendered.  This is used when more fine grained control is needed over [can-component::ViewModel].

@signature `function(properties, parentScope, element)`

The `viewModel` function takes the `properties` and values that are used to
typically initialize a [can-component.prototype.ViewModel], the
[can-view-scope] the component is rendered within, and the component’s element
and returns either the view-model instance or ViewModel type that the component’s [can-component.prototype.view]
is rendered with.

This is typically used only for special situations where a custom scope or custom bindings
need to be setup.

```js
import Component from "can-component";
import DefineMap from "can-define/map/map";
import Scope from "can-view-scope";
import stache from "can-stache";

Component.extend( {
	tag: "my-element",
	viewModel: function( properties, scope, element ) {
		const vm =  new DefineMap( properties );

		// do special stuff /* ... */
		return vm;
	}
} );

stache( "<my-element first:from='firstName' last='Meyer'/>" )( {
	firstName: "Justin",
	middleName: "Barry"
} );
```

@param {Object} properties An object of values specified by the custom element’s attributes. For example, a view rendered like:

```js
stache( "<my-element title:from='name'></my-element>" )( {
	name: "Justin"
} );
```

Creates an instance of following control:

```js
Component.extend( {
	tag: "my-element",
	viewModel: function( properties ) {
		properties.title; //-> "Justin";
	}
} );
```

And calls the viewModel function with `properties` like `{title: "Justin"}`.

@param {can-view-scope} parentScope

The viewModel the custom tag was found within.  By default, any attribute’s values will
be looked up within the current viewModel, but if you want to add values without needing
the user to provide an attribute, you can set this up here.  For example:

```js
Component.extend( {
	tag: "my-element",
	viewModel: function( properties, parentScope ) {
		parentScope.get( "middleName" ); //-> "Barry"
	}
} );
```

Notice how the `middleName` value is looked up in `my-element`’s parent scope.

@param {HTMLElement} element The element the [can-component] is going to be placed on. If you want
to add custom attribute handling, you can do that here.  For example:

```js
Component.extend( {
	tag: "my-element",
	viewModel: function( properties, parentScope, el ) {
		const vm = new DefineMap( { clicks: 0 } );
		domEvent.addEventListener.call( el, "click", function() {
			vm.clicks++;
		} );
		return vm;
	}
} );
```

This example should be done with the [can-component::events] object instead.

@return {Map|Object} Returns one of the following.

	 - An observable map or list type.
	 - The prototype of an observable map or list type that will be used to render the component’s view.
