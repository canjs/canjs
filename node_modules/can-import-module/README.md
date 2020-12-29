# can-import-module

[![Build Status](https://travis-ci.org/canjs/can-import-module.svg?branch=master)](https://travis-ci.org/canjs/can-import-module)



## Usage

### ES6 use

With StealJS, you can import this module directly in a template that is autorendered:

```js
import plugin from 'can-import-module';
```

### CommonJS use

Use `require` to load `can-import-module` and everything else
needed to create a template that uses `can-import-module`:

```js
var plugin = require("can-import-module");
```

### Standalone use

Load the `global` version of the plugin:

```html
<script src='./node_modules/can-import-module/dist/global/can-importer.js'></script>
```
