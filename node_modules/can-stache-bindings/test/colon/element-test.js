var QUnit = require('steal-qunit');
var testHelpers = require('../helpers');

var stache = require('can-stache');
var stacheBindings = require('can-stache-bindings');

var SimpleMap = require("can-simple-map");
var DefineList = require("can-define/list/list");
var MockComponent = require("../mock-component-simple-map");
var canViewModel = require('can-view-model');

var SimpleObservable = require("can-simple-observable");
var canSymbol = require('can-symbol');
var canReflect = require('can-reflect');

var domMutate = require('can-dom-mutate');
var domMutateNode = require('can-dom-mutate/node');
var domEvents = require('can-dom-events');

var DefineMap = require("can-define/map/map");

stache.addBindings(stacheBindings);

testHelpers.makeTests("can-stache-bindings - colon - element", function(name, doc, enableMO, testIfRealDocument){

	QUnit.test("<input text> value:bind input text", function(assert) {
		var template = stache("<input value:bind='age'/>");

		var map = new SimpleMap();

		var frag = template(map);

		var ta = this.fixture;
		ta.appendChild(frag);

		var input = ta.getElementsByTagName("input")[0];
		assert.equal(input.value, "", "input value set correctly if key does not exist in map");

		map.set("age", "30");

		assert.equal(input.value, "30", "input value set correctly");

		map.set("age", "31");

		assert.equal(input.value, "31", "input value update correctly");

		input.value = "32";

		domEvents.dispatch(input, "change");

		assert.equal(map.get("age"), "32", "updated from input");
	});


	QUnit.test('<input text> el:prop:to/:from/:bind work (#280)', function(assert) {
		var template = stache(
			"<input el:value:to='scope1' value='1'/>" +
				"<input el:value:from='scope2' value='2'/>" +
				"<input el:value:bind='scope3' value='3'/>"
		);

		var scope = new SimpleMap({
			scope1: 'scope1',
			scope2: 'scope2',
			scope3: 'scope3'
		});
		var frag = template(scope);
		var ta = this.fixture;
		ta.appendChild(frag);

		var inputTo = ta.getElementsByTagName('input')[0];
		var inputFrom = ta.getElementsByTagName('input')[1];
		var inputBind = ta.getElementsByTagName('input')[2];

		// el:value:to
		assert.equal(scope.attr('scope1'), '1', 'el:value:to - scope value set from attribute');

		inputTo.value = '4';
		domEvents.dispatch(inputTo, 'change');
		assert.equal(scope.attr('scope1'), '4', 'el:value:to - scope updated when attribute changed');

		scope.attr('scope1', 'scope4');
		assert.equal(inputTo.value, '4', 'el:value:to - attribute not updated when scope changed');

		// el:value:from
		assert.equal(inputFrom.value, 'scope2', 'el:value:from - attribute set from scope');

		inputFrom.value = 'scope5';
		domEvents.dispatch(inputFrom, 'change');
		assert.equal(scope.attr('scope2'), 'scope2', 'el:value:from - scope not updated when attribute changed');

		scope.attr('scope2', 'scope6');
		assert.equal(inputFrom.value, 'scope6', 'el:value:from - attribute updated when scope changed');

		// el:value:bind
		assert.equal(inputBind.value, 'scope3', 'el:value:bind - attribute set from scope prop (parent -> child wins)');

		inputBind.value = 'scope6';
		domEvents.dispatch(inputBind, 'change');
		assert.equal(scope.attr('scope3'), 'scope6', 'el:value:bind - scope updated when attribute changed');

		scope.attr('scope3', 'scope7');
		assert.equal(inputBind.value, 'scope7', 'el:value:bind - attribute updated when scope changed');
	});

	if (System.env !== 'canjs-test') {
		QUnit.test("<input text> dynamic attribute bindings (#2016)", function(assert){
			var done = assert.async();
			var template = stache("<input value:bind='{{propName}}'/>");

			var map = new SimpleMap({propName: 'first', first: "Justin", last: "Meyer"});

			var frag = template(map);

			var ta = this.fixture;
			ta.appendChild(frag);

			var input = ta.getElementsByTagName("input")[0];
			testHelpers.afterMutation(function () {
				assert.equal(input.value, "Justin", "input value set correctly if key does not exist in map");
				map.set('propName','last');
				testHelpers.afterMutation(function (){
					assert.equal(input.value, "Meyer", "input value set correctly if key does not exist in map");

					input.value = "Lueke";
					domEvents.dispatch(input, "change");

					testHelpers.afterMutation(function () {
						assert.equal(map.get("last"), "Lueke", "updated from input");
						done();
					});
				});
			});
		});
	}

	QUnit.test("value:bind compute rejects new value (#887)", function(assert) {
		var template = stache("<input value:bind='age'/>");

		// Compute only accepts numbers
		var compute = new SimpleObservable(30);
		canReflect.assignSymbols(compute,{
			"can.setValue": function(newVal){
				if(isNaN(+newVal)) {
					// do nothing
				} else {
					this.set( +newVal );
				}
			}
		});

		var frag = template({
			age: compute
		});

		var ta = this.fixture;
		ta.appendChild(frag);

		var input = ta.getElementsByTagName("input")[0];

		// Set to non-number
		input.value = "30f";
		domEvents.dispatch(input, "change");

		assert.equal(compute.get(), 30, "Still the old value");
		assert.equal(input.value, "30", "Text input has also not changed");
	});

	QUnit.test("value:from works with camelCase and kebab-case properties", function(assert) {
		var template = stache(
			"<input value:from='theProp'/>" +
				"<input value:from='the-prop'/>"
		);

		var map = new SimpleMap({});

		var frag = template(map);

		var ta = this.fixture;
		ta.appendChild(frag);

		var camelPropInput = ta.getElementsByTagName("input")[0];
		var kebabPropInput = ta.getElementsByTagName("input")[1];

		assert.equal(camelPropInput.value, "", "input bound to camelCase prop value set correctly if camelCase key does not exist in map");
		assert.equal(kebabPropInput.value, "", "input bound to kebab-case prop value set correctly if kebab-case key does not exist in map");

		map.attr("theProp", "30");
		assert.equal(camelPropInput.value, "30", "input bound to camelCase prop value set correctly when camelCase prop changes");
		assert.equal(kebabPropInput.value, "", "input bound to kebab-case prop value not updated when camelCase prop changes");

		map.attr("theProp", "31");
		assert.equal(camelPropInput.value, "31", "input bound to camelCase prop value updated correctly when camelCase prop changes");
		assert.ok(!kebabPropInput.value, "input bound to kebab-case prop value not updated when camelCase prop changes");

		camelPropInput.value = "32";
		domEvents.dispatch(camelPropInput, "change");
		assert.equal(map.attr("theProp"), "31", "camelCase prop NOT updated when input bound to camelCase prop changes");
		assert.ok(!map.attr("the-prop"), "kebabCase prop NOT updated when input bound to camelCase prop changes");

		map.attr("the-prop", "33");
		assert.equal(kebabPropInput.value, "33", "input bound to kebab-case prop value set correctly when kebab-case prop changes");
		assert.equal(camelPropInput.value, "32", "input bound to camelCase prop value not updated when kebab-case prop changes");

		map.attr("the-prop", "34");
		assert.equal(kebabPropInput.value, "34", "input bound to kebab-case prop value updated correctly when kebab-case prop changes");
		assert.equal(camelPropInput.value, "32", "input bound to camelCase prop value not updated when kebab-case prop changes");

		kebabPropInput.value = "35";
		domEvents.dispatch(kebabPropInput, "change");
		assert.equal(map.attr("the-prop"), "34", "kebab-case prop NOT updated from input bound to kebab-case prop");
		assert.equal(map.attr("theProp"), "31", "camelCase prop NOT updated from input bound to kebab-case prop");
	});

	QUnit.test("value:to works with camelCase and kebab-case properties", function(assert) {
		var template = stache(
			"<input value:to='theProp'/>" +
				"<input value:to='the-prop'/>"
		);

		var map = new SimpleMap({});

		var frag = template(map);

		var ta = this.fixture;
		ta.appendChild(frag);

		var camelPropInput = ta.getElementsByTagName("input")[0];
		var kebabPropInput = ta.getElementsByTagName("input")[1];

		camelPropInput.value = "32";
		domEvents.dispatch(camelPropInput, "change");
		assert.equal(map.attr("theProp"), "32", "camelCaseProp updated from input bound to camelCase Prop");
		assert.ok(!map.attr("the-prop"), "kebabCaseProp NOT updated from input bound to camelCase Prop");

		map.attr("theProp", "30");
		assert.equal(camelPropInput.value, "32", "input bound to camelCase Prop value NOT updated when camelCase prop changes");
		assert.ok(!kebabPropInput.value, "input bound to kebabCase Prop value NOT updated when camelCase prop changes");

		kebabPropInput.value = "33";
		domEvents.dispatch(kebabPropInput, "change");
		assert.equal(map.attr("the-prop"), "33", "kebabCaseProp updated from input bound to kebabCase Prop");
		assert.equal(map.attr("theProp"), "30", "camelCaseProp NOT updated from input bound to camelCase Prop");

		map.attr("theProp", "34");
		assert.equal(kebabPropInput.value, "33", "input bound to kebabCase Prop value NOT updated when kebabCase prop changes");
		assert.equal(camelPropInput.value, "32", "input bound to camelCase Prop value NOT updated when kebabCase prop changes");
	});


	QUnit.test("value:bind works with camelCase and kebab-case properties", function(assert) {
		var template = stache(
			"<input value:bind='theProp'/>" +
				"<input value:bind='the-prop'/>"
		);

		var map = new SimpleMap({});

		var frag = template(map);

		var ta = this.fixture;
		ta.appendChild(frag);

		var camelPropInput = ta.getElementsByTagName("input")[0];
		var kebabPropInput = ta.getElementsByTagName("input")[1];

		camelPropInput.value = "32";
		domEvents.dispatch(camelPropInput, "change");
		assert.equal(map.attr("theProp"), "32", "camelCaseProp updated from input bound to camelCase Prop");
		assert.ok(!map.attr("the-prop"), "kebabCaseProp NOT updated from input bound to camelCase Prop");

		map.attr("theProp", "30");
		assert.equal(camelPropInput.value, "30", "input bound to camelCase Prop value updated when camelCase prop changes");
		assert.ok(!kebabPropInput.value, "input bound to kebabCase Prop value NOT updated when camelCase prop changes");

		kebabPropInput.value = "33";
		domEvents.dispatch(kebabPropInput, "change");
		assert.equal(map.attr("the-prop"), "33", "kebabCaseProp updated from input bound to kebabCase Prop");
		assert.equal(map.attr("theProp"), "30", "camelCaseProp NOT updated from input bound to camelCase Prop");

		map.attr("theProp", "34");
		assert.equal(kebabPropInput.value, "33", "input bound to kebabCase Prop value NOT updated when kebabCase prop changes");
		assert.equal(camelPropInput.value, "34", "input bound to camelCase Prop value updated when kebabCase prop changes");
	});


	QUnit.test("Bracket expression with dot and no explicit root and value:bind", function(assert) {
		var template;
		var div = this.fixture;

		template = stache('<input value:bind="[\'two.hops\']" >');


		var data = new SimpleMap();
		// var data = new DefineMap({
		// 	"two.hops": ""
		// });

		var dom = template(data);
		div.appendChild(dom);
		var input = div.getElementsByTagName('input')[0];

		assert.equal(input.value, "", "input value set correctly if key does not exist in map");

		data.set("two.hops", "slide to the left");

		assert.equal(input.value, "slide to the left", "input value set correctly");

		data.set("two.hops", "slide to the right");

		assert.equal(input.value, "slide to the right", "input value update correctly");

		input.value = "REVERSE REVERSE";

		domEvents.dispatch(input, "change");

		assert.equal(data.get("two.hops"), "REVERSE REVERSE", "updated from input");
	});


	QUnit.test("Bracket expression with colon and no explicit root and value:bind", function(assert) {
		var template;
		var div = this.fixture;

		template = stache('<input value:bind="[\'two:hops\']" >');

		var data = new SimpleMap();
		// var data = new DefineMap({
		// 	"two.hops": ""
		// });

		var dom = template(data);
		div.appendChild(dom);
		var input = div.getElementsByTagName('input')[0];

		assert.equal(input.value, "", "input value set correctly if key does not exist in map");

		data.set("two:hops", "slide to the left");

		assert.equal(input.value, "slide to the left", "input value set correctly");

		data.set("two:hops", "slide to the right");

		assert.equal(input.value, "slide to the right", "input value update correctly");

		input.value = "REVERSE REVERSE";

		domEvents.dispatch(input, "change");

		assert.equal(data.get("two:hops"), "REVERSE REVERSE", "updated from input");
	});


	QUnit.test('el:prop:to/:from/:bind work (#280)', function(assert) {
		var template = stache(
			"<input el:value:to='scope1' value='1'/>" +
				"<input el:value:from='scope2' value='2'/>" +
				"<input el:value:bind='scope3' value='3'/>"
		);

		var scope = new SimpleMap({
			scope1: 'scope1',
			scope2: 'scope2',
			scope3: 'scope3'
		});
		var frag = template(scope);
		var ta = this.fixture;
		ta.appendChild(frag);

		var inputTo = ta.getElementsByTagName('input')[0];
		var inputFrom = ta.getElementsByTagName('input')[1];
		var inputBind = ta.getElementsByTagName('input')[2];

		// el:value:to
		assert.equal(scope.attr('scope1'), '1', 'el:value:to - scope value set from attribute');

		inputTo.value = '4';
		domEvents.dispatch(inputTo, 'change');
		assert.equal(scope.attr('scope1'), '4', 'el:value:to - scope updated when attribute changed');

		scope.attr('scope1', 'scope4');
		assert.equal(inputTo.value, '4', 'el:value:to - attribute not updated when scope changed');

		// el:value:from
		assert.equal(inputFrom.value, 'scope2', 'el:value:from - attribute set from scope');

		inputFrom.value = 'scope5';
		domEvents.dispatch(inputFrom, 'change');
		assert.equal(scope.attr('scope2'), 'scope2', 'el:value:from - scope not updated when attribute changed');

		scope.attr('scope2', 'scope6');
		assert.equal(inputFrom.value, 'scope6', 'el:value:from - attribute updated when scope changed');

		// el:value:bind
		assert.equal(inputBind.value, 'scope3', 'el:value:bind - attribute set from scope prop (parent -> child wins)');

		inputBind.value = 'scope6';
		domEvents.dispatch(inputBind, 'change');
		assert.equal(scope.attr('scope3'), 'scope6', 'el:value:bind - scope updated when attribute changed');

		scope.attr('scope3', 'scope7');
		assert.equal(inputBind.value, 'scope7', 'el:value:bind - attribute updated when scope changed');
	});


	QUnit.test("<input text> two-way - DOM - input text (#1700)", function(assert) {

		var template = stache("<input value:bind='age'/>");

		var map = new SimpleMap();

		var frag = template(map);

		var ta = this.fixture;
		ta.appendChild(frag);

		var input = ta.getElementsByTagName("input")[0];
		assert.equal(input.value, "", "input value set correctly if key does not exist in map");

		map.attr("age", "30");

		var done = assert.async();
		testHelpers.afterMutation(function () {

			assert.equal(input.value, "30", "input value set correctly");

			map.attr("age", "31");


			testHelpers.afterMutation(function () {

				assert.equal(input.value, "31", "input value update correctly");

				input.value = "32";

				domEvents.dispatch(input, "change");


				testHelpers.afterMutation(function () {
					done();
					assert.equal(map.attr("age"), "32", "updated from input");
				});
			});
		});
	});

	QUnit.test("errors subproperties of undefined properties (#298)", function(assert) {
		try {
			stache("<input value:to='prop.subprop'/>")();
			assert.ok(true, "renderer was made without error");
		}
		catch(e) {
			assert.ok(false, e.message);
		}
	});

	QUnit.test("updates happen on two-way even when one binding is satisfied", function(assert) {
		var done = assert.async();
		var template = stache('<input value:bind="firstName"/>');
		var viewModel = new SimpleMap({ firstName: "jeffrey" });
		canReflect.assignSymbols(viewModel,{
			"can.setKeyValue": function(key, val) {
				if(val) {
					this.set(key, val.toLowerCase());
				}
			}
		});

		var frag = template(viewModel);
		domMutateNode.appendChild.call(this.fixture, frag);

		var input = this.fixture.firstChild;
		assert.equal(input.value, "jeffrey", 'initial value should be "jeffrey"');

		input.value = "JEFFREY";
		domEvents.dispatch(input, "change");
		assert.equal(input.value, "jeffrey", 'updated value should be "jeffrey"');
		testHelpers.afterMutation(function () {
			done();
		});
	});

	QUnit.test("updates happen on changed two-way even when one binding is satisfied", function(assert) {
		var done = assert.async();
		var template = stache('<input value:bind="{{bindValue}}"/>');

		var ViewModel = DefineMap.extend({
			firstName: {
				set: function(newValue) {
					if(newValue) {
						return newValue.toLowerCase();
					}
				}
			},
			lastName: {
				set: function(newValue) {
					if(newValue) {
						return newValue.toLowerCase();
					}
				}
			},
			bindValue: "string"
		});
		var viewModel = new ViewModel({ firstName: "Jeffrey", lastName: "King", bindValue: "firstName" });

		var frag = template(viewModel);
		domMutateNode.appendChild.call(this.fixture, frag);

		var input = this.fixture.firstChild;
		testHelpers.afterMutation(function () {

			assert.equal(input.value, "jeffrey");


			var undo = domMutate.onNodeAttributeChange(input, function() {

				undo();
				assert.equal(input.value, "king", "should be king");

				// set the value to "KING" after the current batch
				setTimeout(function(){
					input.value = "KING";
					domEvents.dispatch(input, "change");
					assert.equal(input.value, "king");
					done();
				},13);


			}.bind(this));

			viewModel.bindValue = "lastName";
		}.bind(this));
	});

	QUnit.test("value:bind memory leak (#2270)", function(assert) {


		var template = stache('<div><input value:bind="foo"></div>');

		var vm = new SimpleMap({foo: ''});

		var frag = template(vm);

		var ta = this.fixture;
		domMutateNode.appendChild.call(ta,frag);

		var done = assert.async();

		testHelpers.afterMutation(function (){
			domMutateNode.removeChild.call(ta, ta.firstChild);
			// still 1 binding, should be 0
			testHelpers.afterMutation(function (){
				var checkCount = 0;
				var checkLifecycleBindings = function(){
					var meta = vm[canSymbol.for("can.meta")];

					if( meta.handlers.get([]).length === 0 ) {
						assert.ok(true, "no bindings");
						done();
					} else {
						checkCount++;
						if (checkCount > 5) {
							assert.ok(false, "lifecycle bindings still existed after timeout");
							return done();
						}
						setTimeout(checkLifecycleBindings, 1000);
					}
				};
				checkLifecycleBindings();
			});
		});

	});

	QUnit.test("converters work (#2299)", function(assert) {
		stache.registerConverter("numberToString",{
			get: function(source){
				return source() + "";
			},
			set: function(newVal, source){
				source(newVal === "" ? null : +newVal );
			}
		});

		var template = stache('<input value:bind="numberToString(~age)">');

		var map = new SimpleMap({age: 25});

		var frag = template(map);

		assert.equal(frag.firstChild.value, "25");
		assert.equal(map.get("age"), 25);

		map.set("age",33);

		assert.equal(frag.firstChild.value, "33");
		assert.equal(map.get("age"), 33);

		frag.firstChild.value = "1";

		domEvents.dispatch(frag.firstChild, "change");

		var done = assert.async();
		testHelpers.afterMutation(function () {
			done();
			assert.equal(frag.firstChild.value, "1");
			assert.equal(map.get("age"), 1);
		});

	});

	testIfRealDocument("<input radio> checked:bind should trigger a radiochange event for radio buttons", function(assert) {
		// NOTE: `testIfRealDocument` is used because the vdom does not simulate document event dispatch
		var template = stache([
			'<input type="radio" name="baz" checked:bind="foo"/><span>{{foo}}</span>',
			'<input type="radio" name="baz" checked:bind="bar"/><span>{{bar}}</span>'
		].join(''));
		var data = new SimpleMap({
			foo: false,
			bar: false
		});
		var fragment = template(data);
		domMutateNode.appendChild.call(this.fixture, fragment);

		var self = this;
		function child (index) {
			return self.fixture.childNodes.item(index);
		}

		var fooRadio = child(0);
		var fooText = child(1);
		var barRadio = child(2);
		var barText = child(3);

		function text (node) {
			while (node && node.nodeType !== 3) {
				node = node.firstChild;
			}
			return node && node.nodeValue;
		}

		fooRadio.checked = true;
		domEvents.dispatch(fooRadio, 'change');

		barRadio.checked = true;
		domEvents.dispatch(barRadio, 'change');

		assert.equal(text(fooText), 'false', 'foo text is false');
		assert.equal(text(barText), 'true', 'bar text is true');

		assert.equal(data.get("foo"), false);
		assert.equal(data.get("bar"), true);
	});

	QUnit.test('<input radio> change event handler set up when binding on radiochange (#206)', function(assert) {

		var template = stache('<input type="radio" checked:bind="attending" />');

		var map = new SimpleMap({
			attending: false
		});

		var frag = template(map);
		var input = frag.firstChild;

		input.checked = true;
		domEvents.dispatch(input, "change");

		assert.equal(map.get('attending'), true, "now it is true");
	});

	QUnit.test('<input checkbox> one-way - DOM - with undefined (#135)', function(assert) {
		var data = new SimpleMap({
			completed: undefined
		}),
		frag = stache('<input type="checkbox" el:checked:from="completed"/>')(data);

		domMutateNode.appendChild.call(this.fixture, frag);

		var input = this.fixture.getElementsByTagName('input')[0];
		assert.equal(input.checked, false, 'checkbox value should be false for undefined');
	});

	QUnit.test('<input checkbox> two-way - DOM - with truthy and falsy values binds to checkbox (#1700)', function(assert) {
		var data = new SimpleMap({
			completed: 1
		}),
		frag = stache('<input type="checkbox" el:checked:bind="completed"/>')(data);

		domMutateNode.appendChild.call(this.fixture, frag);

		var input = this.fixture.getElementsByTagName('input')[0];
		assert.equal(input.checked, true, 'checkbox value bound (via attr check)');
		data.attr('completed', 0);
		var done = assert.async();

		testHelpers.afterMutation(function () {
			done();
			assert.equal(input.checked, false, 'checkbox value bound (via attr check)');
		});
	});

	QUnit.test("<input checkbox> checkboxes with checked:bind bind properly (#628)", function(assert) {
		var data = new SimpleMap({
			completed: true
		}),
		frag = stache('<input type="checkbox" checked:bind="completed"/>')(data);

		domMutateNode.appendChild.call(this.fixture, frag);

		var input = this.fixture.getElementsByTagName('input')[0];
		assert.equal(input.checked, data.get('completed'), 'checkbox value bound (via attr check)');

		data.attr('completed', false);
		assert.equal(input.checked, data.get('completed'), 'checkbox value bound (via attr uncheck)');
		input.checked = true;
		domEvents.dispatch(input, 'change');
		assert.equal(input.checked, true, 'checkbox value bound (via check)');
		assert.equal(data.get('completed'), true, 'checkbox value bound (via check)');
		input.checked = false;
		domEvents.dispatch(input, 'change');
		assert.equal(input.checked, false, 'checkbox value bound (via uncheck)');
		assert.equal(data.get('completed'), false, 'checkbox value bound (via uncheck)');
	});

	testIfRealDocument("<select> keeps its value as <option>s change with {{#each}} (#1762)", function(assert){
		var template = stache("<select value:bind='id'>{{#each values}}<option value='{{this}}'>{{this}}</option>{{/each}}</select>");
		var values = new SimpleObservable( ["1","2","3","4"] );
		var id = new SimpleObservable("2");
		var frag = template({
			values: values,
			id: id
		});
		var done = assert.async();
		var select = frag.firstChild;
		var options = select.getElementsByTagName("option");
		// the value is set asynchronously
		testHelpers.afterMutation(function (){
			assert.ok(options[1].selected, "value is initially selected");
			values.set(["7","2","5","4"]);

			testHelpers.afterMutation(function (){
				assert.ok(options[1].selected, "after changing options, value should still be selected");
				done();
			});
		});

	});

	testIfRealDocument("<select> with undefined value selects option without value", function(assert) {

		var template = stache("<select value:bind='opt'><option>Loading...</option></select>");

		var map = new SimpleMap();

		var frag = template(map);

		var ta = this.fixture;
		ta.appendChild(frag);

		var select = ta.childNodes.item(0);
		assert.equal(select.selectedIndex, 0, 'Got selected index');
	});

	testIfRealDocument('<select> two-way bound values that do not match a select option set selectedIndex to -1 (#2027)', function(assert) {
		var renderer = stache('<select el:value:bind="key"><option value="foo">foo</option><option value="bar">bar</option></select>');
		var map = new SimpleMap({ });
		var frag = renderer(map);

		assert.equal(frag.firstChild.selectedIndex, 0, 'undefined <- {($first value)}: selectedIndex = 0');

		map.attr('key', 'notfoo');
		var done = assert.async();

		testHelpers.afterMutation(function () {
			assert.equal(frag.firstChild.selectedIndex, -1, 'notfoo: selectedIndex = -1');

			map.attr('key', 'foo');
			assert.strictEqual(frag.firstChild.selectedIndex, 0, 'foo: selectedIndex = 0');

			map.attr('key', 'notbar');


			testHelpers.afterMutation(function () {
				done();
				assert.equal(frag.firstChild.selectedIndex, -1, 'notbar: selectedIndex = -1');

				map.attr('key', 'bar');
				assert.strictEqual(frag.firstChild.selectedIndex, 1, 'bar: selectedIndex = 1');

				map.attr('key', 'bar');
				assert.strictEqual(frag.firstChild.selectedIndex, 1, 'bar (no change): selectedIndex = 1');
			});
		});
	});

	QUnit.test("<select multiple> Multi-select empty string works(#1263)", function(assert) {

		var data = new SimpleMap({
			isMultiple: 1,
			isSelect: 1,
			name: "attribute_ 0",
			options: new DefineList([
				{label: 'empty', value: ""},
				{label: 'zero', value: 0},
				{label: 'one', value: 1},
				{label: 'two', value: 2},
				{label: 'three', value: 3},
				{label: 'four', value: 4}
			]),
			value: new DefineList(["1"])
		});

		var template = stache("<select {{#if isMultiple}}multiple{{/if}} values:bind='value'> " +
			"{{#each options}} <option value='{{value}}' >{{label}}</option>{{/each}} </select>");

		var frag = template(data);

		assert.equal(frag.firstChild.getElementsByTagName("option")[0].selected, false, "The first empty value is not selected");
		assert.equal(frag.firstChild.getElementsByTagName("option")[2].selected, true, "One is selected");

	});

	testIfRealDocument("<select multiple> applies initial value, when options rendered from array (#1414)", function(assert) {
		var template = stache(
			"<select values:bind='colors' multiple>" +
				"{{#each allColors}}<option value='{{value}}'>{{label}}</option>{{/each}}" +
				"</select>");

		var map = new SimpleMap({
			colors: new DefineList(["red", "green"]),
			allColors: new DefineList([
				{ value: "red", label: "Red"},
				{ value: "green", label: "Green"},
				{ value: "blue", label: "Blue"}
			])
		});

		var done = assert.async();
		var frag = template(map);

		var ta = this.fixture;
		ta.appendChild(frag);

		var select = ta.getElementsByTagName("select")[0],
			options = select.getElementsByTagName("option");

		// Wait for Multiselect.set() to be called.
		testHelpers.afterMutation(function (){
			assert.ok(options[0].selected, "red should be set initially");
			assert.ok(options[1].selected, "green should be set initially");
			assert.ok(!options[2].selected, "blue should not be set initially");
			done();
		});

	});



	QUnit.test("<select> one-way bindings keep value if options are replaced - each (#1762)", function(assert) {
		var countries = [{code: 'MX', countryName:'MEXICO'},
			{code: 'US', countryName:'USA'}
		];

		var data = new SimpleMap({
			countryCode: 'US',
			countries: new DefineList(countries)
		});

		var template = stache('<select el:value:from="countryCode">'+
			'{{#each countries}}'+
			'<option value="{{code}}">{{countryName}}</option>'+
			'{{/each}}'+
			'</select>');

		var frag = template(data);
		var select = frag.firstChild;
		var done = assert.async();
		testHelpers.afterMutation(function (){

			data.get("countries").replace([]);

			testHelpers.afterMutation(function (){
				data.attr("countries").replace(countries);

				assert.equal(data.attr("countryCode"), "US", "country kept as USA");

				testHelpers.afterMutation(function (){
					assert.ok( select.getElementsByTagName("option")[1].selected, "USA still selected");
				});

				done();
			});

		});

	});

	testIfRealDocument("<select> value:bind select single", function(assert) {

		var template = stache(
			"<select value:bind='color'>" +
				"<option value='red'>Red</option>" +
				"<option value='green'>Green</option>" +
				"</select>");

		var map = new SimpleMap({
			color: "red"
		});

		var frag = template(map);

		var ta = this.fixture;
		ta.appendChild(frag);

		var inputs = ta.getElementsByTagName("select");

		assert.equal(inputs[0].value, 'red', "default value set");

		map.set("color", "green");
		assert.equal(inputs[0].value, 'green', "alternate value set");


		canReflect.each(ta.getElementsByTagName('option'), function(opt) {
			if (opt.value === 'red') {
				opt.selected = 'selected';
			}
		});

		assert.equal(map.get("color"), "green", "not yet updated from input");
		domEvents.dispatch(inputs[0], "change");
		assert.equal(map.get("color"), "red", "updated from input");

		canReflect.each(ta.getElementsByTagName('option'), function(opt) {
			if (opt.value === 'green') {
				opt.selected = 'selected';
			}
		});
		assert.equal(map.get("color"), "red", "not yet updated from input");
		domEvents.dispatch(inputs[0], "change");
		assert.equal(map.get("color"), "green", "updated from input");
	});


	testIfRealDocument("<select> values:bind multiple select with a DefineList", function(assert) {

		var template = stache(
			"<select values:bind='colors' multiple>" +
				"<option value='red'>Red</option>" +
				"<option value='green'>Green</option>" +
				"<option value='ultraviolet'>Ultraviolet</option>" +
				"</select>");

		var list = new DefineList();

		var done = assert.async();
		var frag = template({
			colors: list
		});

		var ta = this.fixture;
		ta.appendChild(frag);

		var select = ta.getElementsByTagName("select")[0],
			options = select.getElementsByTagName('option');

		// Wait for Multiselect.set() to be called.
		setTimeout(function(){
			// Test updating the DOM changes observable values
			options[0].selected = true;
			domEvents.dispatch(select, "change");

			assert.deepEqual(list.get(), ["red"], "A DefineList value is set even if none existed");

			options[1].selected = true;
			domEvents.dispatch(select, "change");

			assert.deepEqual(list.get(), ["red", "green"], "Adds items to the list");

			options[0].selected = false;
			domEvents.dispatch(select, "change");

			assert.deepEqual(list.get(), ["green"], "Removes items from the list");

			// Test changing observable values changes the DOM

			list.push("ultraviolet");
			options[0].selected = false;
			options[1].selected = true;
			options[2].selected = true;

			ta.removeChild(select);
			done();
		}, 1);
	});

	QUnit.test("<select> one-way bindings keep value if options are replaced (#1762)", function(assert) {
		var countries = [{code: 'MX', countryName:'MEXICO'},
			{code: 'US', countryName:'USA'}
		];

		var data = new SimpleMap({
			countryCode: 'US',
			countries: new DefineList(countries)
		});

		var template = stache('<select el:value:from="countryCode">'+
			'{{#countries}}'+
			'<option value="{{code}}">{{countryName}}</option>'+
			'{{/countries}}'+
			'</select>');

		var frag = template(data);
		var select = frag.firstChild;
		var done = assert.async();
		testHelpers.afterMutation(function (){

			data.get("countries").replace([]);

			testHelpers.afterMutation(function (){
				data.get("countries").replace(countries);

				assert.equal(data.get("countryCode"), "US", "country kept as USA");

				testHelpers.afterMutation(function (){
					assert.ok( select.getElementsByTagName("option")[1].selected, "USA still selected");
				});

				done();
			});

		});

	});

	testIfRealDocument("<select> two-way bindings update to `undefined` if options are replaced - each (#1762)", function(assert){
		var countries = [{code: 'MX', countryName:'MEXICO'},
			{code: 'US', countryName:'USA'}
		];

		var data = new SimpleMap({
			countryCode: 'US',
			countries: new DefineList(countries)
		});

		var template = stache('<select el:value:bind="countryCode">'+
			'{{#each countries}}'+
			'<option value="{{code}}">{{countryName}}</option>'+
			'{{/each}}'+
			'</select>');

		template(data);
		var done = assert.async();
		testHelpers.afterMutation(function (){
			data.attr("countries").replace([]);


			testHelpers.afterMutation(function (){
				assert.equal(data.get("countryCode"), undefined, "countryCode set to undefined");

				done();
			});

		});

	});

	testIfRealDocument('<select> - previously non-existing select value gets selected from a list when it is added (#1762)', function(assert) {
		// this breaks with VDOM can-stache-bindings#258 because of selectedIndex
		var template = stache('<select el:value:bind="{person}">' +
			'<option></option>' +
			'{{#each people}}<option value="{{.}}">{{.}}</option>{{/each}}' +
			'</select>' +
			'<input type="text" size="5" el:value:bind="person">'
		);

		var people = new DefineList([
			"Justin",
			"Zed",
			"Tom",
			"Paula"
		]);

		var vm = new SimpleMap({
			person: 'Brian',
			people: people
		});

		var done = assert.async();
		vm.on('person', function(ev, newVal, oldVal) {
			assert.ok(false, 'person attribute should not change');
		});

		var frag = template(vm);

		assert.equal(vm.attr('person'), 'Brian', 'Person is still set');

		testHelpers.afterMutation(function () {
			people.push('Brian');
			testHelpers.afterMutation(function() {
				var options = frag.firstChild.getElementsByTagName("option");
				assert.ok(options[options.length - 1].selected, 'New child should be selected');
				done();
			});
		});
	});

	QUnit.test("<select> select bindings respond to changes immediately or during insert using bind (#2134)", function(assert) {
		var countries = [{code: 'MX', countryName:'MEXICO'},
			{code: 'US', countryName:'USA'},
			{code: 'IND', countryName:'INDIA'},
			{code: 'RUS', countryName:'RUSSIA'}
		];

		var template = stache('<select value:bind="countryCode">'+
			'{{#each countries}}'+
			'<option value="{{code}}">{{countryName}}</option>'+
			'{{/each}}'+
			'</select>');

		var data = new SimpleMap({
			countryCode: 'US',
			countries: new DefineList(countries)
		});

		var frag = template(data);
		data.set('countryCode', 'IND');

		var done = assert.async();
		testHelpers.afterMutation(function (){
			done();
			assert.equal(frag.firstChild.value, "IND", "got last updated value");
		});

	});

	testIfRealDocument("<select> two way bound select empty string null or undefined value (#2027)", function(assert) {

		var template = stache(
			"<select id='null-select' value:bind='color-1'>" +
				"<option value=''>Choose</option>" +
				"<option value='red'>Red</option>" +
				"<option value='green'>Green</option>" +
				"</select>" +
				"<select id='undefined-select' value:bind='color-2'>" +
				"<option value=''>Choose</option>" +
				"<option value='red'>Red</option>" +
				"<option value='green'>Green</option>" +
				"</select>"+
				"<select id='string-select' value:bind='color-3'>" +
				"<option value=''>Choose</option>" +
				"<option value='red'>Red</option>" +
				"<option value='green'>Green</option>" +
				"</select>");

		var map = new SimpleMap({
			'color-1': null,
			'color-2': undefined,
			'color-3': ""
		});
		var done = assert.async();
		var frag = template(map);
		domMutateNode.appendChild.call(this.fixture, frag);

		var nullInput = doc.getElementById("null-select");
		var nullInputOptions = nullInput.getElementsByTagName('option');
		var undefinedInput = doc.getElementById("undefined-select");
		var undefinedInputOptions = undefinedInput.getElementsByTagName('option');
		var stringInput = doc.getElementById("string-select");
		var stringInputOptions = stringInput.getElementsByTagName('option');

		// wait for set to be called which will change the selects
		testHelpers.afterMutation(function (){
			assert.ok(!nullInputOptions[0].selected, "default (null) value set");
			// the first item is selected because "" is the value.
			assert.ok(undefinedInputOptions[0].selected, "default (undefined) value set");
			assert.ok(stringInputOptions[0].selected, "default ('') value set");
			done();
		});
	});

	testIfRealDocument("<select> two way binding from a select's value to null has no selection (#2027)", function(assert){
		var template = stache("<select value:bind='key'><option value='One'>One</option></select>");
		var map = new SimpleMap({key: null});

		var frag = template(map);
		var select = frag.childNodes.item(0);

		testHelpers.afterMutation(function (){
			assert.equal(select.selectedIndex, -1, "selectedIndex is 0 because no value exists on the map");
			assert.equal(map.get("key"), null, "The map's value property is set to the select's value");
			done();
		});

		var done = assert.async();

	});

	testIfRealDocument("<select> One way binding from a select's value to a parent compute updates the parent with the select's initial value (#2027)", function(assert){
		var template = stache("<select value:to='value'><option value='One'>One</option></select>");
		var map = new SimpleMap();

		var frag = template(map);
		var select = frag.childNodes.item(0);

		testHelpers.afterMutation(function (){
			assert.equal(select.selectedIndex, 0, "selectedIndex is 0 because no value exists on the map");
			assert.equal(map.attr("value"), "One", "The map's value property is set to the select's value");
			done();
		});

		var done = assert.async();

	});

	testIfRealDocument("Bi-directional binding among sibling components, new syntax (#325)", function(assert) {
		var groupCollapsed = console.groupCollapsed;
		if(groupCollapsed) {
			console.groupCollapsed = null; //no op
		}


		var demoContext = new DefineMap({
			person: ''
		});

		var SourceComponentVM = DefineMap.extend("SourceComponentVM",{
			defaultPerson: {
				value: 'John'
			},
			person: {
				set: function(val) {
					return val || this.defaultPerson;
				}
			}
		});

		var ClearComponentVM = DefineMap.extend("ClearComponentVM",{
			person: 'string',
			clearPerson: function() {
				this.set('person', '');
			}
		});

		MockComponent.extend({
			tag: "source-component",
			viewModel: SourceComponentVM,
			template: stache('<span>{{person}}</span><input type="text" value:bind="./person" />')
		});

		MockComponent.extend({
			tag: "clear-button",
			viewModel: ClearComponentVM,
			template: stache('<input type="button" value="Clear" on:click="./clearPerson()" /><span>{{./person}}</span>')
		});

		var demoRenderer = stache(
			'<span>{{./person}}</span>' +
			'<source-component person:bind="./person" />' +
			'<clear-button person:bind="./person" />'
		);

		var frag = demoRenderer(demoContext);

		var sourceComponentVM = canViewModel(frag.childNodes[1]);
		var clearButtonVM = canViewModel(frag.childNodes[2]);

		assert.equal(frag.childNodes[0].childNodes[0].nodeValue, '', "demoContext person is empty");
		assert.equal(frag.childNodes[1].childNodes[0].childNodes[0].nodeValue, 'John', "source-component person is default");
		assert.equal(frag.childNodes[2].childNodes[1].childNodes[0].nodeValue, '', "clear-button person is empty");

		sourceComponentVM.person = 'Bob';

		assert.equal(frag.childNodes[0].childNodes[0].nodeValue, 'Bob', "demoContext person set correctly");
		assert.equal(frag.childNodes[1].childNodes[0].childNodes[0].nodeValue, 'Bob', "source-component person set correctly");
		assert.equal(frag.childNodes[2].childNodes[1].childNodes[0].nodeValue, 'Bob', "clear-button person set correctly");

		clearButtonVM.clearPerson();

		// Note that 'John' will not be set on the parent or clear button because parent was already set
		// to an empty string and the bindingSemaphore will not allow another change to the parent
		// (giving the parent priority) to prevent cyclic dependencies.
		assert.equal(frag.childNodes[0].childNodes[0].nodeValue, '', "demoContext person set correctly");
		assert.equal(frag.childNodes[1].childNodes[0].childNodes[0].nodeValue, 'John', "source-component person set correctly");
		assert.equal(frag.childNodes[2].childNodes[1].childNodes[0].nodeValue, '', "clear-button person set correctly");

		if(groupCollapsed) {
			console.groupCollapsed = groupCollapsed;
		}
	});

	testIfRealDocument("Bracket Expression with :to bindings", function(assert) {
		var demoContext = new DefineMap({
			person: {
				name: 'Matt'
			}
		});

		var SourceComponentVM = DefineMap.extend("SourceComponentVM", {
			name: {
				default: 'Kevin'
			}
		});

		MockComponent.extend({
			tag: "source-component",
			viewModel: SourceComponentVM,
			template: stache('<span>{{name}}</span>')
		});

		var demoRenderer = stache(
			'<source-component name:to="person[\'name\']" />'
		);

		demoRenderer(demoContext);

		assert.equal(demoContext.person.name, 'Kevin', "source-component has correct name set");
	});

	QUnit.test('this:to works', function(assert) {

		var template = stache('<input this:to="this.input" />');

		var map = new SimpleMap({
			input: null
		});

		var frag = template(map);
		var input = frag.firstChild;

		assert.equal(input, map.get("input"), "set the input");
	});

});
