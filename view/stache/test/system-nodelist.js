var can = require('can');
var template = require('./system-nodelist.stache!');

var nl = can.view.nodeLists.register([], undefined, true);

can.stache.registerHelper('importTestHelper', function(options) {
	window.parent.QUnit.equal(options.nodeList, nl.replacements[0], 'correct node list reference');
	window.parent.removeMyself();
});

template({}, {}, nl);
