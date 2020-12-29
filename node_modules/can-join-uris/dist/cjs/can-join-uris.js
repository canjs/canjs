/*can-join-uris@1.1.0#can-join-uris*/
'use strict';
var namespace = require('can-namespace');
var parseURI = require('can-parse-uri');
module.exports = namespace.joinURIs = function (base, href) {
    function removeDotSegments(input) {
        var output = [];
        input.replace(/^(\.\.?(\/|$))+/, '').replace(/\/(\.(\/|$))+/g, '/').replace(/\/\.\.$/, '/../').replace(/\/?[^\/]*/g, function (p) {
            if (p === '/..') {
                output.pop();
            } else {
                output.push(p);
            }
        });
        return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
    }
    href = parseURI(href || '');
    base = parseURI(base || '');
    return !href || !base ? null : (href.protocol || base.protocol) + (href.protocol || href.authority ? href.authority : base.authority) + removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : href.pathname ? (base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname : base.pathname) + (href.protocol || href.authority || href.pathname ? href.search : href.search || base.search) + href.hash;
};