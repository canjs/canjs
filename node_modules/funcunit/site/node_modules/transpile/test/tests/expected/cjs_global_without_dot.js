define(function (require, exports, module) {
    (function (global) {
        var foo = getFromGlobal(global, 'foo');
        function getFromGlobal(global, prop) {
            return global[prop];
        }
    }(function () {
        return this;
    }()));
});