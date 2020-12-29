
var ajax = require('./can-ajax');
var namespace = require("can-namespace");
var makeMap = require('can-make-map');
var GLOBAL = require("can-globals/global/global");
var parseURI = require('can-parse-uri');

var QUnit = require('./test/qunit');
var helpers = require('./test/helpers');
var isMainCanTest = typeof System === 'object' && System.env !== 'canjs-test';
var hasLocalServer = !helpers.isServer() && !helpers.isProduction();

QUnit.module("can-ajax");

var makeFixture = function(XHR){

	var oldXhr = window.XMLHttpRequest || window.ActiveXObject;
	if (window.XMLHttpRequest) {
		window.XMLHttpRequest = XHR;
	} else if (window.ActiveXObject) {
		window.ActiveXObject = XHR;
	}

	return function restoreXHR(){
		if (window.XMLHttpRequest) {
			window.XMLHttpRequest = oldXhr;
		} else if (window.ActiveXObject) {
			window.ActiveXObject = oldXhr;
		}
	};
};

// A helper to make a predicate for a given comma-separated list that checks whether it contains a given value:
var makePredicateContains = function (str){
	var obj = makeMap(str);
	return function(val){
		return obj[val];
	};
};

if (hasLocalServer) {
	QUnit.test('basic get request', function (assert) {
		var done = assert.async();
		ajax({
			type: "get",
			url: __dirname+"/can-ajax-test-result.json"
		}).then(function(resp){
			assert.equal(resp.message, "VALUE");
			done();
		});
	});

	QUnit.test("synchronous get request", function(assert) {
		var done = assert.async();
		var ok = true;
		ajax({
			type: "get",
			url: __dirname+"/can-ajax-test-result.json",
			async: false,
			success: function(){
				assert.ok(ok, "Callback happens before returning.");
			}
		}).then(function(){
			assert.ok(!ok, "Promise resolves after returning");
			done();
		});

		ok = false;
	});
}

QUnit.test("added to namespace (#99)", function (assert) {
	assert.equal(namespace.ajax, ajax);
});

if (hasLocalServer) {
	QUnit.test("GET requests with dataType parse JSON (#106)", function (assert) {
		var done = assert.async();
		ajax({
			type: "get",
			url: __dirname+"/can-ajax-test-result.txt",
			dataType: "json"
		}).then(function(resp){
			assert.equal(resp.message, "VALUE");
			done();
		});
	});
}

QUnit.test("ignores case of type parameter for a post request (#100)", function (assert) {
	var done = assert.async();
	var requestHeaders = {
			CONTENT_TYPE: "Content-Type"
		},
		restore = makeFixture(function () {
			this.open = function (type, url) {
			};

			this.send = function () {
				this.readyState = 4;
				this.status = 200;
				this.onreadystatechange();
			};

			this.setRequestHeader = function (header, value) {
				if (header === requestHeaders.CONTENT_TYPE) {
					var o = {};
					o[header] = value;
					this.responseText = JSON.stringify(o);
				}
			};
		});



	ajax({
		type: "post",
		url: "http://anotherdomain.com/foo",
		data: {
			bar: "qux"
		}
	}).then(function (value) {
		assert.equal(value[requestHeaders.CONTENT_TYPE], "application/x-www-form-urlencoded");
	}, function (reason) {
		assert.notOk(reason, "request failed with reason = ", reason);
	}).then(function () {
		// restore original values
		restore();
		done();
	});
});

QUnit.test("url encodes GET requests when no contentType", function(assert) {
	var done = assert.async();
	var restore = makeFixture(function () {
		var o = {};
		this.open = function (type, url) {
			o.url = url;
		};

		this.send = function (data) {
			o.data = data;
			this.readyState = 4;
			this.status = 200;
			this.responseText = JSON.stringify(o);
			this.onreadystatechange();
		};

		this.setRequestHeader = function (header, value) {
			if (header === "Content-Type") {
				o[header] = value;
			}
		};
	});

	ajax({
		type: "get",
		url: "http://anotherdomain.com/foo",
		data: { foo: "bar" }
	}).then(function(value){
		assert.equal(value["Content-Type"], "application/x-www-form-urlencoded");
		assert.equal(value.data, undefined, "No data provided because it's a GET");
		assert.equal(value.url, "http://anotherdomain.com/foo?foo=bar");
	}, function (reason) {
		assert.notOk(reason, "request failed with reason = ", reason);
	})
	.then(function(){
		restore();
		done();
	});
});

QUnit.test("Stringifies GET requests when contentType=application/json", function(assert) {
	var done = assert.async();
	var restore = makeFixture(function () {
		var o = {};
		this.open = function (type, url) {
			o.url = url;
		};

		this.send = function (data) {
			o.data = data;
			this.readyState = 4;
			this.status = 200;
			this.responseText = JSON.stringify(o);
			this.onreadystatechange();
		};

		this.setRequestHeader = function (header, value) {
			if (header === "Content-Type") {
				o[header] = value;
			}
		};
	});

	ajax({
		type: "get",
		url: "http://anotherdomain.com/foo",
		data: { foo: "bar" },
		contentType: "application/json"
	}).then(function(value){
		assert.equal(value["Content-Type"], "application/json");
		assert.equal(value.data, undefined, "No data provided because it's a GET");
		assert.equal(value.url, 'http://anotherdomain.com/foo?{"foo":"bar"}');
	}, function (reason) {
		assert.notOk(reason, "request failed with reason = ", reason);
	})
	.then(function(){
		restore();
		done();
	});

});

QUnit.test("Stringifies POST requests when there is no contentType", function(assert) {
	var done = assert.async();
	var restore = makeFixture(function () {
		var o = {};
		this.open = function (type, url) {
			o.url = url;
		};

		this.send = function (data) {
			o.data = data;
			this.readyState = 4;
			this.status = 200;
			this.responseText = JSON.stringify(o);
			this.onreadystatechange();
		};

		this.setRequestHeader = function (header, value) {
			if (header === "Content-Type") {
				o[header] = value;
			}
		};
	});

	var origin = parseURI(GLOBAL().location.href);
	var url = origin.protocol + origin.authority + "/foo";

	ajax({
		type: "post",
		url: url,
		data: { foo: "bar" }
	}).then(function(value){
		assert.equal(value["Content-Type"], "application/json");
		assert.equal(value.data, '{"foo":"bar"}', "Data was stringified");
		assert.equal(value.url, url);
	}, function (reason) {
		assert.notOk(reason, "request failed with reason = ", reason);
	})
	.then(function(){
		restore();
		done();
	});
});

QUnit.test("url encodes POST requests when contentType=application/x-www-form-urlencoded", function (assert) {
	var done = assert.async();
	// test that contentType is application/blah
	var restore = makeFixture(function () {
		var o = {};
		this.open = function (type, url) {
			o.url = url;
		};

		this.send = function (data) {
			o.data = data;
			this.readyState = 4;
			this.status = 200;
			this.responseText = JSON.stringify(o);
			this.onreadystatechange();
		};

		this.setRequestHeader = function (header, value) {
			if (header === "Content-Type") {
				o[header] = value;
			}
		};
	});

	ajax({
		type: "post",
		url: "http://anotherdomain.com/foo",
		data: { foo: "bar" },
		contentType: "application/x-www-form-urlencoded"
	}).then(function(value){
		assert.equal(value["Content-Type"], "application/x-www-form-urlencoded");
		assert.equal(value.data, 'foo=bar', "Data was url encoded");
		assert.equal(value.url, 'http://anotherdomain.com/foo');
	}, function (reason) {
		assert.notOk(reason, "request failed with reason = ", reason);
	})
	.then(function(){
		restore();
		done();
	});
});

if(typeof XDomainRequest === 'undefined') {

	QUnit.test("cross domain post request should change data to form data (#90)", function (assert) {
		var done = assert.async();
		var headers = {},
			restore = makeFixture(function () {
				this.open = function (type, url) {};

				this.send = function () {
					this.readyState = 4;
					this.status = 204;
					this.responseText = '';
					this.onreadystatechange();
				};

				this.setRequestHeader = function (header, value) {
					headers[header] = value;
				};
			});
		ajax({
			type: "POST",
			url: "https://httpbin.org/post",
			data: {'message': 'VALUE'},
			dataType: 'application/json'
		}).then(function(resp){
			assert.deepEqual(headers, {"Content-Type": "application/x-www-form-urlencoded"});

			restore();
			done();
		});


	});


	// Test simple GET CORS:
	QUnit.test("GET CORS should be a simple request - without a preflight (#187)", function (assert) {
		var done = assert.async();

		// CORS simple requests: https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS#Simple_requests
		var isSimpleRequest = true, restore;
		var isSimpleMethod = makePredicateContains("GET,POST,HEAD");
		var isSimpleHeader = makePredicateContains("Accept,Accept-Language,Content-Language,Content-Type,DPR,Downlink,Save-Data,Viewport-Width,Width");
		var isSimpleContentType = makePredicateContains("application/x-www-form-urlencoded,multipart/form-data,text/plain");

		restore = makeFixture(function () {
			this.open = function (type, url) {
				if (!isSimpleMethod(type)){
					isSimpleRequest = false;
				}
			};

			var response = {};
			this.send = function () {
				this.responseText = JSON.stringify(response);
				this.readyState = 4;
				this.status = 200;
				this.onreadystatechange();
			};

			this.setRequestHeader = function (header, value) {
				if (header === "Content-Type" && !isSimpleContentType(value)){
					isSimpleRequest = false;
				}
				if (isSimpleRequest && !isSimpleHeader(header)){
					isSimpleRequest = false;
				}
				response[header] = value;
			};
		});

		ajax({
			url: "http://query.yahooapis.com/v1/public/yql",
			data: {
				q: 'select * from geo.places where text="sunnyvale, ca"',
				format: "json"
			}
		}).then(function(response){
			assert.ok(isSimpleRequest, "CORS GET is simple");
			restore();
			done();
		}, function(err){
			assert.ok(false, "Should be resolved");
			restore();
			done();
		});
	});
}

if(isMainCanTest && hasLocalServer) {
	// Brittle in IE 9
	QUnit.test("abort", function (assert) {
		var done = assert.async();
		var promise = ajax({
			type: "get",
			url: __dirname+"/can-ajax-test-result.json"
		});
		promise.catch(function(xhr) {
			if(xhr instanceof Error) {
				// IE9 - see http://stackoverflow.com/questions/7287706/ie-9-javascript-error-c00c023f
				assert.equal(xhr.message, 'Could not complete the operation due to error c00c023f.');
				done();
			} else {
				setTimeout(function() {
					assert.equal(xhr.readyState, 0, "aborts the promise");
					done();
				}, 50);
			}
		});
		promise.abort();
	});
}

QUnit.test("crossDomain is true for relative requests", function (assert) {
	var done = assert.async();
	var headers = {},
		restore = makeFixture(function () {
			this.open = function (type, url) {
			};

			this.send = function () {
				this.readyState = 4;
				this.status = 200;
				this.responseText = JSON.stringify({great: "success"});
				this.onreadystatechange();
			};

			this.setRequestHeader = function (header, value) {
				headers[header] = value;
			};
		});

	ajax({
		type: "post",
		url: "/foo",
		data: {
			bar: "qux"
		},
		dataType: "json"
	}).then(function (value) {
		assert.deepEqual(headers, {
			"Content-Type": "application/json",
			"X-Requested-With": "XMLHttpRequest"});
	}, function (reason) {
		assert.notOk(reason, "request failed with reason = ", reason);
	}).then(function () {
		// restore original values
		restore();
		done();
	});
});

QUnit.test("handles 204 No Content responses when expecting JSON", function (assert) {
	var done = assert.async();
	var headers = {},
		restore = makeFixture(function () {
			this.open = function (type, url) {};

			this.send = function () {
				this.readyState = 4;
				this.status = 204;
				this.responseText = '';
				this.onreadystatechange();
			};

			this.setRequestHeader = function (header, value) {
				headers[header] = value;
			};
		});

	ajax({
		type: "delete",
		url: "/foo",
		data: {
			id: "qux"
		},
		dataType: "json"
	}).then(function () {
		assert.deepEqual(headers, {
			"Content-Type": "application/json",
			"X-Requested-With": "XMLHttpRequest"});
	}, function (reason) {
		assert.notOk(reason, "request failed with reason = ", reason);
	}).then(function () {
		// restore original values
		restore();
		done();
	});
});

QUnit.test("handles responseText containing text when expecting JSON (#46)", function (assert) {
	var done = assert.async();
	var NOT_FOUND_CODE = 404;
	var NOT_FOUND_MSG = "NOT FOUND";
	var headers = {},
		restore = makeFixture(function () {
			this.open = function (type, url) {};

			this.send = function () {
				this.readyState = 4;
				this.status = NOT_FOUND_CODE;
				this.responseText = NOT_FOUND_MSG;
				this.onreadystatechange();
			};

			this.setRequestHeader = function (header, value) {
				headers[header] = value;
			};
		});

	ajax({
		type: "get",
		url: "/foo",
		dataType: "json"
	}).then(function (value) {
		assert.notOk(value, "success callback call not expected");
	}, function (xhr) {
		assert.equal(xhr.status, 404);
		assert.equal(xhr.responseText, NOT_FOUND_MSG);
	}).then(function () {
		// restore original values
		restore();
		done();
	});
});

if (hasLocalServer) {
	QUnit.test("correctly serializes null and undefined values (#177)", function (assert) {
		var done = assert.async();
		ajax({
			type: "get",
			url: __dirname + "/can-ajax-test-result.txt",
			data: {
				foo: null
			}
		}).then(function (resp) {
			assert.equal(resp.message, "VALUE");
			done();
		});
	});
}


QUnit.test("It doesn't stringify FormData", function(assert) {
	var done = assert.async();

	var formData = new FormData();
	formData.append('foo', 'bar');

	var restore = makeFixture(function () {
		var o = {};
		this.open = function (type, url) {
			o.url = url;
		};

		this.send = function (data) {
			o.data = data;
			this.readyState = 4;
			this.status = 200;
			this.responseText = JSON.stringify(o);
			this.onreadystatechange();
		};

		this.setRequestHeader = function (header, value) {
			if (header === "Content-Type") {
				o[header] = value;
			}
		};
	});

	var origin = parseURI(GLOBAL().location.href);
	var url = origin.protocol + origin.authority + "/foo";

	ajax({
		type: "post",
		url: url,
		data: formData
	}).then(function(value){
		assert.equal(value.url, url);
		assert.equal(
			typeof value["Content-Type"],
			"undefined",
			"Content-Type should not be set"
		);
	}, function (reason) {
		assert.notOk(reason, "request failed with reason = ", reason);
	})
	.then(function(){
		restore();
		done();
	});
});

QUnit.test("abort", function (assert) {
	var done = assert.async();
	var restore = makeFixture(function () {
		var aborted = false;
		this.open = function (type, url) {};
		this.setRequestHeader = function (header, value) {};
		this.send = function () {};
		this.abort = function() {
			assert.ok(true, 'called the underlying XHR.abort');
			restore();
			done();
		};
	});

	var request = ajax({
		url: "/foo"
	});

	request.abort();
});

QUnit.test("abort prevents sending if beforeSend is not finished", function (assert) {
	var done = assert.async();
	var restore = makeFixture(function () {
		var aborted = false;
		this.open = function (type, url) {};
		this.setRequestHeader = function (header, value) {};
		this.abort = function() {
			assert.ok(true, 'XHR abort was called');
		};
		this.send = function () {
			assert.notOk(true, 'should not have been called');
		};
	});

	var request = ajax({
		url: "/foo",
		beforeSend: function (xhr){
			return new Promise(function(resolve) {
				setTimeout(resolve, 1);
			});
		}
	});

	request.abort();

	setTimeout(function() {
		restore();
		done();
	}, 10);
});

QUnit.test("beforeSend", function (assert) {
	var done = assert.async();
	var headers = {},
		restore = makeFixture(function () {
			this.open = function (type, url) {};

			this.send = function () {
				this.readyState = 4;
				this.status = 204;
				this.responseText = '';
				this.onreadystatechange();
			};

			this.setRequestHeader = function (header, value) {
				headers[header] = value;
			};
		});

	ajax({
		type: "post",
		url: "/foo",
		data: {
			id: "qux"
		},
		dataType: "json",
		xhrFields: {
			'CustomHeader': 'CustomValue'
		},
		beforeSend: function (xhr){
			assert.ok(xhr.hasOwnProperty('CustomHeader'), "xhrField header set");
			xhr.setRequestHeader("Authorization", "Bearer 123");
		}
	}).then(function (value) {
		assert.ok(headers.hasOwnProperty('Authorization'), "authorization header set");
	}, function (reason) {
		assert.notOk(reason, "request failed with reason = ", reason);
	}).then(function () {
		// restore original values
		restore();
		done();
	});
});

QUnit.test("beforeSend async", function (assert) {
	var done = assert.async();
	var headers = {};
	var restore = makeFixture(function () {
		this.open = function (type, url) {};

		this.send = function () {
			this.readyState = 4;
			this.status = 204;
			this.responseText = '';
			this.onreadystatechange();
		};

		this.setRequestHeader = function (header, value) {
			headers[header] = value;
		};
	});

	ajax({
		url: "/foo",
		beforeSend: function (xhr){
		    return new Promise(function(resolve) {
				setTimeout(function() {
					xhr.setRequestHeader("Authorization", "Bearer 123");
					resolve();
				}, 1);
			});
		}
	}).then(function (value) {
		assert.ok(headers.hasOwnProperty('Authorization'), "authorization header set");
	}, function (reason) {
		assert.notOk(reason, "request failed with reason = ", reason);
	}).then(function() {
		restore();
		done();
	});
});

QUnit.test("beforeSend rejects the ajax promise on failure", function (assert) {
	var done = assert.async();
	var error = new Error();
	var restore = makeFixture(function () {
		this.open = function (type, url) {};
		this.send = function () {
			assert.notOk(true, 'Should not be called');
		};
		this.setRequestHeader = function (header, value) {};
	});

	ajax({
		url: "/foo",
		beforeSend: function (xhr){
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					reject(error);
				}, 1);
			});
		}
	}).then(function (value) {
		assert.notOk(true, "request should have rejected");
	}, function (reason) {
		assert.ok(true, "request rejected");
		assert.equal(reason, error, "error is what we expect");
	}).then(function() {
		restore();
		done();
	});
});

QUnit.test("async should be always true #51", function(assert){
	var done = assert.async();
	var headers = {},
		restore = makeFixture(function () {
			this.open = function (type, url, async) {
				assert.ok(async);
			};

			this.send = function () {
			    this.readyState = 4;
			    this.status = 204;
			    this.responseText = '';
			    this.onreadystatechange();
		    };

			this.setRequestHeader = function (header, value) {
				headers[header] = value;
			};
	});

	ajax({
		type: "get",
		url: "/ep"
	}).then(function () {
		restore();
		done();
	});
});
