var QUnit = require("steal-qunit");

var canData = require('can-dom-data');
var helpers = require("./helpers");
var SimpleMap = require("can-simple-map");
var stache = require("can-stache");
var Component = require("can-component");
var canViewModel = require('can-view-model');
var DefineMap = require('can-define/map/map');
var DefineList = require("can-define/list/list");
var Scope = require("can-view-scope");
var SetterObservable = require("can-simple-observable/setter/setter");
var SimpleObservable = require("can-simple-observable");
var canReflect = require("can-reflect");
var canSymbol = require('can-symbol');
var domEvents = require('can-dom-events');
var domMutateNode = require('can-dom-mutate/node');
var Construct = require("can-construct");
var tag = require('can-view-callbacks').tag;

var innerHTML = function(el){
	return el && el.innerHTML;
};

helpers.makeTests("can-component viewModels", function(){

	QUnit.test("a SimpleMap constructor as .ViewModel", function(assert) {

		var map = new SimpleMap({name: "Matthew"});

		Component.extend({
			tag: "can-map-viewmodel",
			view: stache("{{name}}"),
			ViewModel: function(){
				return map;
			}
		});

		var renderer = stache("<can-map-viewmodel></can-map-viewmodel>");
		assert.equal(renderer().firstChild.firstChild.nodeValue, "Matthew");
	});



	QUnit.test("a SimpleMap as viewModel", function(assert) {

		var me = new SimpleMap({
		 name: "Justin"
	 });

		Component.extend({
		 tag: 'my-viewmodel',
		 view: stache("{{name}}}"),
		 viewModel: me
	 });

		var renderer = stache('<my-viewmodel></my-viewmodel>');
		assert.equal(renderer().firstChild.firstChild.nodeValue, "Justin");

	});

	QUnit.test("a SimpleMap constructor as viewModel", function(assert) {
		var MyMap = SimpleMap.extend({
		 setup: function(props){
			props.name = "Matthew";
			return SimpleMap.prototype.setup.apply(this, arguments);
		}
	});

		Component.extend({
		 tag: "can-map-viewmodel",
		 view: stache("{{name}}"),
		 viewModel: MyMap
	 });

		var renderer = stache("<can-map-viewmodel></can-map-viewmodel>");
		assert.equal(renderer().firstChild.firstChild.nodeValue, "Matthew");
	});

	QUnit.test("an object is turned into a SimpleMap as viewModel", function(assert) {
		Component.extend({
		 tag: "can-map-viewmodel",
		 view: stache("{{name}}"),
		 viewModel: {
			name: "Matthew"
		}
	});

		var renderer = stache("<can-map-viewmodel></can-map-viewmodel>");

		var fragOne = renderer();
		var vmOne = canViewModel(fragOne.firstChild);

		var fragTwo = renderer();

		vmOne.set("name", "Wilbur");

		assert.equal(fragOne.firstChild.firstChild.nodeValue, "Wilbur", "The first map changed values");
		assert.equal(fragTwo.firstChild.firstChild.nodeValue, "Matthew", "The second map did not change");
	});

	QUnit.test("Providing viewModel and ViewModel throws", function(assert) {
		try {
		 Component.extend({
			tag: "viewmodel-test",
			view: stache("<div></div>"),
			viewModel: {},
			ViewModel: SimpleMap.extend({})
		});

		 assert.ok(false, "Should have thrown because we provided both");
	 } catch(er) {
		 assert.ok(true, "It threw because we provided both viewModel and ViewModel");
	 }
 });

	QUnit.test("canViewModel utility", function(assert) {
		Component({
			tag: "my-taggy-tag",
			view: stache("<h1>hello</h1>"),
			viewModel: function(){
				return new SimpleMap({
					foo: "bar"
				});
			}
		});

		var frag = stache("<my-taggy-tag id='x'></my-taggy-tag>")();


		var el = frag.firstChild;

		assert.equal(canViewModel(el), el[canSymbol.for('can.viewModel')], "one argument grabs the viewModel object");
		assert.equal(canViewModel(el, "foo"), "bar", "two arguments fetches a value");
		canViewModel(el, "foo", "baz");
		assert.equal(canViewModel(el, "foo"), "baz", "Three arguments sets the value");
	});

	QUnit.test('setting passed variables - two way binding', function(assert) {
		Component.extend({
		 tag: "my-toggler",
		 view: stache("{{#if visible}}<content/>{{/if}}"),
		 leakScope: true,
		 ViewModel: DefineMap.extend({
			visible: {value: true},
			show: function () {
			 this.set('visible', true);
		 },
		 hide: function () {
			 this.set("visible", false);
		 }
	 })
	 });

		Component.extend({
		 tag: "my-app",
		 ViewModel: DefineMap.extend({
			visible: {value: true},
			show: function () {
			 this.set('visible', true);
		 }
	 })
	 });

		var renderer = stache("<my-app>" +
		'{{^visible}}<button on:click="show()">show</button>{{/visible}}' +
		'<my-toggler visible:bind="visible">' +
		'content' +
		'<button on:click="hide()">hide</button>' +
		'</my-toggler>' +
		'</my-app>');

		var frag = renderer({});

		var myApp = frag.firstChild,
		buttons = myApp.getElementsByTagName("button");

		assert.equal( buttons.length, 1, "there is one button");
		assert.equal( innerHTML(buttons[0]) , "hide", "the button's text is hide");

		domEvents.dispatch(buttons[0], "click");
		buttons = myApp.getElementsByTagName("button");

		assert.equal(buttons.length, 1, "there is one button");
		assert.equal(innerHTML(buttons[0]), "show", "the button's text is show");

		domEvents.dispatch(buttons[0], "click");
		buttons = myApp.getElementsByTagName("button");

		assert.equal(buttons.length, 1, "there is one button");
		assert.equal(innerHTML(buttons[0]), "hide", "the button's text is hide");
	});


	QUnit.test("don't update computes unnecessarily", function(assert) {
		var sourceAge = new SimpleObservable(30),
		timesComputeIsCalled = 0;

		var age = new SetterObservable(function () {
		 timesComputeIsCalled++;
		 if (timesComputeIsCalled === 1) {
			assert.ok(true, "reading initial value to set as years");
		} else if (timesComputeIsCalled === 3) {
			assert.ok(true, "called back another time after set to get the value");
		} else {
			assert.ok(false, "(getter) You've called the callback " + timesComputeIsCalled + " times");
		}
		return sourceAge.get();

	}, function(newVal){
		timesComputeIsCalled++;
		if (timesComputeIsCalled === 2) {
			assert.ok(true, "updating value to " + newVal);
		} else {
			assert.ok(false, "(setter) You've called the callback " + timesComputeIsCalled + " times");
		}
		sourceAge.set(newVal);
	});

		Component.extend({
		 tag: "age-er"
	 });

		var renderer = stache("<age-er years:bind='age'></age-er>");

		renderer({
		 age: age
	 });

		age.set(31);

	});

	QUnit.test("viewModel not rebound correctly (#550)", function(assert) {

		var nameChanges = 0;

		Component.extend({
			tag: "viewmodel-rebinder",
			events: {
				"{name}": function () {
					nameChanges++;
				}
			}
		});

		var renderer = stache("<viewmodel-rebinder></viewmodel-rebinder>");

		var frag = renderer();
		var viewModel = canViewModel(frag.firstChild);

		var n1 = new SimpleObservable(),
		n2 = new SimpleObservable();

		viewModel.set("name", n1);

		n1.set("updated");

		viewModel.set("name", n2);

		n2.set("updated");


		assert.equal(nameChanges, 2);
	});

		/*
		test("@ keeps properties live now", function () {

		Component.extend({
			tag: "attr-fun",
			view: stache("<h1>{{fullName}}</h1>"),
			ViewModel: SimpleMap.extend({
				fullName: function () {
					return this.get("firstName") + " " + this.attr("lastName");
				}
			})
		});

		var frag = stache("<attr-fun first-name='Justin' last-name='Meyer'></attr-fun>")();

		var attrFun = frag.firstChild;

		this.fixture.appendChild(attrFun);

		equal( innerHTML(attrFun.firstChild), "Justin Meyer");

		attr.set(attrFun, "first-name", "Brian");

		var done = assert.async();

		setTimeout(function () {
			equal(attrFun.firstChild.firstChild.nodeValue, "Brian Meyer");
			done();
		}, 100);

	});

		test('component does not update viewModel on id, class, and data-view-id attribute changes (#1079)', function(){

				Component.extend({
						tag:'x-app'
				});

				var frag=stache('<x-app></x-app>')({});

				var el = frag.firstChild;
				var viewModel = canViewModel(el);

				// element must be inserted, otherwise attributes event will not be fired
				domMutate.appendChild.call(this.fixture,frag);

				// update the class
				className.add.call(el,"foo");

				var done = assert.async();
				setTimeout(function(){
						equal(viewModel.attr('class'),undefined, "the viewModel is not updated when the class attribute changes");
						done();
				}, 100);

		});
		*/

		QUnit.test("id and class should work now (#694)", function(assert) {
			Component.extend({
			 tag: "stay-classy",
			 ViewModel: SimpleMap.extend({
				setup: function(props){
					canReflect.assign(props, {
						notid: "foo",
						notclass: 5,
						notdataviewid: {}
					});
					return SimpleMap.prototype.setup.apply(this, arguments);
				}
			})
		 });

			var data = {
			 idData: "id-success",
			 classData: "class-success"
		 };

		 var frag = stache(
		 "<stay-classy id:bind='idData'" +
		 " class:bind='classData'></stay-classy>")(data);

		 var stayClassy = frag.firstChild;

		 domMutateNode.appendChild.call(this.fixture, frag);

		 var viewModel = canViewModel(stayClassy);

		 assert.equal(viewModel.get("id"), "id-success");
		 assert.equal(viewModel.get("class"), "class-success");
	 });

		QUnit.test("Construct are passed normally", function(assert) {
			var Constructed = Construct.extend({foo:"bar"},{});

			Component.extend({
				tag: "con-struct",
				view: stache("{{con.foo}}")
			});

			var stached = stache("<con-struct con:bind='Constructed'></con-struct>");

			var res = stached({
				Constructed: Constructed
			});

			assert.equal(innerHTML(res.firstChild), "bar");


		});

		QUnit.test('Component two way binding loop (#1579)', function(assert) {
			var changeCount = 0;

			Component.extend({
				tag: 'product-swatch-color',
				viewModel: {
					tag: 'product-swatch-color'
				}
			});


			Component.extend({
				tag: 'product-swatch',
				view: stache('<product-swatch-color variations:bind="variations"></product-swatch-color>'),
				ViewModel: DefineMap.extend({

					variations: {
						set: function(variations) {
							if(changeCount > 500) {
								return;
							}
							changeCount++;
							return new DefineList(variations.get());
						}
					}

				})
			});

			var frag = stache('<product-swatch></product-swatch>')(),
			productSwatch = frag.firstChild;


			canViewModel( productSwatch ).set('variations', new DefineList());



			assert.ok(changeCount < 500, "more than 500 events");
		});



		QUnit.test('two-way binding syntax INTRODUCED in v2.3 ALLOWS a child property to initialize an undefined parent property', function(assert) {
			var renderer = stache('<pa-rent/>');

			Component.extend({
			 tag : 'pa-rent',
			 view: stache('<chi-ld childProp:bind="parentProp" />')
		 });

			Component.extend({
			 tag : 'chi-ld',
			 ViewModel: {
				childProp: { value: 'bar' }
			}
		});

			var frag = renderer({});

			var parentVM = canViewModel(frag.firstChild);
			var childVM = canViewModel(frag.firstChild.firstChild);

			assert.equal(parentVM.get("parentProp"), 'bar', 'parentProp is bar');
			assert.equal(childVM.get("childProp"), 'bar', 'childProp is bar');

			parentVM.set("parentProp",'foo');

			assert.equal(parentVM.get("parentProp"), 'foo', 'parentProp is foo');
			assert.equal(childVM.get("childProp"), 'foo', 'childProp is foo');

			childVM.set("childProp",'baz');

			assert.equal(parentVM.get("parentProp"), 'baz', 'parentProp is baz');
			assert.equal(childVM.get("childProp"), 'baz', 'childProp is baz');
		});


		QUnit.test("conditional attributes (#2077)", function(assert) {

			Component.extend({
			 tag: 'some-comp',
			 ViewModel: DefineMap.extend({ seal: false }, {})
		 });
			var renderer = stache("<some-comp "+
			"{{#if preview}}next:from='nextPage'{{/if}} "+
			"swap:from='{{swapName}}' "+
			"{{#preview}}checked{{/preview}} "+
			"></some-comp>");

			var map = new SimpleMap({
			 preview: true,
			 nextPage: 2,
			 swapName: "preview"
		 });
			var frag = renderer(map);

			var vm = canViewModel(frag.firstChild);

			var threads = [
			function(){

				assert.equal(vm.next, 2, "has binding initially");
				assert.equal(vm.swap, true, "swap - has binding");
				//equal(vm.get("checked"), "", "attr - has binding"); (commented out because we don't do this sort of binding)
				map.attr("preview", false);
			},
			function(){
				assert.equal(vm.swap, false, "swap - updated binidng");

				//ok(vm.get("checked") === null, "attr - value set to null");

				map.attr("nextPage", 3);
				assert.equal(vm.next, 2, "not updating after binding is torn down");
				map.attr("preview", true);

			},
			function(){
				assert.equal(vm.next, 3, "re-initialized with binding");
				assert.equal(vm.swap, true, "swap - updated binidng");
				//equal(vm.get("checked"), "", "attr - has binding set again");
				map.attr("swapName", "nextPage");
			},
			function(){
				assert.equal(vm.swap, 3, "swap - updated binding key");
				map.attr("nextPage",4);
				assert.equal(vm.swap, 4, "swap - updated binding");
			}
			];
			var done = assert.async();
			var index = 0;
			var next = function(){
			 if(index < threads.length) {
				threads[index]();
				index++;
				setTimeout(next, 150);
			} else {
				done();
			}
		};
		setTimeout(next, 100);
	});

		QUnit.test("one-way - child to parent - parent that does not leak scope, but has no view", function(assert) {

			Component.extend({
				tag: "outer-noleak",
				ViewModel: DefineMap.extend("Outer", {}, {
					name: { default: "outer" },
					myChild: { default: null }
				}),
				leakScope: false
			});
			Component.extend({
				tag: "my-child",
				ViewModel : DefineMap.extend("Inner", {}, {
					name: { default: "inner" }
				}),
				leakScope: false
			});

			var renderer = stache("<outer-noleak><my-child this:to='myChild'/></outer-noleak>");
			var frag = renderer();
			var vm = canViewModel(frag.firstChild);
			assert.equal(vm.myChild.name,"inner", "got instance");

		});

		QUnit.test("Can be called on an element using preventDataBindings (#183)", function(assert) {
			Component.extend({
			 tag: "prevent-data-bindings",
			 ViewModel: {},
			 view: stache("{{value}}")
		 });

			var document = this.document;
			var el = document.createElement("div");
			var callback = tag("prevent-data-bindings");

			var vm = new DefineMap({ value: "it worked" });
			el[canSymbol.for('can.viewModel')] = vm;
			canData.set(el, "preventDataBindings", true);
			callback(el, {
			 scope: new Scope({ value: "it did not work" })
		 });
			canData.set(el, "preventDataBindings", false);

			assert.equal(el.firstChild.nodeValue, "it worked");
		});

		QUnit.test("viewModel available as viewModel property (#282)", function(assert) {
			Component.extend({
			 tag: "can-map-viewmodel",
			 view: stache("{{name}}"),
			 viewModel: {
				name: "Matthew"
			}
		});

			var renderer = stache("<can-map-viewmodel></can-map-viewmodel>");

			var fragOne = renderer();
			var vmOne = fragOne.firstChild.viewModel;

			var fragTwo = renderer();

			vmOne.set("name", "Wilbur");

			assert.equal(fragOne.firstChild.firstChild.nodeValue, "Wilbur", "The first map changed values");
			assert.equal(fragTwo.firstChild.firstChild.nodeValue, "Matthew", "The second map did not change");
		});

		QUnit.test("connectedCallback without a disconnect calls stopListening", function(assert) {
			assert.expect(1);
			var done = assert.async();

			var map = new SimpleMap();

			Component.extend({
				tag: "connected-component-listen",
				view: stache('rendered'),
				ViewModel: {
					connectedCallback: function(element) {
						this.listenTo(map,"foo", function(){});
					}
				}
			});
			var template = stache("<connected-component-listen/>");
			var frag = template();
			var first = frag.firstChild;
			domMutateNode.appendChild.call(this.fixture, frag);

			helpers.afterMutation(function(){

				domMutateNode.removeChild.call(first.parentNode, first);
				helpers.afterMutation(function(){
					assert.notOk( canReflect.isBound(map), "stopListening no matter what on vm");
					done();
				});
			});
		});

	});
