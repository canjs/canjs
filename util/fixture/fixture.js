// needs a .then! does not steal dependencies because this needs to work with dist ...

if (!window.can || !can) {
	steal('can/util/string')
}

steal('can/util/object', function () {

	var updateSettings = function (settings, originalOptions) {
			if (!can.fixture.on) {
				return;
			}

			//simple wrapper for logging
			var log = function () {
				if (window.console && console.log) {
					console.log.apply(console, Array.prototype.slice.call(arguments));
				}
			}

			// We always need the type which can also be called method, default to GET
			settings.type = settings.type || settings.method || 'GET';

			// add the fixture option if programmed in
			var data = overwrite(settings);

			// if we don't have a fixture, do nothing
			if (!settings.fixture) {
				if (window.location.protocol === "file:") {
					log("ajax request to " + settings.url + ", no fixture found");
				}
				return;
			}

			//if referencing something else, update the fixture option
			if (typeof settings.fixture === "string" && can.fixture[settings.fixture]) {
				settings.fixture = can.fixture[settings.fixture];
			}

			// if a string, we just point to the right url
			if (typeof settings.fixture == "string") {
				var url = settings.fixture;

				if (/^\/\//.test(url)) {
					// this lets us use rootUrl w/o having steal...
					url = can.fixture.rootUrl === steal.root ?
						steal.root.mapJoin(settings.fixture.substr(2)) + '' :
						can.fixture.rootUrl + settings.fixture.substr(2);
				}

				delete settings.fixture;

				//@steal-remove-start
				log("looking for fixture in " + url);
				//@steal-remove-end

				settings.url = url;
				settings.data = null;
				settings.type = "GET";
				if (!settings.error) {
					settings.error = function (xhr, error, message) {
						throw "fixtures.js Error " + error + " " + message;
					};
				}
			}
			else {
				//@steal-remove-start
				log("using a dynamic fixture for " + settings.type + " " + settings.url);
				//@steal-remove-end

				//it's a function ... add the fixture datatype so our fixture transport handles it
				// TODO: make everything go here for timing and other fun stuff
				// add to settings data from fixture ...
				settings.dataTypes && settings.dataTypes.splice(0, 0, "fixture");

				if (data && originalOptions) {
					can.extend(originalOptions.data, data)
				}
			}
		},
		extractResponse = function(s, args) {
			var next = s.dataTypes ? s.dataTypes[0] : (s.dataType || 'json'),
				response = args;

			// normalize the fixture data into a response
			if (!can.isArray(response)) {
				var tmp = [
					{}
				];
				tmp[0][next] = response
				response = tmp;
			}

			if (typeof response[0] != 'number') {
				response.unshift(200, "success")
			}

			// make sure we provide a response type that matches the first datatype (typically json)
			if (!response[2] || !response[2][next]) {
				var tmp = {}
				tmp[next] = response[2];
				response[2] = tmp;
			}
			return response;
		};

	//used to check urls
	// check if jQuery
	if (can.ajaxPrefilter && can.ajaxTransport) {

		// the pre-filter needs to re-route the url
		can.ajaxPrefilter(updateSettings);

		can.ajaxTransport("fixture", function (s, original) {
			// remove the fixture from the datatype
			s.dataTypes.shift();

			//we'll return the result of the next data type
			var timeout, stopped = false;

			return {
				send : function (headers, callback) {
					var success = function() {
							if(stopped === false) {
								callback.apply(null, extractResponse(s, can.makeArray(arguments)));
							}
						},
						result = s.fixture(original, s, success, headers);

					if(result !== undefined) {
						timeout = setTimeout(function () {
							callback.apply(null, extractResponse(s, result));
						}, can.fixture.delay);
					}
				},
				abort : function () {
					stopped = true;
					clearTimeout(timeout)
				}
			};
		});
	} else {
		var AJAX = can.ajax;
		can.ajax = function (settings) {
			updateSettings(settings, settings);
			if (settings.fixture) {
				var timeout, d = new can.Deferred(),
					stopped = false,
					success = function() {
						var response = extractResponse(settings, can.makeArray(arguments)),
							status = response[0];

						if ( (status >= 200 && status < 300 || status === 304) && stopped === false) {
							d.resolve(response[2][settings.dataType], "success", d)
						} else {
							// TODO probably resolve better
							d.reject(settings, 'error', response[1]);
						}
					},
					result = settings.fixture(settings, settings, success, settings.headers);

				d.getResponseHeader = function () {
				}

				d.then(settings.success, settings.fail);

				d.abort = function () {
					clearTimeout(timeout);
					stopped = true;
				}

				if(result !== undefined) {
					timeout = setTimeout(function () {
						success.apply(null, extractResponse(settings, result));
					}, can.fixture.delay);
				}
				return d;
			} else {
				return AJAX(settings);
			}
		}
	}

	var typeTest = /^(script|json|test|jsonp)$/,
	// a list of 'overwrite' settings object
		overwrites = [],
	// returns the index of an overwrite function
		find = function (settings, exact) {
			for (var i = 0; i < overwrites.length; i++) {
				if ($fixture._similar(settings, overwrites[i], exact)) {
					return i;
				}
			}
			return -1;
		},
	// overwrites the settings fixture if an overwrite matches
		overwrite = function (settings) {
			var index = find(settings);
			if (index > -1) {
				settings.fixture = overwrites[index].fixture;
				return $fixture._getData(overwrites[index].url, settings.url)
			}

		},
		/**
		 * Makes an attempt to guess where the id is at in the url and returns it.
		 * @param {Object} settings
		 */
			getId = function (settings) {
			var id = settings.data.id;

			if (id === undefined && typeof settings.data === "number") {
				id = settings.data;
			}

			/*
			 Check for id in params(if query string)
			 If this is just a string representation of an id, parse
			 if(id === undefined && typeof settings.data === "string") {
			 id = settings.data;
			 }
			 //*/

			if (id === undefined) {
				settings.url.replace(/\/(\d+)(\/|$|\.)/g, function (all, num) {
					id = num;
				});
			}

			if (id === undefined) {
				id = settings.url.replace(/\/(\w+)(\/|$|\.)/g, function (all, num) {
					if (num != 'update') {
						id = num;
					}
				})
			}

			if (id === undefined) { // if still not set, guess a random number
				id = Math.round(Math.random() * 1000)
			}

			return id;
		};

	/**
	 * @plugin can/util/fixture
	 * @test can/util/fixture/qunit.html
	 *
	 * `can.fixture` intercept an AJAX request and simulates the response with a file or function.
	 * Read more about the usage in the [overview can.fixture].
	 *
	 * @param {Object|String} settings Configures the AJAX requests the fixture should
	 * intercept.  If an __object__ is passed, the object's properties and values
	 * are matched against the settings passed to can.ajax.
	 *
	 * If a __string__ is passed, it can be used to match the url and type. Urls
	 * can be templated, using <code>{NAME}</code> as wildcards.
	 *
	 * @param {Function|String} fixture The response to use for the AJAX
	 * request. If a __string__ url is passed, the ajax request is redirected
	 * to the url. If a __function__ is provided, it looks like:
	 *
	 *     fixture( originalSettings, settings, callback, headers)
	 *
	 * where:
	 *
	 *   - originalSettings - the orignal settings passed to can.ajax
	 *   - settings - the settings after all filters have run
	 *   - callback - a callback to call with the response if the fixture executes asynchronously
	 *   - headers - request headers
	 *
	 * If __null__ is passed, and there is a fixture at settings, that fixture will be removed,
	 * allowing the AJAX request to behave normally.
	 */
	var $fixture = can.fixture = function (settings, fixture) {
		// if we provide a fixture ...
		if (fixture !== undefined) {
			if (typeof settings == 'string') {
				// handle url strings
				var matches = settings.match(/(GET|POST|PUT|DELETE) (.+)/i);
				if (!matches) {
					settings = {
						url : settings
					};
				} else {
					settings = {
						url : matches[2],
						type : matches[1]
					};
				}

			}

			//handle removing.  An exact match if fixture was provided, otherwise, anything similar
			var index = find(settings, !!fixture);
			if (index > -1) {
				overwrites.splice(index, 1)
			}
			if (fixture == null) {
				return
			}
			settings.fixture = fixture;
			overwrites.push(settings)
		}
	};
	var replacer = can.replacer;

	can.extend(can.fixture, {
		// given ajax settings, find an overwrite
		_similar : function (settings, overwrite, exact) {
			if (exact) {
				return can.Object.same(settings, overwrite, {fixture : null})
			} else {
				return can.Object.subset(settings, overwrite, can.fixture._compare)
			}
		},
		_compare : {
			url : function (a, b) {
				return !!$fixture._getData(b, a)
			},
			fixture : null,
			type : "i"
		},
		// gets data from a url like "/todo/{id}" given "todo/5"
		_getData : function (fixtureUrl, url) {
			var order = [],
				fixtureUrlAdjusted = fixtureUrl.replace('.', '\\.').replace('?', '\\?'),
				res = new RegExp(fixtureUrlAdjusted.replace(replacer, function (whole, part) {
					order.push(part)
					return "([^\/]+)"
				}) + "$").exec(url),
				data = {};

			if (!res) {
				return null;
			}
			res.shift();
			can.each(order, function (name) {
				data[name] = res.shift()
			})
			return data;
		},
		/**
		 * @hide
		 * Provides a rest update fixture function
		 */
		"-restUpdate" : function (settings) {
			return [200, "succes", {
				id : getId(settings)
			}, {
				location : settings.url + "/" + getId(settings)
			}];
		},

		/**
		 * @hide
		 * Provides a rest destroy fixture function
		 */
		"-restDestroy" : function (settings, cbType) {
			return {};
		},

		/**
		 * @hide
		 * Provides a rest create fixture function
		 */
		"-restCreate" : function (settings, cbType, nul, id) {
			var id = id || parseInt(Math.random() * 100000, 10);
			return [200, "succes", {
				id : id
			}, {
				location : settings.url + "/" + id
			}];
		},

		make : function (types, count, make, filter) {
			/**
			 * @function can.fixture.make
			 * @parent can.fixture
			 *
			 * Used to make fixtures for findAll / findOne style requests.
			 *
			 * ## With can.ajax
			 *
			 *     //makes a nested list of messages
			 *     can.fixture.make(["messages","message"], 1000,
			 *      function(i, messages){
			 *       return {
			 *         subject: "This is message "+i,
			 *         body: "Here is some text for this message",
			 *         date: Math.floor( new Date().getTime() ),
			 *         parentId : i < 100 ? null : Math.floor(Math.random()*i)
			 *       }
			 *     })
			 *     //uses the message fixture to return messages limited by
			 *     // offset, limit, order, etc.
			 *     can.ajax({
			 *       url: "messages",
			 *       data: {
			 *          offset: 100,
			 *          limit: 50,
			 *          order: ["date ASC"],
			 *          parentId: 5},
			 *        },
			 *        fixture: "-messages",
			 *        success: function( messages ) {  ... }
			 *     });
			 *
			 * ## With can.Model
			 *
			 * `can.fixture.make` returns a model store that offers `findAll`, `findOne`, `create`,
			 * `update` and `destroy` fixture functions you can map to a [can.Model] Ajax request.
			 * Consider a model like this:
			 *
			 *      var Todo = can.Model({
			 *          findAll : 'GET /todos',
			 *          findOne : 'GET /todos/{id}',
			 *          create  : 'POST /todos',
			 *          update  : 'PUT /todos/{id}',
			 *          destroy : 'DELETE /todos/{id}'
			 *      }, {});
			 *
			 * And an unnamed generated fixture like this:
			 *
			 *      var store = can.fixture.make(100, function(i) {
			 *          return {
			 *              id : i,
			 *              name : 'Todo ' + i
			 *          }
			 *      });
			 *
			 * You can map can.Model requests using the return value of `can.fixture.make`:
			 *
			 *      can.fixture('GET /todos', store.findAll);
			 *      can.fixture('GET /todos/{id}', store.findOne);
			 *      can.fixture('POST /todos', store.create);
			 *      can.fixture('PUT /todos/{id}', store.update);
			 *      can.fixture('DELETE /todos/{id}', store.destroy);
			 *
			 * @param {Array|String} types An array of the fixture names or the singular fixture name.
			 * If an array, the first item is the plural fixture name (prefixed with -) and the second
			 * item is the singular name.  If a string, it's assumed to be the singular fixture name.  Make
			 * will simply add s to the end of it for the plural name. If this parameter is not an array
			 * or a String the fixture won't be added and only return the generator object.
			 * @param {Number} count the number of items to create
			 * @param {Function} make a function that will return the JavaScript object. The
			 * make function is called back with the id and the current array of items.
			 * @param {Function} filter (optional) a function used to further filter results. Used for to simulate
			 * server params like searchText or startDate.
			 * The function should return true if the item passes the filter,
			 * false otherwise. For example:
			 *
			 *
			 *     function(item, settings){
			 *       if(settings.data.searchText){
			 *            var regex = new RegExp("^"+settings.data.searchText)
			 *           return regex.test(item.name);
			 *       }
			 *     }
			 *
			 * @return {Object} A generator object providing fixture functions for *findAll*, *findOne*, *create*,
			 * *update* and *destroy*.
			 */
			var items = [], // TODO: change this to a hash
				findOne = function (id) {
					for (var i = 0; i < items.length; i++) {
						if (id == items[i].id) {
							return items[i];
						}
					}
				},
				methods = {};

			if (typeof types === "string") {
				types = [types + "s", types ]
			} else if (!can.isArray(types)) {
				filter = make;
				make = count;
				count = types;
			}

			// make all items
			can.extend(methods, {
				findAll : function (settings) {
					//copy array of items
					var retArr = items.slice(0);
					settings.data = settings.data || {};
					//sort using order
					//order looks like ["age ASC","gender DESC"]
					can.each((settings.data.order || []).slice(0).reverse(), function (name) {
						var split = name.split(" ");
						retArr = retArr.sort(function (a, b) {
							if (split[1].toUpperCase() !== "ASC") {
								if (a[split[0]] < b[split[0]]) {
									return 1;
								} else if (a[split[0]] == b[split[0]]) {
									return 0
								} else {
									return -1;
								}
							}
							else {
								if (a[split[0]] < b[split[0]]) {
									return -1;
								} else if (a[split[0]] == b[split[0]]) {
									return 0
								} else {
									return 1;
								}
							}
						});
					});

					//group is just like a sort
					can.each((settings.data.group || []).slice(0).reverse(), function (name) {
						var split = name.split(" ");
						retArr = retArr.sort(function (a, b) {
							return a[split[0]] > b[split[0]];
						});
					});


					var offset = parseInt(settings.data.offset, 10) || 0,
						limit = parseInt(settings.data.limit, 10) || (items.length - offset),
						i = 0;

					//filter results if someone added an attr like parentId
					for (var param in settings.data) {
						i = 0;
						if (settings.data[param] !== undefined && // don't do this if the value of the param is null (ignore it)
							(param.indexOf("Id") != -1 || param.indexOf("_id") != -1)) {
							while (i < retArr.length) {
								if (settings.data[param] != retArr[i][param]) {
									retArr.splice(i, 1);
								} else {
									i++;
								}
							}
						}
					}

					if (filter) {
						i = 0;
						while (i < retArr.length) {
							if (!filter(retArr[i], settings)) {
								retArr.splice(i, 1);
							} else {
								i++;
							}
						}
					}

					//return data spliced with limit and offset
					return [
						{
							"count" : retArr.length,
							"limit" : settings.data.limit,
							"offset" : settings.data.offset,
							"data" : retArr.slice(offset, offset + limit)
						}
					];
				},
				findOne : function (settings) {
					var item = findOne(getId(settings));
					return item ? [item] : [];
				},
				update : function (settings, cbType) {
					var id = getId(settings);

					// TODO: make it work with non-linear ids ..
					can.extend(findOne(id), settings.data);
					return can.fixture["-restUpdate"](settings, cbType)
				},
				destroy : function (settings, cbType) {
					var id = getId(settings);
					for (var i = 0; i < items.length; i++) {
						if (items[i].id == id) {
							items.splice(i, 1);
							break;
						}
					}

					// TODO: make it work with non-linear ids ..
					can.extend(findOne(id) || {}, settings.data);
					return can.fixture["-restDestroy"](settings, cbType)
				},
				create : function (settings, cbType) {
					var item = make(items.length, items);

					can.extend(item, settings.data);

					if (!item.id) {
						item.id = items.length;
					}

					items.push(item);

					return can.fixture["-restCreate"](settings, cbType, undefined, item.id);
				}
			});

			for (var i = 0; i < (count); i++) {
				//call back provided make
				var item = make(i, items);

				if (!item.id) {
					item.id = i;
				}
				items.push(item);
			}

			// if we have types given add them to can.fixture
			if(can.isArray(types)) {
				can.fixture["~" + types[0]] = items;
				can.fixture["-" + types[0]] = methods.findAll;
				can.fixture["-" + types[1]] = methods.findOne;
				can.fixture["-" + types[1]+"Update"] = methods.update;
				can.fixture["-" + types[1]+"Destroy"] = methods.destroy;
				can.fixture["-" + types[1]+"Create"] = methods.create;
			}

			return can.extend({
				getId: getId,
				find : function(settings){
					return findOne( getId(settings) );
				}
			}, methods);
		},
		/**
		 * @function can.fixture.rand
		 * @parent can.fixture
		 *
		 * Creates random integers or random arrays of
		 * other arrays.
		 *
		 * ## Examples
		 *
		 *     var rand = can.fixture.rand;
		 *
		 *     // get a random integer between 0 and 10 (inclusive)
		 *     rand(11);
		 *
		 *     // get a random number between -5 and 5 (inclusive)
		 *     rand(-5, 6);
		 *
		 *     // pick a random item from an array
		 *     rand(["j","m","v","c"],1)[0]
		 *
		 *     // pick a random number of items from an array
		 *     rand(["j","m","v","c"])
		 *
		 *     // pick 2 items from an array
		 *     rand(["j","m","v","c"],2)
		 *
		 *     // pick between 2 and 3 items at random
		 *     rand(["j","m","v","c"],2,3)
		 *
		 *
		 * @param {Array|Number} arr An array of items to select from.
		 * If a number is provided, a random number is returned.
		 * If min and max are not provided, a random number of items are selected
		 * from this array.
		 * @param {Number} [min] If only min is provided, min items
		 * are selected.
		 * @param {Number} [max] If min and max are provided, a random number of
		 * items between min and max (inclusive) is selected.
		 */
		rand : function (arr, min, max) {
			if (typeof arr == 'number') {
				if (typeof min == 'number') {
					return arr + Math.floor(Math.random() * (min - arr));
				} else {
					return Math.floor(Math.random() * arr);
				}

			}
			var rand = arguments.callee;
			// get a random set
			if (min === undefined) {
				return rand(arr, rand(arr.length + 1))
			}
			// get a random selection of arr
			var res = [];
			arr = arr.slice(0);
			// set max
			if (!max) {
				max = min;
			}
			//random max
			max = min + Math.round(rand(max - min))
			for (var i = 0; i < max; i++) {
				res.push(arr.splice(rand(arr.length), 1)[0])
			}
			return res;
		},
		/**
		 * @hide
		 * Use can.fixture.xhr to create an object that looks like an xhr object.
		 *
		 * ## Example
		 *
		 * The following example shows how the -restCreate fixture uses xhr to return
		 * a simulated xhr object:
		 * @codestart
		 * "-restCreate" : function( settings, cbType ) {
		 *   switch(cbType){
		 *     case "success":
		 *       return [
		 *         {id: parseInt(Math.random()*1000)},
		 *         "success",
		 *         can.fixture.xhr()];
		 *     case "complete":
		 *       return [
		 *         can.fixture.xhr({
		 *           getResponseHeader: function() { 
		 *             return settings.url+"/"+parseInt(Math.random()*1000);
		 *           }
		 *         }),
		 *         "success"];
		 *   }
		 * }
		 * @codeend
		 * @param {Object} [xhr] properties that you want to overwrite
		 * @return {Object} an object that looks like a successful XHR object.
		 */
		xhr : function (xhr) {
			return can.extend({}, {
				abort : can.noop,
				getAllResponseHeaders : function () {
					return "";
				},
				getResponseHeader : function () {
					return "";
				},
				open : can.noop,
				overrideMimeType : can.noop,
				readyState : 4,
				responseText : "",
				responseXML : null,
				send : can.noop,
				setRequestHeader : can.noop,
				status : 200,
				statusText : "OK"
			}, xhr);
		},
		/**
		 * @attribute can.fixture.on
		 * @parent can.fixture
		 *
		 * On lets you programatically turn off fixtures.  This is mostly used for testing.
		 *
		 *     can.fixture.on = false
		 *     Task.findAll({}, function(){
		 *       can.fixture.on = true;
		 *     })
		 */
		on : true
	});
	/**
	 * @attribute can.fixture.delay
	 * @parent can.fixture
	 *
	 * Sets the delay in milliseconds between an ajax request is made and
	 * the success and complete handlers are called.  This only sets
	 * functional fixtures.  By default, the delay is 200ms.
	 * @codestart
	 * steal('can/util/fixtures').then(function(){
	 *   can.fixture.delay = 1000;
	 * })
	 * @codeend
	 */
	can.fixture.delay = 200;

	/**
	 * @attribute can.fixture.rootUrl
	 * @parent can.fixture
	 *
	 * The root URL for fixtures to use.
	 * If you are using StealJS it will use the Steal root
	 * URL by default.
	 */
	can.fixture.rootUrl = window.steal ? steal.root : undefined;

	can.fixture["-handleFunction"] = function (settings) {
		if (typeof settings.fixture === "string" && can.fixture[settings.fixture]) {
			settings.fixture = can.fixture[settings.fixture];
		}
		if (typeof settings.fixture == "function") {
			setTimeout(function () {
				if (settings.success) {
					settings.success.apply(null, settings.fixture(settings, "success"));
				}
				if (settings.complete) {
					settings.complete.apply(null, settings.fixture(settings, "complete"));
				}
			}, can.fixture.delay);
			return true;
		}
		return false;
	};

	//Expose this for fixture debugging
	can.fixture.overwrites = overwrites;
});
