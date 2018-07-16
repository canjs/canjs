@page guides/contributing/adding-ecosystem-modules Making a New Package
@parent guides/contribute 7
@outline 0

@description Learn how to add a new package to the CanJS toolkit.

@body

On a high-level, to create a new package, you'll need to:

1. Create a new project, with its own tests, build, releases, etc.
2. Integrate that project's tests and documentation into `canjs/canjs`.

An __official__ package is:

 - In a repository under the [https://github.com/canjs CanJS organization].
 - Listed and documented under the [can-ecosystem Ecosystem Collection].
 - Tested in the [`canjs/canjs` integration suite](https://github.com/canjs/canjs/blob/master/test/test.js).
 - Published on npm as `can-<name>` (with a few exceptions).

__Unofficial__ packages can be maintained however you choose, but to maximize your project’s:

- Compatibility — useful in as many development environments as possible (Browserify, StealJS, Webpack, etc.)
- Discoverability — other developers can find it
- Contribute-ability — other developers can contribute to it

…we suggest following the documentation on this page.

We’ve broken this down into the following sections:

- [Create a new project](#Createanewproject)
- [Set up Continuous Integration](#SetupContinuousIntegration)
- [Write documentation](#Writedocumentation)
- [Integrate build with CanJS](#IntegratebuildwithCanJS)
- [Integrate tests with CanJS](#IntegratetestswithCanJS)
- [Integrate documentation with CanJS](#IntegratedocumentationwithCanJS)

## Create a new project

Follow the [DoneJS plugin guide](https://donejs.com/plugin.html) with the following changes:

__1.__ Pick a package name that has `can` in the name.  

__2.__ When the `donejs add plugin` generator asks for “Project main folder”, use `.`

__3.__ List `canjs` in your `package.json`’s `keywords`.

__4.__ Update the code to match the [guides/contributing/project-organization#Fileorganizationandresponsibilities File organization and responsibilities] section.  There are a few changes to make:

- Change everything to CommonJS.  Use `require('module-name')` instead of `import 'module-name'`.
- Use _tabs_ instead of _spaces_.
- Use dashes instead of underscores in generated filenames.

## Set up Continuous Integration

### Adding Greenkeeper

### Adding Travis

Make sure to activate CI on the source package by including a `.tavis.yml` file in the project root.  

```yml
# An example configuration
language: node_js
# Load nodejs 6.x
node_js:
  - "6"
# Allow ability to run Firefox headless for Testee
before_install:
  - "export DISPLAY=:99.0"
  - "sh -e /etc/init.d/xvfb start"
```

## Write documentation

In this guide, `project repo` refers to the repository that will be added to the CanJS.com site.

### Source Repo Documentation

Create a markdown file in the `docs` folder of project repo and name it after the project.

```bash
cd can-fixture
mkdir ./docs
touch ./docs/can-fixture.md
```

> Note: The location of the document files is discussed here as a common use case. Keep in mind that `bit-docs` does not expect documents in any folder. Only that documents use the correct [tag syntax](https://documentjs.com/docs/documentjs.tags.html).

### Source Repo Documentation Tags

In order to include the source project's documentation on the CanJS site, the main document file requires some tags.

```javadocs
@@module {*} <PACKAGE_NAME>
@@parent <CANJS_PARENT_TARGET>
@@package <PATH_TO_PACKAGE.JSON>
```

- `PACKAGE_NAME`: is the project name, which should match the `name` property in the source project's `package.json`.
- `CANJS_PARENT_TARGET`: is the name of the target area in CanJS. For example, if the module is a part of the "Ecosystem", then the value for `@parent` would be `can-ecosystem`. If the target is "Legacy" then the value is `can-legacy`.
- `PATH_TO_PACKAGE.JSON`: is a relative path from the main document file for the project repo. Considering the following structure...

```
- docs
 - can-fixture.md
- src
- package.json
```

If `can-fixture.md` is the main document, then the relative path to the `package.json` is `../package.json`.

This would result in a main document file that looked [something like this](https://github.com/canjs/can-fixture/blob/40a4b03f0858a7a24182c12ef7b0ebe37c821e24/docs/can-fixture.md)

```md
@@module {function} can-fixture
@@parent can-ecosystem
@@package ../package.json

> Documentation goes here
```

## Integrate build with CanJS

The project repo needs to be added to the CanJS project.

```bash
npm install <PACKAGE_NAME> --save
```

Once the project is added as a dependency, the source project's main file needs to be included in the CanJS project.

In the root directory of the project, locate the appropriate JavaScript file.

```md
- /canjs
 - can.js
 - ecosystem.js
 - legacy.js
```

Open the desired file and require the source project. For infrastructure and core packages, use the `can.js` file.

```javascript
require('<SOURCE_PACKAGE_NAME>');
```

For example, in [CanJS](https://github.com/canjs/canjs/blob/e3301daad996df01463a623d50b38bd5091c9b35/ecosystem.js#L4), we have included the [can-fixture] project.

Run `node build.js` to build CanJS.  You should be able to to use `dist/global/can.all.js`
to show examples with your code.  

If you can't you might need to:

- Add your pacakge's export to [can-namespace] like:

  ```js
  let namespace = require("can-namespace");

  const myCoolThing = {};
  module.exports = can.myCoolThing = myCoolThing
  ```

- Make sure to exclude any 3rd-party projects from `canjs/build.js` like:

  ```js
  let ignoreModuleNamesStartingWith = [
  	"jquery",
	"SOME_OTHER_LIBRARY"
  	...
  ]
  ```

  And train them to be loaded globally on the `window` like:

  ```js
  let exportsMap = {
      "jquery": "jQuery",
      "SOME_OTHER_LIBRARY": "SomeOtherLibrary"
	  ...
  };
  ```

  And make sure your package's modules are able to run without
  the library:

  ```js
  let namespace = require("can-namespace");
  let SomeOtherLibrary = require("SOME_OTHER_LIBRARY");

  let myCoolThing;
  if(SomeOtherLibrary) {
	  myCoolThing = SomeOtherLibrary({});
  }

  module.exports = can.myCoolThing = myCoolThing
  ```


## Integrate tests with CanJS

Open the main test file in the CanJS repo, located at `canjs/test/test.js`.

> Note: The tests in this file will run in dev mode and production mode. If your tests should only run in dev mode, add them to `canjs/test/test-dev-only.js`.

Require the project repo's test main test file in the appropriate area. For example, if the project repo will go in "Legacy" area of the site, then add it to the "Legacy" section of the test file.

For example, we have added the [can-fixture tests](https://github.com/canjs/canjs/blob/e3301daad996df01463a623d50b38bd5091c9b35/test/test.js#L56) to the test file.

Run `npm run test` to run tests, verify the project does not adversely affect the test suite.

## Integrate documentation with CanJS

Open the `can-api.md` doc file, located at `./docs/can-canjs/can-api.md`.

Again, add any necessary markup to the correct section (related to the target parent; legacy for legacy, etc).

Follow this helpful markdown template:

```md
- **[<PACKAGE_NAME>]** <small><%<PACKAGE_NAME>.package.version%></small> <PACKAGE_DESCRIPTION>
  - `npm install <PACKAGE_NAME> --save`
  - <a class="github-button" href="<PROJECT_GITHUB_URL>">Star</a>
```

- `PACKAGE_NAME`: The project name, which should match the `name` property in the source project's `package.json`.
- `PACKAGE_DESCRIPTION`: short description of project, can match the `description` property in source project's `package.json`.
- `PROJECT_GITHUB_URL`: The Github url. Not the `git` path but the path to the html site.

For example, we have added the [markup for can-fixtures](https://github.com/canjs/canjs/blob/e3301daad996df01463a623d50b38bd5091c9b35/docs/can-canjs/canjs.md#the-can-package).

Run `npm run document` to build the documentation site. Read more on the [guides/contributing/documentation] page.
