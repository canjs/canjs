0.3.0 / 2014-06-17
------------------
* downloads to a temp dir in `cwd()` instead of `/tmp` [#4](https://github.com/jprichardson/node-github-download/pull/4)
* upgraded `"fs-extra": "~0.6.0"` to `"fs-extra": "^0.9.1"`
* drop support for Node.js `v0.8`

0.2.0 / 2013-04-29
------------------
* updated `fs-extra` dep
* Node `v0.10` compatibility
* fixed inheritance bug
* add travis-ci

0.1.1 / 2013-02-03
------------------
* Updated `fs-extra` dep.

0.1.0 / 2013-01-21
------------------
* Updated dependencies to include `adm-zip` and `fs-extra`.
* If Github API limit is hit (it's pretty low), then it'll download the zip file and extract the contents.

0.0.1 / 2013-01-17
------------------
* Initial release.
