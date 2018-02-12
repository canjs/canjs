@page guides/contributing/releases Releasing CanJS
@parent guides/contribute 3
@outline 2
@description Release and hosting information for CanJS maintainers.

@body

For maintainers of CanJS and its submodules this guide describes

- How to make a releases of CanJS subprojects and the main package

### Releasing CanJS subprojects

All CanJS subprojects modules have the same structure which allows making releases through npm scripts.

To make a release:

1. Move to the `3.x-legacy` branch
2. Fetch all latest changes from the repository
3. Reinstall all Node modules in their latest version

   ```
   git checkout 3.x-legacy
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

### Releasing the CanJS main project

The CanJS main package also has a [3.x-legacy branch](https://github.com/canjs/canjs/tree/3.x-legacy) set up to publish to the `3.x-legacy` tag in NPM using the same release script setup.
