@page guides/upgrade/using-codemods Using Codemods
@parent guides/upgrade 3
@description Learn how to migrate your app to CanJS 3 using [can-migrate](https://www.npmjs.com/package/can-migrate).

@body

## Overview

A codemod is a transformation script that parses the [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree)
of source code in order to do a code-aware find-and-replace refactor across
multiple files. [can-migrate](https://www.npmjs.com/package/can-migrate)
is a CLI utility for running codemods that can help migrate your app to CanJS 3.

For example, the following CanJS 3.0 code:

```js
import DefineMap from "can-define/map/map";
import route from "can-route";
import "can-stache/helpers/route";

const VM = DefineMap.extend({
    page: {
        value: "home"
    }
});

route.register(":page", { page: "home" });
route.ready();
```

…can be transformed to this:

```js
import DefineMap from "can-define/map/map";
import route from "can-route";
import "can-stache-route-helpers";

const VM = DefineMap.extend({
    page: {
        default: "home"
    }
});

route.register("{page}", { page: "home" });
route.start();
```
@highlight 3,7,11,12

Using this CLI will get you about 85% of the way to having your codebase
migrated; it’s not a complete solution for a seamless migration, but it will get
you significantly closer than doing the migration by hand.

> For information on using codemods to upgrade from CanJS 2.3 to CanJS 3.0, check out [https://v3.canjs.com/doc/guides/upgrade/using-codemods.html v3.canjs.com].

## Install

Install `can-migrate` from npm:

```shell
npm install -g can-migrate@2
```

This will make the `can-migrate` command available globally.

## Usage

The CLI provides the following options:

```
Usage
$ can-migrate [<file|glob> ...]

Updates files according to the CanJS 3.0 or CanJS 4.0 migration paths (minimal, modern, future)
More info for v3.0: http://canjs.github.io/canjs/doc/migrate-3.html#Modernizedmigrationpath
More info for v4.0: http://canjs.github.io/canjs/doc/migrate-4.html

Options
--apply     -a    Apply transforms (instead of a dry run)
--force           Apply transforms regardless of git status
--silent    -s    Silence output
--config    -c    Path to custom config file
--transform -t    Specify a transform
--can-version     Specify CanJS version to upgrade to
```

### Example

Runs all the `can-migrate` transforms for upgrading to CanJS 4.0 on the files that match the `**/*.js` glob:

```bash
can-migrate '**/*.js' --can-version 4 --apply
```

Runs the `can-stache/route-helpers` transform on the files that match the `**/*.js` glob:

```bash
can-migrate '**/*.js' --transform can-stache/route-helpers.js --apply
```

You can find a [complete list of version-4 transforms on GitHub](https://github.com/canjs/can-migrate/tree/master/src/transforms/version-4).

## List of CanJS 4 Transform Scripts

### can-define

To run [all of the version-4/can-define transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/version-4/can-define) listed below:

```bash
can-migrate '**/*.js' -t version-4/can-define/ -a
```

#### default

Running this transform:

```bash
can-migrate '**/*.js' -t version-4/can-define/default.js -a
```

…will transform the following:

```js
import DefineMap from "can-define/map/map";

const VM = DefineMap.extend({
	name: {
		value: "Justin"
	}
});
```
@highlight 5

…to this:

```js
import DefineMap from "can-define/map/map";

const VM = DefineMap.extend({
	name: {
		default: "Justin"
	}
});
```
@highlight 5

#### for-each

Running this transform:

```bash
can-migrate '**/*.js' -t version-4/can-define/for-each.js -a
```

…will transform code like this:

```js
import DefineMap from 'can-define/map/map';

const VM = DefineMap.extend({
    first: {
        default: 'Kevin'
    },
    last: {
        default: 'McCallister'
    },
    uppercaseAll: function() {
        this.each((value, prop) => {
            this[prop] = value.toUpperCase();
        });
    }
});
```
@highlight 11

…to this:

```js
import DefineMap from 'can-define/map/map';

const VM = DefineMap.extend({
    first: {
        default: 'Kevin'
    },
    last: {
        default: 'McCallister'
    },
    uppercaseAll: function() {
        this.forEach((value, prop) => {
            this[prop] = value.toUpperCase();
        });
    }
});
```
@highlight 11

### can-queues

To run [all of the version-4/can-queues transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/version-4/can-queues) listed below:

```bash
can-migrate '**/*.js' -t version-4/can-queues/ -a
```

#### batch

Running this transform:

```bash
can-migrate '**/*.js' -t version-4/can-queues/batch.js -a
```

…will transform the following:

```js
import canBatch from "can-event/batch/batch";

canBatch.start();
this.first = "Matthew";
this.last = "Phillips";
canBatch.stop();
```
@highlight 1,3,6

…to this:

```js
import queues from "can-queues";

queues.batch.start();
this.first = "Matthew";
this.last = "Phillips";
queues.batch.stop();
```
@highlight 1,3,6

### can-route

To run [all of the version-4/can-route transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/version-4/can-route) listed below:

```bash
can-migrate '**/*.js' -t version-4/can-route/ -a
```

#### template

Running this transform:

```bash
can-migrate '**/*.js' -t version-4/can-route/template.js -a
```

…will transform the following:

```js
can.route(":page", { page: "home" });
```

…to this:

```js
can.route("{page}", { page: "home" });
```

#### register

Running this transform:

```bash
can-migrate '**/*.js' -t version-4/can-route/register.js -a
```

…will transform the following:

```js
can.route("{page}", { page: "home" });
```

…to this:

```js
can.route.register("{page}", { page: "home" });
```

#### start

Running this transform:

```bash
can-migrate '**/*.js' -t version-4/can-route/start.js -a
```

…will transform the following:

```js
can.route.ready();
```

…to this:

```js
can.route.start();
```

### can-stache

To run [all of the version-4/can-stache transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/version-4/can-stache) listed below:

```bash
can-migrate '**/*.js' -t version-4/can-stache/ -a
```

#### attr-from

Running this transform:

```bash
can-migrate '**/*.js' -t version-4/can-stache/attr-from.js -a
```

…will transform the following:

```html
<input type="checkbox" checked>
<my-element
	prop3="something"
	on:click="setFoo()"
	prop4:from="foo"
	prop5:to="bar"
	prop5:bind="baz"
></my-element>
<a href="{{routeUrl page='away'}}">Away</a>
```
@highlight 3

…to this:

```html
<input type="checkbox" checked>
<my-element
	prop3:from='"something"'
	on:click="setFoo()"
	prop4:from="foo"
	prop5:to="bar"
	prop5:bind="baz"
></my-element>
<a href="{{routeUrl page='away'}}">Away</a>
```
@highlight 3

#### console-log

Running this transform:

```bash
can-migrate '**/*.js' -t version-4/can-stache/console-log.js -a
```

…will transform the following:

```html
{{log}}
```

…to this:

```html
{{console.log(this)}}
```

#### route-helpers

Running this transform:

```bash
can-migrate '**/*.js' -t version-4/can-stache/route-helpers.js -a
```

…will transform the following:

```js
const routeHelpers = require('can-stache/helpers/route');
```

…to this:

```js
const routeHelpers = require('can-stache-route-helpers');
```

...and this...

```html
<can-import from="can-stache/helpers/route" />
```

…to this:

```html
<can-import from="can-stache-route-helpers" />
```

#### scope

Running this transform:

```bash
can-migrate '**/*.js' -t version-4/can-stache/scope.js -a
```

…will transform the following:

```html
<p>
  {{%index}}
  {{%key}}
  {{%element}}
  {{%event}}
  {{%viewModel}}
  {{%arguments}}
</p>
```
@highlight 2-7

…to this:

```html
<p>
  {{scope.index}}
  {{scope.key}}
  {{scope.element}}
  {{scope.event}}
  {{scope.viewModel}}
  {{scope.arguments}}
</p>
```
@highlight 2-7
