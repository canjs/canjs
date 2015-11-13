steal("can/view/bindings", "can/map", "can/test", "can/component", "can/view/mustache", "can/view/stache", "steal-qunit", function () {
	QUnit.module('can/view/bindings', {
		setup: function () {
			document.getElementById("qunit-fixture").innerHTML = "";
		}
	});

	var foodTypes = new can.List([{
		title: "Fruits",
		content: "oranges, apples"
	}, {
		title: "Breads",
		content: "pasta, cereal"
	}, {
		title: "Sweets",
		content: "ice cream, candy"
	}]);

	if(typeof document.getElementsByClassName === 'function') {
		test("can-event handlers", function () {
			//expect(12);
			var ta = document.getElementById("qunit-fixture");
			var template = can.view.stache("<div>" +
			"{{#each foodTypes}}" +
			"<p can-click='doSomething'>{{content}}</p>" +
			"{{/each}}" +
			"</div>");



			function doSomething(foodType, el, ev) {
				ok(true, "doSomething called");
				equal(el[0].nodeName.toLowerCase(), "p", "this is the element");
				equal(ev.type, "click", "1st argument is the event");
				equal(foodType, foodTypes[0], "2nd argument is the 1st foodType");

			}

			var frag = template({
				foodTypes: foodTypes,
				doSomething: doSomething
			});

			ta.appendChild(frag);
			var p0 = ta.getElementsByTagName("p")[0];
			can.trigger(p0, "click");

		});

		test("can-event special keys", function(){
			var scope = new can.Map({
				test: "testval"
			});
			var ta = document.getElementById("qunit-fixture");
			can.Component.extend({
				tag: "can-event-args-tester",
				scope: scope
			});
			var template = can.view.mustache("<div>" +
			"{{#each foodTypes}}" +
			"<can-event-args-tester class='with-args' can-click='{withArgs @event @element @viewModel @viewModel.test . title content=content}'/>" +
			"{{/each}}" +
			"</div>");

			function withArgs(ev1, el1, compScope, testVal, context, title, hash) {
				ok(true, "withArgs called");
				equal(el1[0].nodeName.toLowerCase(), "can-event-args-tester", "@element is the event's DOM element");
				equal(ev1.type, "click", "@event is the click event");
				equal(scope, compScope, "Component scope accessible through @viewModel");
				equal(testVal, scope.attr("test"), "Attributes accessible");
				equal(context.title, foodTypes[0].title, "Context passed in");
				equal(title, foodTypes[0].title, "Title passed in");
				equal(hash.content, foodTypes[0].content, "Args with = passed in as a hash");
			}

			var frag = template({
				foodTypes: foodTypes,
				withArgs: withArgs
			});
			ta.innerHTML = "";
			ta.appendChild(frag);
			var p0 = ta.getElementsByClassName("with-args")[0];
			can.trigger(p0, "click");
		});

		test("(event) handlers", function () {
			//expect(12);
			var ta = document.getElementById("qunit-fixture");
			var template = can.view.stache("<div>" +
			"{{#each foodTypes}}" +
			"<p ($click)='doSomething'>{{content}}</p>" +
			"{{/each}}" +
			"</div>");

			var foodTypes = new can.List([{
				title: "Fruits",
				content: "oranges, apples"
			}, {
				title: "Breads",
				content: "pasta, cereal"
			}, {
				title: "Sweets",
				content: "ice cream, candy"
			}]);

			function doSomething(foodType, el, ev) {
				ok(true, "doSomething called");
				equal(el[0].nodeName.toLowerCase(), "p", "this is the element");
				equal(ev.type, "click", "1st argument is the event");
				equal(foodType, foodTypes[0], "2nd argument is the 1st foodType");

			}

			var frag = template({
				foodTypes: foodTypes,
				doSomething: doSomething
			});

			ta.appendChild(frag);
			var p0 = ta.getElementsByTagName("p")[0];
			can.trigger(p0, "click");


			var scope = new can.Map({
				test: "testval"
			});
			can.Component.extend({
				tag: "fancy-event-args-tester",
				scope: scope
			});
			template = can.view.mustache("<div>" +
			"{{#each foodTypes}}" +
			"<fancy-event-args-tester class='with-args' (click)='withArgs @event @element @viewModel @viewModel.test . title content=content'/>" +
			"{{/each}}" +
			"</div>");
			function withArgs(ev1, el1, compScope, testVal, context, title, hash) {
				ok(true, "withArgs called");
				equal(el1[0].nodeName.toLowerCase(), "fancy-event-args-tester", "@element is the event's DOM element");
				equal(ev1.type, "click", "@event is the click event");
				equal(scope, compScope, "Component scope accessible through @viewModel");
				equal(testVal, scope.attr("test"), "Attributes accessible");
				equal(context.title, foodTypes[0].title, "Context passed in");
				equal(title, foodTypes[0].title, "Title passed in");
				equal(hash.content, foodTypes[0].content, "Args with = passed in as a hash");
			}

			frag = template({
				foodTypes: foodTypes,
				withArgs: withArgs
			});
			ta.innerHTML = "";
			ta.appendChild(frag);
			p0 = ta.getElementsByClassName("with-args")[0];
			can.trigger(p0, "click");
		});
	}

	if (window.jQuery) {
		test("can-event passes extra args to handler", function () {
			expect(3);
			var template = can.view.mustache("<p can-myevent='handleMyEvent'>{{content}}</p>");

			var frag = template({
				handleMyEvent: function(context, el, event, arg1, arg2) {
					ok(true, "handleMyEvent called");
					equal(arg1, "myarg1", "3rd argument is the extra event args");
					equal(arg2, "myarg2", "4rd argument is the extra event args");
				}
			});

			var ta = document.getElementById("qunit-fixture");
			ta.appendChild(frag);
			var p0 = ta.getElementsByTagName("p")[0];
			can.trigger(p0, "myevent", ["myarg1", "myarg2"]);

		});
	}

	test("can-value input text", function () {

		var template = can.view.stache("<input can-value='age'/>");

		var map = new can.Map();

		var frag = template(map);

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);

		var input = ta.getElementsByTagName("input")[0];
		equal(input.value, "", "input value set correctly if key does not exist in map");

		map.attr("age", "30");

		equal(input.value, "30", "input value set correctly");

		map.attr("age", "31");

		equal(input.value, "31", "input value update correctly");

		input.value = "32";

		can.trigger(input, "change");

		equal(map.attr("age"), "32", "updated from input");

	});

	test("can-value with spaces (#1477)", function () {

		var template = can.view.stache("<input can-value='{ age }'/>");

		var map = new can.Map();

		var frag = template(map);

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);

		var input = ta.getElementsByTagName("input")[0];
		equal(input.value, "", "input value set correctly if key does not exist in map");

		map.attr("age", "30");

		equal(input.value, "30", "input value set correctly");

		map.attr("age", "31");

		equal(input.value, "31", "input value update correctly");

		input.value = "32";

		can.trigger(input, "change");

		equal(map.attr("age"), "32", "updated from input");

	});

	test("can-value input radio", function () {

		var template = can.view.stache(
			"<input type='radio' can-value='color' value='red'/> Red<br/>" +
			"<input type='radio' can-value='color' value='green'/> Green<br/>");

		var map = new can.Map({
			color: "red"
		});

		var frag = template(map);

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);

		var inputs = ta.getElementsByTagName("input");

		ok(inputs[0].checked, "first input checked");
		ok(!inputs[1].checked, "second input not checked");

		map.attr("color", "green");

		ok(!inputs[0].checked, "first notinput checked");
		ok(inputs[1].checked, "second input checked");

		inputs[0].checked = true;
		inputs[1].checked = false;

		can.trigger(inputs[0], "change");

		equal(map.attr("color"), "red", "updated from input");

	});

	test("can-enter", function () {
		var template = can.view.stache("<input can-enter='update'/>");

		var called = 0;

		var frag = template({
			update: function () {
				called++;
				ok(called, 1, "update called once");
			}
		});

		var input = frag.childNodes[0];

		can.trigger(input, {
			type: "keyup",
			keyCode: 38
		});

		can.trigger(input, {
			type: "keyup",
			keyCode: 13
		});

	});

	test("two bindings on one element call back the correct method", function () {
		expect(2);
		var template = can.stache("<input can-mousemove='first' can-click='second'/>");

		var callingFirst = false,
			callingSecond = false;

		var frag = template({
			first: function () {
				ok(callingFirst, "called first");
			},
			second: function () {
				ok(callingSecond, "called second");
			}
		});
		var input = frag.childNodes[0];

		callingFirst = true;

		can.trigger(input, {
			type: "mousemove"
		});

		callingFirst = false;
		callingSecond = true;
		can.trigger(input, {
			type: "click"
		});
	});

	asyncTest("can-value select remove from DOM", function () {
		expect(1);

		var template = can.view.stache(
			"<select can-value='color'>" +
			"<option value='red'>Red</option>" +
			"<option value='green'>Green</option>" +
			"</select>"),
			frag = template(),
			ta = document.getElementById("qunit-fixture");

		ta.appendChild(frag);
		can.remove(can.$("select", ta));

		setTimeout(function () {
			start();
			ok(true, 'Nothing should break if we just add and then remove the select');
		}, 10);
	});

	test("checkboxes with can-value bind properly (#628)", function () {
		var data = new can.Map({
			completed: true
		}),
			frag = can.view.stache('<input type="checkbox" can-value="completed"/>')(data);
		can.append(can.$("#qunit-fixture"), frag);

		var input = can.$("#qunit-fixture")[0].getElementsByTagName('input')[0];
		equal(input.checked, data.attr('completed'), 'checkbox value bound (via attr check)');
		data.attr('completed', false);
		equal(input.checked, data.attr('completed'), 'checkbox value bound (via attr uncheck)');
		input.checked = true;
		can.trigger(input, 'change');
		equal(input.checked, true, 'checkbox value bound (via check)');
		equal(data.attr('completed'), true, 'checkbox value bound (via check)');
		input.checked = false;
		can.trigger(input, 'change');
		equal(input.checked, false, 'checkbox value bound (via uncheck)');
		equal(data.attr('completed'), false, 'checkbox value bound (via uncheck)');
	});

	// TODO: next
	test("checkboxes with can-true-value bind properly", function () {
		var data = new can.Map({
			sex: "male"
		}),
			frag = can.view.stache('<input type="checkbox" can-value="sex" can-true-value="male" can-false-value="female"/>')(data);
		can.append(can.$("#qunit-fixture"), frag);

		var input = can.$("#qunit-fixture")[0].getElementsByTagName('input')[0];
		equal(input.checked, true, 'checkbox value bound (via attr check)');

		data.attr('sex', 'female');
		equal(input.checked, false, 'checkbox value unbound (via attr uncheck)');
		input.checked = true;
		can.trigger(input, 'change');
		equal(input.checked, true, 'checkbox value bound (via check)');
		equal(data.attr('sex'), 'male', 'checkbox value bound (via check)');
		input.checked = false;
		can.trigger(input, 'change');
		equal(input.checked, false, 'checkbox value bound (via uncheck)');
		equal(data.attr('sex'), 'female', 'checkbox value bound (via uncheck)');
	});

	test("can-value select single", function () {

		var template = can.view.stache(
			"<select can-value='color'>" +
			"<option value='red'>Red</option>" +
			"<option value='green'>Green</option>" +
			"</select>");

		var map = new can.Map({
			color: "red"
		});

		var frag = template(map);

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);

		var inputs = ta.getElementsByTagName("select");

		equal(inputs[0].value, 'red', "default value set");

		map.attr("color", "green");
		equal(inputs[0].value, 'green', "alternate value set");

		can.each(document.getElementsByTagName('option'), function (opt) {
			if (opt.value === 'red') {
				opt.selected = 'selected';
			}
		});

		equal(map.attr("color"), "green", "not yet updated from input");
		can.trigger(inputs[0], "change");
		equal(map.attr("color"), "red", "updated from input");

		can.each(document.getElementsByTagName('option'), function (opt) {
			if (opt.value === 'green') {
				opt.selected = 'selected';
			}
		});
		equal(map.attr("color"), "red", "not yet updated from input");
		can.trigger(inputs[0], "change");
		equal(map.attr("color"), "green", "updated from input");
	});

	test("can-value select multiple with values seperated by a ;", function () {
		var template = can.view.stache(
			"<select can-value='color' multiple>" +
			"<option value='red'>Red</option>" +
			"<option value='green'>Green</option>" +
			"<option value='ultraviolet'>Ultraviolet</option>" +
			"</select>");

		var map = new can.Map({
			color: "red"
		});

		stop();
		var frag = template(map);

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);

		var inputs = ta.getElementsByTagName("select"),
			options = inputs[0].getElementsByTagName('option');

		// Wait for Multiselect.set() to be called.
		setTimeout(function() {
			equal(inputs[0].value, 'red', "default value set");

			map.attr("color", "green");
			equal(inputs[0].value, 'green', "alternate value set");

			options[0].selected = true;

			equal(map.attr("color"), "green", "not yet updated from input");
			can.trigger(inputs[0], "change");
			equal(map.attr("color"), "red;green", "updated from input");

			map.removeAttr("color");
			equal(inputs[0].value, '', "attribute removed from map");

			options[1].selected = true;
			can.trigger(inputs[0], "change");
			equal(map.attr("color"), "green", "updated from input");

			map.attr("color", "red;green");

			ok(options[0].selected, 'red option selected from map');
			ok(options[1].selected, 'green option selected from map');
			ok(!options[2].selected, 'ultraviolet option NOT selected from map');

			can.remove(can.$(inputs));
			start();
		}, 1);
	});

	test("can-value select multiple with values cross bound to an array", function () {
		var template = can.view.stache(
			"<select can-value='colors' multiple>" +
			"<option value='red'>Red</option>" +
			"<option value='green'>Green</option>" +
			"<option value='ultraviolet'>Ultraviolet</option>" +
			"</select>");

		var map = new can.Map({});

		stop();
		var frag = template(map);

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);

		var select = ta.getElementsByTagName("select")[0],
			options = select.getElementsByTagName('option');

		// Wait for Multiselect.set() to be called.
		setTimeout(function(){
			// Test updating the DOM changes observable values
			options[0].selected = true;
			can.trigger(select, "change");

			deepEqual(map.attr("colors")
				.attr(), ["red"], "A can.List property is set even if none existed");

			options[1].selected = true;
			can.trigger(select, "change");

			deepEqual(map.attr("colors")
				.attr(), ["red", "green"], "Adds items to the list");

			options[0].selected = false;
			can.trigger(select, "change");

			deepEqual(map.attr("colors")
				.attr(), ["green"], "Removes items from the list");

			// Test changing observable values changes the DOM

			map.attr("colors")
				.push("ultraviolet");
			options[0].selected = false;
			options[1].selected = true;
			options[2].selected = true;

			can.remove(can.$(select));

			start();
		}, 1);
	});

	test("can-value multiple select with a can.List", function () {

		var template = can.view.stache(
			"<select can-value='colors' multiple>" +
			"<option value='red'>Red</option>" +
			"<option value='green'>Green</option>" +
			"<option value='ultraviolet'>Ultraviolet</option>" +
			"</select>");

		var list = new can.List();

		stop();
		var frag = template({
			colors: list
		});

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);

		var select = ta.getElementsByTagName("select")[0],
			options = select.getElementsByTagName('option');

		// Wait for Multiselect.set() to be called.
		setTimeout(function(){
			// Test updating the DOM changes observable values
			options[0].selected = true;
			can.trigger(select, "change");

			deepEqual(list.attr(), ["red"], "A can.List property is set even if none existed");

			options[1].selected = true;
			can.trigger(select, "change");

			deepEqual(list.attr(), ["red", "green"], "Adds items to the list");

			options[0].selected = false;
			can.trigger(select, "change");

			deepEqual(list.attr(), ["green"], "Removes items from the list");

			// Test changing observable values changes the DOM

			list.push("ultraviolet");
			options[0].selected = false;
			options[1].selected = true;
			options[2].selected = true;

			can.remove(can.$(select));
			start();
		}, 1);
	});

	test("can-value contenteditable", function () {
		var template = can.view.stache("<div id='cdiv' contenteditable can-value='age'></div>");
		var map = new can.Map();

		var frag = template(map);

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);

		var div = document.getElementById("cdiv");
		equal(div.innerHTML, "", "contenteditable set correctly if key does not exist in map");

		map.attr("age", "30");

		equal(div.innerHTML, "30", "contenteditable set correctly");

		map.attr("age", "31");

		equal(div.innerHTML, "31", "contenteditable update correctly");

		div.innerHTML = "32";

		can.trigger(div, "blur");

		equal(map.attr("age"), "32", "updated from contenteditable");
	});

	test("can-event handlers work with {} (#905)", function () {
		expect(4);
		var template = can.stache("<div>" +
			"{{#each foodTypes}}" +
			"<p can-click='{doSomething}'>{{content}}</p>" +
			"{{/each}}" +
			"</div>");

		var foodTypes = new can.List([{
			title: "Fruits",
			content: "oranges, apples"
		}, {
			title: "Breads",
			content: "pasta, cereal"
		}, {
			title: "Sweets",
			content: "ice cream, candy"
		}]);
		var doSomething = function (foodType, el, ev) {
			ok(true, "doSomething called");
			equal(el[0].nodeName.toLowerCase(), "p", "this is the element");
			equal(ev.type, "click", "1st argument is the event");
			equal(foodType, foodTypes[0], "2nd argument is the 1st foodType");

		};

		var frag = template({
			foodTypes: foodTypes,
			doSomething: doSomething
		});

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);
		var p0 = ta.getElementsByTagName("p")[0];
		can.trigger(p0, "click");

	});

	test("can-value works with {} (#905)", function () {

		var template = can.stache("<input can-value='{age}'/>");

		var map = new can.Map();

		var frag = template(map);

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);

		var input = ta.getElementsByTagName("input")[0];
		equal(input.value, "", "input value set correctly if key does not exist in map");

		map.attr("age", "30");

		equal(input.value, "30", "input value set correctly");

		map.attr("age", "31");

		equal(input.value, "31", "input value update correctly");

		input.value = "32";

		can.trigger(input, "change");

		equal(map.attr("age"), "32", "updated from input");

	});

	test("can-value select with null or undefined value (#813)", function () {

		var template = can.view.stache(
			"<select id='null-select' can-value='color-1'>" +
				"<option value=''>Choose</option>" +
				"<option value='red'>Red</option>" +
				"<option value='green'>Green</option>" +
			"</select>" +
			"<select id='undefined-select' can-value='color-2'>" +
				"<option value=''>Choose</option>" +
				"<option value='red'>Red</option>" +
				"<option value='green'>Green</option>" +
			"</select>");

		var map = new can.Map({
			'color-1': null,
			'color-2': undefined
		});
		stop();
		var frag = template(map);

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);

		var nullInput = document.getElementById("null-select");
		var nullInputOptions = nullInput.getElementsByTagName('option');
		var undefinedInput = document.getElementById("undefined-select");
		var undefinedInputOptions = undefinedInput.getElementsByTagName('option');

		// wait for set to be called which will change the selects
		setTimeout(function(){
			ok(nullInputOptions[0].selected, "default (null) value set");
			ok(undefinedInputOptions[0].selected, "default (undefined) value set");
			start();
		}, 1);
	});

	test('radio type conversion (#811)', function(){
		var data = new can.Map({
			id: 1
		}),
			frag = can.view.stache('<input type="radio" can-value="id" value="1"/>')(data);
		can.append(can.$('#qunit-fixture'), frag);
		var input = can.$('#qunit-fixture')[0].getElementsByTagName('input')[0];
		ok(input.checked, 'checkbox value bound');
	});


	test("template with view binding breaks in stache, not in mustache (#966)", function(){
		var templateString = '<a href="javascript://" can-click="select">'+
								'{{#if thing}}\n<div />{{/if}}'+
								'<span>{{name}}</span>'+
							 '</a>';
		//var mustacheRenderer = can.mustache(templateString);
		var stacheRenderer = can.stache(templateString);

		var obj = new can.Map({thing: 'stuff'});


		stacheRenderer(obj);
		ok(true, 'stache worked without errors');

	});

	test("can-event throws an error when inside #if block (#1182)", function(){
		var flag = can.compute(false),
			clickHandlerCount = 0;
		var frag = can.view.mustache("<div {{#if flag}}can-click='foo'{{/if}}>Click</div>")({
			flag: flag,
			foo: function () {
				clickHandlerCount++;
			}
		});
		var trig = function(){
			var div = can.$('#qunit-fixture')[0].getElementsByTagName('div')[0];
			can.trigger(div, {
				type: "click"
			});
		};
		can.append(can.$('#qunit-fixture'), frag);
		trig();
		equal(clickHandlerCount, 0, "click handler not called");
	});

	test("can-EVENT removed in live bindings doesn't unbind (#1112)", function(){
		var flag = can.compute(true),
			clickHandlerCount = 0;
		var frag = can.view.mustache("<div {{#if flag}}can-click='foo'{{/if}}>Click</div>")({
			flag: flag,
			foo: function () {
				clickHandlerCount++;
			}
		});
		var trig = function(){
			var div = can.$('#qunit-fixture')[0].getElementsByTagName('div')[0];
			can.trigger(div, {
				type: "click"
			});
		};
		can.append(can.$('#qunit-fixture'), frag);
		trig();
		flag(false);
		trig();
		flag(true);
		trig();
		equal(clickHandlerCount, 2, "click handler called twice");
	});

	test("can-value compute rejects new value (#887)", function() {
		var template = can.view.mustache("<input can-value='age'/>");

		// Compute only accepts numbers
		var compute = can.compute(30, function(newVal, oldVal) {
			if(isNaN(+newVal)) {
				return oldVal;
			} else {
				return +newVal;
			}
		});

		var frag = template({
			age: compute
		});

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);

		var input = ta.getElementsByTagName("input")[0];

		// Set to non-number
		input.value = "30f";
		can.trigger(input, "change");

		equal(compute(), 30, "Still the old value");
		equal(input.value, "30", "Text input has also not changed");
	});

	test("can-value select multiple applies initial value, when options rendered from array (#1414)", function () {
		var template = can.view.mustache(
			"<select can-value='colors' multiple>" +
			"{{#each allColors}}<option value='{{value}}'>{{label}}</option>{{/each}}" +
			"</select>");

		var map = new can.Map({
			colors: ["red", "green"],
			allColors: [
				{ value: "red", label: "Red"},
				{ value: "green", label: "Green"},
				{ value: "blue", label: "Blue"}
			]
		});

		stop();
		var frag = template(map);

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);

		var select = ta.getElementsByTagName("select")[0],
			options = select.getElementsByTagName("option");

		// Wait for Multiselect.set() to be called.
		setTimeout(function(){
			ok(options[0].selected, "red should be set initially");
			ok(options[1].selected, "green should be set initially");
			ok(!options[2].selected, "blue should not be set initially");
			start();
		}, 1);

	});

	test('can-value with truthy and falsy values binds to checkbox (#1478)', function() {
		var data = new can.Map({
				completed: 1
			}),
			frag = can.view.stache('<input type="checkbox" can-value="completed"/>')(data);
		can.append(can.$("#qunit-fixture"), frag);

		var input = can.$("#qunit-fixture")[0].getElementsByTagName('input')[0];
		equal(input.checked, true, 'checkbox value bound (via attr check)');
		data.attr('completed', 0);
		equal(input.checked, false, 'checkbox value bound (via attr check)');
	});

	test("can-EVENT can call intermediate functions before calling the final function (#1474)", function () {
		var ta = document.getElementById("qunit-fixture");
		var template = can.view.stache("<div id='click-me' can-click='{does.some.thing}'></div>");
		var frag = template({
			does: function(){
				return {
					some: function(){
						return {
							thing: function(context) {
								ok(can.isFunction(context.does));
								start();
							}
						};
					}
				};
			}
		});

		stop();
		ta.appendChild(frag);
		can.trigger(document.getElementById("click-me"), "click");
	});

	test("by default can-EVENT calls with values, not computes", function(){
		stop();
		var ta = document.getElementById("qunit-fixture");
		var template = can.stache("<div id='click-me' can-click='{map.method one map.two map.three}'></div>");

		var one = can.compute(1);
		var three = can.compute(3);
		var MyMap = can.Map.extend({
			method: function(ONE, two, three){
				equal(ONE, 1);
				equal(two, 2);
				equal(three, 3);
				equal(this, map, "this set right");
				start();
			}
		});

		var map = new MyMap({"two": 2, "three": three});

		var frag = template({one: one, map: map});
		ta.appendChild(frag);
		can.trigger(document.getElementById("click-me"), "click");

	});

	test('Conditional can-EVENT bindings are bound/unbound', 2, function () {
		var state = new can.Map({
			enableClick: true,
			clickHandler: function () {
				ok(true, '"click" was handled');
			}
		});

		var template = can.stache('<button id="find-me" {{#if enableClick}}can-click="{clickHandler}"{{/if}}></button>');
		var frag = template(state);

		var sandbox = document.getElementById("qunit-fixture");
		sandbox.appendChild(frag);

		var btn = document.getElementById('find-me');

		can.trigger(btn, 'click');
		state.attr('enableClick', false);

		stop();
		setTimeout(function() {
			can.trigger(btn, 'click');
			state.attr('enableClick', true);

			setTimeout(function() {
				can.trigger(btn, 'click');
				start();
			}, 10);
		}, 10);
	});

	test("<select can-value={value}> with undefined value selects option without value", function () {

		var template = can.view.stache("<select can-value='opt'><option>Loading...</option></select>");

		var map = new can.Map();

		var frag = template(map);

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);

		var select = ta.childNodes[0];
		QUnit.equal(select.selectedIndex, 0, 'Got selected index');
	});

	test("<select can-value> keeps its value as <option>s change with {{#list}} (#1762)", function(){

		var template = can.view.stache("<select can-value='{id}'>{{#values}}<option value='{{.}}'>{{.}}</option>{{/values}}</select>");
		var values = can.compute( ["1","2","3","4"]);
		var id = can.compute("2");
		var frag = template({
			values: values,
			id: id
		});
		stop();
		var select = frag.firstChild;
		// the value is set asynchronously
		setTimeout(function(){
			ok(select.childNodes[1].selected, "value is initially selected");

			values(["7","2","5","4"]);

			ok(select.childNodes[1].selected, "after changing options, value should still be selected");


			start();
		},20);

	});

	test("<select can-value> keeps its value as <option>s change with {{#each}} (#1762)", function(){
		var template = can.view.stache("<select can-value='{id}'>{{#each values}}<option value='{{.}}'>{{.}}</option>{{/values}}</select>");
		var values = can.compute( ["1","2","3","4"]);
		var id = can.compute("2");
		var frag = template({
			values: values,
			id: id
		});
		stop();
		var select = frag.firstChild;


		// the value is set asynchronously
		setTimeout(function(){
			ok(select.childNodes[1].selected, "value is initially selected");

			values(["7","2","5","4"]);

			ok(select.childNodes[1].selected, "after changing options, value should still be selected");


			start();
		},20);

	});

	test("(event) methods on objects are called (#1839)", function(){
		var template = can.stache("<div ($click)='setSomething person.message'/>");
		var data = {
			setSomething: function(message){
				equal(message, "Matthew P finds good bugs");
				equal(this, data, "setSomething called with correct scope");
			},
			person: {
				name: "Matthew P",
				message: function(){
					return this.name + " finds good bugs";
				}
			}
		};
		var frag = template(data);
		can.trigger( frag.firstChild, "click" );
	});

	test("(event) methods on objects are called with call expressions (#1839)", function(){
		var template = can.stache("<div ($click)='setSomething(person.message)'/>");
		var data = {
			setSomething: function(message){
				equal(message, "Matthew P finds good bugs");
				equal(this, data, "setSomething called with correct scope");
			},
			person: {
				name: "Matthew P",
				message: function(){
					return this.name + " finds good bugs";
				}
			}
		};
		var frag = template(data);
		can.trigger( frag.firstChild, "click" );
	});

	test("two way - viewModel (#1700)", function(){

		can.Component.extend({
			tag: "view-model-able"
		});

		var template = can.stache("<div {(view-model-prop)}='scopeProp'/>");

		var attrSetCalled = 0;

		var map = new can.Map({scopeProp: "Hello"});
		var oldAttr = map.attr;
		map.attr = function(attrName, value){
			if(typeof attrName === "string" && arguments.length > 1) {
				attrSetCalled++;
			}

			return oldAttr.apply(this, arguments);
		};


		var frag = template(map);
		var viewModel = can.viewModel(frag.firstChild);

		equal(attrSetCalled, 0, "set is not called on scope map");
		equal( viewModel.attr("viewModelProp"), "Hello", "initial value set" );

		viewModel = can.viewModel(frag.firstChild);

		var viewModelAttrSetCalled = 1;
		viewModel.attr = function(attrName){
			if(typeof attrName === "string" && arguments.length > 1) {
				viewModelAttrSetCalled++;
			}

			return oldAttr.apply(this, arguments);
		};


		viewModel.attr("viewModelProp","HELLO");
		equal(map.attr("scopeProp"), "HELLO", "binding from child to parent");
		equal(attrSetCalled, 1, "set is called once on scope map");

		equal(viewModelAttrSetCalled, 3, "set is called once viewModel");


		map.attr("scopeProp","WORLD");
		equal( viewModel.attr("viewModelProp"), "WORLD", "binding from parent to child" );
		equal(attrSetCalled, 2, "set is called once on scope map");
		equal(viewModelAttrSetCalled, 4, "set is called once on viewModel");

	});

	// new two-way binding

	test("two-way - DOM - input text (#1700)", function () {

		var template = can.view.stache("<input {($value)}='age'/>");

		var map = new can.Map();

		var frag = template(map);

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);

		var input = ta.getElementsByTagName("input")[0];
		equal(input.value, "", "input value set correctly if key does not exist in map");

		map.attr("age", "30");

		equal(input.value, "30", "input value set correctly");

		map.attr("age", "31");

		equal(input.value, "31", "input value update correctly");

		input.value = "32";

		can.trigger(input, "change");

		equal(map.attr("age"), "32", "updated from input");

	});

	test('two-way - DOM - {($checked)} with truthy and falsy values binds to checkbox (#1700)', function() {
		var data = new can.Map({
				completed: 1
			}),
			frag = can.view.stache('<input type="checkbox" {($checked)}="completed"/>')(data);

		can.append(can.$("#qunit-fixture"), frag);

		var input = can.$("#qunit-fixture")[0].getElementsByTagName('input')[0];
		equal(input.checked, true, 'checkbox value bound (via attr check)');
		data.attr('completed', 0);
		equal(input.checked, false, 'checkbox value bound (via attr check)');
	});

	test('two-way - reference - {(child)}="*ref" (#1700)', function(){
		var data = new can.Map({person: {name: {}}});
		can.Component.extend({
			tag: 'reference-export',
			viewModel: {tag: 'reference-export'}
		});
		can.Component.extend({
			tag: 'ref-import',
			viewModel: {tag: 'ref-import'}
		});

		var template = can.stache("<reference-export {(name)}='*refName'/>"+
			"<ref-import {(name)}='*refName'/> {{helperToGetScope}}");

		var scope;
		var frag = template(data,{
			helperToGetScope: function(options){
				scope = options.scope;
			}
		});

		var refExport = can.viewModel(frag.firstChild);
		var refImport = can.viewModel(frag.firstChild.nextSibling);

		refExport.attr("name","v1");

		equal( scope.getRefs()._context.attr("*refName"), "v1", "reference scope updated");

		equal(refImport.attr("name"),"v1", "updated ref-import");

		refImport.attr("name","v2");

		equal(refExport.attr("name"),"v2", "updated ref-export");

		equal( scope.getRefs()._context.attr("*refName"), "v2", "actually put in refs scope");

	});

	test('two-way - reference - with <content> tag', function(){
		can.Component.extend({
			tag: "other-export",
			viewModel: {
				name: "OTHER-EXPORT"
			}
		});

		can.Component.extend({
			tag: "ref-export",
			template: can.stache('<other-export {(name)}="*otherExport"/><content>{{*otherExport}}</content>')
		});

		// this should have otherExport name in the page
		var t1 = can.stache("<ref-export></ref-export>");

		// this should not have anything in 'one', but something in 'two'
		//var t2 = can.stache("<form><other-export *other/><ref-export><b>{{*otherExport.name}}</b><label>{{*other.name}}</label></ref-export></form>");

		var f1 = t1();
		equal(can.viewModel( f1.firstChild.firstChild ).attr("name"), "OTHER-EXPORT", "viewModel set correctly");
		equal(f1.firstChild.lastChild.nodeValue, "OTHER-EXPORT", "content");

		/*var f2 = t2();
		var one = f2.firstChild.getElementsByTagName('b')[0];
		var two = f2.firstChild.getElementsByTagName('label')[0];

		equal(one.firstChild.nodeValue, "", "external content, internal export");
		equal(two.firstChild.nodeValue, "OTHER-EXPORT", "external content, external export");*/
	});

	test('two-way - reference shorthand (#1700)', function(){
		var data = new can.Map({person: {name: {}}});
		can.Component.extend({
			tag: 'reference-export',
			template: can.stache('<span>{{*referenceExport.name}}</span>'),
			viewModel: {}
		});

		var template = can.stache('{{#person}}{{#name}}'+
			"<reference-export *reference-export/>"+
			"{{/name}}{{/person}}<span>{{*referenceExport.name}}</span>");
		var frag = template(data);

		var refExport = can.viewModel(frag.firstChild);
		refExport.attr("name","done");

		equal( frag.lastChild.firstChild.nodeValue, "done");
		equal( frag.firstChild.firstChild.firstChild.nodeValue, "", "not done");
	});

	test('one-way - parent to child - viewModel', function(){


		var template = can.stache("<div {view-model-prop}='scopeProp'/>");


		var map = new can.Map({scopeProp: "Venus"});

		var frag = template(map);
		var viewModel = can.viewModel(frag.firstChild);

		equal( viewModel.attr("viewModelProp"), "Venus", "initial value set" );

		viewModel.attr("viewModelProp","Earth");
		equal(map.attr("scopeProp"), "Venus", "no binding from child to parent");

		map.attr("scopeProp","Mars");
		equal( viewModel.attr("viewModelProp"), "Mars", "binding from parent to child" );
	});

	test('one-way - child to parent - viewModel', function(){

		can.Component.extend({
			tag: "view-model-able",
			viewModel: {
				viewModelProp: "Mercury"
			}
		});

		var template = can.stache("<view-model-able {^view-model-prop}='scopeProp'/>");

		var map = new can.Map({scopeProp: "Venus"});

		var frag = template(map);
		var viewModel = can.viewModel(frag.firstChild);

		equal( viewModel.attr("viewModelProp"), "Mercury", "initial value kept" );
		equal( map.attr("scopeProp"), "Mercury", "initial value set on parent" );

		viewModel.attr("viewModelProp","Earth");
		equal(map.attr("scopeProp"), "Earth", "binding from child to parent");

		map.attr("scopeProp","Mars");
		equal( viewModel.attr("viewModelProp"), "Earth", "no binding from parent to child" );
	});

	test('one way - child to parent - importing viewModel {^.}="test"', function() {
		can.Component.extend({
			tag: 'import-scope',
			template: can.stache('Hello {{name}}'),
			viewModel: {
				name: 'David',
				age: 7
			}
		});

		can.Component.extend({
			tag: 'import-parent',
			template: can.stache('<import-scope {^.}="test"></import-scope>' +
				'<div>Imported: {{test.name}} {{test.age}}</div>')
		});

		var template = can.stache('<import-parent></import-parent>');
		var frag = template({});

		equal(frag.childNodes[0].childNodes[1].innerHTML,
			'Imported: David 7',
			'{.} component scope imported into variable');
	});


	test('one way - child to parent - importing viewModel {^prop}="test"', function() {
		can.Component.extend({
			tag: 'import-prop-scope',
			template: can.stache('Hello {{name}}'),
			viewModel: {
				name: 'David',
				age: 7
			}
		});

		can.Component.extend({
			tag: 'import-prop-parent',
			template: can.stache('<import-prop-scope {^name}="test"></import-prop-scope>' +
				'<div>Imported: {{test}}</div>')
		});

		var template = can.stache('<import-prop-parent></import-prop-parent>');
		var frag = template({});

		equal(frag.childNodes[0].childNodes[1].innerHTML,
			'Imported: David',  '{name} component scope imported into variable');
	});

	test('one way - child to parent - importing viewModel {^hypenated-prop}="test"', function(){
		can.Component.extend({
			tag: 'import-prop-scope',
			template: can.stache('Hello {{userName}}'),
			viewModel: {
				userName: 'David',
				age: 7,
				updateName: function(){
					this.attr('userName', 'Justin');
				}
			}
		});

		can.Component.extend({
			tag: 'import-prop-parent',
			template: can.stache('<import-prop-scope {^user-name}="test" {^.}="childComponent"></import-prop-scope>' +
				'<div>Imported: {{test}}</div>')
		});

		var template = can.stache('<import-prop-parent></import-prop-parent>');
		var frag = template({});
		var importPropParent = frag.firstChild;
		var importPropScope = importPropParent.getElementsByTagName("import-prop-scope")[0];

		can.viewModel(importPropScope).updateName();

		var importPropParentViewModel = can.viewModel(importPropParent);

		equal(importPropParentViewModel.attr("test"), "Justin", "got hypenated prop");

		equal(importPropParentViewModel.attr("childComponent"), can.viewModel(importPropScope), "got view model");

	});



	test("one-way - child to parent - parent that does not leak scope, but has no template", function(){
		can.Component.extend({
			tag: "outer-noleak",
			viewModel: {
				isOuter: true
			},
			leakScope: false
		});
		can.Component.extend({
			tag: "my-child",
			viewModel : {
				isChild: true
			},
			leakScope: false
		});


		var template = can.stache("<outer-noleak><my-child {^.}='myChild'/></outer-noleak>");
		var frag = template();
		var vm = can.viewModel(frag.firstChild);
		ok(vm.attr("myChild") instanceof can.Map, "got instance");

	});

	test("viewModel binding (event)", function(){

		can.Component.extend({
			tag: "viewmodel-binding",
			viewModel: {
				makeMyEvent: function(){
					this.dispatch("myevent");
				}
			}
		});
		var frag = can.stache("<viewmodel-binding (myevent)='doSomething()'/>")({
			doSomething: function(){
				ok(true, "called!");
			}
		});
		can.viewModel(frag.firstChild).makeMyEvent();
	});

	test("checkboxes with {($checked)} bind properly", function () {
		var data = new can.Map({
			completed: true
		}),
			frag = can.view.stache('<input type="checkbox" {($checked)}="completed"/>')(data);
		can.append(can.$("#qunit-fixture"), frag);

		var input = can.$("#qunit-fixture")[0].getElementsByTagName('input')[0];
		equal(input.checked, data.attr('completed'), 'checkbox value bound (via attr check)');
		data.attr('completed', false);
		equal(input.checked, data.attr('completed'), 'checkbox value bound (via attr uncheck)');
		input.checked = true;
		can.trigger(input, 'change');
		equal(input.checked, true, 'checkbox value bound (via check)');
		equal(data.attr('completed'), true, 'checkbox value bound (via check)');
		input.checked = false;
		can.trigger(input, 'change');
		equal(input.checked, false, 'checkbox value bound (via uncheck)');
		equal(data.attr('completed'), false, 'checkbox value bound (via uncheck)');
	});

	test("two-way element empty value (1996)", function(){


		var template = can.stache("<input can-value='age'/>");

		var map = new can.Map();

		var frag = template(map);

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);

		var input = ta.getElementsByTagName("input")[0];
		equal(input.value, "", "input value set correctly if key does not exist in map");

		map.attr("age", "30");

		equal(input.value, "30", "input value set correctly");

		map.attr("age", "31");

		equal(input.value, "31", "input value update correctly");

		input.value = "";

		can.trigger(input, "change");

		equal(map.attr("age"), "", "updated from input");

	});

	test("exporting methods (#2051)", function(){
		expect(2);


		can.Component.extend({
			tag : 'foo-bar',
			viewModel : {
				method : function() {
					ok(true, "foo called");
					return 5;
				}
			}
		});

		var template = can.stache("<foo-bar {^@method}='@*refKey'></foo-bar>{{*refKey()}}");

		var frag = template({});
		equal( frag.lastChild.nodeValue, "5");

	});


	test("renders dynamic custom attributes (#1800)", function () {

		var template = can.view.stache("<ul>{{#actions}}<li can-click='{{.}}'>{{.}}</li>{{/actions}}</ul>");

		var map = new can.Map({
			actions: ["action1", "action2"],
			action1: function(){
				equal(calling, 0,"action1");
			},
			action2: function(){
				equal(calling, 1,"action2");
			}
		});

		var frag = template(map),
			lis = frag.firstChild.getElementsByTagName("li");

		var calling = 0;
		can.trigger(lis[0], "click");
		calling  = 1;
		can.trigger(lis[1], "click");
	});

	//!steal-remove-start
	if (can.dev) {
		test("warning on a mismatched quote (#1995)", function () {
			expect(4);
			var oldlog = can.dev.warn,
				message = 'can/view/bindings/bindings.js: mismatched binding syntax - (foo}';

			can.dev.warn = function (text) {
				equal(text, message, 'Got expected message logged.');
			};
			
			can.stache("<div (foo}='bar'/>")();
			
			message = 'can/view/bindings/bindings.js: mismatched binding syntax - {foo)';
			can.stache("<div {foo)='bar'/>")();
			
			message = 'can/view/bindings/bindings.js: mismatched binding syntax - {(foo})';
			can.stache("<div {(foo})='bar'/>")();

			message = 'can/view/bindings/bindings.js: mismatched binding syntax - ({foo})';
			can.stache("<div ({foo})='bar'/>")();


			can.dev.warn = oldlog;
		});
	}
	//!steal-remove-end
	


	test("One way binding from a select's value to a parent compute updates the parent with the select's initial value (#2027)", function(){
		var template = can.stache("<select {^$value}='value'><option value='One'>One</option></select>");
		var map = new can.Map();

		var frag = template(map);
		var select = frag.childNodes.item(0);

		setTimeout(function(){
			equal(select.selectedIndex, 0, "selectedIndex is 0 because no value exists on the map");
			equal(map.attr("value"), "One", "The map's value property is set to the select's value");
			start();
		},1);

		stop();

	});

	test("two way binding from a select's value to null has no selection (#2027)", function(){
		var template = can.stache("<select {($value)}='key'><option value='One'>One</option></select>");
		var map = new can.Map({key: null});

		var frag = template(map);
		var select = frag.childNodes.item(0);

		setTimeout(function(){
			equal(select.selectedIndex, -1, "selectedIndex is 0 because no value exists on the map");
			equal(map.attr("key"), null, "The map's value property is set to the select's value");
			start();
		},1);

		stop();

	});

	test('two-way bound values that do not match a select option set selectedIndex to -1 (#2027)', function() {
		var renderer = can.view.stache('<select {($value)}="key"><option value="foo">foo</option><option value="bar">bar</option></select>');
		var map = new can.Map({ });
		var frag = renderer(map);

		equal(frag.firstChild.selectedIndex, 0, 'undefined <- {($first value)}: selectedIndex = 0');

		map.attr('key', 'notfoo');
		equal(frag.firstChild.selectedIndex, -1, 'notfoo: selectedIndex = -1');

		map.attr('key', 'foo');
		strictEqual(frag.firstChild.selectedIndex, 0, 'foo: selectedIndex = 0');

		map.attr('key', 'notbar');
		equal(frag.firstChild.selectedIndex, -1, 'notbar: selectedIndex = -1');

		map.attr('key', 'bar');
		strictEqual(frag.firstChild.selectedIndex, 1, 'bar: selectedIndex = 1');

		map.attr('key', 'bar');
		strictEqual(frag.firstChild.selectedIndex, 1, 'bar (no change): selectedIndex = 1');
	});

	test("two way bound select empty string null or undefined value (#2027)", function () {

		var template = can.stache(
			"<select id='null-select' {($value)}='color-1'>" +
				"<option value=''>Choose</option>" +
				"<option value='red'>Red</option>" +
				"<option value='green'>Green</option>" +
			"</select>" +
			"<select id='undefined-select' {($value)}='color-2'>" +
				"<option value=''>Choose</option>" +
				"<option value='red'>Red</option>" +
				"<option value='green'>Green</option>" +
			"</select>"+
			"<select id='string-select' {($value)}='color-3'>" +
				"<option value=''>Choose</option>" +
				"<option value='red'>Red</option>" +
				"<option value='green'>Green</option>" +
			"</select>");

		var map = new can.Map({
			'color-1': null,
			'color-2': undefined,
			'color-3': ""
		});
		stop();
		var frag = template(map);

		var ta = document.getElementById("qunit-fixture");
		ta.appendChild(frag);

		var nullInput = document.getElementById("null-select");
		var nullInputOptions = nullInput.getElementsByTagName('option');
		var undefinedInput = document.getElementById("undefined-select");
		var undefinedInputOptions = undefinedInput.getElementsByTagName('option');
		var stringInput = document.getElementById("string-select");
		var stringInputOptions = stringInput.getElementsByTagName('option');

		// wait for set to be called which will change the selects
		setTimeout(function(){
			ok(!nullInputOptions[0].selected, "default (null) value set");
			ok(!undefinedInputOptions[0].selected, "default (undefined) value set");
			ok(!stringInputOptions[0].selected, "default ('') value set");
			start();
		}, 1);
	});

});
