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
you significantly closer than doing the migration by hand. Your own custom
codemod transformations can also be used with this CLI.

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
--transform -t    specify a transform
```

### Example

Runs all the default `can-migrate` transforms on the files that match the `**/*.js` glob:

```shell
can-migrate --apply **/*.js
```

Runs the `can-component-rename` transform on the files that match the `**/*.js` glob:

```shell
can-migrate **/*.js --transform can-component-rename/can-component-rename.js --apply
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
    ```shell
    can-migrate [<modlet/*.js>] --apply
    ```
    Alternatively, you can run one transform at a time for a more incremental approach:
    ```shell
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
