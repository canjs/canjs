@page guides/contributing/adding-ecosystem-modules Adding Ecosystem Packages
@parent guides/contribute

@description Learn how to add your module to this site.

@body

A project that is useful to the CanJS community can be included on the [CanJS documentation](http://canjs.com/) site.

Before submitting a PR with these changes, make sure that the source module has [guides/contributing/documentation] and tests that follow [guides/contributing/code] standards set forth by the CanJS community.

## Definitions

In this guide, `source repo` refers to the repository that will be added to the CanJS.com site.

## Source Repo Documentation

Create a markdown file in the `docs` folder of source repo and name it after the project.

```bash
cd can-fixture
mkdir ./docs
touch ./docs/can-fixture.md
```

> Note: The location of the document files is discussed here as a common use case. Keep in mind that `bit-docs` does not expect documents in any folder. Only that documents use the correct [tag syntax](https://documentjs.com/docs/documentjs.tags.html).

## Source Repo Documentation Tags

In order to include the source project's documentation on the CanJS site, the main document file requires some tags.

```javadocs
@@module {*} <PACKAGE_NAME>
@@parent <CANJS_PARENT_TARGET>
@@package <PATH_TO_PACKAGE.JSON>
```

- `PACKAGE_NAME`: is the project name, which should match the `name` property in the source project's `package.json`.
- `CANJS_PARENT_TARGET`: is the name of the target area in CanJS. For example, if the module is a part of the "Ecosystem", then the value for `@parent` would be `can-ecosystem`. If the target is "Legacy" then the value is `can-legacy`.
- `PATH_TO_PACKAGE.JSON`: is a relative path from the main document file for the source repo. Considering the following structure...

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

## Requiring source repo in CanJS repo

To build the documentation, first, the source repo needs to be added to the CanJS project.

```bash
npm install <PACKAGE_NAME> --save
```

Once the project is added as a dependency, the source project's main file needs to be included in the CanJS project.

In the root directory of the project, locate the `ecosystem.js` JavaScript file - the file should be located in the CanJS project root.

```md
- /canjs
 - core.js
 - ecosystem.js
 - infrastructure.js
 - legacy.js
```

Open the desired file and require the source project.

```javascript
require('<SOURCE_PACKAGE_NAME>');
```

For example, in [CanJS](https://github.com/canjs/canjs/blob/e3301daad996df01463a623d50b38bd5091c9b35/ecosystem.js#L4), we have included the [can-fixture] project.

## Require source tests in CanJS repo

Open the main test file in the CanJS repo, located at `canjs/test/test.js`.

Require the source repo's test main file in the appropriate area. For example, if the source repo will go in "Legacy" area of the site, then add it to the "Legacy" section of the test file.

For example, we have added the [can-fixture tests](https://github.com/canjs/canjs/blob/e3301daad996df01463a623d50b38bd5091c9b35/test/test.js#L56) to the test file.

## Add necessary markup to CanJS docs

Open the main doc file, located at `./docs/can-canjs/canjs.md`.

Again, add any necessary markup to the correct section (related to the target parent; legacy for legacy, etc).

Follow this helpful markdown template:

```md
- **[<PACKAGE_NAME>]** <small><%<PACKAGE_NAME>.package.version%></small> <PACKAGE_DESCRIPTION>
  - `npm install <PACKAGE_NAME> --save`
  - <a class="github-button" href="<PROJECT_GITHUB_URL>" data-count-href="/<PROJECT_GITHUB_ORG>/<PACKAGE_NAME>/stargazers" data-count-api="/repos/<PROJECT_GITHUB_ORG>/<PACKAGE_NAME>#stargazers_count">Star</a>
```

- `PACKAGE_NAME`: The project name, which should match the `name` property in the source project's `package.json`.
- `PACKAGE_DESCRIPTION`: short description of project, can match the `description` property in source project's `package.json`.
- `PROJECT_GITHUB_URL`: The Github url. Not the `git` path but the path to the html site.
- `PROJECT_GITHUB_ORG`: The organization id or user id that owns the project in Github.

For example, we have added the [markup for can-fixtures](https://github.com/canjs/canjs/blob/e3301daad996df01463a623d50b38bd5091c9b35/docs/can-canjs/canjs.md#the-can-package).

## Adding Continuous Integration

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

## Notes

The last part of the process is to verify the following commands locally. Once the site build is verified, create a PR against the CanJS repo to submit changes.

- `npm run test` to run tests, verify documents and project do not adversely affect the test suite.
- `./node_modules/.bin/bit-docs -d` to build the documentation site. Read more on the [guides/contributing/documentation] page.
