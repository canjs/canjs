steal('can/util', 'can/view/stache', 'can/util/attr', 'steal-qunit', function () {
	QUnit.module("can/util/attr");

	test("attributes event", function () {

		var div = document.createElement("div");


		var attrHandler1 = function(ev) {

			equal(ev.attributeName, "foo", "attribute name is correct");
			equal(ev.target, div, "target");
			equal(ev.oldValue, null, "oldValue");

			equal(div.getAttribute(ev.attributeName), "bar");
			can.unbind.call(can.$(div), "attributes", attrHandler1);
		};
		can.bind.call(can.$(div), "attributes", attrHandler1);

		can.attr.set(div, "foo", "bar");

		stop();

		setTimeout(function () {
			var attrHandler = function(ev) {
				ok(true, "removed event handler should be called");

				equal(ev.attributeName, "foo", "attribute name is correct");
				equal(ev.target, div, "target");
				equal(ev.oldValue, "bar", "oldValue should be 'bar'");

				equal(div.getAttribute(ev.attributeName), null, "value of the attribute should be null after the remove.");

				can.unbind.call(can.$(div), "attributes", attrHandler);
				start();
			};
			can.bind.call(can.$(div), "attributes", attrHandler);
			can.attr.remove(div, "foo");

		}, 50);

	});

	test("template attr updating", function () {

		var template = can.stache("<div my-attr='{{value}}'></div>"),
			compute = can.compute("foo");

		var div = template({
			value: compute
		})
			.childNodes[0];

		can.bind.call(can.$(div), "attributes", function (ev) {

			equal(ev.oldValue, "foo");
			equal(ev.attributeName, "my-attr");

			start();
		});

		equal(div.getAttribute("my-attr"), "foo", "attribute set");

		stop();
		compute("bar");

	});

	test("attr.set CHECKED attribute works", function(){

		var input = document.createElement("input");
		input.type = "checkbox";

		document.getElementById("qunit-fixture").appendChild(input);

		can.attr.set(input, "CHECKED");
		equal(input.checked, true);

		input.checked = false;

		can.attr.set(input, "CHECKED");

		equal(input.checked, true);
		can.remove(can.$("#qunit-fixture>*"));
	});

	test("attr.set READONLY property should be set correctly via template binding #1874", function () {

		var template = can.stache('<input type="text" {{#if flag}}READONLY{{/if}}></input>'),
			compute = can.compute(false);

		var input = template({
			flag: compute
		}).childNodes[0];

		equal(input.readOnly, false, "readOnly should be false");
		compute(true);
		equal(input.readOnly, true, "readOnly should be set to true");
		compute(false);
		equal(input.readOnly, false, "readOnly should be set back to false");
	});

	test("attr.set READONLY property should be set correctly via one way binding #2431", function () {

		var template = can.stache('<input type="text" {$readonly}="flag"></input>'),
			compute = can.compute(false);

		var input = template({
			flag: compute
		}).childNodes[0];

		equal(input.readOnly, false, "readOnly should be false");
		compute(true);
		equal(input.readOnly, true, "readOnly should be set to true");
		compute(false);
		equal(input.readOnly, false, "readOnly should be set back to false");
	});

	test("Map special attributes", function () {

		var div = document.createElement("label");

		document.getElementById("qunit-fixture").appendChild(div);

		can.attr.set(div, "for", "my-for");
		equal(div.htmlFor, "my-for", "Map for to htmlFor");

		can.attr.set(div, "innertext", "my-inner-text");
		equal(div.innerText, "my-inner-text", "Map innertext to innerText");

		can.attr.set(div, "textcontent", "my-content");
		equal(div.textContent, "my-content", "Map textcontent to textContent");

		can.attr.set(div, "readonly", true);
		equal(div.readOnly, true, "Map readonly to readOnly");

		can.remove(can.$("#qunit-fixture>*"));
	});

	test('set class attribute via className or setAttribute for svg (#2015)', function() {
		var div = document.createElement('div');
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		var obj = { toString: function() { return 'my-class'; } };

		can.attr.set(div, 'class', 'my-class');
		equal(div.getAttribute('class'), 'my-class', 'class mapped to className');

		can.attr.set(div, 'class', undefined);
		equal(div.getAttribute('class'), '', 'an undefined className is an empty string');

		can.attr.set(div, 'class', obj);
		equal(div.getAttribute('class'), 'my-class', 'you can pass an object to className');

		can.attr.set(svg, 'class', 'my-class');
		equal(svg.getAttribute('class'), 'my-class', 'svg class was set as an attribute');

		can.attr.set(svg, 'class', undefined);
		equal(svg.getAttribute('class'), '', 'an undefined svg class is an empty string');

		can.attr.set(svg, 'class', obj);
		equal(svg.getAttribute('class'), 'my-class', 'you can pass an object to svg class');
	});

	test("set xlink:href attribute via setAttributeNS for svg-use (#2384)", function() {
		var use = document.createElementNS("http://www.w3.org/2000/svg", "use");

		can.attr.set(use, "xlink:href", "svgUri");
		equal(use.getAttributeNS("http://www.w3.org/1999/xlink", "href"), "svgUri", "svg-use xlink:href was set with setAttributeNS");
	});

	if (window.jQuery || window.Zepto) {

		test("zepto or jQuery - bind and unbind", function () {

			var div = document.createElement("div");
			var attrHandler = function(ev) {
				equal(ev.attributeName, "foo", "attribute name is correct");
				equal(ev.target, div, "target");
				equal(ev.oldValue, null, "oldValue");

				equal(div.getAttribute(ev.attributeName), "bar");

				$(div)
					.unbind("attributes", attrHandler)
					.attr("foo", "abc");

				setTimeout(function () {
					start();
				}, 20);
			};

			$(div)
				.bind("attributes", attrHandler);

			stop();
			$(div)
				.attr("foo", "bar");

		});

	}

	if (window.MooTools) {
		test("Mootools - addEvent, removeEvent, and set", function () {

			var div = document.createElement("div");
			var attrHandler = function(ev) {
				equal(ev.attributeName, "foo", "attribute name is correct");
				equal(ev.target, div, "target");
				equal(ev.oldValue, null, "oldValue");

				equal(div.getAttribute(ev.attributeName), "bar");

				$(div)
					.removeEvent("attributes", attrHandler);

				$(div)
					.set("foo", "abc");

				setTimeout(function () {
					start();
				}, 20);

			};
			$(div)
				.addEvent("attributes", attrHandler);

			stop();
			$(div)
				.set("foo", "bar");

		});
	}

	if (window.dojo) {
		test("Dojo - on, remove, and setAttr", function () {

			var div = document.createElement("div"),
				nodeList = new dojo.NodeList(div);

			var handler = nodeList.on("attributes", function (ev) {
				equal(ev.attributeName, "foo", "attribute name is correct");
				equal(ev.target, div, "target");
				equal(ev.oldValue, null, "oldValue");

				equal(div.getAttribute(ev.attributeName), "bar");

				handler.remove();

				dojo.setAttr(div, "foo", "abc");

				setTimeout(function () {
					start();
				}, 20);

			});

			stop();
			dojo.setAttr(div, "foo", "bar");

		});
	}

});
