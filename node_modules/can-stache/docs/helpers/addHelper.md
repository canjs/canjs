@function can-stache.addHelper addHelper
@description Register a global helper function.
@parent can-stache.static

@signature `stache.addHelper(name, helper)`

  Registers a global helper function with stache that always gets passed
  the value of its arguments (instead of value observables like [can-stache.addLiveHelper]).
  Pass the name of the helper followed by the
  function to invoke. See [can-stache.Helpers] for more details on using helpers.

  ```js
  import {stache} from "can";

  stache.addHelper( "upper", function( str ) {
  	return str.toUpperCase();
  } );

  var frag = stache(`{{ upper(name) }}`)( {name: "Justin"} );

  document.body.append(frag); // Outputs: `JUSTIN`
  ```
  @codepen

  @param {String} name The name of the helper.
  @param {can-stache.simpleHelper} helper The helper function.  The helper function will be
    called with a [can-stache.helperOptions] argument if the helper is called first level:

    ```html
    {{# helper() }} HI {{/ helper }}
    ```

@signature `stache.addHelper(helpers)`

Register multiple helpers with stache that always get passed
the value of its arguments (instead of value observables).

Pass an object where the key is the name of a helper and the
value is the callback.

```js
stache.addHelper({
	upper: function(str) {
		return str.toUpperCase();
	},
	lower: function(str) {
		return str.toLowerCase();
	}
});
```

@param {{}} helpers an Object of name/callback pairs.

@body


## Use

Global helper functions should be used to enhance stache with useful functionality
common to most of your application.  Examples of custom helpers might include:

- Converting a raw `Date` to a more user friendly timestamp. `{{ timestamp(birthday) }}`
- Internationalization. `{{ i18n('Hello') }}`
- Convert markdown into HTML. `{{ markdown(comment) }}`

Stache includes a number of built-in helpers, but custom helpers can be added as well.


You can register your own global helper with the `[can-stache.addHelper addHelper]` or `[can-stache.addLiveHelper addLiveHelper]` methods.

`[can-stache.addHelper addHelper]` calls the registered helper function with
values, while `[can-stache.addLiveHelper addLiveHelper]` calls the registered helper function with
[can-compute.computed computes] if observable data is passed. `addHelper` is
easier to use for basic helper functionality.


Localization is a good example of a custom helper you might implement
in your application. The below example takes a given key and
returns the localized value using
[jQuery Globalize](https://github.com/jquery/globalize).

```js
stache.addHelper( "l10n", function( str, options ) {
	return typeof Globalize !== "undefined" ?
		Globalize.localize( str ) :
		str;
} );
```

In the template, invoke the helper by calling the helper
name followed by any additional arguments.

```html
<!-- Template -->
<span>{{ l10n('mystring') }}</span>
```

```html
<!-- Result -->
<span>my string localized</span>
```

## Helper Arguments

The type of arguments passed to a `addHelper` function depends on how the helper was called and the values passed to the helper.  If the helper is called:

- directly within the magic tags like `{{ helper() }}`, it will be called with an additional [can-stache.helperOptions] argument.
- within another expression like `{{ outer( helper() ) }}`, it will be called with the
  arguments visible from stache.

The following demonstrates this:

```js
import {stache} from "can";

stache.addHelper( "argumentsLength", function() {
	return arguments.length;
} );

stache.addHelper( "echo", function(value) {
	return value;
} );

var frag = stache(`
	<p>{{ argumentsLength(0,1) }} should be 3</p>
	<p>{{ echo( argumentsLength(0,1) ) }} should be 2</p>
`)();

document.body.append(frag);
```
@codepen


### Evaluating Helpers

If you want to use a helper with a [can-stache.tags.section] tag, you should  call
`options.fn(context)` in your return statement. This will return a
document fragment or string with the resulting evaluated subsection.

Similarly, you can call `options.inverse(context)` to evaluate the
template between an `{{else}}` tag and the closing tag.

For example, when a route matches the string passed to our
routing helper it will show/hide the text.

```js
import {stache, ObservableObject} from "can";

stache.addHelper( "isReady", ( status, options ) => {

	if ( ["new","backlog"].indexOf(status) !== -1 ) {
		return options.fn();
	} else {
		return options.inverse();
	}
} );

var data = new ObservableObject({status: "new"});
var frag = stache(`
	{{# isReady(status) }}
		I am ready.
	{{else}}
		Wait!
	{{/ isReady }}

	<select value:bind="status">
		<option>new</option>
		<option>backlog</option>
		<option>assigned</option>
		<option>complete</option>
	</select>
`)(data);

document.body.append(frag);
```
@codepen

__Advanced Helpers__

Helpers can be passed normal objects, native objects like numbers and strings,
as well as a hash object. The hash object will be an object literal containing
all ending arguments using the `key=value` syntax. The hash object will be provided
to the helper as `options.hash`. Additionally, when using [can-stache.tags.section] tags with a helper,
you can set a custom context by passing the object instead of `this`.

```js
stache.addHelper( "exercise", ( group, action, num, options ) => {
	if ( group && group.length > 0 && action && num > 0 ) {
		return options.fn( {
			group: group,
			action: action,
			where: options.hash.where,
			when: options.hash.when,
			num: num
		} );
	} else {
		return options.inverse( this );
	}
} );
```

```html
{{#exercise(pets, 'walked', 3, where='around the block' when=time)}}
	Along with the {{#group}}{{.}}, {{/group}}
	we {{action}} {{where}} {{num}} times {{when}}.
{{else}}
	We were lazy today.
{{/exercise}}
```

```js
{
	pets: [ "cat", "dog", "parrot" ],
	time: "this morning"
}
```

This would output:

```html
Along with the cat, dog, parrot, we walked around the block
3 times this morning.
```

Whereas an empty data object would output:

```html
We were lazy today.
```
