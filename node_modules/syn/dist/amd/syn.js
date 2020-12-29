/*syn@0.14.0#syn*/
define([
    'require',
    'exports',
    'module',
    './synthetic',
    './mouse.support',
    './browsers',
    './key.support',
    './drag'
], function (require, exports, module) {
    var syn = require('./synthetic');
    require('./mouse.support');
    require('./browsers');
    require('./key.support');
    require('./drag');
    window.syn = syn;
    module.exports = syn;
});