@property {Object} System.babelOptions
@parent StealJS.config

Options that will be passed into Babel when compiling ES6 code. The options are the same described [here](https://babeljs.io/docs/usage/options/).

@body

## JSX

Babel comes with support for transpiling JSX but it is not enabled by default in Steal. To enable the JSX support you can simply pass an empty array for the blacklist like so:

```js
System.config({
  "babelOptions": {
    "blacklist": []
  }
});
```
