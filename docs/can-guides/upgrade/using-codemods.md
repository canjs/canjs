@page guides/upgrade/using-codemods Using Codemods
@parent guides/upgrade 1
@description Learn how to migrate your app to CanJS 3 using [can-migrate](https://www.npmjs.com/package/can-migrate).

@body

## Overview

A codemod is a transformation script that parses the [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree)
of source code in order to do a code-aware find-and-replace refactor across
multiple files. [can-migrate](https://www.npmjs.com/package/can-migrate)
is a CLI utility for running codemods that can help migrate your app to CanJS 3.

For example, the following CanJS 2.3 code:

```js
import can from "can";
import "can/map/define/define";

export default can.Map.extend({
  define: {}
});
```

…can be transformed to this:

```js
import CanMap from "can-map";
import can from "can";
import "can-map-define";

export default CanMap.extend({
  define: {}
});
```
@highlight 1,3,5

Using this CLI will get you about 85% of the way to having your codebase
migrated; it’s not a complete solution for a seamless migration, but it will get
you significantly closer than doing the migration by hand.

## Install

Install `can-migrate` from npm:

```shell
npm install -g can-migrate
```

This will make the `can-migrate` command available globally.

## Usage

The CLI provides the following options:

```
can-migrate [<files> OPTIONS...]

Updates files according to the CanJS 3 migration paths (minimal, modern, latest & greatest)

Options
--apply     -a    Apply transforms (instead of a dry run)
--force           Apply transforms regardless of git status
--silent    -s    Silence output
--config    -c    Path to custom config file
--transform -t    Specify a transform
```

### Example

Runs all the default `can-migrate` transforms on the files that match the `**/*.js` glob:

```bash
can-migrate --apply **/*.js
```

Runs the `can-component-rename` transform on the files that match the `**/*.js` glob:

```bash
can-migrate --apply **/*.js --transform can-component-rename/can-component-rename.js
```

You can find a [complete list of transforms on GitHub](https://github.com/canjs/can-migrate/tree/master/src/transforms).

## Recommended Migration Process

Use the following steps as a guide for using this tool:

1. Make a new branch for the migration:
    ```shell
    git checkout -b migration
    ```
2. Ensure all tests are passing and your git state is clean.
  As with any migration, if your code is not tested, the amount of time it takes for a successful migration is exponentially greater.
3. Run the transforms on each [modlet](https://www.bitovi.com/blog/modlet-workflows) or standalone testable component:
    ```bash
    can-migrate [<modlet/*.js>] --apply
    ```
    Alternatively, you can run one transform at a time for a more incremental approach:
    ```bash
    can-migrate [<modlet/*.js>] --transforms <transform path> --apply
    ```
4. Install the [api#ThecanPackage can-* modules] used in that modlet or component. Here are the modules in the [can-core] collection:
    ```shell
    npm i can-component --save
    npm i can-compute --save
    npm i can-connect --save
    npm i can-define --save
    npm i can-route --save
    npm i can-route-pushstate --save
    npm i can-set --save
    npm i can-stache --save
    npm i can-stache-bindings --save
    ```

5. Run the tests again and fix the bugs as they come up.
  Review [migrate-3] to understand what changes to expect
6. Commit the module once all tests are passing again.
7. Repeat 2-6 until all modlet or components are migrated and tests are passing.

**Note:** If you are using [StealJS](https://stealjs.com/), ensure you are running StealJS 0.16 or greater.

## Introduction to the Transform Scripts

Read this section to understand how the transforms (also called codemods) are organized,
the different types of transformations that are included with `can-migrate`,
and what to expect from each one.

There are 3 main types of transforms included in the `can-migrate` tool:
replace, import, and require. There are also three module-specific transforms
that handle more complex transformations: `can-component-rename`, `can-data`,
and `can-extend`.

Each can-module that has a transform script has a folder in the
[src/transforms directory](https://github.com/canjs/can-migrate/tree/master/src/transforms).
Most of these folders have the following structure:

`can-moduleName/`
- `import.js`
- `replace.js`
- `require.js`

You can run a specific transform by passing `can-moduleName/replace.js` or you can pass the entire `can-moduleName/` directory to the CLI tool with the `--transform` flag.

Run all the transforms in the directory:

```bash
can-migrate */*.js --apply --transform can-moduleName/
```

Run a specific transform script:

```bash
can-migrate */*.js --apply --transform can-moduleName/replace.js
```

### “Import” Transforms

These transforms change the way a module is imported if it using the `import` syntax.

For example, it will transform any of the following:

```js
import Component from "can/component/";
import Component from "can/component/component";
import Component from "can/component/component.js";
```

…to this:

```js
import Component from "can-component";
```
@highlight 1

### “Replace” Transforms

These transforms replace how a module is imported and used, which may vary by
module. You can learn how each module is transformed by a particular script in
the specific transformation section below.

For example, it can transform code like this:

```js
import can from "can";
can.addClass(el, "myClass");
```

…to this:

```js
import className from "can-util/dom/class-name/class-name";
import can from "can";
className.addClass.call(el, "myClass");
```
@highlight 1,3

### “Require” Transforms

These transforms handle the cases where a module is loaded using `require`.

For example, it will transform any of the following:

```js
import Component from 'can/component/';
import Component from 'can/component/component';
import Component from 'can/component/component.js';
```

…to this:

```js
import Component from 'can-component';
```
@highlight 1

### Custom Transforms

While the replace, import, and require transforms handle most cases, there are
some more specific scripts for `can-component-rename`, `can-data`, `can-extend`.
Read about them in the section below.

## Complete List of Transform Scripts

This section details all the transformation scripts with examples of before and after.

### can-stache-bindings/colon-bindings

Running [the colon-bindings transform](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-stache-bindings):

```bash
can-migrate -a src/**/*.{js,md,html,stache,component} -t can-stache-bindings/colon-bindings
```

…will transform this:

```html
<input {^$value}="H1" {$value}="H2" {($value)}="H3" ($value)="H4"
  {^value}="H1" {value}="H2" {(value)}="H3" (value)="H4">
```

…to this:

```html
<input el:value:to="H1" el:value:from="H2" el:value:bind="H3" on:el:value="H4"
  vm:value:to="H1" vm:value:from="H2" vm:value:bind="H3" on:vm:value="H4">
```

…or this:

```js
Component.extend({
  tag: 'my-tag',
  template: stache(
    '<input {^$value}="H1" {$value}="H2" {($value)}="H3" ($value)="H4" ' +
		'{^value}="H1" {value}="H2" {(value)}="H3" (value)="H4">'
  )
});
```

…to this:

```js
Component.extend({
  tag: 'my-tag',
  template: stache(
    '<input el:value:to="H1" el:value:from="H2" el:value:bind="H3" on:el:value="H4" ' +
		'vm:value:to="H1" vm:value:from="H2" vm:value:bind="H3" on:vm:value="H4">'
  )
});
```
@highlight 4,5

It will also transform stache bindings inside:

* ```` ```html ```` and ```` ```js ```` blocks in `.md` files
* `<view>`, `<template>`, `<view-model>`, and `<script type="view-model">` blocks in `.component` files
* `<script type="text/stache">` and `<script src="...steal/steal.js">` blocks in `.html` files

With the `--implicit` flag, the transform will intuitively determine whether to bind to the ViewModel or Element without the explicit `vm:` or `el:` specifiers. For example, running this:

```bash
can-migrate -a src/**/*.{js,md,html,stache,component} -t can-stache-bindings/colon-bindings --implicit
```

…will transform this:

```html
<input {^$value}="H1" {$value}="H2" {($value)}="H3" ($value)="H4"
  {^value}="H1" {value}="H2" {(value)}="H3" (value)="H4">
```

…to this:

```html
<input value:to="H1" value:from="H2" value:bind="H3" on:value="H4"
  value:to="H1" value:from="H2" value:bind="H3" on:value="H4">
```
@highlight 1,2

### can-component-rename

Running [all of the can-component-rename transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-component-rename):

```bash
can-migrate -a **/*.js -t can-component-rename/
```

…will transform this:

```js
Component.extend({
  tag: "my-tag",
  template: "Hi",
  events: {
    removed: function(){}
  }
});
```
@highlight 3,5

…to this:

```js
Component.extend({
  tag: "my-tag",
  view: "Hi",
  events: {
    "{element} beforeremove": function(){}
  }
});
```
@highlight 3,5

…or this:

```js
can.Component.extend({
  tag: "my-tag",
  template: "Hi",
  events: {
    removed(){}
  }
});
```
@highlight 3,5

…to this:

```js
can.Component.extend({
  tag: "my-tag",
  view: "Hi",
  events: {
    "{element} beforeremove"(){}
  }
});
```
@highlight 3,5

…or this:

```js
Component.extend({
  tag: "my-tag",
  events: {
    "removed": () => {}
  }
});
```
@highlight 4

…to this:

```js
Component.extend({
  tag: "my-tag",
  events: {
    "{element} beforeremove": () => {}
  }
});
```
@highlight 4

### can-data

Running [all of the can-data transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-data):

```bash
can-migrate -a **/*.js -t can-data/
```

…will transform this:

```js
import can from "can";

can.data(el, "name", "Luke");
can.data(el, "name");
```
@highlight 3,4

…to this:

```js
import domData from "can-util/dom/data/data";
import can from "can";

domData.set.call(el, "name", "Luke");
domData.get.call(el, "name");
```
@highlight 1,4,5

…or this:

```js
import can from 'can';

can.data(el, "name", "Luke");
can.data(el, "name");
```
@highlight 3,4

…to this:

```js
import domData from 'can-util/dom/data/data';
import can from 'can';

domData.set.call(el, "name", "Luke");
domData.get.call(el, "name");
```
@highlight 1,4,5

### can-extend

Running [all of the can-extend transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-extend):

```bash
can-migrate -a **/*.js -t can-extend/
```

…will transform this:

```js
import can from "can";

can.extend(true, {}, {}, {}, {});
can.extend(false, {}, {});
can.extend({}, {});
```
@highlight 3-5

…to this:

```js
import deepAssign from "can-util/js/deep-assign/deep-assign";
import assign from "can-util/js/assign/assign";
import can from "can";

deepAssign({}, {}, {}, {});
assign({}, {});
assign({}, {});
```
@highlight 1,2,5,6,7

…or this:

```js
import can from 'can';

can.extend(true, {}, {}, {}, {});
can.extend(false, {}, {});
can.extend({}, {});
```
@highlight 3-5

…to this:

```js
import deepAssign from 'can-util/js/deep-assign/deep-assign';
import assign from 'can-util/js/assign/assign';
import can from 'can';

deepAssign({}, {}, {}, {});
assign({}, {});
assign({}, {});
```
@highlight 1,2,5,6,7

### can-addClass

To run [all of the can-addClass transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-addClass) listed below:

```bash
can-migrate -a **/*.js -t can-addClass/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-addClass/replace.js
```

…will transform code like this:

```js
import can from "can";
can.addClass(el, "myClass");
```
@highlight 2

…to this:

```js
import className from "can-util/dom/class-name/class-name";
import can from "can";
className.addClass.call(el, "myClass");
```
@highlight 1,3


### can-addEvent

To run [all of the can-addEvent transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-addEvent) listed below:

```bash
can-migrate -a **/*.js -t can-addEvent/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-addEvent/replace.js
```

…will transform code like this:

```js
import can from "can";
can.addEvent.call(obj, "change", function() { alert("object change!"); });
```
@highlight 2

…to this:

```js
import canEvent from "can-event";
import can from "can";
canEvent.addEventListener.call(obj, "change", function() { alert("object change!"); });
```
@highlight 1,3


### can-ajax

To run [all of the can-ajax transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-ajax) listed below:

```bash
can-migrate -a **/*.js -t can-ajax/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-ajax/replace.js
```

…will transform code like this:

```js
import can from "can";
can.ajax();
```
@highlight 2

…to this:

```js
import ajax from "can-ajax";
import can from "can";
ajax();
```
@highlight 1,3


### can-append

To run [all of the can-append transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-append) listed below:

```bash
can-migrate -a **/*.js -t can-append/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-append/replace.js
```

…will transform code like this:

```js
import can from "can";
can.append(el, "<p></p>");
```
@highlight 2

…to this:

```js
import mutate from "can-util/dom/mutate/mutate";
import can from "can";
mutate.appendChild.call(el, "<p></p>");
```
@highlight 1,3


### can-batch

To run [all of the can-batch transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-batch) listed below:

```bash
can-migrate -a **/*.js -t can-batch/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-batch/replace.js
```

…will transform code like this:

```js
import can from "can";
can.batch.start();
```
@highlight 2

…to this:

```js
import canBatch from "can-batch";
import can from "can";
canBatch.start();
```
@highlight 1,3


### can-buildFragment

To run [all of the can-buildFragment transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-buildFragment) listed below:

```bash
can-migrate -a **/*.js -t can-buildFragment/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-buildFragment/replace.js
```

…will transform code like this:

```js
import can from "can";
can.buildFragment("<div><input/></div>");
```
@highlight 2

…to this:

```js
import buildFragment from "can-util/dom/fragment/fragment";
import can from "can";
buildFragment("<div><input/></div>");
```
@highlight 1,3


### can-camelize

To run [all of the can-camelize transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-camelize) listed below:

```bash
can-migrate -a **/*.js -t can-camelize/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-camelize/replace.js
```

…will transform code like this:

```js
import can from "can";
can.camelize("str");
```
@highlight 2

…to this:

```js
import string from "can-util/js/string/string";
import can from "can";
string.camelize("str");
```
@highlight 1,3


### can-capitilize

To run [all of the can-capitilize transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-capitilize) listed below:

```bash
can-migrate -a **/*.js -t can-capitilize/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-capitilize/replace.js
```

…will transform code like this:

```js
import can from "can";
can.capitalize("str");
```
@highlight 2

…to this:

```js
import string from "can-util/js/string/string";
import can from "can";
string.capitalize("str");
```
@highlight 1,3


### can-component

To run [all of the can-component transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-component) listed below:

```bash
can-migrate -a **/*.js -t can-component/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-component/import.js
```

…will transform any of the following:

```js
import Component from "can/component/";
import Component from "can/component/component";
import Component from "can/component/component.js";
```

…to this:

```js
import Component from "can-component";
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-component/replace.js
```

…will transform code like this:

```js
import can from "can";
can.Component.extend();
```
@highlight 2

…to this:

```js
import Component from "can-component";
import can from "can";
Component.extend();
```
@highlight 1,3

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-component/require.js
```

…will transform any of the following:

```js
import Component from 'can/component/';
import Component from 'can/component/component';
import Component from 'can/component/component.js';
```

…to this:

```js
import Component from 'can-component';
```

### can-compute

To run [all of the can-compute transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-compute) listed below:

```bash
can-migrate -a **/*.js -t can-compute/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-compute/import.js
```

…will transform any of the following:

```js
import compute from "can/compute/";
import compute from "can/compute/compute";
import compute from "can/compute/compute.js";
```

…to this:

```js
import compute from "can-compute";
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-compute/replace.js
```

…will transform code like this:

```js
import can from "can";
can.compute();
```
@highlight 2

…to this:

```js
import compute from "can-compute";
import can from "can";
compute();
```
@highlight 1,3

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-compute/require.js
```

…will transform any of the following:

```js
import compute from 'can/compute/';
import compute from 'can/compute/compute';
import compute from 'can/compute/compute.js';
```

…to this:

```js
import compute from 'can-compute';
```

### can-construct-super

To run [all of the can-construct-super transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-construct-super) listed below:

```bash
can-migrate -a **/*.js -t can-construct-super/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-construct-super/import.js
```

…will transform any of the following:

```js
import constructSuper from "can/construct/super/";
import constructSuper from "can/construct/super/super";
import constructSuper from "can/construct/super/super.js";
```

…to this:

```js
import constructSuper from "can-construct-super";
```

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-construct-super/require.js
```

…will transform any of the following:

```js
import constructSuper from 'can/construct/super/';
import constructSuper from 'can/construct/super/super';
import constructSuper from 'can/construct/super/super.js';
```

…to this:

```js
import constructSuper from 'can-construct-super';
```

### can-construct

To run [all of the can-construct transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-construct) listed below:

```bash
can-migrate -a **/*.js -t can-construct/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-construct/import.js
```

…will transform any of the following:

```js
import construct from "can/construct/";
import construct from "can/construct/construct";
import construct from "can/construct/construct.js";
```

…to this:

```js
import Construct from "can-construct";
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-construct/replace.js
```

…will transform code like this:

```js
import can from "can";
can.Construct.extend();
```
@highlight 2

…to this:

```js
import Construct from "can-construct";
import can from "can";
Construct.extend();
```
@highlight 1,3

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-construct/require.js
```

…will transform any of the following:

```js
import construct from 'can/construct/';
import construct from 'can/construct/construct';
import construct from 'can/construct/construct.js';
```

…to this:

```js
import Construct from 'can-construct';
```

### can-control

To run [all of the can-control transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-control) listed below:

```bash
can-migrate -a **/*.js -t can-control/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-control/import.js
```

…will transform any of the following:

```js
import Control from "can/control/";
import Control from "can/control/control";
import Control from "can/control/control.js";
```

…to this:

```js
import Control from "can-control";
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-control/replace.js
```

…will transform code like this:

```js
import can from "can";
can.Control( staticProperties, instanceProperties );
```
@highlight 2

…to this:

```js
import Control from "can-control";
import can from "can";
Control( staticProperties, instanceProperties );
```
@highlight 1,3

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-control/require.js
```

…will transform any of the following:

```js
import Control from 'can/control/';
import Control from 'can/control/control';
import Control from 'can/control/control.js';
```

…to this:

```js
import Control from 'can-control';
```

### can-deparam

To run [all of the can-deparam transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-deparam) listed below:

```bash
can-migrate -a **/*.js -t can-deparam/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-deparam/replace.js
```

…will transform code like this:

```js
import can from "can";
can.deparam("#foo[]=bar&foo[]=baz");
```
@highlight 2

…to this:

```js
import deparam from "can-deparam";
import can from "can";
deparam("#foo[]=bar&foo[]=baz");
```
@highlight 1,3


### can-dispatch

To run [all of the can-dispatch transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-dispatch) listed below:

```bash
can-migrate -a **/*.js -t can-dispatch/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-dispatch/replace.js
```

…will transform code like this:

```js
import can from "can";
can.dispatch( obj, event, args );
```
@highlight 2

…to this:

```js
import canEvent from "can-event";
import can from "can";
canEvent( obj, event, args );
```
@highlight 1,3


### can-each

To run [all of the can-each transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-each) listed below:

```bash
can-migrate -a **/*.js -t can-each/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-each/replace.js
```

…will transform code like this:

```js
import can from "can";
can.each();
```
@highlight 2

…to this:

```js
import each from "can-each";
import can from "can";
each();
```
@highlight 1,3


### can-esc

To run [all of the can-esc transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-esc) listed below:

```bash
can-migrate -a **/*.js -t can-esc/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-esc/replace.js
```

…will transform code like this:

```js
import can from "can";
can.esc("<div>&nbsp</div>");
```
@highlight 2

…to this:

```js
import string from "can-util/js/string/string";
import can from "can";
string.esc("<div>&nbsp</div>");
```
@highlight 1,3


### can-event

To run [all of the can-event transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-event) listed below:

```bash
can-migrate -a **/*.js -t can-event/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-event/import.js
```

…will transform any of the following:

```js
import event from "can/event/";
import event from "can/event/event";
import event from "can/event/event.js";
```

…to this:

```js
import canEvent from "can-event";
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-event/replace.js
```

…will transform code like this:

```js
import can from "can";
can.event.dispatch.call(obj, "change");
```
@highlight 2

…to this:

```js
import canEvent from "can-event";
import can from "can";
canEvent.dispatch.call(obj, "change");
```
@highlight 1,3

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-event/require.js
```

…will transform any of the following:

```js
import event from 'can/event/';
import event from 'can/event/event';
import event from 'can/event/event.js';
```

…to this:

```js
import canEvent from 'can-event';
```

### can-fixture

To run [all of the can-fixture transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-fixture) listed below:

```bash
can-migrate -a **/*.js -t can-fixture/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-fixture/import.js
```

…will transform any of the following:

```js
import fixture from "can/util/fixture/";
import fixture from "can/util/fixture/fixture";
import fixture from "can/util/fixture/fixture.js";
```

…to this:

```js
import fixture from "can-fixture";
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-fixture/replace.js
```

…will transform code like this:

```js
import can from "can";
can.fixture( "/foobar.json", function(){});
```
@highlight 2

…to this:

```js
import fixture from "can-fixture";
import can from "can";
fixture( "/foobar.json", function(){});
```
@highlight 1,3

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-fixture/require.js
```

…will transform any of the following:

```js
import fixture from 'can/util/fixture/';
import fixture from 'can/util/fixture/fixture';
import fixture from 'can/util/fixture/fixture.js';
```

…to this:

```js
import fixture from 'can-fixture';
```

### can-frag

To run [all of the can-frag transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-frag) listed below:

```bash
can-migrate -a **/*.js -t can-frag/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-frag/replace.js
```

…will transform code like this:

```js
import can from "can";
can.frag();
```
@highlight 2

…to this:

```js
import frag from "can-frag";
import can from "can";
frag();
```
@highlight 1,3


### can-getObject

To run [all of the can-getObject transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-getObject) listed below:

```bash
can-migrate -a **/*.js -t can-getObject/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-getObject/replace.js
```

…will transform code like this:

```js
import can from "can";
can.getObject(name, roots);
```
@highlight 2

…to this:

```js
import string from "can-util/js/string/string";
import can from "can";
string.getObject(name, roots);
```
@highlight 1,3


### can-hyphenate

To run [all of the can-hyphenate transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-hyphenate) listed below:

```bash
can-migrate -a **/*.js -t can-hyphenate/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-hyphenate/replace.js
```

…will transform code like this:

```js
import can from "can";
can.hyphenate("str");
```
@highlight 2

…to this:

```js
import string from "can-util/js/string/string";
import can from "can";
string.hyphenate("str");
```
@highlight 1,3


### can-isArray

To run [all of the can-isArray transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-isArray) listed below:

```bash
can-migrate -a **/*.js -t can-isArray/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-isArray/replace.js
```

…will transform code like this:

```js
import can from "can";
can.isArray([1,2,3]);
```
@highlight 2

…to this:

```js
import isArrayLike from "can-util/js/is-array-like/is-array-like";
import can from "can";
isArrayLike([1,2,3]);
```
@highlight 1,3


### can-isDeferred

To run [all of the can-isDeferred transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-isDeferred) listed below:

```bash
can-migrate -a **/*.js -t can-isDeferred/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-isDeferred/replace.js
```

…will transform code like this:

```js
import can from "can";
can.isDeferred(obj);
```
@highlight 2

…to this:

```js
import isPromiseLike from "can-util/js/is-promise-like/is-promise-like";
import can from "can";
isPromiseLike(obj);
```
@highlight 1,3


### can-isEmptyObject

To run [all of the can-isEmptyObject transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-isEmptyObject) listed below:

```bash
can-migrate -a **/*.js -t can-isEmptyObject/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-isEmptyObject/replace.js
```

…will transform code like this:

```js
import can from "can";
can.isEmptyObject(obj);
```
@highlight 2

…to this:

```js
import isEmptyObject from "can-util/js/is-empty-object/is-empty-object";
import can from "can";
isEmptyObject(obj);
```
@highlight 1,3


### can-isFunction

To run [all of the can-isFunction transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-isFunction) listed below:

```bash
can-migrate -a **/*.js -t can-isFunction/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-isFunction/replace.js
```

…will transform code like this:

```js
import can from "can";
can.isFunction(func);
```
@highlight 2

…to this:

```js
import isFunction from "can-util/js/is-function/is-function";
import can from "can";
isFunction(func);
```
@highlight 1,3


### can-list

To run [all of the can-list transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-list) listed below:

```bash
can-migrate -a **/*.js -t can-list/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-list/import.js
```

…will transform any of the following:

```js
import List from "can/list/";
import List from "can/list/list";
import List from "can/list/list.js";
```

…to this:

```js
import CanList from "can-list";
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-list/replace.js
```

…will transform code like this:

```js
import can from "can";
var people = new can.List(["Alex", "Bill"]);
```
@highlight 2

…to this:

```js
import CanList from "can-list";
import can from "can";
var people = new CanList(["Alex", "Bill"]);
```
@highlight 1,3

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-list/require.js
```

…will transform any of the following:

```js
import List from 'can/list/';
import List from 'can/list/list';
import List from 'can/list/list.js';
```

…to this:

```js
import CanList from 'can-list';
```

### can-listenTo

To run [all of the can-listenTo transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-listenTo) listed below:

```bash
can-migrate -a **/*.js -t can-listenTo/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-listenTo/replace.js
```

…will transform code like this:

```js
import can from "can";
can.listenTo.call(obj, other, event, handler);
```
@highlight 2

…to this:

```js
import canEvent from "can-event";
import can from "can";
canEvent.call(obj, other, event, handler);
```
@highlight 1,3,5


### can-makeArray

To run [all of the can-makeArray transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-makeArray) listed below:

```bash
can-migrate -a **/*.js -t can-makeArray/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-makeArray/replace.js
```

…will transform code like this:

```js
import can from "can";
can.makeArray({0: "a", length: 1});
```
@highlight 2

…to this:

```js
import makeArray from "can-util/js/make-array/make-array";
import can from "can";
makeArray({0: "a", length: 1});
```
@highlight 1,3


### can-map-backup

To run [all of the can-map-backup transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-map-backup) listed below:

```bash
can-migrate -a **/*.js -t can-map-backup/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-map-backup/import.js
```

…will transform any of the following:

```js
import mapBackup from "can/map/backup/";
import mapBackup from "can/map/backup/backup";
import mapBackup from "can/map/backup/backup.js";
```

…to this:

```js
import mapBackup from "can-map-backup";
```

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-map-backup/require.js
```

…will transform any of the following:

```js
import mapBackup from 'can/map/backup/';
import mapBackup from 'can/map/backup/backup';
import mapBackup from 'can/map/backup/backup.js';
```

…to this:

```js
import mapBackup from 'can-map-backup';
```

### can-map-define

To run [all of the can-map-define transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-map-define) listed below:

```bash
can-migrate -a **/*.js -t can-map-define/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-map-define/import.js
```

…will transform any of the following:

```js
import mapDefine from "can/map/define/";
import mapDefine from "can/map/define/define";
import mapDefine from "can/map/define/define.js";
```

…to this:

```js
import mapDefine from "can-map-define";
```

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-map-define/require.js
```

…will transform any of the following:

```js
import mapDefine from 'can/map/define/';
import mapDefine from 'can/map/define/define';
import mapDefine from 'can/map/define/define.js';
```

…to this:

```js
import mapDefine from 'can-map-define';
```

### can-map

To run [all of the can-map transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-map) listed below:

```bash
can-migrate -a **/*.js -t can-map/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-map/import.js
```

…will transform any of the following:

```js
import map from "can/map/";
import map from "can/map/map";
import map from "can/map/map.js";
```

…to this:

```js
import CanMap from "can-map";
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-map/replace.js
```

…will transform code like this:

```js
import can from "can";
const map = new can.Map(aName);
```
@highlight 2

…to this:

```js
import CanMap from "can-map";
import can from "can";
const map = new CanMap(aName);
```
@highlight 1,3

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-map/require.js
```

…will transform any of the following:

```js
import map from 'can/map/';
import map from 'can/map/map';
import map from 'can/map/map.js';
```

…to this:

```js
import CanMap from 'can-map';
```

### can-model

To run [all of the can-model transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-model) listed below:

```bash
can-migrate -a **/*.js -t can-model/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-model/import.js
```

…will transform any of the following:

```js
import model from "can/model/";
import model from "can/model/model";
import model from "can/model/model.js";
```

…to this:

```js
import Model from "can-model";
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-model/replace.js
```

…will transform code like this:

```js
import can from "can";
can.Model(name, staticProperties, instanceProperties);
```
@highlight 2

…to this:

```js
import Model from "can-model";
import can from "can";
Model(name, staticProperties, instanceProperties);
```
@highlight 1,3

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-model/require.js
```

…will transform any of the following:

```js
import model from 'can/model/';
import model from 'can/model/model';
import model from 'can/model/model.js';
```

…to this:

```js
import Model from 'can-model';
```

### can-mustache

To run [all of the can-mustache transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-mustache) listed below:

```bash
can-migrate -a **/*.js -t can-mustache/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-mustache/replace.js
```

…will transform code like this:

```js
import can from "can";
can.mustache( id, template );
```
@highlight 2

…to this:

```js
import mustache from "can-mustache";
import can from "can";
mustache( id, template );
```
@highlight 1,3


### can-one

To run [all of the can-one transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-one) listed below:

```bash
can-migrate -a **/*.js -t can-one/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-one/replace.js
```

…will transform code like this:

```js
import can from "can";
can.event.dispatch.call(obj, "change");
```
@highlight 2

…to this:

```js
import canEvent from "can-event";
import can from "can";
canEvent.dispatch.call(obj, "change");
```
@highlight 1,3


### can-param

To run [all of the can-param transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-param) listed below:

```bash
can-migrate -a **/*.js -t can-param/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-param/replace.js
```

…will transform code like this:

```js
import can from "can";
can.param({foo: "bar"});
```
@highlight 2

…to this:

```js
import param from "can-param";
import can from "can";
param({foo: "bar"});
```
@highlight 1,3


### can-remove

To run [all of the can-remove transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-remove) listed below:

```bash
can-migrate -a **/*.js -t can-remove/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-remove/replace.js
```

…will transform code like this:

```js
import can from "can";
can.remove.call(el, child);
```
@highlight 2

…to this:

```js
import mutate from "can-util/dom/mutate/mutate";
import can from "can";
mutate.removeChild.call.call(el, child);
```
@highlight 1,3


### can-removeEvent

To run [all of the can-removeEvent transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-removeEvent) listed below:

```bash
can-migrate -a **/*.js -t can-removeEvent/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-removeEvent/replace.js
```

…will transform code like this:

```js
import can from "can";
can.event.removeEvent.call(el, "click", function() {});
```
@highlight 2

…to this:

```js
import canEvent from "can-event";
import can from "can";
canEvent.removeEvent.call(el, "click", function() {});
```
@highlight 1,3


### can-route-pushstate

To run [all of the can-route-pushstate transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-route-pushstate) listed below:

```bash
can-migrate -a **/*.js -t can-route-pushstate/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-route-pushstate/import.js
```

…will transform any of the following:

```js
import routePushState from "can/route/pushstate/";
import routePushState from "can/route/pushstate/pushstate";
import routePushState from "can/route/pushstate/pushstate.js";
```

…to this:

```js
import routePushState from "can-route-pushstate";
```

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-route-pushstate/require.js
```

…will transform any of the following:

```js
import routePushState from 'can/route/pushstate/';
import routePushState from 'can/route/pushstate/pushstate';
import routePushState from 'can/route/pushstate/pushstate.js';
```

…to this:

```js
import routePushState from 'can-route-pushstate';
```

### can-route

To run [all of the can-route transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-route) listed below:

```bash
can-migrate -a **/*.js -t can-route/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-route/import.js
```

…will transform any of the following:

```js
import route from "can/route/";
import route from "can/route/route";
import route from "can/route/route.js";
```

…to this:

```js
import route from "can-route";
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-route/replace.js
```

…will transform code like this:

```js
import can from "can";
can.route("{page}", {page: "homepage"});
```
@highlight 2

…to this:

```js
import route from "can-route";
import can from "can";
route("{page}", {page: "homepage"});
```
@highlight 1,3

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-route/require.js
```

…will transform any of the following:

```js
import route from 'can/route/';
import route from 'can/route/route';
import route from 'can/route/route.js';
```

…to this:

```js
import route from 'can-route';
```

### can-stache

To run [all of the can-stache transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-stache) listed below:

```bash
can-migrate -a **/*.js -t can-stache/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-stache/import.js
```

…will transform any of the following:

```js
import stache from "can/view/stache/";
import stache from "can/view/stache/stache";
import stache from "can/view/stache/stache.js";
```

…to this:

```js
import stache from "can-stache";
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-stache/replace.js
```

…will transform code like this:

```js
import can from "can";
can.stache(template);
```
@highlight 2

…to this:

```js
import stache from "can-stache";
import can from "can";
stache(template);
```
@highlight 1,3

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-stache/require.js
```

…will transform any of the following:

```js
import stache from 'can/view/stache/';
import stache from 'can/view/stache/stache';
import stache from 'can/view/stache/stache.js';
```

…to this:

```js
import stache from 'can-stache';
```

### can-stopListening

To run [all of the can-stopListening transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-stopListening) listed below:

```bash
can-migrate -a **/*.js -t can-stopListening/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-stopListening/replace.js
```

…will transform code like this:

```js
import can from "can";
can.event.stopListening.call(obj, other, event, handler);
```
@highlight 2

…to this:

```js
import canEvent from "can-event";
import can from "can";
canEvent.stopListening.call(obj, other, event, handler);
```
@highlight 1,3


### can-sub

To run [all of the can-sub transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-sub) listed below:

```bash
can-migrate -a **/*.js -t can-sub/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-sub/replace.js
```

…will transform code like this:

```js
import can from "can";
can.sub(str, data, remove);
```
@highlight 2

…to this:

```js
import string from "can-util/js/string/string";
import can from "can";
string.sub(str, data, remove);
```
@highlight 1,3


### can-underscore

To run [all of the can-underscore transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-underscore) listed below:

```bash
can-migrate -a **/*.js -t can-underscore/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-underscore/replace.js
```
@highlight 2

…will transform code like this:

```js
import can from "can";
can.underscore("str");
```
@highlight 2

…to this:

```js
import string from "can-util/js/string/string";
import can from "can";
string.underscore("str");
```
@highlight 1,3


### can-view-attr

To run [all of the can-view-attr transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-view-attr) listed below:

```bash
can-migrate -a **/*.js -t can-view-attr/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-attr/replace.js
```

…will transform code like this:

```js
import can from "can";
can.view.attr(attributeName, attrHandler(el, attrData));
```
@highlight 2

…to this:

```js
import canViewCallbacks from "can-view-callbacks";
import can from "can";
canViewCallbacks.attr(attributeName, attrHandler(el, attrData));
```
@highlight 1,3


### can-view-autorender

To run [all of the can-view-autorender transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-view-autorender) listed below:

```bash
can-migrate -a **/*.js -t can-view-autorender/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-autorender/import.js
```

…will transform any of the following:

```js
import autorender from "can/view/autorender/";
import autorender from "can/view/autorender/autorender";
import autorender from "can/view/autorender/autorender.js";
```

…to this:

```js
import canAutorender from "can-view-autorender";
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-autorender/replace.js
```

…will transform code like this:

```js
import can from "can";
can.autorender(success, error);
```
@highlight 2

…to this:

```js
import canAutorender from "can-view-autorender";
import can from "can";
canAutorender(success, error);
```
@highlight 1,3

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-autorender/require.js
```

…will transform any of the following:

```js
import autorender from 'can/view/autorender/';
import autorender from 'can/view/autorender/autorender';
import autorender from 'can/view/autorender/autorender.js';
```

…to this:

```js
import canAutorender from 'can-view-autorender';
```

### can-view-callbacks

To run [all of the can-view-callbacks transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-view-callbacks) listed below:

```bash
can-migrate -a **/*.js -t can-view-callbacks/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-callbacks/import.js
```

…will transform any of the following:

```js
import viewCallbacks from "can/view/callbacks/";
import viewCallbacks from "can/view/callbacks/callbacks";
import viewCallbacks from "can/view/callbacks/callbacks.js";
```

…to this:

```js
import canViewCallbacks from "can-view-callbacks";
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-callbacks/replace.js
```

…will transform code like this:

```js
import can from "can";
can.view.callbacks();
```
@highlight 2

…to this:

```js
import canViewCallbacks from "can-view-callbacks";
import can from "can";
canViewCallbacks();
```
@highlight 1,3

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-callbacks/require.js
```

…will transform any of the following:

```js
import viewCallbacks from 'can/view/callbacks/';
import viewCallbacks from 'can/view/callbacks/callbacks';
import viewCallbacks from 'can/view/callbacks/callbacks.js';
```

…to this:

```js
import canViewCallbacks from 'can-view-callbacks';
```

### can-view-href

To run [all of the can-view-href transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-view-href) listed below:

```bash
can-migrate -a **/*.js -t can-view-href/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-href/import.js
```

…will transform any of the following:

```js
import viewHref from "can/view/href/";
import viewHref from "can/view/href/href";
import viewHref from "can/view/href/href.js";
```

…to this:

```js
import canViewHref from "can-view-href";
```

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-href/require.js
```

…will transform any of the following:

```js
import viewHref from 'can/view/href/';
import viewHref from 'can/view/href/href';
import viewHref from 'can/view/href/href.js';
```

…to this:

```js
import canViewHref from 'can-view-href';
```

### can-view-import

To run [all of the can-view-import transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-view-import) listed below:

```bash
can-migrate -a **/*.js -t can-view-import/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-import/import.js
```

…will transform any of the following:

```js
import viewImport from "can/view/import/";
import viewImport from "can/view/import/import";
import viewImport from "can/view/import/import.js";
```

…to this:

```js
import canViewImport from "can-view-import";
```

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-import/require.js
```

…will transform any of the following:

```js
import viewImport from 'can/view/import/';
import viewImport from 'can/view/import/import';
import viewImport from 'can/view/import/import.js';
```

…to this:

```js
import canViewImport from 'can-view-import';
```

### can-view-live

To run [all of the can-view-live transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-view-live) listed below:

```bash
can-migrate -a **/*.js -t can-view-live/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-live/replace.js
```

…will transform code like this:

```js
import can from "can";
can.view.live.text(textNode, text);
```
@highlight 2

…to this:

```js
import canViewLive from "can-view-live";
import can from "can";
canViewLive.text(textNode, text);
```
@highlight 1,3

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-live/import.js
```

…will transform any of the following:

```js
import viewLive from "can/view/live/";
import viewLive from "can/view/live/live";
import viewLive from "can/view/live/live.js";
```

…to this:

```js
import canViewLive from "can-view-live";
```

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-live/require.js
```

…will transform any of the following:

```js
import viewLive from 'can/view/live/';
import viewLive from 'can/view/live/live';
import viewLive from 'can/view/live/live.js';
```

…to this:

```js
import canViewLive from 'can-view-live';
```

### can-view-parser

To run [all of the can-view-parser transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-view-parser) listed below:

```bash
can-migrate -a **/*.js -t can-view-parser/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-parser/import.js
```

…will transform any of the following:

```js
import viewParser from "can/view/parser/";
import viewParser from "can/view/parser/parser";
import viewParser from "can/view/parser/parser.js";
```

…to this:

```js
import canViewParser from "can-view-parser";
```

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-parser/require.js
```

…will transform any of the following:

```js
import viewParser from 'can/view/parser/';
import viewParser from 'can/view/parser/parser';
import viewParser from 'can/view/parser/parser.js';
```

…to this:

```js
import canViewParser from 'can-view-parser';
```

### can-view-scope

To run [all of the can-view-scope transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-view-scope) listed below:

```bash
can-migrate -a **/*.js -t can-view-scope/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-scope/replace.js
```

…will transform code like this:

```js
import can from "can";
const scope = new can.view.Scope(data);
```
@highlight 2

…to this:

```js
import canViewScope from "can-view-scope";
import can from "can";
const scope = new canViewScope(data);
```
@highlight 1,3

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-scope/import.js
```

…will transform any of the following:

```js
import viewScope from "can/view/scope/";
import viewScope from "can/view/scope/scope";
import viewScope from "can/view/scope/scope.js";
```

…to this:

```js
import canViewScope from "can-view-scope";
```

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-scope/require.js
```

…will transform any of the following:

```js
import viewScope from 'can/view/scope/';
import viewScope from 'can/view/scope/scope';
import viewScope from 'can/view/scope/scope.js';
```

…to this:

```js
import canViewScope from 'can-view-scope';
```

### can-view-tag

To run [all of the can-view-tag transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-view-tag) listed below:

```bash
can-migrate -a **/*.js -t can-view-tag/
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-tag/replace.js
```

…will transform code like this:

```js
import can from "can";
can.view.tag(tagName, tagHandler(el, tagData));
```
@highlight 2

…to this:

```js
import canViewCallbacks from "can-view-callbacks";
import can from "can";
canViewCallbacks.tag(tagName, tagHandler(el, tagData));
```
@highlight 1,3


### can-view-target

To run [all of the can-view-target transforms](https://github.com/canjs/can-migrate/tree/master/src/transforms/can-view-target) listed below:

```bash
can-migrate -a **/*.js -t can-view-target/
```

#### import

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-target/import.js
```

…will transform any of the following:

```js
import viewTarget from "can/view/target/";
import viewTarget from "can/view/target/target";
import viewTarget from "can/view/target/target.js";
```

…to this:

```js
import canViewTarget from "can-view-target";
```

#### replace

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-target/replace.js
```

…will transform code like this:

```js
import can from "can";
can.view.target();
```
@highlight 2

…to this:

```js
import canViewTarget from "can-view-target";
import can from "can";
canViewTarget();
```
@highlight 1,3

#### require

Running this transform:

```bash
can-migrate -a **/*.js -t can-view-target/require.js
```

…will transform any of the following:

```js
import viewTarget from 'can/view/target/';
import viewTarget from 'can/view/target/target';
import viewTarget from 'can/view/target/target.js';
```

…to this:

```js
import canViewTarget from 'can-view-target';
```
