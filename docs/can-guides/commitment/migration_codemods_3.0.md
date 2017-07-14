@page can-migrate-codemods Using Codemods to Migrate to 3.x
@parent guides/upgrade 0
@templateRender <% %>
@description This guide gets your started with using our migration tool can-migrate-codemods
@outline 0

@body

[![Greenkeeper badge](https://badges.greenkeeper.io/canjs/can-migrate-codemods.svg)](https://greenkeeper.io/)

`can-migrate-codemods` is a codebase refactoring tool that is partially automated but still requires oversight and intervention.

This guide contains:

* [An *Overview*](#Overview), what is a codemod and how can it help me with my migration?
* [The *Installation Process*](#Install), how to install the can-migrate-codemods CLI
* [The *Usage*](#Usage_CLI_), how to get started with using the CLI
* [The *Recommended Migration Process*](#RecommendedMigrationProcess), which outlines the process to do a successful migration.

## Overview

[can-migrate-codemods](https://www.github.com/canjs/can-migrate-codemods) is a codebase refactoring tool that is partially automated but still requires oversight and intervention. A codemod is a transformation script that parses the [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) of source code in order to do a code-aware find-and-replace refactor across multiple files. This module contains a CLI with various codemods that transform Can.js 2.x to 3.x. It is intended to help you get started with a Can.js migration from 2.x to 3.x. However, it won't be a complete solution for a seamless migration, but it will get you significantly closer than doing it by hand. Custom codemod transformations can also be used with the can-migrate CLI. 

### What has changed in CanJS 3?

The short version is the core modules have not changed that much however there are a handful of useful new features and a more modular project structure.

For the long version, read more about it [in the migration guide](https://canjs.com/doc/migrate-3.html)

## Install

Install `can-migrate-codemods` from npm:
  ```shell
  $ npm install -g can-migrate-codemods
  ```
This will make the `can-migrate` command available.

## Usage(CLI)

The CLI provides the following options:
```
$ can-migrate [<files> OPTIONS...]

  Updates files according to the CanJS 3.0 migration paths (minimal, modern, future)

  Options
  --apply     -a    Apply transforms (instead of a dry run)
  --force           Apply transforms regardless of git status
  --silent    -s    Silence output
  --config    -c    Path to custom config file
  --transform -t    specify a transform

```

** Example usage**

Runs all the default can-migrate transforms on the files that match the **/*.js glob

```
$ can-migrate --apply **/*.js
```

Runs the `can-component-rename` transform on the files that match the **/*.js glob

```
$ can-migrate can-migrate **/*.js --transforms can-component-rename/can-component-rename.js --apply 
```

## Recommended Migration Process

1. Make a new branch for the migration.
    ```shell
    $ git checkout -b migration
    ``` 
1. Ensure all tests are passing and your git state is clean.
  As with any migration, if your code is not tested, the amount of time it takes for a successful migration is exponentially greater.
1. Run the transforms on each [modlet](https://www.bitovi.com/blog/modlet-workflows) or standalone testable component.
    ```shell
    $ can-migrate [<modlet/*.js>] --apply
    ```
    Alternatively, you can run one transform at a time for a more incremental approach:
    ```shell
    $ can-migrate [<modlet/*.js>] --transforms <transform path> --apply 
    ```
1. Install the [can-* modules](https://canjs.com/doc/api.html#ThecanPackage) used in that modlet or component. Here are some common ones:
    ```shell
    $ npm i can-component --save
    $ npm i can-compute --save
    $ npm i can-connect --save
    $ npm i can-define --save
    $ npm i can-route --save
    $ npm i can-route-pushstate --save
    $ npm i can-set --save
    $ npm i can-stache --save
    $ npm i can-stache-bindings --save
    ```

1. Run the tests again, and fix the bugs as they come up.
  Review the [migration guide](https://canjs.com/doc/migrate-3.html) to understand what changes to expect
1. Commit the module once all tests are passing again.
1. Repeat 2-6 until all modlet or components are migrated and tests are passing.

Note: If you are using steal, ensure you are running on Steal 0.16 or greater.
