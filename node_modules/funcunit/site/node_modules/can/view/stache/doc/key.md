@typedef {String} can.stache.key key
@parent can.stache.types


@description A named reference to a value in the [can.view.Scope scope] or 
[can.view.Options helper scope] in a template.

@option {String}

A key specifies a value in the [can.view.Scope scope] or 
[can.view.Options options] of a template being rendered. The
key is used to look up a value in the scope.

What the key looks like changes the behavior of how a value is looked up in 
the scope. Keys can look like:

 - `{{name}}` - Single property name.
 - `{{name.first}}` - Multiple property names.
 - `{{foo\\.bar}}` - Single property name that includes a dot character.
 - `{{./name}}` - Single property in the current context.
 - `{{../name}}` - Single property in the parent context.
 - `{{.}}` or `{{this}}` - The current context.
 - `{{../.}}` - The parent context.
 - `{{@key}}` - Pass the value at key, even if it's a function or a compute.
 - `{{~key}}` - Pass a compute as the key's value instead of the value.
 - `{{*variable}}` - Reference a value in template scope.
 - `{{%key}}` - A special value that is added to scope. Examples:
    - `{{%index}}` - The index of a value in an array or [can.List].
    - `{{%key}}` - The property name of a value within an object or [can.Map].
    - `{{%element}}` - The element an event was dispatched on.
    - `{{%event}}` - The event object.
    - `{{%viewModel}}` - The viewModel of the current element.

@body

## Use

A key references a value within the [can.view.Scope scope] of a 
template being rendered. In the following example, the 
key is `name`:

    <h1>{{name}}</h1>
    
If this template is rendered with:

    {
      name: "Austin"
    }

The template writes out:

    <h1>Austin</h1>

A scope is a collection of multiple contexts. By default, a 
key walks up the scope to each context until it finds a value. For example,
a template like:

    {{first}} {{last}}
      {{#children}}
        {{first}} {{last}}
      {{/children}}

Rendered with:

    {
      first: "Barry", last: "Meyer",
      children: [
        {first: "Kim", last: "Sully"},
        {first: "Justin"},
      ]
    }

Writes out:

    Barry Meyer
        Kim Sully
        Justin Meyer

When `last` is looked up on the `{first: "Justin"}` object and not found,
it will then try to read the parent context's `last` property.  This is
why "Justin Meyer" is written out.

Keys have different operators that control the values that are 
looked up or the value that is returned:

- __value lookup__ `EXPRESSION.key`
- __current context__ `./key`
- __parent context__ `../key`
- __context__ `.` or `this`
- __special__ `%special`
- __template variable__ `*key`
- __at__ `@key`
- __compute__ `~key`



## Default key return values by expression and data types

Keys can have slightly different default behavior depending if they are used in:

 - [helper arguments](can.stache.expressions.html#section_Helperexpression) like: `{{helper some.key}}`
 
when compared to the other places they are used:

 - [lookup expressions](can.stache.expressions.html#section_KeyLookupexpressions) like: `{{some.key}}`
 - [call-expression arguments](can.stache.expressions.html#section_Callexpression) like: `{{helper(some.key)}}`
 - [can.view.bindings.can-EVENT event bindings] like: `($click)="method(some.key)"`
 - [can.view.bindings data bindings] like: `{some-attr}="some.key"`

Furthermore keys return different values depending on the data type.

In general:

 - Functions are called to get their return value. (Use the AT operator `@` to prevent this).
 - Keys in helper expression arguments that find observable data return 
   a [can.compute] that represents the value. 
 - Keys in other expressions return the value.
 - If no observable data is found, the key's value is returned in all expressions.

The following illustrates what `some.key` would return given
different data structures as a helper expression and in all other expressions.

```
// A non-observable JS object:
{some: {key: "value"}};
   // Helper -> "value"
   // Other  -> "value"

// A non-observable JS object w/ a function at the end
{some: {key: function(){ return "value"; }}}
   // Helper -> "value"
   // Other  -> "value"

// A non-observable JS object with intermeidate functions:
{some: function(){ return {key: "value"}}}
   // Helper -> "value"
   // Other  -> "value"

// A observable can.Map
{some: new can.Map({key: "value"})}
   // Helper -> can.compute("value")
   // Other  -> "value"

// A method on an observable can.Map that reads observables
var Some = can.Map.extend({key: function(){ return this.attr("value")}})
{some: new Some({value: "value"})}
   // Helper -> can.compute("value")
   // Other  -> "value"
```

## context operators `./`, `../`, `.` and `this`

Sometimes, especially with recursive templates, you want to control which
context is used to lookup.  Adding `./` before the key name will 
only look up in the current context.

The following template:

    {{first}} {{last}}
      {{#children}}
        {{first}} {{./last}}
      {{/children}}

Rendered with:

    {
      first: "Barry", last: "Meyer",
      children: [
        {first: "Kim", last: "Sully"},
        {first: "Justin"},
      ]
    }

Writes out:

    Barry Meyer
        Kim Sully
        Justin 

Notice that `{{./last}}` returns nothing because there's no `last` property
in the `{first: "Justin"}` object.


Adding `../` before a key will lookup the key starting in the parent 
context.  By changing the previous template to:

    {{first}} {{last}}
      {{#children}}
        {{first}} {{../last}}
      {{/children}}

It will write out:

    Barry Meyer
        Kim Meyer
        Justin Meyer

You can use `.././last` to lookup `last` _only_ in the parent context.


To write out the current context, write `{{.}}` or `{{this}}`. For example,
a template like:

    {{#each names}}{{.}} {{/each}}

With data like:

    {names: ["Jan","Mark","Andrew"]}

Will write out:

    Jan Mark Andrew 

## at operator `@`

The AT operator indicates to return whatever value is at a key, regardless
if it's a function or a compute.

The following illustrates what `some@key` would return given
different data structures:


```
// A non-observable JS object:
{some: {key: "value"}} 
   //-> "value"

// A non-observable JS object w/ a function at the end
{some: {key: function(){ return "value"; }}}
   //-> function(){ return "value"; }

// A non-observable JS object with intermeidate functions:
{some: function(){ return {key: "value"}}}
   //-> "value"

// A observable can.Map
{some: new can.Map({key: "value"})}
   //-> "value"

// A method on an observable can.Map that reads observables
var Some = can.Map.extend({key: function(){ return this.attr("value")}})
{some: new Some({value: "value"})}
   //-> function(){ return this.attr("value")}
```

Where `some@key` returns a function, that function is "bound" via `.bind(context)`
to the parent object.  This means that calling the function will
have `this` set to what is expected.

If the AT operator is used at the start of a key like:

```
{{method(@key)}}
```

This will return whatever is at the `key` property on the first context in the scope
to have a non-undefined `key` value.

The AT operator can be used multiple times within a value lookup expression like:

```
{{method(models@Todo@findAll)}}
```


## compute operator `~`

The compute operator can be used in non helper expressions to pass
a compute instead of a value if an observable is found.  This
makes non-helper expression arguments behave similar to helper 
expression arguments.

The following illustrates what `~some.key` would return given
different data structures:

```
// A non-observable JS object:
{some: {key: "value"}} 
   //-> "value"

// A non-observable JS object w/ a function at the end
{some: {key: function(){ return "value"; }}}
   //-> "value"

// A non-observable JS object with intermeidate functions:
{some: function(){ return {key: "value"}}}
   //-> "value"

// A observable can.Map
{some: new can.Map({key: "value"})}
   //-> can.compute("value")

// A method on an observable can.Map that reads observables
var Some = can.Map.extend({key: function(){ return this.attr("value")}})
{some: new Some({value: "value"})}
   //-> can.compute(function(){ return this.attr("value")})
```

Notice that `~` should only be used once in a value lookup expression.

## template variable operator `*`

Every template contains a context which is able to store values
local to the template. Keys with `*` reference variables in that context.

Template variables are often used to pass data between 
components. `<component-a>` exports its `propA` value to the
template variable `*variable`.  This is, in turn, used to update
the value of `propB` in `<component-b>`.

```
<component-a {^prop-a}="*variable"/>
<component-b {prop-b}="*variable"/>
```

Template variables are global to the template. Similar to JavaScript `var` 
variables, template variables do not have block leve scope.  The following
does not work:

```
{{#each something}}
	<component-a {^prop-a}="*variable"/>
	<component-b {prop-b}="*variable"/>
{{/each}}
```

To work around this, an `localContext` helper could be created as follows:

```
can.stache.regsiterHelper("localContext", function(options){
  return options.fn(new can.Map());
});
```

And used like:

```
{{#each something}}
	{{#localContext}}
	  <component-a {^prop-a}="./variable"/>
	  <component-b {prop-b}="./variable"/>
	{{/localContext}}
{{/each}}
```

## special operator `%`

[can.view.bindings.can-EVENT Event bindings] and some helpers like [can.stache.helpers.each]
provide special values that start with `%` to prevent potential collisions with
other values.  

### %index and %key

When looping over an array or [can.List], you an use `%index` to write out
the index of each property:

    {{#each task}}
      <li>{{%index}} {{name}}</li>
    {{/each}}
    
Indexes start at 0.  If you want to start at 1, you can create a helper like:

    can.stache.registerHelper('%indexNum', function(options){
      return options.scope.attr("%index")+1;
    })

And use it like:

    {{#each task}}
      <li>{{%indexNum}} {{name}}</li>
    {{/each}}

### %element

In an event binding, `%element` references the DOM element the event happened on:

```
<input ($click)="doSomething(%element.value)"/>
```

### %event

In an event binding, `%event` references the dispatched event object:

```
<input ($click)="doSomething(%event)/>"
```

### %viewModel

In an event binding, `%viewModel` references the view model of the current element:

```
<my-component (closed)="doSomething(%viewModel)"/>
```
