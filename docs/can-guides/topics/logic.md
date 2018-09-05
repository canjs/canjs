@page guides/logic Logic
@parent guides/essentials 9
@outline 2
@hide

@description Learn how to write observables in an organized, testable, and maintainable way.

@body

> NOTE: This guide is in-progress and is mostly notes on what
> a future guide should look like.  If you have suggestions, please
> add them to [this issue](https://github.com/canjs/canjs/issues/4266).

## Organization

I usually organize my view model code as follows:

```js
import {Component} from "can";

Component.extend({
    tag: "some-component",
    view: `...`,
    ViewModel: {
        // EXTERNAL STATEFUL PROPERTIES
        // These are properties passed from another component.
        todoId: "number",

        // INTERNAL STATEFUL PROPERTIES
        // These are properties that are owned by this component.
        isEditing: {type: "boolean", default: false}

        // DERIVED PROPERTIES
        get something(){ ... }


        // METHODS
        updateTodo(){
            this.dispatch("updateTodo")
        }

        connectedCallback(element){
            // SIDE EFFECTS
            // if `connectedCallback()` isn't called ... then no side effects,
            // you can test yourself
            this.listenTo("updateTodo", function(){
                new Todo().save();
            })
        }    
    }

})
```

## Dispatching

## Side-effects

### "Setter" side-effects

Change:
```js
foo: "string",

bar: {
	type: "string",
	set(val) {
		this.foo = "blah";
		return val;
	}
}
```

...to:

```js
foo: {
	value({ listenTo, resolve, lastSet }) {
		listenTo("bar", () => {
			resolve("blah");
		});

		listenTo(lastSet, resolve);
	}
},
bar: "string"
```

### Side-effects of properties changing

Change: 
```js
state: {
	type: "string,
	set(val) {
		this.city = null;
		return val;
	}
},
city: "string"
```

...to:
```js
state: "string",
city: {
	value({ listenTo, lastSet, resolve }) {
		listenTo("state", () => {
			resolve(null);
		});

		listenTo(lastSet, resolve);

		resolve( lastSet.get() );
	}
}
```

### Side-effects of properties being set

If a property is set to the same value multiple times, there will only be an event the first time. For example, in the following code, there will only be one `console.log`:

```js
const ViewModel = DefineMap.extend({
	state: "string",
	city: {
		value({ listenTo }) {
			listenTo("state", () => {
				console.log("city changed");
			});
		}
	}
});

const vm = new ViewModel();
vm.state = "Illinois";
vm.state = "Illinois";
```

If you need this side-effect even if the value of `state` does not change, you can use an "intermediate event" to keep these properties independent.

```js
state: {
	type: "string,
	set(val) {
		this.stateSetCount++;
		return val;
	}
},
stateSetCount: { default: 0, type: "number" }
```

...to:
```js
state: {
	type: "string,
	set(val) {
		this.stateSet = {};
		// or this.dispatch("stateSet") ???
		return val;
	}
},
// prevent stateSet from being turned into a DefineMap
stateSet: "any",
city: {
	value({ listenTo, lastSet, resolve }) {
		let count = 0;

		listenTo("stateSet", () => {
			resolve(++count);
		});

		listenTo(lastSet, resolve);

		resolve(count);
	}
}
```


### "Getter" side-effects

...You shouldn't have them.

## Using value/listenTo to update a value

This:
```js
foo: {
	value({ listenTo, resolve }) {
		let val = new DefineList([]);
		resolve(val);

		listenTo("bar", (bar) => {
			val.push(bar);
		});

		listenTo("baz", (baz) => {
			val.push(baz);
		});
	}
}
```

...vs:
```js
foo: {
	value({ listenTo, resolve }) {
		let val = new DefineList([]);

		listenTo("bar", (bar) => {
			val.push(bar);
			resolve(val);
		});

		listenTo("baz", (baz) => {
			val.push(baz);
			resolve(val);
		});
	}
}
```

## Third-party integration

connectedCallback

## Events "outside" the component

* listenTo in the connectedCallback
* dispatch event
* listenTo in property

OR 

* listenTo in `value` 

## better page/offset example from https://canjs.com/doc/can-define.types.set.html#Sideeffects
