// IE11 supports WeakMap, but it does not support using
// frozen or sealed objects as keys. So to support IE11
// `can-define-backup` can be used only on unsealed DefineMaps.
// Or this polyfill can be included to make it work with
// sealed DefineMaps (see https://github.com/zloirock/core-js/issues/134).
require('core-js/modules/es6.weak-map');
require('./can-define-backup_test');
