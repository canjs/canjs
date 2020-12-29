Node.js - github-download
================

[![build status](https://secure.travis-ci.org/jprichardson/node-github-download.png)](http://travis-ci.org/jprichardson/node-github-download)

Easily download Github repos without any external dependencies such as Git, Tar, Unzip, etc.


Why?
----

I really like the concept of managing user defined projects, repos, file structures (package management) on Github like the way that [Component](https://github.com/component) does package management. I have a package management system [Rock](https://github.com/rocktemplates) that I use to create skeleton/templates of projects. I wanted Rock to use Github as a package management system. I also didn't want any dependencies amongst any 3rd party programs like Git, Tar, or Unzip. Pure Node.js JavaScript is what I wanted.


Installation
------------

    npm install github-download



Usage
-----

### ghdownload(params, dir)

Downloads the latest copy of some Github reference (branch, tag, or commit), or the `master` branch by default (specifically the `master` branch, it does _not_ honor Github's default branch configuration). This will still work even if the Github API limit has been reached.

- **params**: Can either be:
     - a Github URL string such as:
         - `https://github.com/jprichardson/node-vcsurl.git`
         - `git@github.com:jprichardson/node-vcsurl.git`
         - `git://github.com/jprichardson/node-vcsurl.git`
         - and even including a reference, e.g. `https://github.com/jprichardson/node-vcsurl.git#master`
     - or an object like so: `{user: 'jprichardson', repo: 'vcsurl', ref: 'master'}`
- **dir**: The output directory. Uses the current working directory if nothing is specified.

Returns a GithubDownloader object that emits events on `dir`, `file`, and `end`.

Example:

```javascript
var ghdownload = require('github-download')
  , exec = require('exec')

ghdownload({user: 'jprichardson', repo: 'node-batchflow', ref: 'master'}, process.cwd())
.on('dir', function(dir) {
  console.log(dir)
})
.on('file', function(file) {
  console.log(file)
})
.on('zip', function(zipUrl) { //only emitted if Github API limit is reached and the zip file is downloaded
  console.log(zipUrl)
})
.on('error', function(err) {
  console.error(err)
})
.on('end', function() {
  exec('tree', function(err, stdout, sderr) {
    console.log(stdout)
  })
})
```

Outputs:

    .
    ├── CHANGELOG.md
    ├── LICENSE
    ├── README.md
    ├── lib
    │   └── batchflow.js
    ├── package.json
    └── test
        ├── batchflow-par-array.test.js
        ├── batchflow-par-limit.test.js
        ├── batchflow-par-object.test.js
        ├── batchflow-seq-array.test.js
        ├── batchflow-seq-object.test.js
        ├── batchflow.test.js
        ├── mocha.opts
        └── resources

    3 directories, 12 files



License
-------

(MIT License)

Copyright 2013, JP Richardson  <jprichardson@gmail.com>


