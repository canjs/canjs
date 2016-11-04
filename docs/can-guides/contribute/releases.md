@page guides/contributing/releases Releases
@parent guides/contribute

@description Release and hosting information for CanJS maintainers.

@body


> Is there anyway to make this more of an ordered list?
> For example, for CanJS:
> 1. Get access to XYZ (npm)
> 2. Make sure there's a pull request to master that passes all Saucelabs tests.
> 3. Merge pull request and run `npm release:patch`
> 4. Get Justin to update JSBins for now (might have to re-release site).

## Updating dependencies

All CanJS repositories are set up with Greenkeeper. [Greenkeeper](https://greenkeeper.io/) tracks your dependencies and applies an update to a branch for every new version coming in. Your test suite runs behind the scenes, and only if a dependency update breaks your software, we let you know in a Pull Request, including all the information you need to make a decision about what to do with that version update.

> What does "applies an update to a branch" mean?  Which branch get these applied? Master?
> How is greenkeeper setup?  Is it like travis? Who has access?

## Making a release

### For individual modules

CanJS individual modules all have the same structure which allows making releases through NPM scripts. All versions should follow the [Semantic Versioning](http://semver.org/) guidelines in the form of `MAJOR.MINOR.PATCH` for

- `MAJOR` version when you make incompatible API changes,
- `MINOR` version when you add functionality in a backwards-compatible manner, and
- `PATCH` version when you make backwards-compatible bug fixes.

To make a release we have to make sure to be on the `master` branch and the latest upstream changes and reinstall the latest version of all Node modules:

```
git checkout master
git fetch --all && git rebase
npm cache clean
rm -rf node_modules
npm install
```

Now we can run `npm run release:<versiontype>`. For example, to make a `PATCH` release:

```
npm run release:patch
```

This will run the tests, build, bump the version number accordingly and publish the module to [npm](https://www.npmjs.com/).

### For the CanJS main repository

In `canjs/canjs` all dependencies are locked to their latest version. It uses Greenkeeper to receive a pull request whenever a new release has been made. When merging a new pull request, review the version number, run `npm install` to get the latest version and then publish the main repository according to the version number change. For example, if the merged modules `MINOR` version changed run

```
npm run release:minor
```

## Continuous integration

### Travis

All repositories automatically run their tests in [Travis CI](https://travis-ci.org/) using the `npm test` command (browser tests use Firefox as their target browser).

`canjs/canjs` also runs the tests of all dependencies in the supported browsers in [Saucelabs](https://saucelabs.com):

[![Sauce Test Status](https://saucelabs.com/browser-matrix/canjs.svg)](https://saucelabs.com/u/canjs)

To view Saucelabs test runs and results, request an invite from the `canjs` Saucelabs user. Saucelabs tests can be run locally via

```
npm run ci
```

> How you do you request an invite?  

### Website hosting and ci.canjs.com

[ci.canjs.com](https://ci.canjs.com) runs a [Strider](https://github.com/Strider-CD/strider) continuous deployment server and is also the server hosting canjs.com, donejs.com, connect.canjs.com, stealjs.com and funcunit.com. Similar to Travis CI it runs on every push to the main repository (`canjs/canjs`) but instead of running the tests it will generate and re-deploy the canjs.com website with the latest documentation.

For more information about the hosting server administration refer to the [Bitovi employee Wiki](https://github.com/bitovi/brain/wiki/ci.canjs.com).
