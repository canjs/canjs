Node.js - vcsurl
================

Convert VCS repository URLs like Github or Bitbucket to their http equivalents.


Why?
----

Some of my apps take an input a Github repo URL; I wanted to easily get the http url to investigate the project. This will be used in `npm-research`.



Installation
------------

    npm install vcsurl



Example
------


```javascript
var vcsurl = require('vcsurl');

console.log(vcsurl('git@github.com:jprichardson/string.js.git')); //'https://github.com/jprichardson/string.js'
```

See tests for more details

License
-------

(MIT License)

Copyright 2012, JP Richardson  <jprichardson@gmail.com>


