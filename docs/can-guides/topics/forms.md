@page guides/forms Forms
@parent guides/essentials 7
@outline 3

@description Learn how to create amazing `<form>`s with CanJS.

@body

## Overview

There are three main tasks when working with forms and form elements:

* setting form element attributes based on view-model data
* responding to browser events
* converting data to formats convenient for your business logic

CanJS provides many useful utilities and techniques to help with these tasks. This guide will walk you through:

* binding to form elements using [guides/forms#Attributebinding one-way], [guides/forms#Two_waybinding two-way], and [guides/forms#Eventbinding event] binding
* combining bindings in a [guides/forms#Datadown_actionsup “data down, actions up”] pattern
* using shorthand bindings like [guides/forms#Bindingattributesonspecificevents `on:input:value:to`]
* storing view-related data in [guides/forms#Bindingtotemplatevariables template variables]
* working with [guides/forms#Commonformelements common form elements]
* using type converters like [guides/forms#Numberinput `type="number"`]
* using more complex converters like [guides/forms#Bindingacheckboxtonon_booleanvalues either-or], [guides/forms#Bindingcheckboxestoalist boolean-to-inList], [guides/forms#Radiobutton equal], and [guides/forms#Bindingoptionsbyindex index-to-selected]
* using custom events like [guides/forms#BindingtotheEnterkey enter] and [guides/forms#Radiobutton radiochange]
* using custom attributes such as [guides/forms#Selectmultiple values] and [guides/forms#Bindingtotemplatevariables focused]
* validating forms using [guides/forms#Manualformvalidation virtual properties] and validation libraries like [guides/forms#Formvalidationusingaplugin validatejs]
* indentifying and navigating [guides/forms#Bindingconflicts bindings conflicts]
* working with [guides/forms#Workingwithrelateddata related data], [guides/forms#Usingpromises promises], and [guides/forms#Resettingaselectionwhenitsparentlistchanges parent-child relationships]

We recommend reading the [guides/forms#Bindings Bindings overview] section first before jumping to the topic that interests you—or start at the top to become an expert on it all.

## Bindings

When working with form elements, there are two basic kinds of bindings—_event bindings_ and _attribute bindings_. Event bindings allow you to respond to [https://developer.mozilla.org/en-US/docs/Web/Events DOM Events] and attribute bindings allow you to bind the value of [https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes HTML Attributes] to properties in your [can-view-scope scope].

The following sections will explain how to use each of these bindings on their own, as well as how to combine them in more advanced binding formats.

### Event binding

Event bindings allow you to respond to [https://developer.mozilla.org/en-US/docs/Web/Events DOM Events]. To set up an event binding, add an attribute to your element like `on:DOM_EVENT="CALL_EXPRESSION"` where `DOM_EVENT` is the event you want to respond to and `CALL_EXPRESSION` is a [can-stache/expressions/call Call Expression] for the function you want to call when the event occurs. Here is a simple example:

@demo demos/forms/bindings-event.html

This example calls the `plusOne` function in the scope when a `"click"` event is triggered on the button. There are many other events that you can listen to. Many of these will be shown in the examples throughout this guide, or you can take a look at [https://developer.mozilla.org/en-US/docs/Web/Events] for a list.

### Attribute binding

Unlike event bindings, which can only be used to call a function when an event occurs, attribute bindings can be used in two directions.

You can use attribute bindings to update the value of an attribute when a property in the scope changes:

@demo demos/forms/bindings-attribute-tochild.html

In this example, we create a `progressValue` property in the scope that continually counts up from 0 to 100. We then use `value:from="progressValue"` to set the `value` attribute of the `<progress>` element whenever the `progressValue` property in the scope changes.

You can also use attribute bindings to update properties in the scope when the value of an attribute changes:

@demo demos/forms/bindings-attribute-toparent.html

This example uses `checked:to="isItChecked"` to update the value of the `isItChecked` property in the scope whenever the checkbox’s `checked` attribute changes.

Attribute bindings work with any HTML attribute. You will see examples of attributes that are useful to bind to in the [guides/forms#Commonformelements Common form elements] section or you can take a look at [https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes List of Attributes] for a comprehensive list.

### Data down, actions up

You can combine Event and Attribute bindings in a [“data down, actions up”](https://dockyard.com/blog/2015/10/14/best-practices-data-down-actions-up) pattern to keep a form element attribute in sync with a property in your scope:

@demo demos/forms/bindings-ddau.html

This example uses `value:from="name"` to set the `value` attribute of both text fields when `name` in the scope changes. It also uses `on:change="handleAction('set', 'name', scope.element.value)"` to listen for `"change"` events on the text fields and call the `handleAction` function with the text field’s [http://localhost/canjs/doc/can-stache/keys/scope#scope_element value].

Data is passed _down_ from the scope to each element using `value:from` and the action of changing the data is passed _up_ through `on:change="handleAction(...)"`, which means that the `value` attribute of the text field is always in sync with the `name` property in the scope.

To see a larger example of this pattern, check out the [guides/forms#Datadown_actionsupwithmultiplecomponents extended example].

### Two-way binding

You can achieve the same behavior as the previous example using [can-stache-bindings.twoWay two-way] binding. It is not as explicit as the “data down, actions up” approach, but it greatly reduces the boilerplate in your code. Here is the same example using two-way binding:

@demo demos/forms/bindings-two-way.html

In this example, `value:bind="name"` is set on each text field to achieve two-way binding between the `value` attribute and the `name` property in the scope.

### Binding attributes on specific events

One other situation where you may want to use separate attribute and event bindings is when you want to listen to events other than `"change"`. Attribute bindings like `value:to="name"` work by listening for [https://developer.mozilla.org/en-US/docs/Web/Events/change change events] in order to know when to update the scope property. For most form elements,`"change"` events are fired when the element loses focus—not each time the user types into the element.

In order to update a value in the scope each time the user types, you could use the “data down, actions up” approach and listen `on:` [https://developer.mozilla.org/en-US/docs/Web/Events/input input] events, but there is also a [can-stache-bindings.toParent#on_VIEW_MODEL_OR_DOM_EVENT_value_to__SCOPE_VALUE_ shorthand] available for updating a value in the scope with the value of an attribute when a specific event occurs. In order to achieve this behavior, you can use `on:input:value:to="name"`. You can combine this with `value:from="name"` to achieve two-way binding with updates on input events:

@demo demos/forms/bindings-on-input-value-to.html

### Binding to template variables

All of the examples shown so far have used variables from the scope for event and attribute bindings. It can be useful to bind to variables without having to create a property on the scope for things that are purely presentational. To create variables local to the template, you can use [can-stache/keys/scope#scope_vars scope.vars]:

@demo demos/forms/bindings-scope-vars.html

This example creates a template variable `scope.vars.focusedOnName` that is bound to the [https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Attribute/focused focused attribute] of the text field and uses it to set a class on the associated `<span>`. Since this is used entirely for CSS in the template, it makes sense to make `focusedOnName` a variable local to the template with `scope.vars`.

## Common form elements

The [guides/forms#Bindings bindings] above make it easy to work with the most common form elements. The following sections describe the most useful attribute and event bindings to use with each of these elements, as well as anything else that is unique to element.

### Text field

```html
<input type="text">
```

Text fields are one of the most common form elements and have many attributes that can be useful to bind to. The most common attribute is `value`—this is the current value of the text entered into the text field.

Here is an example showing different formats for binding to the `value` attribute:

@demo demos/forms/elements-text.html

#### Binding to the Enter key

CanJS also allows you to use custom events within event bindings. A custom event that is very useful with text fields is the `enter` event provided by the [can-event-dom-enter] package. This event listens for [https://developer.mozilla.org/en-US/docs/Web/Events/keyup keyup events] and filters them to only events where the Enter key is released.

@demo demos/forms/elements-text-enter.html

> **Note:** since this is a custom event, you need to opt-in to using it. If you want to use the `enter` event, make sure you register it like:
>```js
>import domEvents from "can-dom-events";
>import enterEvent from "can-event-dom-enter";
>
>domEvents.addEvent(enterEvent);
>```

### Checkbox

```html
<input type="checkbox">
```

The simplest way to work with checkboxes in CanJS is to bind the `checked` attribute to a property in the scope:

@demo demos/forms/elements-checkbox.html

This allows you to toggle the scope property between `true` and `false`.

#### Binding a checkbox to non-boolean values

You can use a checkbox to represent values other than `true` and `false` using the [can-stache-converters.either-or] converter.

This converter allows you to pass a scope property and two values—the value that the scope property should be set to if the checkbox is checked and another that should be used if the checkbox is unchecked.

> **Note:** you need to import the `can-stache-converters` package in order to use the `either-or` converter.

@demo demos/forms/elements-checkbox-either-or.html

Notice that the `{{ bestTypeOfPet }}` property is initially set to `"Cats"` because <del>that is obviously the correct answer</del> the checkbox is unchecked.

If you would like to choose `"Dogs"` by default, you can set the [https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-checked checked attribute].

> **Note:** `checked` is a boolean attribute, so it is the _presence_ of this attribute that sets it to `true`. This means that any of these will set the `bestTypeOfPet` property in the scope to `"Dogs"`:
>
>* `<input type="checkbox" checked>`
>* `<input type="checkbox" checked=true>`
>* `<input type="checkbox" checked=false>`
>* `<input type="checkbox" checked="true">`
>* `<input type="checkbox" checked="false">`
>* `<input type="checkbox" checked="any other value">`

#### Binding checkboxes to a list

Using a checkbox to toggle a property between two values is very useful, but you often want to use checkboxes to select one or many items from a list. To do this, you can use the [can-stache-converters.boolean-to-inList] converter. This will bind the `checked` attribute to whether or not the item is in a list.

The `boolean-to-inList` converter will set the `checked` attribute to `true` or `false` based on whether a value is in the list and add or remove an item from the list when the `checked` attribute changes.

> **Note:** you need to import the `can-stache-converters` package in order to use the `boolean-to-inList` converter.

This might be easier to understand with an example:

@demo demos/forms/elements-checkbox-boolean-to-inlist.html

### Radio button

```html
<input type="radio">
```

When using radio buttons in CanJS, you often want to set the value of a single scope property to a different value for each radio button in a group. The [can-stache-converters.equal equal converter] does exactly this.

> **Note:** you need to import the `can-stache-converters` package in order to use the `equal` converter.

@demo demos/forms/elements-radio-equal.html

This example binds the `checked` attribute to the `equal` converter for each radio button, passing the `favoriteColor` scope property and the color value for each radio button.

### Number input

```html
<input type="number">
```

When working with number inputs, it is important to set the [can-define.types.type#_typeName_ type] to `"number"` to ensure that the value is stored as a number in the scope.

@demo demos/forms/elements-number.html

### File input

```html
<input type="file">
```

When using a file input, the `value` attribute can be used to get a representation of the path to the selected file:

@demo demos/forms/elements-file-value.html

The `files` property cannot be accessed through an attribute binding (since it is not an attribute); however, you can still use the [https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications#Getting_information_about_selected_file(s) File API] by passing `scope.element.files` through a `"change"` event listener:

@demo demos/forms/elements-file-files.html

You could also use `on:change="scope.set('selectedFiles', scope.element.files)"` as described in the [guides/forms#Datadown_actionsup Data down, actions up] section if you only need to display the data, but it is more likely that you would want to use the [https://developer.mozilla.org/en-US/docs/Web/API/FileList FileList object] along with the File JavaScript API.

### Select

```html
<select>
```

When working with `<select>` elements, the `value` attribute of the element will be set to the `value` of the selected option. This means that using `value:bind="..."` will allow you to bind the selected value to a property in the scope:

@demo demos/forms/elements-select.html

By default, the `value` will be set to the text of the option if there is no `value` attribute. Take a look at the difference between the HTML of the previous example and the following:

@demo demos/forms/elements-select-no-value.html

#### Binding options by index

There are times when you need to use numeric indexes for the `<option>` values. When doing this, you can use the [can-stache-converters.index-to-selected] converter to keep “nice” values in your scope property.

> **Note:** you need to import the `can-stache-converters` package in order to use the `index-to-selected` converter.

To use this converter, pass it the property in the scope you want to bind and the list that contains the available options. It will convert the index given by the `value` of the `<option>` to the selected item in the list.

@demo demos/forms/elements-select-index-to-selected.html

The HTML for this example is intentionally verbose to make it easier to understand. Normally you would use stache to generate the `<option>`s directly from the `months` list like:

```html
<select value:bind="index-to-selected(selectedMonth, months)">
	{{# for(months, index=index month=value) }}
		<option value:from="index">{{ month }}</option>
	{{/ for }}
</select>
```

The [can-stache-converters.selected-to-index] converter is also very useful when you want to bind the `<select>` element directly to the index instead of converting it to the selected item right away but you still want to be able to use the selected item in another part of your template.

> **Note:** you need to import the `can-stache-converters` package in order to use the `selected-to-index` converter.

In the following example, the `<select>` element is using `value:bind="selectedIndex"` instead of converting it from an index to the selected item. The text field below it passes that index and the `months` list to the `selected-to-index` converter in order to display the corresponding value from the `months` list. The `<select>` and `<input>` are both two-way bound, so changing either the will update the other.

@demo demos/forms/elements-select-selected-to-index.html

#### Binding options to non-string values

There are times when you want to two-way bind the value selected and convert the string value into its primitive value (e.g. object, string). You can use the [can-stache-converters.string-to-any] converter to do so.

In the following example, the selector is converting the value selected to a primitive and then two-way binding to the variable `primitiveValue`. When presenting the [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof `typeof primitiveValue`], you can see that the string stored in the value has been converted.

@demo demos/forms/elements-select-string-to-any.html

> **Note:** you need to import the `can-stache-converters` package in order to use the `string-to-any` converter.

### Select multiple

```html
<select multiple>
```

When using a `<select>` element to select multiple values, the `value` attribute will only give the first value that was selected. In order to get a list of all selected values, CanJS provides the custom [can-util/dom/attr/attr.special.values values] attribute. This makes it very easy to work with `<select multiple>` elements:

@demo demos/forms/elements-select-multiple.html

### Textarea

```html
<textarea>
```

You can use any of the techniques for [guides/forms#Textfield text fields] with `<textarea>`s:

@demo demos/forms/elements-textarea.html

### Submit button

```html
<input type="submit">
```

Submit buttons by default will submit the form to the server when clicked. With CanJS apps, you usually want to handle this with JavaScript instead of using this default behavior. To do this, you just need to set up an event binding and use [can-stache/keys/scope#scope_event scope.event] so you can call [https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault preventDefault] to prevent the form from being submitted automatically.

Here is an example of what happens by default. Click the Submit button an notice that the demo reloads:

@demo demos/forms/elements-submit-no-prevent.html

This happens because the form is being submitted, which performs a GET request for the same URL. Adding the click handler and `event.preventDefault` prevents this behavior:

@demo demos/forms/elements-submit.html

This will prevent the the form from being submitted when the user explicitly clicks the submit button or presses the Enter key while focused on one of the text fields; however, there are times when a form can be [https://www.w3.org/TR/html5/single-page.html#implicit-submission implicitly submitted] that this `click` handler might not catch. In order to handle these cases in all browsers, use an `on:submit="..."` handler directly on the `<form>` element:

@demo demos/forms/elements-submit-form.html

## Advanced topics

### Form validation

Validating forms in CanJS has two primary steps—validating your view-model and displaying errors.

Separating these responsibilities by validating the view-model directly makes it much easier to unit test your validation rules.

The following sections show how to do form validation manually, as well as how to do it using a plugin like [can-define-validate-validatejs].

#### Manual form validation

For forms with a small number of fields, validating input values can be as simple as creating [can-define.types.get#Virtualproperties virtual properties] that represent the validity of each user input.

When the user input is invalid, errors can be displayed using a CSS class: `{{# if(error) }}class="error"{{/ if }}`.

Also, in this example the submit button is disabled using the `disabled:from="error"` binding.

Here is an example showing this kind of manual validation for a phone number:

@demo demos/forms/advanced-manual-validation.html

#### Form validation using a plugin

It is also possible to use [https://validatejs.org/#validators validate.js] or another JavaScript validation library through plugins to [can-define] like [can-define-validate-validatejs]. This makes it easy to have consistent validation throughout your application without having to write your own validation rules.

This plugin works by reading `validate: { ... }` behaviors from each [can-define.types.propDefinition PropDefinition] of your view-model and using them to build up [https://validatejs.org/#validators validate.js constraints].

It also adds an `errors` method to your view-model for getting a list of invalid properties. The example below also creates a `formatErrors` helper to make working with these errors easier.

Check out the docs for [can-define-validate-validatejs] for more details on this plugin.

Here is the same phone number example using the `can-define-validate-validatejs` plugin:

@demo demos/forms/advanced-validatejs-validation.html

### Binding conflicts

There are times when using two-way binding where the attribute can become out of sync with the scope property it is bound to. To understand this, it is important to understand a little about how bindings work.

When using a binding like `value:bind="scopeProp"`, there are two things that get set up:

* Event Listener 1 listens for `"change"` events on the element, reads the `value` attribute, and sets `scopeProp`
* Event Listener 2 listens for changes to `scopeProp` and sets the `value` attribute of the element

The problem occurs when setting `scopeProp` causes the value of `scopeProp` to be something other than the `value` attribute of the element.

For example, if `scopeProp` is defined like this:

```js
set scopeProp(val) {
	return val.toUpperCase();
}
```

In this scenario, if you type `"hello"` into the `<input>` element

* the input’s `value` attribute is set to `"hello"`
* a `"change"` event is dispatched on the `<input>`
* Event Listener 1 is triggered and calls the `scopeProp` setter
* the `scopeProp` setter sets the value of `scopeProp` to `"HELLO"`
* Event Listener 2 is triggered and sets the `value` of the `<input>` to `"HELLO"`

If you then type `"hello"` in the `<input>` element again

* the `value` attribute is set to `"hello"`
* a `"change"` event is dispatched on the `<input>`
* Event Listener 1 is triggered and calls the `scopeProp` setter
* the `scopeProp` setter sets the value of `scopeProp` to `"HELLO"`
* Event Listener 2 is NOT triggered since `scopeProp` did not change

At this point the `value` attribute of the element and `scopeProp` are no longer the same. However, if you try this in the example below, you’ll notice that the two are always kept in sync:

@demo demos/forms/advanced-sticky.html

This is because when using `:bind`, CanJS will check for this scenario and update the `value` of the `<input>` element to be in sync with `scopeProp`.

If you are using separate bindings like `value:from="scopeProp" on:change:value:to="scopeProp"`, [this does not happen and the values can become out of sync](https://github.com/canjs/can-stache-bindings/issues/439):

@demo demos/forms/advanced-not-sticky.html

With this example it is somewhat complicated to cause the issue; however, there are other scenarios that make it more likely to happen. One of these is when using the [can-define.types.value can-define value behavior] introduced in CanJS 4.0 to _conditionally_ `resolve` with a new value.

The following example sets up a number input that only allows the user to enter odd numbers. It does this by checking the new value whenever `lastSet` changes and only calling `resolve` if the number is odd. Try out this example below to see how this works:

@demo demos/forms/advanced-sticky-resolve.html

Since this example is using `value:bind="oddNumber"`, it works correctly. However, if the binding is changed to `value:from="oddNumber" on:input:value:to="oddNumber"`, the `<input>` can incorrectly end up with even-numbered values:

@demo demos/forms/advanced-not-sticky-resolve.html

## Extended examples

### Data down, actions up with multiple components

The benefits of the “data down, actions up” pattern become clear when you have multiple components passing actions up to the top-level component. With this setup, there is only one place where state can change within the application, which can make debugging much easier.

The following example has a top-level `<pizza-form>` component that keeps the lists of ingredients that a user has chosen to top their pizza. It also provides an `updateIngredients` function for handling the different actions the user can perform. The `<pizza-form>` passes this function to its children:

```html
<p>
	Selected Ingredients:
	{{# for(meat of this.selectedMeats) }}
		{{ meat }},
	{{/ for }}

	{{# for(veggie of this.selectedVegetables) }}
		{{ veggie }},
	{{/ for }}

	{{# if(this.selectedCheese) }}
		{{ this.selectedCheese }} cheese
	{{/ if }}
</p>

<div>
	<select-one
		listName:from="'cheese'"
		update:from="this.updateIngredients"
		default:from="this.selectedCheese"
		options:from="this.availableCheeses">
	</select-one>
</div>

<div>
	<meat-picker
		update:from="this.updateIngredients"
		options:from="this.availableMeats">
	</meat-picker>
</div>

<div>
	<select-many
		listName:from="'vegetables'"
		update:from="this.updateIngredients"
		options:from="this.availableVegetables">
	</select-many>
</div>
```
@highlight 19,28,36,only

The child `<meat-picker>` component uses this function to clear the “meats” list and also passes it to a child of its own:

```html
<div>
	<label>
		Vegetarian?
		{{# if(scope.vars.showOptions }}
			<input
				checked:bind="not( scope.vars.showOptions )"
				on:change="scope.root.update('meats', 'clear')"
				type="checkbox">
		{{ else }}
			<input
				checked:bind="not( scope.vars.showOptions )"
				type="checkbox">
		{{/ if }}
	</label>

	{{# if(scope.vars.showOptions) }}
		<select-many
			update:from="update"
			listName:from="'meats'"
			options:from="options">
		</select-many>
	{{/ if }}
</div>
```
@highlight 7,18,only

This strategy means that all updates throughout the application go through the top-level `updateIngredients` function. This makes debugging very easy since it is obvious where to put a breakpoint to trace exactly what is causing a change.

Take a look at the example below to see this in _action_:

@demo demos/forms/extended-pizza-example.html

### Working with related data

The form below has three `<select>` elements for selecting a make, model and year. Once all three have been selected, a list of vehicles matching the selection is displayed. There are three different APIs being used to load the data for this component:

* `/makes` — loads the makes
* `/models` — loads the models and years for a selected make
* `/vehicles` — loads the vehicles for a selected make, model, and year

There are many useful techniques for working with related data. Before diving in to them, take a look at the example to see how it all works:

@demo demos/forms/extended-make-model-year.html

#### Loading initial data

In order to load the initial data, the view-model makes a request to the `/makes` API when the page first loads. The view-model uses a [can-define.types.default default value] to make this API call:

```js
ViewModel: {
	makeId: "string",
	makes: {
		default() {
			return ajax({
				type: "GET",
				url: "/makes"
			}).then(function(resp) {
				return resp.data;
			});
		}
	},
	modelId: {
		type: "string",
		value(prop) {
			prop.listenTo(prop.lastSet, prop.resolve);

			prop.listenTo("makeId", function() {
				prop.resolve("");
			});
		}
	},
	get modelsPromise() {
		let makeId = this.makeId;
		if( makeId ) {
			return ajax({
				type: "GET",
				url: "/models",
				data: { makeId: makeId }
			}).then(function(resp) {
				return resp.data;
			});
		}
	},
	models: {
		get: function(lastSet, resolve) {
			let promise = this.modelsPromise;
			if(promise) {
				promise.then(resolve);
			}
		}
	},
	get model() {
		let models = this.models,
			modelId = this.modelId;

		if(models && models.length && modelId) {
			let matched = models.filter(function(model) {
				return modelId == model.id;
			});
			return matched[0];
		}
	},
	get years() {
		let model = this.model;
		return model && model.years;
	},
	year: {
		type: "string",
		value(prop) {
			prop.listenTo(prop.lastSet, prop.resolve);

			prop.listenTo("modelId", function() {
				prop.resolve("");
			});
		}
	},
	vehicles: {
		get: function(lastSet, resolve) {
			let year = this.year,
				modelId = this.modelId;

			if(modelId && year) {
				ajax({
					type: "GET",
					url: "/vehicles",
					data: { modelId: modelId, year: year }
				}).then(function(resp) {
					resolve(resp.data);
				});
			} else {
				resolve([]);
			}
		}
	}
}
```
@highlight 3-12,only

This `default` value is initialized the first time the `makes` property is used in the view:

```html
<select value:bind="makeId"
	{{# if(makes.isPending) }}disabled{{/ if }}>
	{{# if(makes.isPending) }}
	  <option value=''>Loading...</option>
	{{ else }}
	  {{^ makeId }}
		<option value=''>Select a Make</option>
	  {{/ makeId }}
	  {{# for( make of makes.value) }}
		<option value:from="make.id">{{ make.name }}</option>
	  {{/ for }}
	{{/ if }}
</select>

{{# if(modelsPromise) }}
	{{# if(models) }}
		<select value:bind="modelId">
			{{^ modelId }}
				<option value=''>Select a Model</option>
			{{/ modelId }}
			{{# for(model of models) }}
				<option value:from="model.id">{{ model.name }}</option>
			{{/ for }}
		</select>
	{{ else }}
		<select disabled><option>Loading Models</option></select>
	{{/ if }}
{{ else }}
	<select disabled><option>Models</option></select>
{{/ if }}

{{# if(years) }}
	<select value:bind="year">
		{{^ year }}
			<option value=''>Select a Year</option>
		{{/ year }}
		{{# for(year of years ) }}
			<option value:from="year">{{ year }}</option>
		{{/ for }}
	</select>
{{ else }}
	<select disabled><option>Years</option></select>
{{/ if }}

<div>
	{{# for(vehicle of vehicles) }}
		<h2>{{ vehicle.name }}</h2>
		<img src:from="vehicle.thumb" width="200px"/>
	{{/ for }}
</div>
```
@highlight 2,only

> **Note:** you could also use a [can-define.types.get getter] for this property. The getter will be called once to get the initial value and will only be called again if an observable it is using changes. Since no observables are being used, using a `get` for the `makes` property will behave the same as using `default`.
> Using `get` also means that you can use the shorthand [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get getter syntax] so this:
>```js
> makes: {
>   get: function() {
>     // ...
>   }
> }
>```
> can be written like this:
>```js
> get makes() {
>   // ...
> }
>```

#### Using promises

The `makes` property is set to the result of calling [can-ajax], which returns a [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise promise].

This promise is decorated by [can-reflect-promise] so that in the view you can easily use metadata related to the promise’s [https://github.com/domenic/promises-unwrapping/blob/master/docs/states-and-fates.md#states state]:

* `state` — one of "pending", "resolved", or "rejected"
* `isPending` — true if the promise is neither resolved nor rejected, false otherwise.
* `isResolved` — true if the promise is resolved, false otherwise.
* `isRejected` — true if the promise is rejected, false otherwise.

This also means that in order to get the `makes` data, we need to use the `value` of the promise:

```html
<select value:bind="makeId"
	{{# if(makes.isPending) }}disabled{{/ if }}>
	{{# if(makes.isPending) }}
	  <option value=''>Loading...</option>
	{{ else }}
	  {{^ makeId }}
		<option value=''>Select a Make</option>
	  {{/ makeId }}
	  {{# for( make of makes.value) }}
		<option value:from="make.id">{{ make.name }}</option>
	  {{/ for }}
	{{/ if }}
</select>

{{# if(modelsPromise) }}
	{{# if(models) }}
		<select value:bind="modelId">
			{{^ modelId }}
				<option value=''>Select a Model</option>
			{{/ modelId }}
			{{# for(model of models) }}
				<option value:from="model.id">{{ model.name }}</option>
			{{/ for }}
		</select>
	{{ else }}
		<select disabled><option>Loading Models</option></select>
	{{/ if }}
{{ else }}
	<select disabled><option>Models</option></select>
{{/ if }}

{{# if(years) }}
	<select value:bind="year">
		{{^ year }}
			<option value=''>Select a Year</option>
		{{/ year }}
		{{# for(year of years ) }}
			<option value:from="year">{{ year }}</option>
		{{/ for }}
	</select>
{{ else }}
	<select disabled><option>Years</option></select>
{{/ if }}

<div>
	{{# for(vehicle of vehicles) }}
		<h2>{{ vehicle.name }}</h2>
		<img src:from="vehicle.thumb" width="200px"/>
	{{/ for }}
</div>
```
@highlight 9,only

In order to avoid having to use `.value` every time you want to use the data, it can be very useful to split promises into two separate properties—one for the promise and one for the value. Using this “promise splitting” technique, this code could be written like this:

```js
makesPromise: {
	default() {
		return ajax({
			type: "GET",
			url: "/makes"
		}).then(function(resp) {
			return resp.data;
		});
	}
},
makes: {
	get(lastSet, resolve) {
		this.makesPromise.then(resolve);
	}
}
```

This uses a `default` value for the `makesPromise` and an [can-define.types.get#get_lastSetValue_resolve_value__ asynchronous getter] for the `makes` property.

The asynchronous getter does not return anything, instead it passes the list of `makes` to `resolve`. The code above is the same as:

```js
this.makesPromise.then(function(makes) {
	resolve(makes);
});
```

> **Note:** when using asynchronous getters, you cannot use the shorthand getter syntax (`get makes() { ... }`) since JavaScript getters [http://whereswalden.com/2010/08/22/incompatible-es5-change-literal-getter-and-setter-functions-must-now-have-exactly-zero-or-one-arguments/ must have only one argument].

#### Loading new data

In order to load the correct `models` for a make, a request to the `/models` API must be made whenever a make is selected. In order to do this, the make `<select>` element is bound to the `makeId` property:

```html
<select value:bind="makeId"
	{{# if(makes.isPending) }}disabled{{/ if }}>
	{{# if(makes.isPending) }}
	  <option value=''>Loading...</option>
	{{ else }}
	  {{^ makeId }}
		<option value=''>Select a Make</option>
	  {{/ makeId }}
	  {{# for( make of makes.value) }}
		<option value:from="make.id">{{ make.name }}</option>
	  {{/ for }}
	{{/ if }}
</select>

{{# if(modelsPromise) }}
	{{# if(models) }}
		<select value:bind="modelId">
			{{^ modelId }}
				<option value=''>Select a Model</option>
			{{/ modelId }}
			{{# for(model of models) }}
				<option value:from="model.id">{{ model.name }}</option>
			{{/ for }}
		</select>
	{{ else }}
		<select disabled><option>Loading Models</option></select>
	{{/ if }}
{{ else }}
	<select disabled><option>Models</option></select>
{{/ if }}

{{# if(years) }}
	<select value:bind="year">
		{{^ year }}
			<option value=''>Select a Year</option>
		{{/ year }}
		{{# for(year of years ) }}
			<option value:from="year">{{ year }}</option>
		{{/ for }}
	</select>
{{ else }}
	<select disabled><option>Years</option></select>
{{/ if }}

<div>
	{{# for(vehicle of vehicles) }}
		<h2>{{ vehicle.name }}</h2>
		<img src:from="vehicle.thumb" width="200px"/>
	{{/ for }}
</div>
```
@highlight 1,only

The view-model then uses this property in the `modelsPromise` getter:
```js
ViewModel: {
	makeId: "string",
	makes: {
		default() {
			return ajax({
				type: "GET",
				url: "/makes"
			}).then(function(resp) {
				return resp.data;
			});
		}
	},
	modelId: {
		type: "string",
		value(prop) {
			prop.listenTo(prop.lastSet, prop.resolve);

			prop.listenTo("makeId", function() {
				prop.resolve("");
			});
		}
	},
	get modelsPromise() {
		let makeId = this.makeId;
		if( makeId ) {
			return ajax({
				type: "GET",
				url: "/models",
				data: { makeId: makeId }
			}).then(function(resp) {
				return resp.data;
			});
		}
	},
	models: {
		get: function(lastSet, resolve) {
			let promise = this.modelsPromise;
			if(promise) {
				promise.then(resolve);
			}
		}
	},
	get model() {
		let models = this.models,
			modelId = this.modelId;

		if(models && models.length && modelId) {
			let matched = models.filter(function(model) {
				return modelId == model.id;
			});
			return matched[0];
		}
	},
	get years() {
		let model = this.model;
		return model && model.years;
	},
	year: {
		type: "string",
		value(prop) {
			prop.listenTo(prop.lastSet, prop.resolve);

			prop.listenTo("modelId", function() {
				prop.resolve("");
			});
		}
	},
	vehicles: {
		get: function(lastSet, resolve) {
			let year = this.year,
				modelId = this.modelId;

			if(modelId && year) {
				ajax({
					type: "GET",
					url: "/vehicles",
					data: { modelId: modelId, year: year }
				}).then(function(resp) {
					resolve(resp.data);
				});
			} else {
				resolve([]);
			}
		}
	}
}
```
@highlight 24,29,only

When the `view` uses the `modelsPromise` property, it will become [can-event-queue/map/map.can.isBound bound], which means it

* will be called once to get its value
* will cache this initial value
* will set up listeners for any observables used within the getter

If the `modelsPromise` is read a second time, the cached value will be returned.

If the `makeId` property changes, the getter will be called again and a new request will be made to the `/models` API.

#### Resetting a selection when its parent list changes

Similar to the `makeId`, the `<select>` for models is bound to the `modelId` property:

```html
<select value:bind="makeId"
	{{# if(makes.isPending) }}disabled{{/ if }}>
	{{# if(makes.isPending) }}
	  <option value=''>Loading...</option>
	{{ else }}
	  {{^ makeId }}
		<option value=''>Select a Make</option>
	  {{/ makeId }}
	  {{# for( make of makes.value) }}
		<option value:from="make.id">{{ make.name }}</option>
	  {{/ for }}
	{{/ if }}
</select>

{{# if(modelsPromise) }}
	{{# if(models) }}
		<select value:bind="modelId">
			{{^ modelId }}
				<option value=''>Select a Model</option>
			{{/ modelId }}
			{{# for(model of models) }}
				<option value:from="model.id">{{ model.name }}</option>
			{{/ for }}
		</select>
	{{ else }}
		<select disabled><option>Loading Models</option></select>
	{{/ if }}
{{ else }}
	<select disabled><option>Models</option></select>
{{/ if }}

{{# if(years) }}
	<select value:bind="year">
		{{^ year }}
			<option value=''>Select a Year</option>
		{{/ year }}
		{{# for(year of years ) }}
			<option value:from="year">{{ year }}</option>
		{{/ for }}
	</select>
{{ else }}
	<select disabled><option>Years</option></select>
{{/ if }}

<div>
	{{# for(vehicle of vehicles) }}
		<h2>{{ vehicle.name }}</h2>
		<img src:from="vehicle.thumb" width="200px"/>
	{{/ for }}
</div>
```
@highlight 17,only

This works great for selecting a model from the list given for a particular make; however, if the make changes, the selected `modelId` will point to a different model in the list for the new make—or it might not exist at all.

In order to handle this parent-child relationship correctly, the `modelId` property needs to be bound to the value in its own `<select>` element, but it also needs to be cleared when the value of the parent `<select>` element changes. The [can-define.types.value can-define value behavior] makes it possible to define properties that are composed from events of other properties on the map.

In order to define `modelId`, the `value` behavior will

* call `prop.resolve` with the new `modelId` when `prop.lastSet` changes—this is whenever a new model is chosen from the `<select>`
* call `prop.resolve` with an empty string when `makeId` changes to reset the `<select>` back to the default `<option>`

```js
ViewModel: {
	makeId: "string",
	makes: {
		default() {
			return ajax({
				type: "GET",
				url: "/makes"
			}).then(function(resp) {
				return resp.data;
			});
		}
	},
	modelId: {
		type: "string",
		value(prop) {
			prop.listenTo(prop.lastSet, prop.resolve);

			prop.listenTo("makeId", function() {
				prop.resolve("");
			});
		}
	},
	get modelsPromise() {
		let makeId = this.makeId;
		if( makeId ) {
			return ajax({
				type: "GET",
				url: "/models",
				data: { makeId: makeId }
			}).then(function(resp) {
				return resp.data;
			});
		}
	},
	models: {
		get: function(lastSet, resolve) {
			let promise = this.modelsPromise;
			if(promise) {
				promise.then(resolve);
			}
		}
	},
	get model() {
		let models = this.models,
			modelId = this.modelId;

		if(models && models.length && modelId) {
			let matched = models.filter(function(model) {
				return modelId == model.id;
			});
			return matched[0];
		}
	},
	get years() {
		let model = this.model;
		return model && model.years;
	},
	year: {
		type: "string",
		value(prop) {
			prop.listenTo(prop.lastSet, prop.resolve);

			prop.listenTo("modelId", function() {
				prop.resolve("");
			});
		}
	},
	vehicles: {
		get: function(lastSet, resolve) {
			let year = this.year,
				modelId = this.modelId;

			if(modelId && year) {
				ajax({
					type: "GET",
					url: "/vehicles",
					data: { modelId: modelId, year: year }
				}).then(function(resp) {
					resolve(resp.data);
				});
			} else {
				resolve([]);
			}
		}
	}
}
```
@highlight 15-21,only

Using this technique allows you to easily define the parent-child relationship between `make` and `model` while also keeping all of the code that specifies how `modelId` works within the `modelId` [can-define.types.propDefinition PropDefinition].

#### Creating and updating data

Interested in adding examples for how to create and update data on the server? Take a look at [this issue](https://github.com/canjs/canjs/issues/4007).

## Have a question?

Please ask on [our forums](https://forums.bitovi.com/c/canjs) or in [Slack](https://www.bitovi.com/community/slack)!
