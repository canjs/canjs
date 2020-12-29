/*!
 * CanJS - 2.3.27
 * http://canjs.com/
 * Copyright (c) 2016 Bitovi
 * Thu, 15 Sep 2016 21:14:18 GMT
 * Licensed MIT
 */

/*can@2.3.27#view/import/import*/
steal('can/util', 'can/view/callbacks', function (can) {
    can.view.tag('can-import', function (el, tagData) {
        var $el = can.$(el);
        var moduleName = el.getAttribute('from');
        var templateModule = tagData.options.attr('helpers.module');
        var parentName = templateModule ? templateModule.id : undefined;
        var importPromise;
        if (moduleName) {
            importPromise = can['import'](moduleName, parentName);
        } else {
            importPromise = can.Deferred().reject('No moduleName provided').promise();
        }
        var root = tagData.scope.attr('%root');
        if (root && can.isFunction(root.waitFor)) {
            root.waitFor(importPromise);
        }
        can.data($el, 'viewModel', importPromise);
        can.data($el, 'scope', importPromise);
        var scope = tagData.scope.add(importPromise);
        var handOffTag = el.getAttribute('can-tag');
        if (handOffTag) {
            var callback = can.view.tag(handOffTag);
            can.data($el, 'preventDataBindings', true);
            callback(el, can.extend(tagData, { scope: scope }));
            can.data($el, 'preventDataBindings', false);
            can.data($el, 'viewModel', importPromise);
            can.data($el, 'scope', importPromise);
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
});