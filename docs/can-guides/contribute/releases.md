@page guides/contributing/releases Releases
@parent guides/contribute

@description Release and hosting information for CanJS maintainers.

@body

For maintainers of CanJS and its submodules this guide describes

- How continuous integration is set up
- How dependencies are kept up to date
- How to make a releases of CanJS subprojects and the main package
- How to update the CanJS website


## Continuous integration

### Travis CI

All repositories automatically run their tests in [Travis CI](https://travis-ci.org/) using the `npm test` command (browser tests use Firefox as their target browser). If `npm test` is passing locally but not on Travis CI

- Try setting the `DEBUG=testee*` environment variable in `travis-ci.org/canjs/<repository>/settings` to get more information.
- Run the tests on an Ubuntu VM (e.g. [Ubuntu for Virtualbox](https://www.virtualbox.org/wiki/Linux_Downloads))

### Saucelabs

[canjs/canjs](https://github.com/canjs/canjs) also runs the tests of all dependencies in the supported browsers on [Saucelabs](https://saucelabs.com):

[![Sauce Test Status](https://saucelabs.com/browser-matrix/canjs.svg)](https://saucelabs.com/u/canjs)

To view Saucelabs test runs and results, request an invite from a Saucelabs user that has access to the `canjs` Saucelabs project (existing users can send invites under [my account](https://saucelabs.com/beta/users/canjs)). Saucelabs tests can be run locally via

```
npm run ci
```


## Updating dependencies

All CanJS repositories are set up with [Greenkeeper](https://greenkeeper.io/). Greenkeeper tracks dependencies and creates a branch for every new version coming in. This will trigger Travis CI to run the tests and if a dependency update breaks the tests or a breaking (major) version was released, it will create a pull request.

Greenkeeper is free for open source projects and works on the CanJS organization level. To add a new project or change the status of an existing project:

- Install the command line via `npm install greenkeeper -g`
- Run `greenkeeper login` to log in via GitHub
- For more information run `greenkeeper` or `greenkeeper start`
- To enable a project, in the project folder run `greenkeeper enable`


## Making releases

All versions should follow the [Semantic Versioning](http://semver.org/) guidelines in the form of `MAJOR.MINOR.PATCH` for

- `MAJOR` version when you make incompatible API changes,
- `MINOR` version when you add functionality in a backwards-compatible manner, and
- `PATCH` version when you make backwards-compatible bug fixes.

Before making any release please make sure that

- you have write access to the GitHub repository you want to publish
- have an [npm](https://www.npmjs.com) account and are logged in on the CLI tool (`npm whoami`)
- your user is a collaborator on npm. You can ask an existing collaborator to add you. Existing collaborators can be listed via `npm owner ls <packagename>` or on the npm module page (e.g. [can-route](https://www.npmjs.com/package/can-route))


### Releasing CanJS subprojects

All CanJS subprojects modules have the same structure which allows making releases through NPM scripts. 

To make a release:

- move to the `master` branch
- fetch all latest changes from the repository
- reinstall all Node modules in their latest version

```
git checkout master
git fetch --all && git rebase
npm cache clean
rm -rf node_modules
npm install
```

Then run `npm run release:<versiontype>`. For example, to make a `PATCH` release:

```
npm run release:patch
```

This will run the tests, build, bump the version number accordingly and publish the module to [npm](https://www.npmjs.com/).


### Releasing the CanJS main project

In `canjs/canjs` all dependencies are locked to their latest version. It uses Greenkeeper (see previous section) to receive a pull request whenever a new release has been made.

When merging a Greenkeeper pull request, review the version number, run `npm install` to get the latest versions and then publish the main repository according to the version number change. For example, if the merged modules `MINOR` version changed run

```
npm run release:minor
```


## Updating canjs.com

canjs.com is hosted on [GitHub pages](https://pages.github.com/) from the [canjs/canjs#gh-pages](https://github.com/canjs/canjs/tree/gh-pages) branch. To generate and push a new version of the website, verify you have push access to that branch. Then get all latest changes via:

```
git checkout master
git fetch --all && git rebase
npm cache clean
rm -rf node_modules
npm install
```

We also have to delete the local `gh-pages` branch:

```
git branch -D gh-pages
```

Then run

```
make
```

This wil generate and publish a new version of the website.
