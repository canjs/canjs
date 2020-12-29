define('steal_deps', [
    'foo/foo',
    'bar/bar',
    'baz'
], function (foo, bar, baz) {
    return {
        foo: foo,
        bar: bar,
        baz: baz
    };
});