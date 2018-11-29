@page guides/contributing/releases Releasing CanJS
@parent guides/contribute 9
@outline 2
@description Release and hosting information for CanJS maintainers.

@body

For maintainers of CanJS and its submodules this guide describes

- How continuous integration is set up
- How dependencies are kept up to date
- How to make a releases of CanJS subprojects and the main package

## Continuous Integration

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


## Updating dependencies with Greenkeeper

All CanJS repositories are set up with [Greenkeeper](https://greenkeeper.io/). Greenkeeper tracks dependencies and creates a branch for every new version coming in. This will trigger Travis CI to run the tests and if a dependency update breaks the tests or a breaking (major) version was released, it will create a pull request.

Greenkeeper is free for open source projects and works on the CanJS organization level. To add a new project or change the status of an existing project:

- Install the command line via `npm install greenkeeper -g`
- Run `greenkeeper login` to log in via GitHub
- For more information run `greenkeeper` or `greenkeeper start`
- To enable a project, in the project folder run `greenkeeper enable`


## Making releases

With the exception of the `can` package, __ALL subprojects__ MUST follow the [Semantic Versioning](http://semver.org/) guidelines in the form of `MAJOR.MINOR.PATCH` for

- `MAJOR` version when you make incompatible API changes,
- `MINOR` version when you add functionality in a backwards-compatible manner, and
- `PATCH` version when you make backwards-compatible bug fixes.

Before making any release please make sure that

- You have write access to the GitHub repository you want to publish.
- Have an [npm](https://www.npmjs.com) account and are logged in on the CLI tool (`npm whoami`).
- Your user is a collaborator on npm. You can ask an existing collaborator to add you. Existing collaborators can be listed via `npm owner ls <packagename>` or on the npm module page (e.g. [can-route](https://www.npmjs.com/package/can-route)).


### Releasing CanJS subprojects

All CanJS subprojects modules have the same structure which allows making releases through npm scripts.

To make a release:

1. Move to the `master` branch
2. Fetch all latest changes from the repository
3. Reinstall all Node modules in their latest version

   ```
   git checkout master
   git fetch --all && git rebase
   npm cache clean
   rm -rf node_modules
   npm install
   ```

4. Then run `npm run release:<versiontype>`. For example, to make a `PATCH` release:

   ```
   npm run release:patch
   ```

This will run the tests, build, bump the version number accordingly and publish the module to [npm](https://www.npmjs.com/).

#### Publishing release notes

After you have released the project, you will need to update the release on GitHub. Make sure the newly created tag has been pushed to GitHub (`git push --tags`). 

Then go to `https://github.com/canjs/<repository>/releases` and edit the most recent tag. Give it a title and add any notes or links to issues, then click `Update release`.

### Releasing the CanJS main project

The CanJS main project repository is at
[canjs/canjs](https://github.com/canjs/canjs) and published as the `can` package. We
publish a `can` module so there is a specified version of the library packages that are
__integration tested__ to work together. A single `can` release can include multiple
releases of library packages.

The `can` package does __not__ follow strict [semantic versioning](http://semver.org/)
guidelines. It still follows a `MAJOR.MINOR.PATCH` release names, but where:

 - `MAJOR` - Incompatible API changes in a library in the [can-core] or [can-infrastructure] collection.
 - `MINOR` - Either:
    - New features added [can-core] and [can-infrastructure] but still backwards-compatible.
    - New [can-ecosystem] or [can-legacy] library added or removed to their respective collection.
 - `PATCH` - Either:
    - Bug fixes in [can-core] and [can-infrastructure].
    - A new release of a [can-ecosystem] or [can-legacy] library.

The `can` package __does__ follow strict [semantic versioning](http://semver.org/) guidelines
with respect to the [can-core] and [can-infrastructure] collections. If a
new [can-ecosystem] or [can-legacy] package is added to `can`, it’s treated as a `MINOR` changes to `can`,
any subsequent releases of those packages are treated as `PATCH` changes to `can`.

When making a release, review the the version number changes and collection of all packages that have changed within the release.  Then run `npm run release:<versiontype>`.

For example, the following would be a `PATCH` release:

```
can-core-a       3.0.1 -> 3.0.2
can-core-b       3.0.1 -> 3.0.10
can-ecosystem-a  1.0.0 -> 2.0.0
```

The following would be a `MINOR` release:

```
can-core-a       3.0.1 -> 3.0.2
can-core-b       3.0.1 -> 3.0.10
// this means can-ecosystem-b was added to the ecosystem collection
+ can-ecosystem-b 0.0.1  
```

The following would be a `MINOR` release:

```
can-core-a       3.0.1 -> 3.0.2
can-core-b       3.0.1 -> 3.1.0
can-ecosystem-a  1.0.0 -> 1.0.1
```

The following would be a `MAJOR` release:

```
can-core-a           3.0.1 -> 3.0.2
can-core-b           3.0.1 -> 3.1.0
can-infrastructure-a 3.0.1 -> 4.0.0
```
