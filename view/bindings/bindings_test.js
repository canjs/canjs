steal("can/view/bindings", "can/map", "can/test", "can/view/stache", function (special) {
	module('can/view/bindings', {
		setup: function () {
			document.getElementById("qunit-test-area")
				.innerHTML = "";
		}
	});

	test("can-event handlers", function () {
		expect(4);
		var template = can.view.mustache("<div>" +
			"{{#each foodTypes}}" +
			"<p can-click='doSomething'>{{content}}</p>" +
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

		var ta = document.getElementById("qunit-test-area");
		ta.appendChild(frag);
		var p0 = ta.getElementsByTagName("p")[0];
		can.trigger(p0, "click");

	});

	test("can-value input text", function () {

		var template = can.view.mustache("<input can-value='age'/>");

		var map = new can.Map();

		var frag = template(map);

		var ta = document.getElementById("qunit-test-area");
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

		var template = can.view.mustache(
			"<input type='radio' can-value='color' value='red'/> Red<br/>" +
			"<input type='radio' can-value='color' value='green'/> Green<br/>");

		var map = new can.Map({
			color: "red"
		});

		var frag = template(map);

		var ta = document.getElementById("qunit-test-area");
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
		var template = can.view.mustache("<input can-enter='update'/>");

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
		var template = can.mustache("<input can-mousemove='first' can-click='second'/>");

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

		var template = can.view.mustache(
			"<select can-value='color'>" +
			"<option value='red'>Red</option>" +
			"<option value='green'>Green</option>" +
			"</select>"),
			frag = template(),
			ta = document.getElementById("qunit-test-area");

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
			frag = can.view.mustache('<input type="checkbox" can-value="completed"/>')(data);
		can.append(can.$("#qunit-test-area"), frag);

		var input = can.$("#qunit-test-area")[0].getElementsByTagName('input')[0];
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

	test("checkboxes with can-true-value bind properly", function () {
		var data = new can.Map({
			sex: "male"
		}),
			frag = can.view.mustache('<input type="checkbox" can-value="sex" can-true-value="male" can-false-value="female"/>')(data);
		can.append(can.$("#qunit-test-area"), frag);

		var input = can.$("#qunit-test-area")[0].getElementsByTagName('input')[0];
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

		var template = can.view.mustache(
			"<select can-value='color'>" +
			"<option value='red'>Red</option>" +
			"<option value='green'>Green</option>" +
			"</select>");

		var map = new can.Map({
			color: "red"
		});

		var frag = template(map);

		var ta = document.getElementById("qunit-test-area");
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
		var template = can.view.mustache(
			"<select can-value='color' multiple>" +
			"<option value='red'>Red</option>" +
			"<option value='green'>Green</option>" +
			"<option value='ultraviolet'>Ultraviolet</option>" +
			"</select>");

		var map = new can.Map({
			color: "red"
		});

		var frag = template(map);

		var ta = document.getElementById("qunit-test-area");
		ta.appendChild(frag);

		var inputs = ta.getElementsByTagName("select"),
			options = inputs[0].getElementsByTagName('option');

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
	});

	test("can-value select multiple with values cross bound to an array", function () {
		var template = can.view.mustache(
			"<select can-value='colors' multiple>" +
			"<option value='red'>Red</option>" +
			"<option value='green'>Green</option>" +
			"<option value='ultraviolet'>Ultraviolet</option>" +
			"</select>");

		var map = new can.Map({});

		var frag = template(map);

		var ta = document.getElementById("qunit-test-area");
		ta.appendChild(frag);

		var select = ta.getElementsByTagName("select")[0],
			options = select.getElementsByTagName('option');

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
	});

	test("can-value multiple select with a can.List", function () {

		var template = can.view.mustache(
			"<select can-value='colors' multiple>" +
			"<option value='red'>Red</option>" +
			"<option value='green'>Green</option>" +
			"<option value='ultraviolet'>Ultraviolet</option>" +
			"</select>");

		var list = new can.List();

		var frag = template({
			colors: list
		});

		var ta = document.getElementById("qunit-test-area");
		ta.appendChild(frag);

		var select = ta.getElementsByTagName("select")[0],
			options = select.getElementsByTagName('option');

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

	});

	test("can-value contenteditable", function () {
		var template = can.view.mustache("<div id='cdiv' contenteditable can-value='age'></div>");
		var map = new can.Map();

		var frag = template(map);

		var ta = document.getElementById("qunit-test-area");
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
		var template = can.mustache("<div>" +
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

		var ta = document.getElementById("qunit-test-area");
		ta.appendChild(frag);
		var p0 = ta.getElementsByTagName("p")[0];
		can.trigger(p0, "click");

	});

	test("can-value works with {} (#905)", function () {

		var template = can.mustache("<input can-value='{age}'/>");

		var map = new can.Map();

		var frag = template(map);

		var ta = document.getElementById("qunit-test-area");
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

		var template = can.view.mustache(
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

		var ta = document.getElementById("qunit-test-area");
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
			frag = can.view.mustache('<input type="radio" can-value="id" value="1"/>')(data);
		can.append(can.$('#qunit-test-area'), frag);
		var input = can.$('#qunit-test-area')[0].getElementsByTagName('input')[0];
		ok(input.checked, 'checkbox value bound');
	});


	test("template with view binding breaks in stache, not in mustache", function(){
		var templateString = '<a href="javascript://" can-click="select">'+
								'{{#if thing}}\n<div />{{/if}}'+
								'<span>{{name}}</span>'+
							 '</a>';
	    var mustacheRenderer = can.mustache(templateString);
	    var stacheRenderer = can.stache(templateString);
	    
	    var obj = new can.Map({thing: 'stuff', name: 'Brian'})

    	var div = document.createElement('div');


    	mustacheRenderer(obj);
	    ok(true, 'mustache worked without errors');
    	stacheRenderer(obj);
	    ok(true, 'stache worked without errors');
		
	});


});
