@function can.view.bindings.import-scope [prop]="{childProp}"
@parent can.view.bindings

@signature `[prop]="{childProp}"`

Imports a property from a child components viewmodel into this scope.

@param {String} prop The name of the property to set in the current scope.

@param {String} childProp The name of the property to import from the child components viewmodel. Use `{this}` or `{.}` to import the entire viewmodel.

@body

## Use

`[prop]="{childProp}"` can be used to import single values or the complete view model from a child component into the current scope without having to set up a shared property in the parent component. For example, a `car-selector` parent component that contains a `year-selector` and a `car-list` component where we want to share the `selectedYear` property from `year-selector` as the `year` property can be done like this:

	<car-selector>
		<year-selector [year]="{selectedYear}" />
		<car-list selection="{year}" />
	</car-selector>
