@page guides/contributing/api-design-guidelines API Design Guidelines
@parent guides/contribute

@description Learn how to design APIs which are consistent with CanJS.

@body

## Overview

CanJS has many goals, one of which is providing a consistent interface and experience for developers using similar functionality or usage patterns across projects. Ideally, a developer should have a rough understanding of how to use something new based on what they have already used in CanJS.

This document is geared towards contributors who are designing new APIs for CanJS and developers of libraries meant to work alongside CanJS projects. Below are useful conventions for designing APIs, which have been adopted by CanJS projects or will be aligned with in future releases.

## Conventions

### Variable casing

All methods and properties should be camelCase. Class and constructor function names are exclusively PascalCase. 

### Methods are verbs, properties are nouns

A developer should be able to tell by looking at an identifier whether it is a function that can be called or an object/property that has a value. In JavaScript, functions can be values so be careful to make the distinction between a *method* (verb) and a function being passed around as data (noun). For example, `handleEvent` is a method, but if that method were being passed around `eventHandler` is more appropriate.

Methods which are only verbs such as `jump()` are discouraged when it is not clear what should be passed to it. A better name `jumpOverPerson()` provides a hint as to what the method expects.

### Private methods and variables

Any method or variable beginning with one or more underscores (`_`) is private to the project and should not be used externally. Ideally these cases are minimized.

Note: there is a temporary convention for Symbols which is an exception to the above. **Documented** variables with two leading underscores, for example `__keys`, are safe to use as they are intentionally exposed for environments where symbols are not supported.

### Creating new things

In CanJS, new "things" are created by either calling a constructor or class with the `new` keyword or calling functions which begin with `make`. For example, to create a Promise from an existing Promise-like object, `can-util` provides `makePromise`. Use of `make` is more explicit than, for example, `getPromise` because the underlying implementation is *creating a value*, not retrieving a value.

### Registries

Throughout CanJS we use a registry pattern. A registry, in abstract terms, is an object where *named* items are added, retrieved, and removed dynamically over the course of a program's life. For example, a component registry is where named components are added, retrieved, and removed. Registries can be implemented with the following interface:

```js
interface Registry<RegistryKey, RegistryItem> {
    add(identifier: RegistryKey, item: RegistryItem): function
    has(identifier: RegistryKey): boolean
    get(identifier: RegistryKey): RegistryItem | undefined
}
```

Notice that there is no method to remove an item for a given identifier. Instead the `add()` method returns a function which will remove the added item. The reason we do this is to provide better system analysis and guarantees. Only one item should be associated with any identifier at any point in time. Suppose two independent programs were using the same registry and both added the "foo" item. There is a race condition there, where one would override the other which would lead to breakage or unexpected behavior. If we counter that by exposing a `remove()` method, someone may remove the existing item and then add their own. This is also a problem because the previous item will have no way of knowing to clean itself up. Thus for registries, we make the guarantees that addition to the registry is first come first serve, throwing if an attempt is made to add an item to existing identifier, and the only way to remove an added item is via the callback returned by the `add()`.