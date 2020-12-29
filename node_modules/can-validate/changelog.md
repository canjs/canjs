@page changelog Changelog
@parent can-validate-plugin
@hide

# Change log

See the [latest releases on GitHub](https://github.com/canjs/can-validate/releases).

## [1.0.0.pre]

### Removed

- No longer ships with validate.js shims
- No longer ships with can.Map plugin
- `validate`, `one`, and `isValid` methods

### Added

- `test` method, behaves similarly as `isValid` but also sets errors
- `errors` method to retrieve errors
- Register validator and library methods
- Extend method for plugins using can-construct

## [0.9.2] - 2015-06-02

### Changed

- Cleaning up code after incorrect merge.

## [0.9.1] - 2015-06-02

### Changed

- Fixed Validate all bug where some properties would not get properly validate when undefined in map instance.
- Fixed overloading of validate list on validate all method.

## [0.9.0] - 2015-06-01

### Changed

- [#26](https://github.com/canjs/can-validate/issues/26) Fixed bug that overwrote validate properties for all instances of a Map or Model. Computes are now cached to a dunder property versus overwriting the main `validate` property.
- [#27](https://github.com/canjs/can-validate/issues/27) Fixed the `validate` method so it resolves computes. Computes are created from functions passed as validate options so validation can be triggered when compute change is triggered.
- Improved validate init. Using a better method for detecting when Map is initing.

## [0.8.4] - 2016-06-01

### Added

- Added tests for issue [#26](https://github.com/canjs/can-validate/issues/26)
- Added tests for issue [#27](https://github.com/canjs/can-validate/issues/27)

### Changed

- Updated dependencies
- Switched to Mocha
- Improved tests

## [0.8.3] - 2016-04-21

### Changed

- Fixed bug when errors was blank would cause console error

## [0.8.2] - 2016-03-02

### Changed

- Improved handling of validation strings, passes strings through to Validate.JS.

## [0.8.1] - 2016-02-03

### Added

- This change log
- Contributing guide

### Changed

- Changed documentation root to `can-validate-plugin`, changed from `can-validate-library`.
- Improved readme.
- Improved overall documentation.

### Removed

- Removed CanJS Validations library documentation since it is still a WIP.

## [0.8.0] - 2015-12-03

### Changed
- Fixed memory leaks.
- Improved validate object compute handling.
- Updated to work with CanJS 2.3.x.

## [0.7.1] - 2015-11-23

### Changed
- Improved build.

## [0.7.0] - 2015-10-19

### Added
- Added XO for linting.

### Changed
- Cleaned up lint errors in repo.

## [0.6.0] - 2015-10-19

### Added
- Improved ability to pass functions to validation properties.

### Changed
- Fixed map init bug.

## [0.5.2] - 2015-10-18

### Changed
- Fixed tests.
- Fixed merge conflicts/errors.

## [0.5.1] - 2015-10-01

### Changed
- Fixed require bug.

## [0.5.0] - 2015-07-16

### Added
- Added "validate all" method to can.Map plugin

## [0.4.2] - 2015-07-13

### Added
- Published to NPM

## [0.4.1] - 2015-07-13

### Added
- Inline docs.
- Added DocumentJS dependency.

## [0.4.0] - 2015-07-10

### Changed
- Restructured repository.

## [0.3.0] - 2015-07-10

### Added
- Browserify build.

### Changed
- Overall build improvements.

## [0.2.0] - 2015-07-09

### Changed
- Made buildable. Using `import` over Steal syntax.

## [0.1.0] - 2015-07-08

### Added
- Created can-validate entry point.
- Created can.Map plugin.
- Created ValidateJS shim


[0.8.0]: https://github.com/canjs/can-validate/commit/0b98de198af17980174531146e43fb8c4b5e11a6
[0.7.1]: https://github.com/canjs/can-validate/commit/2a58bf9ef280c2bb378221c6c18e85c7fed6daa3
[0.7.0]: https://github.com/canjs/can-validate/commit/6be268da2a02e2985f71fa1f7196bfad94c84ca5
[0.6.0]: https://github.com/canjs/can-validate/commit/0383d482353319a6eec3cf218daaa99b8ce62585
[0.5.2]: https://github.com/canjs/can-validate/commit/17f46a11fb3f788e029359476bca83a67dca2b94
[0.5.1]: https://github.com/canjs/can-validate/commit/5280c965df668b3eb1b95d10847f20676a3c5820
[0.5.0]: https://github.com/canjs/can-validate/commit/53d965869263f39ea03dca97822fd5173cf62cdc
[0.4.2]: https://github.com/canjs/can-validate/commit/608ee0cefdc161ecdf186980738952c86c937981
[0.4.1]: https://github.com/canjs/can-validate/commit/c15d0b72bcc3e7343615d41baccbf3cf10242898
[0.4.0]: https://github.com/canjs/can-validate/commit/a1d581aa31c304b04a7bdb4dc40106cf5c48771d
[0.3.0]: https://github.com/canjs/can-validate/commit/4a7de30a12c27e7db992ac2bfcdb55e94e61c17a
[0.2.0]: https://github.com/canjs/can-validate/commit/7ba46b1ea42315f68532f4246031d9bf074b785d
[0.1.0]: https://github.com/canjs/can-validate/commit/b9a9aa2c43d672d9c238a506d788bafb3f89ee70
