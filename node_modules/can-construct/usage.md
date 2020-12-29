## Usage

### ES6 use

With StealJS, you can import this module directly in a template that is autorendered:

```js
import plugin from "can-construct";
```

### CommonJS use

Use `require` to load `can-construct` and everything else
needed to create a template that uses `can-construct`:

```js
import plugin from "can-construct";
```

## AMD use

Configure the `can` and `jquery` paths and the `can-construct` package:

```html
<script src="require.js"></script>
<script>
	require.config({
	    paths: {
	        "jquery": "node_modules/jquery/dist/jquery",
	        "can": "node_modules/canjs/dist/amd/can"
	    },
	    packages: [{
		    	name: 'can-construct',
		    	location: 'node_modules/can-construct/dist/amd',
		    	main: 'lib/can-construct'
	    }]
	});
	require(["main-amd"], function(){});
</script>
```

### Standalone use

Load the `global` version of the plugin:

```html
<script src='./node_modules/can-construct/dist/global/can-construct.js'></script>
```
