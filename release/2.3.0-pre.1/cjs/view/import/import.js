/*!
 * CanJS - 2.3.0-pre.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Fri, 29 May 2015 22:07:38 GMT
 * Licensed MIT
 */

/*can@2.3.0-pre.1#view/import/import*/
var can = require('../../util/util.js');
require('../callbacks/callbacks.js');
can.view.tag('can-import', function (el, tagData) {
    var moduleName = el.getAttribute('from');
    var importPromise;
    if (moduleName) {
        importPromise = can['import'](moduleName);
    } else {
        importPromise = can.Deferred().reject('No moduleName provided').promise();
    }
    var root = tagData.scope.attr('@root');
    if (root && can.isFunction(root.waitFor)) {
        root.waitFor(importPromise);
    }
    can.data(can.$(el), 'viewModel', importPromise);
    var scope = tagData.scope.add(importPromise);
    var handOffTag = el.getAttribute('can-tag');
    if (handOffTag) {
        var callback = can.view.callbacks._tags[handOffTag];
        callback(el, can.extend(tagData, { scope: scope }));
        var viewModel = can.viewModel(el);
        importPromise.then(function (val) {
            viewModel.attr('value', val);
        });
    } else {
        var frag = tagData.subtemplate ? tagData.subtemplate(scope, tagData.options) : document.createDocumentFragment();
        var nodeList = can.view.nodeLists.register([], undefined, true);
        can.one.call(el, 'removed', function () {
            can.view.nodeLists.unregister(nodeList);
        });
        can.appendChild(el, frag, can.document);
        can.view.nodeLists.update(nodeList, can.childNodes(el));
    }
});