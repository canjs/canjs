@page guides/advanced-setup Experimental ES Module Usage
@parent guides/getting-started 4
@outline 2

@description Use [ES modules](http://exploringjs.com/es6/ch_modules.html)' *named exports* feature to import just the APIs of CanJS that you are using.

@body

CanJS provides an ES module that contains [named exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#Using_named_exports) which can be imported and used to pluck out the parts that you need. When used in conjunction with [tree shaking](http://exploringjs.com/es6/ch_modules.html#_benefit-dead-code-elimination-during-bundling) you gain:

* Fewer packages to import in each of your modules.
* Bundles that exclude all of the parts of CanJS that you don't use.

To use, import the `can/es` module like so:

```js
import { Component, DefineMap } from "can/es";

const ViewModel = DefineMap.extend({
	message: "string"
});

Component.extend({
	tag: "my-component",
	ViewModel
});
```

If you are using [webpack](https://webpack.js.org/guides/tree-shaking/#src/components/Sidebar/Sidebar.jsx) tree-shaking is only available when in production mode. The following config shows a typical setup:

__webpack.config.js__

```js
const path = require('path');

module.exports = {
  entry: './index.js',
  mode: 'production',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname)
  }
};
```

## Names

The names that can be imported from this module mirror what is part of the `can` namespace object that you get from `import can from "can"`. You can see the names that `can/es` exports [here](https://github.com/canjs/canjs/blob/master/es.js).
