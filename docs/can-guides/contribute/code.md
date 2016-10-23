@page guides/contributing/code Code
@parent guides/contribute

@description Learn how contribute a code change to CanJS.

@body

## Overview

Contributing to any Open Source project can be intimidating.  All contributions from all types of contributors are welcome.  We're
committed to making the experience as pleasant and rewarding as possible.  We're happy to setup a
pairing session to show you how to fix a bug or write a feature.  

If you have any questions, you can always reach us on [Gitter chat](https://gitter.im/canjs/canjs).

The first thing to know about `CanJS` is that its code is split across about 40 different
repositories.  All but one of these repositories are __library__ repositories like
[canjs/can-event](https://github.com/canjs/can-event) and [canjs/can-define](https://github.com/canjs/can-define).  These all work the same way.
The [canjs/canjs](https://github.com/canjs/canjs) __framework__ repository works slightly
differently.  The vast majority of code changes happen in one of the __library__
repositories.

If you don't know which repository you need to work on, ask us in [Gitter chat](https://gitter.im/canjs/canjs).

Once you know your repository, the following details:

- Setting up your development environment.
- Getting the repository's code and verify it's working.
- The file organization and responsibilities.
- Making changes and submitting a pull request.

The following video walks through most of the following steps:

<iframe width="560" height="315" src="https://www.youtube.com/embed/PRuueWqnpIw" frameborder="0" allowfullscreen></iframe>

## Setting up your development environment.

Developing CanJS requires:

 - A [https://github.com/](github.com) account and git client.
 - Node version 5 or later.
 - Firefox for running automated tests.

### Getting github account and client

Signup for a [https://github.com/](GitHub) account.  

There are a variety of ways to get a git command line client
connected to your GitHub account.  Fortunately, GitHub has
great documentation on how to [Setup Git](https://help.github.com/articles/set-up-git/).


If you already have `git` installed, make sure you've
[setup your ssh keys](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/).

### Get NodeJS

Download Node.js version 5 or later at [https://nodejs.org](https://nodejs.org).  You can
verify node is working at its version with:

```
> node -v
```

### Get Firefox

Download the Firefox browser
[here](https://www.mozilla.org/en-US/firefox/new/). Make sure it gets installed into the
default location for your operating system.

Firefox is used to run each repository's tests.


## Getting the code and verify it is working

Once your environment is setup, you should be able to clone the repository you
want to change, install its dependencies, and verify you've setup your
development environment correctly.

__1.__  Fork the repository you are working from by clicking the `fork` button.
For example, you can fork `can-compute` by pressing its __fork__ button on GitHub:

<img src="../../../docs/can-guides/contribute/fork.png" width="600px"/>


__2.__ Clone the your forked version of the repository.

```
> git clone git@github.com:<your username>/<repository-name>.git
```

For example, if your username is `justinbmeyer`, and you forked `can-compute`:

```
> git clone git@github.com:justinbmeyer/can-compute.git
```

Before the next step, make sure you move into your project's directory.  For example:

```
> cd can-compute
```

__3.__ Install npm dependencies with:

```
> npm install
```

__4.__ Make sure Firefox is closed and run the test suite with:

```
> npm test
```

If every test passed, __congrats__! You've got everything you need to
change code and send it back to us.

## File organization and responsibilities

Most __library__ repositories share a similar structure.  Understanding it can help
you figure out what code needs to be changed.  The following details the
directory structure of a nonexistent `can-example` repository:

```
├── package.json            - Configuration of package and dev scripts
├── can-example.js          - Main module code
├── build.js                - Build script to export code in other formats
├── .editorconfig           - Configures editors for this project
├── .gitignore              - Tells git to ignore certain files
├── .jshintrc               - Configures JSHint
├── .npmignore              - Tells npm publish to ignore certain files
├── .travis.yml             - Travis CI configuration
├── readme.md               - Automatically generated readme
├── test/                   - Test files
|   ├── can-example-test.js - Main test file
|   ├── test.html           - Main test page
├── docs/                   - Documentation source
|   ├── can-example.md      - Package or module documentation
├── node_modules/           - Node dependency installation folder
```

Generally, speaking, the most important files are:

 - the main module -  `can-example.js`
 - the main test module - `test/can-example-test.js`
 - the test page - `test/test.html`

When fixing a bug or making a feature, we'll add a test in the main test module
and update code in the main module and verify the tests are passing by running
the test page.

Some modules have multiple modules, test modules, and test pages.  These modules are
commonly organized as __modlets__ where each folder will have its own main module, test module
and test page:

```
├── a-module/            - Module's modlet folder
|   ├── a-module.js      - The module
|   ├── a-module-test.js - The module's tests
|   ├── test.html        - A test page that runs just the module's tests
```

Where possible, CanJS code is:

- Tabs not spaces
- JSHinted
- CommonJS not ES6
- Follows jQuery [coding conventions](https://contribute.jquery.org/style-guide/js/)


##  Make your changes

Once you've figured out where you need to make changes, you'll want to complete the following steps
to make those changes and create a pull request so we can include your code in future releases:


1. Create a new feature branch. For example, `git checkout -b html5-fix`.
2. Make some changes to the code and tests.
4. Run tests `npm test` and make sure they pass in all browsers.
5. Update documentation if necessary.
6. Push your changes to your remote branch.  For example, `git push origin html5-fix`.
7. Submit a pull request! Navigate to Pull Requests and click the 'New Pull Request' button. Fill in some
   details about your potential patch including a meaningful title. When finished, press "Send pull request". The core team will be notified about your submission and let you know of any problems or targeted release date.

If you enjoy making these kinds of fixes, and want to directly influence CanJS's direction,
consider joining our [Core team](https://donejs.com/About.html#section=section_Coreteam).

## Making a plugin

Making an official or un-offical CanJS plugin is easy.  

An __offical__ plugin is:

 - In a repository under the [https://github.com/canjs CanJS organization].
 - Listed and documented under the [can-ecosystem Ecosystem Collection].
 - Tested in the `canjs/canjs` integration suite.
 - With few exceptions, published as `can-<name>` .

__Unofficial__ plugins can be maintained however you choose, but to maximize your project's:

- Compatibility - useful in as many development environments as possible (RequireJS, Browserify, Webpack, etc)
- Discoverability - other developers can find it
- Contribute-ability - other developers can contribute to it

... we suggest following the [DoneJS plugin](https://donejs.com/plugin.html) with the following changes:

__1.__ Pick a plugin name that has `can` in the name.  

__2.__ When the `donejs add plugin` generator asks for "Project main folder", use `.`

__3.__ List `canjs` in your `package.json`'s `keywords`.

__4.__ Update the code to match the [File organization and responsibilities](#Fileorganizationandresponsibilities) section.  There are a few changes to make:

- Change everything to CommonJS.  Use `require('module-name')` instead of `import 'module-name'`.
- Use _tabs_ instead of _spaces_.
- Use dashes instead of underscores in generated filenames.
