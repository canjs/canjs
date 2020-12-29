@typedef {String} moduleName
@parent StealJS.types

@option {String}

A Loader-unique string that represents a module.

@body

The **moduleName** is a string that serves as the canonical name for a module. It is used as the key in the module registry.

In Steal, as with most module loaders, each module is only loaded (executed) *once* even if it is being imported by dozens of other modules. In order to provide importing modules with the correct exported values Steal has a module registry; an object where the moduleName is the key and the value is metadata about the module, as well as it's exported value.

When a module imports another, such as `require("./foo")` the string used to import is called a [moduleIdentifier]. This identifier is then [steal.hooks.normalize normalized] which produces the canonical **moduleName**.

## moduleName vs moduleIdentifier

It's important to understand the difference between a moduleName and [moduleIdentifier]. A moduleIdentifier is the string that is provided to the `import`, `require()`, (or any other format) statements. For example:

<table>
<thead>
<tr>
	<th>Module identifier</th><th>Module name</th>
</tr>
</thead>
<tbody>
<tr><td>./dep</td><td>app/util/dep</td></tr>
<tr><td>styles.css</td><td>styles.css!$css</td></tr>
<tr><td>lodash</td><td>lodash@3.0.0#main</td></tr>
</tbody>
</table>

These identifiers are always relative to the current module. For example the import:

```
import "./foo";
```

When the current module is `app/main` will normalize to `app/foo` and is located at [config.baseURL] + app/foo.js.

Similarly [npm] packages are also normalized relative to their parent. Consider this:

```
import _ from "lodash";
```

If the parent module, `app/main` has an npm dependency on the lodash package then this will normalize to `lodash@1.0.0#main` and the address will be something like `http://example.com/node_modules/lodash/main.js`.

However, if the parent module does *not* have an npm dependency on lodash then the moduleName will be `lodash` and the address something like `http://example.com/lodash.js`.

## npm module names

When importing modules installed with npm the moduleName normalizes to something like `lodash@1.0.0#main`. While strange looking this form has a purpose. Remember that each moduleName in the registry must be *unique*. npm packages, however, are not, and nested dependencies can use different versions of the same package. When this happens it's important that each module gets a [semver compatible](http://semver.org/) version of the package they need.

Here are the parts of an npm moduleName, using `lodash@1.0.0#main`:

### packageName

The first part is the **packageName**, `lodash`. It is the string that you provide when installing the package like `npm install lodash --save`.

### version

The second part, between the **@** and the **#** is the package **version**, in this case it is `1.0.0`. Steal ensures that you get a semver compatible version of a package.

Consider there are two dependencies in your project that both depend on the `foo` package. One of their package.jsons looks like:

```
{
  "dependencies": {
    "foo": "^1.0.0"
  }
}
```

And the other like:

```
{
  "dependencies": {
    "foo": "^1.1.0"
  }
}
```

Both of these packages depend on **foo**, however the second depends on a higher version, `^1.1.0`. The **^** symbol means that it depends on *at least* that version, and can accept anything up to (but not including) `2.0.0`.  See the [semver calculator](http://semver.npmjs.com/) to better understand the versioning rules.

Since both packages depend on foo and and 1.1.0 is semver compatible with `^1.0.0` then both will receive the same version of the package. `import "foo"` will resolve to a module name like:

```
foo@1.1.0#main
```

### modulePath

The last part of the npm moduleName is the **modulePath**. The modulePath is the part that comes after the **#** symbol. With the lodash example the modulePath is `main`. The modulePath is used to know where the module is located within the package. Here it will be at `http://example.com/node_modules/lodash/main.js`.

You can import paths within a package, not just the package's main. To do that you might import: `import each from "lodash/arrays/for_each"`. This module's moduleName would be `lodash@1.0.0#arrays/for_each` and it's address `http://example.com/node_modules/lodash/arrays/for_each.js`.
