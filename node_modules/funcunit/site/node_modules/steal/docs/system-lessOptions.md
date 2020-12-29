@property {Object} System.lessOptions
@parent StealJS.config

A hash of options to customize the behavior of the [less](http://lesscss.org/usage/index.html#command-line-usage-options) compiler.

@body

## Use

You can see the list of possible options in the less [docs page](http://lesscss.org/usage/index.html#command-line-usage-options). 

### strictMath

One of the available options is `strictMath`, which by default, the less compiler will process all maths in your css.

```
.foo {
    height: calc(100% - 10px);
}
```

If you want to change `strictMath` processing, you'd do the following:

```
System.config({
    main: "myapp",
    lessOptions: {
        strictMath: true  // default value is false.
    }
});
```

With this in place, less will only proccess maths that is inside un-necessary parenthesis.

```
.foo {
    height: calc(100% - (10px  - 5px));
}
```

will be compiled to:

```
.foo {
    height: calc(100% - 5px);
}
```

### paths

You can also provide `lessOptions.paths` (array) option which will be used to resolve imports (see less/css docs).

### plugins

You can also provide an array of plugins for the less compiler to use. Each entry should be the path to the plugin in your project.

If you want to use [`less-plugin-autoprefixer`](https://www.npmjs.com/package/less-plugin-autoprefix), you create a file that exports the configured plugin:

```
// src/steal/less/autoprefixer.js
const autoprefixPlugin = require('less-plugin-autoprefix'); 
const config = {
  browsers: ["last 2 versions"]
};
module.exports = new autoprefixPlugin(config);
```

Then add the path of the file to the `plugins` array:

```
System.config({
    main: "myapp",
    lessOptions: {
        plugins: ["myapp/steal/less/autoprefixer"]
    }
});
```

Now all LESS files will go through the autoprefixer plugin.

### filename

`lessOptions.filename` are used internally by StealJS and any value
provided will be ignored.
