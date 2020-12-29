define(function (require, exports, module) {
    (function (global, __dirname) {
        var Math = global.Math;
        var p = __dirname + '/foo';
    }(function () {
        return this;
    }(), '/'));
});