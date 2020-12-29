# About [![Build Status](https://travis-ci.org/canjs/can-simple-dom.svg)](https://travis-ci.org/canjs/can-simple-dom)

Importantly, simple-dom implements a very, very small subset of the WHATWG DOM specification, optimized for performance, and for the requirements of the CanJS view layer. For example, it does not implement any part of the DOM that would require the use of accessors; it's just an attempt to faithfully represent the DOM as a data structure, not its complete API surface. (If you need the whole enchilada, check out something like [jsdom](https://github.com/tmpvar/jsdom), which is much more complete.)

```sh
npm install simple-dom
```

