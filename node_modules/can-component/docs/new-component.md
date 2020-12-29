@function can-component.new new Component
@parent can-component.create 1
@outline 2

Programmatically instantiate a component

@signature `new Component([options])`

Create an instance of a component without rendering it in a template. This is
useful when you:

- have complex logic for switching between different components (e.g. routing)
- want to create components without adding them to the page (e.g. testing)

The following defines a `MyGreeting` component and creates a `my-greeting`
element by calling `new` on the component’s constructor function:

```js
const HelloWorld = Component.extend({
	tag: "hello-world",
	view: `
		<can-slot name="greetingTemplate" />
		<content>world</content>
		<ul>{{#each(items)}} {{this}} {{/each}}</ul>
	`,
	ViewModel: {
		items: {}
	}
});

// Create a new instance of our component
const componentInstance = new HelloWorld({

	// values with which to initialize the component’s view model
	viewModel: {
		items: ["eat"]
	},

	// can-stache template to replace any <content> elements in the component’s view
	content: "<em>{{message}}</em>",

	// <can-template> strings rendered by can-stache with the scope
	templates: {
		greetingTemplate: "{{greeting}}"
	},

	// scope with which to render the <content> and templates
	scope: {
		greeting: "Hello",
		message: "friend"
	}
});

myGreetingInstance.element; // is like <my-greeting>Hello <em>friend</em> <ul> <li>eat</li> </ul></my-greeting>

myGreetingInstance.viewModel; // is HelloWorld.ViewModel{items: ["eat"]}
```

Changing the component’s view model will cause its element and any bindings to
be updated:

```js
myGreetingInstance.viewModel.items.push("sleep");

myGreetingInstance.element; // is like <my-greeting>Hello <em>friend</em> <ul> <li>eat</li> <li>sleep</li> </ul></my-greeting>
```

See the [Programmatically instantiating a component](#Programmaticallyinstantiatingacomponent)
section for details.

@param {Object} [options] Options for rendering the component, including:
- **content** `{String|Function}`: Similar to the [can-component/content] tag, the `LIGHT_DOM` to be rendered between the component’s starting and ending tags; can either be a string (which will be parsed by [can-stache] by default) or a [can-stache.view] function.
- **scope** `{Object}`: An object that is the scope with which the content should be rendered.
- **templates** `{Object<String,String|Function>}`: An object that has keys that are [can-component/can-template] names and values that are either plain strings (parsed by [can-stache] by default) or [can-stache.view] functions.
- **viewModel** `{Object}`: An object with values to bind to the component’s view model.

  @release 4.3

@body

## Use

You can instantiate new component instances programmatically by using the
component’s constructor function. This is useful when you:

- have complex logic for switching between different components (e.g. [guides/routing])
- want to create components without adding them to the page (e.g. [guides/testing])

The following defines a `MyGreeting` component and creates a `my-greeting`
element by calling `new` on the component’s constructor function:

```js
import {Component} from "can";

const MyGreeting = Component.extend({
  tag: "my-greeting",
  view: "Hello {{subject}}",
  ViewModel: {
    subject: "string"
  }
});

const myGreetingInstance = new MyGreeting({
  viewModel: {
    subject: "friend"
  }
});

console.log( myGreetingInstance.element );
// logs <my-greeting>Hello friend</my-greeting>

console.log( myGreetingInstance.viewModel );
// logs MyGreeting.ViewModel{subject: "friend"}
```
@codepen

In the example above, the `viewModel` is passed in as an option to the
component’s constructor function.

In addition to `viewModel`, there are `templates`, `scope`, and `content`
options. Read below for details on all the options.

### viewModel

The `viewModel` option is used to create the component’s ViewModel instance and bind to
it. For example:

```js
import {Component, DefineMap, value} from "can";

const appVM = new DefineMap({
  association: "friend"
});

const MyGreeting = Component.extend({
  tag: "my-greeting",
  view: "{{greeting}} {{subject}}",
  ViewModel: {
    greeting: "string",
    subject: "string"
  }
});

const myGreetingInstance = new MyGreeting({
  viewModel: {
    greeting: "Hello",
    subject: value.bind(appVM, "association")
  }
});

console.log( myGreetingInstance.element );
// logs <my-greeting>Hello friend</my-greeting>

console.log( myGreetingInstance.viewModel );
// logs MyGreeting.ViewModel{subject: "friend"}
```
@codepen

The way the component is instantiated above is similar to this example below,
assuming it’s rendered by [can-stache] with `appVM` as the current scope:

```html
<my-greeting greeting:raw="Hello" subject:bind="association"></my-greeting>
```

You can recreate one-way and two-way bindings with [can-value], which has
[can-value.bind], [can-value.from], and [can-value.to] methods for creating
two-way, one-way parent-to-child, and one-way child-to-parent bindings,
respectively.

```js
const appVM = new DefineMap({
  family: {
    first: "Milo",
    last: "Flanders"
  }
});

const NameComponent = Component.extend({
  tag: "name-component",
  view: "{{fullName}}",
  ViewModel: {
    givenName: "string",
    familyName: "string",
    get fullName() {
      return this.givenName + " " + this.familyName;
    }
  }
});

const componentInstance = new NameComponent({
  viewModel: {
    // like givenName:from="family.first"
    givenName: value.from(appVM, "family.first"),
    // like familyName:bind="family.last"
    familyName: value.bind(appVM, "family.last"),
    // like fullName:to="family.full"
    fullName: value.to(appVM, "family.full"),
  }
});
```

The way the component is instantiated above is similar to this example below,
assuming it’s rendered by [can-stache] with `appVM` as the current scope:

```html
<my-greeting
  givenName:from="family.first"
  familyName:bind="family.last"
  fullName:to="family.full"
></my-greeting>
```

This will result in an `appVM` with the following data:

```js
{
  family: {
    first: "Milo",
    full: "Milo Flanders",
    last: "Flanders"
  }
}
```

Changing the component’s view model will cause its element and any bindings to
be updated:

```js
componentInstance.viewModel.familyName = "Smith";

componentInstance.element; // is <name-component>Milo Smith</name-component>

appVM.family.last; // is "Smith"
```

### templates

The `templates` option is used to pass a [can-component/can-template] into a
component when it is instantiated.

```js
import {Component} from "can";

const TodosPage = Component.extend({
	tag: "todos-page",
	view: `<ul><can-slot name='itemList' /></ul>`
});

const todosPageInstance = new TodosPage({
	scope: {
		items: ["eat"]
	},
	templates: {
		itemList: `{{#for(item of items)}} <li>{{item}}</li> {{/for}}`
	}
});

document.body.appendChild(todosPageInstance.element);
```
@codepen

This makes `todosPageInstance.element` a fragment with the following structure:

```html
<todos-page>
  <ul>
    <li>eat</li>
  </ul>
</todos-page>
```


### content

The `content` option is used to pass `LIGHT_DOM` into a component when it is
instantiated, similar to the [can-component/content] tag.

```js
import {Component} from "can";

const HelloWorld = Component.extend({
  tag: "hello-world",
  view: "Hello <content>world</content>"
});

const helloWorldInstance = new HelloWorld({
  content: "<em>mundo</em>"
});

document.body.appendChild(helloWorldInstance.element);
```
@codepen

This makes `helloWorldInstance.element` an element with the following structure:

```html
<hello-world>Hello <em>mundo</em></hello-world>
```

### scope

You can also provide a `scope` with which the content should be rendered:

```js
import {Component} from "can";

const HelloWorld = Component.extend({
  tag: "hello-world",
  view: "Hello <content>world</content>"
});

const helloWorldInstance = new HelloWorld({
  content: "<em>{{message}}</em>",
  scope: {
    message: "mundo"
  }
});

document.body.appendChild(helloWorldInstance.element);
```
@codepen


This makes `helloWorldInstance.element` a fragment with the following structure:

```html
<hello-world>Hello <em>mundo</em></hello-world>
```

### initializeBindings

By default bindings are initialized when a component is created. For most components this is what you want. However if you are only conditionally inserting a component it can leak memory if bindings are setup. Setting `initializeBindings: false` prevents the setting up of bindings until the component is inserted into a view.

```js
import {Component, stache} from "can";

const HelloWorld = Component.extend({
  tag: "hello-world",
  view: "Hello world"
});

const helloWorldInstance = new HelloWorld({
  initializeBindings: false
});

// Bindings are not setup.

const view = stache("{{component}}");
document.body.append(view({ component: helloWorldInstance }));

// Now they are!
```
