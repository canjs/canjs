/*can-ajax@2.4.5#can-ajax*/
'use strict';
var Global = require('can-globals/global/global');
var canReflect = require('can-reflect');
var namespace = require('can-namespace');
var parseURI = require('can-parse-uri');
var param = require('can-param');
var xhrs = [
        function () {
            return new XMLHttpRequest();
        },
        function () {
            return new ActiveXObject('Microsoft.XMLHTTP');
        },
        function () {
            return new ActiveXObject('MSXML2.XMLHTTP.3.0');
        },
        function () {
            return new ActiveXObject('MSXML2.XMLHTTP');
        }
    ], _xhrf = null;
var originUrl = parseURI(Global().location.href);
var globalSettings = {};
var makeXhr = function () {
    if (_xhrf != null) {
        return _xhrf();
    }
    for (var i = 0, l = xhrs.length; i < l; i++) {
        try {
            var f = xhrs[i], req = f();
            if (req != null) {
                _xhrf = f;
                return req;
            }
        } catch (e) {
            continue;
        }
    }
    return function () {
    };
};
var contentTypes = {
    json: 'application/json',
    form: 'application/x-www-form-urlencoded'
};
var _xhrResp = function (xhr, options) {
    try {
        var type = options.dataType || xhr.getResponseHeader('Content-Type').split(';')[0];
        if (type && (xhr.responseText || xhr.responseXML)) {
            switch (type) {
            case 'text/xml':
            case 'xml':
                return xhr.responseXML;
            case 'text/json':
            case 'application/json':
            case 'text/javascript':
            case 'application/javascript':
            case 'application/x-javascript':
            case 'json':
                return xhr.responseText && JSON.parse(xhr.responseText);
            default:
                return xhr.responseText;
            }
        } else {
            return xhr;
        }
    } catch (e) {
        return xhr;
    }
};
function ajax(o) {
    var xhr = makeXhr(), timer, n = 0;
    var deferred = {}, isFormData;
    var promise = new Promise(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    var requestUrl;
    var isAborted = false;
    promise.abort = function () {
        isAborted = true;
        xhr.abort();
    };
    o = [
        {
            userAgent: 'XMLHttpRequest',
            lang: 'en',
            type: 'GET',
            data: null,
            dataType: 'json'
        },
        globalSettings,
        o
    ].reduce(function (a, b, i) {
        return canReflect.assignDeep(a, b);
    });
    var async = o.async !== false;
    if (!o.contentType) {
        o.contentType = o.type.toUpperCase() === 'GET' ? contentTypes.form : contentTypes.json;
    }
    if (o.crossDomain == null) {
        try {
            requestUrl = parseURI(o.url);
            o.crossDomain = !!(requestUrl.protocol && requestUrl.protocol !== originUrl.protocol || requestUrl.host && requestUrl.host !== originUrl.host);
        } catch (e) {
            o.crossDomain = true;
        }
    }
    if (o.timeout) {
        timer = setTimeout(function () {
            xhr.abort();
            if (o.timeoutFn) {
                o.timeoutFn(o.url);
            }
        }, o.timeout);
    }
    xhr.onreadystatechange = function () {
        try {
            if (xhr.readyState === 4) {
                if (timer) {
                    clearTimeout(timer);
                }
                if (xhr.status < 300) {
                    if (o.success) {
                        o.success(_xhrResp(xhr, o));
                    }
                } else if (o.error) {
                    o.error(xhr, xhr.status, xhr.statusText);
                }
                if (o.complete) {
                    o.complete(xhr, xhr.statusText);
                }
                if (xhr.status >= 200 && xhr.status < 300) {
                    deferred.resolve(_xhrResp(xhr, o));
                } else {
                    deferred.reject(_xhrResp(xhr, o));
                }
            } else if (o.progress) {
                o.progress(++n);
            }
        } catch (e) {
            deferred.reject(e);
        }
    };
    var url = o.url, data = null, type = o.type.toUpperCase();
    var isJsonContentType = o.contentType === contentTypes.json;
    var isPost = type === 'POST' || type === 'PUT';
    if (!isPost && o.data) {
        url += '?' + (isJsonContentType ? JSON.stringify(o.data) : param(o.data));
    }
    xhr.open(type, url, async);
    var isSimpleCors = o.crossDomain && [
        'GET',
        'POST',
        'HEAD'
    ].indexOf(type) !== -1;
    isFormData = typeof FormData !== 'undefined' && o.data instanceof FormData;
    if (isPost) {
        if (isFormData) {
            data = o.data;
        } else {
            if (isJsonContentType && !isSimpleCors) {
                data = typeof o.data === 'object' ? JSON.stringify(o.data) : o.data;
                xhr.setRequestHeader('Content-Type', 'application/json');
            } else {
                data = param(o.data);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
        }
    } else {
        xhr.setRequestHeader('Content-Type', o.contentType);
    }
    if (!isSimpleCors) {
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }
    if (o.xhrFields) {
        for (var f in o.xhrFields) {
            xhr[f] = o.xhrFields[f];
        }
    }
    function send() {
        if (!isAborted) {
            xhr.send(data);
        }
    }
    if (o.beforeSend) {
        var result = o.beforeSend.call(o, xhr, o);
        if (canReflect.isPromise(result)) {
            result.then(send).catch(deferred.reject);
            return promise;
        }
    }
    send();
    return promise;
}
module.exports = namespace.ajax = ajax;
module.exports.ajaxSetup = function (o) {
    globalSettings = o || {};
};