@typedef {String} can-stache/keys/scope scope
@parent can-stache/keys
@description The template context

@signature `scope.arguments`

In an event binding, `scope.arguments` references the arguments passed when the event was dispatched/triggered.

```html
<input on:click="doSomething(scope.arguments)"/>
```

@signature `scope.element`

In an event binding, `scope.element` references the DOM element the event happened on:

```html
<input on:click="doSomething(scope.element.value)"/>
```

@signature `scope.event`

In an event binding, `scope.event` references the dispatched event object:

```html
<input on:click="doSomething(scope.event)/>"
```

@signature `scope.filename`

The filename of the current template (only available in dev mode).

```html
{{scope.filename}}
```

@signature `scope.find`

Use [can-view-scope::find] to look up the value of a key in the first scope where it is found.

```js
const view = stache( `
{{#each(tasks)}}
  <li>{{this}}{{scope.find("exclamation")}}</li>
{{/each}}
` );

const data = new ObservableObject( {
	tasks: [ "one", "two" ],
	exclamation: "!!!"
} );

const frag = view( data );

// renders:
// <li>one!!!</li>
// <li>two!!!</li>
```

@signature `scope.index`

When looping over an array, [can-define/list/list], or [can-list], you an use `scope.index` to write out the index of each property:

```html
{{#each(tasks)}}
  <li>{{scope.index}} {{name}}</li>
{{/each}}
```

Indexes start at 0.  If you want to start at 1, you can create a helper like:

```js
stache.registerHelper( "scope.indexNum", ( options ) => {
	return options.scope.get( "scope.index" ) + 1;
} );
```

And use it like:

```html
{{#each(task)}}
  <li>{{scope.indexNum}} {{name}}</li>
{{/each}}
```

@signature `scope.key`

Like `scope.index`, but provides the key value when looping through an object:

```html
{{#each(style)}}
  {{scope.key}}: {{this}}
{{/each}}
```

@signature `scope.lineNumber`

The current line number that is being rendered (only available in dev mode).

```html
{scope.lineNumber}}
```

@signature `scope.root`

`scope.root` is deprecated. Use either `scope.top` or `scope.vm` instead.

The root scope. This can be used for reading data from the root when in another scope:

```js
const view = stache( `
{{#each(tasks)}}
  <li>{{this}}{{scope.root.exclamation}}</li>
{{/each}}
` );

const data = new ObservableObject( {
	tasks: [ "one", "two" ],
	exclamation: "!!!"
} );

const frag = view( data );

// renders:
// <li>one!!!</li>
// <li>two!!!</li>
```

@signature `scope.top`

The "top" context that is a viewModel.

```js
const view = stache( `
{{#each(tasks)}}
	<li>{{this}}{{scope.top.exclamation}}</li>
{{/each}}
` );

const parentVm = new ObservableObject( {
	exclamation: "*&!#?!"
} );

const vm = new ObservableObject( {
	tasks: [ "one", "two" ],
	exclamation: "!!!"
} );

var scope = new Scope(parentVm, null, { viewModel: true })
    .add(vm, { viewModel: true });

const frag = view( scope );
```

@signature `scope.vars`

Variables local to the template. See [can-stache/keys/scope/scope.vars] for details.

@signature `scope.view`

The current template. See [can-stache/keys/scope/scope.view] for details.

@signature `scope.viewModel`

In an event binding, `scope.viewModel` references the view model of the current element:

```html
<my-component on:closed="doSomething(scope.viewModel)"/>
```

@signature `scope.vm`

The first context that is a viewModel.

```js
const view = stache( `
{{#each(tasks)}}
  <li>{{this}}{{scope.vm.exclamation}}</li>
{{/each}}
` );

const vm = new ObservableObject( {
	tasks: [ "one", "two" ],
	exclamation: "!!!"
} );

const scope = new Scope(vm, null, { viewModel: true });

const frag = view( scope );

// renders:
// <li>one!!!</li>
// <li>two!!!</li>
```
