## Usage

### ES6 use

With StealJS, you can import this module directly in a template that is autorendered:

```js
import plugin from "can-view-parser";
```

### CommonJS use

Use `require` to load `can-view-parser` and everything else
needed to create a template that uses `can-view-parser`:

```js
import plugin from "can-view-parser";
```

## AMD use

Configure the `can` and `jquery` paths and the `can-view-parser` package:

```html
<script src="require.js"></script>
<script>
	require.config({
	    paths: {
	        "jquery": "node_modules/jquery/dist/jquery",
	        "can": "node_modules/canjs/dist/amd/can"
	    },
	    packages: [{
		    	name: 'can-view-parser',
		    	location: 'node_modules/can-view-parser/dist/amd',
		    	main: 'lib/can-view-parser'
	    }]
	});
	require(["main-amd"], function(){});
</script>
```

### Standalone use

Load the `global` version of the plugin:

```html
<script src='./node_modules/can-view-parser/dist/global/can-view-parser.js'></script>
```
