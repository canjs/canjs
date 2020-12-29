steal('a', 'b', function (__a, __b) {
    var a = __a, b = __b;
    exports.action = function () {
        console.log(`hello world`);
    };
});