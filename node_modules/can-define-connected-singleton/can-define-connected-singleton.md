@page can-define-connected-singleton

# can-define-connected-singleton

Singleton decorator for can-define/map/map

## Overview

This function is used to extend a DefineMap constructor so that a single instance of persisted data is easily referenced, very much like a singleton. This is useful for situations where you only want access to a single shared instance of a class whose data is loaded from a services. The primary use case for this is for referencing a user's session in a client application.

## Usage

```js
import singleton from 'can-define-connected-singleton';
import DefineMap from 'can-define/map/map';

// function wrapper (recommended)
const MyType = singleton(
	DefineMap.extend({ ... })
);

// or as a *legacy* decorator
// SEE: https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy
@singleton
const MyType = DefineMap.extend({ ... });
```

For a practical example of usage refer to the [guides/data-managing-sessions Managing Sessions data guide] which uses a [can-connect] behavior that includes the functionality from this module.

## How does it work

Once you have decorated your class, the class will have three new static properties:

- **`MyType.current`** - the current value for the singleton
- **`MyType.currentPromise`** - the promise which should resolve to the value for the singleton
- **`MyType.saving`** - the instance of the singleton currently active as part of an ongoing save request

The first time you read either `current` or `currentPromise`, the value will be loaded by calling the static `get` method on your class. The `get` method should return a Promise, and this promise will be stored on the static `currentPromise` property of your class:

```js
const MyType = singleton(
  DefineMap.extend({ ... })
);

// define the static "get" method 
// NOTE: the can-map behavior for can-connect does this for you
MyType.get = function() {
  return Promise.resolve('the value');
}

// triggers a call to MyType.get()
MyType.current;  //-> initially undefined

MyType.currentPromise.then(value => {
  MyType.current === value; //-> true
});
```

If your service requires you to pass parameters as part of loading the singleton, e.g logging in to retrieve a session model, your application should use the `save` method on an instance of your class at some point prior to use of `current` or `currentPromise`. The `save` method should return a Promise, and this promise will be stored on the static `currentPromise` property of the class. The instance being saved will be stored on the static `saving` property of the class for the duration of the request:

```js
const MyType = singleton(
  DefineMap.extend({   
    // define the static "get" method 
    // NOTE: the can/map behavior for can-connect does this for you
    get: function() {
      return Promise.resolve('the value');
    },
    ...
  }, {
    // define the instance "save" method 
    // NOTE: the can/map behavior for can-connect does this for you
    save: function() {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(this), 1000);
      });      
    }
  })
);


const instance = new MyType({ username: 'nils', password: 'foobar' });
const promise = instance.save();

MyType.current;  //-> initially undefined, doesn't start a request since .save is ongoing 
MyType.saving === instance; //-> true
MyType.currentPromise === promise; //-> .currentPromise is the is the ongoing save request 
MyType.currentPromise.then(value => {
  MyType.current === value; //-> true
  MyType.current === instance; //-> true
  MyType.saving; //-> undefined after the .save finished 
});
```
 

## Configuration options

By default, the singleton decorator uses the following options:

```js
{
  currentPropertyName: 'current',
  savingPropertyName: 'saving',
  fetchMethodName: 'get',
  createMethodName: 'save',
  destroyMethodName: 'destroy'
}
```

You can specify your own options using the following syntax:

```js
const options = {
  currentPropertyName: 'foo',
  fetchMethodName: 'doFoo'
};

// as a function wrapper (recommended)
const MyType = singleton( options )(
	DefineMap.extend({ ... })
);

// or as a decorator
@singleton( options )
const MyType = DefineMap.extend({ ... });
```

Using the above options, your class would be decorated with `foo` and `fooPromise` properties instead of `current` and `currentPromise`, respectively. Furthermore, the static `doFoo` method will be invoked instead of the `get` method for loading the singleton data.