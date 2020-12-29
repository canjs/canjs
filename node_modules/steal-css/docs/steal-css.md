@module {{}} steal-css
@parent StealJS.ecosystem
@group steal-css.exports Exports
@group steal-css.other Other

@description

**steal-css** is a plugin for Steal that helps with loading CSS.

@option {steal-css.CSSModule} CSSModule The CSSModule property is a constructor function that facilitates most of what steal-css provides. End users never need to use this functionality, it is provided for plugin authors that seek to extend steal-css' core behavior.
@option {function} getDocument Retrieves the document of the page, or the server-side rendering document.

@body

## Use

Install steal-css with npm and save it as a development dependency:

```
> npm install steal-css --save-dev
```

In your package.json add steal-css as a plugin under your **steal** (or **system**) configuration:

```json
...

"steal": {
  "plugins": [
    "steal-css"
  ]
}
```

To load a CSS module in your JavaScript code, just import it just as you would any other module:

```js
import "./styles.css";
```
