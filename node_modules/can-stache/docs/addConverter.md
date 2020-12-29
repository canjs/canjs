@function can-stache.addConverter addConverter
@description Register a helper for bidirectional value conversion.
@parent can-stache.static


@signature `stache.addConverter(converterName, getterSetter)`

  Creates a helper that can do two-way conversion between two
  values.  This is especially useful with
  [can-stache-bindings.twoWay two-way bindings] like:

  ```html
  <input value:bind='stringToNumber(age)'/>
  ```

  A converter helper provides:

   - a `get` method that returns the value
    of the `left` value given the arguments passed on the `right`.
   - a `set` method that updates one or multiple of the `right` arguments
     computes given a new `left` value.

  `stringToNumber` might convert a number (`age`)
  to a string (`value`), and the string (`value`) to a number (`age`)
  as follows:


  ```js
  import {stache, Reflect as canReflect, ObservableObject} from "can";

  stache.registerConverter( "stringToNumber", {
  	get( numberObservable ) {
  		return "" + canReflect.getValue(numberObservable);
  	},
  	set( string, numberObservable ) {
  		canReflect.setValue(numberObservable, +string);
  	}
  } );

  var data = new ObservableObject({age: 36});
  var frag = stache(`<input value:bind="age"/> Age: {{age}}`)(data);

  document.body.append(frag);
  ```
  @codepen

  @param {String|Object} converterName The name of the converter helper or an object to register multiple converters at once.
  @param {can-stache.getterSetter} getterSetter An object containing get() and set() functions.

@body

## Use

> __NOTE__: Before creating your own converter, you may want to look at what’s provided by [can-stache-converters].

These helpers are useful for avoiding creating [can-observable-object] getters and setters that do similar conversions on the component.  Instead,
a converter can keep your components more ignorant of the demands of the
view.  Especially as the view’s most common demand is that everything
must be converted to a string.

That being said, the following is a richer example of a converter,
but one that should probably be part of a view model.

```html
<input value:bind='hoursAndMinutes(hours, minutes)'/>
```

The following converts both ways `hours` and `minutes` to `value`.

```js
import {stache, ObservableObject, queues, Reflect as canReflect} from "can";

stache.addConverter( "hoursAndMinutes", {
	get: function( hours, minutes ) {
		return ""+canReflect.getValue( hours ) +":"+ canReflect.getValue( minutes );
	},
	set: function( newFullName, hours, minutes ) {
		queues.batch.start();
		const parts = newFullName.split( ":" );
		canReflect.setValue( hours , +parts[0] );
		canReflect.setValue( minutes , +parts[1] );
		queues.batch.stop();
	}
} );

var data = new ObservableObject({hours: 3, minutes: 17});
var frag = stache(`
	<input value:bind="hoursAndMinutes(hours, minutes)"/>
	Hours: {{hours}}, Minutes: {{minutes}}`
)(data);

document.body.append(frag);
```
@codepen

It is possible to add multiple converters at once by passing an object instead of a string to the `name` argument:

```js
import {stache, ObservableObject, queues, Reflect as canReflect} from "can";

stache.addConverter({
	"numberToHex": {
		get: function(val) {
				return canReflect.getValue(val).toString(16);
		},
		set: function(val, valCompute) {
			return canReflect.setValue(valCompute, parseInt("0x" + val));
		}
	},
	"capitalize": {
		get: function(val){
			return canReflect.getValue(val).toString().toUpperCase();
		},
		set: function(val, valCompute) {
			return canReflect.setValue(valCompute, val.toLowerCase());
		}
	}
});

var data = new ObservableObject({fname: "Cherif", age: 36});
var frag = stache(`
	<div>
		<input value:bind="capitalize(fname)"/>
		Firstname: {{fname}}
	</div>
	<div>
		<input value:bind="numberToHex(age)"/>
		Age: {{age}}
  </div>
 `
)(data);

document.body.append(frag);
```
@codepen
