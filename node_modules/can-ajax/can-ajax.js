'use strict';

var Global = require("can-globals/global/global");
var canReflect = require("can-reflect");
var namespace = require("can-namespace");
var parseURI = require('can-parse-uri');
var param = require("can-param");

/**
 * @module {function} can-ajax can-ajax
 * @parent can-dom-utilities
 * @collection can-infrastructure
 * @package ./package.json
 *
 * Make an asynchronous HTTP (AJAX) request.
 *
 * @signature `ajax( ajaxOptions )`
 *
 *    Is used to make an asynchronous HTTP (AJAX) request similar to [jQuery.ajax()](http://api.jquery.com/jQuery.ajax/).
 *
 *    ```js
 *    import { ajax } from "can";
 *
 *    ajax({
 *      url: "http://query.yahooapis.com/v1/public/yql",
 *      data: {
 *        format: "json",
 *        q: 'select * from geo.places where text="sunnyvale, ca"'
 *      }
 *    }).then(function(response){
 *      console.log( response.query.count ); // => 2
 *    });
 *    ```
 *
 *    @param {Object} ajaxOptions Configuration options for the AJAX request.
 *      - __url__ `{String}` The requested url.
 *      - __type__ `{String}` The method of the request. Ex: `GET`, `PUT`, `POST`, etc. Capitalization is ignored. _Default is `GET`_.
 *      - __data__ `{Object}` The data of the request. If data needs to be urlencoded (e.g. for GET requests or for CORS) it is serialized with [can-param].
 *      - __dataType__ `{String}` Type of data. _Default is `json`_.
 *      - __crossDomain__ `{Boolean}` If you wish to force a crossDomain request (such as JSONP) on the same domain, set the value of crossDomain to true. This allows, for example, server-side redirection to another domain. Default: `false` for same-domain requests, `true` for cross-domain requests.
 *      - __xhrFields__ `{Object}` Any fields to be set directly on the xhr request, [https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest] such as the withCredentials attribute that indicates whether or not cross-site Access-Control requests should be made using credentials such as cookies or authorization headers.
 *      - __beforeSend__ `{callback}` A pre-request callback function that can be used to modify the XHR object before it is sent. Use this to set custom headers, etc. The XHR and settings objects are passed as arguments.
 *      - __success__ `{callback}` A callback passed the response body when the request completes without error.  Using the promise returned from ajax() should be preferred to passing a success callback
 *      - __error__ `{callback}` A callback passed the XHR object when the request fails to complete correctly.  Using the promise returned from ajax() should be preferred to passing an error callback
 *      - __async__ `{Boolean}` Set `async` to `false` to create a synchronous XHR that blocks the thread until the request completes. success() or error() is called synchronously on completion, but promise callbacks are still resolved asychronously.  Synchronous AJAX calls are **not recommended** and are only supported here for legacy reasons.
 * 
 *    @return {Promise} A Promise that resolves to the data. The Promise instance is abortable and exposes an `abort` method. Invoking abort on the Promise instance indirectly rejects it.
 *
 *
 * @signature `ajaxSetup( ajaxOptions )`
 *
 *    Is used to persist ajaxOptions across all ajax requests and they can be over-written in the ajaxOptions of the actual request.
 *    [https://api.jquery.com/jquery.ajaxsetup/]
 *
 *    ```js
 *    import { ajax } from "can";
 *
 *    ajax.ajaxSetup({xhrFields: {withCredentials: true}});
 *
 *    ajax({
 *      url: "http://query.yahooapis.com/v1/public/yql",
 *      data: {
 *        format: "json",
 *        q: 'select * from geo.places where text="sunnyvale, ca"'
 *      }
 *    }).then(function(response){
 *      console.log( response.query.count ); // => 2
 *    });
 *    ```
 */

// from https://gist.github.com/mythz/1334560
var xhrs = [
		function () { return new XMLHttpRequest(); },
		function () { return new ActiveXObject("Microsoft.XMLHTTP"); },
		function () { return new ActiveXObject("MSXML2.XMLHTTP.3.0"); },
		function () { return new ActiveXObject("MSXML2.XMLHTTP"); }
	],
	_xhrf = null;
// used to check for Cross Domain requests
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
	return function () { };
};

var contentTypes = {
	json: "application/json",
	form: "application/x-www-form-urlencoded"
};

var _xhrResp = function (xhr, options) {
	try{
		var type = (options.dataType || xhr.getResponseHeader("Content-Type").split(";")[0]);
		
		if(type && (xhr.responseText || xhr.responseXML)){
			
			switch (type) {
				case "text/xml":
				case "xml":
					return xhr.responseXML;
				case "text/json":
				case "application/json":
				case "text/javascript":
				case "application/javascript":
				case "application/x-javascript":
				case "json":
					return xhr.responseText && JSON.parse(xhr.responseText);
				default:
					return xhr.responseText;
			}
		} else {
			return xhr;
		}
	} catch(e){
		return xhr;
	}
};

function ajax(o) {
	var xhr = makeXhr(), timer, n = 0;
	var deferred = {}, isFormData;
	var promise = new Promise(function(resolve,reject){
		deferred.resolve = resolve;
		deferred.reject = reject;
	});
	var requestUrl;
	var isAborted = false;

	promise.abort = function () {
		isAborted = true;
		xhr.abort();
	};

	o = [{
			userAgent: "XMLHttpRequest",
			lang: "en",
			type: "GET",
			data: null,
			dataType: "json"
	}, globalSettings, o].reduce(function(a,b,i) {
		return canReflect.assignDeep(a,b);
	});

	var async = o.async !== false;

	// Set the default contentType
	if(!o.contentType) {
		o.contentType = o.type.toUpperCase() === "GET" ?
			contentTypes.form : contentTypes.json;
	}

	//how jquery handles check for cross domain
	if(o.crossDomain == null){
		try {
			requestUrl = parseURI(o.url);
			o.crossDomain = !!((requestUrl.protocol && requestUrl.protocol !== originUrl.protocol) ||
				(requestUrl.host && requestUrl.host !== originUrl.host));

		} catch (e){
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
						o.success( _xhrResp(xhr, o) );
					}
				}
				else if (o.error) {
					o.error(xhr, xhr.status, xhr.statusText);
				}
				if (o.complete) {
					o.complete(xhr, xhr.statusText);
				}

				if (xhr.status >= 200 && xhr.status < 300) {
					deferred.resolve( _xhrResp(xhr, o) );
				} else {
					deferred.reject( _xhrResp(xhr, o) );
				}
			}
			else if (o.progress) {
				o.progress(++n);
			}
		} catch(e) {
			deferred.reject(e);
		}
	};
	var url = o.url, data = null, type = o.type.toUpperCase();
	var isJsonContentType = o.contentType === contentTypes.json;
	var isPost = type === "POST" || type === "PUT";
	if (!isPost && o.data) {
		url += "?" + (isJsonContentType ? JSON.stringify(o.data) : param(o.data));
	}
	xhr.open(type, url, async);

	// For CORS to send a "simple" request (to avoid a preflight check), the following methods are allowed: GET/POST/HEAD,
	// see https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Simple_requests

	var isSimpleCors = o.crossDomain && ['GET', 'POST', 'HEAD'].indexOf(type) !== -1;
	isFormData = typeof FormData !== "undefined" && o.data instanceof FormData;

	if (isPost) {
		if (isFormData) {
			// do not set "Content-Type" let the browser handle it
			// do not stringify FormData XHR handles it natively
			data = o.data;
		} else {
			if (isJsonContentType && !isSimpleCors) {
				data = typeof o.data === "object" ? JSON.stringify(o.data) : o.data;
				xhr.setRequestHeader("Content-Type", "application/json");
			} else {
				data = param(o.data);
				// CORS simple: `Content-Type` has to be `application/x-www-form-urlencoded`:
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			}
		}
	} else {
		xhr.setRequestHeader("Content-Type", o.contentType);
	}

	// CORS simple: no custom headers, so we don't add `X-Requested-With` header:
	if (!isSimpleCors){
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	}

	if (o.xhrFields) {
		for (var f in o.xhrFields) {
			xhr[f] = o.xhrFields[f];
		}
	}

	function send () {
		if(!isAborted) {
			xhr.send(data);
		}
	}

	if(o.beforeSend){
		var result = o.beforeSend.call( o, xhr, o );
		if(canReflect.isPromise(result)) {
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
