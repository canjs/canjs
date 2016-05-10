var stache = require('can/view/stache/stache');
var mustacheCore = require('can/view/stache/mustache_core');
var renderer = stache([
    {
        'tokenType': 'start',
        'args': [
            'h1',
            false
        ]
    },
    {
        'tokenType': 'end',
        'args': [
            'h1',
            false
        ]
    },
    {
        'tokenType': 'chars',
        'args': ['Hello World']
    },
    {
        'tokenType': 'close',
        'args': ['h1']
    },
    {
        'tokenType': 'chars',
        'args': ['\n']
    },
    {
        'tokenType': 'done',
        'args': []
    }
]);
module.exports = function (scope, options, nodeList) {
    var moduleOptions = { module: module };
    if (!(options instanceof mustacheCore.Options)) {
        options = new mustacheCore.Options(options || {});
    }
    return renderer(scope, options.add(moduleOptions), nodeList);
};
