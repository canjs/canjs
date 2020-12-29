var canRoute = require("can-route");
var QUnit = require("steal-qunit");

function getMsg(routes, input, method, output) {
	var msg = "[ ";

	msg += routes.map(function(route) {
		return	route[0];
	}).join(" | ");

	msg += " ] - ";

	msg += JSON.stringify(input) + method + " " + JSON.stringify(output);

	return msg;
}

QUnit.module("can-route .param and .deparam",{
	beforeEach: function(assert) {
		canRoute.defaultBinding = "hashchange";
		canRoute.routes = {};
	}
});

QUnit.test("param / deparam / rule", function(assert) {
	var testCases = [
		{
			routes: [],
			assertions: [
				{
					// deparam of url with non-generated hash (manual override)
					method: "deparam",
					input:"page=foo&bar=baz&where=there",
					output: { page: "foo", bar: "baz", where: "there" }
				},
				{
					method: "param",
					input: { page: "foo", bar: "baz", where: "there" },
					output: "&page=foo&bar=baz&where=there"
				},
				{
					method: "param",
					input: {},
					output: ""
				},
				{
					// symmetric param then deparam
					method: "param",
					input: { page: "=&[]", nestedArray: [ "a" ], nested: { a: "b" } },
					symmetric: true
				}
			]
		},
		{
			routes: [
				[ "{page}", { page: "index" } ]
			],
			assertions: [
				{
					method: "deparam",
					input: "can.Control",
					output: { page: "can.Control" }
				},
				{
					method: "rule",
					input: "can.Control",
					output: "{page}"
				},
				{
					method: "deparam",
					input: "",
					output: { page: "index" }
				},
				{
					method: "rule",
					input: "",
					output: "{page}"
				},
				{
					method: "deparam",
					input: "can.Control&where=there",
					output: { page: "can.Control", where: "there" }
				},
				{
					method: "rule",
					input: "can.Control&where=there",
					output: "{page}"
				},
				{
					method: "param",
					input: { page: "index" },
					output: ""
				}
			]
		},
		{
			routes: [
				[ "{page}/{section}", { page: "index", section: "foo" } ]
			],
			assertions: [
				// default value and queryparams
				{
					method: "deparam",
					input: "can.Control/&where=there",
					output: { page: "can.Control", section: "foo", where: "there" }
				},
				{
					method: "rule",
					input: "can.Control/&where=there",
					output: "{page}/{section}"
				},
				// strange characters
				{
					method: "deparam",
					input: ("foo/" + encodeURIComponent("\/")),
					output: { page: "foo", section: "\/" }
				},
				{
					input: { page: "bar", section: "\/" },
					method: "param",
					output: ("bar/" + encodeURIComponent("\/"))
				},
				{
					method: "param",
					input: { page: "can.Control", section: "document", bar: "baz", where: "there" },
					symmetric: true
				},
				{
					method: "param",
					input: { page: "can.Control", section: "foo", bar: "baz", where: "there" },
					symmetric: true
				},
				// slashes and spaces
				{
					method: "param",
					input: { page: " a ", section: " / " },
					symmetric: true
				},
				{
					method: "deparam",
					input: "/",
					output: { page: "index", section: "foo" }
				},
				{
					method: "rule",
					input: "/",
					output: "{page}/{section}"
				},
				{
					method: "param",
					input: { page: "index", section: "foo", bar: "baz", where: "there" },
					symmetric: true
				},
				{
					method: "param",
					input: { page: "foo", bar: "baz", where: "there" },
					symmetric: true
				},
				// empty slash
				{
					method: "param",
					input: { page: "index", section: "foo" },
					output: "/"
				},
			]
		},
		// deparam of invalid url
		{
			routes: [
				[ "pages/{page}/{section}/{subsection}", { page: "default1", section: "default2", subsection: "default3" } ]
			],
			assertions: [
				{
					// path does not match the registered route, and since the hash is not a &key=value list there should not be data
					method: "deparam",
					input: "pages//",
					output: {}
				},
				{
					// A valid path with invalid parameters should return the path data but ignore the parameters
					method: "deparam",
					input: "pages/val1/val2/val3&invalid-parameters",
					output: { page: "val1", section: "val2", subsection: "val3" }
				},
				{
					// A valid path with invalid parameters should return the correct rule
					method: "rule",
					input: "pages/val1/val2/val3&invalid-parameters",
					output: "pages/{page}/{section}/{subsection}"
				}
			]
		},
		{
			routes: [
				[ "pages/{page}", { page: "index" } ]
			],
			assertions: [
				{
					method: "param",
					input: { page: "foo" },
					output: "pages/foo"
				},
				{
					method: "param",
					input: { page: "foo", index: "bar" },
					output: "pages/foo&index=bar"
				}
			]
		},
		{
			routes: [
				[ "pages/{page}", { section: "foo" } ]
			],
			assertions: [
				// param doesn't add defaults to params
				{
					method: "param",
					input: { page: "index", section: "foo" },
					output: "pages/index"
				}
			]
		},
		// param
		{
			routes: [
				[ "pages/{page}", { page: "index" } ],
				[ "pages/{page}/{section}", { page: "index", section: "bar" } ]
			],
			assertions: [
				{
					method: "param",
					input: { page: "foo", section: "bar", where: "there" },
					output: "pages/foo/&where=there"
				},
				{
					// There is no matching route so the hash should be empty
					method: "param",
					input: {},
					output: ""
				},
			]
		},
		// param - :page syntax
		{
			routes: [
				[ "pages/:page", { page: "index" } ],
				[ "pages/:page/:section", { page: "index", section: "bar" } ]
			],
			assertions: [
				{
					method: "param",
					input: { page: "foo", section: "bar", where: "there" },
					output: "pages/foo/&where=there"
				},
				{
					// There is no matching route so the hash should be empty
					method: "param",
					input: {},
					output: ""
				}
			]
		},
		{
			routes: [
				[ "{page}", { page: "index" } ],
				[ "pages/{page}/{section}/{subsection}", { page: "index", section: "foo", subsection: "bar" } ]
			],
			assertions: [
				{
					method: "param",
					input: { page: "index", section: "foo", subsection: "bar" },
					output: "pages///"
				},
				{
					method: "param",
					input: { page: "index", section: "baz", subsection: "bar" },
					output: "pages//baz/"
				}
			]
		},
		// precedent
		{
			routes: [
				[ "{page}", { page: "index" } ],
				[ "search/{section}" ]
			],
			assertions: [
				{
					input: { page: "can.Control" },
					method: "param",
					output: "can.Control",
					symmetric: true
				},
				{
					method: "rule",
					input: "can.Control",
					output: "{page}"
				},
				// bad deparam
				{
					input: "search/can.Control",
					method: "deparam",
					output: { section: "can.Control" }
				},
				{
					input: "search/can.Control",
					method: "rule",
					output: "search/{section}"
				},
				{
					input: { section: "can.Control" },
					method: "param",
					output: "search/can.Control"
				}
			]
		},
		{
			routes: [
				[ "{page}", { page: "index" } ],
				[ "{page}/{section}" ]
			],
			assertions: [
				// better matching precedent
				{
					method: "param",
					input: { page: "foo", section: "bar" },
					output: "foo/bar"
				},
				// handles falsey values
				// handles ""
				{
					method: "param",
					input: { page: "home", section: "" },
					output: "home/"
				},
				{
					method: "deparam",
					input: "home/",
					output: {}
				},
				{
					method: "rule",
					input: "home/",
					output: undefined
				},
				// handles false
				{
					method: "param",
					input: { page: "home", section: false },
					output: "home/false"
				},
				{
					method: "deparam",
					input: "home/false",
					output: { page: "home", section: "false" }
				},
				{
					method: "rule",
					input: "home/false",
					output: "{page}/{section}"
				},
				// handles null
				{
					method: "param",
					input: { page: "home", section: null },
					output: "home/null"
				},
				{
					method: "deparam",
					input: "home/null",
					output: { page: "home", section: "null" }
				},
				{
					method: "rule",
					input: "home/null",
					output: "{page}/{section}"
				},
				// handles undefined
				{
					method: "param",
					input: { page: "home", section: undefined },
					output: "home/"
				},
				{
					method: "deparam",
					input: "home/undefined",
					output: { page: "home", section: "undefined" }
				},
				{
					method: "rule",
					input: "home/undefined",
					output: "{page}/{section}"
				},
				// handles 0
				{
					method: "param",
					input: { page: "home", section: 0 },
					output: "home/0"
				},
				{
					method: "deparam",
					input: "home/0",
					output: { page: "home", section: "0" }
				},
				{
					method: "rule",
					input: "home/0",
					output: "{page}/{section}"
				}
			]
		},
		// param with currentRoute name
		{
			routes: [
				[ "page" ],
				[ "section" ]
			],
			assertions: [
				{
					method: "param",
					input: [ { section: "abc" }, "section" ],
					output: "section&section=abc"
				}
			]
		},
		// route endings
		{
			routes: [
				[ "foo", { foo: true } ],
				[ "food", { food: true } ]
			],
			assertions: [
				{
					input: "food",
					method: "deparam",
					output: { food: true }
				}
			]
		},
		// empty default is matched even if last
		{
			routes: [
				[ "{who}" ],
				[ "", { foo: "bar" } ]
			],
			assertions: [
				{
					input: "",
					method: "deparam",
					output: { foo: "bar" } },
				{
					input: "",
					method: "rule",
					output: ""
				}
			]
		},
		// order matched
		{
			routes: [
				[ "{page}" ],
				[ "{section}" ]
			],
			assertions: [
				{
					input: "abc",
					method: "deparam",
					output: { page: "abc" }
				},
				{
					input: "abc",
					method: "rule",
					output: "{page}"
				}
			]
		},
		// param order matching
		{
			routes: [
				[ "", { page: "foo" } ],
				[ "something/{page}" ]
			],
			assertions: [
				{
					// picks the shortest, best match
					method: "param",
					input: { page: "foo" },
					output: ""
				}
			]
		},
		{
			routes: [
				[ "{page}", { page: "recipe1", section: "task3" } ],
				[ "{page}/{section}", { page: "recipe1", section: "task3" } ]
			],
			assertions: [
				{
					// picks the first match of everything
					method: "param",
					input: { page: "recipe1", section: "task3" },
					output: ""
				},
				{
					method: "param",
					input: { page: "recipe1", section: "task2" },
					output: "/task2"
				},
			]
		},
		// dashes in routes
		{
			routes: [
				[ "{page}-{section}" ]
			],
			assertions: [
				{
					method: "deparam",
					input: "abc-def",
					output: { page: "abc", section: "def" }
				}
			]
		}
	];

	testCases.forEach(function(testCase) {
		// re-initialize routes
		canRoute.routes = {};

		// register all the routes
		testCase.routes.forEach(function(routeArgs) {
			canRoute.register.apply(canRoute, routeArgs);
		});

		// run all the assertions
		testCase.assertions.forEach(function(assertion) {
			var method = assertion.method;
			var input = Array.isArray(assertion.input) ? assertion.input : [ assertion.input ];
			var actual = canRoute[method].apply(canRoute, input);

			if ("output" in assertion) {
				assert.deepEqual(actual, assertion.output,
					getMsg(testCase.routes, assertion.input, " --" + assertion.method + "-->", assertion.output)
				);
			}

			if (assertion.symmetric) {
				var reverseMethod = method.indexOf("de") === 0 ? method.slice(2) : "de" + method;
				assert.deepEqual(canRoute[reverseMethod].call(canRoute, actual), assertion.input,
					getMsg(testCase.routes, assertion.input, " <---> ", actual)
				);
			}
		});
	});
});
