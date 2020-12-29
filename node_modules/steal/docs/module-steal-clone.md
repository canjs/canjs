@module {function()} steal.steal-clone steal-clone
@parent StealJS.modules
@description
Steal-clone is a module that allows you to clone Steal's loader and provide module definitions that will be used when doing dynamic imports.

@signature `clone(moduleOverrides)`

@param {Object} moduleOverrides Module identifiers and definitions used to override modules of the same name. These definitions will be used when importing parent modules using the `import` statement of the returned loader.

@return {Object} The cloned loader.

@body

## Use

If you have `moduleA` defined as:

```js
import moduleB from 'moduleB';

export default function() {
  return 'moduleA ' + moduleB();
};
```

and `moduleB` defined as:

```js
export default function() {
  return 'moduleB';
};
```

You can use `clone` to override the definition of moduleB that will be used from within moduleA:

```js
import clone from 'steal-clone';

clone({
  'moduleB': {
    default: function() {
      return 'moduleBOverride';
    }
  }
})
.import('moduleA')
.then(function(moduleA) {
  moduleA(); // moduleA moduleBOverride
});
```

### Module Identifiers

The keys passed in the `moduleOverrides` object ("moduleB" in the example above) can be any valid module identifier. All of the module syntaxes supported by Steal are supported by steal-clone. If you're using [ES6 modules](http://stealjs.com/docs/syntax.es6.html), you can use the same value used in your import statement. Similarly, if you're using [CommonJS](http://stealjs.com/docs/syntax.CommonJS.html), you can use the same value that you pass to 'require'.

You can also use relative paths to override modules based on where you are using steal-clone:

```js
clone({
	'./moduleB': ...
});
```

### Module Definitions

The values passed in the `moduleOverrides` object define the exports for that module. In the above example, `moduleB` has a single default export.

If `moduleB` is defined like:

```js
const name = 'moduleB';

export let getName = function() {
  return name;
};

export let getExcitedName = function() {
  return name + '!';
};
```

You can override both of the module's exports like this:

```js
clone({
  'moduleB': {
    getName: function() {
      return 'moduleBOverride';
    },
    getExcitedName: function() {
      return 'moduleBOverride!';
    }
  }
});
```

### Dynamically imported modules

It's possible to provide overrides to modules that will be later dynamically imported. If you have a `moduleC` defined as:

```js
import loader from '@loader';

loader.import('moduleB').then(function(){

});
```

You will be able to override the value of `moduleB`. Note that for this to work you must import [@loader] to use for dynamic loading instead of using `steal.import`. This is because `@loader` will refer to the cloned loader you created where as `steal.loader` always refers back to the global loader. Using [@loader] is always recommended anyways.

### Use with npm

Steal-clone can be used to override dependencies from [npm](http://stealjs.com/docs/npm.html) in the same way as any other module.
