[![Build Status](https://api.travis-ci.org/stealjs/steal-css.svg?branch=master)](https://travis-ci.org/stealjs/steal-css)
[![npm version](https://badge.fury.io/js/steal-css.svg)](http://badge.fury.io/js/steal-css)


# steal-css

- <code>[__steal-css__ Object](#steal-css-object)</code>
  - <code>[cssOptions Object](#cssoptions-object)</code>

## API

##  `{Object}`

 
**steal-css** is a plugin for Steal that helps with loading CSS.




### <code>Object</code>

- __CSSModule__ <code>{[CSSModule](#new-cssmoduleaddress-source)(address, source)}</code>:
  The CSSModule property is a constructor function that facilitates most of what steal-css provides. End users never need to use this functionality, it is provided for plugin authors that seek to extend steal-css' core behavior.
  
### cssOptions `{Object}`


Specifies configuration options that will be applied to [steal-css](#-object).



#### <code>Object</code>

- __timeout__ <code>{Integer}</code>:
  This specifies the time (in seconds) steal will try to load a css file, within a javascript module (e.g. `require('./mycssfile.css')`, in __production mode__.
  
  ```js
  steal.config({
      cssOptions: {
          timeout: 15
      }
  });
  ```
  
  If no `timeout` is provided, the default value will be `60` seconds.
  Note:
  
  No javascript code will be execute until the CSS file is loaded. If the timeout is reached or loading the file will fail, StealJS terminates execution. 
  The benefit of this behavior, you don't get unstyled content in __production mode__. For example, if you are using [steal-tools.guides.progressive_loading].
  
## License

MIT
