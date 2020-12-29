define(['foo/foo'], function (foo) {
    if (foo) {
        steal('abc', function () {
        });
    }
});