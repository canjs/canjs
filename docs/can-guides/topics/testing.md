@page guides/testing Testing
@parent guides/essentials 8
@outline 2

@description Learn how to test CanJS applications.

@body

## ViewModels

### Basic Setup

```js
import ViewModel
beforeEach -> const vm = new ViewModel();
```

### Overriding getters

Change: 
```js
aPromise: {
	get() {
		return getList(...);
	}
},

aPromiseValue: {
	get(lastSet, resolve) {
		return this.aPromise.then(resolve);
	}
}
```

...to:
```js
aPromise: {
	get(lastSet) {
		if (lastSet) {
			return lastSet;
		}

		return getList(...);
	}
},

aPromiseValue: {
	get(lastSet, resolve) {
		return this.aPromise.then(resolve);
	}
}
```

### Async Properties

* How to test async getters.
* How to test async setters?
* How to test async listenTos?

## Components

### Basic Setup

```js
import Component
beforeEach -> const component = new Component();
```

### ViewModel

```js
import Component
beforeEach -> const vm = new Component.ViewModel();
```

Then link to [guides/testing#ViewModels Testing ViewModels]

### view

```js
const el = component.element;
```

### Events

* event handlers registered with bindings -> just call function
* events outside the component -> listenTo in property or connectedCllback

### connectedCallback

Generic use of connectedCallback for "third-party" integration (just fake it by setting a class or something and test that element was updated correctly).

* call connectedCallback directly
* insert in real DOM

## Routing

### Basic Setup

### route.data

Create as separate property. Test properties on routeData as you would any other properties.

use RouteMock to prevent changes to real URL.

```js
describe("routing", () => {
  const ViewModel = DefineMap.extend({
    routeData: {
      default() {
        const obs = new DefineMap({});
        route.data = obs;
        
        route.register("{page}", { page: "home"})
        route.register("list/{id}", { page: "list"})
        route.start();
        
        return obs;
      }
    }
  });
  
  let vm;
  
  beforeEach(() => {
    route.urlData = new RouteMock();
    vm = new ViewModel();
    vm.on("routeData", () => {});
  });
  
  it("default page", () => {
    assert.equal(vm.routeData.page, "home");
    assert.equal(route.urlData.value, "");
  });
  
  it("page === list, when id is set", () => {
    route.urlData.value = "#!list/5";
    assert.equal(vm.routeData.page, "list");
    assert.equal(vm.routeData.id, 5);
  });
});
```

### component

Create as separate property.

```js
routeData: {
	default() {
		const data = new DefineMap();
		route.data = data;
		route.start();
	}
}

```

### component viewModel

Separate this out

```js
viewModelData: {
},

get component() {
	return 
}
```

## Models

### Basic Setup

### Basic fixtures

### Generating test data

### Testing Query Logic

```js
    const Todo = DefineMap.extend({
      id: {
        identity: true,
        type: "number"
      },
      name: "string",
      complete: "boolean"
    });

    var todoQueryLogic = new QueryLogic(Todo);
    
    const completeTodos = [
      { id: 2, name: "mow lawn", complete: true }
    ];
    
    const incompleteTodos = [
      {id: 1, name: "do dishes", complete: false}
    ];
    
    const todos = [].concat(completeTodos)
      .concat(incompleteTodos);
    
    const expected = todoQueryLogic.filterMembers(
      { filter: { complete: false } },
      todos
    );
    
    assert.deepEqual(expected, incompleteTodos);
```

Using `isMember` to test custom `toQuery`/`toParams`:
https://canjs.com/doc/can-query-logic.html#TestingyourQueryLogic

## Integration

### Basic Setup

### When should you do it?

* Smoke test "happy path"
* Add tests before making large changes
