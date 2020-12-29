/*!
 * CanJS - 2.3.1
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Thu, 29 Oct 2015 18:42:07 GMT
 * Licensed MIT
 */

/*micro-location@0.1.4#lib/micro-location*/
steal('@loader', function (___loader) {
    var loader = ___loader;
    loader.get('@@global-helpers').prepareGlobal(module.id, [], 'Location');
    var define = loader.global.define;
    var require = loader.global.require;
    var source = '/**\n * https://github.com/cho45/micro-location.js\n * (c) cho45 http://cho45.github.com/mit-license\n */\n// immutable object, should not assign a value to properties\nfunction Location () { this.init.apply(this, arguments) }\nLocation.prototype = {\n\tinit : function (protocol, host, hostname, port, pathname, search, hash) {\n\t\tthis.protocol  = protocol;\n\t\tthis.host      = host;\n\t\tthis.hostname  = hostname;\n\t\tthis.port      = port || "";\n\t\tthis.pathname  = pathname || "";\n\t\tthis.search    = search || "";\n\t\tthis.hash      = hash || "";\n\t\tif (protocol) {\n\t\t\twith (this) this.href = protocol + \'//\' + host + pathname + search + hash;\n\t\t} else\n\t\tif (host) {\n\t\t\twith (this) this.href = \'//\' + host + pathname + search + hash;\n\t\t} else {\n\t\t\twith (this) this.href = pathname + search + hash;\n\t\t}\n\t},\n\n\tparams : function (name) {\n\t\tif (!this._params) {\n\t\t\tvar params = {};\n\n\t\t\tvar pairs = this.search.substring(1).split(/[;&]/);\n\t\t\tfor (var i = 0, len = pairs.length; i < len; i++) {\n\t\t\t\tif (!pairs[i]) continue;\n\t\t\t\tvar pair = pairs[i].split(/=/);\n\t\t\t\tvar key  = decodeURIComponent(pair[0].replace(/\\+/g, \'%20\'));\n\t\t\t\tvar val  = decodeURIComponent(pair[1].replace(/\\+/g, \'%20\'));\n\n\t\t\t\tif (!params[key]) params[key] = [];\n\t\t\t\tparams[key].push(val);\n\t\t\t}\n\n\t\t\tthis._params = params;\n\t\t}\n\n\t\tswitch (typeof name) {\n\t\t\tcase "undefined": return this._params;\n\t\t\tcase "object"   : return this.build(name);\n\t\t}\n\t\treturn this._params[name] ? this._params[name][0] : null;\n\t},\n\n\tbuild : function (params) {\n\t\tif (!params) params = this._params;\n\n\t\tvar ret = new Location();\n\t\tvar _search = this.search;\n\t\tif (params) {\n\t\t\tvar search = [];\n\t\t\tfor (var key in params) if (params.hasOwnProperty(key)) {\n\t\t\t\tvar val = params[key];\n\t\t\t\tswitch (typeof val) {\n\t\t\t\t\tcase "object":\n\t\t\t\t\t\tfor (var i = 0, len = val.length; i < len; i++) {\n\t\t\t\t\t\t\tsearch.push(encodeURIComponent(key) + \'=\' + encodeURIComponent(val[i]));\n\t\t\t\t\t\t}\n\t\t\t\t\t\tbreak;\n\t\t\t\t\tdefault:\n\t\t\t\t\t\tsearch.push(encodeURIComponent(key) + \'=\' + encodeURIComponent(val));\n\t\t\t\t}\n\t\t\t}\n\t\t\t_search = \'?\' + search.join(\'&\');\n\t\t}\n\n\t\twith (this) ret.init.apply(ret, [\n\t\t\tprotocol,\n\t\t\thost,\n\t\t\thostname,\n\t\t\tport,\n\t\t\tpathname,\n\t\t\t_search,\n\t\t\thash\n\t\t]);\n\t\treturn ret;\n\t}\n};\nLocation.regexp = new RegExp(\'^(?:(https?:)//(([^:/]+)(:[^/]+)?))?([^#?]*)(\\\\?[^#]*)?(#.*)?$\');\nLocation.parse = function (string) {\n\tvar matched = String(string).match(this.regexp);\n\tvar ret = new Location();\n\tret.init.apply(ret, matched.slice(1));\n\treturn ret;\n};\n\nthis.Location = Location;\n';
    loader.global.define = undefined;
    loader.global.module = undefined;
    loader.global.exports = undefined;
    loader.__exec({
        'source': source,
        'address': module.uri
    });
    loader.global.require = require;
    loader.global.define = define;
    module.exports = loader.get('@@global-helpers').retrieveGlobal(module.id, 'Location');
});