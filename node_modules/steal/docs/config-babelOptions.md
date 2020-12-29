@typedef {Object} config.babelOptions babelOptions
@parent StealJS.config

Babel 6 is the default JavaScript compiler in StealJS.
Babel provides some options for transpiling JavaScript code.
Available options can be found [in Babel’s documentation](https://babeljs.io/docs/usage/options/).

@option {Array.<String>} presets An array of preset paths.

Steal uses the following babel [presets](https://babeljs.io/docs/plugins/#presets) by default:

- es2015-no-commonjs
- react
- stage-0

Additional presets can be added to your __package.json__ like:

```
"steal": {
    "babelOptions": {
		"presets": ["stage-3"]
	}
}
```

> Any presets defined in the __package.json__ will be used along the default ones.

Presets can be defined in several ways, including using their npm package name, or a relative
path to where the plugin function is defined. When relative paths are used, StealJS locates
them relative to where the __package.json__ file is found. Check the [Babel docs](https://babeljs.io/docs/plugins/#plugin-preset-paths) to learn more about the different ways to define presets paths.

@option {Array.<String>} plugins An array of plugin paths

StealJS uses the following babel plugin by default 

- transform-es2015-modules-systemjs

Additional plugins can be added to your __package.json__ like:

```
"steal": {
    "babelOptions": {
		"plugins": ["transform-decorators-legacy"]
	}
}
```

Same as presets, plugins can be defined in several ways and can be passed options,
please refer to the [Babel docs](https://babeljs.io/docs/plugins/#plugin-preset-options)
to get familiar with the syntax.

> StealJS uses [babel-standalone](https://github.com/babel/babel-standalone) internally, 
any plugin or preset builtin in babel-standalone will work after being declared in the `babelOptions` object; 
non-buitin plugins and presets need to be installed through npm first.

@option {Object} env An object with plugins and presets to be used in certain environments

```
"steal": {
    "babelOptions": {
		"env": {
			"test": {
				"plugins": ["transform-decorators-legacy"]
			}	
		}
	}
}
```

StealJS will collect the plugins/presets defined in the [babel env option](https://babeljs.io/docs/usage/babelrc/#env-option)
and will use them in the specified environment. StealJS checks the same environment variables used by babel, and if 
none of those variables are avaiable it will default to the [Steal env value](config.env).

@body

## JSX

JSX is supported by default with the Babel 6 compiler, so you can use it directly in your code:

```js
var hw = <div>Hello <strong>world!</strong></div>;
```

If you would like to import a `.jsx` template to your app like this:
```
import renderer from "my-jsx-template.jsx";
```

…have a look at the [steal-react-jsx](https://www.npmjs.com/package/steal-react-jsx) plugin.

## Generators

In order to use [Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator), you must include the [Babel polyfill](http://babeljs.io/docs/usage/polyfill/) 

First install the package and save it to your __package.json__ with:

> npm install --save-dev babel-polyfill

Then, to configure StealJS to load the correct package, add the following to your
__package.json__:

```
"steal": {
	...
	"map": {
		"babel-polyfill": "babel-polyfill/dist/polyfill"
    },
    "meta": {
		"babel-polyfill/dist/polyfill": {
			"format": "cjs"
		}
	}
}
```

That's it! Check a working example in [the steal-generators-example repository](https://github.com/stealjs/steal-generators-example).
