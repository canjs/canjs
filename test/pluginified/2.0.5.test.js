(function(module, undefined) {

// ## component/component_test.js
var __m1 = (function () {
	module('can/component', {
		setup: function () {
			can.remove(can.$('#qunit-test-area>*'));
		}
	});
	var Paginate = can.Map.extend({
		count: Infinity,
		offset: 0,
		limit: 100,
		setCount: function (newCount, success, error) {
			return newCount < 0 ? 0 : newCount;
		},
		setOffset: function (newOffset) {
			return newOffset < 0 ? 0 : Math.min(newOffset, !isNaN(this.count - 1) ? this.count - 1 : Infinity);
		},
		next: function () {
			this.attr('offset', this.offset + this.limit);
		},
		prev: function () {
			this.attr('offset', this.offset - this.limit);
		},
		canNext: function () {
			return this.attr('offset') < this.attr('count') - this.attr('limit');
		},
		canPrev: function () {
			return this.attr('offset') > 0;
		},
		page: function (newVal) {
			if (newVal === undefined) {
				return Math.floor(this.attr('offset') / this.attr('limit')) + 1;
			} else {
				this.attr('offset', (parseInt(newVal, 10) - 1) * this.attr('limit'));
			}
		},
		pageCount: function () {
			return this.attr('count') ? Math.ceil(this.attr('count') / this.attr('limit')) : null;
		}
	});
	test('basic tabs', function () {
		can.Component.extend({
			tag: 'tabs',
			template: '<ul>' + '{{#panels}}' + '<li {{#isActive}}class=\'active\'{{/isActive}} can-click=\'makeActive\'>{{title}}</li>' + '{{/panels}}' + '</ul>' + '<content></content>',
			scope: {
				panels: [],
				addPanel: function (panel) {
					if (this.attr('panels')
						.length === 0) {
						this.makeActive(panel);
					}
					this.attr('panels')
						.push(panel);
				},
				removePanel: function (panel) {
					var panels = this.attr('panels');
					can.batch.start();
					panels.splice(panels.indexOf(panel), 1);
					if (panel === this.attr('active')) {
						if (panels.length) {
							this.makeActive(panels[0]);
						} else {
							this.removeAttr('active');
						}
					}
					can.batch.stop();
				},
				makeActive: function (panel) {
					this.attr('active', panel);
					this.attr('panels')
						.each(function (panel) {
							panel.attr('active', false);
						});
					panel.attr('active', true);
				},
				isActive: function (panel) {
					return this.attr('active') === panel;
				}
			}
		});
		can.Component.extend({
			template: '{{#if active}}<content></content>{{/if}}',
			tag: 'panel',
			scope: {
				active: false
			},
			events: {
				' inserted': function () {
					can.scope(this.element[0].parentNode)
						.addPanel(this.scope);
				},
				' removed': function () {
					if (!can.scope(this.element[0].parentNode)) {
						console.log('bruke');
					}
					can.scope(this.element[0].parentNode)
						.removePanel(this.scope);
				}
			}
		});
		var template = can.view.mustache('<tabs>{{#each foodTypes}}<panel title=\'title\'>{{content}}</panel>{{/each}}</tabs>');
		var foodTypes = new can.List([{
			title: 'Fruits',
			content: 'oranges, apples'
		}, {
			title: 'Breads',
			content: 'pasta, cereal'
		}, {
			title: 'Sweets',
			content: 'ice cream, candy'
		}]);
		can.append(can.$('#qunit-test-area'), template({
			foodTypes: foodTypes
		}));
		var testArea = can.$('#qunit-test-area')[0],
			lis = testArea.getElementsByTagName('li');
		equal(lis.length, 3, 'three lis added');
		foodTypes.each(function (type, i) {
			equal(lis[i].innerHTML, type.attr('title'), 'li ' + i + ' has the right content');
		});
		foodTypes.push({
			title: 'Vegies',
			content: 'carrots, kale'
		});
		equal(lis.length, 4, 'li added');
		foodTypes.each(function (type, i) {
			equal(lis[i].innerHTML, type.attr('title'), 'li ' + i + ' has the right content');
		});
		equal(testArea.getElementsByTagName('panel')
			.length, 4, 'panel added');
		foodTypes.shift();
		equal(lis.length, 3, 'removed li after shifting a foodType');
		foodTypes.each(function (type, i) {
			equal(lis[i].innerHTML, type.attr('title'), 'li ' + i + ' has the right content');
		});
		var panels = testArea.getElementsByTagName('panel');
		equal(lis[0].className, 'active', 'the first element is active');
		equal(panels[0].innerHTML, 'pasta, cereal', 'the first content is shown');
		equal(panels[1].innerHTML, '', 'the second content is removed');
		can.trigger(lis[1], 'click');
		equal(lis[1].className, 'active', 'the second element is active');
		equal(lis[0].className, '', 'the first element is not active');
		equal(panels[0].innerHTML, '', 'the second content is removed');
		equal(panels[1].innerHTML, 'ice cream, candy', 'the second content is shown');
		can.remove(can.$('#qunit-test-area>*'));
	});
	test('treecombo', function () {
		can.Component.extend({
			tag: 'treecombo',
			template: '<ul class=\'breadcrumb\'>' + '<li can-click=\'emptyBreadcrumb\'>{{title}}</li>' + '{{#each breadcrumb}}' + '<li can-click=\'updateBreadcrumb\'>{{title}}</li>' + '{{/each}}' + '</ul>' + '<ul class=\'options\'>' + '<content>' + '{{#selectableItems}}' + '<li {{#isSelected}}class=\'active\'{{/isSelected}} can-click=\'toggle\'>' + '<input type=\'checkbox\' {{#isSelected}}checked{{/isSelected}}/>' + '{{title}}' + '{{#if children.length}}' + '<button class=\'showChildren\' can-click=\'showChildren\'>+</button>' + '{{/if}}' + '</li>' + '{{/selectableItems}}' + '</content>' + '</ul>',
			scope: {
				items: [],
				breadcrumb: [],
				selected: [],
				title: '@',
				selectableItems: function () {
					var breadcrumb = this.attr('breadcrumb');
					if (breadcrumb.attr('length')) {
						return breadcrumb.attr('' + (breadcrumb.length - 1) + '.children');
					} else {
						return this.attr('items');
					}
				},
				showChildren: function (item, el, ev) {
					ev.stopPropagation();
					this.attr('breadcrumb')
						.push(item);
				},
				emptyBreadcrumb: function () {
					this.attr('breadcrumb')
						.attr([], true);
				},
				updateBreadcrumb: function (item) {
					var breadcrumb = this.attr('breadcrumb'),
						index = breadcrumb.indexOf(item);
					breadcrumb.splice(index + 1, breadcrumb.length - index - 1);
				},
				toggle: function (item) {
					var selected = this.attr('selected'),
						index = selected.indexOf(item);
					if (index === -1) {
						selected.push(item);
					} else {
						selected.splice(index, 1);
					}
				}
			},
			helpers: {
				isSelected: function (options) {
					if (this.attr('selected')
						.indexOf(options.context) > -1) {
						return options.fn();
					} else {
						return options.inverse();
					}
				}
			}
		});
		var template = can.view.mustache('<div><treecombo items=\'locations\' title=\'Locations\'></treecombo></div>');
		var base = new can.Map({});
		can.append(can.$('#qunit-test-area'), template(base));
		var items = [{
			id: 1,
			title: 'Midwest',
			children: [{
				id: 5,
				title: 'Illinois',
				children: [{
					id: 23423,
					title: 'Chicago'
				}, {
					id: 4563,
					title: 'Springfield'
				}, {
					id: 4564,
					title: 'Naperville'
				}]
			}, {
				id: 6,
				title: 'Wisconsin',
				children: [{
					id: 232423,
					title: 'Milwaulkee'
				}, {
					id: 45463,
					title: 'Green Bay'
				}, {
					id: 45464,
					title: 'Madison'
				}]
			}]
		}, {
			id: 2,
			title: 'East Coast',
			children: [{
				id: 25,
				title: 'New York',
				children: [{
					id: 3413,
					title: 'New York'
				}, {
					id: 4613,
					title: 'Rochester'
				}, {
					id: 4516,
					title: 'Syracuse'
				}]
			}, {
				id: 6,
				title: 'Pennsylvania',
				children: [{
					id: 2362423,
					title: 'Philadelphia'
				}, {
					id: 454663,
					title: 'Harrisburg'
				}, {
					id: 454664,
					title: 'Scranton'
				}]
			}]
		}];
		stop();
		setTimeout(function () {
			base.attr('locations', items);
			var itemsList = base.attr('locations');
			var treecombo = can.$('#qunit-test-area treecombo')[0],
				breadcrumb = can.$('#qunit-test-area .breadcrumb')[0],
				breadcrumbLIs = breadcrumb.getElementsByTagName('li'),
				options = can.$('#qunit-test-area .options')[0];
			var optionsLis = options.getElementsByTagName('li');
			equal(breadcrumbLIs.length, 1, 'Only the default title is shown');
			equal(breadcrumbLIs[0].innerHTML, 'Locations', 'The correct title from the attribute is shown');
			equal(optionsLis.length, itemsList.length, 'first level items are displayed');
			can.trigger(optionsLis[0], 'click');
			equal(optionsLis[0].className, 'active', 'toggling something not selected adds active');
			ok(optionsLis[0].getElementsByTagName('input')[0].checked, 'toggling something not selected checks checkbox');
			equal(can.scope(treecombo, 'selected')
				.length, 1, 'there is one selected item');
			equal(can.scope(treecombo, 'selected.0'), itemsList.attr('0'), 'the midwest is in selected');
			can.scope(treecombo, 'selected')
				.pop();
			equal(optionsLis[0].className, '', 'toggling something not selected adds active');
			can.trigger(optionsLis[0].getElementsByTagName('button')[0], 'click');
			equal(breadcrumbLIs.length, 2, 'Only the default title is shown');
			equal(breadcrumbLIs[1].innerHTML, 'Midwest', 'The breadcrumb has an item in it');
			ok(/Illinois/.test(optionsLis[0].innerHTML), 'A child of the top breadcrumb is displayed');
			can.trigger(optionsLis[0].getElementsByTagName('button')[0], 'click');
			ok(/Chicago/.test(optionsLis[0].innerHTML), 'A child of the top breadcrumb is displayed');
			ok(!optionsLis[0].getElementsByTagName('button')
				.length, 'no show children button');
			can.trigger(breadcrumbLIs[1], 'click');
			equal(breadcrumbLIs[1].innerHTML, 'Midwest', 'The breadcrumb has an item in it');
			ok(/Illinois/.test(optionsLis[0].innerHTML), 'A child of the top breadcrumb is displayed');
			can.trigger(breadcrumbLIs[0], 'click');
			equal(breadcrumbLIs.length, 1, 'Only the default title is shown');
			equal(breadcrumbLIs[0].innerHTML, 'Locations', 'The correct title from the attribute is shown');
			start();
		}, 100);
	});
	test('deferred grid', function () {
		can.Component.extend({
			tag: 'grid',
			scope: {
				items: [],
				waiting: true
			},
			template: '<table><tbody><content></content></tbody></table>',
			events: {
				init: function () {
					this.update();
				},
				'{scope} deferreddata': 'update',
				update: function () {
					var deferred = this.scope.attr('deferreddata'),
						scope = this.scope;
					if (can.isDeferred(deferred)) {
						this.scope.attr('waiting', true);
						deferred.then(function (items) {
							scope.attr('items')
								.attr(items, true);
						});
					} else {
						scope.attr('items')
							.attr(deferred, true);
					}
				},
				'{items} change': function () {
					this.scope.attr('waiting', false);
				}
			}
		});
		var SimulatedScope = can.Map.extend({
			set: 0,
			deferredData: function () {
				var deferred = new can.Deferred();
				var set = this.attr('set');
				if (set === 0) {
					setTimeout(function () {
						deferred.resolve([{
							first: 'Justin',
							last: 'Meyer'
						}]);
					}, 100);
				} else if (set === 1) {
					setTimeout(function () {
						deferred.resolve([{
							first: 'Brian',
							last: 'Moschel'
						}]);
					}, 100);
				}
				return deferred;
			}
		});
		var scope = new SimulatedScope();
		var template = can.view.mustache('<grid deferreddata=\'scope.deferredData\'>' + '{{#each items}}' + '<tr>' + '<td width=\'40%\'>{{first}}</td>' + '<td width=\'70%\'>{{last}}</td>' + '</tr>' + '{{/each}}' + '</grid>');
		can.append(can.$('#qunit-test-area'), template({
			scope: scope
		}));
		var gridScope = can.scope('#qunit-test-area grid');
		equal(gridScope.attr('waiting'), true, 'waiting is true');
		stop();
		

		var waitingHandler = function() {
			gridScope.unbind('waiting', waitingHandler);
			setTimeout(function () {
				var tds = can.$('#qunit-test-area td');
				equal(tds.length, 2, 'there are 2 tds');
				gridScope.bind('waiting', function (ev, newVal) {
					if (newVal === false) {
						setTimeout(function () {
							equal(tds[0].innerHTML, 'Brian', 'td changed to brian');
							start();
						}, 10);
					}
				});
				scope.attr('set', 1);
			}, 10);
		};
		
		gridScope.bind('waiting', waitingHandler);
	});
	test('nextprev', function () {
		can.Component.extend({
			tag: 'next-prev',
			template: '<a href="javascript://"' + 'class="prev {{#paginate.canPrev}}enabled{{/paginate.canPrev}}" can-click="paginate.prev">Prev</a>' + '<a href="javascript://"' + 'class="next {{#paginate.canNext}}enabled{{/paginate.canNext}}" can-click="paginate.next">Next</a>'
		});
		var paginator = new Paginate({
			limit: 20,
			offset: 0,
			count: 100
		});
		var template = can.view.mustache('<next-prev paginate=\'paginator\'></next-prev>');
		var frag = template({
			paginator: paginator
		});
		can.append(can.$('#qunit-test-area'), frag);
		var prev = can.$('#qunit-test-area .prev')[0],
			next = can.$('#qunit-test-area .next')[0];
		ok(!/enabled/.test(prev.className), 'prev is not enabled');
		ok(/enabled/.test(next.className), 'next is  enabled');
		can.trigger(next, 'click');
		ok(/enabled/.test(prev.className), 'prev is enabled');
	});
	test('page-count', function () {
		can.Component.extend({
			tag: 'page-count',
			template: 'Page <span>{{page}}</span>.'
		});
		var paginator = new Paginate({
			limit: 20,
			offset: 0,
			count: 100
		});
		var template = can.view.mustache('<page-count page=\'paginator.page\'></page-count>');
		can.append(can.$('#qunit-test-area'), template(new can.Map({
			paginator: paginator
		})));
		var spans = can.$('#qunit-test-area span');
		equal(spans[0].innerHTML, '1');
		paginator.next();
		equal(spans[0].innerHTML, '2');
		paginator.next();
		equal(spans[0].innerHTML, '3');
	});
	test('hello-world and whitespace around custom elements', function () {
		can.Component.extend({
			tag: 'hello-world',
			template: '{{#if visible}}{{message}}{{else}}Click me{{/if}}',
			scope: {
				visible: false,
				message: 'Hello There!'
			},
			events: {
				click: function () {
					this.scope.attr('visible', true);
				}
			}
		});
		var template = can.view.mustache('  <hello-world></hello-world>  ');
		can.append(can.$('#qunit-test-area'), template({}));
		can.trigger(can.$('#qunit-test-area hello-world'), 'click');
		equal(can.$('#qunit-test-area hello-world')[0].innerHTML, 'Hello There!');
	});
	test('self closing content tags', function () {
		can.Component({
			'tag': 'my-greeting',
			template: '<h1><content/></h1>',
			scope: {
				title: 'can.Component'
			}
		});
		var template = can.view.mustache('<my-greeting><span>{{site}} - {{title}}</span></my-greeting>');
		can.append(can.$('#qunit-test-area'), template({
			site: 'CanJS'
		}));
		equal(can.$('#qunit-test-area span')
			.length, 1, 'there is an h1');
	});
	test('setting passed variables - two way binding', function () {
		can.Component({
			tag: 'my-toggler',
			template: '{{#if visible}}<content/>{{/if}}',
			scope: {
				visible: true,
				show: function () {
					this.attr('visible', true);
				},
				hide: function () {
					this.attr('visible', false);
				}
			}
		});
		can.Component({
			tag: 'my-app',
			scope: {
				visible: true,
				show: function () {
					this.attr('visible', true);
				}
			}
		});
		var template = can.view.mustache('<my-app>' + '{{^visible}}<button can-click="show">show</button>{{/visible}}' + '<my-toggler visible="visible">' + 'content' + '<button can-click="hide">hide</button>' + '</my-toggler>' + '</my-app>');
		can.append(can.$('#qunit-test-area'), template({}));
		var testArea = can.$('#qunit-test-area')[0],
			buttons = testArea.getElementsByTagName('button');
		equal(buttons.length, 1, 'there is one button');
		equal(buttons[0].innerHTML, 'hide', 'the button\'s text is hide');
		can.trigger(buttons[0], 'click');
		equal(buttons.length, 1, 'there is one button');
		equal(buttons[0].innerHTML, 'show', 'the button\'s text is show');
		can.trigger(buttons[0], 'click');
		equal(buttons.length, 1, 'there is one button');
		equal(buttons[0].innerHTML, 'hide', 'the button\'s text is hide');
	});
	test('helpers reference the correct instance (#515)', function () {
		expect(2);
		can.Component({
			tag: 'my-text',
			template: '<p>{{valueHelper}}</p>',
			scope: {
				value: '@'
			},
			helpers: {
				valueHelper: function () {
					return this.attr('value');
				}
			}
		});
		var template = can.view.mustache('<my-text value="value1"></my-text><my-text value="value2"></my-text>');
		can.append(can.$('#qunit-test-area'), template({}));
		var testArea = can.$('#qunit-test-area')[0],
			myTexts = testArea.getElementsByTagName('my-text');
		equal(myTexts[0].children[0].innerHTML, 'value1');
		equal(myTexts[1].children[0].innerHTML, 'value2');
	});
	test('access hypenated attributes via camelCase or hypenated', function () {
		can.Component({
			tag: 'hyphen',
			scope: {
				'camelCase': '@'
			},
			template: '<p>{{valueHelper}}</p>',
			helpers: {
				valueHelper: function () {
					return this.attr('camelCase');
				}
			}
		});
		var template = can.view.mustache('<hyphen camel-case="value1"></hyphen>');
		can.append(can.$('#qunit-test-area'), template({}));
		var testArea = can.$('#qunit-test-area')[0],
			hyphen = testArea.getElementsByTagName('hyphen');
		equal(hyphen[0].children[0].innerHTML, 'value1');
	});
	test('a map as scope', function () {
		var me = new can.Map({
			name: 'Justin'
		});
		can.Component.extend({
			tag: 'my-scope',
			scope: me
		});
		var template = can.view.mustache('<my-scope>{{name}}</my-scope>');
		equal(template()
			.childNodes[0].innerHTML, 'Justin');
	});
	test('content in a list', function () {
		var template = can.view.mustache('<my-list>{{name}}</my-list>');
		can.Component.extend({
			tag: 'my-list',
			template: '{{#each items}}<li><content/></li>{{/each}}',
			scope: {
				items: new can.List([{
					name: 'one'
				}, {
					name: 'two'
				}])
			}
		});
		var lis = template()
			.childNodes[0].getElementsByTagName('li');
		equal(lis[0].innerHTML, 'one', 'first li has correct content');
		equal(lis[1].innerHTML, 'two', 'second li has correct content');
	});
	test('don\'t update computes unnecessarily', function () {
		var sourceAge = 30,
			timesComputeIsCalled = 0;
		var age = can.compute(function (newVal) {
			timesComputeIsCalled++;
			if (timesComputeIsCalled === 1) {
				ok(true, 'reading initial value to set as years');
			} else if (timesComputeIsCalled === 2) {
				equal(newVal, 31, 'updating value to 31');
			} else if (timesComputeIsCalled === 3) {
				ok(true, 'called back another time after set to get the value');
			} else {
				ok(false, 'You\'ve called the callback ' + timesComputeIsCalled + ' times');
			}
			if (arguments.length) {
				sourceAge = newVal;
			} else {
				return sourceAge;
			}
		});
		can.Component.extend({
			tag: 'age-er'
		});
		var template = can.view.mustache('<age-er years=\'age\'></age-er>');
		template({
			age: age
		});
		age(31);
	});
	test('component does not respect can.compute passed via attributes (#540)', function () {
		var data = {
			compute: can.compute(30)
		};
		can.Component.extend({
			tag: 'my-component',
			template: '<span>{{blocks}}</span>'
		});
		var template = can.view.mustache('<my-component blocks=\'compute\'></my-component>');
		var frag = template(data);
		equal(frag.childNodes[0].childNodes[0].innerHTML, '30');
	});
	test('defined view models (#563)', function () {
		var HelloWorldModel = can.Map.extend({
			visible: true,
			toggle: function () {
				this.attr('visible', !this.attr('visible'));
			}
		});
		can.Component.extend({
			tag: 'my-helloworld',
			template: '<h1>{{#if visible}}visible{{else}}invisible{{/if}}</h1>',
			scope: HelloWorldModel
		});
		var template = can.view.mustache('<my-helloworld></my-helloworld>');
		var frag = template({});
		equal(frag.childNodes[0].childNodes[0].innerHTML, 'visible');
	});
	test('scope not rebound correctly (#550)', function () {
		var nameChanges = 0;
		can.Component.extend({
			tag: 'scope-rebinder',
			events: {
				'{name} change': function () {
					nameChanges++;
				}
			}
		});
		var template = can.view.mustache('<scope-rebinder></scope-rebinder>');
		var frag = template();
		var scope = can.scope(can.$(frag.childNodes[0]));
		var n1 = can.compute(),
			n2 = can.compute();
		scope.attr('name', n1);
		n1('updated');
		scope.attr('name', n2);
		n2('updated');
		equal(nameChanges, 2);
	});
	test('content extension stack overflow error', function () {
		can.Component({
			tag: 'outer-tag',
			template: '<inner-tag>inner-tag CONTENT <content/></inner-tag>'
		});
		can.Component({
			tag: 'inner-tag',
			template: 'inner-tag TEMPLATE <content/>'
		});
		var template = can.view.mustache('<outer-tag>outer-tag CONTENT</outer-tag>');
		var frag = template();
		equal(frag.childNodes[0].childNodes[0].innerHTML, 'inner-tag TEMPLATE inner-tag CONTENT outer-tag CONTENT');
	});
	test('inserted event fires twice if component inside live binding block', function () {
		var inited = 0,
			inserted = 0;
		can.Component({
			tag: 'child-tag',
			scope: {
				init: function () {
					inited++;
				}
			},
			events: {
				' inserted': function () {
					inserted++;
				}
			}
		});
		can.Component({
			tag: 'parent-tag',
			template: '{{#shown}}<child-tag></child-tag>{{/shown}}',
			scope: {
				shown: false
			},
			events: {
				' inserted': function () {
					this.scope.attr('shown', true);
				}
			}
		});
		var frag = can.view.mustache('<parent-tag></parent-tag>')({});
		can.append(can.$('#qunit-test-area'), frag);
		equal(inited, 1);
		equal(inserted, 1);
	});
	test('Scope as Map constructors should follow \'@\' default values (#657)', function () {
		var PanelViewModel = can.Map.extend({
			title: '@'
		});
		can.Component.extend({
			tag: 'panel',
			scope: PanelViewModel
		});
		var frag = can.view.mustache('<panel title="Libraries">Content</panel>')({
			title: 'hello'
		});
		can.append(can.$('#qunit-test-area'), frag);
		equal(can.scope(can.$('panel')[0])
			.attr('title'), 'Libraries');
	});
	test('id, class, and dataViewId should be ignored (#694)', function () {
		can.Component.extend({
			tag: 'stay-classy',
			scope: {
				notid: 'foo',
				notclass: 5,
				notdataviewid: {}
			}
		});
		var data = {
			idFromData: 'id-success',
			classFromData: 'class-success',
			dviFromData: 'dvi-success'
		};
		var frag = can.view.mustache('<stay-classy id=\'an-id\' notid=\'idFromData\'' + ' class=\'a-class\' notclass=\'classFromData\'' + ' notdataviewid=\'dviFromData\'></stay-classy>')(data);
		can.append(can.$('#qunit-test-area'), frag);
		var scope = can.scope(can.$('stay-classy')[0]);
		equal(scope.attr('id'), undefined);
		equal(scope.attr('notid'), 'id-success');
		equal(scope.attr('class'), undefined);
		equal(scope.attr('notclass'), 'class-success');
		equal(scope.attr('dataViewId'), undefined);
		equal(scope.attr('notdataviewid'), 'dvi-success');
	});

	test("Component can-click method should be not called while component's init", function () {

		var called = false;

		can.Component.extend({
			tag: "child-tag"
		});

		can.Component.extend({
			tag: "parent-tag",
			template: '<child-tag can-click="method"></child-tag>',
			scope: {
				method: function () {
					called = true;
				}
			}
		});

		can.view.mustache('<parent-tag></parent-tag>')();

		equal(called, false);
	});

})(undefined);

// ## construct/construct_test.js
var __m28 = (function () {
	/* global Foo, Car, Bar */
	module('can/construct', {
		setup: function () {
			var Animal = this.Animal = can.Construct({
				count: 0,
				test: function () {
					return this.match ? true : false;
				}
			}, {
				init: function () {
					this.constructor.count++;
					this.eyes = false;
				}
			});
			var Dog = this.Dog = this.Animal({
				match: /abc/
			}, {
				init: function () {
					Animal.prototype.init.apply(this, arguments);
				},
				talk: function () {
					return 'Woof';
				}
			});
			this.Ajax = this.Dog({
				count: 0
			}, {
				init: function (hairs) {
					Dog.prototype.init.apply(this, arguments);
					this.hairs = hairs;
					this.setEyes();
				},
				setEyes: function () {
					this.eyes = true;
				}
			});
		}
	});
	test('inherit', function () {
		var Base = can.Construct({});
		ok(new Base() instanceof can.Construct);
		var Inherit = Base({});
		ok(new Inherit() instanceof Base);
	});
	test('Creating', function () {
		new this.Dog();
		var a1 = new this.Animal();
		new this.Animal();
		var ajax = new this.Ajax(1000);
		equal(2, this.Animal.count, 'right number of animals');
		equal(1, this.Dog.count, 'right number of animals');
		ok(this.Dog.match, 'right number of animals');
		ok(!this.Animal.match, 'right number of animals');
		ok(this.Dog.test(), 'right number of animals');
		ok(!this.Animal.test(), 'right number of animals');
		equal(1, this.Ajax.count, 'right number of animals');
		equal(2, this.Animal.count, 'right number of animals');
		equal(true, ajax.eyes, 'right number of animals');
		equal(1000, ajax.hairs, 'right number of animals');
		ok(a1 instanceof this.Animal);
		ok(a1 instanceof can.Construct);
	});
	test('new instance', function () {
		var d = this.Ajax.newInstance(6);
		equal(6, d.hairs);
	});
	test('namespaces', function () {
		var fb = can.Construct.extend('Foo.Bar');
		can.Construct('Todo', {}, {});
		ok(Foo.Bar === fb, 'returns class');
		equal(fb.shortName, 'Bar', 'short name is right');
		equal(fb.fullName, 'Foo.Bar', 'fullName is right');
	});
	test('setups', function () {
		var order = 0,
			staticSetup, staticSetupArgs, staticInit, staticInitArgs, protoSetup, protoInitArgs, protoInit, staticProps = {
				setup: function () {
					staticSetup = ++order;
					staticSetupArgs = arguments;
					return ['something'];
				},
				init: function () {
					staticInit = ++order;
					staticInitArgs = arguments;
				}
			}, protoProps = {
				setup: function (name) {
					protoSetup = ++order;
					return ['Ford: ' + name];
				},
				init: function () {
					protoInit = ++order;
					protoInitArgs = arguments;
				}
			};
		can.Construct.extend('Car', staticProps, protoProps);
		new Car('geo');
		equal(staticSetup, 1);
		equal(staticInit, 2);
		equal(protoSetup, 3);
		equal(protoInit, 4);
		deepEqual(can.makeArray(staticInitArgs), ['something']);
		deepEqual(can.makeArray(protoInitArgs), ['Ford: geo']);
		deepEqual(can.makeArray(staticSetupArgs), [
			can.Construct,
			'Car',
			staticProps,
			protoProps
		], 'static construct');
		//now see if staticSetup gets called again ...
		Car.extend('Truck');
		equal(staticSetup, 5, 'Static setup is called if overwriting');
	});
	test('Creating without extend', function () {
		can.Construct('Bar', {
			ok: function () {
				ok(true, 'ok called');
			}
		});
		new Bar()
			.ok();
		Bar('Foo', {
			dude: function () {
				ok(true, 'dude called');
			}
		});
		new Foo()
			.dude(true);
	});
})(undefined);

// ## test/test.js
var __m30 = (function() {
	var viewCheck = /(\.mustache|\.ejs|extensionless)$/;

	can.test = {
		fixture: function (path) {
			if (typeof steal !== 'undefined') {
				return steal.config('root').toString() + '/' + path;
			}

			if (window.require && require.toUrl && !viewCheck.test(path)) {
				return require.toUrl(path);
			}
			return path;
		},
		path: function (path) {
			if (typeof steal !== 'undefined') {
				return ""+steal.idToUri(steal.id("can/"+path).toString())  ;
			}

			if (window.require && require.toUrl && !viewCheck.test(path)) {
				return require.toUrl(path);
			}
			return path;
		}
	}
})(undefined);

// ## map/map_test.js
var __m29 = (function (undefined) {

	module('can/map')

	test("Basic Map", 4, function () {

		var state = new can.Map({
			category: 5,
			productType: 4
		});

		state.bind("change", function (ev, attr, how, val, old) {
			equal(attr, "category", "correct change name")
			equal(how, "set")
			equal(val, 6, "correct")
			equal(old, 5, "correct")
		});

		state.attr("category", 6);

		state.unbind("change");

	});

	test("Nested Map", 5, function () {
		var me = new can.Map({
			name: {
				first: "Justin",
				last: "Meyer"
			}
		});

		ok(me.attr("name") instanceof can.Map);

		me.bind("change", function (ev, attr, how, val, old) {
			equal(attr, "name.first", "correct change name")
			equal(how, "set")
			equal(val, "Brian", "correct")
			equal(old, "Justin", "correct")
		})

		me.attr("name.first", "Brian");

		me.unbind("change")

	})

	test("remove attr", function () {
		var state = new can.Map({
			category: 5,
			productType: 4
		});
		state.removeAttr("category");
		deepEqual(can.Map.keys(state), ["productType"], "one property");
	});

	test("nested event handlers are not run by changing the parent property (#280)", function () {

		var person = new can.Map({
			name: {
				first: "Justin"
			}
		})
		person.bind("name.first", function (ev, newName) {
			ok(false, "name.first should never be called")
			//equal(newName, "hank", "name.first handler called back with correct new name")
		});
		person.bind("name", function () {
			ok(true, "name event triggered")
		})

		person.attr("name", {
			first: "Hank"
		});

	});

	test("cyclical objects (#521)", function () {

		var foo = {};
		foo.foo = foo;

		var fooed = new can.Map(foo);

		ok(true, "did not cause infinate recursion");

		ok(fooed.attr('foo') === fooed, "map points to itself")

		var me = {
			name: "Justin"
		}
		var references = {
			husband: me,
			friend: me
		}
		var ref = new can.Map(references)

		ok(ref.attr('husband') === ref.attr('friend'), "multiple properties point to the same thing")

	})

	test('Getting attribute that is a can.compute should return the compute and not the value of the compute (#530)', function () {
		var compute = can.compute('before');
		var map = new can.Map({
			time: compute
		});

		equal(map.time, compute, 'dot notation call of time is compute');
		equal(map.attr('time'), compute, '.attr() call of time is compute');
	})

	test('_cid add to original object', function () {
		var map = new can.Map(),
			obj = {
				'name': 'thecountofzero'
			};

		map.attr('myObj', obj);
		ok(!obj._cid, '_cid not added to original object');
	})

	test("can.each used with maps", function () {
		can.each(new can.Map({
			foo: "bar"
		}), function (val, attr) {

			if (attr === "foo") {
				equal(val, "bar")
			} else {
				ok(false, "no properties other should be called " + attr)
			}

		})
	})

	test("can.Map serialize triggers reading (#626)", function () {
		var old = can.__observe;

		var attributesRead = [];
		var readingTriggeredForKeys = false;

		can.__observe = function (object, attribute) {
			if (attribute === "__keys") {
				readingTriggeredForKeys = true;
			} else {
				attributesRead.push(attribute);
			}
		};

		var testMap = new can.Map({
			cats: "meow",
			dogs: "bark"
		});

		testMap.serialize();

		

		ok(can.inArray("cats", attributesRead ) !== -1 && can.inArray( "dogs", attributesRead ) !== -1, "map serialization triggered __reading on all attributes");
		ok(readingTriggeredForKeys, "map serialization triggered __reading for __keys");

		can.__observe = old;
	})

	test("Test top level attributes", 7, function () {
		var test = new can.Map({
			'my.enable': false,
			'my.item': true,
			'my.count': 0,
			'my.newCount': 1,
			'my': {
				'value': true,
				'nested': {
					'value': 100
				}
			}
		});

		equal(test.attr('my.value'), true, 'correct');
		equal(test.attr('my.nested.value'), 100, 'correct');
		ok(test.attr("my.nested") instanceof can.Map);

		equal(test.attr('my.enable'), false, 'falsey (false) value accessed correctly');
		equal(test.attr('my.item'), true, 'truthey (true) value accessed correctly');
		equal(test.attr('my.count'), 0, 'falsey (0) value accessed correctly');
		equal(test.attr('my.newCount'), 1, 'falsey (1) value accessed correctly');
	});

})(undefined, undefined, __m30);

// ## list/list_test.js
var __m31 = (function () {
	module('can/list');
	test('list attr changes length', function () {
		var l = new can.List([
			0,
			1,
			2
		]);
		l.attr(3, 3);
		equal(l.length, 4);
	});
	test('list splice', function () {
		var l = new can.List([
			0,
			1,
			2,
			3
		]),
			first = true;
		l.bind('change', function (ev, attr, how, newVals, oldVals) {
			equal(attr, '1');
			if (first) {
				equal(how, 'remove', 'removing items');
				equal(newVals, undefined, 'no new Vals');
			} else {
				deepEqual(newVals, [
					'a',
					'b'
				], 'got the right newVals');
				equal(how, 'add', 'adding items');
			}
			first = false;
		});
		l.splice(1, 2, 'a', 'b');
		deepEqual(l.serialize(), [
			0,
			'a',
			'b',
			3
		], 'serialized');
	});
	test('list pop', function () {
		var l = new can.List([
			0,
			1,
			2,
			3
		]);
		l.bind('change', function (ev, attr, how, newVals, oldVals) {
			equal(attr, '3');
			equal(how, 'remove');
			equal(newVals, undefined);
			deepEqual(oldVals, [3]);
		});
		l.pop();
		deepEqual(l.serialize(), [
			0,
			1,
			2
		]);
	});
	test('remove nested property in item of array map', function () {
		var state = new can.List([{
			nested: true
		}]);
		state.bind('change', function (ev, attr, how, newVal, old) {
			equal(attr, '0.nested');
			equal(how, 'remove');
			deepEqual(old, true);
		});
		state.removeAttr('0.nested');
		equal(undefined, state.attr('0.nested'));
	});
	test('pop unbinds', function () {
		var l = new can.List([{
			foo: 'bar'
		}]);
		var o = l.attr(0),
			count = 0;
		l.bind('change', function (ev, attr, how, newVal, oldVal) {
			count++;
			if (count === 1) {
				equal(attr, '0.foo', 'count is set');
			} else if (count === 2) {
				equal(how, 'remove');
				equal(attr, '0');
			} else {
				ok(false, 'called too many times');
			}
		});
		equal(o.attr('foo'), 'bar');
		o.attr('foo', 'car');
		l.pop();
		o.attr('foo', 'bad');
	});
	test('splice unbinds', function () {
		var l = new can.List([{
			foo: 'bar'
		}]);
		var o = l.attr(0),
			count = 0;
		l.bind('change', function (ev, attr, how, newVal, oldVal) {
			count++;
			if (count === 1) {
				equal(attr, '0.foo', 'count is set');
			} else if (count === 2) {
				equal(how, 'remove');
				equal(attr, '0');
			} else {
				ok(false, 'called too many times');
			}
		});
		equal(o.attr('foo'), 'bar');
		o.attr('foo', 'car');
		l.splice(0, 1);
		o.attr('foo', 'bad');
	});
	test('always gets right attr even after moving array items', function () {
		var l = new can.List([{
			foo: 'bar'
		}]);
		var o = l.attr(0);
		l.unshift('A new Value');
		l.bind('change', function (ev, attr, how) {
			equal(attr, '1.foo');
		});
		o.attr('foo', 'led you');
	});
	test('Array accessor methods', 11, function () {
		var l = new can.List([
			'a',
			'b',
			'c'
		]),
			sliced = l.slice(2),
			joined = l.join(' | '),
			concatenated = l.concat([
				2,
				1
			], new can.List([0]));
		ok(sliced instanceof can.List, 'Slice is an Observable list');
		equal(sliced.length, 1, 'Sliced off two elements');
		equal(sliced[0], 'c', 'Single element as expected');
		equal(joined, 'a | b | c', 'Joined list properly');
		ok(concatenated instanceof can.List, 'Concatenated is an Observable list');
		deepEqual(concatenated.serialize(), [
			'a',
			'b',
			'c',
			2,
			1,
			0
		], 'List concatenated properly');
		l.forEach(function (letter, index) {
			ok(true, 'Iteration');
			if (index === 0) {
				equal(letter, 'a', 'First letter right');
			}
			if (index === 2) {
				equal(letter, 'c', 'Last letter right');
			}
		});
	});
	test('splice removes items in IE (#562)', function () {
		var l = new can.List(['a']);
		l.splice(0, 1);
		ok(!l.attr(0), 'all props are removed');
	});
})(undefined, undefined, __m30);

// ## observe/observe_test.js
var __m32 = (function () {
	module('can/observe map+list');
	test('Basic Map', 9, function () {
		var state = new can.Map({
			category: 5,
			productType: 4,
			properties: {
				brand: [],
				model: [],
				price: []
			}
		});
		var added;
		state.bind('change', function (ev, attr, how, val, old) {
			equal(attr, 'properties.brand.0', 'correct change name');
			equal(how, 'add');
			equal(val[0].attr('foo'), 'bar', 'correct');
			added = val[0];
		});
		state.attr('properties.brand')
			.push({
				foo: 'bar'
			});
		state.unbind('change');
		added.bind('change', function (ev, attr, how, val, old) {
			equal(attr, 'foo', 'foo property set on added');
			equal(how, 'set', 'added');
			equal(val, 'zoo', 'added');
		});
		state.bind('change', function (ev, attr, how, val, old) {
			equal(attr, 'properties.brand.0.foo');
			equal(how, 'set');
			equal(val, 'zoo');
		});
		added.attr('foo', 'zoo');
	});
	test('list attr changes length', function () {
		var l = new can.List([
			0,
			1,
			2
		]);
		l.attr(3, 3);
		equal(l.length, 4);
	});
	test('list splice', function () {
		var l = new can.List([
			0,
			1,
			2,
			3
		]),
			first = true;
		l.bind('change', function (ev, attr, how, newVals, oldVals) {
			equal(attr, '1');
			if (first) {
				equal(how, 'remove', 'removing items');
				equal(newVals, undefined, 'no new Vals');
			} else {
				deepEqual(newVals, [
					'a',
					'b'
				], 'got the right newVals');
				equal(how, 'add', 'adding items');
			}
			first = false;
		});
		l.splice(1, 2, 'a', 'b');
		deepEqual(l.serialize(), [
			0,
			'a',
			'b',
			3
		], 'serialized');
	});
	test('list pop', function () {
		var l = new can.List([
			0,
			1,
			2,
			3
		]);
		l.bind('change', function (ev, attr, how, newVals, oldVals) {
			equal(attr, '3');
			equal(how, 'remove');
			equal(newVals, undefined);
			deepEqual(oldVals, [3]);
		});
		l.pop();
		deepEqual(l.serialize(), [
			0,
			1,
			2
		]);
	});
	test('changing an object unbinds', function () {
		var state = new can.Map({
			category: 5,
			productType: 4,
			properties: {
				brand: [],
				model: [],
				price: []
			}
		}),
			count = 0;
		var brand = state.attr('properties.brand');
		state.bind('change', function (ev, attr, how, val, old) {
			equal(attr, 'properties.brand');
			equal(count, 0, 'count called once');
			count++;
			equal(how, 'set');
			equal(val[0], 'hi');
		});
		state.attr('properties.brand', ['hi']);
		brand.push(1, 2, 3);
	});
	test('replacing with an object that object becomes observable', function () {
		var state = new can.Map({
			properties: {
				brand: [],
				model: [],
				price: []
			}
		});
		ok(state.attr('properties')
			.bind, 'has bind function');
		state.attr('properties', {});
		ok(state.attr('properties')
			.bind, 'has bind function');
	});
	test('attr does not blow away old observable', function () {
		var state = new can.Map({
			properties: {
				brand: ['gain']
			}
		});
		var oldCid = state.attr('properties.brand')
			._cid;
		state.attr({
			properties: {
				brand: []
			}
		}, true);
		deepEqual(state.attr('properties.brand')
			._cid, oldCid, 'should be the same map, so that views bound to the old one get updates');
		equal(state.attr('properties.brand')
			.length, 0, 'list should be empty');
	});
	test('sub observes respect attr remove parameter', function () {
		var bindCalled = 0,
			state = new can.Map({
				monkey: {
					tail: 'brain'
				}
			});
		state.bind('change', function (ev, attr, how, newVal, old) {
			bindCalled++;
			equal(attr, 'monkey.tail');
			equal(old, 'brain');
			equal(how, 'remove');
		});
		state.attr({
			monkey: {}
		});
		equal('brain', state.attr('monkey.tail'), 'should not remove attribute of sub map when remove param is false');
		equal(0, bindCalled, 'remove event not fired for sub map when remove param is false');
		state.attr({
			monkey: {}
		}, true);
		equal(undefined, state.attr('monkey.tail'), 'should remove attribute of sub map when remove param is false');
		equal(1, bindCalled, 'remove event fired for sub map when remove param is false');
	});
	test('remove attr', function () {
		var state = new can.Map({
			properties: {
				brand: [],
				model: [],
				price: []
			}
		});
		state.bind('change', function (ev, attr, how, newVal, old) {
			equal(attr, 'properties');
			equal(how, 'remove');
			deepEqual(old.serialize(), {
				brand: [],
				model: [],
				price: []
			});
		});
		state.removeAttr('properties');
		equal(undefined, state.attr('properties'));
	});
	test('remove nested attr', function () {
		var state = new can.Map({
			properties: {
				nested: true
			}
		});
		state.bind('change', function (ev, attr, how, newVal, old) {
			equal(attr, 'properties.nested');
			equal(how, 'remove');
			deepEqual(old, true);
		});
		state.removeAttr('properties.nested');
		equal(undefined, state.attr('properties.nested'));
	});
	test('remove item in nested array', function () {
		var state = new can.Map({
			array: [
				'a',
				'b'
			]
		});
		state.bind('change', function (ev, attr, how, newVal, old) {
			equal(attr, 'array.1');
			equal(how, 'remove');
			deepEqual(old, ['b']);
		});
		state.removeAttr('array.1');
		equal(state.attr('array.length'), 1);
	});
	test('remove nested property in item of array', function () {
		var state = new can.Map({
			array: [{
				nested: true
			}]
		});
		state.bind('change', function (ev, attr, how, newVal, old) {
			equal(attr, 'array.0.nested');
			equal(how, 'remove');
			deepEqual(old, true);
		});
		state.removeAttr('array.0.nested');
		equal(undefined, state.attr('array.0.nested'));
	});
	test('remove nested property in item of array map', function () {
		var state = new can.List([{
			nested: true
		}]);
		state.bind('change', function (ev, attr, how, newVal, old) {
			equal(attr, '0.nested');
			equal(how, 'remove');
			deepEqual(old, true);
		});
		state.removeAttr('0.nested');
		equal(undefined, state.attr('0.nested'));
	});
	test('attr with an object', function () {
		var state = new can.Map({
			properties: {
				foo: 'bar',
				brand: []
			}
		});
		state.bind('change', function (ev, attr, how, newVal) {
			equal(attr, 'properties.foo', 'foo has changed');
			equal(newVal, 'bad');
		});
		state.attr({
			properties: {
				foo: 'bar',
				brand: []
			}
		});
		state.attr({
			properties: {
				foo: 'bad',
				brand: []
			}
		});
		state.unbind('change');
		state.bind('change', function (ev, attr, how, newVal) {
			equal(attr, 'properties.brand.0');
			equal(how, 'add');
			deepEqual(newVal, ['bad']);
		});
		state.attr({
			properties: {
				foo: 'bad',
				brand: ['bad']
			}
		});
	});
	test('empty get', function () {
		var state = new can.Map({});
		equal(state.attr('foo.bar'), undefined);
	});
	test('attr deep array ', function () {
		var state = new can.Map({});
		var arr = [{
			foo: 'bar'
		}],
			thing = {
				arr: arr
			};
		state.attr({
			thing: thing
		}, true);
		ok(thing.arr === arr, 'thing unmolested');
	});
	test('attr semi-serialize', function () {
		var first = {
			foo: {
				bar: 'car'
			},
			arr: [
				1,
				2,
				3, {
					four: '5'
				}
			]
		}, compare = {
				foo: {
					bar: 'car'
				},
				arr: [
					1,
					2,
					3, {
						four: '5'
					}
				]
			};
		var res = new can.Map(first)
			.attr();
		deepEqual(res, compare, 'test');
	});
	test('attr sends events after it is done', function () {
		var state = new can.Map({
			foo: 1,
			bar: 2
		});
		state.bind('change', function () {
			equal(state.attr('foo'), -1, 'foo set');
			equal(state.attr('bar'), -2, 'bar set');
		});
		state.attr({
			foo: -1,
			bar: -2
		});
	});
	test('direct property access', function () {
		var state = new can.Map({
			foo: 1,
			attr: 2
		});
		equal(state.foo, 1);
		equal(typeof state.attr, 'function');
	});
	test('pop unbinds', function () {
		var l = new can.List([{
			foo: 'bar'
		}]);
		var o = l.attr(0),
			count = 0;
		l.bind('change', function (ev, attr, how, newVal, oldVal) {
			count++;
			if (count === 1) {
				equal(attr, '0.foo', 'count is set');
			} else if (count === 2) {
				equal(how, 'remove', 'remove event called');
				equal(attr, '0', 'remove event called with correct index');
			} else {
				ok(false, 'change handler called too many times');
			}
		});
		equal(o.attr('foo'), 'bar');
		o.attr('foo', 'car');
		l.pop();
		o.attr('foo', 'bad');
	});
	test('splice unbinds', function () {
		var l = new can.List([{
			foo: 'bar'
		}]);
		var o = l.attr(0),
			count = 0;
		l.bind('change', function (ev, attr, how, newVal, oldVal) {
			count++;
			if (count === 1) {
				equal(attr, '0.foo', 'count is set');
			} else if (count === 2) {
				equal(how, 'remove');
				equal(attr, '0');
			} else {
				ok(false, 'called too many times');
			}
		});
		equal(o.attr('foo'), 'bar');
		o.attr('foo', 'car');
		l.splice(0, 1);
		o.attr('foo', 'bad');
	});
	test('always gets right attr even after moving array items', function () {
		var l = new can.List([{
			foo: 'bar'
		}]);
		var o = l.attr(0);
		l.unshift('A new Value');
		l.bind('change', function (ev, attr, how) {
			equal(attr, '1.foo');
		});
		o.attr('foo', 'led you');
	});
	test('recursive observers do not cause stack overflow', function () {
		expect(0);
		var a = new can.Map();
		var b = new can.Map({
			a: a
		});
		a.attr('b', b);
	});
	test('bind to specific attribute changes when an existing attribute\'s value is changed', function () {
		var paginate = new can.Map({
			offset: 100,
			limit: 100,
			count: 2000
		});
		paginate.bind('offset', function (ev, newVal, oldVal) {
			equal(newVal, 200);
			equal(oldVal, 100);
		});
		paginate.attr('offset', 200);
	});
	test('bind to specific attribute changes when an attribute is removed', 2, function () {
		var paginate = new can.Map({
			offset: 100,
			limit: 100,
			count: 2000
		});
		paginate.bind('offset', function (ev, newVal, oldVal) {
			equal(newVal, undefined);
			equal(oldVal, 100);
		});
		paginate.removeAttr('offset');
	});
	test('Array accessor methods', 11, function () {
		var l = new can.List([
			'a',
			'b',
			'c'
		]),
			sliced = l.slice(2),
			joined = l.join(' | '),
			concatenated = l.concat([
				2,
				1
			], new can.List([0]));
		ok(sliced instanceof can.List, 'Slice is an Observable list');
		equal(sliced.length, 1, 'Sliced off two elements');
		equal(sliced[0], 'c', 'Single element as expected');
		equal(joined, 'a | b | c', 'Joined list properly');
		ok(concatenated instanceof can.List, 'Concatenated is an Observable list');
		deepEqual(concatenated.serialize(), [
			'a',
			'b',
			'c',
			2,
			1,
			0
		], 'List concatenated properly');
		l.forEach(function (letter, index) {
			ok(true, 'Iteration');
			if (index === 0) {
				equal(letter, 'a', 'First letter right');
			}
			if (index === 2) {
				equal(letter, 'c', 'Last letter right');
			}
		});
	});
	test('instantiating can.List of correct type', function () {
		var Ob = can.Map({
			getName: function () {
				return this.attr('name');
			}
		});
		var list = new Ob.List([{
			name: 'Tester'
		}]);
		equal(list.length, 1, 'List length is correct');
		ok(list[0] instanceof can.Map, 'Initialized list item converted to can.Map');
		ok(list[0] instanceof Ob, 'Initialized list item converted to Ob');
		equal(list[0].getName(), 'Tester', 'Converted to extended Map instance, could call getName()');
		list.push({
			name: 'Another test'
		});
		equal(list[1].getName(), 'Another test', 'Pushed item gets converted as well');
	});
	test('can.List.prototype.splice converts objects (#253)', function () {
		var Ob = can.Map({
			getAge: function () {
				return this.attr('age') + 10;
			}
		});
		var list = new Ob.List([{
			name: 'Tester',
			age: 23
		}, {
			name: 'Tester 2',
			age: 44
		}]);
		equal(list[0].getAge(), 33, 'Converted age');
		list.splice(1, 1, {
			name: 'Spliced',
			age: 92
		});
		equal(list[1].getAge(), 102, 'Converted age of spliced');
	});
	test('removing an already missing attribute does not cause an event', function () {
		expect(0);
		var ob = new can.Map();
		ob.bind('change', function () {
			ok(false);
		});
		ob.removeAttr('foo');
	});
	test('Only plain objects should be converted to Observes', function () {
		var ob = new can.Map();
		ob.attr('date', new Date());
		ok(ob.attr('date') instanceof Date, 'Date should not be converted');
		var selected = can.$('body');
		ob.attr('sel', selected);
		if (can.isArray(selected)) {
			ok(ob.attr('sel') instanceof can.List, 'can.$() as array converted into List');
		} else {
			equal(ob.attr('sel'), selected, 'can.$() should not be converted');
		}
		ob.attr('element', document.getElementsByTagName('body')[0]);
		equal(ob.attr('element'), document.getElementsByTagName('body')[0], 'HTMLElement should not be converted');
		ob.attr('window', window);
		equal(ob.attr('window'), window, 'Window object should not be converted');
	});
	test('bind on deep properties', function () {
		expect(2);
		var ob = new can.Map({
			name: {
				first: 'Brian'
			}
		});
		ob.bind('name.first', function (ev, newVal, oldVal) {
			equal(newVal, 'Justin');
			equal(oldVal, 'Brian');
		});
		ob.attr('name.first', 'Justin');
	});
	test('startBatch and stopBatch and changed event', 5, function () {
		var ob = new can.Map({
			name: {
				first: 'Brian'
			},
			age: 29
		}),
			bothSet = false,
			changeCallCount = 0,
			changedCalled = false;
		ob.bind('change', function () {
			ok(bothSet, 'both properties are set before the changed event was called');
			ok(!changedCalled, 'changed not called yet');
			changeCallCount++;
		});
		stop();
		can.batch.start(function () {
			ok(true, 'batch callback called');
		});
		ob.attr('name.first', 'Justin');
		setTimeout(function () {
			ob.attr('age', 30);
			bothSet = true;
			can.batch.stop();
			start();
		}, 1);
	});
	test('startBatch callback', 4, function () {
		var ob = new can.Map({
			game: {
				name: 'Legend of Zelda'
			},
			hearts: 15
		}),
			callbackCalled = false;
		ob.bind('change', function () {
			equal(callbackCalled, false, 'startBatch callback not called yet');
		});
		can.batch.start(function () {
			ok(true, 'startBatch callback called');
			callbackCalled = true;
		});
		ob.attr('hearts', 16);
		equal(callbackCalled, false, 'startBatch callback not called yet');
		can.batch.stop();
		equal(callbackCalled, true, 'startBatch callback called');
	});
	test('nested map attr', function () {
		var person1 = new can.Map({
			name: {
				first: 'Josh'
			}
		}),
			person2 = new can.Map({
				name: {
					first: 'Justin',
					last: 'Meyer'
				}
			}),
			count = 0;
		person1.bind('change', function (ev, attr, how, val, old) {
			equal(count, 0, 'change called once');
			count++;
			equal(attr, 'name');
			equal(val.attr('first'), 'Justin');
			equal(val.attr('last'), 'Meyer');
		});
		person1.attr('name', person2.attr('name'));
		person1.attr('name', person2.attr('name'));
	});
	test('Nested array conversion (#172)', 4, function () {
		var original = [
			[
				1,
				2
			],
			[
				3,
				4
			],
			[
				5,
				6
			]
		],
			list = new can.List(original);
		equal(list.length, 3, 'list length is correct');
		deepEqual(list.serialize(), original, 'Lists are the same');
		list.unshift([
			10,
			11
		], [
			12,
			13
		]);
		ok(list[0] instanceof can.List, 'Unshifted array converted to map list');
		deepEqual(list.serialize(), [
			[
				10,
				11
			],
			[
				12,
				13
			]
		].concat(original), 'Arrays unshifted properly');
	});
	test('can.List.prototype.replace (#194)', 7, function () {
		var list = new can.List([
			'a',
			'b',
			'c'
		]),
			replaceList = [
				'd',
				'e',
				'f',
				'g'
			],
			dfd = new can.Deferred();
		list.bind('remove', function (ev, arr) {
			equal(arr.length, 3, 'Three elements removed');
		});
		list.bind('add', function (ev, arr) {
			equal(arr.length, 4, 'Four new elements added');
		});
		list.replace(replaceList);
		deepEqual(list.serialize(), replaceList, 'Lists are the same');
		list.unbind('remove');
		list.unbind('add');
		list.replace();
		equal(list.length, 0, 'List has been emptied');
		list.push('D');
		stop();
		list.replace(dfd);
		setTimeout(function () {
			var newList = [
				'x',
				'y'
			];
			list.bind('remove', function (ev, arr) {
				equal(arr.length, 1, 'One element removed');
			});
			list.bind('add', function (ev, arr) {
				equal(arr.length, 2, 'Two new elements added from Deferred');
			});
			dfd.resolve(newList);
			deepEqual(list.serialize(), newList, 'Lists are the same');
			start();
		}, 100);
	});
	test('replace with a deferred that resolves to an List', function () {
		var def = new can.Deferred();
		def.resolve(new can.List([{
			name: 'foo'
		}, {
			name: 'bar'
		}]));
		var list = new can.List([{
			name: '1'
		}, {
			name: '2'
		}]);
		list.bind('change', function () {
			equal(list.length, 2, 'length is still 2');
			equal(list[0].attr('name'), 'foo', 'set to foo');
		});
		list.replace(def);
	});
	test('.attr method doesn\'t merge nested objects (#207)', function () {
		var test = new can.Map({
			a: {
				a1: 1,
				a2: 2
			},
			b: {
				b1: 1,
				b2: 2
			}
		});
		test.attr({
			a: {
				a2: 3
			},
			b: {
				b1: 3
			}
		});
		deepEqual(test.attr(), {
			'a': {
				'a1': 1,
				'a2': 3
			},
			'b': {
				'b1': 3,
				'b2': 2
			}
		}, 'Object merged as expected');
	});
	test('IE8 error on list setup with List (#226)', function () {
		var list = new can.List([
			'first',
			'second',
			'third'
		]),
			otherList = new can.List(list);
		deepEqual(list.attr(), otherList.attr(), 'Lists are the same');
	});
	test('initialize List with a deferred', function () {
		stop();
		var def = new can.Deferred();
		var list = new can.List(def);
		list.bind('add', function (ev, items, index) {
			deepEqual(items, [
				'a',
				'b'
			]);
			equal(index, 0);
			start();
		});
		setTimeout(function () {
			def.resolve([
				'a',
				'b'
			]);
		}, 10);
	});
	test('triggering a event while in a batch (#291)', function () {
		expect(0);
		stop();
		var map = new can.Map();
		can.batch.start();
		can.trigger(map, 'change', 'random');
		setTimeout(function () {
			can.batch.stop();
			start();
		}, 10);
	});
	test('dot separated keys (#257, #296)', function () {
		var ob = new can.Map({
			'test.value': 'testing',
			other: {
				test: 'value'
			}
		});
		equal(ob['test.value'], 'testing', 'Set value with dot separated key properly');
		equal(ob.attr('test.value'), 'testing', 'Could retrieve value with .attr');
		equal(ob.attr('other.test'), 'value', 'Still getting dot separated value');
		ob.attr({
			'other.bla': 'othervalue'
		});
		equal(ob['other.bla'], 'othervalue', 'Key is not split');
		equal(ob.attr('other.bla'), 'othervalue', 'Could retrieve value with .attr');
		ob.attr('other.stuff', 'thinger');
		equal(ob.attr('other.stuff'), 'thinger', 'Set dot separated value');
		deepEqual(ob.attr('other')
			.serialize(), {
				test: 'value',
				stuff: 'thinger'
			}, 'Object set properly');
	});
	test('cycle binding', function () {
		var first = new can.Map(),
			second = new can.Map();
		first.attr('second', second);
		second.attr('first', second);
		var handler = function () {};
		first.bind('change', handler);
		ok(first._bindings, 'has bindings');
		first.unbind('change', handler);
		ok(!first._bindings, 'bindings removed');
	});
	test('Deferreds are not converted', function () {
		var dfd = can.Deferred(),
			ob = new can.Map({
				test: dfd
			});
		ok(can.isPromise(ob.attr('test')), 'Attribute is a deferred');
		ok(!ob.attr('test')
			._cid, 'Does not have a _cid');
	});
	test('Setting property to undefined', function () {
		var ob = new can.Map({
			'foo': 'bar'
		});
		ob.attr('foo', undefined);
		equal(ob.attr('foo'), undefined, 'foo has a value.');
	});
	test('removing list items containing computes', function () {
		var list = new can.List([{
			comp: can.compute(function () {
				return false;
			})
		}]);
		list.pop();
		equal(list.length, 0, 'list is empty');
	});
	module('can/observe compute');
	test('Basic Compute', function () {
		var o = new can.Map({
			first: 'Justin',
			last: 'Meyer'
		});
		var prop = can.compute(function () {
			return o.attr('first') + ' ' + o.attr('last');
		});
		equal(prop(), 'Justin Meyer');
		var handler = function (ev, newVal, oldVal) {
			equal(newVal, 'Brian Meyer');
			equal(oldVal, 'Justin Meyer');
		};
		prop.bind('change', handler);
		o.attr('first', 'Brian');
		prop.unbind('change', handler);
		o.attr('first', 'Brian');
	});
	test('compute on prototype', function () {
		var Person = can.Map({
			fullName: function () {
				return this.attr('first') + ' ' + this.attr('last');
			}
		});
		var me = new Person({
			first: 'Justin',
			last: 'Meyer'
		});
		var fullName = can.compute(me.fullName, me);
		equal(fullName(), 'Justin Meyer');
		var called = 0;
		fullName.bind('change', function (ev, newVal, oldVal) {
			called++;
			equal(called, 1, 'called only once');
			equal(newVal, 'Justin Shah');
			equal(oldVal, 'Justin Meyer');
		});
		me.attr('last', 'Shah');
	});
	test('setter compute', function () {
		var project = new can.Map({
			progress: 0.5
		});
		var computed = can.compute(function (val) {
			if (val) {
				project.attr('progress', val / 100);
			} else {
				return parseInt(project.attr('progress') * 100, 10);
			}
		});
		equal(computed(), 50, 'the value is right');
		computed(25);
		equal(project.attr('progress'), 0.25);
		equal(computed(), 25);
		computed.bind('change', function (ev, newVal, oldVal) {
			equal(newVal, 75);
			equal(oldVal, 25);
		});
		computed(75);
	});
	test('compute a compute', function () {
		var project = new can.Map({
			progress: 0.5
		});
		var percent = can.compute(function (val) {
			if (val) {
				project.attr('progress', val / 100);
			} else {
				return parseInt(project.attr('progress') * 100, 10);
			}
		});
		percent.named = 'PERCENT';
		equal(percent(), 50, 'percent starts right');
		percent.bind('change', function () {});
		var fraction = can.compute(function (val) {
			if (val) {
				percent(parseInt(val.split('/')[0], 10));
			} else {
				return percent() + '/100';
			}
		});
		fraction.named = 'FRACTIOn';
		fraction.bind('change', function () {});
		equal(fraction(), '50/100', 'fraction starts right');
		percent(25);
		equal(percent(), 25);
		equal(project.attr('progress'), 0.25, 'progress updated');
		equal(fraction(), '25/100', 'fraction updated');
		fraction('15/100');
		equal(fraction(), '15/100');
		equal(project.attr('progress'), 0.15, 'progress updated');
		equal(percent(), 15, '% updated');
	});
	test('compute with a simple compute', function () {
		expect(4);
		var a = can.compute(5);
		var b = can.compute(function () {
			return a() * 2;
		});
		equal(b(), 10, 'b starts correct');
		a(3);
		equal(b(), 6, 'b updates');
		b.bind('change', function () {
			equal(b(), 24, 'b fires change');
		});
		a(12);
		equal(b(), 24, 'b updates when bound');
	});
	test('empty compute', function () {
		var c = can.compute();
		c.bind('change', function (ev, newVal, oldVal) {
			ok(oldVal === undefined, 'was undefined');
			ok(newVal === 0, 'now zero');
		});
		c(0);
	});
	/*test('only one update on a batchTransaction', function () {
		var person = new can.Map({
			first: 'Justin',
			last: 'Meyer'
		});
		var func = function () {
			return person.attr('first') + ' ' + person.attr('last') + Math.random();
		};
		var callbacks = 0;
		can.compute.binder(func, window, function (newVal, oldVal) {
			callbacks++;
		});
		person.attr({
			first: 'Brian',
			last: 'Moschel'
		});
		equal(callbacks, 1, 'only one callback');
	});
	test('only one update on a start and end transaction', function () {
		var person = new can.Map({
			first: 'Justin',
			last: 'Meyer'
		}),
			age = can.compute(5);
		var func = function (newVal, oldVal) {
			return person.attr('first') + ' ' + person.attr('last') + age() + Math.random();
		};
		var callbacks = 0;
		can.compute.binder(func, window, function (newVal, oldVal) {
			callbacks++;
		});
		can.batch.start();
		person.attr('first', 'Brian');
		stop();
		setTimeout(function () {
			person.attr('last', 'Moschel');
			age(12);
			can.batch.stop();
			equal(callbacks, 1, 'only one callback');
			start();
		});
	});*/
	test('Compute emits change events when an embbedded observe has properties added or removed', 4, function () {
		var obs = new can.Map(),
			compute1 = can.compute(function () {
				var txt = obs.attr('foo');
				obs.each(function (val) {
					txt += val.toString();
				});
				return txt;
			});
		compute1.bind('change', function (ev, newVal, oldVal) {
			ok(true, 'change handler fired: ' + newVal);
		});
		obs.attr('foo', 1);
		obs.attr('bar', 2);
		obs.attr('foo', 3);
		obs.removeAttr('bar');
		obs.removeAttr('bar');
	});
	test('compute only updates once when a list\'s contents are replaced', function () {
		var list = new can.List([{
			name: 'Justin'
		}]),
			computedCount = 0;
		var compute = can.compute(function () {
			computedCount++;
			list.each(function (item) {
				item.attr('name');
			});
		});
		equal(0, computedCount, 'computes are not called until their value is read');
		compute.bind('change', function (ev, newVal, oldVal) {});
		equal(1, computedCount, 'binding computes to store the value');
		list.replace([{
			name: 'hank'
		}]);
		equal(2, computedCount, 'only one compute');
	});
	test('Generate computes from Observes with can.Map.prototype.compute (#203)', 6, function () {
		var obs = new can.Map({
			test: 'testvalue'
		});
		var compute = obs.compute('test');
		ok(compute.isComputed, '`test` is computed');
		equal(compute(), 'testvalue', 'Value is as expected');
		obs.attr('test', 'observeValue');
		equal(compute(), 'observeValue', 'Value is as expected');
		compute.bind('change', function (ev, newVal) {
			equal(newVal, 'computeValue', 'new value from compute');
		});
		obs.bind('change', function (ev, name, how, newVal) {
			equal(newVal, 'computeValue', 'Got new value from compute');
		});
		compute('computeValue');
		equal(compute(), 'computeValue', 'Got updated value');
	});
	test('compute of computes', function () {
		expect(2);
		var suggestedSearch = can.compute(null),
			searchQuery = can.compute(''),
			searchText = can.compute(function () {
				var suggested = suggestedSearch();
				if (suggested) {
					return suggested;
				} else {
					return searchQuery();
				}
			});
		equal('', searchText(), 'inital set');
		searchText.bind('change', function (ev, newVal) {
			equal(newVal, 'food', 'food set');
		});
		searchQuery('food');
	});
	test('compute doesn\'t rebind and leak with 0 bindings', function () {
		var state = new can.Map({
			foo: 'bar'
		});
		var computedA = 0,
			computedB = 0;
		var computeA = can.compute(function () {
			computedA++;
			return state.attr('foo') === 'bar';
		});
		var computeB = can.compute(function () {
			computedB++;
			return state.attr('foo') === 'bar' || 15;
		});

		function aChange(ev, newVal) {
			if (newVal) {
				computeB.bind('change.computeA', function () {});
			} else {
				computeB.unbind('change.computeA');
			}
		}
		computeA.bind('change', aChange);
		aChange(null, computeA());
		equal(computedA, 1, 'binding A computes the value');
		equal(computedB, 1, 'A=true, so B is bound, computing the value');
		state.attr('foo', 'baz');
		equal(computedA, 2, 'A recomputed and unbound B');
		equal(computedB, 1, 'B was unbound, so not recomputed');
		state.attr('foo', 'bar');
		equal(computedA, 3, 'A recomputed => true');
		equal(computedB, 2, 'A=true so B is rebound and recomputed');
		computeA.unbind('change', aChange);
		computeB.unbind('change.computeA');
		state.attr('foo', 'baz');
		equal(computedA, 3, 'unbound, so didn\'t recompute A');
		equal(computedB, 2, 'unbound, so didn\'t recompute B');
	});
	test('compute setter without external value', function () {
		var age = can.compute(0, function (newVal, oldVal) {
			var num = +newVal;
			if (!isNaN(num) && 0 <= num && num <= 120) {
				return num;
			} else {
				return oldVal;
			}
		});
		equal(age(), 0, 'initial value set');
		age.bind('change', function (ev, newVal, oldVal) {
			equal(5, newVal);
			age.unbind('change', this.Constructor);
		});
		age(5);
		equal(age(), 5, '5 set');
		age('invalid');
		equal(age(), 5, '5 kept');
	});
	test('compute value', function () {
		expect(9);
		var input = {
			value: 1
		};
		var value = can.compute('', {
			get: function () {
				return input.value;
			},
			set: function (newVal) {
				input.value = newVal;
			},
			on: function (update) {
				input.onchange = update;
			},
			off: function () {
				delete input.onchange;
			}
		});
		equal(value(), 1, 'original value');
		ok(!input.onchange, 'nothing bound');
		value(2);
		equal(value(), 2, 'updated value');
		equal(input.value, 2, 'updated input.value');
		value.bind('change', function (ev, newVal, oldVal) {
			equal(newVal, 3, 'newVal');
			equal(oldVal, 2, 'oldVal');
			value.unbind('change', this.Constructor);
		});
		ok(input.onchange, 'binding to onchange');
		value(3);
		ok(!input.onchange, 'removed binding');
		equal(value(), 3);
	});
	test('compute bound to observe', function () {
		var me = new can.Map({
			name: 'Justin'
		});
		var bind = me.bind,
			unbind = me.unbind,
			bindCount = 0;
		me.bind = function () {
			bindCount++;
			bind.apply(this, arguments);
		};
		me.unbind = function () {
			bindCount--;
			unbind.apply(this, arguments);
		};
		var name = can.compute(me, 'name');
		equal(bindCount, 0);
		equal(name(), 'Justin');
		var handler = function (ev, newVal, oldVal) {
			equal(newVal, 'Justin Meyer');
			equal(oldVal, 'Justin');
		};
		name.bind('change', handler);
		equal(bindCount, 1);
		name.unbind('change', handler);
		stop();
		setTimeout(function () {
			start();
			equal(bindCount, 0);
		}, 100);
	});
	test('binding to a compute on an observe before reading', function () {
		var me = new can.Map({
			name: 'Justin'
		});
		var name = can.compute(me, 'name');
		var handler = function (ev, newVal, oldVal) {
			equal(newVal, 'Justin Meyer');
			equal(oldVal, 'Justin');
		};
		name.bind('change', handler);
		equal(name(), 'Justin');
	});
	test('compute bound to input value', function () {
		var input = document.createElement('input');
		input.value = 'Justin';
		var value = can.compute(input, 'value', 'change');
		equal(value(), 'Justin');
		value('Justin M.');
		equal(input.value, 'Justin M.', 'input change correctly');
		var handler = function (ev, newVal, oldVal) {
			equal(newVal, 'Justin Meyer');
			equal(oldVal, 'Justin M.');
		};
		value.bind('change', handler);
		input.value = 'Justin Meyer';
		value.unbind('change', handler);
		stop();
		setTimeout(function () {
			input.value = 'Brian Moschel';
			equal(value(), 'Brian Moschel');
			start();
		}, 50);
	});
	test('compute on the prototype', function () {
		expect(4);
		var Person = can.Map.extend({
			fullName: can.compute(function (fullName) {
				if (arguments.length) {
					var parts = fullName.split(' ');
					this.attr({
						first: parts[0],
						last: parts[1]
					});
				} else {
					return this.attr('first') + ' ' + this.attr('last');
				}
			})
		});
		var me = new Person();
		var fn = me.attr({
			first: 'Justin',
			last: 'Meyer'
		})
			.attr('fullName');
		equal(fn, 'Justin Meyer', 'can read attr');
		me.attr('fullName', 'Brian Moschel');
		equal(me.attr('first'), 'Brian', 'set first name');
		equal(me.attr('last'), 'Moschel', 'set last name');
		var handler = function (ev, newVal, oldVal) {
			ok(newVal, 'Brian M');
		};
		me.bind('fullName', handler);
		me.attr('last', 'M');
		me.unbind('fullName', handler);
		me.attr('first', 'B');
	});
	test('join is computable (#519)', function () {
		expect(2);
		var l = new can.List([
			'a',
			'b'
		]);
		var joined = can.compute(function () {
			return l.join(',');
		});
		joined.bind('change', function (ev, newVal, oldVal) {
			equal(oldVal, 'a,b');
			equal(newVal, 'a,b,c');
		});
		l.push('c');
	});

	test("nested computes", function () {

		var data = new can.Map({});
		var compute = data.compute('summary.button');
		compute.bind('change', function () {
			ok(true, "compute changed");
		});

		data.attr({
			summary: {
				button: 'hey'
			}
		}, true);
	});

})(undefined, undefined, undefined, undefined, __m30);

// ## compute/compute_test.js
var __m33 = (function () {
	module('can/compute');
	test('single value compute', function () {
		var num = can.compute(1);
		num.bind('change', function (ev, newVal, oldVal) {
			equal(newVal, 2, 'newVal');
			equal(oldVal, 1, 'oldVal');
		});
		num(2);
	});
	test('can.compute.truthy', function () {
		var result = 0;
		var num = can.compute(3);
		var truthy = can.compute.truthy(num);
		var tester = can.compute(function () {
			if (truthy()) {
				return ++result;
			} else {
				return ++result;
			}
		});
		tester.bind('change', function (ev, newVal, oldVal) {
			if (num() === 0) {
				equal(newVal, 2, '2 is the new val');
			} else if (num() === -1) {
				equal(newVal, 3, '3 is the new val');
			} else {
				ok(false, 'change should not be called');
			}
		});
		equal(tester(), 1, 'on bind, we call tester once');
		num(2);
		num(1);
		num(0);
		num(-1);
	});
	test('a binding compute does not double read', function () {
		var sourceAge = 30,
			timesComputeIsCalled = 0;
		var age = can.compute(function (newVal) {
			timesComputeIsCalled++;
			if (timesComputeIsCalled === 1) {
				ok(true, 'reading age to get value');
			} else if (timesComputeIsCalled === 2) {
				equal(newVal, 31, 'the second time should be an update');
			} else if (timesComputeIsCalled === 3) {
				ok(true, 'called after set to get the value');
			} else {
				ok(false, 'You\'ve called the callback ' + timesComputeIsCalled + ' times');
			}
			if (arguments.length) {
				sourceAge = newVal;
			} else {
				return sourceAge;
			}
		});
		var info = can.compute(function () {
			return 'I am ' + age();
		});
		var k = function () {};
		info.bind('change', k);
		equal(info(), 'I am 30');
		age(31);
		equal(info(), 'I am 31');
	});
	test('cloning a setter compute (#547)', function () {
		var name = can.compute('', function (newVal) {
			return this.txt + newVal;
		});
		var cloned = name.clone({
			txt: '.'
		});
		cloned('-');
		equal(cloned(), '.-');
	});
})(undefined, __m30);

// ## model/model_test.js
var __m34 = (function () {
	module('can/model', {
		setup: function () {}
	});
	var isDojo = typeof dojo !== 'undefined';
	test('shadowed id', function () {
		var MyModel = can.Model.extend({
			id: 'foo'
		}, {
			foo: function () {
				return this.attr('foo');
			}
		});
		var newModel = new MyModel({});
		ok(newModel.isNew(), 'new model is isNew');
		var oldModel = new MyModel({
			foo: 'bar'
		});
		ok(!oldModel.isNew(), 'old model is not new');
		equal(oldModel.foo(), 'bar', 'method can coexist with attribute');
	});
	test('findAll deferred', function () {
		can.Model('Person', {
			findAll: function (params, success, error) {
				var self = this;
				return can.ajax({
					url: '/people',
					data: params,
					fixture: can.test.fixture('model/test/people.json'),
					dataType: 'json'
				})
					.pipe(function (data) {
						return self.models(data);
					});
			}
		}, {});
		stop();
		var people = Person.findAll({});
		people.then(function (people) {
			equal(people.length, 1, 'we got a person back');
			equal(people[0].name, 'Justin', 'Got a name back');
			equal(people[0].constructor.shortName, 'Person', 'got a class back');
			start();
		});
	});
	test('findAll rejects non-array (#384)', function () {
		var Person = can.Model.extend({
			findAll: function (params, success, error) {
				var dfd = can.Deferred();
				setTimeout(function () {
					dfd.resolve({
						stuff: {}
					});
				}, 100);
				return dfd;
			}
		}, {});
		stop();
		Person.findAll({})
			.then(function () {
				ok(false, 'This should not succeed');
			}, function (err) {
				ok(err instanceof Error, 'Got an error');
				equal(err.message, 'Could not get any raw data while converting using .models');
				start();
			});
	});
	asyncTest('findAll deferred reject', function () {
		// This test is automatically paused
		function rejectDeferred(df) {
			setTimeout(function () {
				df.reject();
			}, 100);
		}

		function resolveDeferred(df) {
			setTimeout(function () {
				df.resolve();
			}, 100);
		}
		can.Model('Person', {
			findAll: function (params, success, error) {
				var df = can.Deferred();
				if (params.resolve) {
					resolveDeferred(df);
				} else {
					rejectDeferred(df);
				}
				return df;
			}
		}, {});
		var people_reject = Person.findAll({
			resolve: false
		});
		var people_resolve = Person.findAll({
			resolve: true
		});
		setTimeout(function () {
			people_reject.done(function () {
				ok(false, 'This deferred should be rejected');
			});
			people_reject.fail(function () {
				ok(true, 'The deferred is rejected');
			});
			people_resolve.done(function () {
				ok(true, 'This deferred is resolved');
			});
			people_resolve.fail(function () {
				ok(false, 'The deferred should be resolved');
			});
			// continue the test
			start();
		}, 200);
	});
	if (window.jQuery) {
		asyncTest('findAll abort', function () {
			expect(4);
			var df;
			can.Model('Person', {
				findAll: function (params, success, error) {
					df = can.Deferred();
					df.then(function () {
						ok(!params.abort, 'not aborted');
					}, function () {
						ok(params.abort, 'aborted');
					});
					return df.promise({
						abort: function () {
							df.reject();
						}
					});
				}
			}, {});
			Person.findAll({
				abort: false
			})
				.done(function () {
					ok(true, 'resolved');
				});
			var resolveDf = df;
			var abortPromise = Person.findAll({
				abort: true
			})
				.fail(function () {
					ok(true, 'failed');
				});
			setTimeout(function () {
				resolveDf.resolve();
				abortPromise.abort();
				// continue the test
				start();
			}, 200);
		});
	}
	test('findOne deferred', function () {
		if (window.jQuery) {
			can.Model('Person', {
				findOne: function (params, success, error) {
					var self = this;
					return can.ajax({
						url: '/people/5',
						data: params,
						fixture: can.test.fixture('model/test/person.json'),
						dataType: 'json'
					})
						.pipe(function (data) {
							return self.model(data);
						});
				}
			}, {});
		} else {
			can.Model('Person', {
				findOne: can.test.fixture('model/test/person.json')
			}, {});
		}
		stop();
		var person = Person.findOne({});
		person.then(function (person) {
			equal(person.name, 'Justin', 'Got a name back');
			equal(person.constructor.shortName, 'Person', 'got a class back');
			start();
		});
	});
	test('save deferred', function () {
		can.Model('Person', {
			create: function (attrs, success, error) {
				return can.ajax({
					url: '/people',
					data: attrs,
					type: 'post',
					dataType: 'json',
					fixture: function () {
						return {
							id: 5
						};
					},
					success: success
				});
			}
		}, {});
		var person = new Person({
			name: 'Justin'
		}),
			personD = person.save();
		stop();
		personD.then(function (person) {
			start();
			equal(person.id, 5, 'we got an id');
		});
	});
	test('update deferred', function () {
		can.Model('Person', {
			update: function (id, attrs, success, error) {
				return can.ajax({
					url: '/people/' + id,
					data: attrs,
					type: 'post',
					dataType: 'json',
					fixture: function () {
						return {
							thing: 'er'
						};
					},
					success: success
				});
			}
		}, {});
		var person = new Person({
			name: 'Justin',
			id: 5
		}),
			personD = person.save();
		stop();
		personD.then(function (person) {
			start();
			equal(person.thing, 'er', 'we got updated');
		});
	});
	test('destroy deferred', function () {
		can.Model('Person', {
			destroy: function (id, success, error) {
				return can.ajax({
					url: '/people/' + id,
					type: 'post',
					dataType: 'json',
					fixture: function () {
						return {
							thing: 'er'
						};
					},
					success: success
				});
			}
		}, {});
		var person = new Person({
			name: 'Justin',
			id: 5
		}),
			personD = person.destroy();
		stop();
		personD.then(function (person) {
			start();
			equal(person.thing, 'er', 'we got destroyed');
		});
	});
	test('models', function () {
		can.Model('Person', {
			prettyName: function () {
				return 'Mr. ' + this.name;
			}
		});
		var people = Person.models([{
			id: 1,
			name: 'Justin'
		}]);
		equal(people[0].prettyName(), 'Mr. Justin', 'wraps wrapping works');
	});
	test('.models with custom id', function () {
		can.Model('CustomId', {
			findAll: can.test.path('model/test/customids.json'),
			id: '_id'
		}, {
			getName: function () {
				return this.name;
			}
		});
		var results = CustomId.models([{
			'_id': 1,
			'name': 'Justin'
		}, {
			'_id': 2,
			'name': 'Brian'
		}]);
		equal(results.length, 2, 'Got two items back');
		equal(results[0].name, 'Justin', 'First name right');
		equal(results[1].name, 'Brian', 'Second name right');
	});
	/*
	 test("async setters", function(){


	 can.Model("Test.AsyncModel",{
	 setName : function(newVal, success, error){


	 setTimeout(function(){
	 success(newVal)
	 }, 100)
	 }
	 });

	 var model = new Test.AsyncModel({
	 name : "justin"
	 });
	 equal(model.name, "justin","property set right away")

	 //makes model think it is no longer new
	 model.id = 1;

	 var count = 0;

	 model.bind('name', function(ev, newName){
	 equal(newName, "Brian",'new name');
	 equal(++count, 1, "called once");
	 ok(new Date() - now > 0, "time passed")
	 start();
	 })
	 var now = new Date();
	 model.attr('name',"Brian");
	 stop();
	 })*/
	test('binding', 2, function () {
		can.Model('Person');
		var inst = new Person({
			foo: 'bar'
		});
		inst.bind('foo', function (ev, val) {
			ok(true, 'updated');
			equal(val, 'baz', 'values match');
		});
		inst.attr('foo', 'baz');
	});
	test('auto methods', function () {
		//turn off fixtures
		can.fixture.on = false;
		var School = can.Model.extend('Jquery.Model.Models.School', {
			findAll: can.test.path('model/test/{type}.json'),
			findOne: can.test.path('model/test/{id}.json'),
			create: 'GET ' + can.test.path('model/test/create.json'),
			update: 'GET ' + can.test.path('model/test/update{id}.json')
		}, {});
		stop();
		School.findAll({
			type: 'schools'
		}, function (schools) {
			ok(schools, 'findAll Got some data back');
			equal(schools[0].constructor.shortName, 'School', 'there are schools');
			School.findOne({
				id: '4'
			}, function (school) {
				ok(school, 'findOne Got some data back');
				equal(school.constructor.shortName, 'School', 'a single school');
				new School({
					name: 'Highland'
				})
					.save(function (school) {
						equal(school.name, 'Highland', 'create gets the right name');
						school.attr({
							name: 'LHS'
						})
							.save(function () {
								start();
								equal(school.name, 'LHS', 'create gets the right name');
								can.fixture.on = true;
							});
					});
			});
		});
	});
	test('isNew', function () {
		var p = new Person();
		ok(p.isNew(), 'nothing provided is new');
		var p2 = new Person({
			id: null
		});
		ok(p2.isNew(), 'null id is new');
		var p3 = new Person({
			id: 0
		});
		ok(!p3.isNew(), '0 is not new');
	});
	test('findAll string', function () {
		can.fixture.on = false;
		can.Model('Test.Thing', {
			findAll: can.test.path('model/test/findAll.json') + ''
		}, {});
		stop();
		Test.Thing.findAll({}, function (things) {
			equal(things.length, 1, 'got an array');
			equal(things[0].id, 1, 'an array of things');
			start();
			can.fixture.on = true;
		});
	});
	/*
	 test("Empty uses fixtures", function(){
	 ok(false, "Figure out")
	 return;
	 can.Model("Test.Things");
	 $.fixture.make("thing", 10, function(i){
	 return {
	 id: i
	 }
	 });
	 stop();
	 Test.Thing.findAll({}, function(things){
	 start();
	 equal(things.length, 10,"got 10 things")
	 })
	 });*/
	test('Model events', function () {
		expect(12);
		var order = 0;
		can.Model('Test.Event', {
			create: function (attrs) {
				var def = isDojo ? new dojo.Deferred() : new can.Deferred();
				def.resolve({
					id: 1
				});
				return def;
			},
			update: function (id, attrs, success) {
				var def = isDojo ? new dojo.Deferred() : new can.Deferred();
				def.resolve(attrs);
				return def;
			},
			destroy: function (id, success) {
				var def = isDojo ? new dojo.Deferred() : new can.Deferred();
				def.resolve({});
				return def;
			}
		}, {});
		stop();
		Test.Event.bind('created', function (ev, passedItem) {
			ok(this === Test.Event, 'got model');
			ok(passedItem === item, 'got instance');
			equal(++order, 1, 'order');
			passedItem.save();
		})
			.bind('updated', function (ev, passedItem) {
				equal(++order, 2, 'order');
				ok(this === Test.Event, 'got model');
				ok(passedItem === item, 'got instance');
				passedItem.destroy();
			})
			.bind('destroyed', function (ev, passedItem) {
				equal(++order, 3, 'order');
				ok(this === Test.Event, 'got model');
				ok(passedItem === item, 'got instance');
				start();
			});
		var item = new Test.Event();
		item.bind('created', function () {
			ok(true, 'created');
		})
			.bind('updated', function () {
				ok(true, 'updated');
			})
			.bind('destroyed', function () {
				ok(true, 'destroyed');
			});
		item.save();
	});
	test('removeAttr test', function () {
		can.Model('Person');
		var person = new Person({
			foo: 'bar'
		});
		equal(person.foo, 'bar', 'property set');
		person.removeAttr('foo');
		equal(person.foo, undefined, 'property removed');
		var attrs = person.attr();
		equal(attrs.foo, undefined, 'attrs removed');
	});
	test('save error args', function () {
		var Foo = can.Model.extend('Testin.Models.Foo', {
			create: '/testinmodelsfoos.json'
		}, {});
		var st = '{type: "unauthorized"}';
		can.fixture('/testinmodelsfoos.json', function (request, response) {
			response(401, st);
		});
		stop();
		new Foo({})
			.save(function () {
				ok(false, 'success should not be called');
				start();
			}, function (jQXHR) {
				ok(true, 'error called');
				ok(jQXHR.getResponseHeader, 'jQXHR object');
				start();
			});
	});
	test('object definitions', function () {
		can.Model('ObjectDef', {
			findAll: {
				url: '/test/place',
				dataType: 'json'
			},
			findOne: {
				url: '/objectdef/{id}',
				timeout: 1000
			},
			create: {},
			update: {},
			destroy: {}
		}, {});
		can.fixture('GET /objectdef/{id}', function (original) {
			equal(original.timeout, 1000, 'timeout set');
			return {
				yes: true
			};
		});
		can.fixture('GET /test/place', function (original) {
			return [original.data];
		});
		stop();
		ObjectDef.findOne({
			id: 5
		}, function () {
			start();
		});
		stop();
		// Do find all, pass some attrs
		ObjectDef.findAll({
			start: 0,
			count: 10,
			myflag: 1
		}, function (data) {
			start();
			equal(data[0].myflag, 1, 'my flag set');
		});
		stop();
		// Do find all with slightly different attrs than before,
		// and notice when leaving one out the other is still there
		ObjectDef.findAll({
			start: 0,
			count: 10
		}, function (data) {
			start();
			equal(data[0].myflag, undefined, 'my flag is undefined');
		});
	});
	test('aborting create update and destroy', function () {
		stop();
		var delay = can.fixture.delay;
		can.fixture.delay = 1000;
		can.fixture('POST /abort', function () {
			ok(false, 'we should not be calling the fixture');
			return {};
		});
		can.Model('Abortion', {
			create: 'POST /abort',
			update: 'POST /abort',
			destroy: 'POST /abort'
		}, {});
		var deferred = new Abortion({
			name: 'foo'
		})
			.save(function () {
				ok(false, 'success create');
				start();
			}, function () {
				ok(true, 'create error called');
				deferred = new Abortion({
					name: 'foo',
					id: 5
				})
					.save(function () {
						ok(false, 'save called');
						start();
					}, function () {
						ok(true, 'error called in update');
						deferred = new Abortion({
							name: 'foo',
							id: 5
						})
							.destroy(function () {}, function () {
								ok(true, 'destroy error called');
								can.fixture.delay = delay;
								start();
							});
						setTimeout(function () {
							deferred.abort();
						}, 10);
					});
				setTimeout(function () {
					deferred.abort();
				}, 10);
			});
		setTimeout(function () {
			deferred.abort();
		}, 10);
	});
	test('store binding', function () {
		can.Model('Storage');
		var s = new Storage({
			id: 1,
			thing: {
				foo: 'bar'
			}
		});
		ok(!Storage.store[1], 'not stored');
		var func = function () {};
		s.bind('foo', func);
		ok(Storage.store[1], 'stored');
		s.unbind('foo', func);
		ok(!Storage.store[1], 'not stored');
		var s2 = new Storage({});
		s2.bind('foo', func);
		s2.attr('id', 5);
		ok(Storage.store[5], 'stored');
		s2.unbind('foo', func);
		ok(!Storage.store[5], 'not stored');
	});
	test('store ajax binding', function () {
		var Guy = can.Model.extend({
			findAll: '/guys',
			findOne: '/guy/{id}'
		}, {});
		can.fixture('GET /guys', function () {
			return [{
				id: 1
			}];
		});
		can.fixture('GET /guy/{id}', function () {
			return {
				id: 1
			};
		});
		stop();
		can.when(Guy.findOne({
			id: 1
		}), Guy.findAll())
			.then(function (guyRes, guysRes2) {
				equal(guyRes.id, 1, 'got a guy id 1 back');
				equal(guysRes2[0].id, 1, 'got guys w/ id 1 back');
				ok(guyRes === guysRes2[0], 'guys are the same');
				// check the store is empty
				setTimeout(function () {
					var id;
					start();
					for (id in Guy.store) {
						ok(false, 'there should be nothing in the store');
					}
				}, 1);
			});
	});
	test('store instance updates', function () {
		var Guy, updateCount;
		Guy = can.Model.extend({
			findAll: 'GET /guys'
		}, {});
		updateCount = 0;
		can.fixture('GET /guys', function () {
			var guys = [{
				id: 1,
				updateCount: updateCount,
				nested: {
					count: updateCount
				}
			}];
			updateCount++;
			return guys;
		});
		stop();
		Guy.findAll({}, function (guys) {
			start();
			guys[0].bind('updated', function () {});
			ok(Guy.store[1], 'instance stored');
			equal(Guy.store[1].updateCount, 0, 'updateCount is 0');
			equal(Guy.store[1].nested.count, 0, 'nested.count is 0');
		});
		Guy.findAll({}, function (guys) {
			equal(Guy.store[1].updateCount, 1, 'updateCount is 1');
			equal(Guy.store[1].nested.count, 1, 'nested.count is 1');
		});
	});
	/** /
	 test("store instance update removed fields", function(){
	var Guy, updateCount, remove;

	Guy = can.Model.extend({
		findAll : 'GET /guys'
	},{});
	remove = false;

	can.fixture("GET /guys", function(){
		var guys = [{id: 1, name: 'mikey', age: 35, likes: ['soccer', 'fantasy baseball', 'js', 'zelda'], dislikes: ['backbone', 'errors']}];
		if(remove) {
			delete guys[0].name;
			guys[0].likes = [];
			delete guys[0].dislikes;
		}
		remove = true;
		return guys;
	});
	stop();
	Guy.findAll({}, function(guys){
		start();
		guys[0].bind('updated', function(){});
		ok(Guy.store[1], 'instance stored');
		equal(Guy.store[1].name, 'mikey', 'name is mikey')
		equal(Guy.store[1].likes.length, 4, 'mikey has 4 likes')
		equal(Guy.store[1].dislikes.length, 2, 'mikey has 2 dislikes')
	})
	Guy.findAll({}, function(guys){
		equal(Guy.store[1].name, undefined, 'name is undefined')
		equal(Guy.store[1].likes.length, 0, 'no likes')
		equal(Guy.store[1].dislikes, undefined, 'dislikes removed')
	})

})
	 /**/
	test('templated destroy', function () {
		var MyModel = can.Model.extend({
			destroy: '/destroyplace/{id}'
		}, {});
		can.fixture('/destroyplace/{id}', function (original) {
			ok(true, 'fixture called');
			equal(original.url, '/destroyplace/5', 'urls match');
			return {};
		});
		stop();
		new MyModel({
			id: 5
		})
			.destroy(function () {
				start();
			});
		can.fixture('/product/{id}', function (original) {
			equal(original.data.id, 9001, 'Changed ID is correctly set.');
			start();
			return {};
		});
		Base = can.Model.extend({
			id: '_id'
		}, {});
		Product = Base({
			destroy: 'DELETE /product/{id}'
		}, {});
		new Product({
			_id: 9001
		})
			.destroy();
		stop();
	});
	test('extended templated destroy', function () {
		var MyModel = can.Model({
			destroy: '/destroyplace/{attr1}/{attr2}/{id}'
		}, {});
		can.fixture('/destroyplace/{attr1}/{attr2}/{id}', function (original) {
			ok(true, 'fixture called');
			equal(original.url, '/destroyplace/foo/bar/5', 'urls match');
			return {};
		});
		stop();
		new MyModel({
			id: 5,
			attr1: 'foo',
			attr2: 'bar'
		})
			.destroy(function () {
				start();
			});
		can.fixture('/product/{attr3}/{id}', function (original) {
			equal(original.data.id, 9001, 'Changed ID is correctly set.');
			start();
			return {};
		});
		Base = can.Model({
			id: '_id'
		}, {});
		Product = Base({
			destroy: 'DELETE /product/{attr3}/{id}'
		}, {});
		new Product({
			_id: 9001,
			attr3: 'great'
		})
			.destroy();
		stop();
	});
	test('overwrite makeFindAll', function () {
		var store = {};
		var LocalModel = can.Model.extend({
			makeFindOne: function (findOne) {
				return function (params, success, error) {
					var def = new can.Deferred(),
						data = store[params.id];
					def.then(success, error);
					// make the ajax request right away
					var findOneDeferred = findOne(params);
					if (data) {
						var instance = this.model(data);
						findOneDeferred.then(function (data) {
							instance.updated(data);
						}, function () {
							can.trigger(instance, 'error', data);
						});
						def.resolve(instance);
					} else {
						findOneDeferred.then(can.proxy(function (data) {
							var instance = this.model(data);
							store[instance[this.id]] = data;
							def.resolve(instance);
						}, this), function (data) {
							def.reject(data);
						});
					}
					return def;
				};
			}
		}, {
			updated: function (attrs) {
				can.Model.prototype.updated.apply(this, arguments);
				store[this[this.constructor.id]] = this.serialize();
			}
		});
		can.fixture('/food/{id}', function (settings) {
			return count === 0 ? {
				id: settings.data.id,
				name: 'hot dog'
			} : {
				id: settings.data.id,
				name: 'ice water'
			};
		});
		var Food = LocalModel({
			findOne: '/food/{id}'
		}, {});
		stop();
		var count = 0;
		Food.findOne({
			id: 1
		}, function (food) {
			count = 1;
			ok(true, 'empty findOne called back');
			food.bind('name', function () {
				ok(true, 'name changed');
				equal(count, 2, 'after last find one');
				equal(this.name, 'ice water');
				start();
			});
			Food.findOne({
				id: 1
			}, function (food2) {
				count = 2;
				ok(food2 === food, 'same instances');
				equal(food2.name, 'hot dog');
			});
		});
	});
	test('inheriting unique model names', function () {
		var Foo = can.Model.extend({});
		var Bar = can.Model.extend({});
		ok(Foo.fullName !== Bar.fullName, 'fullNames not the same');
	});
	test('model list attr', function () {
		can.Model('Person', {}, {});
		var list1 = new Person.List(),
			list2 = new Person.List([
				new Person({
					id: 1
				}),
				new Person({
					id: 2
				})
			]);
		equal(list1.length, 0, 'Initial empty list has length of 0');
		list1.attr(list2);
		equal(list1.length, 2, 'Merging using attr yields length of 2');
	});
	test('destroying a model impact the right list', function () {
		can.Model('Person', {
			destroy: function (id, success) {
				var def = isDojo ? new dojo.Deferred() : new can.Deferred();
				def.resolve({});
				return def;
			}
		}, {});
		can.Model('Organisation', {
			destroy: function (id, success) {
				var def = isDojo ? new dojo.Deferred() : new can.Deferred();
				def.resolve({});
				return def;
			}
		}, {});
		var people = new Person.List([
			new Person({
				id: 1
			}),
			new Person({
				id: 2
			})
		]),
			orgs = new Organisation.List([
				new Organisation({
					id: 1
				}),
				new Organisation({
					id: 2
				})
			]);
		// you must be bound to the list to get this
		people.bind('length', function () {});
		orgs.bind('length', function () {});
		// set each person to have an organization
		people[0].attr('organisation', orgs[0]);
		people[1].attr('organisation', orgs[1]);
		equal(people.length, 2, 'Initial Person.List has length of 2');
		equal(orgs.length, 2, 'Initial Organisation.List has length of 2');
		orgs[0].destroy();
		equal(people.length, 2, 'After destroying orgs[0] Person.List has length of 2');
		equal(orgs.length, 1, 'After destroying orgs[0] Organisation.List has length of 1');
	});
	test('uses attr with isNew', function () {
		// TODO this does not seem to be consistent expect(2);
		var old = can.__observe;
		can.__observe = function (object, attribute) {
			if (attribute === 'id') {
				ok(true, 'used attr');
			}
		};
		var m = new can.Model({
			id: 4
		});
		m.isNew();
		can.__observe = old;
	});
	test('extends defaults by calling base method', function () {
		var M1 = can.Model.extend({
			defaults: {
				foo: 'bar'
			}
		}, {});
		var M2 = M1({});
		equal(M2.defaults.foo, 'bar');
	});
	test('.models updates existing list if passed', 4, function () {
		var Model = can.Model.extend({});
		var list = Model.models([{
			id: 1,
			name: 'first'
		}, {
			id: 2,
			name: 'second'
		}]);
		list.bind('add', function (ev, newData) {
			equal(newData.length, 3, 'Got all new items at once');
		});
		var newList = Model.models([{
			id: 3,
			name: 'third'
		}, {
			id: 4,
			name: 'fourth'
		}, {
			id: 5,
			name: 'fifth'
		}], list);
		equal(list, newList, 'Lists are the same');
		equal(newList.attr('length'), 3, 'List has new items');
		equal(list[0].name, 'third', 'New item is the first one');
	});
	test('calling destroy with unsaved model triggers destroyed event (#181)', function () {
		var MyModel = can.Model.extend({}, {}),
			newModel = new MyModel(),
			list = new MyModel.List(),
			deferred;
		// you must bind to a list for this feature
		list.bind('length', function () {});
		list.push(newModel);
		equal(list.attr('length'), 1, 'List length as expected');
		deferred = newModel.destroy();
		ok(deferred, '.destroy returned a Deferred');
		equal(list.attr('length'), 0, 'Unsaved model removed from list');
		deferred.done(function (data) {
			ok(data === newModel, 'Resolved with destroyed model as described in docs');
		});
	});
	test('model removeAttr (#245)', function () {
		var MyModel = can.Model.extend({}),
			model;
		can.Model._reqs++;
		// pretend it is live bound
		model = MyModel.model({
			id: 0,
			index: 2,
			name: 'test'
		});
		model = MyModel.model({
			id: 0,
			name: 'text updated'
		});
		equal(model.attr('name'), 'text updated', 'attribute updated');
		equal(model.attr('index'), 2, 'Index attribute still remains');
		MyModel = can.Model.extend({
			removeAttr: true
		}, {});
		can.Model._reqs++;
		// pretend it is live bound
		model = MyModel.model({
			id: 0,
			index: 2,
			name: 'test'
		});
		model = MyModel.model({
			id: 0,
			name: 'text updated'
		});
		equal(model.attr('name'), 'text updated', 'attribute updated');
		deepEqual(model.attr(), {
			id: 0,
			name: 'text updated'
		}, 'Index attribute got removed');
	});
	test('.model on create and update (#301)', function () {
		var MyModel = can.Model.extend({
			create: 'POST /todo',
			update: 'PUT /todo',
			model: function (data) {
				return can.Model.model.call(this, data.item);
			}
		}, {}),
			id = 0,
			updateTime;
		can.fixture('POST /todo', function (original, respondWith, settings) {
			id++;
			return {
				item: can.extend(original.data, {
					id: id
				})
			};
		});
		can.fixture('PUT /todo', function (original, respondWith, settings) {
			updateTime = new Date()
				.getTime();
			return {
				item: {
					updatedAt: updateTime
				}
			};
		});
		stop();
		MyModel.bind('created', function (ev, created) {
			start();
			deepEqual(created.attr(), {
				id: 1,
				name: 'Dishes'
			}, '.model works for create');
		})
			.bind('updated', function (ev, updated) {
				start();
				deepEqual(updated.attr(), {
					id: 1,
					name: 'Laundry',
					updatedAt: updateTime
				}, '.model works for update');
			});
		var instance = new MyModel({
			name: 'Dishes'
		}),
			saveD = instance.save();
		stop();
		saveD.then(function () {
			instance.attr('name', 'Laundry')
				.save();
		});
	});
	test('List params uses findAll', function () {
		stop();
		can.fixture('/things', function (request) {
			equal(request.data.param, 'value', 'params passed');
			return [{
				id: 1,
				name: 'Thing One'
			}];
		});
		var Model = can.Model.extend({
			findAll: '/things'
		}, {});
		var items = new Model.List({
			param: 'value'
		});
		items.bind('add', function (ev, items, index) {
			equal(items[0].name, 'Thing One', 'items added');
			start();
		});
	});
	test('destroy not calling callback for new instances (#403)', function () {
		var Recipe = can.Model.extend({}, {});
		expect(1);
		stop();
		new Recipe({
			name: 'mow grass'
		})
			.destroy(function (recipe) {
				ok(true, 'Destroy called');
				start();
			});
	});
	test('.model should always serialize Observes (#444)', function () {
		var ConceptualDuck = can.Model.extend({
			defaults: {
				sayeth: 'Abstractly \'quack\''
			}
		}, {});
		var ObserveableDuck = can.Map({}, {});
		equal('quack', ConceptualDuck.model(new ObserveableDuck({
				sayeth: 'quack'
			}))
			.sayeth);
	});
	test('string configurable model and models functions (#128)', function () {
		var StrangeProp = can.Model.extend({
			model: 'foo',
			models: 'bar'
		}, {});
		var strangers = StrangeProp.models({
			bar: [{
				foo: {
					id: 1,
					name: 'one'
				}
			}, {
				foo: {
					id: 2,
					name: 'two'
				}
			}]
		});
		deepEqual(strangers.attr(), [{
			id: 1,
			name: 'one'
		}, {
			id: 2,
			name: 'two'
		}]);
	});
	test('create deferred does not resolve to the same instance', function () {
		var Todo = can.Model.extend({
			create: function () {
				var def = new can.Deferred();
				def.resolve({
					id: 5
				});
				return def;
			}
		}, {});
		var handler = function () {};
		var t = new Todo({
			name: 'Justin'
		});
		t.bind('name', handler);
		var def = t.save();
		stop();
		def.then(function (todo) {
			ok(todo === t, 'same instance');
			start();
			ok(Todo.store[5] === t, 'instance put in store');
			t.unbind('name', handler);
		});
	});
})(undefined, undefined, __m30, undefined);

// ## view/view_test.js
var __m39 = (function () {
	var Scanner = can.view.Scanner;
	module('can/view', {
		setup: function () {
			this.scannerAttributes = Scanner.attributes;
			this.scannerRegExpAttributes = Scanner.regExpAttributes;
			this.scannerTags = Scanner.tags;
			Scanner.attributes = {};
			Scanner.regExpAttributes = {};
			Scanner.tags = can.extend({}, Scanner.tags);
		},
		teardown: function () {
			Scanner.attributes = this.scannerAttributes;
			Scanner.regExpAttributes = this.scannerRegExpAttributes;
			Scanner.tags = this.scannerTags;
		}
	});
	test('helpers work', function () {
		var expected = '<h3>helloworld</h3><div>foo</div>';
		can.each([
			'ejs',
			'mustache'
		], function (ext) {
			var actual = can.view.render(can.test.path('view/test/helpers.' + ext), {
				'message': 'helloworld'
			}, {
				helper: function () {
					return 'foo';
				}
			});
			equal(can.trim(actual), expected, 'Text rendered');
		});
	});
	test('buildFragment works right', function () {
		can.append(can.$('#qunit-test-area'), can.view(can.test.path('view/test//plugin.ejs'), {}));
		ok(/something/.test(can.$('#something span')[0].firstChild.nodeValue), 'something has something');
		can.remove(can.$('#something'));
	});
	test('async templates, and caching work', function () {
		stop();
		var i = 0;
		can.view.render(can.test.path('view/test//temp.ejs'), {
			'message': 'helloworld'
		}, function (text) {
			ok(/helloworld\s*/.test(text), 'we got a rendered template');
			i++;
			equal(i, 2, 'Ajax is not synchronous');
			start();
		});
		i++;
		equal(i, 1, 'Ajax is not synchronous');
	});
	test('caching works', function () {
		// this basically does a large ajax request and makes sure
		// that the second time is always faster
		stop();
		var first;
		can.view.render(can.test.path('view/test//large.ejs'), {
			'message': 'helloworld'
		}, function (text) {
			first = new Date();
			ok(text, 'we got a rendered template');
			can.view.render(can.test.path('view/test//large.ejs'), {
				'message': 'helloworld'
			}, function (text) {
				/*
				 var lap2 = new Date() - first,
				 lap1 = first - startT;
				 ok( lap1 > lap2, "faster this time "+(lap1 - lap2) )
				 */
				start();
			});
		});
	});
	test('hookup', function () {
		can.view(can.test.path('view/test//hookup.ejs'), {});
		equal(window.hookedUp, 'dummy', 'Hookup ran and got element');
	});
	test('inline templates other than \'tmpl\' like ejs', function () {
		var script = document.createElement('script');
		script.setAttribute('type', 'test/ejs');
		script.setAttribute('id', 'test_ejs');
		script.text = '<span id="new_name"><%= name %></span>';
		document.getElementById('qunit-test-area')
			.appendChild(script);
		var div = document.createElement('div');
		div.appendChild(can.view('test_ejs', {
			name: 'Henry'
		}));
		equal(div.getElementsByTagName('span')[0].firstChild.nodeValue, 'Henry');
	});
	//canjs issue #31
	test('render inline templates with a #', function () {
		var script = document.createElement('script');
		script.setAttribute('type', 'test/ejs');
		script.setAttribute('id', 'test_ejs');
		script.text = '<span id="new_name"><%= name %></span>';
		document.getElementById('qunit-test-area')
			.appendChild(script);
		var div = document.createElement('div');
		div.appendChild(can.view('#test_ejs', {
			name: 'Henry'
		}));
		//make sure we aren't returning the current document as the template
		equal(div.getElementsByTagName('script')
			.length, 0, 'Current document was not used as template');
		if (div.getElementsByTagName('span')
			.length === 1) {
			equal(div.getElementsByTagName('span')[0].firstChild.nodeValue, 'Henry');
		}
	});
	test('object of deferreds', function () {
		var foo = new can.Deferred(),
			bar = new can.Deferred();
		stop();
		can.view.render(can.test.path('view/test//deferreds.ejs'), {
			foo: typeof foo.promise === 'function' ? foo.promise() : foo,
			bar: bar
		})
			.then(function (result) {
				equal(result, 'FOO and BAR');
				start();
			});
		setTimeout(function () {
			foo.resolve('FOO');
		}, 100);
		bar.resolve('BAR');
	});
	test('deferred', function () {
		var foo = new can.Deferred();
		stop();
		can.view.render(can.test.path('view/test//deferred.ejs'), foo)
			.then(function (result) {
				equal(result, 'FOO');
				start();
			});
		setTimeout(function () {
			foo.resolve({
				foo: 'FOO'
			});
		}, 100);
	});
	test('hyphen in type', function () {
		var script = document.createElement('script');
		script.setAttribute('type', 'text/x-ejs');
		script.setAttribute('id', 'hyphenEjs');
		script.text = '\nHyphen\n';
		document.getElementById('qunit-test-area')
			.appendChild(script);
		var div = document.createElement('div');
		div.appendChild(can.view('hyphenEjs', {}));
		ok(/Hyphen/.test(div.innerHTML), 'has hyphen');
	});
	test('create template with string', function () {
		can.view.ejs('fool', 'everybody plays the <%= who %> <%= howOften %>');
		var div = document.createElement('div');
		div.appendChild(can.view('fool', {
			who: 'fool',
			howOften: 'sometimes'
		}));
		ok(/fool sometimes/.test(div.innerHTML), 'has fool sometimes' + div.innerHTML);
	});
	test('return renderer', function () {
		var directResult = can.view.ejs('renderer_test', 'This is a <%= test %>');
		var renderer = can.view('renderer_test');
		ok(can.isFunction(directResult), 'Renderer returned directly');
		ok(can.isFunction(renderer), 'Renderer is a function');
		equal(renderer.render({
			test: 'working test'
		}), 'This is a working test', 'Rendered');
		renderer = can.view(can.test.path('view/test//template.ejs'));
		ok(can.isFunction(renderer), 'Renderer is a function');
		equal(renderer.render({
			message: 'Rendered!'
		}), '<h3>Rendered!</h3>', 'Synchronous template loaded and rendered'); // TODO doesn't get caught in Zepto for whatever reason
		// raises(function() {
		//      can.view('jkflsd.ejs');
		// }, 'Nonexistent template throws error');
	});
	test('nameless renderers (#162, #195)', 8, function () {
		// EJS
		var nameless = can.view.ejs('<h2><%= message %></h2>'),
			data = {
				message: 'HI!'
			}, result = nameless(data),
			node = result.childNodes[0];
		ok('ownerDocument' in result, 'Result is a document fragment');
		equal(node.tagName.toLowerCase(), 'h2', 'Got h2 rendered');
		equal(node.innerHTML, data.message, 'Got EJS result rendered');
		equal(nameless.render(data), '<h2>HI!</h2>', '.render EJS works and returns HTML');
		// Mustache
		nameless = can.view.mustache('<h3>{{message}}</h3>');
		data = {
			message: 'MUSTACHE!'
		};
		result = nameless(data);
		node = result.childNodes[0];
		ok('ownerDocument' in result, 'Result is a document fragment');
		equal(node.tagName.toLowerCase(), 'h3', 'Got h3 rendered');
		equal(node.innerHTML, data.message, 'Got Mustache result rendered');
		equal(nameless.render(data), '<h3>MUSTACHE!</h3>', '.render Mustache works and returns HTML');
	});
	test('deferred resolves with data (#183, #209)', function () {
		var foo = new can.Deferred();
		var bar = new can.Deferred();
		var original = {
			foo: foo,
			bar: bar
		};
		stop();
		ok(can.isPromise(original.foo), 'Original foo property is a Deferred');
		can.view(can.test.path('view/test//deferred.ejs'), original)
			.then(function (result, data) {
				ok(data, 'Data exists');
				equal(data.foo, 'FOO', 'Foo is resolved');
				equal(data.bar, 'BAR', 'Bar is resolved');
				ok(can.isPromise(original.foo), 'Original property did not get modified');
				start();
			});
		setTimeout(function () {
			foo.resolve('FOO');
		}, 100);
		setTimeout(function () {
			bar.resolve('BAR');
		}, 50);
	});
	test('Empty model displays __!!__ as input values (#196)', function () {
		can.view.ejs('test196', 'User id: <%= user.attr(\'id\') || \'-\' %>' + ' User name: <%= user.attr(\'name\') || \'-\' %>');
		var frag = can.view('test196', {
			user: new can.Map()
		});
		var div = document.createElement('div');
		div.appendChild(frag);
		equal(div.innerHTML, 'User id: - User name: -', 'Got expected HTML content');
		can.view('test196', {
			user: new can.Map()
		}, function (frag) {
			div = document.createElement('div');
			div.appendChild(frag);
			equal(div.innerHTML, 'User id: - User name: -', 'Got expected HTML content in callback as well');
		});
	});
	test('Select live bound options don\'t contain __!!__', function () {
		var domainList = new can.List([{
			id: 1,
			name: 'example.com'
		}, {
			id: 2,
			name: 'google.com'
		}, {
			id: 3,
			name: 'yahoo.com'
		}, {
			id: 4,
			name: 'microsoft.com'
		}]),
			frag = can.view(can.test.path('view/test/select.ejs'), {
				domainList: domainList
			}),
			div = document.createElement('div');
		div.appendChild(frag);
		can.append(can.$('#qunit-test-area'), div);
		equal(div.outerHTML.match(/__!!__/g), null, 'No __!!__ contained in HTML content');
		// can.view.nodeLists.unregister(domainList);
		// equal(can.$('#test-dropdown')[0].outerHTML, can.$('#test-dropdown2')[0].outerHTML, 'Live bound select and non-live bound select the same');
	});
	test('Live binding on number inputs', function () {
		var template = can.view.ejs('<input id="candy" type="number" value="<%== state.attr("number") %>" />');
		var observe = new can.Map({
			number: 2
		});
		var frag = template({
			state: observe
		});
		can.append(can.$('#qunit-test-area'), frag);
		var input = document.getElementById('candy');
		equal(input.getAttribute('value'), 2, 'render workered');
		observe.attr('number', 5);
		equal(input.getAttribute('value'), 5, 'update workered');
	});
	test('Resetting a live-bound <textarea> changes its value to __!!__ (#223)', function () {
		var template = can.view.ejs('<form><textarea><%= this.attr(\'test\') %></textarea></form>'),
			frag = template(new can.Map({
				test: 'testing'
			})),
			form, textarea;
		can.append(can.$('#qunit-test-area'), frag);
		form = document.getElementById('qunit-test-area')
			.getElementsByTagName('form')[0];
		textarea = form.children[0];
		equal(textarea.value, 'testing', 'Textarea value set');
		textarea.value = 'blabla';
		equal(textarea.value, 'blabla', 'Textarea value updated');
		form.reset();
		equal(form.children[0].value, 'testing', 'Textarea value set back to original live-bound value');
	});
	test('Deferred fails (#276)', function () {
		var foo = new can.Deferred();
		stop();
		can.view.render(can.test.path('view/test/deferred.ejs'), foo)
			.fail(function (error) {
				equal(error.message, 'Deferred error');
				start();
			});
		setTimeout(function () {
			foo.reject({
				message: 'Deferred error'
			});
		}, 100);
	});
	test('Object of deferreds fails (#276)', function () {
		var foo = new can.Deferred(),
			bar = new can.Deferred();
		stop();
		can.view.render(can.test.path('view/test//deferreds.ejs'), {
			foo: typeof foo.promise === 'function' ? foo.promise() : foo,
			bar: bar
		})
			.fail(function (error) {
				equal(error.message, 'foo error');
				start();
			});
		setTimeout(function () {
			foo.reject({
				message: 'foo error'
			});
		}, 100);
		bar.resolve('Bar done');
	});
	test('Using \'=\' in attribute does not truncate the value', function () {
		var template = can.view.ejs('<img id=\'equalTest\' <%= this.attr(\'class\') %> src="<%= this.attr(\'src\') %>">'),
			obs = new can.Map({
				'class': 'class="someClass"',
				'src': 'http://canjs.us/scripts/static/img/canjs_logo_yellow_small.png'
			}),
			frag = template(obs),
			img;
		can.append(can.$('#qunit-test-area'), frag);
		img = document.getElementById('equalTest');
		obs.attr('class', 'class="do=not=truncate=me"');
		obs.attr('src', 'http://canjs.us/scripts/static/img/canjs_logo_yellow_small.png?wid=100&wid=200');
		equal(img.className, 'do=not=truncate=me', 'class is right');
		equal(img.src, 'http://canjs.us/scripts/static/img/canjs_logo_yellow_small.png?wid=100&wid=200', 'attribute is right');
	});
	/*test('basic scanner custom tags', function () {
		can.view.Scanner.tag('panel', function (el, options) {
			ok(options.options.attr('helpers.myhelper')(), 'got a helper');
			equal(options.scope.attr('foo'), 'bar', 'got scope and can read from it');
			equal(options.subtemplate(options.scope.add({
				message: 'hi'
			}), options.options), '<p>sub says hi</p>');
		});
		var template = can.view.mustache('<panel title=\'foo\'><p>sub says {{message}}</p></panel>');
		template({
			foo: 'bar'
		}, {
			myhelper: function () {
				return true;
			}
		});
	});*/
	/*test('custom tags without subtemplate', function () {
		can.view.Scanner.tag('empty-tag', function (el, options) {
			ok(!options.subtemplate, 'There is no subtemplate');
		});
		var template = can.view.mustache('<empty-tag title=\'foo\'></empty-tag>');
		template({
			foo: 'bar'
		});
	});*/
	/*test('sub hookup', function () {
		var tabs = document.createElement('tabs');
		document.body.appendChild(tabs);
		var panel = document.createElement('panel');
		document.body.appendChild(panel);
		can.view.Scanner.tag('tabs', function (el, hookupOptions) {
			var frag = can.view.frag(hookupOptions.subtemplate(hookupOptions.scope, hookupOptions.options));
			var div = document.createElement('div');
			div.appendChild(frag);
			var panels = div.getElementsByTagName('panel');
			equal(panels.length, 1, 'there is one panel');
			equal(panels[0].nodeName.toUpperCase(), 'PANEL');
			equal(panels[0].getAttribute('title'), 'Fruits', 'attribute left correctly');
			equal(panels[0].innerHTML, 'oranges, apples', 'innerHTML');
		});
		can.view.Scanner.tag('panel', function (el, hookupOptions) {
			ok(hookupOptions.scope, 'got scope');
			return hookupOptions.scope;
		});
		var template = can.view.mustache('<tabs>' + '{{#each foodTypes}}' + '<panel title=\'{{title}}\'>{{content}}</panel>' + '{{/each}}' + '</tabs>');
		var foodTypes = new can.List([{
			title: 'Fruits',
			content: 'oranges, apples'
		}]);
		template({
			foodTypes: foodTypes
		});
	});*/
	/*test('sub hookup passes helpers', function () {
		can.view.Scanner.tag('tabs', function (el, hookupOptions) {
			var optionsScope = hookupOptions.options.add({
				tabsHelper: function () {
					return 'TabsHelper';
				}
			});
			var frag = can.view.frag(hookupOptions.subtemplate(hookupOptions.scope, optionsScope));
			var div = document.createElement('div');
			div.appendChild(frag);
			var panels = div.getElementsByTagName('panel');
			equal(panels.length, 1, 'there is one panel');
			equal(panels[0].nodeName.toUpperCase(), 'PANEL');
			equal(panels[0].getAttribute('title'), 'Fruits', 'attribute left correctly');
			equal(panels[0].innerHTML, 'TabsHelperoranges, apples', 'innerHTML');
		});
		can.view.Scanner.tag('panel', function (el, hookupOptions) {
			ok(hookupOptions.scope, 'got scope');
			return hookupOptions.scope;
		});
		var template = can.view.mustache('<tabs>' + '{{#each foodTypes}}' + '<panel title=\'{{title}}\'>{{tabsHelper}}{{content}}</panel>' + '{{/each}}' + '</tabs>');
		var foodTypes = new can.List([{
			title: 'Fruits',
			content: 'oranges, apples'
		}]);
		template({
			foodTypes: foodTypes
		});
	});*/
	/*test('attribute matching', function () {
		var item = 0;
		can.view.Scanner.attribute('on-click', function (data, el) {
			ok(true, 'attribute called');
			equal(data.attr, 'on-click', 'attr is on click');
			equal(el.nodeName.toLowerCase(), 'p', 'got a paragraph');
			var cur = data.scope.attr('.');
			equal(foodTypes[item], cur, 'can get the current scope');
			var attr = el.getAttribute('on-click');
			equal(data.scope.attr(attr), doSomething, 'can call a parent\'s function');
			item++;
		});
		var template = can.view.mustache('<div>' + '{{#each foodTypes}}' + '<p on-click=\'doSomething\'>{{content}}</p>' + '{{/each}}' + '</div>');
		var foodTypes = new can.List([{
			title: 'Fruits',
			content: 'oranges, apples'
		}, {
			title: 'Breads',
			content: 'pasta, cereal'
		}, {
			title: 'Sweets',
			content: 'ice cream, candy'
		}]);
		var doSomething = function () {};
		template({
			foodTypes: foodTypes,
			doSomething: doSomething
		});
	});*/
	/*test('regex attribute matching', function () {
		var item = 0;
		can.view.Scanner.attribute(/on-[\w\.]+/, function (data, el) {
			ok(true, 'attribute called');
			equal(data.attr, 'on-click', 'attr is on click');
			equal(el.nodeName.toLowerCase(), 'p', 'got a paragraph');
			var cur = data.scope.attr('.');
			equal(foodTypes[item], cur, 'can get the current scope');
			var attr = el.getAttribute('on-click');
			equal(data.scope.attr(attr), doSomething, 'can call a parent\'s function');
			item++;
		});
		var template = can.view.mustache('<div>' + '{{#each foodTypes}}' + '<p on-click=\'doSomething\'>{{content}}</p>' + '{{/each}}' + '</div>');
		var foodTypes = new can.List([{
			title: 'Fruits',
			content: 'oranges, apples'
		}, {
			title: 'Breads',
			content: 'pasta, cereal'
		}, {
			title: 'Sweets',
			content: 'ice cream, candy'
		}]);
		var doSomething = function () {};
		template({
			foodTypes: foodTypes,
			doSomething: doSomething
		});
	});*/
	/*test('content element', function () {
		var template = can.view.mustache('{{#foo}}<content></content>{{/foo}}');
		var context = new can.Map({
			foo: 'bar'
		});
		var frag = template(context, {
			_tags: {
				content: function (el, options) {
					equal(el.nodeName.toLowerCase(), 'content', 'got an element');
					equal(options.scope.attr('.'), 'bar', 'got the context of content');
					el.innerHTML = 'updated';
				}
			}
		});
		equal(frag.childNodes[0].nodeName.toLowerCase(), 'content');
		equal(frag.childNodes[0].innerHTML, 'updated', 'content is updated');
		context.removeAttr('foo');
		equal(frag.childNodes[0].nodeType, 3, 'only a text element remains');
		context.attr('foo', 'bar');
		equal(frag.childNodes[0].nodeName.toLowerCase(), 'content');
		equal(frag.childNodes[0].innerHTML, 'updated', 'content is updated');
	});*/
	/*test('content element inside tbody', function () {
		var template = can.view.mustache('<table><tbody><content></content></tbody></table>');
		var context = new can.Map({
			foo: 'bar'
		});
		template(context, {
			_tags: {
				content: function (el, options) {
					equal(el.parentNode.nodeName.toLowerCase(), 'tbody', 'got an element in a tbody');
					equal(options.scope.attr('.'), context, 'got the context of content');
				}
			}
		});
	});*/
	test('extensionless views, enforcing engine (#193)', 1, function () {
		var path = can.test.path('view/test/extensionless');
		// Because we don't have an extension and if we are using Steal we will get
		// view/test/extensionless/extensionless.js which we need to fix in this case
		if (path.indexOf('.js', this.length - 3) !== -1) {
			path = path.substring(0, path.lastIndexOf('/'));
		}
		var frag = can.view({
			url: path,
			engine: 'mustache'
		}, {
			message: 'Hi test'
		});
		var div = document.createElement('div');
		div.appendChild(frag);
		equal(div.getElementsByTagName('h3')[0].innerHTML, 'Hi test', 'Got expected test from extensionless template');
	});
	test('can.view[engine] always returns fragment renderers (#485)', 2, function () {
		var template = '<h1>{{message}}</h1>';
		var withId = can.view.mustache('test-485', template);
		var withoutId = can.view.mustache(template);
		ok(withoutId({
				message: 'Without id'
			})
			.nodeType === 11, 'View without id returned document fragment');
		ok(withId({
				message: 'With id'
			})
			.nodeType === 11, 'View with id returned document fragment');
	});
	/*test('create a template before the custom element works with slash and colon', function () {
		// all custom elements must be registered for IE to work
		if (window.html5) {
			window.html5.elements += ' ignore-this';
			window.html5.shivDocument();
		}
		can.view.mustache('theid', '<unique-name></unique-name><can:something></can:something><ignore-this>content</ignore-this>');
		can.view.Scanner.tag('unique-name', function (el, hookupOptions) {
			ok(true, 'unique-name called!');
		});
		can.view.Scanner.tag('can:something', function (el, hookupOptions) {
			ok(true, 'can:something called!');
		});
		can.view('theid', {});
	});*/
	test('loaded live element test', function () {
		// all custom elements must be registered for IE to work
		if (window.html5) {
			window.html5.elements += ' my-el';
			window.html5.shivDocument();
		}
		var t = can.view.mustache('<div><my-el {{#if foo}}checked{{/if}} class=\'{{bar}}\' >inner</my-el></div>');
		t();
		ok(true);
	});
	test('content within non-component tags gets rendered with context', function () {
		// all custom elements must be registered for IE to work
		if (window.html5) {
			window.html5.elements += ' unique-element-name';
			window.html5.shivDocument();
		}
		var tmp = can.view.mustache('<div><unique-element-name>{{name}}</unique-element-name></div>');
		var frag = tmp({
			name: 'Josh M'
		});
		equal(frag.childNodes[0].childNodes[0].innerHTML, 'Josh M', 'correctly retrieved scope data');
	});
	test('empty non-component tags', function () {
		// all custom elements must be registered for IE to work
		if (window.html5) {
			window.html5.elements += ' unique-element-name';
			window.html5.shivDocument();
		}
		var tmp = can.view.mustache('<div><unique-element-name></unique-element-name></div>');
		tmp();
		ok(true, 'no error');
	});
	if (window.require) {
		if (window.require.config && window.require.toUrl) {
			test('template files relative to requirejs baseUrl (#647)', function () {
				var oldBaseUrl = window.requirejs.s.contexts._.config.baseUrl;
				window.require.config({
					baseUrl: oldBaseUrl + '/view/test/'
				});
				ok(can.isFunction(can.view('template')));
				window.require.config({
					baseUrl: oldBaseUrl
				});
			});
		}
	}
})(undefined, undefined, undefined, undefined, __m30, undefined);

// ## view/ejs/ejs_test.js
var __m41 = (function () {
	module('can/view/ejs, rendering', {
		setup: function () {
			can.view.ext = '.ejs';

			this.animals = [
				'sloth',
				'bear',
				'monkey'
			];
			if (!this.animals.each) {
				this.animals.each = function (func) {
					for (var i = 0; i < this.length; i++) {
						func(this[i]);
					}
				};
			}
			this.squareBrackets = '<ul><% this.animals.each(function(animal){%>' + '<li><%= animal %></li>' + '<%});%></ul>';
			this.squareBracketsNoThis = '<ul><% animals.each(function(animal){%>' + '<li><%= animal %></li>' + '<%});%></ul>';
			this.angleBracketsNoThis = '<ul><% animals.each(function(animal){%>' + '<li><%= animal %></li>' + '<%});%></ul>';
		}
	});
	var getAttr = function (el, attrName) {
		return attrName === 'class' ? el.className : el.getAttribute(attrName);
	};
	test('render with left bracket', function () {
		var compiled = new can.EJS({
			text: this.squareBrackets,
			type: '['
		})
			.render({
				animals: this.animals
			});
		equal(compiled, '<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>', 'renders with bracket');
	});
	test('render with with', function () {
		var compiled = new can.EJS({
			text: this.squareBracketsNoThis,
			type: '['
		})
			.render({
				animals: this.animals
			});
		equal(compiled, '<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>', 'renders bracket with no this');
	});
	test('default carrot', function () {
		var compiled = new can.EJS({
			text: this.angleBracketsNoThis
		})
			.render({
				animals: this.animals
			});
		equal(compiled, '<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>');
	});
	test('render with double angle', function () {
		var text = '<%% replace_me %>' + '<ul><% animals.each(function(animal){%>' + '<li><%= animal %></li>' + '<%});%></ul>';
		var compiled = new can.EJS({
			text: text
		})
			.render({
				animals: this.animals
			});
		equal(compiled, '<% replace_me %><ul><li>sloth</li><li>bear</li><li>monkey</li></ul>', 'works');
	});
	test('comments', function () {
		var text = '<%# replace_me %>' + '<ul><% animals.each(function(animal){%>' + '<li><%= animal %></li>' + '<%});%></ul>';
		var compiled = new can.EJS({
			text: text
		})
			.render({
				animals: this.animals
			});
		equal(compiled, '<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>');
	});
	test('multi line', function () {
		var text = 'a \n b \n c',
			result = new can.EJS({
				text: text
			})
				.render({});
		equal(result, text);
	});
	test('multi line elements', function () {
		var text = '<img\n class="<%=myClass%>" />',
			result = new can.EJS({
				text: text
			})
				.render({
					myClass: 'a'
				});
		ok(result.indexOf('<img\n class="a"') !== -1, 'Multi-line elements render correctly.');
	});
	test('escapedContent', function () {
		var text = '<span><%= tags %></span><label>&amp;</label><strong><%= number %></strong><input value=\'<%= quotes %>\'/>';
		var compiled = new can.EJS({
			text: text
		})
			.render({
				tags: 'foo < bar < car > zar > poo',
				quotes: 'I use \'quote\' fingers "a lot"',
				number: 123
			});
		var div = document.createElement('div');
		div.innerHTML = compiled;
		equal(div.getElementsByTagName('span')[0].firstChild.nodeValue, 'foo < bar < car > zar > poo');
		equal(div.getElementsByTagName('strong')[0].firstChild.nodeValue, 123);
		equal(div.getElementsByTagName('input')[0].value, 'I use \'quote\' fingers "a lot"');
		equal(div.getElementsByTagName('label')[0].innerHTML, '&amp;');
	});
	test('unescapedContent', function () {
		var text = '<span><%== tags %></span><div><%= tags %></div><input value=\'<%== quotes %>\'/>';
		var compiled = new can.EJS({
			text: text
		})
			.render({
				tags: '<strong>foo</strong><strong>bar</strong>',
				quotes: 'I use \'quote\' fingers "a lot"'
			});
		var div = document.createElement('div');
		div.innerHTML = compiled;
		equal(div.getElementsByTagName('span')[0].firstChild.nodeType, 1);
		equal(div.getElementsByTagName('div')[0].firstChild.nodeValue.toLowerCase(), '<strong>foo</strong><strong>bar</strong>');
		equal(div.getElementsByTagName('span')[0].innerHTML.toLowerCase(), '<strong>foo</strong><strong>bar</strong>');
		equal(div.getElementsByTagName('input')[0].value, 'I use \'quote\' fingers "a lot"', 'escapped no matter what');
	});
	test('returning blocks', function () {
		var somethingHelper = function (cb) {
			return cb([
				1,
				2,
				3,
				4
			]);
		};
		var res = can.view.render(can.test.path('view/ejs/test/test_template.ejs'), {
			something: somethingHelper,
			items: [
				'a',
				'b'
			]
		});
		// make sure expected values are in res
		ok(/\s4\s/.test(res), 'first block called');
		equal(res.match(/ItemsLength4/g)
			.length, 4, 'innerBlock and each');
	});
	test('easy hookup', function () {
		var div = document.createElement('div');
		div.appendChild(can.view(can.test.path('view/ejs/test/easyhookup.ejs'), {
			text: 'yes'
		}));
		ok(div.getElementsByTagName('div')[0].className.indexOf('yes') !== -1, 'has yes');
	});
	test('multiple function hookups in a tag', function () {
		var text = '<span <%= (el)-> can.data(can.$(el),\'foo\',\'bar\') %>' + ' <%= (el)-> can.data(can.$(el),\'baz\',\'qux\') %>>lorem ipsum</span>',
			compiled = new can.EJS({
				text: text
			})
				.render(),
			div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		var span = div.getElementsByTagName('span')[0];
		equal(can.data(can.$(span), 'foo'), 'bar', 'first hookup');
		equal(can.data(can.$(span), 'baz'), 'qux', 'second hookup');
	});
	test('helpers', function () {
		can.EJS.Helpers.prototype.simpleHelper = function () {
			return 'Simple';
		};
		can.EJS.Helpers.prototype.elementHelper = function () {
			return function (el) {
				el.innerHTML = 'Simple';
			};
		};
		var text = '<div><%= simpleHelper() %></div>';
		var compiled = new can.EJS({
			text: text
		})
			.render();
		equal(compiled, '<div>Simple</div>');
		text = '<div id="hookup" <%= elementHelper() %>></div>';
		compiled = new can.EJS({
			text: text
		})
			.render();
		can.append(can.$('#qunit-test-area'), can.view.frag(compiled));
		equal(can.$('#hookup')[0].innerHTML, 'Simple');
	});
	test('list helper', function () {
		var text = '<% list(todos, function(todo){ %><div><%= todo.name %></div><% }) %>';
		var todos = new can.List([{
			id: 1,
			name: 'Dishes'
		}]),
			compiled = new can.EJS({
				text: text
			})
				.render({
					todos: todos
				}),
			div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		equal(div.getElementsByTagName('div')
			.length, 1, '1 item in list');
		todos.push({
			id: 2,
			name: 'Laundry'
		});
		equal(div.getElementsByTagName('div')
			.length, 2, '2 items in list');
		todos.splice(0, 2);
		equal(div.getElementsByTagName('div')
			.length, 0, '0 items in list');
		todos.push({
			id: 4,
			name: 'Pick up sticks'
		});
		equal(div.getElementsByTagName('div')
			.length, 1, '1 item in list again');
	});
	test('attribute single unescaped, html single unescaped', function () {
		var text = '<div id=\'me\' class=\'<%== task.attr(\'completed\') ? \'complete\' : \'\'%>\'><%== task.attr(\'name\') %></div>';
		var task = new can.Map({
			name: 'dishes'
		});
		var compiled = new can.EJS({
			text: text
		})
			.render({
				task: task
			});
		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		equal(div.getElementsByTagName('div')[0].innerHTML, 'dishes', 'html correctly dishes');
		equal(div.getElementsByTagName('div')[0].className, '', 'class empty');
		task.attr('name', 'lawn');
		equal(div.getElementsByTagName('div')[0].innerHTML, 'lawn', 'html correctly lawn');
		equal(div.getElementsByTagName('div')[0].className, '', 'class empty');
		task.attr('completed', true);
		equal(div.getElementsByTagName('div')[0].className, 'complete', 'class changed to complete');
	});
	test('event binding / triggering on things other than options', 1, function () {
		var frag = can.buildFragment('<ul><li>a</li></ul>', [document]);
		var qta = document.getElementById('qunit-test-area');
		qta.innerHTML = '';
		qta.appendChild(frag);
		// destroyed events should not bubble
		can.bind.call(qta.getElementsByTagName('li')[0], 'foo', function (event) {
			ok(true, 'li called :)');
		});
		can.bind.call(qta.getElementsByTagName('ul')[0], 'foo', function (event) {
			ok(false, 'ul called :(');
		});
		can.trigger(qta.getElementsByTagName('li')[0], 'foo', {}, false);
		qta.removeChild(qta.firstChild);
	});
	test('select live binding', function () {
		var text = '<select><% todos.each(function(todo){ %><option><%= todo.name %></option><% }) %></select>',
			Todos = new can.List([{
				id: 1,
				name: 'Dishes'
			}]),
			compiled = new can.EJS({
				text: text
			})
				.render({
					todos: Todos
				}),
			div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		equal(div.getElementsByTagName('option')
			.length, 1, '1 item in list');
		Todos.push({
			id: 2,
			name: 'Laundry'
		});
		equal(div.getElementsByTagName('option')
			.length, 2, '2 items in list');
		Todos.splice(0, 2);
		equal(div.getElementsByTagName('option')
			.length, 0, '0 items in list');
	});
	test('block live binding', function () {
		var text = '<div><% if( obs.attr(\'sex\') == \'male\' ){ %>' + '<span>Mr.</span>' + '<% } else { %>' + '<label>Ms.</label>' + '<% } %>' + '</div>';
		var obs = new can.Map({
			sex: 'male'
		});
		var compiled = new can.EJS({
			text: text
		})
			.render({
				obs: obs
			});
		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		// We have to test using nodeName and innerHTML (and not outerHTML) because IE 8 and under treats
		// user-defined properties on nodes as attributes.
		equal(div.getElementsByTagName('div')[0].firstChild.nodeName.toUpperCase(), 'SPAN', 'initial span tag');
		equal(div.getElementsByTagName('div')[0].firstChild.innerHTML, 'Mr.', 'initial span content');
		obs.attr('sex', 'female');
		equal(div.getElementsByTagName('div')[0].firstChild.nodeName.toUpperCase(), 'LABEL', 'updated label tag');
		equal(div.getElementsByTagName('div')[0].firstChild.innerHTML, 'Ms.', 'updated label content');
	});
	test('hookups in tables', function () {
		var text = '<table><tbody><% if( obs.attr(\'sex\') == \'male\' ){ %>' + '<tr><td>Mr.</td></tr>' + '<% } else { %>' + '<tr><td>Ms.</td></tr>' + '<% } %>' + '</tbody></table>';
		var obs = new can.Map({
			sex: 'male'
		});
		var compiled = new can.EJS({
			text: text
		})
			.render({
				obs: obs
			});
		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		// We have to test using nodeName and innerHTML (and not outerHTML) because IE 8 and under treats
		// user-defined properties on nodes as attributes.
		equal(div.getElementsByTagName('tbody')[0].firstChild.firstChild.nodeName, 'TD', 'initial tag');
		equal(div.getElementsByTagName('tbody')[0].firstChild.firstChild.innerHTML.replace(/(\r|\n)+/g, ''), 'Mr.', 'initial content');
		obs.attr('sex', 'female');
		equal(div.getElementsByTagName('tbody')[0].firstChild.firstChild.nodeName, 'TD', 'updated tag');
		equal(div.getElementsByTagName('tbody')[0].firstChild.firstChild.innerHTML.replace(/(\r|\n)+/g, ''), 'Ms.', 'updated content');
	});
	//Issue 233
	test('multiple tbodies in table hookup', function () {
		var text = '<table>' + '<% can.each(people, function(person){ %>' + '<tbody><tr><td><%= person.name %></td></tr></tbody>' + '<% }) %>' + '</table>',
			people = new can.List([{
				name: 'Steve'
			}, {
				name: 'Doug'
			}]),
			compiled = new can.EJS({
				text: text
			})
				.render({
					people: people
				}),
			div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		equal(div.getElementsByTagName('tbody')
			.length, 2, 'two tbodies');
	});
	test('multiple hookups in a single attribute', function () {
		var text = '<div class=\'<%= obs.attr("foo") %>a<%= obs.attr("bar") %>b<%= obs.attr("baz") %>\'></div>',
			obs = new can.Map({
				foo: '1',
				bar: '2',
				baz: '3'
			}),
			compiled = new can.EJS({
				text: text
			})
				.render({
					obs: obs
				});
		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		var innerDiv = div.childNodes[0];
		equal(getAttr(innerDiv, 'class'), '1a2b3', 'initial render');
		obs.attr('bar', '4');
		equal(getAttr(innerDiv, 'class'), '1a4b3', 'initial render');
		obs.attr('bar', '5');
		equal(getAttr(innerDiv, 'class'), '1a5b3', 'initial render');
	});
	test('adding and removing multiple html content within a single element', function () {
		var text = '<div><%== obs.attr("a") %><%== obs.attr("b") %><%== obs.attr("c") %></div>',
			obs = new can.Map({
				a: 'a',
				b: 'b',
				c: 'c'
			}),
			compiled = new can.EJS({
				text: text
			})
				.render({
					obs: obs
				});
		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		equal(div.firstChild.nodeName.toUpperCase(), 'DIV', 'initial render node name');
		equal(div.firstChild.innerHTML, 'abc', 'initial render text');
		obs.attr({
			a: '',
			b: '',
			c: ''
		});
		equal(div.firstChild.nodeName.toUpperCase(), 'DIV', 'updated render node name');
		equal(div.firstChild.innerHTML, '', 'updated render text');
		obs.attr({
			c: 'c'
		});
		equal(div.firstChild.nodeName.toUpperCase(), 'DIV', 'updated render node name');
		equal(div.firstChild.innerHTML, 'c', 'updated render text');
	});
	test('live binding and removeAttr', function () {
		var text = '<% if(obs.attr("show")) { %>' + '<p <%== obs.attr("attributes") %> class="<%= obs.attr("className")%>"><span><%= obs.attr("message") %></span></p>' + '<% } %>',
			obs = new can.Map({
				show: true,
				className: 'myMessage',
				attributes: 'some="myText"',
				message: 'Live long and prosper'
			}),
			compiled = new can.EJS({
				text: text
			})
				.render({
					obs: obs
				}),
			div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		var p = div.getElementsByTagName('p')[0],
			span = p.getElementsByTagName('span')[0];
		equal(p.getAttribute('some'), 'myText', 'initial render attr');
		equal(getAttr(p, 'class'), 'myMessage', 'initial render class');
		equal(span.innerHTML, 'Live long and prosper', 'initial render innerHTML');
		obs.removeAttr('className');
		equal(getAttr(p, 'class'), '', 'class is undefined');
		obs.attr('className', 'newClass');
		equal(getAttr(p, 'class'), 'newClass', 'class updated');
		obs.removeAttr('attributes');
		equal(p.getAttribute('some'), null, 'attribute is undefined');
		obs.attr('attributes', 'some="newText"');
		equal(p.getAttribute('some'), 'newText', 'attribute updated');
		obs.removeAttr('message');
		equal(span.innerHTML, '', 'text node value is undefined');
		obs.attr('message', 'Warp drive, Mr. Sulu');
		equal(span.innerHTML, 'Warp drive, Mr. Sulu', 'text node updated');
		obs.removeAttr('show');
		equal(div.innerHTML, '', 'value in block statement is undefined');
		obs.attr('show', true);
		p = div.getElementsByTagName('p')[0];
		span = p.getElementsByTagName('span')[0];
		equal(p.getAttribute('some'), 'newText', 'value in block statement updated attr');
		equal(getAttr(p, 'class'), 'newClass', 'value in block statement updated class');
		equal(span.innerHTML, 'Warp drive, Mr. Sulu', 'value in block statement updated innerHTML');
	});
	test('hookup within a tag', function () {
		var text = '<div <%== obs.attr("foo") %> ' + '<%== obs.attr("baz") %>>lorem ipsum</div>',
			obs = new can.Map({
				foo: 'class="a"',
				baz: 'some=\'property\''
			}),
			compiled = new can.EJS({
				text: text
			})
				.render({
					obs: obs
				});
		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		var anchor = div.getElementsByTagName('div')[0];
		equal(getAttr(anchor, 'class'), 'a');
		equal(anchor.getAttribute('some'), 'property');
		obs.attr('foo', 'class="b"');
		equal(getAttr(anchor, 'class'), 'b');
		equal(anchor.getAttribute('some'), 'property');
		obs.attr('baz', 'some=\'new property\'');
		equal(getAttr(anchor, 'class'), 'b');
		equal(anchor.getAttribute('some'), 'new property');
		obs.attr('foo', 'class=""');
		obs.attr('baz', '');
		equal(getAttr(anchor, 'class'), '', 'anchor class blank');
		equal(anchor.getAttribute('some'), undefined, 'attribute "some" is undefined');
	});
	test('single escaped tag, removeAttr', function () {
		var text = '<div <%= obs.attr("foo") %>>lorem ipsum</div>',
			obs = new can.Map({
				foo: 'data-bar="john doe\'s bar"'
			}),
			compiled = new can.EJS({
				text: text
			})
				.render({
					obs: obs
				});
		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		var anchor = div.getElementsByTagName('div')[0];
		equal(anchor.getAttribute('data-bar'), 'john doe\'s bar');
		obs.removeAttr('foo');
		equal(anchor.getAttribute('data-bar'), null);
		obs.attr('foo', 'data-bar="baz"');
		equal(anchor.getAttribute('data-bar'), 'baz');
	});
	test('html comments', function () {
		var text = '<!-- bind to changes in the todo list --> <div><%= obs.attr("foo") %></div>',
			obs = new can.Map({
				foo: 'foo'
			}),
			compiled = new can.EJS({
				text: text
			})
				.render({
					obs: obs
				});
		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		equal(div.getElementsByTagName('div')[0].innerHTML, 'foo', 'Element as expected');
	});
	test('hookup and live binding', function () {
		var text = '<div class=\'<%= task.attr(\'completed\') ? \'complete\' : \'\' %>\' <%= (el)-> can.data(can.$(el),\'task\',task) %>>' + '<%== task.attr(\'name\') %>' + '</div>',
			task = new can.Map({
				completed: false,
				className: 'someTask',
				name: 'My Name'
			}),
			compiled = new can.EJS({
				text: text
			})
				.render({
					task: task
				}),
			div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		var child = div.getElementsByTagName('div')[0];
		ok(child.className.indexOf('complete') === -1, 'is incomplete');
		ok( !! can.data(can.$(child), 'task'), 'has data');
		equal(child.innerHTML, 'My Name', 'has name');
		task.attr({
			completed: true,
			name: 'New Name'
		});
		ok(child.className.indexOf('complete') !== -1, 'is complete');
		equal(child.innerHTML, 'New Name', 'has new name');
	});
	/*
	 test('multiple curly braces in a block', function() {
	 var text =  '<% if(!obs.attr("items").length) { %>' +
	 '<li>No items</li>' +
	 '<% } else { each(obs.items, function(item) { %>' +
	 '<li><%= item.attr("name") %></li>' +
	 '<% }) }%>',

	 obs = new can.Map({
	 items: []
	 }),

	 compiled = new can.EJS({ text: text }).render({ obs: obs });

	 var ul = document.createElement('ul');
	 ul.appendChild(can.view.frag(compiled));

	 equal(ul.innerHTML, '<li>No items</li>', 'initial observable state');

	 obs.attr('items', [{ name: 'foo' }]);
	 equal(u.innerHTML, '<li>foo</li>', 'updated observable');
	 });
	 */
	test('unescape bindings change', function () {
		var l = new can.List([{
			complete: true
		}, {
			complete: false
		}, {
			complete: true
		}]);
		var completed = function () {
			l.attr('length');
			var num = 0;
			l.each(function (item) {
				if (item.attr('complete')) {
					num++;
				}
			});
			return num;
		};
		var text = '<div><%== completed() %></div>',
			compiled = new can.EJS({
				text: text
			})
				.render({
					completed: completed
				});
		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		var child = div.getElementsByTagName('div')[0];
		equal(child.innerHTML, '2', 'at first there are 2 true bindings');
		var item = new can.Map({
			complete: true,
			id: 'THIS ONE'
		});
		l.push(item);
		equal(child.innerHTML, '3', 'now there are 3 complete');
		item.attr('complete', false);
		equal(child.innerHTML, '2', 'now there are 2 complete');
		l.pop();
		item.attr('complete', true);
		equal(child.innerHTML, '2', 'there are still 2 complete');
	});
	test('escape bindings change', function () {
		var l = new can.List([{
			complete: true
		}, {
			complete: false
		}, {
			complete: true
		}]);
		var completed = function () {
			l.attr('length');
			var num = 0;
			l.each(function (item) {
				if (item.attr('complete')) {
					num++;
				}
			});
			return num;
		};
		var text = '<div><%= completed() %></div>',
			compiled = new can.EJS({
				text: text
			})
				.render({
					completed: completed
				});
		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		var child = div.getElementsByTagName('div')[0];
		equal(child.innerHTML, '2', 'at first there are 2 true bindings');
		var item = new can.Map({
			complete: true
		});
		l.push(item);
		equal(child.innerHTML, '3', 'now there are 3 complete');
		item.attr('complete', false);
		equal(child.innerHTML, '2', 'now there are 2 complete');
	});
	test('tag bindings change', function () {
		var l = new can.List([{
			complete: true
		}, {
			complete: false
		}, {
			complete: true
		}]);
		var completed = function () {
			l.attr('length');
			var num = 0;
			l.each(function (item) {
				if (item.attr('complete')) {
					num++;
				}
			});
			return 'items=\'' + num + '\'';
		};
		var text = '<div <%= completed() %>></div>',
			compiled = new can.EJS({
				text: text
			})
				.render({
					completed: completed
				});
		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		var child = div.getElementsByTagName('div')[0];
		equal(child.getAttribute('items'), '2', 'at first there are 2 true bindings');
		var item = new can.Map({
			complete: true
		});
		l.push(item);
		equal(child.getAttribute('items'), '3', 'now there are 3 complete');
		item.attr('complete', false);
		equal(child.getAttribute('items'), '2', 'now there are 2 complete');
	});
	test('attribute value bindings change', function () {
		var l = new can.List([{
			complete: true
		}, {
			complete: false
		}, {
			complete: true
		}]);
		var completed = function () {
			l.attr('length');
			var num = 0;
			l.each(function (item) {
				if (item.attr('complete')) {
					num++;
				}
			});
			return num;
		};
		var text = '<div items="<%= completed() %>"></div>',
			compiled = new can.EJS({
				text: text
			})
				.render({
					completed: completed
				});
		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		var child = div.getElementsByTagName('div')[0];
		equal(child.getAttribute('items'), '2', 'at first there are 2 true bindings');
		var item = new can.Map({
			complete: true
		});
		l.push(item);
		equal(child.getAttribute('items'), '3', 'now there are 3 complete');
		item.attr('complete', false);
		equal(child.getAttribute('items'), '2', 'now there are 2 complete');
	});
	test('in tag toggling', function () {
		var text = '<div <%== obs.attr(\'val\') %>></div>';
		var obs = new can.Map({
			val: 'foo="bar"'
		});
		var compiled = new can.EJS({
			text: text
		})
			.render({
				obs: obs
			});
		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		obs.attr('val', 'bar=\'foo\'');
		obs.attr('val', 'foo="bar"');
		var d2 = div.getElementsByTagName('div')[0];
		// toUpperCase added to normalize cases for IE8
		equal(d2.getAttribute('foo'), 'bar', 'bar set');
		equal(d2.getAttribute('bar'), null, 'bar set');
	});
	test('parent is right with bock', function () {
		var text = '<ul><% if(!obs.attr("items").length) { %>' + '<li>No items</li>' + '<% } else { %> <%== obs.attr("content") %>' + '<% } %></ul>',
			obs = new can.Map({
				content: '<li>Hello</li>',
				items: [{
					name: 'Justin'
				}]
			}),
			compiled = new can.EJS({
				text: text
			})
				.render({
					obs: obs
				});
		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		var ul = div.getElementsByTagName('ul')[0];
		var li = div.getElementsByTagName('li')[0];
		ok(ul, 'we have a ul');
		ok(li, 'we have a li');
	});
	test('property name only attributes', function () {
		var text = '<input type=\'checkbox\' <%== obs.attr(\'val\') ? \'checked\' : \'\' %>/>';
		var obs = new can.Map({
			val: true
		});
		var compiled = new can.EJS({
			text: text
		})
			.render({
				obs: obs
			});
		var div = document.getElementById('qunit-test-area');
		div.appendChild(can.view.frag(compiled));
		var input = div.getElementsByTagName('input')[0];
		can.trigger(input, 'click');
		obs.attr('val', false);
		ok(!input.checked, 'not checked');
		obs.attr('val', true);
		ok(input.checked, 'checked');
		div.removeChild(input);
	});
	test('nested properties', function () {
		var text = '<div><%= obs.attr(\'name.first\')%></div>';
		var obs = new can.Map({
			name: {
				first: 'Justin'
			}
		});
		var compiled = new can.EJS({
			text: text
		})
			.render({
				obs: obs
			});
		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		div = div.getElementsByTagName('div')[0];
		equal(div.innerHTML, 'Justin');
		obs.attr('name.first', 'Brian');
		equal(div.innerHTML, 'Brian');
	});
	test('tags without chidren or ending with /> do not change the state', function () {
		var text = '<table><tr><td></td><%== obs.attr(\'content\') %></tr></div>';
		var obs = new can.Map({
			content: '<td>Justin</td>'
		});
		var compiled = new can.EJS({
			text: text
		})
			.render({
				obs: obs
			});
		var div = document.createElement('div');
		var html = can.view.frag(compiled);
		div.appendChild(html);
		equal(div.getElementsByTagName('span')
			.length, 0, 'there are no spans');
		equal(div.getElementsByTagName('td')
			.length, 2, 'there are 2 td');
	});
	test('nested live bindings', function () {
		expect(0);
		var items = new can.List([{
			title: 0,
			is_done: false,
			id: 0
		}]);
		var div = document.createElement('div');
		div.appendChild(can.view(can.test.path('view/ejs/test/nested_live_bindings.ejs'), {
			items: items
		}));
		items.push({
			title: 1,
			is_done: false,
			id: 1
		});
		// this will throw an error unless EJS protects against
		// nested objects
		items[0].attr('is_done', true);
	});
	// Similar to the nested live bindings test, this makes sure templates with control blocks
	// will eventually remove themselves if at least one change happens
	// before things are removed.
	// It is currently commented out because
	//
	/*test("memory safe without parentElement of blocks", function(){

	 })*/
	test('trailing text', function () {
		can.view.ejs('count', 'There are <%= this.attr(\'length\') %> todos');
		var div = document.createElement('div');
		div.appendChild(can.view('count', new can.List([{}, {}])));
		ok(/There are 2 todos/.test(div.innerHTML), 'got all text');
	});
	test('recursive views', function () {
		var data = new can.List([{
			label: 'branch1',
			children: [{
				id: 2,
				label: 'branch2'
			}]
		}]);
		var div = document.createElement('div');
		div.appendChild(can.view(can.test.path('view/ejs/test/recursive.ejs'), {
			items: data
		}));
		ok(/class="leaf"|class=leaf/.test(div.innerHTML), 'we have a leaf');
	});
	test('indirectly recursive views', function () {
		var unordered = new can.List([{
			ol: [{
				ul: [{
					ol: [
						1,
						2,
						3
					]
				}]
			}]
		}]);
		can.view.cache = false;
		var div = document.createElement('div');
		div.appendChild(can.view(can.test.path('view/ejs/test/indirect1.ejs'), {
			unordered: unordered
		}));
		document.getElementById('qunit-test-area')
			.appendChild(div);
		var el = can.$('#qunit-test-area ul > li > ol > li > ul > li > ol > li')[0];
		ok( !! el && can.trim(el.innerHTML) === '1', 'Uncached indirectly recursive EJS working.');
		can.view.cache = true;
		div.appendChild(can.view(can.test.path('view/ejs/test/indirect1.ejs'), {
			unordered: unordered
		}));
		el = can.$('#qunit-test-area ul + ul > li > ol > li > ul > li > ol > li')[0];
		ok( !! el && can.trim(el.innerHTML) === '1', 'Cached indirectly recursive EJS working.');
		document.getElementById('qunit-test-area')
			.removeChild(div);
	});
	test('recursive views of previously stolen files shouldn\'t fail', function () {
		// Using preload to bypass steal dependency (necessary for "grunt test")
		can.view.preloadStringRenderer('view_ejs_test_indirect1_ejs', can.EJS({
			text: '<ul>' + '<% unordered.each(function(item) { %>' + '<li>' + '<% if(item.ol) { %>' + '<%== can.view.render(can.test.path(\'view/ejs/test/indirect2.ejs\'), { ordered: item.ol }) %>' + '<% } else { %>' + '<%= item.toString() %>' + '<% } %>' + '</li>' + '<% }) %>' + '</ul>'
		}));
		can.view.preloadStringRenderer('view_ejs_test_indirect2_ejs', can.EJS({
			text: '<ol>' + '<% ordered.each(function(item) { %>' + '<li>' + '<% if(item.ul) { %>' + '<%== can.view.render(can.test.path(\'view/ejs/test/indirect1.ejs\'), { unordered: item.ul }) %>' + '<% } else { %>' + '<%= item.toString() %>' + '<% } %>' + '</li>' + '<% }) %>' + '</ol>'
		}));
		var unordered = new can.Map.List([{
			ol: [{
				ul: [{
					ol: [
						1,
						2,
						3
					]
				}]
			}]
		}]);
		can.view.cache = false;
		var div = document.createElement('div');
		div.appendChild(can.view(can.test.path('view/ejs/test/indirect1.ejs'), {
			unordered: unordered
		}));
		document.getElementById('qunit-test-area')
			.appendChild(div);
		var el = can.$('#qunit-test-area ul > li > ol > li > ul > li > ol > li')[0];
		ok( !! el && can.trim(el.innerHTML) === '1', 'Uncached indirectly recursive EJS working.');
		can.view.cache = true;
		div.appendChild(can.view(can.test.path('view/ejs/test/indirect1.ejs'), {
			unordered: unordered
		}));
		el = can.$('#qunit-test-area ul + ul > li > ol > li > ul > li > ol > li')[0];
		ok( !! el && can.trim(el.innerHTML) === '1', 'Cached indirectly recursive EJS working.');
		document.getElementById('qunit-test-area')
			.removeChild(div);
	});
	test('live binding select', function () {
		var text = '<select><% items.each(function(ob) { %>' + '<option value=\'<%= ob.attr(\'id\') %>\'><%= ob.attr(\'title\') %></option>' + '<% }); %></select>',
			items = new can.List([{
				title: 'Make bugs',
				is_done: true,
				id: 0
			}, {
				title: 'Find bugs',
				is_done: false,
				id: 1
			}, {
				title: 'Fix bugs',
				is_done: false,
				id: 2
			}]),
			compiled = new can.EJS({
				text: text
			})
				.render({
					items: items
				}),
			div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		equal(div.getElementsByTagName('option')
			.length, 3, '3 items in list');
		var option = div.getElementsByTagName('option')[0];
		equal(option.value, '' + items[0].id, 'value attr set');
		equal(option.textContent || option.text, items[0].title, 'content of option');
		items.push({
			id: 3,
			name: 'Go to pub'
		});
		equal(div.getElementsByTagName('option')
			.length, 4, '4 items in list');
	});
	test('live binding textarea', function () {
		can.view.ejs('textarea-test', '<textarea>Before<%= obs.attr(\'middle\') %>After</textarea>');
		var obs = new can.Map({
			middle: 'yes'
		}),
			div = document.createElement('div');
		var node = can.view('textarea-test', {
			obs: obs
		});
		div.appendChild(node);
		var textarea = div.firstChild;
		equal(textarea.value, 'BeforeyesAfter');
		obs.attr('middle', 'Middle');
		equal(textarea.value, 'BeforeMiddleAfter');
	});
	test('reset on a live bound input', function () {
		var text = '<input type=\'text\' value=\'<%= person.attr(\'name\') %>\'><button type=\'reset\'>Reset</button>',
			person = new can.Map({
				name: 'Bob'
			}),
			compiled = new can.EJS({
				text: text
			})
				.render({
					person: person
				}),
			form = document.createElement('form'),
			input;
		form.appendChild(can.view.frag(compiled));
		input = form.getElementsByTagName('input')[0];
		form.reset();
		equal(input.value, 'Bob', 'value is correct');
	});
	test('A non-escaping live magic tag within a control structure and no leaks', function () {
		var nodeLists = can.view.nodeLists;
		for (var prop in nodeLists.nodeMap) {
			delete nodeLists.nodeMap[prop];
		}
		var text = '<div><% items.each(function(ob) { %>' + '<%== ob.attr(\'html\') %>' + '<% }); %></div>',
			items = new can.List([{
				html: '<label>Hello World</label>'
			}]),
			compiled = new can.EJS({
				text: text
			})
				.render({
					items: items
				}),
			div = can.$('#qunit-test-area')[0];
		div.innerHTML = '';
		can.append(can.$('#qunit-test-area'), can.view.frag(compiled));
		ok(div.getElementsByTagName('label')[0], 'label exists');
		items[0].attr('html', '<p>hi</p>');
		equal(div.getElementsByTagName('label')
			.length, 0, 'label is removed');
		equal(div.getElementsByTagName('p')
			.length, 1, 'label is replaced by p');
		items.push({
			html: '<p>hola</p>'
		});
		equal(div.getElementsByTagName('p')
			.length, 2, 'label has 2 paragraphs');
		can.remove(can.$(div.firstChild));
		deepEqual(nodeLists.nodeMap, {});
	});
	test('attribute unquoting', function () {
		var text = '<input type="radio" ' + '<%== facet.single ? \'name="facet-\' + facet.attr("id") + \'"\' : "" %> ' + 'value="<%= facet.single ? "facet-" + facet.attr("id") : "" %>" />',
			facet = new can.Map({
				id: 1,
				single: true
			}),
			compiled = new can.EJS({
				text: text
			})
				.render({
					facet: facet
				}),
			div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		equal(div.children[0].name, 'facet-1');
		equal(div.children[0].value, 'facet-1');
	});
	test('empty element hooks work correctly', function () {
		var text = '<div <%= function(e){ e.innerHTML = "1 Will show"; } %>></div>' + '<div <%= function(e){ e.innerHTML = "2 Will not show"; } %>></div>' + '3 Will not show';
		var compiled = new can.EJS({
			text: text
		})
			.render(),
			div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		equal(div.childNodes.length, 3, 'all three elements present');
	});
	test('live binding with parent dependent tags but without parent tag present in template', function () {
		var text = [
			'<tbody>',
			'<% if( person.attr("first") ){ %>',
			'<tr><td><%= person.first %></td></tr>',
			'<% }%>',
			'<% if( person.attr("last") ){ %>',
			'<tr><td><%= person.last %></td></tr>',
			'<% } %>',
			'</tbody>'
		];
		var person = new can.Map({
			first: 'Austin',
			last: 'McDaniel'
		});
		var compiled = new can.EJS({
			text: text.join('\n')
		})
			.render({
				person: person
			});
		var table = document.createElement('table');
		table.appendChild(can.view.frag(compiled));
		equal(table.getElementsByTagName('tr')[0].firstChild.nodeName.toUpperCase(), 'TD');
		equal(table.getElementsByTagName('tr')[0].firstChild.innerHTML, 'Austin');
		equal(table.getElementsByTagName('tr')[1].firstChild.nodeName.toUpperCase(), 'TD');
		equal(table.getElementsByTagName('tr')[1].firstChild.innerHTML, 'McDaniel');
		person.removeAttr('first');
		equal(table.getElementsByTagName('tr')[0].firstChild.nodeName.toUpperCase(), 'TD');
		equal(table.getElementsByTagName('tr')[0].firstChild.innerHTML, 'McDaniel');
		person.removeAttr('last');
		equal(table.getElementsByTagName('tr')
			.length, 0);
		person.attr('first', 'Justin');
		equal(table.getElementsByTagName('tr')[0].firstChild.nodeName.toUpperCase(), 'TD');
		equal(table.getElementsByTagName('tr')[0].firstChild.innerHTML, 'Justin');
	});
	test('spaces between attribute name and value', function () {
		var text = '<input type="text" value = "<%= test %>" />',
			compiled = new can.EJS({
				text: text
			})
				.render({
					test: 'testing'
				}),
			div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		var input = div.getElementsByTagName('input')[0];
		equal(input.value, 'testing');
		equal(input.type, 'text');
	});
	test('live binding with computes', function () {
		var text = '<span><%= compute() %></span>',
			compute = can.compute(5),
			compiled = new can.EJS({
				text: text
			})
				.render({
					compute: compute
				}),
			div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		var span = div.getElementsByTagName('span');
		equal(span.length, 1);
		span = span[0];
		equal(span.innerHTML, '5');
		compute(6);
		equal(span.innerHTML, '6');
		compute('Justin');
		equal(span.innerHTML, 'Justin');
		compute(true);
		equal(span.innerHTML, 'true');
	});
	test('testing for clean tables', function () {
		var games = new can.List();
		games.push({
			name: 'The Legend of Zelda',
			rating: 10
		});
		games.push({
			name: 'The Adventures of Link',
			rating: 9
		});
		games.push({
			name: 'Dragon Warrior',
			rating: 9
		});
		games.push({
			name: 'A Dude Named Daffl',
			rating: 8.5
		});
		var res = can.view.render(can.test.path('view/ejs/test/table_test.ejs'), {
			games: games
		}),
			div = document.createElement('div');
		div.appendChild(can.view.frag(res));
		ok(!/@@!!@@/.test(div.innerHTML), 'no placeholders');
	});
	test('inserting live-binding partials assume the correct parent tag', function () {
		can.view.ejs('rowView', '<% can.each(columns, function(col) { %>' + '<th><%= col.attr("name") %></th>' + '<% }) %>');
		can.view.ejs('tableView', '<table><tbody><tr>' + '<%== can.view.render("rowView", this) %>' + '</tr></tbody></table>');
		var data = {
			columns: new can.List([{
				name: 'Test 1'
			}, {
				name: 'Test 2'
			}])
		};
		var div = document.createElement('div');
		var dom = can.view('tableView', data);
		div.appendChild(dom);
		var ths = div.getElementsByTagName('th');
		equal(ths.length, 2, 'Got two table headings');
		equal(ths[0].innerHTML, 'Test 1', 'First column heading correct');
		equal(ths[1].innerHTML, 'Test 2', 'Second column heading correct');
		equal(can.view.render('tableView', data)
			.indexOf('<table><tbody><tr><td data-view-id='), 0, 'Rendered output starts' + 'as expected');
	});
	// http://forum.javascriptmvc.com/topic/live-binding-on-mustache-template-does-not-seem-to-be-working-with-nested-properties
	test('Observe with array attributes', function () {
		can.view.ejs('observe-array', '<ul><% can.each(todos, function(todo, i) { %><li><%= todos.attr(""+i) %></li><% }) %></ul><div><%= this.attr("message") %></div>');
		var div = document.createElement('div');
		var data = new can.Map({
			todos: [
				'Line #1',
				'Line #2',
				'Line #3'
			],
			message: 'Hello',
			count: 2
		});
		div.appendChild(can.view('observe-array', data));
		equal(div.getElementsByTagName('li')[1].innerHTML, 'Line #2', 'Check initial array');
		equal(div.getElementsByTagName('div')[0].innerHTML, 'Hello', 'Check initial message');
		data.attr('todos.1', 'Line #2 changed');
		data.attr('message', 'Hello again');
		equal(div.getElementsByTagName('li')[1].innerHTML, 'Line #2 changed', 'Check updated array');
		equal(div.getElementsByTagName('div')[0].innerHTML, 'Hello again', 'Check updated message');
	});
	test('hookup this correctly', function () {
		var obj = {
			from: 'cows'
		};
		var html = '<span <%== (el) -> can.data(can.$(el), \'foo\', this.from) %>>tea</span>';
		var compiled = new can.EJS({
			text: html
		})
			.render(obj);
		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		var span = div.getElementsByTagName('span')[0];
		equal(can.data(can.$(span), 'foo'), obj.from, 'object matches');
	});
	//Issue 271
	test('live binding with html comment', function () {
		var text = '<table><tr><th>Todo</th></tr><!-- do not bother with me -->' + '<% todos.each(function(todo){ %><tr><td><%= todo.name %></td></tr><% }) %></table>',
			Todos = new can.List([{
				id: 1,
				name: 'Dishes'
			}]),
			compiled = new can.EJS({
				text: text
			})
				.render({
					todos: Todos
				}),
			div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		equal(div.getElementsByTagName('table')[0].getElementsByTagName('td')
			.length, 1, '1 item in list');
		Todos.push({
			id: 2,
			name: 'Laundry'
		});
		equal(div.getElementsByTagName('table')[0].getElementsByTagName('td')
			.length, 2, '2 items in list');
		Todos.splice(0, 2);
		equal(div.getElementsByTagName('table')[0].getElementsByTagName('td')
			.length, 0, '0 items in list');
	});
	test('HTML comment with element callback', function () {
		var text = [
			'<ul>',
			'<% todos.each(function(todo) { %>',
			'<li<%= (el) -> can.data(can.$(el),\'todo\',todo) %>>',
			'<!-- html comment #1 -->',
			'<%= todo.name %>',
			'<!-- html comment #2 -->',
			'</li>',
			'<% }) %>',
			'</ul>'
		],
			Todos = new can.List([{
				id: 1,
				name: 'Dishes'
			}]),
			compiled = new can.EJS({
				text: text.join('\n')
			})
				.render({
					todos: Todos
				}),
			div = document.createElement('div'),
			li, comments;
		comments = function (el) {
			var count = 0;
			for (var i = 0; i < el.childNodes.length; i++) {
				if (el.childNodes[i].nodeType === 8) {
					++count;
				}
			}
			return count;
		};
		div.appendChild(can.view.frag(compiled));
		li = div.getElementsByTagName('ul')[0].getElementsByTagName('li');
		equal(li.length, 1, '1 item in list');
		equal(comments(li[0]), 2, '2 comments in item #1');
		Todos.push({
			id: 2,
			name: 'Laundry'
		});
		equal(li.length, 2, '2 items in list');
		equal(comments(li[0]), 2, '2 comments in item #1');
		equal(comments(li[1]), 2, '2 comments in item #2');
		Todos.splice(0, 2);
		equal(li.length, 0, '0 items in list');
	});
	// https://github.com/canjs/canjs/issues/153
	test('Interpolated values when iterating through an Observe.List should still render when not surrounded by a DOM node', function () {
		can.view.ejs('issue-153-no-dom', '<% can.each(todos, function(todo) { %><span><%= todo.attr("name") %></span><% }) %>');
		can.view.ejs('issue-153-dom', '<% can.each(todos, function(todo) { %><%= todo.attr("name") %><% }) %>');
		var todos = [
			new can.Map({
				id: 1,
				name: 'Dishes'
			}),
			new can.Map({
				id: 2,
				name: 'Forks'
			})
		],
			data = {
				todos: new can.List(todos)
			}, arr = {
				todos: todos
			}, div = document.createElement('div');
		div.appendChild(can.view('issue-153-no-dom', arr));
		equal(div.getElementsByTagName('span')[0].innerHTML, 'Dishes', 'Array item rendered with DOM container');
		equal(div.getElementsByTagName('span')[1].innerHTML, 'Forks', 'Array item rendered with DOM container');
		div.innerHTML = '';
		div.appendChild(can.view('issue-153-no-dom', data));
		equal(div.getElementsByTagName('span')[0].innerHTML, 'Dishes', 'List item rendered with DOM container');
		equal(div.getElementsByTagName('span')[1].innerHTML, 'Forks', 'List item rendered with DOM container');
		div.innerHTML = '';
		div.appendChild(can.view('issue-153-dom', arr));
		equal(div.innerHTML, 'DishesForks', 'Array item rendered without DOM container');
		div.innerHTML = '';
		div.appendChild(can.view('issue-153-dom', data));
		equal(div.innerHTML, 'DishesForks', 'List item rendered without DOM container');
		data.todos.push(new can.Map({
			id: 3,
			name: 'Knives'
		}));
		equal(div.innerHTML, 'DishesForksKnives', 'New list item rendered without DOM container');
	});
	test('correctness of data-view-id and only in tag opening', function () {
		var text = [
			'<textarea><select><% can.each(this.items, function(item) { %>',
			'<option<%= (el) -> el.data(\'item\', item) %>><%= item.title %></option>',
			'<% }) %></select></textarea>'
		],
			items = [{
				id: 1,
				title: 'One'
			}, {
				id: 2,
				title: 'Two'
			}],
			compiled = new can.EJS({
				text: text.join('')
			})
				.render({
					items: items
				}),
			expected = '^<textarea data-view-id=\'[0-9]+\'><select><option data-view-id=\'[0-9]+\'>One</option>' + '<option data-view-id=\'[0-9]+\'>Two</option></select></textarea>$';
		ok(compiled.search(expected) === 0, 'Rendered output is as expected');
	});
	test('return blocks within element tags', function () {
		var animals = new can.List([
			'sloth',
			'bear'
		]),
			template = '<ul>' + '<%==lister(animals, function(animal){%>' + '<li><%=animal %></li>' + '<%})%>' + '</ul>';
		var renderer = can.view.ejs(template);
		var div = document.createElement('div');
		var frag = renderer({
			lister: function (items, callback) {
				return function (el) {
					equal(el.nodeName.toLowerCase(), 'li', 'got the LI it created');
				};
			},
			animals: animals
		});
		div.appendChild(frag);
	});
	test('Each does not redraw items', function () {
		var animals = new can.List([
			'sloth',
			'bear'
		]),
			template = '<div>my<b>favorite</b>animals:' + '<%==each(animals, function(animal){%>' + '<label>Animal=</label> <span><%=animal %></span>' + '<%})%>' + '!</div>';
		var renderer = can.view.ejs(template);
		var div = document.createElement('div');
		var frag = renderer({
			animals: animals
		});
		div.appendChild(frag);
		div.getElementsByTagName('label')[0].myexpando = 'EXPANDO-ED';
		equal(div.getElementsByTagName('label')
			.length, 2, 'There are 2 labels');
		animals.push('turtle');
		equal(div.getElementsByTagName('label')[0].myexpando, 'EXPANDO-ED', 'same expando');
		equal(div.getElementsByTagName('span')[2].innerHTML, 'turtle', 'turtle added');
	});
	test('Each works with no elements', function () {
		var animals = new can.List([
			'sloth',
			'bear'
		]),
			template = '<%==each(animals, function(animal){%>' + '<%=animal %> ' + '<%})%>';
		var renderer = can.view.ejs(template);
		var div = document.createElement('div');
		var frag = renderer({
			animals: animals
		});
		div.appendChild(frag);
		animals.push('turtle');
		equal(div.innerHTML, 'sloth bear turtle ', 'turtle added');
	});
	test('Each does not redraw items (normal array)', function () {
		var animals = [
			'sloth',
			'bear',
			'turtle'
		],
			template = '<div>my<b>favorite</b>animals:' + '<%each(animals, function(animal){%>' + '<label>Animal=</label> <span><%=animal %></span>' + '<%})%>' + '!</div>';
		var renderer = can.view.ejs(template);
		var div = document.createElement('div');
		var frag = renderer({
			animals: animals
		});
		div.appendChild(frag);
		div.getElementsByTagName('label')[0].myexpando = 'EXPANDO-ED';
		//animals.push("dog")
		equal(div.getElementsByTagName('label')
			.length, 3, 'There are 2 labels');
		equal(div.getElementsByTagName('label')[0].myexpando, 'EXPANDO-ED', 'same expando');
		equal(div.getElementsByTagName('label')[0].myexpando, 'EXPANDO-ED', 'same expando');
		equal(div.getElementsByTagName('span')[2].innerHTML, 'turtle', 'turtle added');
	});
	test('list works within another branch', function () {
		var animals = new can.List([]),
			template = '<div>Animals:' + '<% if( animals.attr(\'length\') ){ %>~' + '<% animals.each(function(animal){%>' + '<span><%=animal %></span>' + '<%})%>' + '<% } else { %>' + 'No animals' + '<% } %>' + '!</div>';
		var renderer = can.view.ejs(template);
		var div = document.createElement('div');
		// $("#qunit-test-area").html(div);
		var frag = renderer({
			animals: animals
		});
		div.appendChild(frag);
		equal(div.getElementsByTagName('div')[0].innerHTML, 'Animals:No animals!');
		animals.push('sloth');
		equal(div.getElementsByTagName('span')
			.length, 1, 'There is 1 sloth');
		animals.pop();
		equal(div.getElementsByTagName('div')[0].innerHTML, 'Animals:No animals!');
	});
	test('each works within another branch', function () {
		var animals = new can.List([]),
			template = '<div>Animals:' + '<% if( animals.attr(\'length\') ){ %>~' + '<%==each(animals, function(animal){%>' + '<span><%=animal %></span>' + '<%})%>' + '<% } else { %>' + 'No animals' + '<% } %>' + '!</div>';
		var renderer = can.view.ejs(template);
		var div = document.createElement('div');
		var frag = renderer({
			animals: animals
		});
		div.appendChild(frag);
		equal(div.getElementsByTagName('div')[0].innerHTML, 'Animals:No animals!');
		animals.push('sloth');
		equal(div.getElementsByTagName('span')
			.length, 1, 'There is 1 sloth');
		animals.pop();
		equal(div.getElementsByTagName('div')[0].innerHTML, 'Animals:No animals!');
	});
	test('JS blocks within EJS tags shouldn\'t require isolation', function () {
		var isolatedBlocks = can.view.ejs('<% if (true) { %>' + '<% if (true) {%>' + 'hi' + '<% } %>' + '<% } %>'),
			sharedBlocks = can.view.ejs('<% if (true) { %>' + '<% if (true) { %>' + 'hi' + '<% }' + '} %>'),
			complexIsolatedBlocks = can.view.ejs('<% if (true) { %><% if (1) { %>' + '<% if ({ dumb: \'literal\' }) { %>' + '<% list(items, function(item) { %>' + '<%== item %>' + '<%== something(function(items){ %><%== items.length %><% }) %>' + '<% }) %>' + '<% } %>' + '<% } %><% } %>'),
			complexSharedBlocks = can.view.ejs('<% if (true) { if (1) { %>' + '<% if ({ dumb: \'literal\' }) { %>' + '<% list(items, function(item) { %>' + '<%== item %>' + '<%== something(function(items){ %><%== items.length %><% }) %>' + '<% }) %>' + '<% }' + '} } %>'),
			iteratedSharedBlocks = can.view.ejs('<% for (var i = 0; i < items.length; i++) { %>' + '<% if (this.items) { if (1) { %>' + 'hi' + '<% } } else { %>' + 'nope' + '<% } } %>'),
			iteratedString = can.view.ejs('<% for(var i = 0; i < items.length; i++) { %>' + '\t<% if(this.mode !== "RESULTS") {' + '\t\tif(items[i] !== "SOME_FAKE_VALUE") { %>' + '\t\t\thi' + '\t\t<% }' + '\t} else { %>' + '\t\tnope' + '\t<% }' + '} %>'),
			iteratedStringNewLines = can.view.ejs('<% for(var i = 0; i < items.length; i++) { %>' + '\t<% if(this.mode !== "RESULTS") {\n' + '\t\tif(items[i] !== "SOME_FAKE_VALUE") { %>' + '\t\t\thi' + '\t\t<% }\n' + '\t} else { %>' + '\t\tnope' + '\t<% }\n' + '} %>'),
			data = {
				items: [
					'one',
					'two',
					'three'
				],
				mode: 'SOMETHING',
				something: function (cb) {
					return cb([
						1,
						2,
						3,
						4
					]);
				}
			};
		var div = document.createElement('div');
		try {
			div.appendChild(isolatedBlocks(data));
		} catch (ex) {}
		equal(div.innerHTML, 'hi', 'Rendered isolated blocks');
		div.innerHTML = '';
		try {
			div.appendChild(sharedBlocks(data));
		} catch (ex) {}
		equal(div.innerHTML, 'hi', 'Rendered shared blocks');
		div.innerHTML = '';
		try {
			div.appendChild(complexIsolatedBlocks(data));
		} catch (ex) {}
		equal(div.innerHTML, 'one4two4three4', 'Rendered complex isolated blocks with helpers and object literals');
		div.innerHTML = '';
		try {
			div.appendChild(complexSharedBlocks(data));
		} catch (ex) {}
		equal(div.innerHTML, 'one4two4three4', 'Rendered complex shared blocks with helpers and object literals');
		div.innerHTML = '';
		try {
			div.appendChild(iteratedSharedBlocks(data));
		} catch (ex) {}
		equal(div.innerHTML, 'hihihi', 'Rendered iterated shared blocks');
		div.innerHTML = '';
		try {
			div.appendChild(iteratedString(data));
		} catch (ex) {}
		ok(div.innerHTML.match(/^\s*hi\s*hi\s*hi\s*$/), 'Rendered iterated shared blocks string');
		div.innerHTML = '';
		try {
			div.appendChild(iteratedStringNewLines(data));
		} catch (ex) {}
		ok(div.innerHTML.match(/^\s*hi\s*hi\s*hi\s*$/), 'Rendered iterated shared blocks string (with new lines)');
		can.view.render(can.test.path('view/ejs/test/shared_blocks.ejs'), {
			items: [
				'one',
				'two',
				'three'
			],
			mode: 'SOMETHING'
		});
		ok(div.innerHTML.match(/^\s*hi\s*hi\s*hi\s*$/), 'Rendered iterated shared blocks file');
	});
	// Issue #242
	// This won't be fixed as it would require a full JS parser
	/*
	 test("Variables declared in shared EJS blocks shouldn't get lost", function() {
	 var template = can.view.ejs(
	 "<%" +
	 "var bestTeam = teams[0];" +
	 "can.each(teams, function(team) { %>" +
	 "<div><%== team.name %></div>" +
	 "<% }) %>" +
	 "<div class='best'><%== bestTeam.name %>!</div>"),
	 data = {
	 teams: new can.List([
	 { name: "Packers", rank: 1 },
	 { name: "Bears", rank: 2 },
	 { name: "Vikings", rank: 3 },
	 { name: "Lions", rank: 4 },
	 ])
	 },
	 div = document.createElement('div');

	 try {
	 div.appendChild(template(data));
	 } catch (ex) { }
	 var children = div.getElementsByTagName('div');
	 equal( children.length, 5, "Rendered all teams and the best team");
	 equal( children[1].innerHTML, "Bears", "Lost again");
	 equal( children[4].innerHTML, "Packers!", "#1 team");
	 });
	 */
	//Issue 267
	test('Access .length with nested dot notation', function () {
		var template = '<span id="nested"><%= this.attr("list.length") %></span>' + '<span id="unnested"><%= this.list.attr("length") %></span>',
			obj = new can.Map({
				list: [
					0,
					1,
					2,
					3
				]
			}),
			renderer = can.view.ejs(template),
			div = document.createElement('div');
		div.appendChild(renderer(obj));
		ok(div.getElementsByTagName('span')[0].innerHTML === '4', 'Nested dot notation.');
		ok(div.getElementsByTagName('span')[1].innerHTML === '4', 'Not-nested dot notation.');
	});
	test('attributes in truthy section', function () {
		var template = can.view.ejs('<p <% if(attribute) {%>data-test="<%=attribute%>"<% } %>></p>');
		var data1 = {
			attribute: 'test-value'
		};
		var frag1 = template(data1);
		var div1 = document.createElement('div');
		div1.appendChild(frag1);
		equal(div1.children[0].getAttribute('data-test'), 'test-value', 'hyphenated attribute value');
		var data2 = {
			attribute: 'test value'
		};
		var frag2 = template(data2);
		var div2 = document.createElement('div');
		div2.appendChild(frag2);
		equal(div2.children[0].getAttribute('data-test'), 'test value', 'whitespace in attribute value');
	});
	test('outputting array of attributes', function () {
		var template = can.view.ejs('<p <% for(var i = 0; i < attribute.length; i++) { %><%=attribute[i].name%>="<%=attribute[i].value%>"<%}%>></p>');
		var data = {
			attribute: [{
				'name': 'data-test1',
				'value': 'value1'
			}, {
				'name': 'data-test2',
				'value': 'value2'
			}, {
				'name': 'data-test3',
				'value': 'value3'
			}]
		};
		var frag = template(data);
		var div = document.createElement('div');
		div.appendChild(frag);
		equal(div.children[0].getAttribute('data-test1'), 'value1', 'first value');
		equal(div.children[0].getAttribute('data-test2'), 'value2', 'second value');
		equal(div.children[0].getAttribute('data-test3'), 'value3', 'third value');
	});
	test('_bindings removed when element removed', function () {
		var template = can.view.ejs('<div id="game"><% if(game.attr("league")) { %><%= game.attr("name") %><% } %></div>'),
			game = new can.Map({
				'name': 'Fantasy Baseball',
				'league': 'Malamonsters'
			});
		var frag = template({
			game: game
		});
		var div = document.createElement('div');
		div.appendChild(frag);
		can.remove(can.$(div));
		stop();
		setTimeout(function () {
			start();
			equal(game._bindings, 0, 'No bindings left');
		}, 50);
	});
})(undefined, undefined, __m30);

// ## control/control_test.js
var __m42 = (function () {
	/*global WeirdBind*/
	module('can/control');
	var isOpera = /Opera/.test(navigator.userAgent),
		isDojo = typeof dojo !== 'undefined';
	// bug in opera/dojo with on/trigger, so skip
	// tests binding and unbind, removing event handlers, etc
	if (!(isOpera && isDojo)) {
		test('basics', 14, function () {
			var clickCount = 0;
			var Things = can.Control({
				'click': function () {
					clickCount++;
				},
				'span  click': function () {
					ok(true, 'SPAN clicked');
				},
				'{foo} bar': function () {}
			});
			var foo = {
				bind: function (event, cb) {
					ok(true, 'bind called');
					equal(event, 'bar', 'bind given bar');
					ok(cb, 'called with a callback');
				},
				unbind: function (event, cb) {
					ok(true, 'unbind called');
					equal(event, 'bar', 'unbind given bar');
					ok(cb, 'called with a callback');
				}
			};
			can.append(can.$('#qunit-test-area'), '<div id=\'things\'>div<span>span</span></div>');
			var things = new Things('#things', {
				foo: foo
			});
			can.trigger(can.$('#things span'), 'click');
			can.trigger(can.$('#things'), 'click');
			equal(clickCount, 2, 'click called twice');
			things.destroy();
			can.trigger(can.$('#things span'), 'click');
			new Things('#things', {
				foo: foo
			});
			can.remove(can.$('#things'));
		});
	}
	test('data', function () {
		var Things = can.Control({});
		can.append(can.$('#qunit-test-area'), '<div id=\'things\'>div<span>span</span></div>');
		new Things('#things', {});
		new Things('#things', {});
		equal(can.data(can.$('#things'), 'controls')
			.length, 2, 'there are 2 items in the data array');
		can.remove(can.$('#things'));
	});
	if (window.jQuery) {
		test('bind to any special', function () {
			jQuery.event.special.crazyEvent = {};
			var called = false;
			can.Control('WeirdBind', {
				crazyEvent: function () {
					called = true;
				}
			});
			var a = $('<div id=\'crazy\'></div>')
				.appendTo($('#qunit-test-area'));
			new WeirdBind(a);
			a.trigger('crazyEvent');
			ok(called, 'heard the trigger');
			$('#qunit-test-area')
				.html('');
		});
	}
	test('parameterized actions', function () {
		// YUI does not like non-dom event
		if (can.Y) {
			can.Y.mix(can.Y.Node.DOM_EVENTS, {
				sillyEvent: true
			});
		}
		var called = false,
			WeirderBind = can.Control({
				'{parameterized}': function () {
					called = true;
				}
			}),
			a;
		can.append(can.$('#qunit-test-area'), '<div id=\'crazy\'></div>');
		a = can.$('#crazy');
		new WeirderBind(a, {
			parameterized: 'sillyEvent'
		});
		can.trigger(a, 'sillyEvent');
		ok(called, 'heard the trigger');
		can.remove(a);
	});
	test('windowresize', function () {
		var called = false,
			WindowBind = can.Control('', {
				'{window} resize': function () {
					called = true;
				}
			});
		can.append(can.$('#qunit-test-area'), '<div id=\'weird\'>');
		new WindowBind('#weird');
		can.trigger(can.$(window), 'resize');
		ok(called, 'got window resize event');
		can.remove(can.$('#weird'));
	});
	// there is a bug in opera with dojo with on/trigger, so skip that case
	// can.append( can.$("#qunit-test-area"), "<div id='els'><span id='elspan'><a href='#' id='elsa'>click me</a></span></div>")
	// dojo.query("#els span").on("a:click", function(){
	// console.log('HOOLLLLER')
	// });
	// dojo.query("#els a").trigger("click");
	if (!(isOpera && isDojo)) {
		test('on', function () {
			var called = false,
				DelegateTest = can.Control({
					click: function () {}
				}),
				Tester = can.Control({
					init: function (el, ops) {
						this.on(window, 'click', function (ev) {
							ok(true, 'Got window click event');
						});
						this.on(window, 'click', 'clicked');
						this.on('click', function () {
							ok(true, 'Directly clicked element');
						});
						this.on('click', 'clicked');
					},
					clicked: function () {
						ok(true, 'Controller action delegated click triggered, too');
					}
				}),
				div = document.createElement('div');
			can.append(can.$('#qunit-test-area'), div);
			var rb = new Tester(div);
			can.append(can.$('#qunit-test-area'), '<div id=\'els\'><span id=\'elspan\'><a href=\'javascript://\' id=\'elsa\'>click me</a></span></div>');
			var els = can.$('#els');
			var dt = new DelegateTest(els);
			dt.on(can.$('#els span'), 'a', 'click', function () {
				called = true;
			});
			can.trigger(can.$('#els a'), 'click');
			ok(called, 'delegate works');
			can.remove(els);
			can.trigger(can.$(div), 'click');
			can.trigger(window, 'click');
			rb.destroy();
		});
	}
	test('inherit', function () {
		var called = false,
			Parent = can.Control({
				click: function () {
					called = true;
				}
			}),
			Child = Parent({});
		can.append(can.$('#qunit-test-area'), '<div id=\'els\'><span id=\'elspan\'><a href=\'#\' id=\'elsa\'>click me</a></span></div>');
		var els = can.$('#els');
		new Child(els);
		can.trigger(can.$('#els'), 'click');
		ok(called, 'inherited the click method');
		can.remove(els);
	});
	test('space makes event', 1, function () {
		if (can.Y) {
			can.Y.mix(can.Y.Node.DOM_EVENTS, {
				foo: true
			});
		}
		var Dot = can.Control({
			' foo': function () {
				ok(true, 'called');
			}
		});
		can.append(can.$('#qunit-test-area'), '<div id=\'els\'><span id=\'elspan\'><a href=\'#\' id=\'elsa\'>click me</a></span></div>');
		var els = can.$('#els');
		new Dot(els);
		can.trigger(can.$('#els'), 'foo');
		can.remove(els);
	});
	test('custom events with hyphens work', 1, function () {
		can.append(can.$('#qunit-test-area'), '<div id=\'customEvent\'><span></span></div>');
		var FooBar = can.Control({
			'span custom-event': function () {
				ok(true, 'Custom event was fired.');
			}
		});
		new FooBar('#customEvent');
		can.trigger(can.$('#customEvent span'), 'custom-event');
	});
	test('inherit defaults', function () {
		var BASE = can.Control({
			defaults: {
				foo: 'bar'
			}
		}, {});
		var INHERIT = BASE({
			defaults: {
				newProp: 'newVal'
			}
		}, {});
		ok(INHERIT.defaults.foo === 'bar', 'Class must inherit defaults from the parent class');
		ok(INHERIT.defaults.newProp === 'newVal', 'Class must have own defaults');
		var inst = new INHERIT(document.createElement('div'), {});
		ok(inst.options.foo === 'bar', 'Instance must inherit defaults from the parent class');
		ok(inst.options.newProp === 'newVal', 'Instance must have defaults of it`s class');
	});
	var bindable = function (b) {
		if (window.jQuery) {
			return b;
		} else {}
		return b;
	};
	test('on rebinding', 2, function () {
		var first = true;
		var Rebinder = can.Control({
			'{item} foo': function (item, ev) {
				if (first) {
					equal(item.id, 1, 'first item');
					first = false;
				} else {
					equal(item.id, 2, 'first item');
				}
			}
		});
		var item1 = bindable({
			id: 1
		}),
			item2 = bindable({
				id: 2
			}),
			rb = new Rebinder(document.createElement('div'), {
				item: item1
			});
		can.trigger(item1, 'foo');
		rb.options = {
			item: item2
		};
		rb.on();
		can.trigger(item2, 'foo');
	});
	test("actions provide method names", function () {
		var Tester = can.Control({
			"{item1} foo": "food",
			"{item2} bar": "food",
			food: function (item, ev, data) {
				ok(true, "food called")
				ok(item === item1 || item === item2, "called with an item")
			}
		});

		var item1 = {},
			item2 = {};

		new Tester(document.createElement('div'), {
			item1: item1,
			item2: item2
		});

		can.trigger(item1, "foo");
		can.trigger(item2, "bar");
	});
	test('Don\'t bind if there are undefined values in templates', function () {
		can.Control.processors.proc = function () {
			ok(false, 'This processor should never be called');
		};
		var Control = can.Control({}, {
			'{noExistStuff} proc': function () {}
		});
		var c = new Control(document.createElement('div'));
		equal(c._bindings.user.length, 1, 'There is only one binding');
	});
	test('Multiple calls to destroy', 2, function () {
		var Control = can.Control({
			destroy: function () {
				ok(true);
				can.Control.prototype.destroy.call(this);
			}
		}),
			div = document.createElement('div'),
			c = new Control(div);
		c.destroy();
		c.destroy();
	});
	if (can.dev) {
		test('Control is logging information in dev mode', function () {
			expect(2);
			var oldlog = can.dev.log;
			var oldwarn = can.dev.warn;
			can.dev.log = function (text) {
				equal(text, 'can/control/control.js: No property found for handling {dummy} change', 'Text logged as expected');
			};
			var Control = can.Control({
				'{dummy} change': function () {}
			});
			var instance = new Control(document.createElement('div'));
			can.dev.warn = function (text) {
				equal(text, 'can/control/control.js: Control already destroyed');
			};
			instance.destroy();
			instance.destroy();
			can.dev.warn = oldwarn;
			can.dev.log = oldlog;
		});
	}
})(undefined);

// ## route/route_test.js
var __m43 = (function () {
	module("can/route", {
		setup: function () {
			can.route._teardown();
			can.route.defaultBinding = "hashchange";
		}
	})

	if (!("onhashchange" in window)) {
		return;
	}

	test("deparam", function () {
		can.route.routes = {};
		can.route(":page", {
			page: "index"
		});

		var obj = can.route.deparam("can.Control");
		deepEqual(obj, {
			page: "can.Control",
			route: ":page"
		});

		obj = can.route.deparam("");
		deepEqual(obj, {
			page: "index",
			route: ":page"
		});

		obj = can.route.deparam("can.Control&where=there");
		deepEqual(obj, {
			page: "can.Control",
			where: "there",
			route: ":page"
		});

		can.route.routes = {};
		can.route(":page/:index", {
			page: "index",
			index: "foo"
		});

		obj = can.route.deparam("can.Control/&where=there");
		deepEqual(obj, {
			page: "can.Control",
			index: "foo",
			where: "there",
			route: ":page/:index"
		}, "default value and queryparams");
	})

	test("deparam of invalid url", function () {
		var obj;
		can.route.routes = {};
		can.route("pages/:var1/:var2/:var3", {
			var1: 'default1',
			var2: 'default2',
			var3: 'default3'
		});

		// This path does not match the above route, and since the hash is not
		// a &key=value list there should not be data.
		obj = can.route.deparam("pages//");
		deepEqual(obj, {});

		// A valid path with invalid parameters should return the path data but
		// ignore the parameters.
		obj = can.route.deparam("pages/val1/val2/val3&invalid-parameters");
		deepEqual(obj, {
			var1: 'val1',
			var2: 'val2',
			var3: 'val3',
			route: "pages/:var1/:var2/:var3"
		});
	})

	test("deparam of url with non-generated hash (manual override)", function () {
		var obj;
		can.route.routes = {};

		// This won't be set like this by route, but it could easily happen via a
		// user manually changing the URL or when porting a prior URL structure.
		obj = can.route.deparam("page=foo&bar=baz&where=there");
		deepEqual(obj, {
			page: 'foo',
			bar: 'baz',
			where: 'there'
		});
	})

	test("param", function () {
		can.route.routes = {};
		can.route("pages/:page", {
			page: "index"
		})

		var res = can.route.param({
			page: "foo"
		});
		equal(res, "pages/foo")

		res = can.route.param({
			page: "foo",
			index: "bar"
		});
		equal(res, "pages/foo&index=bar")

		can.route("pages/:page/:foo", {
			page: "index",
			foo: "bar"
		})

		res = can.route.param({
			page: "foo",
			foo: "bar",
			where: "there"
		});
		equal(res, "pages/foo/&where=there")

		// There is no matching route so the hash should be empty.
		res = can.route.param({});
		equal(res, "")

		can.route.routes = {};

		res = can.route.param({
			page: "foo",
			bar: "baz",
			where: "there"
		});
		equal(res, "&page=foo&bar=baz&where=there")

		res = can.route.param({});
		equal(res, "")
	});

	test("symmetry", function () {
		can.route.routes = {};

		var obj = {
			page: "=&[]",
			nestedArray: ["a"],
			nested: {
				a: "b"
			}
		}

		var res = can.route.param(obj)

		var o2 = can.route.deparam(res)
		deepEqual(o2, obj)
	})

	test("light param", function () {
		can.route.routes = {};
		can.route(":page", {
			page: "index"
		})

		var res = can.route.param({
			page: "index"
		});
		equal(res, "")

		can.route("pages/:p1/:p2/:p3", {
			p1: "index",
			p2: "foo",
			p3: "bar"
		})

		res = can.route.param({
			p1: "index",
			p2: "foo",
			p3: "bar"
		});
		equal(res, "pages///")

		res = can.route.param({
			p1: "index",
			p2: "baz",
			p3: "bar"
		});
		equal(res, "pages//baz/")
	});

	test('param doesnt add defaults to params', function () {
		can.route.routes = {};

		can.route("pages/:p1", {
			p2: "foo"
		})
		var res = can.route.param({
			p1: "index",
			p2: "foo"
		});
		equal(res, "pages/index")
	})

	test("param-deparam", function () {

		can.route(":page/:type", {
			page: "index",
			type: "foo"
		})

		var data = {
			page: "can.Control",
			type: "document",
			bar: "baz",
			where: "there"
		};
		var res = can.route.param(data);
		var obj = can.route.deparam(res);
		delete obj.route
		deepEqual(obj, data)
		data = {
			page: "can.Control",
			type: "foo",
			bar: "baz",
			where: "there"
		};
		res = can.route.param(data);
		obj = can.route.deparam(res);
		delete obj.route;
		deepEqual(data, obj)

		data = {
			page: " a ",
			type: " / "
		};
		res = can.route.param(data);
		obj = can.route.deparam(res);
		delete obj.route;
		deepEqual(obj, data, "slashes and spaces")

		data = {
			page: "index",
			type: "foo",
			bar: "baz",
			where: "there"
		};
		res = can.route.param(data);
		obj = can.route.deparam(res);
		delete obj.route;
		deepEqual(data, obj)

		can.route.routes = {};

		data = {
			page: "foo",
			bar: "baz",
			where: "there"
		};
		res = can.route.param(data);
		obj = can.route.deparam(res);
		deepEqual(data, obj)
	})

	test("deparam-param", function () {
		can.route.routes = {};
		can.route(":foo/:bar", {
			foo: 1,
			bar: 2
		});
		var res = can.route.param({
			foo: 1,
			bar: 2
		});
		equal(res, "/", "empty slash")

		var deparamed = can.route.deparam("/")
		deepEqual(deparamed, {
			foo: 1,
			bar: 2,
			route: ":foo/:bar"
		})
	})

	test("precident", function () {
		can.route.routes = {};
		can.route(":who", {
			who: "index"
		});
		can.route("search/:search");

		var obj = can.route.deparam("can.Control");
		deepEqual(obj, {
			who: "can.Control",
			route: ":who"
		});

		obj = can.route.deparam("search/can.Control");
		deepEqual(obj, {
			search: "can.Control",
			route: "search/:search"
		}, "bad deparam");

		equal(can.route.param({
				search: "can.Control"
			}),
			"search/can.Control", "bad param");

		equal(can.route.param({
				who: "can.Control"
			}),
			"can.Control");
	})

	test("better matching precident", function () {
		can.route.routes = {};
		can.route(":type", {
			who: "index"
		});
		can.route(":type/:id");

		equal(can.route.param({
				type: "foo",
				id: "bar"
			}),
			"foo/bar");
	})

	test("linkTo", function () {
		can.route.routes = {};
		can.route(":foo");
		var res = can.route.link("Hello", {
			foo: "bar",
			baz: 'foo'
		});
		equal(res, '<a href="#!bar&baz=foo">Hello</a>');
	})

	test("param with route defined", function () {
		can.route.routes = {};
		can.route("holler")
		can.route("foo");

		var res = can.route.param({
			foo: "abc",
			route: "foo"
		});

		equal(res, "foo&foo=abc")
	})

	test("route endings", function () {
		can.route.routes = {};
		can.route("foo", {
			foo: true
		});
		can.route("food", {
			food: true
		})

		var res = can.route.deparam("food")
		ok(res.food, "we get food back")

	});

	test("strange characters", function () {
		can.route.routes = {};
		can.route(":type/:id");
		var res = can.route.deparam("foo/" + encodeURIComponent("\/"))
		equal(res.id, "\/")
		res = can.route.param({
			type: "bar",
			id: "\/"
		});
		equal(res, "bar/" + encodeURIComponent("\/"))
	});

	test("empty default is matched even if last", function () {

		can.route.routes = {};
		can.route(":who");
		can.route("", {
			foo: "bar"
		})

		var obj = can.route.deparam("");
		deepEqual(obj, {
			foo: "bar",
			route: ""
		});
	});

	test("order matched", function () {
		can.route.routes = {};
		can.route(":foo");
		can.route(":bar")

		var obj = can.route.deparam("abc");
		deepEqual(obj, {
			foo: "abc",
			route: ":foo"
		});
	});

	test("param order matching", function () {
		can.route.routes = {};
		can.route("", {
			bar: "foo"
		});
		can.route("something/:bar");
		var res = can.route.param({
			bar: "foo"
		});
		equal(res, "", "picks the shortest, best match");

		// picks the first that matches everything ...
		can.route.routes = {};

		can.route(":recipe", {
			recipe: "recipe1",
			task: "task3"
		});

		can.route(":recipe/:task", {
			recipe: "recipe1",
			task: "task3"
		});

		res = can.route.param({
			recipe: "recipe1",
			task: "task3"
		});

		equal(res, "", "picks the first match of everything");

		res = can.route.param({
			recipe: "recipe1",
			task: "task2"
		});
		equal(res, "/task2")
	});

	test("dashes in routes", function () {
		can.route.routes = {};
		can.route(":foo-:bar");

		var obj = can.route.deparam("abc-def");
		deepEqual(obj, {
			foo: "abc",
			bar: "def",
			route: ":foo-:bar"
		});

		window.location.hash = "qunit-header";
		window.location.hash = "";
	});

	if (typeof steal !== 'undefined') {
		test("listening to hashchange (#216, #124)", function () {
			var testarea = document.getElementById('qunit-test-area');
			var iframe = document.createElement('iframe');
			stop();

			window.routeTestReady = function (iCanRoute) {
				ok(!iCanRoute.attr('bla'), 'Value not set yet');
				iCanRoute.bind('change', function () {
					equal(iCanRoute.attr('bla'), 'blu', 'Got route change event and value is as expected');
					testarea.innerHTML = '';
					start();
				});
				iCanRoute.ready()
				setTimeout(function () {
					iframe.src = iframe.src + '#!bla=blu';
				}, 100);
			};

			iframe.src = can.test.path("route/testing.html?1");
			testarea.appendChild(iframe);
		});

		test("updating the hash", function () {
			stop();
			window.routeTestReady = function (iCanRoute, loc) {
				iCanRoute.ready()
				iCanRoute(":type/:id");
				iCanRoute.attr({
					type: "bar",
					id: "\/"
				});

				setTimeout(function () {
					var after = loc.href.substr(loc.href.indexOf("#"));
					equal(after, "#!bar/" + encodeURIComponent("\/"));
					start();

					can.remove(can.$(iframe))

				}, 30);
			}
			var iframe = document.createElement('iframe');
			iframe.src = can.test.path("route/testing.html");
			can.$("#qunit-test-area")[0].appendChild(iframe);
		});

		test("sticky enough routes", function () {
			stop();
			window.routeTestReady = function (iCanRoute, loc) {
				iCanRoute.ready()
				iCanRoute("active");
				iCanRoute("");
				loc.hash = "#!active"

				setTimeout(function () {
					var after = loc.href.substr(loc.href.indexOf("#"));
					equal(after, "#!active");
					start();

					can.remove(can.$(iframe))

				}, 30);
			}
			var iframe = document.createElement('iframe');
			iframe.src = can.test.path("route/testing.html?2");
			can.$("#qunit-test-area")[0].appendChild(iframe);
		});

		test("unsticky routes", function () {
			stop();
			window.routeTestReady = function (iCanRoute, loc) {
				iCanRoute.ready()
				iCanRoute(":type")
				iCanRoute(":type/:id");
				iCanRoute.attr({
					type: "bar"
				});

				setTimeout(function () {
					var after = loc.href.substr(loc.href.indexOf("#"));
					equal(after, "#!bar");
					iCanRoute.attr({
						type: "bar",
						id: "\/"
					});

					// check for 1 second
					var time = new Date()
					setTimeout(function innerTimer() {
						var after = loc.href.substr(loc.href.indexOf("#"));
						if (after === "#!bar/" + encodeURIComponent("\/")) {
							equal(after, "#!bar/" + encodeURIComponent("\/"), "should go to type/id");
							can.remove(can.$(iframe))
							start();
						} else if (new Date() - time > 2000) {
							ok(false, "hash is " + after);
							can.remove(can.$(iframe))
						} else {
							setTimeout(innerTimer, 30)
						}

					}, 100)

				}, 100)

			}
			var iframe = document.createElement('iframe');
			iframe.src = can.test.path("route/testing.html?1");
			can.$("#qunit-test-area")[0].appendChild(iframe);
		});
	}

	test("escaping periods", function () {

		can.route.routes = {};
		can.route(":page\\.html", {
			page: "index"
		});

		var obj = can.route.deparam("can.Control.html");
		deepEqual(obj, {
			page: "can.Control",
			route: ":page\\.html"
		});

		equal(can.route.param({
			page: "can.Control"
		}), "can.Control.html");

	})

	if (typeof require === 'undefined') {

		test("correct stringing", function () {
			var route = can.route;

			route.routes = {};

			route.attr('number', 1);
			deepEqual(route.attr(), {
				'number': "1"
			});

			route.attr({
				bool: true
			}, true)
			deepEqual(route.attr(), {
				'bool': "true"
			});

			route.attr({
				string: "hello"
			}, true);
			deepEqual(route.attr(), {
				'string': "hello"
			});

			route.attr({
				array: [1, true, "hello"]
			}, true);
			deepEqual(route.attr(), {
				'array': ["1", "true", "hello"]
			});

			route.attr({
				number: 1,
				bool: true,
				string: "hello",
				array: [2, false, "world"],
				obj: {
					number: 3,
					array: [4, true]
				}
			}, true);

			deepEqual(route.attr(), {
				number: "1",
				bool: "true",
				string: "hello",
				array: ["2", "false", "world"],
				obj: {
					number: "3",
					array: ["4", "true"]
				}
			})

			route.routes = {};
			route(":type/:id");

			route.attr({
				type: 'page',
				id: 10,
				sort_by_name: true
			}, true)
			deepEqual(route.attr(), {
				type: "page",
				id: "10",
				sort_by_name: "true"
			});
		});

	}

	test("on/off binding", function () {
		can.route.routes = {};
		expect(1)

		can.route.on('foo', function () {
			ok(true, "foo called");

			can.route.off('foo');

			can.route.attr('foo', 'baz');
		});

		can.route.attr('foo', 'bar');
	})

})(undefined, __m30);

// ## control/route/route_test.js
var __m46 = (function () {

	module("can/control/route", {
		setup: function () {
			stop();
			can.route.routes = {};
			can.route._teardown();
			can.route.defaultBinding = "hashchange";
			can.route.ready();
			window.location.hash = "";
			setTimeout(function () {

				start();
			}, 13);

		}
	});

	test("routes changed", function () {
		expect(3);

		//setup controller
		can.Control.extend("Router", {
			"foo/:bar route": function () {
				ok(true, 'route updated to foo/:bar')
			},

			"foos route": function () {
				ok(true, 'route updated to foos');
			},

			"route": function () {
				ok(true, 'route updated to empty')
			}
		});

		// init controller
		var router = new Router(document.body);

		can.trigger(window, 'hashchange');

		window.location.hash = '!foo/bar';
		can.trigger(window, 'hashchange');

		window.location.hash = '!foos';
		can.trigger(window, 'hashchange');
		router.destroy();

	});

	test("route pointers", function () {
		expect(1);
		var Tester = can.Control.extend({
			"lol/:wat route": "meth",
			meth: function () {
				ok(true, "method pointer called")
			}
		});
		var tester = new Tester(document.body);
		window.location.hash = '!lol/wat';
		can.trigger(window, 'hashchange');
		tester.destroy();
	})

	test("dont overwrite defaults (#474)", function () {

		expect(1);

		can.route("content/:type", {
			type: "videos"
		});

		var Tester = can.Control.extend({
			"content/:type route": function (params) {
				equal(params.type, "videos")
			}
		});
		var tester = new Tester(document.body);
		window.location.hash = "#!content/";
		can.trigger(window, 'hashchange');
		tester.destroy();

	})

	if (window.history && history.pushState) {

		test("be friendly to '/'-prefixed routes for pushstate (#612)", 1, function () {
	
			window.routeTestReady = function (iCanRoute, loc, hist, win) {
				win.can.route(":section/:type");
				win.can.route.ready();
	
				var Tester = win.can.Control.extend({
					"/:section/:type route": function (params) {
						equal(params.type, "videos");
					}
				});
				var tester = new Tester(win.document.body);
	
				var link = win.document.createElement("a");
				link.href = link.innerHTML = "/content/videos";
				win.document.body.appendChild(link);
	
				var change;
				win.can.route.bind('change', change = function () {
					win.can.route.unbind('change', change);
					setTimeout(function () {
						start();
						iframe.parentNode.removeChild(iframe);
					}, 0);
				});
	
				win.can.trigger(win.can.$(link), 'click');
				tester.destroy();
			};
	
			var iframe = document.createElement("iframe");
			iframe.src = can.test.path("control/route/pushstate.html");
			can.$("#qunit-test-area")[0].appendChild(iframe);
			stop();
		})
	
	}

})(undefined);

// ## view/mustache/mustache_test.js
var __m48 = (function () {

	module("can/view/mustache, rendering", {
		setup: function () {
			can.view.ext = '.mustache';

			this.animals = ['sloth', 'bear', 'monkey']
			if (!this.animals.each) {
				this.animals.each = function (func) {
					for (var i = 0; i < this.length; i++) {
						func(this[i])
					}
				}
			}

			this.squareBrackets = "<ul>{{#animals}}" +
				"<li>{{.}}</li>" +
				"{{/animals}}</ul>";
			this.squareBracketsNoThis = "<ul>{{#animals}}" +
				"<li>{{.}}</li>" +
				"{{/animals}}</ul>";
			this.angleBracketsNoThis = "<ul>{{#animals}}" +
				"<li>{{.}}</li>" +
				"{{/animals}}</ul>";

		}
	})

	// Override expected spec result for whitespace only issues
	var override = {
		comments: {
			'Standalone Without Newline': '!'
		},
		inverted: {
			'Standalone Line Endings': '|\n\n|',
			'Standalone Without Newline': '^\n/'
		},
		partials: {
			'Standalone Line Endings': '|\n>\n|',
			'Standalone Without Newline': '>\n  >\n>',
			'Standalone Without Previous Line': '  >\n>\n>',
			'Standalone Indentation': '\\\n |\n<\n->\n|\n\n/\n'
		},
		sections: {
			'Standalone Line Endings': '|\n\n|',
			'Standalone Without Newline': '#\n/'
		}
	};

	// Add mustache specs to the test
	can.each(['comments', /*'delimiters',*/ 'interpolation', 'inverted', 'partials', 'sections' /*, '~lambdas'*/ ], function (spec) {
		can.ajax({
			url: can.test.path('view/mustache/spec/specs/' + spec + '.json'),
			dataType: 'json',
			async: false
		})
			.done(function (data) {
				can.each(data.tests, function (t) {
					test('specs/' + spec + ' - ' + t.name + ': ' + t.desc, function () {
						// can uses &#34; to escape double quotes, mustache expects &quot;.
						// can uses \n for new lines, mustache expects \r\n.
						var expected = (override[spec] && override[spec][t.name]) || t.expected.replace(/&quot;/g, '&#34;')
							.replace(/\r\n/g, '\n');

						// Mustache's "Recursion" spec generates invalid HTML
						if (spec === 'partials' && t.name === 'Recursion') {
							t.partials.node = t.partials.node.replace(/</g, '[')
								.replace(/\}>/g, '}]');
							expected = expected.replace(/</g, '[')
								.replace(/>/g, ']');
						}

						// register the partials in the spec
						if (t.partials) {
							for (var name in t.partials) {
								can.view.registerView(name, t.partials[name])
							}
						}

						// register lambdas
						if (t.data.lambda && t.data.lambda.js) {
							t.data.lambda = eval('(' + t.data.lambda.js + ')');
						}

						deepEqual(new can.Mustache({
								text: t.template
							})
							.render(t.data), expected);
					});
				});
			});
	});

	var getAttr = function (el, attrName) {
		return attrName === "class" ?
			el.className :
			el.getAttribute(attrName);
	}

	test("basics", function () {
		var template = can.view.mustache("<ul>{{#items}}<li>{{helper foo}}</li>{{/items}}</ul>");
		template()
		ok(true, "just to force the issue")
	})

	test("Model hookup", function () {

		// Single item hookup
		var template = '<p id="foo" {{  data "name "   }}>data rocks</p>';
		var obsvr = new can.Map({
			name: 'Austin'
		});
		var frag = new can.Mustache({
			text: template
		})
			.render(obsvr);
		can.append(can.$('#qunit-test-area'), can.view.frag(frag));
		deepEqual(can.data(can.$('#foo'), 'name '), obsvr, 'data hooks worked and fetched');

		// Multi-item hookup
		var listTemplate = '<ul id="list">{{#list}}<li class="moo" id="li-{{name}}" {{data "obsvr"}}>{{name}}</li>{{/#list}}</ul>';
		var obsvrList = new can.List([obsvr]);
		var listFrag = new can.Mustache({
			text: listTemplate
		})
			.render({
				list: obsvrList
			});
		can.append(can.$('#qunit-test-area'), can.view.frag(listFrag));

		deepEqual(can.data(can.$('#li-Austin'), 'obsvr'), obsvr, 'data hooks for list worked and fetched');

		// Mulit-item update with hookup
		var obsvr2 = new can.Map({
			name: 'Justin'
		});
		obsvrList.push(obsvr2);
		deepEqual(can.data(can.$('#li-Justin'), 'obsvr'), obsvr2, 'data hooks for list push worked and fetched');

		// Delete last item added
		obsvrList.pop();
		deepEqual(can.$('.moo')
			.length, 1, 'new item popped off and deleted from ui');
	});

	/*test("Variable partials", function(){
	 var template = "{{#items}}<span>{{>partial}}</span>{{/items}}";
	 var data = { items: [{}], partial: "test_template.mustache" }

	 var frag = new can.Mustache({ text: template }).render(data);
	 can.append( can.$('#qunit-test-area'), can.view.frag(frag));
	 });*/

	/*
	 // FIX THIS
	 test('Helpers sections not returning values', function(){
	 Mustache.registerHelper('filter', function(attr,options){
	 return true;
	 });

	 var template = "<div id='sectionshelper'>{{#filter}}moo{{/filter}}</div>";
	 var frag = new can.Mustache({ text: template }).render({ });;
	 can.append( can.$('#qunit-test-area'), can.view.frag(frag));
	 deepEqual(can.$('#sectionshelper')[0].innerHTML, "moo", 'helper section worked');

	 });

	 // FIX THIS
	 test('Helpers with obvservables in them', function(){
	 Mustache.registerHelper('filter', function(attr,options){
	 return options.fn(attr === "poo");
	 });

	 var template = "<div id='sectionshelper'>{{#filter 'moo'}}moo{{/filter}}</div>";
	 var obsvr = new can.Map({ filter: 'moo' });
	 var frag = new can.Mustache({ text: template }).render({ filter: obsvr });;
	 can.append( can.$('#qunit-test-area'), can.view.frag(frag));
	 deepEqual(can.$('#sectionshelper')[0].innerHTML, "", 'helper section showed none');

	 obsvr.attr('filter', 'poo')
	 deepEqual(can.$('#sectionshelper')[0].innerHTML, "poo", 'helper section worked');
	 });
	 */

	test('Tokens returning 0 where they should diplay the number', function () {
		var template = "<div id='zero'>{{completed}}</div>";
		var frag = new can.Mustache({
			text: template
		})
			.render({
				completed: 0
			});
		can.append(can.$('#qunit-test-area'), can.view.frag(frag));
		deepEqual(can.$('#zero')[0].innerHTML, "0", 'zero shown');
	})

	test('Inverted section function returning numbers', function () {
		var template = "<div id='completed'>{{^todos.completed}}hidden{{/todos.completed}}</div>";
		var obsvr = new can.Map({
			named: false
		});

		var todos = {
			completed: function () {
				return obsvr.attr('named');
			}
		};

		// check hidden there
		var frag = new can.Mustache({
			text: template
		})
			.render({
				todos: todos
			});
		can.append(can.$('#qunit-test-area'), can.view.frag(frag));
		deepEqual(can.$('#completed')[0].innerHTML, "hidden", 'hidden shown');

		// now update the named attribute
		obsvr.attr('named', true);
		deepEqual(can.$('#completed')[0].innerHTML, "", 'hidden gone');
	});

	test("Mustache live-binding with escaping", function () {
		var template = "<span id='binder1'>{{ name }}</span><span id='binder2'>{{{name}}}</span>";

		var teacher = new can.Map({
			name: "<strong>Mrs Peters</strong>"
		});

		var tpl = new can.Mustache({
			text: template
		});

		can.append(can.$('#qunit-test-area'), can.view.frag(tpl.render(teacher)));

		deepEqual(can.$('#binder1')[0].innerHTML, "&lt;strong&gt;Mrs Peters&lt;/strong&gt;");
		deepEqual(can.$('#binder2')[0].getElementsByTagName('strong')[0].innerHTML, "Mrs Peters");

		teacher.attr('name', '<i>Mr Scott</i>');

		deepEqual(can.$('#binder1')[0].innerHTML, "&lt;i&gt;Mr Scott&lt;/i&gt;");
		deepEqual(can.$('#binder2')[0].getElementsByTagName('i')[0].innerHTML, "Mr Scott")
	});

	test("Mustache truthy", function () {
		var t = {
			template: "{{#name}}Do something, {{name}}!{{/name}}",
			expected: "Do something, Andy!",
			data: {
				name: 'Andy'
			}
		};

		var expected = t.expected.replace(/&quot;/g, '&#34;')
			.replace(/\r\n/g, '\n');
		deepEqual(new can.Mustache({
				text: t.template
			})
			.render(t.data), expected);
	});

	test("Mustache falsey", function () {
		var t = {
			template: "{{^cannot}}Don't do it, {{name}}!{{/cannot}}",
			expected: "Don't do it, Andy!",
			data: {
				name: 'Andy'
			}
		};

		var expected = t.expected.replace(/&quot;/g, '&#34;')
			.replace(/\r\n/g, '\n');
		deepEqual(new can.Mustache({
				text: t.template
			})
			.render(t.data), expected);
	});

	test("Handlebars helpers", function () {
		can.Mustache.registerHelper('hello', function (options) {
			return 'Should not hit this';
		});
		can.Mustache.registerHelper('there', function (options) {
			return 'there';
		});
		can.Mustache.registerHelper('bark', function (obj, str, number, options) {
			var hash = options.hash || {};
			return 'The ' + obj + ' barked at ' + str + ' ' + number + ' times, ' +
				'then the ' + hash.obj + ' ' + hash.action + ' ' +
				hash.where + ' times' + (hash.loud === true ? ' loudly' : '') + '.';
		});
		var t = {
			template: "{{hello}} {{there}}!\n{{bark name 'Austin and Andy' 3 obj=name action='growled and snarled' where=2 loud=true}}",
			expected: "Hello there!\nThe dog barked at Austin and Andy 3 times, then the dog growled and snarled 2 times loudly.",
			data: {
				name: 'dog',
				hello: 'Hello'
			}
		};

		var expected = t.expected.replace(/&quot;/g, '&#34;')
			.replace(/\r\n/g, '\n');
		deepEqual(new can.Mustache({
				text: t.template
			})
			.render(t.data), expected);
	});

	test("Handlebars advanced helpers (from docs)", function () {
		Mustache.registerHelper('exercise', function (group, action, num, options) {
			if (group && group.length > 0 && action && num > 0) {
				return options.fn({
					group: group,
					action: action,
					where: options.hash.where,
					when: options.hash.when,
					num: num
				});
			} else {
				return options.inverse(this);
			}
		});

		var t = {
			template: "{{#exercise pets 'walked' 3 where='around the block' when=time}}" +
				"Along with the {{#group}}{{.}}, {{/group}}" +
				"we {{action}} {{where}} {{num}} times {{when}}." +
				"{{else}}" +
				"We were lazy today." +
				"{{/exercise}}",
			expected: "Along with the cat, dog, parrot, we walked around the block 3 times this morning.",
			expected2: "We were lazy today.",
			data: {
				pets: ['cat', 'dog', 'parrot'],
				time: 'this morning'
			}
		};

		deepEqual(new can.Mustache({
				text: t.template
			})
			.render(t.data), t.expected);
		deepEqual(new can.Mustache({
				text: t.template
			})
			.render({}), t.expected2);
	});

	test("Passing functions as data, then executing them", function () {
		var t = {
			template: "{{#nested}}{{welcome name}}{{/nested}}",
			expected: "Welcome Andy!",
			data: {
				name: 'Andy',
				nested: {
					welcome: function (name) {
						return 'Welcome ' + name + '!';
					}
				}
			}
		};

		var expected = t.expected.replace(/&quot;/g, '&#34;')
			.replace(/\r\n/g, '\n');
		deepEqual(new can.Mustache({
				text: t.template
			})
			.render(t.data), expected);
	});

	test("Absolute partials", function () {
		var test_template = can.test.path('view/mustache/test/test_template.mustache');
		var t = {
			template1: "{{> " + test_template + "}}",
			template2: "{{> " + test_template + "}}",
			expected: "Partials Rock"
		};

		deepEqual(new can.Mustache({
				text: t.template1
			})
			.render({}), t.expected);
		deepEqual(new can.Mustache({
				text: t.template2
			})
			.render({}), t.expected);
	});

	test("No arguments passed to helper", function () {
		can.view.mustache("noargs", "{{noargHelper}}");
		can.Mustache.registerHelper("noargHelper", function () {
			return "foo"
		})
		var div1 = document.createElement('div');
		var div2 = document.createElement('div');

		div1.appendChild(can.view("noargs", {}));
		div2.appendChild(can.view("noargs", new can.Map()));

		deepEqual(div1.innerHTML, "foo");
		deepEqual(div2.innerHTML, "foo");
	});

	test("No arguments passed to helper with list", function () {
		can.view.mustache("noargs", "{{#items}}{{noargHelper}}{{/items}}");
		var div = document.createElement('div');

		div.appendChild(can.view("noargs", {
			items: new can.List([{
				name: "Brian"
			}])
		}, {
			noargHelper: function () {
				return "foo"
			}
		}));

		deepEqual(div.innerHTML, "foo");
	});

	test("Partials and observes", function () {
		var template;
		var div = document.createElement('div');

		template = can.view.mustache("table", "<table><thead><tr>{{#data}}{{{>" +
			can.test.path('view/mustache/test/partial.mustache') + "}}}{{/data}}</tr></thead></table>")

		var dom = can.view("table", {
			data: new can.Map({
				list: ["hi", "there"]
			})
		});
		div.appendChild(dom);
		var ths = div.getElementsByTagName('th');

		equal(ths.length, 2, 'Got two table headings');
		equal(ths[0].innerHTML, 'hi', 'First column heading correct');
		equal(ths[1].innerHTML, 'there', 'Second column heading correct');
	});

	test("Deeply nested partials", function () {
		var t = {
			template: "{{#nest1}}{{#nest2}}{{>partial}}{{/nest2}}{{/nest1}}",
			expected: "Hello!",
			partials: {
				partial: '{{#nest3}}{{name}}{{/nest3}}'
			},
			data: {
				nest1: {
					nest2: {
						nest3: {
							name: 'Hello!'
						}
					}
				}
			}
		};
		for (var name in t.partials) {
			can.view.registerView(name, t.partials[name])
		}

		deepEqual(new can.Mustache({
				text: t.template
			})
			.render(t.data), t.expected);
	});

	test("Partials correctly set context", function () {
		var t = {
			template: "{{#users}}{{>partial}}{{/users}}",
			expected: "foo - bar",
			partials: {
				partial: '{{ name }} - {{ company }}'
			},
			data: {
				users: [{
					name: 'foo'
				}],
				company: 'bar'
			}
		};
		for (var name in t.partials) {
			can.view.registerView(name, t.partials[name])
		}

		deepEqual(new can.Mustache({
				text: t.template
			})
			.render(t.data), t.expected);
	});

	test("Handlebars helper: if/else", function () {
		var expected;
		var t = {
			template: "{{#if name}}{{name}}{{/if}}{{#if missing}} is missing!{{/if}}",
			expected: "Andy",
			data: {
				name: 'Andy',
				missing: undefined
			}
		};

		expected = t.expected.replace(/&quot;/g, '&#34;')
			.replace(/\r\n/g, '\n');
		deepEqual(new can.Mustache({
				text: t.template
			})
			.render(t.data), expected);

		t.data.missing = null;
		expected = t.expected.replace(/&quot;/g, '&#34;')
			.replace(/\r\n/g, '\n');
		deepEqual(new can.Mustache({
				text: t.template
			})
			.render(t.data), expected);
	});

	test("Handlebars helper: unless", function () {
		var t = {
			template: "{{#unless missing}}Andy is missing!{{/unless}}",
			expected: "Andy is missing!",
			data: {
				name: 'Andy'
			}
		};

		var expected = t.expected.replace(/&quot;/g, '&#34;')
			.replace(/\r\n/g, '\n');
		deepEqual(new can.Mustache({
				text: t.template
			})
			.render(t.data), expected);
	});

	test("Handlebars helper: each", function () {
		var t = {
			template: "{{#each names}}{{this}} {{/each}}",
			expected: "Andy Austin Justin ",
			data: {
				names: ['Andy', 'Austin', 'Justin']
			},
			data2: {
				names: new can.List(['Andy', 'Austin', 'Justin'])
			}
		};

		var expected = t.expected.replace(/&quot;/g, '&#34;')
			.replace(/\r\n/g, '\n');
		deepEqual(new can.Mustache({
				text: t.template
			})
			.render(t.data), expected);

		var div = document.createElement('div');
		div.appendChild(can.view.mustache(t.template)(t.data2));
		deepEqual(div.innerHTML, expected, 'Using Observe.List');
		t.data2.names.push('What');
	});

	test("Handlebars helper: with", function () {
		var t = {
			template: "{{#with person}}{{name}}{{/with}}",
			expected: "Andy",
			data: {
				person: {
					name: 'Andy'
				}
			}
		};

		var expected = t.expected.replace(/&quot;/g, '&#34;')
			.replace(/\r\n/g, '\n');
		deepEqual(new can.Mustache({
				text: t.template
			})
			.render(t.data), expected);
	});

	test("render with left bracket", function () {
		var compiled = new can.Mustache({
			text: this.squareBrackets,
			type: '['
		})
			.render({
				animals: this.animals
			})
		equal(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", "renders with bracket")
	})
	test("render with with", function () {
		var compiled = new can.Mustache({
			text: this.squareBracketsNoThis,
			type: '['
		})
			.render({
				animals: this.animals
			});
		equal(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", "renders bracket with no this")
	})
	test("default carrot", function () {
		var compiled = new can.Mustache({
			text: this.angleBracketsNoThis
		})
			.render({
				animals: this.animals
			});

		equal(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>")
	})
	test("render with double angle", function () {
		var text = "{{& replace_me }}{{{ replace_me_too }}}" +
			"<ul>{{#animals}}" +
			"<li>{{.}}</li>" +
			"{{/animals}}</ul>";
		var compiled = new can.Mustache({
			text: text
		})
			.render({
				animals: this.animals
			});
		equal(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>", "works")
	});

	test("comments", function () {
		var text = "{{! replace_me }}" +
			"<ul>{{#animals}}" +
			"<li>{{.}}</li>" +
			"{{/animals}}</ul>";
		var compiled = new can.Mustache({
			text: text
		})
			.render({
				animals: this.animals
			});
		equal(compiled, "<ul><li>sloth</li><li>bear</li><li>monkey</li></ul>")
	});

	test("multi line", function () {
		var text = "a \n b \n c",
			result = new can.Mustache({
				text: text
			})
				.render({});

		equal(result, text)
	})

	test("multi line elements", function () {
		var text = "<img\n class=\"{{myClass}}\" />",
			result = new can.Mustache({
				text: text
			})
				.render({
					myClass: 'a'
				});

		ok(result.indexOf("<img\n class=\"a\"") !== -1, "Multi-line elements render correctly.");
	})

	test("escapedContent", function () {
		var text = "<span>{{ tags }}</span><label>&amp;</label><strong>{{ number }}</strong><input value='{{ quotes }}'/>";
		var compiled = new can.Mustache({
			text: text
		})
			.render({
				tags: "foo < bar < car > zar > poo",
				quotes: "I use 'quote' fingers & &amp;ersands \"a lot\"",
				number: 123
			});

		var div = document.createElement('div');
		div.innerHTML = compiled;

		equal(div.getElementsByTagName('span')[0].firstChild.nodeValue, "foo < bar < car > zar > poo");
		equal(div.getElementsByTagName('strong')[0].firstChild.nodeValue, 123);
		equal(div.getElementsByTagName('input')[0].value, "I use 'quote' fingers & &amp;ersands \"a lot\"", "attributes are always safe, and strings are kept as-is without additional escaping");
		equal(div.getElementsByTagName('label')[0].innerHTML, "&amp;");
	})

	test("unescapedContent", function () {
		var text = "<span>{{{ tags }}}</span><div>{{{ tags }}}</div><input value='{{{ quotes }}}'/>";
		var compiled = new can.Mustache({
			text: text
		})
			.render({
				tags: "<strong>foo</strong><strong>bar</strong>",
				quotes: 'I use \'quote\' fingers "a lot"'
			});

		var div = document.createElement('div');
		div.innerHTML = compiled;

		equal(div.getElementsByTagName('span')[0].firstChild.nodeType, 1);
		equal(div.getElementsByTagName('div')[0].innerHTML.toLowerCase(), "<strong>foo</strong><strong>bar</strong>");
		equal(div.getElementsByTagName('span')[0].innerHTML.toLowerCase(), "<strong>foo</strong><strong>bar</strong>");
		equal(div.getElementsByTagName('input')[0].value, "I use 'quote' fingers \"a lot\"", "escaped no matter what");
	});

	/*
	 not really applicable...but could update to work oince complete
	 test("returning blocks", function(){
	 var somethingHelper = function(cb){
	 return cb([1,2,3,4])
	 }

	 var res = can.view.
	 render("//can/view/mustache/test_template.mustache",{
	 something: somethingHelper,
	 items: ['a','b']
	 });
	 // make sure expected values are in res
	 ok(/\s4\s/.test(res), "first block called" );
	 equal(res.match(/ItemsLength4/g).length, 4, "innerBlock and each")
	 }); */

	test("easy hookup", function () {
		var div = document.createElement('div');
		div.appendChild(can.view(can.test.path("view/mustache/test/easyhookup.mustache"), {
			text: "yes"
		}))

		ok(div.getElementsByTagName('div')[0].className.indexOf("yes") !== -1, "has yes")
	});

	test('multiple function hookups in a tag', function () {

		var text = "<span {{(el)-> can.data(can.$(el),'foo','bar')}}" +
			" {{(el)-> can.data(can.$(el),'baz','qux')}}>lorem ipsum</span>",
			compiled = new can.Mustache({
				text: text
			})
				.render(),
			div = document.createElement('div');

		div.appendChild(can.view.frag(compiled));
		var span = div.getElementsByTagName('span')[0];

		equal(can.data(can.$(span), 'foo'), 'bar', "first hookup");
		equal(can.data(can.$(span), 'baz'), 'qux', "second hookup");

	})

	/*
	 needs andy's helper logic
	 test("helpers", function() {
	 can.Mustache.Helpers.prototype.simpleHelper = function()
	 {
	 return 'Simple';
	 }

	 can.Mustache.Helpers.prototype.elementHelper = function()
	 {
	 return function(el) {
	 el.innerHTML = 'Simple';
	 }
	 }

	 var text = "<div>{{ simpleHelper() }}</div>";
	 var compiled = new can.Mustache({text: text}).render() ;
	 equal(compiled, "<div>Simple</div>");

	 text = "<div id=\"hookup\" {{ elementHelper() }}></div>";
	 compiled = new can.Mustache({text: text}).render() ;
	 can.append( can.$('#qunit-test-area'), can.view.frag(compiled));
	 equal(can.$('#hookup')[0].innerHTML, "Simple");
	 }); */

	test("attribute single unescaped, html single unescaped", function () {

		var text = "<div id='me' class='{{#task.completed}}complete{{/task.completed}}'>{{ task.name }}</div>";
		var task = new can.Map({
			name: 'dishes'
		})
		var compiled = new can.Mustache({
			text: text
		})
			.render({
				task: task
			});

		var div = document.createElement('div');

		div.appendChild(can.view.frag(compiled))

		equal(div.getElementsByTagName('div')[0].innerHTML, "dishes", "html correctly dishes")
		equal(div.getElementsByTagName('div')[0].className, "", "class empty")

		task.attr('name', 'lawn')

		equal(div.getElementsByTagName('div')[0].innerHTML, "lawn", "html correctly lawn")
		equal(div.getElementsByTagName('div')[0].className, "", "class empty")

		task.attr('completed', true);

		equal(div.getElementsByTagName('div')[0].className, "complete", "class changed to complete")
	});

	test("event binding / triggering on options", function () {
		var addEventListener = function (el, name, fn) {
			if (el.addEventListener) {
				el.addEventListener(name, fn, false);
			} else {
				el['on' + name] = fn;
			}
		};
		var frag = can.buildFragment("<select><option>a</option></select>", [document]);
		var qta = document.getElementById('qunit-test-area');
		qta.innerHTML = "";
		qta.appendChild(frag);

		/*qta.addEventListener("foo", function(){
		 ok(false, "event handler called")
		 },false)*/

		// destroyed events should not bubble
		addEventListener(qta.getElementsByTagName("option")[0], "foo", function (ev) {
			ok(true, "option called");
			if (ev.stopPropagation) {
				ev.stopPropagation();
			}
			//ev.cancelBubble = true;
		});

		addEventListener(qta.getElementsByTagName("select")[0], "foo", function () {
			ok(true, "select called")
		});

		var ev;
		if (document.createEvent) {
			ev = document.createEvent("HTMLEvents");
		} else {
			ev = document.createEventObject("HTMLEvents");
		}

		if (ev.initEvent) {
			ev.initEvent("foo", true, true);
		} else {
			ev.eventType = "foo";
		}

		if (qta.getElementsByTagName("option")[0].dispatchEvent) {
			qta.getElementsByTagName("option")[0].dispatchEvent(ev);
		} else {
			qta.getElementsByTagName("option")[0].onfoo(ev);
		}

		can.trigger(qta, "foo")

		stop();
		setTimeout(function () {
			start();
			ok(true);
		}, 100)
	})

	test("select live binding", function () {
		var text = "<select>{{ #todos }}<option>{{ name }}</option>{{ /todos }}</select>";
		var Todos, compiled, div;
		Todos = new can.List([{
			id: 1,
			name: 'Dishes'
		}]);
		compiled = new can.Mustache({
			text: text
		})
			.render({
				todos: Todos
			});
		div = document.createElement('div');

		div.appendChild(can.view.frag(compiled))
		equal(div.getElementsByTagName('option')
			.length, 1, '1 item in list')

		Todos.push({
			id: 2,
			name: 'Laundry'
		})
		equal(div.getElementsByTagName('option')
			.length, 2, '2 items in list')

		Todos.splice(0, 2);
		equal(div.getElementsByTagName('option')
			.length, 0, '0 items in list')
	});

	test('multiple hookups in a single attribute', function () {
		var text = '<div class=\'{{ obs.foo }}' +
			'{{ obs.bar }}{{ obs.baz }}{{ obs.nest.what }}\'></div>';

		var obs = new can.Map({
			foo: 'a',
			bar: 'b',
			baz: 'c',
			nest: new can.Map({
				what: 'd'
			})
		});

		var compiled = new can.Mustache({
			text: text
		})
			.render({
				obs: obs
			})

		var div = document.createElement('div');

		div.appendChild(can.view.frag(compiled));

		var innerDiv = div.childNodes[0];

		equal(getAttr(innerDiv, 'class'), "abcd", 'initial render');

		obs.attr('bar', 'e');

		equal(getAttr(innerDiv, 'class'), "aecd", 'initial render');

		obs.attr('bar', 'f');

		equal(getAttr(innerDiv, 'class'), "afcd", 'initial render');

		obs.nest.attr('what', 'g');

		equal(getAttr(innerDiv, 'class'), "afcg", 'nested observe');
	});

	test('adding and removing multiple html content within a single element', function () {

		var text, obs, compiled;

		text = '<div>{{ obs.a }}{{ obs.b }}{{ obs.c }}</div>';

		obs = new can.Map({
			a: 'a',
			b: 'b',
			c: 'c'
		});

		compiled = new can.Mustache({
			text: text
		})
			.render({
				obs: obs
			});

		var div = document.createElement('div');

		div.appendChild(can.view.frag(compiled));

		equal(div.childNodes[0].innerHTML, 'abc', 'initial render');

		obs.attr({
			a: '',
			b: '',
			c: ''
		});

		equal(div.childNodes[0].innerHTML, '', 'updated values');

		obs.attr({
			c: 'c'
		});

		equal(div.childNodes[0].innerHTML, 'c', 'updated values');
	});

	test('live binding and removeAttr', function () {

		var text = '{{ #obs.show }}' +
			'<p {{ obs.attributes }} class="{{ obs.className }}"><span>{{ obs.message }}</span></p>' +
			'{{ /obs.show }}',

			obs = new can.Map({
				show: true,
				className: 'myMessage',
				attributes: 'some=\"myText\"',
				message: 'Live long and prosper'
			}),

			compiled = new can.Mustache({
				text: text
			})
				.render({
					obs: obs
				}),

			div = document.createElement('div');

		div.appendChild(can.view.frag(compiled));

		var p = div.getElementsByTagName('p')[0],
			span = p.getElementsByTagName('span')[0];

		equal(p.getAttribute("some"), "myText", 'initial render attr');
		equal(getAttr(p, "class"), "myMessage", 'initial render class');
		equal(span.innerHTML, 'Live long and prosper', 'initial render innerHTML');

		obs.removeAttr('className');

		equal(getAttr(p, "class"), '', 'class is undefined');

		obs.attr('className', 'newClass');

		equal(getAttr(p, "class"), 'newClass', 'class updated');

		obs.removeAttr('attributes');

		equal(p.getAttribute('some'), null, 'attribute is undefined');

		obs.attr('attributes', 'some="newText"');

		equal(p.getAttribute('some'), 'newText', 'attribute updated');

		obs.removeAttr('message');

		equal(span.innerHTML, '', 'text node value is empty');

		obs.attr('message', 'Warp drive, Mr. Sulu');

		equal(span.innerHTML, 'Warp drive, Mr. Sulu', 'text node updated');

		obs.removeAttr('show');

		equal(div.innerHTML, '', 'value in block statement is undefined');

		obs.attr('show', true);

		p = div.getElementsByTagName('p')[0];
		span = p.getElementsByTagName('span')[0];

		equal(p.getAttribute("some"), "newText", 'value in block statement updated attr');
		equal(getAttr(p, "class"), "newClass", 'value in block statement updated class');
		equal(span.innerHTML, 'Warp drive, Mr. Sulu', 'value in block statement updated innerHTML');

	});

	test('hookup within a tag', function () {
		var text = '<div {{ obs.foo }} ' + '{{ obs.baz }}>lorem ipsum</div>',

			obs = new can.Map({
				foo: 'class="a"',
				baz: 'some=\'property\''
			}),

			compiled = new can.Mustache({
				text: text
			})
				.render({
					obs: obs
				});

		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		var anchor = div.getElementsByTagName('div')[0];

		equal(getAttr(anchor, 'class'), 'a');
		equal(anchor.getAttribute('some'), 'property');

		obs.attr('foo', 'class="b"');
		equal(getAttr(anchor, 'class'), 'b');
		equal(anchor.getAttribute('some'), 'property');

		obs.attr('baz', 'some=\'new property\'');
		equal(getAttr(anchor, 'class'), 'b');
		equal(anchor.getAttribute('some'), 'new property');

		obs.attr('foo', 'class=""');
		obs.attr('baz', '');
		equal(getAttr(anchor, 'class'), "", 'anchor class blank');
		equal(anchor.getAttribute('some'), undefined, 'attribute "some" is undefined');
	});

	test('single escaped tag, removeAttr', function () {
		var text = '<div {{ obs.foo }}>lorem ipsum</div>',

			obs = new can.Map({
				foo: 'data-bar="john doe\'s bar"'
			}),

			compiled = new can.Mustache({
				text: text
			})
				.render({
					obs: obs
				});

		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		var anchor = div.getElementsByTagName('div')[0];

		equal(anchor.getAttribute('data-bar'), "john doe's bar");

		obs.removeAttr('foo');
		equal(anchor.getAttribute('data-bar'), null);

		obs.attr('foo', 'data-bar="baz"');
		equal(anchor.getAttribute('data-bar'), 'baz');
	});

	test('html comments', function () {
		var text = '<!-- bind to changes in the todo list --> <div>{{obs.foo}}</div>';

		var obs = new can.Map({
			foo: 'foo'
		});

		var compiled = new can.Mustache({
			text: text
		})
			.render({
				obs: obs
			});

		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));
		equal(div.getElementsByTagName('div')[0].innerHTML, 'foo', 'Element as expected');
	})

	test("hookup and live binding", function () {

		var text = "<div class='{{ task.completed }}' {{ (el)-> can.data(can.$(el),'task',task) }}>" +
			"{{ task.name }}" +
			"</div>",
			task = new can.Map({
				completed: false,
				className: 'someTask',
				name: 'My Name'
			}),
			compiled = new can.Mustache({
				text: text
			})
				.render({
					task: task
				}),
			div = document.createElement('div');

		div.appendChild(can.view.frag(compiled))
		var child = div.getElementsByTagName('div')[0];
		ok(child.className.indexOf("false") > -1, "is incomplete")
		ok( !! can.data(can.$(child), 'task'), "has data")
		equal(child.innerHTML, "My Name", "has name")

		task.attr({
			completed: true,
			name: 'New Name'
		});

		ok(child.className.indexOf("true") !== -1, "is complete")
		equal(child.innerHTML, "New Name", "has new name")

	})

	test('multiple curly braces in a block', function () {
		var text = '{{^obs.items}}' +
			'<li>No items</li>' +
			'{{/obs.items}}' +
			'{{#obs.items}}' +
			'<li>{{name}}</li>' +
			'{{/obs.items}}',

			obs = new can.Map({
				items: []
			}),

			compiled = new can.Mustache({
				text: text
			})
				.render({
					obs: obs
				});

		var ul = document.createElement('ul');
		ul.appendChild(can.view.frag(compiled));

		equal(ul.getElementsByTagName('li')[0].innerHTML, 'No items', 'initial observable state');

		obs.attr('items', [{
			name: 'foo'
		}]);
		equal(ul.getElementsByTagName('li')[0].innerHTML, 'foo', 'updated observable');
	});

	test("unescape bindings change", function () {
		var l = new can.List([{
			complete: true
		}, {
			complete: false
		}, {
			complete: true
		}]);
		var completed = function () {
			l.attr('length');
			var num = 0;
			l.each(function (item) {
				if (item.attr('complete')) {
					num++;
				}
			})
			return num;
		};

		var text = '<div>{{ completed }}</div>',

			compiled = new can.Mustache({
				text: text
			})
				.render({
					completed: completed
				});

		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));

		var child = div.getElementsByTagName('div')[0];
		equal(child.innerHTML, "2", "at first there are 2 true bindings");
		var item = new can.Map({
			complete: true,
			id: "THIS ONE"
		})
		l.push(item);

		equal(child.innerHTML, "3", "now there are 3 complete");

		item.attr('complete', false);

		equal(child.innerHTML, "2", "now there are 2 complete");

		l.pop();

		item.attr('complete', true);

		equal(child.innerHTML, "2", "there are still 2 complete");
	});

	test("escape bindings change", function () {
		var l = new can.List([{
			complete: true
		}, {
			complete: false
		}, {
			complete: true
		}]);
		var completed = function () {
			l.attr('length');
			var num = 0;
			l.each(function (item) {
				if (item.attr('complete')) {
					num++;
				}
			})
			return num;
		};

		var text = '<div>{{{ completed }}}</div>',

			compiled = new can.Mustache({
				text: text
			})
				.render({
					completed: completed
				});

		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));

		var child = div.getElementsByTagName('div')[0];
		equal(child.innerHTML, "2", "at first there are 2 true bindings");
		var item = new can.Map({
			complete: true
		})
		l.push(item);

		equal(child.innerHTML, "3", "now there are 3 complete");

		item.attr('complete', false);

		equal(child.innerHTML, "2", "now there are 2 complete");
	});

	test("tag bindings change", function () {
		var l = new can.List([{
			complete: true
		}, {
			complete: false
		}, {
			complete: true
		}]);
		var completed = function () {
			l.attr('length');
			var num = 0;
			l.each(function (item) {
				if (item.attr('complete')) {
					num++;
				}
			})
			return "items='" + num + "'";
		};

		var text = '<div {{{ completed }}}></div>',

			compiled = new can.Mustache({
				text: text
			})
				.render({
					completed: completed
				});

		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));

		var child = div.getElementsByTagName('div')[0];
		equal(child.getAttribute("items"), "2", "at first there are 2 true bindings");
		var item = new can.Map({
			complete: true
		})
		l.push(item);

		equal(child.getAttribute("items"), "3", "now there are 3 complete");

		item.attr('complete', false);

		equal(child.getAttribute("items"), "2", "now there are 2 complete");
	})

	test("attribute value bindings change", function () {
		var l = new can.List([{
			complete: true
		}, {
			complete: false
		}, {
			complete: true
		}]);
		var completed = function () {
			l.attr('length');
			var num = 0;
			l.each(function (item) {
				if (item.attr('complete')) {
					num++;
				}
			})
			return num;
		};

		var text = '<div items="{{{ completed }}}"></div>',

			compiled = new can.Mustache({
				text: text
			})
				.render({
					completed: completed
				});

		var div = document.createElement('div');
		div.appendChild(can.view.frag(compiled));

		var child = div.getElementsByTagName('div')[0];
		equal(child.getAttribute("items"), "2", "at first there are 2 true bindings");
		var item = new can.Map({
			complete: true
		})
		l.push(item);

		equal(child.getAttribute("items"), "3", "now there are 3 complete");

		item.attr('complete', false);

		equal(child.getAttribute("items"), "2", "now there are 2 complete");
	})

	test("in tag toggling", function () {
		var text = "<div {{ obs.val }}></div>"

		var obs = new can.Map({
			val: 'foo="bar"'
		})

		var compiled = new can.Mustache({
			text: text
		})
			.render({
				obs: obs
			});

		var div = document.createElement('div');

		div.appendChild(can.view.frag(compiled));

		obs.attr('val', "bar='foo'");
		obs.attr('val', 'foo="bar"')
		var d2 = div.getElementsByTagName('div')[0];
		// toUpperCase added to normalize cases for IE8
		equal(d2.getAttribute("foo"), "bar", "bar set");
		equal(d2.getAttribute("bar"), null, "bar set")
	});

	// not sure about this w/ mustache
	test("nested properties", function () {

		var text = "<div>{{ obs.name.first }}</div>"

		var obs = new can.Map({
			name: {
				first: "Justin"
			}
		})

		var compiled = new can.Mustache({
			text: text
		})
			.render({
				obs: obs
			});

		var div = document.createElement('div');

		div.appendChild(can.view.frag(compiled));

		div = div.getElementsByTagName('div')[0];

		equal(div.innerHTML, "Justin")

		obs.attr('name.first', "Brian")

		equal(div.innerHTML, "Brian")

	});

	test("tags without chidren or ending with /> do not change the state", function () {

		var text = "<table><tr><td/>{{{ obs.content }}}</tr></div>"
		var obs = new can.Map({
			content: "<td>Justin</td>"
		})
		var compiled = new can.Mustache({
			text: text
		})
			.render({
				obs: obs
			});
		var div = document.createElement('div');
		var html = can.view.frag(compiled);
		div.appendChild(html);

		equal(div.getElementsByTagName('span')
			.length, 0, "there are no spans");
		equal(div.getElementsByTagName('td')
			.length, 2, "there are 2 td");
	})

	test("nested live bindings", function () {
		expect(0);

		var items = new can.List([{
			title: 0,
			is_done: false,
			id: 0
		}]);

		var div = document.createElement('div');

		var template = can.view.mustache('<form>{{#items}}{{^is_done}}<div id="{{title}}"></div>{{/is_done}}{{/items}}</form>')

		div.appendChild(template({
			items: items
		}));

		items.push({
			title: 1,
			is_done: false,
			id: 1
		});
		// this will throw an error unless Mustache protects against
		// nested objects
		items[0].attr('is_done', true);
	});

	test("list nested in observe live bindings", function () {
		can.view.mustache("list-test", "<ul>{{#data.items}}<li>{{name}}</li>{{/data.items}}</ul>");
		var data = new can.Map({
			items: [{
				name: "Brian"
			}, {
				name: "Fara"
			}]
		});
		var div = document.createElement('div');
		div.appendChild(can.view("list-test", {
			data: data
		}));
		data.items.push(new can.Map({
			name: "Scott"
		}))
		ok(/Brian/.test(div.innerHTML), "added first name")
		ok(/Fara/.test(div.innerHTML), "added 2nd name")
		ok(/Scott/.test(div.innerHTML), "added name after push")
	});

	test("trailing text", function () {
		can.view.mustache("count", "There are {{ length }} todos")
		var div = document.createElement('div');
		div.appendChild(can.view("count", new can.List([{}, {}])));
		ok(/There are 2 todos/.test(div.innerHTML), "got all text")
	})

	test("recursive views", function () {

		var data = new can.List([{
			label: 'branch1',
			children: [{
				id: 2,
				label: 'branch2'
			}]
		}])

		var div = document.createElement('div');
		div.appendChild(can.view(can.test.path('view/mustache/test/recursive.mustache'), {
			items: data
		}));
		ok(/class="?leaf"?/.test(div.innerHTML), "we have a leaf")

	})

	test("live binding textarea", function () {
		can.view.mustache("textarea-test", "<textarea>Before{{ obs.middle }}After</textarea>");

		var obs = new can.Map({
			middle: "yes"
		}),
			div = document.createElement('div');

		div.appendChild(can.view("textarea-test", {
			obs: obs
		}))
		var textarea = div.firstChild

		equal(textarea.value, "BeforeyesAfter");

		obs.attr("middle", "Middle")
		equal(textarea.value, "BeforeMiddleAfter")

	})

	test("reading a property from a parent object when the current context is an observe", function () {
		can.view.mustache("parent-object", "{{#foos}}<span>{{bar}}</span>{{/foos}}")
		var data = {
			foos: new can.List([{
				name: "hi"
			}, {
				name: 'bye'
			}]),
			bar: "Hello World"
		}

		var div = document.createElement('div');
		var res = can.view("parent-object", data);
		div.appendChild(res);
		var spans = div.getElementsByTagName('span');

		equal(spans.length, 2, 'Got two <span> elements');
		equal(spans[0].innerHTML, 'Hello World', 'First span Hello World');
		equal(spans[1].innerHTML, 'Hello World', 'Second span Hello World');
	})

	test("helper parameters don't convert functions", function () {
		can.Mustache.registerHelper('helperWithFn', function (fn) {
			ok(can.isFunction(fn), 'Parameter is a function');
			equal(fn(), 'Hit me!', 'Got the expected function');
		});

		var renderer = can.view.mustache('{{helperWithFn test}}');
		renderer({
			test: function () {
				return 'Hit me!';
			}
		});
	})

	test("computes as helper parameters don't get converted", function () {
		can.Mustache.registerHelper('computeTest', function (no) {
			equal(no(), 5, 'Got computed calue');
			ok(no.isComputed, 'no is still a compute')
		});

		var renderer = can.view.mustache('{{computeTest test}}');
		renderer({
			test: can.compute(5)
		});
	})

	test("computes are supported in default helpers", function () {

		var staches = {
			"if": "{{#if test}}if{{else}}else{{/if}}",
			"not_if": "not_{{^if test}}not{{/if}}if",
			"each": "{{#each test}}{{.}}{{/each}}",
			"with": "wit{{#with test}}<span>{{3}}</span>{{/with}}"
		};

		can.view.mustache("count", "There are {{ length }} todos")
		var div = document.createElement('div');
		div.appendChild(can.view("count", new can.List([{}, {}])));
		ok(/There are 2 todos/.test(div.innerHTML), "got all text")

		var renderer, result, data, actual, span;

		for (result in staches) {
			renderer = can.view.mustache("compute_" + result, staches[result]);
			data = ["e", "a", "c", "h"];
			div = document.createElement("div");
			actual = can.view("compute_" + result, {
				test: can.compute(data)
			});
			div.appendChild(actual);
			span = div.getElementsByTagName("span")[0];
			if (span && span.firstChild) {
				div.replaceChild(span.firstChild, span);
			}
			actual = div.innerHTML;

			equal(actual, result, "can.compute resolved for helper " + result);
		}

		var inv_staches = {
			"else": "{{#if test}}if{{else}}else{{/if}}",
			"not_not_if": "not_{{^if test}}not_{{/if}}if",
			"not_each": "not_{{#each test}}_{{/each}}each",
			"not_with": "not{{#with test}}_{{/with}}_with"
		};

		for (result in inv_staches) {
			renderer = can.view.mustache("compute_" + result, inv_staches[result]);
			data = null;
			div = document.createElement("div");
			actual = can.view("compute_" + result, {
				test: can.compute(data)
			});
			div.appendChild(actual);
			actual = div.innerHTML;

			equal(actual, result, "can.compute resolved for helper " + result);
		}

	});

	test("Rendering models in tables produces different results than an equivalent observe (#202)", 2, function () {
		var renderer = can.view.mustache('<table>{{#stuff}}<tbody>{{#rows}}<tr></tr>{{/rows}}</tbody>{{/stuff}}</table>');
		var div = document.createElement('div');
		var dom = renderer({
			stuff: new can.Map({
				rows: [{
					name: 'first'
				}]
			})
		});
		div.appendChild(dom);
		var elements = div.getElementsByTagName('tbody');
		equal(elements.length, 1, 'Only one <tbody> rendered');

		div = document.createElement('div');
		dom = renderer({
			stuff: new can.Model({
				rows: [{
					name: 'first'
				}]
			})
		});
		div.appendChild(dom);
		elements = div.getElementsByTagName('tbody');
		equal(elements.length, 1, 'Only one <tbody> rendered');
	})

	//Issue 233
	test("multiple tbodies in table hookup", function () {
		var text = "<table>" +
			"{{#people}}" +
			"<tbody><tr><td>{{name}}</td></tr></tbody>" +
			"{{/people}}" +
			"</table>",
			people = new can.List([{
				name: "Steve"
			}, {
				name: "Doug"
			}]),
			compiled = new can.Mustache({
				text: text
			})
				.render({
					people: people
				});

		can.append(can.$('#qunit-test-area'), can.view.frag(compiled));
		equal(can.$('#qunit-test-area table tbody')
			.length, 2, "two tbodies");
	})

	// http://forum.javascriptmvc.com/topic/live-binding-on-mustache-template-does-not-seem-to-be-working-with-nested-properties
	test("Observe with array attributes", function () {
		var renderer = can.view.mustache('<ul>{{#todos}}<li>{{.}}</li>{{/todos}}</ul><div>{{message}}</div>');
		var div = document.createElement('div');
		var data = new can.Map({
			todos: ['Line #1', 'Line #2', 'Line #3'],
			message: 'Hello',
			count: 2
		});
		div.appendChild(renderer(data));

		equal(div.getElementsByTagName('li')[1].innerHTML, 'Line #2', 'Check initial array');
		equal(div.getElementsByTagName('div')[0].innerHTML, 'Hello', 'Check initial message');

		data.attr('todos.1', 'Line #2 changed');
		data.attr('message', 'Hello again');

		equal(div.getElementsByTagName('li')[1].innerHTML, 'Line #2 changed', 'Check updated array');
		equal(div.getElementsByTagName('div')[0].innerHTML, 'Hello again', 'Check updated message');
	})

	test("Observe list returned from the function", function () {
		var renderer = can.view.mustache('<ul>{{#todos}}<li>{{.}}</li>{{/todos}}</ul>');
		var div = document.createElement('div');
		var todos = new can.List();
		var data = {
			todos: function () {
				return todos;
			}
		};
		div.appendChild(renderer(data));

		todos.push("Todo #1")

		equal(div.getElementsByTagName('li')
			.length, 1, 'Todo is successfuly created');
		equal(div.getElementsByTagName('li')[0].innerHTML, 'Todo #1', 'Pushing to the list works');
	});

	// https://github.com/canjs/canjs/issues/228
	test("Contexts within helpers not always resolved correctly", function () {
		can.Mustache.registerHelper("bad_context", function (context, options) {
			return "<span>" + this.text + "</span> should not be " + options.fn(context);
		});

		var renderer = can.view.mustache('{{#bad_context next_level}}<span>{{text}}</span><br/><span>{{other_text}}</span>{{/bad_context}}'),
			data = {
				next_level: {
					text: "bar",
					other_text: "In the inner context"
				},
				text: "foo"
			},
			div = document.createElement('div');

		div.appendChild(renderer(data));
		equal(div.getElementsByTagName('span')[0].innerHTML, "foo", 'Incorrect context passed to helper');
		equal(div.getElementsByTagName('span')[1].innerHTML, "bar", 'Incorrect text in helper inner template');
		equal(div.getElementsByTagName('span')[2].innerHTML, "In the inner context", 'Incorrect other_text in helper inner template');
	});

	// https://github.com/canjs/canjs/issues/227
	test("Contexts are not always passed to partials properly", function () {
		can.view.registerView('inner', '{{#if other_first_level}}{{other_first_level}}{{else}}{{second_level}}{{/if}}')

		var renderer = can.view.mustache('{{#first_level}}<span>{{> inner}}</span> should equal <span>{{other_first_level}}</span>{{/first_level}}'),
			data = {
				first_level: {
					second_level: "bar"
				},
				other_first_level: "foo"
			},
			div = document.createElement('div');

		div.appendChild(renderer(data));
		equal(div.getElementsByTagName('span')[0].innerHTML, "foo", 'Incorrect context passed to helper');
		equal(div.getElementsByTagName('span')[1].innerHTML, "foo", 'Incorrect text in helper inner template');
	});

	// https://github.com/canjs/canjs/issues/231
	test("Functions and helpers should be passed the same context", function () {
		can.Mustache.registerHelper("to_upper", function (fn, options) {
			if (!fn.fn) {
				return typeof fn === "function" ? fn()
					.toString()
					.toUpperCase() : fn.toString()
					.toUpperCase();
			} else {
				//fn is options
				return can.trim(fn.fn(this))
					.toString()
					.toUpperCase();
			}
		});

		var renderer = can.view.mustache('"{{next_level.text}}" uppercased should be "<span>{{to_upper next_level.text}}</span>"<br/>"{{next_level.text}}" uppercased with a workaround is "<span>{{#to_upper}}{{next_level.text}}{{/to_upper}}</span>"'),
			data = {
				next_level: {
					text: function () {
						return this.other_text;
					},
					other_text: "In the inner context"
				}
			},
			div = document.createElement('div');
		window.other_text = 'Window context';

		div.appendChild(renderer(data));
		equal(div.getElementsByTagName('span')[0].innerHTML, data.next_level.other_text.toUpperCase(), 'Incorrect context passed to function');
		equal(div.getElementsByTagName('span')[1].innerHTML, data.next_level.other_text.toUpperCase(), 'Incorrect context passed to helper');
	});

	// https://github.com/canjs/canjs/issues/153
	test("Interpolated values when iterating through an Observe.List should still render when not surrounded by a DOM node", function () {
		var renderer = can.view.mustache('{{ #todos }}{{ name }}{{ /todos }}'),
			renderer2 = can.view.mustache('{{ #todos }}<span>{{ name }}</span>{{ /todos }}'),
			todos = [{
				id: 1,
				name: 'Dishes'
			}, {
				id: 2,
				name: 'Forks'
			}],
			liveData = {
				todos: new can.List(todos)
			},
			plainData = {
				todos: todos
			},
			div = document.createElement('div');

		div.appendChild(renderer2(plainData));

		equal(div.getElementsByTagName('span')[0].innerHTML, "Dishes", 'Array item rendered with DOM container');
		equal(div.getElementsByTagName('span')[1].innerHTML, "Forks", 'Array item rendered with DOM container');

		div.innerHTML = '';
		div.appendChild(renderer2(liveData));

		equal(div.getElementsByTagName('span')[0].innerHTML, "Dishes", 'List item rendered with DOM container');
		equal(div.getElementsByTagName('span')[1].innerHTML, "Forks", 'List item rendered with DOM container');

		div.innerHTML = '';

		div.appendChild(renderer(plainData));
		equal(div.innerHTML, "DishesForks", 'Array item rendered without DOM container');

		div.innerHTML = '';

		div.appendChild(renderer(liveData));
		equal(div.innerHTML, "DishesForks", 'List item rendered without DOM container');

		liveData.todos.push({
			id: 3,
			name: 'Knives'
		});
		equal(div.innerHTML, "DishesForksKnives", 'New list item rendered without DOM container');
	});

	test("objects with a 'key' or 'index' property should work in helpers", function () {
		var renderer = can.view.mustache('{{ #obj }}{{ show_name }}{{ /obj }}'),
			div = document.createElement('div');

		div.appendChild(renderer({
			obj: {
				id: 2,
				name: 'Forks',
				key: 'bar'
			}
		}, {
			show_name: function () {
				return this.name;
			}
		}));
		equal(div.innerHTML, "Forks", 'item name rendered');

		div.innerHTML = '';

		div.appendChild(renderer({
			obj: {
				id: 2,
				name: 'Forks',
				index: 'bar'
			}
		}, {
			show_name: function () {
				return this.name;
			}
		}));
		equal(div.innerHTML, "Forks", 'item name rendered');
	});

	test("2 way binding helpers", function () {

		var Value = function (el, value) {
			this.updateElement = function (ev, newVal) {
				el.value = newVal || "";
			};
			value.bind("change", this.updateElement);
			el.onchange = function () {
				value(el.value)
			}
			this.teardown = function () {
				value.unbind("change", this.updateElement);
				el.onchange = null;
			}
			el.value = value() || "";
		}
		var val;
		can.Mustache.registerHelper('value', function (value) {
			return function (el) {
				val = new Value(el, value);
			}
		});

		var renderer = can.view.mustache('<input {{value user.name}}/>');

		var div = document.createElement('div'),
			u = new can.Map({
				name: "Justin"
			});

		div.appendChild(renderer({
			user: u
		}));

		var input = div.getElementsByTagName('input')[0];

		equal(input.value, "Justin", "Name is set correctly")

		u.attr('name', 'Eli')

		equal(input.value, "Eli", "Changing observe updates value");

		input.value = "Austin";
		input.onchange();

		equal(u.attr('name'), "Austin", "Name changed by input field");

		val.teardown();

		// name is undefined
		renderer = can.view.mustache('<input {{value user.name}}/>');
		div = document.createElement('div');
		u = new can.Map({});
		div.appendChild(renderer({
			user: u
		}));
		input = div.getElementsByTagName('input')[0];

		equal(input.value, "", "Name is set correctly")

		u.attr('name', 'Eli')

		equal(input.value, "Eli", "Changing observe updates value");

		input.value = "Austin";
		input.onchange();
		equal(u.attr('name'), "Austin", "Name changed by input field");
		val.teardown();

		// name is null
		renderer = can.view.mustache('<input {{value user.name}}/>');
		div = document.createElement('div');
		u = new can.Map({
			name: null
		});
		div.appendChild(renderer({
			user: u
		}));
		input = div.getElementsByTagName('input')[0];

		equal(input.value, "", "Name is set correctly with null")

		u.attr('name', 'Eli')

		equal(input.value, "Eli", "Changing observe updates value");

		input.value = "Austin";
		input.onchange();
		equal(u.attr('name'), "Austin", "Name changed by input field");
		val.teardown();

	});

	test("can pass in partials", function () {
		var hello = can.view(can.test.path('view/mustache/test/hello.mustache'));
		var fancyName = can.view(can.test.path('view/mustache/test/fancy_name.mustache'));
		var result = hello.render({
			name: "World"
		}, {
			partials: {
				name: fancyName
			}
		});

		ok(/World/.test(result.toString()), "Hello World worked");
	});

	test("can pass in helpers", function () {
		var helpers = can.view(can.test.path('view/mustache/test/helper.mustache'));
		var result = helpers.render({
			name: "world"
		}, {
			helpers: {
				cap: function (name) {
					return can.capitalize(name);
				}
			}
		});

		ok(/World/.test(result.toString()), "Hello World worked");
	});

	test("HTML comment with helper", function () {
		var text = ["<ul>",
			"{{#todos}}",
			"<li {{data 'todo'}}>",
			"<!-- html comment #1 -->",
			"{{name}}",
			"<!-- html comment #2 -->",
			"</li>",
			"{{/todos}}",
			"</ul>"
		],
			Todos = new can.List([{
				id: 1,
				name: "Dishes"
			}]),
			compiled = new can.Mustache({
				text: text.join("\n")
			})
				.render({
					todos: Todos
				}),
			div = document.createElement("div"),
			li;

		var comments = function (el) {
			var count = 0;
			for (var i = 0; i < el.childNodes.length; i++) {
				if (el.childNodes[i].nodeType === 8) {
					++count;
				}
			}
			return count;
		};

		div.appendChild(can.view.frag(compiled));
		li = div.getElementsByTagName("ul")[0].getElementsByTagName("li");
		equal(li.length, 1, "1 item in list");
		equal(comments(li[0]), 2, "2 comments in item #1");

		Todos.push({
			id: 2,
			name: "Laundry"
		});
		equal(li.length, 2, "2 items in list");
		equal(comments(li[0]), 2, "2 comments in item #1");
		equal(comments(li[1]), 2, "2 comments in item #2");

		Todos.splice(0, 2);
		equal(li.length, 0, "0 items in list");
	});

	test("correctness of data-view-id and only in tag opening", function () {
		var text = ["<textarea><select>{{#items}}",
			"<option{{data 'item'}}>{{title}}</option>",
			"{{/items}}</select></textarea>"
		],
			items = [{
				id: 1,
				title: "One"
			}, {
				id: 2,
				title: "Two"
			}],
			compiled = new can.Mustache({
				text: text.join("")
			})
				.render({
					items: items
				}),
			expected = "^<textarea data-view-id='[0-9]+'><select><option data-view-id='[0-9]+'>One</option>" +
				"<option data-view-id='[0-9]+'>Two</option></select></textarea>$";

		ok(compiled.search(expected) === 0, "Rendered output is as expected");
	});

	test("Empty strings in arrays within Observes that are iterated should return blank strings", function () {
		var data = new can.Map({
			colors: ["", 'red', 'green', 'blue']
		}),
			compiled = new can.Mustache({
				text: "<select>{{#colors}}<option>{{.}}</option>{{/colors}}</select>"
			})
				.render(data),
			div = document.createElement('div');

		div.appendChild(can.view.frag(compiled));
		equal(div.getElementsByTagName('option')[0].innerHTML, "", "Blank string should return blank");
	});

	test("Null properties do not throw errors in Mustache.get", function () {
		var renderer = can.view.mustache("Foo bar {{#foo.bar}}exists{{/foo.bar}}{{^foo.bar}}does not exist{{/foo.bar}}"),
			div = document.createElement('div'),
			div2 = document.createElement('div'),
			frag, frag2;

		try {
			frag = renderer(new can.Map({
				foo: null
			}))
		} catch (e) {
			ok(false, "rendering with null threw an error");
		}
		frag2 = renderer(new can.Map({
			foo: {
				bar: "baz"
			}
		}))
		div.appendChild(frag);
		div2.appendChild(frag2);
		equal(div.innerHTML, "Foo bar does not exist");
		equal(div2.innerHTML, "Foo bar exists");
	});

	// Issue #288
	test("Data helper should set proper data instead of a context stack", function () {
		var partials = {
			'nested_data': '<span id="has_data" {{data "attr"}}></span>',
			'nested_data2': '{{#this}}<span id="has_data" {{data "attr"}}></span>{{/this}}',
			'nested_data3': '{{#bar}}<span id="has_data" {{data "attr"}}></span>{{/bar}}'
		};
		for (var name in partials) {
			can.view.registerView(name, partials[name])
		}

		var renderer = can.view.mustache("{{#bar}}{{> #nested_data}}{{/bar}}"),
			renderer2 = can.view.mustache("{{#bar}}{{> #nested_data2}}{{/bar}}"),
			renderer3 = can.view.mustache("{{#bar}}{{> #nested_data3}}{{/bar}}"),
			div = document.createElement('div'),
			data = new can.Map({
				foo: "bar",
				bar: new can.Map({})
			}),
			span;

		div.innerHTML = '';
		div.appendChild(renderer(data));
		span = can.$(div.getElementsByTagName('span')[0]);
		strictEqual(can.data(span, 'attr'), data.bar, 'Nested data 1 should have correct data');

		div.innerHTML = '';
		div.appendChild(renderer2(data));
		span = can.$(div.getElementsByTagName('span')[0]);
		strictEqual(can.data(span, 'attr'), data.bar, 'Nested data 2 should have correct data');

		div.innerHTML = '';
		div.appendChild(renderer3(data));
		span = can.$(div.getElementsByTagName('span')[0]);
		strictEqual(can.data(span, 'attr'), data.bar, 'Nested data 3 should have correct data');
	});

	// Issue #333
	test("Functions passed to default helpers should be evaluated", function () {
		var renderer = can.view.mustache("{{#if hasDucks}}Ducks: {{ducks}}{{else}}No ducks!{{/if}}"),
			div = document.createElement('div'),
			data = new can.Map({
				ducks: "",
				hasDucks: function () {
					return this.attr("ducks")
						.length > 0;
				}
			});

		var span;

		div.innerHTML = '';
		div.appendChild(renderer(data));
		span = can.$(div.getElementsByTagName('span')[0]);
		equal(div.innerHTML, 'No ducks!', 'The function evaluated should evaluate false');
	});

	test("Helpers always have priority (#258)", function () {
		can.Mustache.registerHelper('callMe', function (arg) {
			return arg + ' called me!';
		});

		var t = {
			template: "<div>{{callMe 'Tester'}}</div>",
			expected: "<div>Tester called me!</div>",
			data: {
				callMe: function (arg) {
					return arg + ' hanging up!';
				}
			}
		};

		var expected = t.expected.replace(/&quot;/g, '&#34;')
			.replace(/\r\n/g, '\n');
		deepEqual(new can.Mustache({
				text: t.template
			})
			.render(t.data), expected);
	});

	if (typeof steal !== 'undefined') {
		test("avoid global helpers", function () {
			stop();
			steal('view/mustache/test/noglobals.mustache', function (noglobals) {
				var div = document.createElement('div'),
					div2 = document.createElement('div');
				var person = new can.Map({
					name: "Brian"
				});
				var result = noglobals({
					person: person
				}, {
					sometext: function (name) {
						return "Mr. " + name()
					}
				});
				var result2 = noglobals({
					person: person
				}, {
					sometext: function (name) {
						return name() + " rules"
					}
				});
				div.appendChild(result);
				div2.appendChild(result2);

				person.attr("name", "Ajax")

				equal(div.innerHTML, "Mr. Ajax");
				equal(div2.innerHTML, "Ajax rules");
				start();
			});
		});
	}

	test("Each does not redraw items", function () {

		var animals = new can.List(['sloth', 'bear']),
			renderer = can.view.mustache("<div>my<b>favorite</b>animals:{{#each animals}}<label>Animal=</label> <span>{{this}}</span>{{/}}!</div>");

		var div = document.createElement('div')

		var frag = renderer({
			animals: animals
		});
		div.appendChild(frag)

		div.getElementsByTagName('label')[0].myexpando = "EXPANDO-ED";

		//animals.push("dog")
		equal(div.getElementsByTagName('label')
			.length, 2, "There are 2 labels")

		animals.push("turtle")

		equal(div.getElementsByTagName('label')[0].myexpando, "EXPANDO-ED", "same expando");

		equal(div.getElementsByTagName('span')[2].innerHTML, "turtle", "turtle added");

	});

	test("Each works with the empty list", function () {

		var animals = new can.List([]),
			renderer = can.view.mustache("<div>my<b>favorite</b>animals:{{#each animals}}<label>Animal=</label> <span>{{this}}</span>{{/}}!</div>");

		var div = document.createElement('div')

		var frag = renderer({
			animals: animals
		});
		div.appendChild(frag)

		animals.push('sloth', 'bear')

		//animals.push("dog")
		equal(div.getElementsByTagName('label')
			.length, 2, "There are 2 labels")

		animals.push("turtle")

		equal(div.getElementsByTagName('span')[2].innerHTML, "turtle", "turtle added");

	});

	test("each works within another branch", function () {
		var animals = new can.List([]),
			template = "<div>Animals:" +
				"{{#if animals.length}}~" +
				"{{#each animals}}" +
				"<span>{{.}}</span>" +
				"{{/each}}" +
				"{{else}}" +
				"No animals" +
				"{{/if}}" +
				"!</div>";

		var renderer = can.view.mustache(template)

		var div = document.createElement('div');

		var frag = renderer({
			animals: animals
		});
		div.appendChild(frag)

		equal(div.getElementsByTagName('div')[0].innerHTML, "Animals:No animals!");
		animals.push('sloth');

		equal(div.getElementsByTagName('span')
			.length, 1, "There is 1 sloth");
		animals.pop();

		equal(div.getElementsByTagName('div')[0].innerHTML, "Animals:No animals!");
	});

	test("a compute gets passed to a plugin", function () {

		can.Mustache.registerHelper('iamhungryforcomputes', function (value) {
			ok(value.isComputed, "value is a compute")
			return function (el) {

			}
		});

		var renderer = can.view.mustache('<input {{iamhungryforcomputes userName}}/>');

		var div = document.createElement('div'),
			u = new can.Map({
				name: "Justin"
			});

		div.appendChild(renderer({
			userName: u.compute("name")
		}));

	});

	test("Object references can escape periods for key names containing periods", function () {
		var template = can.view.mustache("{{#foo.bar}}" +
			"{{some\\\\.key\\\\.name}} {{some\\\\.other\\\\.key.with\\\\.more}}" +
			"{{/foo.bar}}"),
			data = {
				foo: {
					bar: [{
						"some.key.name": 100,
						"some.other.key": {
							"with.more": "values"
						}
					}]
				}
			};

		var div = document.createElement('div');
		div.appendChild(template(data))

		equal(div.innerHTML, "100 values");
	})

	test("Computes should be resolved prior to accessing attributes", function () {
		var template = can.view.mustache("{{list.length}}"),
			data = {
				list: can.compute(new can.List())
			};

		var div = document.createElement('div');
		div.appendChild(template(data))

		equal(div.innerHTML, "0");
	})

	test("Helpers can be passed . or this for the active context", function () {
		can.Mustache.registerHelper('rsvp', function (attendee, event) {
			return attendee.name + ' is attending ' + event.name;
		});
		var template = can.view.mustache("{{#attendee}}{{#events}}<div>{{rsvp attendee .}}</div>{{/events}}{{/#attendee}}"),
			data = {
				attendee: {
					name: 'Justin'
				},
				events: [{
					name: 'Reception'
				}, {
					name: 'Wedding'
				}]
			};

		var div = document.createElement('div');
		div.appendChild(template(data));
		var children = div.getElementsByTagName('div');

		equal(children[0].innerHTML, 'Justin is attending Reception');
		equal(children[1].innerHTML, 'Justin is attending Wedding');
	});

	test("helpers only called once (#477)", function () {

		var callCount = 0;

		Mustache.registerHelper("foo", function (text) {
			callCount++;
			equal(callCount, 1, "call count is only ever one")
			return "result";
		});

		var obs = new can.Map({
			quux: false
		});

		var template = can.view.mustache("Foo text is: {{#if quux}}{{foo 'bar'}}{{/if}}");

		template(obs);

		obs.attr("quux", true);

	});

	test("helpers between tags (#469)", function () {

		can.Mustache.registerHelper("items", function () {
			return function (li) {
				equal(li.nodeName.toLowerCase(), "li", "right node name")
			}
		});

		var template = can.view.mustache("<ul>{{items}}</ul>");
		template();
	})

	test("hiding image srcs (#157)", function () {
		var template = can.view.mustache('<img {{#image}}src="{{.}}"{{/image}} alt="An image" />'),
			data = new can.Map({
				image: null
			}),
			url = "http://canjs.us/scripts/static/img/canjs_logo_yellow_small.png";

		var frag = template(data),
			img = frag.childNodes[0];

		equal(img.src, "", "there is no src");

		data.attr("image", url)
		notEqual(img.src, "", 'Image should have src')
		equal(img.src, url, "images src is correct");

		/*var renderer = can.view.mustache('<img {{#image}}src="{{.}}"{{/image}} alt="An image" />{{image}}'),
		 url = 'http://farm8.staticflickr.com/7102/6999583228_99302b91ac_n.jpg',
		 data = new can.Map({
		 user: 'Tina Fey',
		 messages: 0
		 }),
		 div = document.createElement('div');

		 div.appendChild(renderer(data));

		 var img = div.getElementsByTagName('img')[0];
		 equal(img.src, "", 'Image should not have src');

		 data.attr('messages', 5);
		 data.attr('image', url);
		 notEqual(img.src, "", 'Image should have src');
		 equal(img.src, url, 'Image should have src URL');*/
	});

	test("live binding in a truthy section", function () {
		var template = can.view.mustache('<div {{#width}}width="{{.}}"{{/width}}></div>'),
			data = new can.Map({
				width: '100'
			});

		var frag = template(data),
			img = frag.childNodes[0];

		equal(img.getAttribute("width"), "100", "initial width is correct");

		data.attr("width", "300")
		equal(img.getAttribute('width'), "300", "updated width is correct");

	});

	test("backtracks in mustache (#163)", function () {

		var template = can.view.mustache(
			"{{#grid.rows}}" +
			"{{#grid.cols}}" +
			"<div>{{columnData ../. .}}</div>" +
			"{{/grid.cols}}" +
			"{{/grid.rows}}");

		var grid = new can.Map({
			rows: [{
				first: "Justin",
				last: "Meyer"
			}, {
				first: "Brian",
				last: "Moschel"
			}],
			cols: [{
				prop: "first"
			}, {
				prop: "last"
			}]
		})

		var frag = template({
			grid: grid
		}, {
			columnData: function (row, col) {
				return row.attr(col.attr("prop"))
			}
		});

		var divs = frag.childNodes;
		equal(divs.length, 4, "there are 4 divs");

		var vals = can.map(divs, function (div) {
			return div.innerHTML
		});

		deepEqual(vals, ["Justin", "Meyer", "Brian", "Moschel"], "div values are the same");

	})

	test("support null and undefined as an argument", function () {

		var template = can.view.mustache("{{aHelper null undefined}}")

		template({}, {
			aHelper: function (arg1, arg2) {
				ok(arg1 === null);
				ok(arg2 === undefined)
			}
		});
	});

	test("passing can.List to helper (#438)", function () {
		var renderer = can.view.mustache('<ul><li {{helper438 observeList}}>observeList broken</li>' +
			'<li {{helper438 array}}>plain arrays work</li></ul>')

		can.Mustache.registerHelper('helper438', function (classnames) {
			return function (el) {
				el.innerHTML = 'Helper called';
			};
		});

		var frag = renderer({
			observeList: new can.List([{
				test: 'first'
			}, {
				test: 'second'
			}]),
			array: [{
				test: 'first'
			}, {
				test: 'second'
			}]
		});
		var div = document.createElement('div');

		div.appendChild(frag);

		var ul = div.children[0];

		equal(ul.children[0].innerHTML, 'Helper called', 'Helper called');
		equal(ul.children[1].innerHTML, 'Helper called', 'Helper called');
	});

	test("hiding image srcs (#494)", function () {
		var template = can.view.mustache('<img src="{{image}}"/>'),
			data = new can.Map({
				image: ""
			}),
			url = "http://canjs.us/scripts/static/img/canjs_logo_yellow_small.png";

		var str = template.render(data);

		ok(str.indexOf('__!!__') === -1, "no __!!___ " + str)

		var frag = template(data),
			img = frag.childNodes[0];

		equal(img.src, "", "there is no src");

		data.attr("image", url);
		notEqual(img.src, "", 'Image should have src');
		equal(img.src, url, "images src is correct");
	});

	test("hiding image srcs with complex content (#494)", function () {
		var template = can.view.mustache('<img src="{{#image}}http://{{domain}}/{{loc}}.png{{/image}}"/>'),
			data = new can.Map({}),
			imgData = {
				domain: "canjs.us",
				loc: "scripts/static/img/canjs_logo_yellow_small"
			},
			url = "http://canjs.us/scripts/static/img/canjs_logo_yellow_small.png";

		var str = template.render(data);

		ok(str.indexOf('__!!__') === -1, "no __!!__")

		var frag = template(data),
			img = frag.childNodes[0];

		equal(img.src, "", "there is no src");

		data.attr("image", imgData);
		notEqual(img.src, "", 'Image should have src');
		equal(img.src, url, "images src is correct");
	});

	test("style property is live-bindable in IE (#494)", 4, function () {

		var template = can.view.mustache('<div style="width: {{width}}px; background-color: {{color}};">hi</div>')

		var dims = new can.Map({
			width: 5,
			color: 'red'
		});

		var div = template(dims)
			.childNodes[0]

		equal(div.style.width, "5px");
		equal(div.style.backgroundColor, "red");

		dims.attr("width", 10);
		dims.attr('color', 'blue');

		equal(div.style.width, "10px");
		equal(div.style.backgroundColor, "blue");
	});

	test("empty lists update", 2, function () {
		var template = can.view.mustache('<p>{{#list}}{{.}}{{/list}}</p>');
		var map = new can.Map({
			list: ['something']
		});

		var frag = template(map);
		var div = document.createElement('div');

		div.appendChild(frag);

		equal(div.children[0].innerHTML, 'something', 'initial list content set');
		map.attr('list', ['one', 'two']);
		equal(div.children[0].innerHTML, 'onetwo', 'updated list content set');
	});

	test("attributes in truthy section", function () {
		var template = can.view.mustache('<p {{#attribute}}data-test="{{attribute}}"{{/attribute}}></p>');
		var data1 = {
			attribute: "test-value"
		};
		var frag1 = template(data1);
		var div1 = document.createElement('div');

		div1.appendChild(frag1);
		equal(div1.children[0].getAttribute('data-test'), 'test-value', 'hyphenated attribute value');

		var data2 = {
			attribute: "test value"
		};
		var frag2 = template(data2);
		var div2 = document.createElement('div');

		div2.appendChild(frag2);
		equal(div2.children[0].getAttribute('data-test'), 'test value', 'whitespace in attribute value');
	});

	test("live bound attributes with no '='", function () {
		var template = can.view.mustache('<input type="radio" {{#selected}}checked{{/selected}}>');
		var data = new can.Map({
			selected: false
		});
		var frag = template(data);
		var div = document.createElement('div');

		div.appendChild(frag);
		data.attr('selected', true);
		equal(div.children[0].checked, true, 'hyphenated attribute value');

		data.attr("selected", false)
		equal(div.children[0].checked, false, 'hyphenated attribute value');
	});

	test("outputting array of attributes", function () {
		var template = can.view.mustache('<p {{#attribute}}{{name}}="{{value}}"{{/attribute}}></p>');
		var data = {
			attribute: [{
				"name": "data-test1",
				"value": "value1"
			}, {
				"name": "data-test2",
				"value": "value2"
			}, {
				"name": "data-test3",
				"value": "value3"
			}]
		};
		var frag = template(data);
		var div = document.createElement('div');

		div.appendChild(frag);
		equal(div.children[0].getAttribute('data-test1'), 'value1', 'first value');
		equal(div.children[0].getAttribute('data-test2'), 'value2', 'second value');
		equal(div.children[0].getAttribute('data-test3'), 'value3', 'third value');
	});

	test("incremental updating of #each within an if", function () {
		var template = can.view.mustache('{{#if items.length}}<ul>{{#each items}}<li/>{{/each}}</ul>{{/if}}');

		var items = new can.List([{}, {}]);
		var div = document.createElement('div');
		div.appendChild(template({
			items: items
		}));

		var ul = div.getElementsByTagName('ul')[0]
		ul.setAttribute("original", "yup");

		items.push({});
		ok(ul === div.getElementsByTagName('ul')[0], "ul is still the same")

	});

	test("can.Mustache.safeString", function () {
		var text = "Google",
			url = "http://google.com/",
			templateEscape = can.view.mustache('{{link "' + text + '" "' + url + '"}}'),
			templateUnescape = can.view.mustache('{{{link "' + text + '" "' + url + '"}}}');
		can.Mustache.registerHelper('link', function (text, url) {
			var link = '<a href="' + url + '">' + text + '</a>';
			return can.Mustache.safeString(link);
		});

		var div = document.createElement('div');
		div.appendChild(templateEscape({}));

		equal(div.children.length, 1, 'rendered a DOM node');
		equal(div.children[0].nodeName, 'A', 'rendered an anchor tag');
		equal(div.children[0].innerHTML, text, 'rendered the text properly');
		equal(div.children[0].getAttribute('href'), url, 'rendered the href properly');

		div = document.createElement('div');
		div.appendChild(templateUnescape({}));

		equal(div.children.length, 1, 'rendered a DOM node');
		equal(div.children[0].nodeName, 'A', 'rendered an anchor tag');
		equal(div.children[0].innerHTML, text, 'rendered the text properly');
		equal(div.children[0].getAttribute('href'), url, 'rendered the href properly');
	});

	test("changing the list works with each", function () {
		var template = can.view.mustache("<ul>{{#each list}}<li>.</li>{{/each}}</ul>");

		var map = new can.Map({
			list: ["foo"]
		});

		var lis = template(map)
			.childNodes[0].getElementsByTagName('li');

		equal(lis.length, 1, "one li")

		map.attr("list", new can.List(["bar", "car"]));

		equal(lis.length, 2, "two lis")

	});

	test("nested properties binding (#525)", function () {
		var template = can.view.mustache("<label>{{name.first}}</label>");

		var me = new can.Map()

		var label = template(me)
			.childNodes[0];
		me.attr("name", {
			first: "Justin"
		});
		equal(label.innerHTML, "Justin", "set name object");

		me.attr("name", {
			first: "Brian"
		});
		equal(label.innerHTML, "Brian", "merged name object");

		me.removeAttr("name");
		me.attr({
			name: {
				first: "Payal"
			}
		});

		equal(label.innerHTML, "Payal", "works after parent removed");

	})

	test("Rendering indicies of an array with @index", function () {
		var template = can.view.mustache("<ul>{{#each list}}<li>{{@index}} {{.}}</li>{{/each}}</ul>");
		var list = [0, 1, 2, 3];

		var lis = template({
			list: list
		})
			.childNodes[0].getElementsByTagName('li');

		for (var i = 0; i < lis.length; i++) {
			equal(lis[i].innerHTML, (i + ' ' + i), 'rendered index and value are correct');
		}
	});

	test("Rendering live bound indicies with #each, @index and a simple can.List", function () {
		var list = new can.List(['a', 'b', 'c']);
		var template = can.view.mustache("<ul>{{#each list}}<li>{{@index}} {{.}}</li>{{/each}}</ul>");

		var lis = template({
			list: list
		})
			.childNodes[0].getElementsByTagName('li');

		equal(lis.length, 3, "three lis");

		equal(lis[0].innerHTML, '0 a', "first index and value are correct");
		equal(lis[1].innerHTML, '1 b', "second index and value are correct");
		equal(lis[2].innerHTML, '2 c', "third index and value are correct");

		// add a few more items
		list.push('d', 'e');

		equal(lis.length, 5, "five lis");

		equal(lis[3].innerHTML, '3 d', "fourth index and value are correct");
		equal(lis[4].innerHTML, '4 e', "fifth index and value are correct");

		// splice off a few items and add some more
		list.splice(0, 2, 'z', 'y');

		equal(lis.length, 5, "five lis");
		equal(lis[0].innerHTML, '0 z', "first item updated");
		equal(lis[1].innerHTML, '1 y', "second item udpated");
		equal(lis[2].innerHTML, '2 c', "third item the same");
		equal(lis[3].innerHTML, '3 d', "fourth item the same");
		equal(lis[4].innerHTML, '4 e', "fifth item the same");

		// splice off from the middle
		list.splice(2, 2);

		equal(lis.length, 3, "three lis");
		equal(lis[0].innerHTML, '0 z', "first item the same");
		equal(lis[1].innerHTML, '1 y', "second item the same");
		equal(lis[2].innerHTML, '2 e', "fifth item now the 3rd item");
	});

	test('Rendering keys of an object with #each and @key', function () {
		delete can.Mustache._helpers.too;
		var template = can.view.mustache("<ul>{{#each obj}}<li>{{@key}} {{.}}</li>{{/each}}</ul>");
		var obj = {
			foo: 'string',
			bar: 1,
			baz: false
		};

		var lis = template({
			obj: obj
		})
			.childNodes[0].getElementsByTagName('li');

		equal(lis.length, 3, "three lis");

		equal(lis[0].innerHTML, 'foo string', "first key value pair rendered");
		equal(lis[1].innerHTML, 'bar 1', "second key value pair rendered");
		equal(lis[2].innerHTML, 'baz false', "third key value pair rendered");
	});

	test('Live bound iteration of keys of a can.Map with #each and @key', function () {
		delete can.Mustache._helpers.foo;
		var template = can.view.mustache("<ul>{{#each map}}<li>{{@key}} {{.}}</li>{{/each}}</ul>");
		var map = new can.Map({
			foo: 'string',
			bar: 1,
			baz: false
		});

		var lis = template({
			map: map
		})
			.childNodes[0].getElementsByTagName('li');

		equal(lis.length, 3, "three lis");

		equal(lis[0].innerHTML, 'foo string', "first key value pair rendered");
		equal(lis[1].innerHTML, 'bar 1', "second key value pair rendered");
		equal(lis[2].innerHTML, 'baz false', "third key value pair rendered");

		map.attr('qux', true);

		equal(lis.length, 4, "four lis");

		equal(lis[3].innerHTML, 'qux true', "fourth key value pair rendered");

		map.removeAttr('foo');

		equal(lis.length, 3, "three lis");

		equal(lis[0].innerHTML, 'bar 1', "new first key value pair rendered");
		equal(lis[1].innerHTML, 'baz false', "new second key value pair rendered");
		equal(lis[2].innerHTML, 'qux true', "new third key value pair rendered");
	});

	test('Make sure data passed into template does not call helper by mistake', function () {
		var template = can.view.mustache("<h1>{{text}}</h1>");
		var data = {
			text: 'with'
		};

		var h1 = template(data)
			.childNodes[0];

		equal(h1.innerHTML, "with");
	});

	test("no memory leaks with #each (#545)", function () {
		var tmp = can.view.mustache("<ul>{{#each children}}<li></li>{{/each}}</ul>");

		var data = new can.Map({
			children: [{
				name: 'A1'
			}, {
				name: 'A2'
			}, {
				name: 'A3'
			}]
		});
		var div = document.createElement('div')

		can.append(can.$('#qunit-test-area'), div);
		can.append(can.$(div), tmp(data));

		stop();
		setTimeout(function () {

			can.remove(can.$(div));

			equal(data._bindings, 0, "there are no bindings")

			start()
		}, 50)

	})

	test("each directly within live html section", function () {

		var tmp = can.view.mustache(
			"<ul>{{#if showing}}" +
			"{{#each items}}<li>item</li>{{/items}}" +
			"{{/if}}</ul>")

		var items = new can.List([1, 2, 3]);
		var showing = can.compute(true);
		var frag = tmp({
			showing: showing,
			items: items
		});

		showing(false);

		// this would break because things had not been unbound
		items.pop();

		showing(true);

		items.push("a")

		equal(frag.childNodes[0].getElementsByTagName("li")
			.length, 3, "there are 3 elements");

	});

	test("mustache loops with 0 (#568)", function () {

		var tmp = can.view.mustache("<ul>{{#array}}<li>{{.}}</li>{{/array}}");

		var data = {
			array: [0, null]
		};

		var frag = tmp(data)

		equal(frag.childNodes[0].getElementsByTagName("li")[0].innerHTML, "0")
		equal(frag.childNodes[0].getElementsByTagName("li")[1].innerHTML, "")

	})

	test('@index is correctly calculated when there are identical elements in the array', function () {
		var data = new can.List(['foo', 'bar', 'baz', 'qux', 'foo']);
		var tmp = can.view.mustache('{{#each data}}{{@index}} {{/each}}');

		var div = document.createElement('div')

		can.append(can.$('#qunit-test-area'), div);
		can.append(can.$(div), tmp({
			data: data
		}));

		equal(div.innerHTML, '0 1 2 3 4 ');
	})

	test("if helper within className (#592)", function () {

		var tmp = can.view.mustache('<div class="fails {{#state}}animate-{{.}}{{/state}}"></div>');
		var data = new can.Map({
			state: "ready"
		})
		var frag = tmp(data);

		equal(frag.childNodes[0].className, "fails animate-ready")

		tmp = can.view.mustache('<div class="fails {{#if state}}animate-{{state}}{{/if}}"></div>');
		data = new can.Map({
			state: "ready"
		})
		tmp(data);

		equal(frag.childNodes[0].className, "fails animate-ready")
	})

	test('html comments must not break mustache scanner', function () {
		can.each([
			'text<!-- comment -->',
			'text<!-- comment-->',
			'text<!--comment -->',
			'text<!--comment-->'
		], function (content) {
			var div = document.createElement('div');

			can.append(can.$('#qunit-test-area'), div);
			can.append(can.$(div), can.view.mustache(content)());
			equal(div.innerHTML, content, 'Content did not change: "' + content + '"');
		});
	});

	test("Rendering live bound indicies with #each, @index and a simple can.List when remove first item (#613)", function () {
		var list = new can.List(['a', 'b', 'c']);
		var template = can.view.mustache("<ul>{{#each list}}<li>{{@index}} {{.}}</li>{{/each}}</ul>");

		var lis = template({
			list: list
		})
			.childNodes[0].getElementsByTagName('li');

		// remove first item
		list.shift();
		equal(lis.length, 2, "two lis");

		equal(lis[0].innerHTML, '0 b', "second item now the 1st item");
		equal(lis[1].innerHTML, '1 c', "third item now the 2nd item");
	});

	test("can.Mustache.safestring works on live binding (#606)", function () {

		var num = can.compute(1)

		can.Mustache.registerHelper("safeHelper", function () {

			return can.Mustache.safeString(
				"<p>" + num() + "</p>"
			)

		});

		var template = can.view.mustache("<div>{{safeHelper}}</div>")

		var frag = template();
		equal(frag.childNodes[0].childNodes[0].nodeName.toLowerCase(), "p", "got a p element");

	});

	test("directly nested subitems and each (#605)", function () {

		var template = can.view.mustache("<div>" +

			"{{#item}}" +
			"<p>This is the item:</p>" +
			"{{#each subitems}}" +
			"<label>" + "item" + "</label>" +
			"{{/each}}" +
			"{{/item}}" +
			"</div>")

		var data = new can.Map({
			item: {
				subitems: ['first']
			}
		})

		var frag = template(data),
			div = frag.childNodes[0],
			labels = div.getElementsByTagName("label");

		equal(labels.length, 1, "initially one label");

		data.attr('item.subitems')
			.push('second');

		equal(labels.length, 2, "after pushing two label");

		data.removeAttr('item');

		equal(labels.length, 0, "after removing item no label");

	});

	test("direct live section", function () {
		var template = can.view.mustache("{{#if visible}}<label/>{{/if}}");

		var data = new can.Map({
			visible: true
		})

		var div = document.createElement("div");
		div.appendChild(template(data));

		equal(div.getElementsByTagName("label")
			.length, 1, "there are 1 items")

		data.attr("visible", false)
		equal(div.getElementsByTagName("label")
			.length, 0, "there are 0 items")

	});

	test('Rendering keys of an object with #each and @key in a Component', function () {

		var template = can.view.mustache("<ul>" +
			"{{#each data}}" +
			"<li>{{@key}} : {{.}}</li>" +
			"{{/data}}" +
			"</ul>")

		var map = new can.Map({
			data: {
				some: 'test',
				things: false,
				other: 'things'
			}
		})

		var frag = template(map);

		var lis = frag.childNodes[0].getElementsByTagName("li");
		equal(lis.length, 3, "there are 3 properties of map's data property")

		equal("some : test", lis[0].innerHTML)

	});

	test("{{each}} does not error with undefined list (#602)", function () {
		var renderer = can.view.mustache('<div>{{#each data}}{{name}}{{/each}}</div>');

		equal(renderer.render({}), '<div></div>', 'Empty text rendered');
		equal(renderer.render({
			data: false
		}), '<div></div>', 'Empty text rendered');
		equal(renderer.render({
			data: null
		}), '<div></div>', 'Empty text rendered');
		equal(renderer.render({
			data: [{
				name: 'David'
			}]
		}), '<div>David</div>', 'Expected name rendered');
	});

	test('{{#each}} helper works reliably with nested sections (#604)', function () {
		var renderer = can.view.mustache('{{#if first}}<ul>{{#each list}}<li>{{name}}</li>{{/each}}</ul>' +
			'{{else}}<ul>{{#each list2}}<li>{{name}}</li>{{/each}}</ul>{{/if}}');
		var data = new can.Map({
			first: true,
			list: [{
				name: "Something"
			}, {
				name: "Else"
			}],
			list2: [{
				name: "Foo"
			}, {
				name: "Bar"
			}]
		});
		var div = document.createElement('div'),
			lis = div.getElementsByTagName("li");

		div.appendChild(renderer(data));

		deepEqual(
			can.map(lis, function (li) {
				return li.innerHTML
			}), ["Something", "Else"],
			'Expected HTML with first set');

		data.attr('first', false);

		deepEqual(
			can.map(lis, function (li) {
				return li.innerHTML
			}), ["Foo", "Bar"],
			'Expected HTML with first false set');

	});

	test("Block bodies are properly escaped inside attributes", function () {
		var html = "<div title='{{#test}}{{.}}{{{.}}}{{/test}}'></div>",
			div = document.createElement("div"),
			title = "Alpha&Beta";

		div.appendChild(can.view.mustache(html)(new can.Map({
			test: title
		})));

		equal(div.getElementsByTagName("div")[0].title, title + title);
	});

	test('Constructor static properties are accessible (#634)', function () {
		can.Map.extend("can.Foo", {
			static_prop: "baz"
		}, {
			proto_prop: "thud"
		});
		var template = '\
				Straight access: <br/> \
					<span>{{own_prop}}</span><br/> \
					<span>{{constructor.static_prop}}</span><br/> \
					<span>{{constructor.proto_prop}}</span><br/> \
					<span>{{proto_prop}}</span><br/> \
				Helper argument: <br/> \
					<span>{{print_prop own_prop}}</span><br/> \
					<span>{{print_prop constructor.static_prop}}</span><br/> \
					<span>{{print_prop constructor.proto_prop}}</span><br/> \
					<span>{{print_prop proto_prop}}</span><br/> \
				Helper hash argument: <br/> \
					<span>{{print_hash prop=own_prop}}</span><br/> \
					<span>{{print_hash prop=constructor.static_prop}}</span><br/> \
					<span>{{print_hash prop=constructor.proto_prop}}</span><br/> \
					<span>{{print_hash prop=proto_prop}}</span><br/>',
			renderer = can.view.mustache(template),
			data = new can.Foo({
				own_prop: "quux"
			}),
			div = document.createElement('div');

		div.appendChild(renderer(data, {
			print_prop: function () {
				return can.map(
					can.makeArray(arguments)
					.slice(0, arguments.length - 1), function (arg) {
						while (arg && arg.isComputed) {
							arg = arg();
						}
						return arg;
					}
				)
					.join(" ");
			},
			print_hash: function () {
				var ret = [];
				can.each(
					arguments[arguments.length - 1].hash, function (arg, key) {
						while (arg && arg.isComputed) {
							arg = arg();
						}
						ret.push([key, arg].join("="));
					}
				);
				return ret.join(" ");
			}
		}));
		var spans = div.getElementsByTagName('span'),
			i = 0;

		// Straight access
		equal(spans[i++].innerHTML, 'quux', 'Expected "quux"');
		equal(spans[i++].innerHTML, 'baz', 'Expected "baz"');
		equal(spans[i++].innerHTML, '', 'Expected ""');
		equal(spans[i++].innerHTML, 'thud', 'Expected "thud"');

		// Helper argument
		equal(spans[i++].innerHTML, 'quux', 'Expected "quux"');
		equal(spans[i++].innerHTML, 'baz', 'Expected "baz"');
		equal(spans[i++].innerHTML, '', 'Expected ""');
		equal(spans[i++].innerHTML, 'thud', 'Expected "thud"');

		// Helper hash argument
		equal(spans[i++].innerHTML, 'prop=quux', 'Expected "prop=quux"');
		equal(spans[i++].innerHTML, 'prop=baz', 'Expected "prop=baz"');
		equal(spans[i++].innerHTML, 'prop=', 'Expected "prop="');
		equal(spans[i++].innerHTML, 'prop=thud', 'Expected "prop=thud"');
	});

	test("{{#each}} handles an undefined list changing to a defined list (#629)", function () {
		var renderer = can.view.mustache('    {{description}}: \
    <ul> \
    {{#each list}} \
        <li>{{name}}</li> \
    {{/each}} \
    </ul>');

		var div = document.createElement('div'),
			data1 = new can.Map({
				description: 'Each without list'
			}),
			data2 = new can.Map({
				description: 'Each with empty list',
				list: []
			});

		div.appendChild(renderer(data1));
		div.appendChild(renderer(data2));

		equal(div.getElementsByTagName('ul')[0].getElementsByTagName('li')
			.length, 0);
		equal(div.getElementsByTagName('ul')[1].getElementsByTagName('li')
			.length, 0);

		stop();
		setTimeout(function () {
			start();
			data1.attr('list', [{
				name: 'first'
			}]);
			data2.attr('list', [{
				name: 'first'
			}]);
			equal(div.getElementsByTagName('ul')[0].getElementsByTagName('li')
				.length, 1);
			equal(div.getElementsByTagName('ul')[1].getElementsByTagName('li')
				.length, 1);
			equal(div.getElementsByTagName('ul')[0].getElementsByTagName('li')[0].innerHTML, 'first');
			equal(div.getElementsByTagName('ul')[1].getElementsByTagName('li')[0].innerHTML, 'first');
		}, 250);
	});

	test('can.compute should live bind when the value is changed to a Construct (#638)', function () {
		var renderer = can.view.mustache('<p>{{#counter}} Clicked <span>{{count}}</span> times {{/counter}}</p>'),
			div = document.createElement('div'),
			// can.compute(null) will pass
			counter = can.compute(),
			data = {
				counter: counter
			};

		div.appendChild(renderer(data));

		equal(div.getElementsByTagName('span')
			.length, 0);
		stop();
		setTimeout(function () {
			start();
			counter({
				count: 1
			});
			equal(div.getElementsByTagName('span')
				.length, 1);
			equal(div.getElementsByTagName('span')[0].innerHTML, '1');
		}, 10);
	});

	test("@index in partials loaded from script templates", function () {

		// add template as script

		var script = document.createElement("script");
		script.type = "text/mustache";
		script.id = "itempartial";
		script.text = "<label></label>"

		document.body.appendChild(script)

		//can.view.mustache("itempartial","<label></label>")

		var itemsTemplate = can.view.mustache(
			"<div>" +
			"{{#each items}}" +
			"{{>itempartial}}" +
			"{{/each}}" +
			"</div>")

		var items = new can.List([{}, {}])

		var frag = itemsTemplate({
			items: items
		}),
			div = frag.childNodes[0],
			labels = div.getElementsByTagName("label");

		equal(labels.length, 2, "two labels")

		items.shift();

		equal(labels.length, 1, "first label removed")
	})



})(undefined, undefined, __m30);

// ## route/pushstate/pushstate_test.js
var __m49 = (function () {

	if (window.history && history.pushState) {

		module("can/route/pushstate", {
			setup: function () {
				can.route._teardown();
				can.route.defaultBinding = "pushstate";
			},
			teardown: function () {

			}
		});

		test("deparam", function () {
			can.route.routes = {};
			can.route(":page", {
				page: "index"
			})

			var obj = can.route.deparam("can.Control");
			deepEqual(obj, {
				page: "can.Control",
				route: ":page"
			});

			obj = can.route.deparam("");
			deepEqual(obj, {
				page: "index",
				route: ":page"
			});

			obj = can.route.deparam("can.Control?where=there");
			deepEqual(obj, {
				page: "can.Control",
				where: "there",
				route: ":page"
			});

			can.route.routes = {};
			can.route(":page/:index", {
				page: "index",
				index: "foo"
			});

			obj = can.route.deparam("can.Control/?where=there");
			deepEqual(obj, {
				page: "can.Control",
				index: "foo",
				where: "there",
				route: ":page/:index"
			});
		})

		test("deparam of invalid url", function () {
			var obj;

			can.route.routes = {};
			can.route("pages/:var1/:var2/:var3", {
				var1: 'default1',
				var2: 'default2',
				var3: 'default3'
			});

			// This path does not match the above route, and since the hash is not 
			// a &key=value list there should not be data.
			obj = can.route.deparam("pages//");
			deepEqual(obj, {});

			// A valid path with invalid parameters should return the path data but
			// ignore the parameters.
			obj = can.route.deparam("pages/val1/val2/val3?invalid-parameters");
			deepEqual(obj, {
				var1: 'val1',
				var2: 'val2',
				var3: 'val3',
				route: "pages/:var1/:var2/:var3"
			});
		})

		test("deparam of url with non-generated hash (manual override)", function () {
			var obj;

			can.route.routes = {};

			// This won't be set like this by route, but it could easily happen via a 
			// user manually changing the URL or when porting a prior URL structure.
			obj = can.route.deparam("?page=foo&bar=baz&where=there");
			deepEqual(obj, {
				page: 'foo',
				bar: 'baz',
				where: 'there'
			});
		})

		test("param", function () {
			can.route.routes = {};
			can.route("pages/:page", {
				page: "index"
			})

			var res = can.route.param({
				page: "foo"
			});
			equal(res, "pages/foo")

			res = can.route.param({
				page: "foo",
				index: "bar"
			});
			equal(res, "pages/foo?index=bar")

			can.route("pages/:page/:foo", {
				page: "index",
				foo: "bar"
			})

			res = can.route.param({
				page: "foo",
				foo: "bar",
				where: "there"
			});
			equal(res, "pages/foo/?where=there")

			// There is no matching route so the hash should be empty.
			res = can.route.param({});
			equal(res, "")

			can.route.routes = {};

			res = can.route.param({
				page: "foo",
				bar: "baz",
				where: "there"
			});
			equal(res, "?page=foo&bar=baz&where=there")

			res = can.route.param({});
			equal(res, "")
		});

		test("symmetry", function () {
			can.route.routes = {};

			var obj = {
				page: "=&[]",
				nestedArray: ["a"],
				nested: {
					a: "b"
				}
			}

			var res = can.route.param(obj)

			var o2 = can.route.deparam(res)
			deepEqual(o2, obj)
		})

		test("light param", function () {
			can.route.routes = {};
			can.route(":page", {
				page: "index"
			})

			var res = can.route.param({
				page: "index"
			});
			equal(res, "")

			can.route("pages/:p1/:p2/:p3", {
				p1: "index",
				p2: "foo",
				p3: "bar"
			})

			res = can.route.param({
				p1: "index",
				p2: "foo",
				p3: "bar"
			});
			equal(res, "pages///")

			res = can.route.param({
				p1: "index",
				p2: "baz",
				p3: "bar"
			});
			equal(res, "pages//baz/")
		});

		test('param doesnt add defaults to params', function () {
			can.route.routes = {};

			can.route("pages/:p1", {
				p2: "foo"
			})
			var res = can.route.param({
				p1: "index",
				p2: "foo"
			});
			equal(res, "pages/index")
		})

		test("param-deparam", function () {

			can.route(":page/:type", {
				page: "index",
				type: "foo"
			})

			var data = {
				page: "can.Control",
				type: "document",
				bar: "baz",
				where: "there"
			};
			var res = can.route.param(data);
			var obj = can.route.deparam(res);
			delete obj.route
			deepEqual(obj, data)
			data = {
				page: "can.Control",
				type: "foo",
				bar: "baz",
				where: "there"
			};
			res = can.route.param(data);
			obj = can.route.deparam(res);
			delete obj.route;
			deepEqual(data, obj);

			data = {
				page: " a ",
				type: " / "
			};
			res = can.route.param(data);
			obj = can.route.deparam(res);
			delete obj.route;
			deepEqual(obj, data, "slashes and spaces")

			data = {
				page: "index",
				type: "foo",
				bar: "baz",
				where: "there"
			};
			// adding the / should not be necessary.  can.route.deparam removes / if the root starts with /
			res = "/" + can.route.param(data);
			obj = can.route.deparam(res);
			delete obj.route;
			deepEqual(data, obj);

			can.route.routes = {};

			data = {
				page: "foo",
				bar: "baz",
				where: "there"
			};
			res = can.route.param(data);
			obj = can.route.deparam(res);
			deepEqual(data, obj)
		})

		test("deparam-param", function () {
			can.route.routes = {};
			can.route(":foo/:bar", {
				foo: 1,
				bar: 2
			});
			var res = can.route.param({
				foo: 1,
				bar: 2
			});
			equal(res, "/", "empty slash")

			// you really should deparam with root ..
			var deparamed = can.route.deparam("//")
			deepEqual(deparamed, {
				foo: 1,
				bar: 2,
				route: ":foo/:bar"
			})
		})

		test("precident", function () {
			can.route.routes = {};
			can.route(":who", {
				who: "index"
			});
			can.route("search/:search");

			var obj = can.route.deparam("can.Control");
			deepEqual(obj, {
				who: "can.Control",
				route: ":who"
			});

			obj = can.route.deparam("search/can.Control");
			deepEqual(obj, {
				search: "can.Control",
				route: "search/:search"
			}, "bad deparam");

			equal(can.route.param({
					search: "can.Control"
				}),
				"search/can.Control", "bad param");

			equal(can.route.param({
					who: "can.Control"
				}),
				"can.Control");
		})

		test("better matching precident", function () {
			can.route.routes = {};
			can.route(":type", {
				who: "index"
			});
			can.route(":type/:id");

			equal(can.route.param({
					type: "foo",
					id: "bar"
				}),
				"foo/bar");
		})

		test("linkTo", function () {
			can.route.routes = {};
			can.route("/:foo");
			var res = can.route.link("Hello", {
				foo: "bar",
				baz: 'foo'
			});
			equal(res, '<a href="/bar?baz=foo">Hello</a>');
		})

		test("param with route defined", function () {
			can.route.routes = {};
			can.route("holler")
			can.route("foo");

			var res = can.route.param({
				foo: "abc",
				route: "foo"
			});

			equal(res, "foo?foo=abc")
		})

		test("route endings", function () {
			can.route.routes = {};
			can.route("foo", {
				foo: true
			});
			can.route("food", {
				food: true
			})

			var res = can.route.deparam("food")
			ok(res.food, "we get food back")

		});

		test("strange characters", function () {
			can.route.routes = {};
			can.route(":type/:id");
			var res = can.route.deparam("foo/" + encodeURIComponent("\/"))
			equal(res.id, "\/")
			res = can.route.param({
				type: "bar",
				id: "\/"
			});
			equal(res, "bar/" + encodeURIComponent("\/"))
		});

		if (window.history && history.pushState) {
			test("updating the url", function () {
				stop();
				window.routeTestReady = function (iCanRoute, loc) {
					iCanRoute.ready()
					iCanRoute("/:type/:id");
					iCanRoute.attr({
						type: "bar",
						id: "5"
					});

					setTimeout(function () {
						var after = loc.pathname;
						equal(after, "/bar/5", "path is " + after);
						start();

						can.remove(can.$(iframe))

					}, 100);
				}
				var iframe = document.createElement('iframe');
				iframe.src = can.test.path("route/pushstate/testing.html");
				can.$("#qunit-test-area")[0].appendChild(iframe);
			});

			test("sticky enough routes", function () {
				stop();
				window.routeTestReady = function (iCanRoute, loc, history) {
					iCanRoute("/active");
					iCanRoute("");
					history.pushState(null, null, "/active");

					setTimeout(function () {
						var after = loc.pathname;
						equal(after, "/active");
						start();

						can.remove(can.$(iframe))
					}, 30);
				}
				var iframe = document.createElement('iframe');
				iframe.src = can.test.path("route/pushstate/testing.html?2");
				can.$("#qunit-test-area")[0].appendChild(iframe);
			});

			test("unsticky routes", function () {

				stop();
				window.routeTestReady = function (iCanRoute, loc, iframeHistory) {
					// check if we can even test this
					iframeHistory.pushState(null, null, "/bar/" + encodeURIComponent("\/"));
					setTimeout(function timer() {

						if ("/bar/" + encodeURIComponent("\/") === loc.pathname) {
							runTest();

						} else if (loc.pathname.indexOf("/bar/") >= 0) {
							//  encoding doesn't actually work
							ok(true, "can't test!");
							can.remove(can.$(iframe))
							start()
						} else {
							setTimeout(timer, 30)
						}
					}, 30)
					var runTest = function () {
						iCanRoute.ready();
						iCanRoute("/:type");
						iCanRoute("/:type/:id");
						iCanRoute.attr({
							type: "bar"
						});

						setTimeout(function () {
							var after = loc.pathname;
							equal(after, "/bar", "only type is set");
							iCanRoute.attr({
								type: "bar",
								id: "\/"
							});

							// check for 1 second
							var time = new Date()
							setTimeout(function innerTimer() {
								var after = loc.pathname;

								if (after === "/bar/" + encodeURIComponent("\/")) {
									equal(after, "/bar/" + encodeURIComponent("\/"), "should go to type/id");
									can.remove(can.$(iframe))
									start();
								} else if (new Date() - time > 2000) {
									ok(false, "hash is " + after);
									can.remove(can.$(iframe))
								} else {
									setTimeout(innerTimer, 30)
								}

							}, 30)

						}, 30)
					}

				}
				var iframe = document.createElement('iframe');
				iframe.src = can.test.path("route/pushstate/testing.html?1");
				can.$("#qunit-test-area")[0].appendChild(iframe);
			});

			test("clicked hashes work (#259)", function () {

				stop();
				window.routeTestReady = function (iCanRoute, loc, hist, win) {

					iCanRoute(win.location.pathname, {
						page: "index"
					})

					iCanRoute(":type/:id");
					iCanRoute.ready();

					window.win = win;
					var link = win.document.createElement("a");
					link.href = "/articles/17#references";
					link.innerHTML = "Click Me"

					win.document.body.appendChild(link);

					win.can.trigger(win.can.$(link), "click")

					//link.click()

					setTimeout(function () {

						deepEqual(can.extend({}, iCanRoute.attr()), {
							type: "articles",
							id: "17",
							route: ":type/:id"
						}, "articles are right")

						equal(win.location.hash, "#references", "includes hash");

						start();

						can.remove(can.$(iframe))

					}, 100);
				}
				var iframe = document.createElement('iframe');
				iframe.src = can.test.path("route/pushstate/testing.html");
				can.$("#qunit-test-area")[0].appendChild(iframe);
			});

			test("no doubled history states (#656)", function () {
				stop();
				window.routeTestReady = function (iCanRoute, loc, hist, win) {
					var root = loc.pathname.substr(0, loc.pathname.lastIndexOf("/") + 1);
					var stateTest = -1,
						message;

					function nextStateTest() {
						stateTest++;
						win.can.route.attr("page", "start");

						setTimeout(function () {
							if (stateTest === 0) {
								message = "can.route.attr";
								win.can.route.attr("page", "test");
							} else if (stateTest === 1) {
								message = "history.pushState";
								win.history.pushState(null, null, root + "test/");
							} else if (stateTest === 2) {
								message = "link click";
								var link = win.document.createElement("a");
								link.href = root + "test/";
								link.innerText = "asdf";
								win.document.body.appendChild(link);
								win.can.trigger(win.can.$(link), "click");
							} else {
								start();
								can.remove(can.$(iframe));
								return;
							}

							setTimeout(function () {
								win.history.back();
								setTimeout(function () {
									var path = win.location.pathname;
									// strip root for deparam
									if (path.indexOf(root) === 0) {
										path = path.substr(root.length);
									}
									equal(win.can.route.deparam(path)
										.page, "start", message + " passed");
									nextStateTest();
								}, 200);
							}, 200);

						}, 200);
					}
					win.can.route.bindings.pushstate.root = root;
					win.can.route(":page/");
					win.can.route.ready();
					nextStateTest();
				}

				var iframe = document.createElement("iframe");
				iframe.src = can.test.path("route/pushstate/testing.html");
				can.$("#qunit-test-area")[0].appendChild(iframe);
			});


		}

		test("empty default is matched even if last", function () {

			can.route.routes = {};
			can.route(":who");
			can.route("", {
				foo: "bar"
			})

			var obj = can.route.deparam("");
			deepEqual(obj, {
				foo: "bar",
				route: ""
			});
		});

		test("order matched", function () {
			can.route.routes = {};
			can.route(":foo");
			can.route(":bar")

			var obj = can.route.deparam("abc");
			deepEqual(obj, {
				foo: "abc",
				route: ":foo"
			});
		});

		test("param order matching", function () {
			can.route.routes = {};
			can.route("", {
				bar: "foo"
			});
			can.route("something/:bar");
			var res = can.route.param({
				bar: "foo"
			});
			equal(res, "", "picks the shortest, best match");

			// picks the first that matches everything ...
			can.route.routes = {};

			can.route(":recipe", {
				recipe: "recipe1",
				task: "task3"
			});

			can.route(":recipe/:task", {
				recipe: "recipe1",
				task: "task3"
			});

			res = can.route.param({
				recipe: "recipe1",
				task: "task3"
			});

			equal(res, "", "picks the first match of everything");

			res = can.route.param({
				recipe: "recipe1",
				task: "task2"
			});
			equal(res, "/task2")
		})

		test("dashes in routes", function () {
			can.route.routes = {};
			can.route(":foo-:bar");

			var obj = can.route.deparam("abc-def");
			deepEqual(obj, {
				foo: "abc",
				bar: "def",
				route: ":foo-:bar"
			});
		})

	}

})(undefined, __m30);

// ## model/queue/queue_test.js
var __m51 = (function () {
	module('can/model/queue', {
		setup: function () {}
	});
	test('queued requests will not overwrite attrs', function () {
		var delay = can.fixture.delay;
		can.fixture.delay = 1000;
		can.Model('Person', {
			create: function (id, attrs, success, error) {
				return can.ajax({
					url: '/people/' + id,
					data: attrs,
					type: 'post',
					dataType: 'json',
					fixture: function () {
						return {
							name: 'Justin'
						};
					},
					success: success
				});
			}
		}, {});
		var person = new Person({
			name: 'Justin'
		}),
			personD = person.save();
		person.attr('name', 'Brian');
		stop();
		personD.then(function (person) {
			start();
			equal(person.name, 'Brian', 'attrs were not overwritten with the data from the server');
			can.fixture.delay = delay;
		});
	});
	test('error will clean up the queue', 2, function () {
		can.Model('User', {
			create: 'POST /users',
			update: 'PUT /users/{id}'
		}, {});
		can.fixture('POST /users', function (req) {
			return {
				id: 1
			};
		});
		can.fixture('PUT /users/{id}', function (req, respondWith) {
			respondWith(500);
		});
		var u = new User({
			name: 'Goku'
		});
		stop();
		u.save();
		var err = u.save();
		u.save();
		u.save();
		u.save();
		err.fail(function () {
			start();
			equal(u._requestQueue.attr('length'), 4, 'Four requests are in the queue');
			stop();
			u._requestQueue.bind('change', function () {
				start();
				equal(u._requestQueue.attr('length'), 0, 'Request queue was emptied');
			});
		});
	});
	test('backup works as expected', function () {
		can.Model('User', {
			create: 'POST /users',
			update: 'PUT /users/{id}'
		}, {});
		can.fixture('POST /users', function (req) {
			return {
				id: 1,
				name: 'Goku'
			};
		});
		can.fixture('PUT /users/{id}', function (req, respondWith) {
			respondWith(500);
		});
		var u = new User({
			name: 'Goku'
		});
		stop();
		var save = u.save();
		u.attr('name', 'Krillin');
		save.then(function () {
			start();
			equal(u.attr('name'), 'Krillin', 'Name is not overwritten when save is successful');
			stop();
		});
		var err = u.save();
		err.fail(function () {
			u.restore(true);
			start();
			equal(u.attr('name'), 'Goku', 'Name was restored to the last value successfuly returned from the server');
		});
	});
	test('abort will remove requests made after the aborted request', function () {
		can.Model('User', {
			create: 'POST /users',
			update: 'PUT /users/{id}'
		}, {});
		can.fixture('POST /users', function (req) {
			return {
				id: 1,
				name: 'Goku'
			};
		});
		can.fixture('PUT /users/{id}', function (req, respondWith) {
			return req.data;
		});
		var u = new User({
			name: 'Goku'
		});
		u.save();
		u.save();
		var abort = u.save();
		u.save();
		u.save();
		equal(u._requestQueue.attr('length'), 5);
		abort.abort();
		equal(u._requestQueue.attr('length'), 2);
	});
	test('id will be set correctly, although update data is serialized before create is done', function () {
		var delay = can.fixture.delay;
		can.fixture.delay = 1000;
		can.Model('Hero', {
			create: 'POST /superheroes',
			update: 'PUT /superheroes/{id}'
		}, {});
		can.fixture('POST /superheroes', function (req) {
			return {
				id: 'FOOBARBAZ'
			};
		});
		can.fixture('PUT /superheroes/{id}', function (req, respondWith) {
			start();
			equal(req.data.id, 'FOOBARBAZ', 'Correct id is set');
			can.fixture.delay = delay;
			return req.data;
		});
		var u = new Hero({
			name: 'Goku'
		});
		u.save();
		u.save();
		stop();
	});
	test('queue uses serialize (#611)', function () {
		can.fixture('POST /mymodel', function (request) {
			equal(request.data.foo, 'bar');
			start();
		});
		var MyModel = can.Model.extend({
			create: '/mymodel'
		}, {
			serialize: function () {
				return {
					foo: 'bar'
				};
			}
		});
		stop();
		new MyModel()
			.save();
	});
})(undefined, undefined, undefined, undefined, undefined, __m30);

// ## construct/super/super_test.js
var __m54 = (function () {
	module('can/construct/super');
	test('prototype super', function () {
		var A = can.Construct({
			init: function (arg) {
				this.arg = arg + 1;
			},
			add: function (num) {
				return this.arg + num;
			}
		});
		var B = A({
			init: function (arg) {
				this._super(arg + 2);
			},
			add: function (arg) {
				return this._super(arg + 1);
			}
		});
		var b = new B(1);
		equal(b.arg, 4);
		equal(b.add(2), 7);
	});
	test('static super', function () {
		var First = can.Construct({
			raise: function (num) {
				return num;
			}
		}, {});
		var Second = First({
			raise: function (num) {
				return this._super(num) * num;
			}
		}, {});
		equal(Second.raise(2), 4);
	});
	test('findAll super', function () {
		var Parent = can.Construct({
			findAll: function () {
				equal(this.shortName, 'child');
				return new can.Deferred();
			},
			shortName: 'parent'
		}, {});
		var Child = Parent({
			findAll: function () {
				return this._super();
			},
			shortName: 'child'
		}, {});
		stop();
		expect(1);
		Child.findAll({});
		start();
	});
	/* Not sure I want to fix this yet.
	 test("Super in derived when parent doesn't have init", function(){
	 can.Construct("Parent",{
	 });

	 Parent("Derived",{
	 init : function(){
	 this._super();
	 }
	 });

	 try {
	 new Derived();
	 ok(true, "can call super in init safely")
	 } catch (e) {
	 ok(false, "Failed to call super in init with error: " + e)
	 }
	 })*/
})(undefined);

// ## construct/proxy/proxy_test.js
var __m56 = (function () {
	/* global Car */
	var isSteal = typeof steal !== 'undefined';
	module('can/construct/proxy');
	test('static proxy if control is loaded first', function () {
		var curVal = 0;
		expect(2);
		can.Control('Car', {
			show: function (value) {
				equal(curVal, value);
			}
		}, {});
		var cb = Car.proxy('show');
		curVal = 1;
		cb(1);
		curVal = 2;
		var cb2 = Car.proxy('show', 2);
		cb2();
	});
	test('proxy', function () {
		var curVal = 0;
		expect(2);
		can.Construct('Car', {
			show: function (value) {
				equal(curVal, value);
			}
		}, {});
		var cb = Car.proxy('show');
		curVal = 1;
		cb(1);
		curVal = 2;
		var cb2 = Car.proxy('show', 2);
		cb2();
	});
	// this won't work in dist mode (this functionality is removed)
	if (isSteal) {
		test('proxy error', 1, function () {
			can.Construct('Car', {});
			try {
				Car.proxy('huh');
				ok(false, 'I should have errored');
			} catch (e) {
				ok(true, 'Error was thrown');
			}
		});
	}
})(undefined, undefined);

// ## map/delegate/delegate_test.js
var __m58 = (function () {
	module('can/map/delegate');
	var matches = can.Map.prototype.delegate.matches;
	test('matches', function () {
		equal(matches(['**'], [
			'foo',
			'bar',
			'0'
		]), 'foo.bar.0', 'everything');
		equal(matches(['*.**'], ['foo']), null, 'everything at least one level deep');
		equal(matches([
			'foo',
			'*'
		], [
			'foo',
			'bar',
			'0'
		]), 'foo.bar');
		equal(matches(['*'], [
			'foo',
			'bar',
			'0'
		]), 'foo');
		equal(matches([
			'*',
			'bar'
		], [
			'foo',
			'bar',
			'0'
		]), 'foo.bar');
	});
	test('delegate', 4, function () {
		var state = new can.Map({
			properties: {
				prices: []
			}
		});
		var prices = state.attr('properties.prices');
		state.delegate('properties.prices', 'change', function (ev, attr, how, val, old) {
			equal(attr, '0', 'correct change name');
			equal(how, 'add');
			equal(val[0].attr('foo'), 'bar', 'correct');
			ok(this === prices, 'rooted element');
		});
		prices.push({
			foo: 'bar'
		});
		state.undelegate();
	});
	test('delegate on add', 2, function () {
		var state = new can.Map({});
		state.delegate('foo', 'add', function (ev, newVal) {
			ok(true, 'called');
			equal(newVal, 'bar', 'got newVal');
		})
			.delegate('foo', 'remove', function () {
				ok(false, 'remove should not be called');
			});
		state.attr('foo', 'bar');
	});
	test('delegate set is called on add', 2, function () {
		var state = new can.Map({});
		state.delegate('foo', 'set', function (ev, newVal) {
			ok(true, 'called');
			equal(newVal, 'bar', 'got newVal');
		});
		state.attr('foo', 'bar');
	});
	test('delegate\'s this', 5, function () {
		var state = new can.Map({
			person: {
				name: {
					first: 'justin',
					last: 'meyer'
				}
			},
			prop: 'foo'
		});
		var n = state.attr('person.name'),
			check;
		// listen to person name changes
		state.delegate('person.name', 'set', check = function (ev, newValue, oldVal, from) {
			// make sure we are getting back the person.name
			equal(this, n);
			equal(newValue, 'Brian');
			equal(oldVal, 'justin');
			// and how to get there
			equal(from, 'first');
		});
		n.attr('first', 'Brian');
		state.undelegate('person.name', 'set', check);
		// stop listening
		// now listen to changes in prop
		state.delegate('prop', 'set', function () {
			equal(this, 'food');
		});
		// this is weird, probably need to support direct bind ...
		// update the prop
		state.attr('prop', 'food');
	});
	test('delegate on deep properties with *', function () {
		var state = new can.Map({
			person: {
				name: {
					first: 'justin',
					last: 'meyer'
				}
			}
		});
		state.delegate('person', 'set', function (ev, newVal, oldVal, attr) {
			equal(this, state.attr('person'), 'this is set right');
			equal(attr, 'name.first');
		});
		state.attr('person.name.first', 'brian');
	});
	test('compound sets', function () {
		var state = new can.Map({
			type: 'person',
			id: '5'
		});
		var count = 0;
		state.delegate('type=person id', 'set', function () {
			equal(state.type, 'person', 'type is person');
			ok(state.id !== undefined, 'id has value');
			count++;
		});
		// should trigger a change
		state.attr('id', 0);
		equal(count, 1, 'changing the id to 0 caused a change');
		// should not fire a set
		state.removeAttr('id');
		equal(count, 1, 'removing the id changed nothing');
		state.attr('id', 3);
		equal(count, 2, 'adding an id calls callback');
		state.attr('type', 'peter');
		equal(count, 2, 'changing the type does not fire callback');
		state.removeAttr('type');
		state.removeAttr('id');
		equal(count, 2, '');
		state.attr({
			type: 'person',
			id: '5'
		});
		equal(count, 3, 'setting person and id only fires 1 event');
		state.removeAttr('type');
		state.removeAttr('id');
		state.attr({
			type: 'person'
		});
		equal(count, 3, 'setting person does not fire anything');
	});
	test('undelegate within event loop', 1, function () {
		var state = new can.Map({
			type: 'person',
			id: '5'
		});
		var f1 = function () {
			state.undelegate('type', 'add', f2);
		}, f2 = function () {
				ok(false, 'I am removed, how am I called');
			}, f3 = function () {
				state.undelegate('type', 'add', f1);
			}, f4 = function () {
				ok(true, 'f4 called');
			};
		state.delegate('type', 'set', f1);
		state.delegate('type', 'set', f2);
		state.delegate('type', 'set', f3);
		state.delegate('type', 'set', f4);
		state.attr('type', 'other');
	});
	test('selector types', 5, function () {
		var state = new can.Map({
			foo: 'a',
			bar: 'b',
			baz: 'c',
			box: 'd',
			baw: 'e'
		});
		state.delegate('foo=aa', 'change', function () {
			ok(true, 'Unquoted value in selector matched.');
		});
		state.attr({
			foo: 'aa'
		});
		state.delegate('bar=\'b b\'', 'change', function () {
			ok(true, 'Single-quoted value in selector matched.');
		});
		state.attr({
			bar: 'b b'
		});
		state.delegate('baz="c c"', 'change', function () {
			ok(true, 'Double-quoted value in selector matched.');
		});
		state.attr({
			baz: 'c c'
		});
		state.delegate('box', 'change', function () {
			ok(true, 'No-value attribute in selector matched.');
		});
		state.attr({
			box: 'quux'
		});
		state.delegate('baw=', 'change', function () {
			ok(true, 'Empty-value shortcut in selector matched.');
		});
		state.attr({
			baw: ''
		});
	});
})(undefined, __m30);

// ## map/setter/setter_test.js
var __m60 = (function () {
	module('can/map/setter');
	test('setter testing works', function () {
		var Contact = can.Map({
			setBirthday: function (raw) {
				if (typeof raw === 'number') {
					return new Date(raw);
				} else if (raw instanceof Date) {
					return raw;
				}
			}
		});
		var date = new Date(),
			contact = new Contact({
				birthday: date.getTime()
			});
		// set via constructor
		equal(contact.birthday.getTime(), date.getTime(), 'set as birthday');
		// set via attr method
		date = new Date();
		contact.attr('birthday', date.getTime());
		equal(contact.birthday.getTime(), date.getTime(), 'set via attr');
		// set via attr method w/ multiple attrs
		date = new Date();
		contact.attr({
			birthday: date.getTime()
		});
		equal(contact.birthday.getTime(), date.getTime(), 'set as birthday');
	});
	test('error binding', 1, function () {
		can.Map('School', {
			setName: function (name, success, error) {
				if (!name) {
					error('no name');
				}
				return error;
			}
		});
		var school = new School();
		school.bind('error', function (ev, attr, error) {
			equal(error, 'no name', 'error message provided');
		});
		school.attr('name', '');
	});
	test('asyncronous setting', function () {
		var Meyer = can.Map({
			setName: function (newVal, success) {
				setTimeout(function () {
					success(newVal + ' Meyer');
				}, 1);
			}
		});
		stop();
		var me = new Meyer();
		me.bind('name', function (ev, newVal) {
			equal(newVal, 'Justin Meyer');
			equal(me.attr('name'), 'Justin Meyer');
			start();
		});
		me.attr('name', 'Justin');
	});
})(undefined, __m30);

// ## map/validations/validations_test.js
var __m63 = (function () {
	module('can/map/validations', {
		setup: function () {
			can.Map.extend('Person', {}, {});
		}
	});
	test('observe can validate, events, callbacks', 7, function () {
		Person.validate('age', {
			message: 'it\'s a date type'
		}, function (val) {
			return !(this.date instanceof Date);
		});
		var task = new Person({
			age: 'bad'
		}),
			errors = task.errors();
		ok(errors, 'There are errors');
		equal(errors.age.length, 1, 'there is one error');
		equal(errors.age[0], 'it\'s a date type', 'error message is right');
		task.bind('error', function (ev, attr, errs) {
			ok(this === task, 'we get task back by binding');
			ok(errs, 'There are errors');
			equal(errs.age.length, 1, 'there is one error');
			equal(errs.age[0], 'it\'s a date type', 'error message is right');
		});
		task.attr('age', 'blah');
		task.unbind('error');
		task.attr('age', 'blaher');
	});
	test('validatesFormatOf', function () {
		Person.validateFormatOf('thing', /\d-\d/);
		ok(!new Person({
				thing: '1-2'
			})
			.errors(), 'no errors');
		var errors = new Person({
			thing: 'foobar'
		})
			.errors();
		ok(errors, 'there are errors');
		equal(errors.thing.length, 1, 'one error on thing');
		equal(errors.thing[0], 'is invalid', 'basic message');
		Person.validateFormatOf('otherThing', /\d/, {
			message: 'not a digit'
		});
		var errors2 = new Person({
			thing: '1-2',
			otherThing: 'a'
		})
			.errors();
		equal(errors2.otherThing[0], 'not a digit', 'can supply a custom message');
		ok(!new Person({
				thing: '1-2',
				otherThing: null
			})
			.errors(), 'can handle null');
		ok(!new Person({
				thing: '1-2'
			})
			.errors(), 'can handle undefiend');
	});
	test('validatesInclusionOf', function () {
		Person.validateInclusionOf('thing', [
			'yes',
			'no',
			'maybe'
		]);
		ok(!new Person({
				thing: 'yes'
			})
			.errors(), 'no errors');
		var errors = new Person({
			thing: 'foobar'
		})
			.errors();
		ok(errors, 'there are errors');
		equal(errors.thing.length, 1, 'one error on thing');
		equal(errors.thing[0], 'is not a valid option (perhaps out of range)', 'basic message');
		Person.validateInclusionOf('otherThing', [
			'yes',
			'no',
			'maybe'
		], {
			message: 'not a valid option'
		});
		var errors2 = new Person({
			thing: 'yes',
			otherThing: 'maybe not'
		})
			.errors();
		equal(errors2.otherThing[0], 'not a valid option', 'can supply a custom message');
	});
	test('validatesLengthOf', function () {
		Person.validateLengthOf('undefinedValue', 0, 5);
		Person.validateLengthOf('nullValue', 0, 5);
		Person.validateLengthOf('thing', 2, 5);
		ok(!new Person({
				thing: 'yes',
				nullValue: null
			})
			.errors(), 'no errors');
		var errors = new Person({
			thing: 'foobar'
		})
			.errors();
		ok(errors, 'there are errors');
		equal(errors.thing.length, 1, 'one error on thing');
		equal(errors.thing[0], 'is too long (max=5)', 'basic message');
		Person.validateLengthOf('otherThing', 2, 5, {
			message: 'invalid length'
		});
		var errors2 = new Person({
			thing: 'yes',
			otherThing: 'too long'
		})
			.errors();
		equal(errors2.otherThing[0], 'invalid length', 'can supply a custom message');
		Person.validateLengthOf('undefinedValue2', 1, 5);
		Person.validateLengthOf('nullValue2', 1, 5);
		var errors3 = new Person({
			thing: 'yes',
			nullValue2: null
		})
			.errors();
		equal(errors3.undefinedValue2.length, 1, 'can handle undefined');
		equal(errors3.nullValue2.length, 1, 'can handle null');
	});
	test('validatesPresenceOf', function () {
		can.Map.extend('Task', {
			init: function () {
				this.validatePresenceOf('dueDate');
			}
		}, {});
		//test for undefined
		var task = new Task(),
			errors = task.errors();
		ok(errors);
		ok(errors.dueDate);
		equal(errors.dueDate[0], 'can\'t be empty', 'right message');
		//test for null
		task = new Task({
			dueDate: null
		});
		errors = task.errors();
		ok(errors);
		ok(errors.dueDate);
		equal(errors.dueDate[0], 'can\'t be empty', 'right message');
		//test for ""
		task = new Task({
			dueDate: ''
		});
		errors = task.errors();
		ok(errors);
		ok(errors.dueDate);
		equal(errors.dueDate[0], 'can\'t be empty', 'right message');
		//Affirmative test
		task = new Task({
			dueDate: 'yes'
		});
		errors = task.errors();
		ok(!errors, 'no errors ' + typeof errors);
		can.Map.extend('Task', {
			init: function () {
				this.validatePresenceOf('dueDate', {
					message: 'You must have a dueDate'
				});
			}
		}, {});
		task = new Task({
			dueDate: 'yes'
		});
		errors = task.errors();
		ok(!errors, 'no errors ' + typeof errors);
	});
	test('validatesPresenceOf with numbers and a 0 value', function () {
		can.Map.extend('Person', {
			attributes: {
				age: 'number'
			}
		});
		Person.validatePresenceOf('age');
		var person = new Person();
		var errors = person.errors();
		ok(errors);
		ok(errors.age);
		equal(errors.age[0], 'can\'t be empty', 'A new Person with no age generates errors.');
		//test for null
		person = new Person({
			age: null
		});
		errors = person.errors();
		ok(errors);
		ok(errors.age);
		equal(errors.age[0], 'can\'t be empty', 'A new Person with null age generates errors.');
		//test for ""
		person = new Person({
			age: ''
		});
		errors = person.errors();
		ok(errors);
		ok(errors.age);
		equal(errors.age[0], 'can\'t be empty', 'A new Person with an empty string age generates errors.');
		//Affirmative test
		person = new Person({
			age: 12
		});
		errors = person.errors();
		ok(!errors, 'A new Person with a valid >0 age doesn\'t generate errors.');
		//Affirmative test with 0
		person = new Person({
			age: 0
		});
		errors = person.errors();
		ok(!errors, 'A new Person with a valid 0 age doesn\'t generate errors');
	});
	test('validatesRangeOf', function () {
		Person.validateRangeOf('thing', 2, 5);
		Person.validateRangeOf('nullValue', 0, 5);
		Person.validateRangeOf('undefinedValue', 0, 5);
		ok(!new Person({
				thing: 4,
				nullValue: null
			})
			.errors(), 'no errors');
		var errors = new Person({
			thing: 6
		})
			.errors();
		ok(errors, 'there are errors');
		equal(errors.thing.length, 1, 'one error on thing');
		equal(errors.thing[0], 'is out of range [2,5]', 'basic message');
		Person.validateRangeOf('otherThing', 2, 5, {
			message: 'value out of range'
		});
		var errors2 = new Person({
			thing: 4,
			otherThing: 6
		})
			.errors();
		equal(errors2.otherThing[0], 'value out of range', 'can supply a custom message');
		Person.validateRangeOf('nullValue2', 1, 5);
		Person.validateRangeOf('undefinedValue2', 1, 5);
		var errors3 = new Person({
			thing: 2,
			nullValue2: null
		})
			.errors();
		equal(errors3.nullValue2.length, 1, 'one error on nullValue2');
		equal(errors3.undefinedValue2.length, 1, 'one error on undefinedValue2');
	});
	test('validatesNumericalityOf', function () {
		Person.validatesNumericalityOf(['foo']);
		var errors;
		errors = new Person({
			foo: 0
		})
			.errors();
		ok(!errors, 'no errors');
		errors = new Person({
			foo: 1
		})
			.errors();
		ok(!errors, 'no errors');
		errors = new Person({
			foo: 1.5
		})
			.errors();
		ok(!errors, 'no errors');
		errors = new Person({
			foo: -1.5
		})
			.errors();
		ok(!errors, 'no errors');
		errors = new Person({
			foo: '1'
		})
			.errors();
		ok(!errors, 'no errors');
		errors = new Person({
			foo: '1.5'
		})
			.errors();
		ok(!errors, 'no errors');
		errors = new Person({
			foo: '.5'
		})
			.errors();
		ok(!errors, 'no errors');
		errors = new Person({
			foo: '-1.5'
		})
			.errors();
		ok(!errors, 'no errors');
		errors = new Person({
			foo: ' '
		})
			.errors();
		equal(errors.foo.length, 1, 'one error on foo');
		errors = new Person({
			foo: '1f'
		})
			.errors();
		equal(errors.foo.length, 1, 'one error on foo');
		errors = new Person({
			foo: 'f1'
		})
			.errors();
		equal(errors.foo.length, 1, 'one error on foo');
		errors = new Person({
			foo: '1.5.5'
		})
			.errors();
		equal(errors.foo.length, 1, 'one error on foo');
		errors = new Person({
			foo: '\t\t'
		})
			.errors();
		equal(errors.foo.length, 1, 'one error on foo');
		errors = new Person({
			foo: '\n\r'
		})
			.errors();
		equal(errors.foo.length, 1, 'one error on foo');
	});
	test('Validate with compute (#410)', function () {
		expect(4);
		Person.validate('age', {
			message: 'it\'s a date type'
		}, function (val) {
			return !(this.date instanceof Date);
		});
		var task = new Person({
			age: 20
		}),
			errors = can.compute(function () {
				return task.errors();
			});
		errors.bind('change', function (ev, errorObj) {
			equal(errorObj.age.length, 1, 'there is one error');
			equal(errorObj.age.length, 1, 'there is one error');
		});
		task.attr('age', 'bad');
		task.attr('age', 'still bad');
	});
})(undefined, undefined, __m30);

// ## map/backup/backup_test.js
var __m65 = (function () {
	module('can/map/backup', {
		setup: function () {
			can.Map.extend('Recipe');
		}
	});
	test('backing up', function () {
		var recipe = new Recipe({
			name: 'cheese'
		});
		ok(!recipe.isDirty(), 'not backedup, but clean');
		recipe.backup();
		ok(!recipe.isDirty(), 'backedup, but clean');
		recipe.attr('name', 'blah');
		ok(recipe.isDirty(), 'dirty');
		recipe.restore();
		ok(!recipe.isDirty(), 'restored, clean');
		equal(recipe.name, 'cheese', 'name back');
	});
	test('backup / restore with associations', function () {
		can.Map('Instruction');
		can.Map('Cookbook');
		can.Map('Recipe', {
			attributes: {
				instructions: 'Instruction.models',
				cookbook: 'Cookbook.model'
			}
		}, {});
		var recipe = new Recipe({
			name: 'cheese burger',
			instructions: [{
				description: 'heat meat'
			}, {
				description: 'add cheese'
			}],
			cookbook: {
				title: 'Justin\'s Grillin Times'
			}
		});
		//test basic is dirty
		ok(!recipe.isDirty(), 'not backedup, but clean');
		recipe.backup();
		ok(!recipe.isDirty(), 'backedup, but clean');
		recipe.attr('name', 'blah');
		ok(recipe.isDirty(), 'dirty');
		recipe.restore();
		ok(!recipe.isDirty(), 'restored, clean');
		equal(recipe.name, 'cheese burger', 'name back');
		// test belongs too
		ok(!recipe.cookbook.isDirty(), 'cookbook not backedup, but clean');
		recipe.cookbook.backup();
		recipe.cookbook.attr('title', 'Brian\'s Burgers');
		ok(!recipe.isDirty(), 'recipe itself is clean');
		ok(recipe.isDirty(true), 'recipe is dirty if checking associations');
		recipe.cookbook.restore();
		ok(!recipe.isDirty(true), 'recipe is now clean with checking associations');
		equal(recipe.cookbook.title, 'Justin\'s Grillin Times', 'cookbook title back');
		//try belongs to recursive restore
		recipe.cookbook.attr('title', 'Brian\'s Burgers');
		recipe.restore();
		ok(recipe.isDirty(true), 'recipe is dirty if checking associations, after a restore');
		recipe.restore(true);
		ok(!recipe.isDirty(true), 'cleaned all of recipe and its associations');
	});
	test('backup restore nested observables', function () {
		var observe = new can.Map({
			nested: {
				test: 'property'
			}
		});
		equal(observe.attr('nested')
			.attr('test'), 'property', 'Nested object got converted');
		observe.backup();
		observe.attr('nested')
			.attr('test', 'changed property');
		equal(observe.attr('nested')
			.attr('test'), 'changed property', 'Nested property changed');
		ok(observe.isDirty(true), 'Observe is dirty');
		observe.restore(true);
		equal(observe.attr('nested')
			.attr('test'), 'property', 'Nested object got restored');
	});
	test('backup removes properties that were added (#607)', function () {
		var map = new can.Map({});
		map.backup();
		map.attr('foo', 'bar');
		ok(map.isDirty(), 'the map with an additional property is dirty');
		map.restore();
		ok(!map.attr('foo'), 'there is no foo property');
	});
})(undefined, undefined, __m30);

// ## map/list/list_test.js
var __m66 = (function () {
	module('can/map/list');
	test('filter', 8, function () {
		var original = new can.List([{
			name: 'Test 1',
			age: 20
		}, {
			name: 'Test 2',
			age: 80
		}, {
			name: 'Test 3',
			age: 1
		}, {
			name: 'Test 4',
			age: 21
		}]);
		var state = new can.Map({
			minAge: 20
		});
		var filtered = original.filter(function (element) {
			return element.attr('age') > state.attr('minAge');
		});
		original.attr('0.age', 22);
		equal(filtered.length, 3, 'Updating age adds a new item to filtered list');
		equal(filtered[filtered.length - 1].attr('age'), 22, 'Item has updated age');
		original.attr('1.age', 18);
		equal(filtered.length, 2, 'Updating age removes existing item from filtered list');
		state.attr('minAge', 80);
		original.attr('1.age', 87);
		equal(filtered.length, 1, 'Filtered list has one item');
		equal(filtered[0].attr('age'), 87, 'Contains single item with udpated age');
		state.attr('minAge', 29);
		original.push({
			name: 'Pushed tester',
			age: 28
		}, {
			name: 'Pushed tester 2',
			age: 30
		});
		equal(filtered.length, 2, 'Newly pushed element got updated according to filter');
		original.pop();
		equal(filtered.length, 1, 'Removed element also removed from filter');
		equal(filtered[0].attr('name'), 'Test 2', 'Older element remains');
	});
	test('attr updates items in position order', function () {
		var original = new can.List([{
			id: 1,
			name: 'Test 1',
			age: 20
		}, {
			id: 2,
			name: 'Test 2',
			age: 80
		}, {
			id: 3,
			name: 'Test 3',
			age: 1
		}]);
		original.attr([{
			id: 1,
			name: 'Test 1',
			age: 120
		}, {
			id: 2,
			name: 'Test 2',
			age: 180
		}, {
			id: 3,
			name: 'Test 3',
			age: 101
		}]);
		equal(original.attr('0.id'), 1);
		equal(original.attr('0.age'), 120, 'Test 1\'s age incremented by 100 years');
		equal(original.attr('1.id'), 2);
		equal(original.attr('1.age'), 180, 'Test 2\'s age incremented by 100 years');
		equal(original.attr('2.id'), 3);
		equal(original.attr('2.age'), 101, 'Test 3\'s age incremented by 100 years');
	});
	test('map', function () {
		var original = new can.List([{
			name: 'Test 1',
			age: 20
		}, {
			name: 'Test 2',
			age: 80
		}, {
			name: 'Test 3',
			age: 1
		}]);
		var mapped = original.map(function (element) {
			return element.attr('name') + ' (' + element.attr('age') + ')';
		});
		equal(mapped.length, 3, 'All items mapped');
		original.attr('0.name', 'Updated test');
		original.attr('0.age', '24');
		equal(mapped[0], 'Updated test (24)', 'Mapping got updated');
		original.push({
			name: 'Push test',
			age: 99
		});
		equal(mapped[mapped.length - 1], 'Push test (' + 99 + ')');
		original.shift();
		equal(mapped.length, 3, 'Item got removed');
	});
})(undefined);

// ## control/plugin/plugin_test.js
var __m70 = (function () {
	if (!window.jQuery) {
		return;
	}

	/* global My */
	module('can/control/plugin');
	test('pluginName', function () {
		expect(8);
		can.Control('My.TestPlugin', {
			pluginName: 'my_plugin'
		}, {
			init: function (el, ops) {
				ok(true, 'Init called');
				equal(ops.testop, 'testing', 'Test argument set');
			},
			method: function (arg) {
				ok(true, 'Method called');
				equal(arg, 'testarg', 'Test argument passed');
			},
			update: function (options) {
				ok(true, 'Update called');
			}
		});
		var ta = can.$('<div/>')
			.addClass('existing_class')
			.appendTo($('#qunit-test-area'));
		ta.my_plugin({
			testop: 'testing'
		});
		// Init
		ok(ta.hasClass('my_plugin'), 'Should have class my_plugin');
		ta.my_plugin();
		// Update
		ta.my_plugin('method', 'testarg');
		// method()
		ta.control()
			.destroy();
		// destroy
		ok(!ta.hasClass('my_plugin'), 'Shouldn\'t have class my_plugin after being destroyed');
		ok(ta.hasClass('existing_class'), 'Existing class should still be there');
	});
	test('.control(), .controls() and _fullname', function () {
		expect(3);
		can.Control('My.TestPlugin', {});
		var ta = can.$('<div/>')
			.appendTo($('#qunit-test-area'));
		ok(ta.my_test_plugin, 'Converting Control name to plugin name worked');
		ta.my_test_plugin();
		equal(ta.controls()
			.length, 1, '.controls() returns one instance');
		ok(ta.control() instanceof My.TestPlugin, 'Control is instance of test plugin');
	});
	test('update', function () {
		can.Control({
			pluginName: 'updateTest'
		}, {});
		var ta = can.$('<div/>')
			.addClass('existing_class')
			.appendTo($('#qunit-test-area'));
		ta.updateTest();
		// Init
		ta.updateTest({
			testop: 'testing'
		});
		equal(ta.control()
			.options.testop, 'testing', 'Test option has been extended properly');
	});
	test('calling methods', function () {
		can.Control({
			pluginName: 'callTest'
		}, {
			returnTest: function () {
				return 'Hi ' + this.name;
			},
			setName: function (name) {
				this.name = name;
			}
		});
		var ta = can.$('<div/>')
			.appendTo($('#qunit-test-area'));
		ta.callTest();
		ok(ta.callTest('setName', 'Tester') instanceof jQuery, 'Got jQuery element as return value');
		equal(ta.callTest('returnTest'), 'Hi Tester', 'Got correct return value');
	});
	test('always use pluginName first in .control(name) (#448)', 4, function () {
		can.Control('SomeName', {
			pluginName: 'someTest'
		}, {});
		can.Control({
			pluginName: 'otherTest'
		}, {});
		var ta = can.$('<div/>')
			.appendTo($('#qunit-test-area'));
		ta.someTest();
		ta.otherTest();
		var control = ta.control('someTest');
		ok(control, 'Got a control from pluginName');
		equal(control.constructor.pluginName, 'someTest', 'Got correct control');
		control = ta.control('otherTest');
		ok(control, 'Got a control from pluginName');
		equal(control.constructor.pluginName, 'otherTest', 'Got correct control');
	});
})(undefined);

// ## view/modifiers/modifiers_test.js
var __m72 = (function () {
	// this only applied to jQuery libs
	if (!window.jQuery) {
		return;
	}
	module('can/view/modifiers');
	test('modifier with a deferred', function () {
		can.$('#qunit-test-area')
			.html('');
			
		stop();
		var foo = can.Deferred();
		
		can.$('#qunit-test-area')
			.html(can.test.path('view/test/deferred.ejs'), foo);
	
		var templateLoaded = new can.Deferred(),
			id = can.view.toId( can.test.path('view/test/deferred.ejs') );
			
		setTimeout(function () {
			foo.resolve({
				foo: 'FOO'
			});
		}, 1);
			
		// keep polling cache until the view is loaded
		var check = function(){
			if(can.view.cached[id]) {
				templateLoaded.resolve();
			} else {
				setTimeout(check, 10);
			}
		};
		setTimeout(check, 10);

		can.when(foo, templateLoaded).then(function(foo){
			setTimeout(function(){
				equal(can.$('#qunit-test-area')
					.html(), 'FOO', 'worked!');
				start();
				
			},1);
			
		});
		
	});
	/*test("non-HTML content in hookups", function(){
	 $("#qunit-test-area").html("<textarea></textarea>");
	 can.render.hookup(function(){});
	 $("#qunit-test-area textarea").val("asdf");
	 equal($("#qunit-test-area textarea").val(), "asdf");
	 });*/
	test('html takes promise', function () {
		var d = new can.Deferred();
		can.$('#qunit-test-area')
			.html(d);
		stop();
		d.done(function () {
			equal(can.$('#qunit-test-area')
				.html(), 'Hello World', 'deferred is working');
			start();
		});
		setTimeout(function () {
			d.resolve('Hello World');
		}, 10);
	});
	test('val set with a template within a hookup within another template', function () {
		var frag = can.view(can.test.path('view/test/hookupvalcall.ejs'), {});
		var div = document.createElement('div');
		div.appendChild(frag);
		equal(div.getElementsByTagName('div')[0].getElementsByTagName('h3')[0].innerHTML, 'in div', 'Rendered withing other template');
	});
	test('jQuery.fn.hookup', function () {
		can.$('#qunit-test-area')
			.html('');
		var els = $(can.view.render(can.test.path('view/test/hookup.ejs'), {}))
			.hookup();
		can.$('#qunit-test-area')
			.html(els);
		//makes sure no error happens
		equal(can.$('#qunit-test-area')[0].getElementsByTagName('div')[0].id, 'dummy', 'Element hooked up');
	});
	test('hookups don\'t break script execution (issue #130)', function () {
		// this simulates a pending hookup (hasn't been run yet)
		can.view.hook(function () {});
		// this simulates HTML with script tags being loaded (probably legacy code)
		can.$('#qunit-test-area')
			.html('<script>can.$(\'#qunit-test-area\').html(\'OK\')</script>');
		equal(can.$('#qunit-test-area')
			.html(), 'OK');
		can.$('#qunit-test-area')
			.html('');
	});
})(undefined, undefined, undefined, __m30);

// ## util/object/object_test.js
var __m74 = (function () {
	module('can/util/object');
	test('same', function () {
		ok(can.Object.same({
			type: 'FOLDER'
		}, {
			type: 'FOLDER',
			count: 5
		}, {
			count: null
		}), 'count ignored');
		ok(can.Object.same({
			type: 'folder'
		}, {
			type: 'FOLDER'
		}, {
			type: 'i'
		}), 'folder case ignored');
	});
	test('subsets', function () {
		var res1 = can.Object.subsets({
			parentId: 5,
			type: 'files'
		}, [{
			parentId: 6
		}, {
			type: 'folders'
		}, {
			type: 'files'
		}]);
		deepEqual(res1, [{
			type: 'files'
		}]);
		var res2 = can.Object.subsets({
			parentId: 5,
			type: 'files'
		}, [{}, {
			type: 'folders'
		}, {
			type: 'files'
		}]);
		deepEqual(res2, [{}, {
			type: 'files'
		}]);
		var res3 = can.Object.subsets({
			parentId: 5,
			type: 'folders'
		}, [{
			parentId: 5
		}, {
			type: 'files'
		}]);
		deepEqual(res3, [{
			parentId: 5
		}]);
	});
	test('subset compare', function () {
		ok(can.Object.subset({
			type: 'FOLDER'
		}, {
			type: 'FOLDER'
		}), 'equal sets');
		ok(can.Object.subset({
			type: 'FOLDER',
			parentId: 5
		}, {
			type: 'FOLDER'
		}), 'sub set');
		ok(!can.Object.subset({
			type: 'FOLDER'
		}, {
			type: 'FOLDER',
			parentId: 5
		}), 'wrong way');
		ok(!can.Object.subset({
			type: 'FOLDER',
			parentId: 7
		}, {
			type: 'FOLDER',
			parentId: 5
		}), 'different values');
		ok(can.Object.subset({
			type: 'FOLDER',
			count: 5
		}, {
			type: 'FOLDER'
		}, {
			count: null
		}), 'count ignored');
		ok(can.Object.subset({
			type: 'FOLDER',
			kind: 'tree'
		}, {
			type: 'FOLDER',
			foo: true,
			bar: true
		}, {
			foo: null,
			bar: null
		}), 'understands a subset');
		ok(can.Object.subset({
			type: 'FOLDER',
			foo: true,
			bar: true
		}, {
			type: 'FOLDER',
			kind: 'tree'
		}, {
			foo: null,
			bar: null,
			kind: null
		}), 'ignores nulls');
	});
	test('searchText', function () {
		var item = {
			id: 1,
			name: 'thinger'
		}, searchText = {
				searchText: 'foo'
			}, compare = {
				searchText: function (items, paramsText, itemr, params) {
					equal(item, itemr);
					equal(searchText, params);
					return true;
				}
			};
		ok(can.Object.subset(item, searchText, compare), 'searchText');
	});
})(undefined);

// ## util/fixture/fixture_test.js
var __m75 = (function () {
	module('can/util/fixture');
	test('static fixtures', function () {
		stop();
		can.fixture('GET something', can.test.path('util/fixture/fixtures/test.json'));
		can.fixture('POST something', can.test.path('util/fixture/fixtures/test.json'));
		can.ajax({
			url: 'something',
			dataType: 'json'
		})
			.done(function (data) {
				equal(data.sweet, 'ness', 'can.get works');
				can.ajax({
					url: 'something',
					method: 'POST',
					dataType: 'json'
				})
					.done(function (data) {
						equal(data.sweet, 'ness', 'can.post works');
						start();
					});
			});
	});
	test('templated static fixtures', function () {
		stop();
		can.fixture('GET some/{id}', can.test.path('util/fixture/fixtures/stuff.{id}.json'));
		can.ajax({
			url: 'some/3',
			dataType: 'json'
		})
			.done(function (data) {
				equal(data.id, 3, 'Got data with proper id');
				start();
			});
	});
	test('dynamic fixtures', function () {
		stop();
		can.fixture.delay = 10;
		can.fixture('something', function () {
			return [{
				sweet: 'ness'
			}];
		});
		can.ajax({
			url: 'something',
			dataType: 'json'
		})
			.done(function (data) {
				equal(data.sweet, 'ness', 'can.get works');
				start();
			});
	});
	test('fixture function', 3, function () {
		stop();
		var url = can.test.path('util/fixture/fixtures/foo.json');
		can.fixture(url, can.test.path('util/fixture/fixtures/foobar.json'));
		can.ajax({
			url: url,
			dataType: 'json'
		})
			.done(function (data) {
				equal(data.sweet, 'ner', 'url passed works');
				can.fixture(url, can.test.path('util/fixture/fixtures/test.json'));
				can.ajax({
					url: url,
					dataType: 'json'
				})
					.done(function (data) {
						equal(data.sweet, 'ness', 'replaced');
						can.fixture(url, null);
						can.ajax({
							url: url,
							dataType: 'json'
						})
							.done(function (data) {
								equal(data.a, 'b', 'removed');
								start();
							});
					});
			});
	});
	// Converters only work with jQuery
	if (typeof jQuery !== 'undefined') {
		test('fixtures with converters', function () {
			stop();
			can.ajax({
				url: can.test.path('util/fixture/fixtures/foobar.json'),
				dataType: 'json fooBar',
				converters: {
					'json fooBar': function (data) {
						// Extract relevant text from the xml document
						return 'Mr. ' + data.name;
					}
				},
				fixture: function () {
					return {
						name: 'Justin'
					};
				},
				success: function (prettyName) {
					start();
					equal(prettyName, 'Mr. Justin');
				}
			});
		});
	}
	test('can.fixture.store fixtures', function () {
		stop();
		can.fixture.store('thing', 1000, function (i) {
			return {
				id: i,
				name: 'thing ' + i
			};
		}, function (item, settings) {
			if (settings.data.searchText) {
				var regex = new RegExp('^' + settings.data.searchText);
				return regex.test(item.name);
			}
		});
		can.ajax({
			url: 'things',
			dataType: 'json',
			data: {
				offset: 100,
				limit: 200,
				order: ['name ASC'],
				searchText: 'thing 2'
			},
			fixture: '-things',
			success: function (things) {
				equal(things.data[0].name, 'thing 29', 'first item is correct');
				equal(things.data.length, 11, 'there are 11 items');
				start();
			}
		});
	});
	test('simulating an error', function () {
		var st = '{type: "unauthorized"}';
		can.fixture('/foo', function (request, response) {
			return response(401, st);
		});
		stop();
		can.ajax({
			url: '/foo',
			dataType: 'json'
		})
			.done(function () {
				ok(false, 'success called');
				start();
			})
			.fail(function (original, type, text) {
				ok(true, 'error called');
				equal(text, st, 'Original text passed');
				start();
			});
	});
	test('rand', function () {
		var rand = can.fixture.rand;
		var num = rand(5);
		equal(typeof num, 'number');
		ok(num >= 0 && num < 5, 'gets a number');
		stop();
		var zero, three, between, next = function () {
				start();
			};
		// make sure rand can be everything we need
		setTimeout(function timer() {
			var res = rand([1, 2, 3]);

			if (res.length === 0) {
				zero = true;
			} else if (res.length === 3) {
				three = true;
			} else {
				between = true;
			}
			if (zero && three && between) {
				ok(true, 'got zero, three, between');
				next();
			} else {
				setTimeout(timer, 10);
			}
		}, 10);
	});
	test('_getData', function () {
		var data = can.fixture._getData('/thingers/{id}', '/thingers/5');
		equal(data.id, 5, 'gets data');
		data = can.fixture._getData('/thingers/5?hi.there', '/thingers/5?hi.there');
		deepEqual(data, {}, 'gets data');
	});
	test('_getData with double character value', function () {
		var data = can.fixture._getData('/days/{id}/time_slots.json', '/days/17/time_slots.json');
		equal(data.id, 17, 'gets data');
	});
	test('_compare', function () {
		var same = can.Object.same({
			url: '/thingers/5'
		}, {
			url: '/thingers/{id}'
		}, can.fixture._compare);
		ok(same, 'they are similar');
		same = can.Object.same({
			url: '/thingers/5'
		}, {
			url: '/thingers'
		}, can.fixture._compare);
		ok(!same, 'they are not the same');
	});
	test('_similar', function () {
		var same = can.fixture._similar({
			url: '/thingers/5'
		}, {
			url: '/thingers/{id}'
		});
		ok(same, 'similar');
		same = can.fixture._similar({
			url: '/thingers/5',
			type: 'get'
		}, {
			url: '/thingers/{id}'
		});
		ok(same, 'similar with extra pops on settings');
		var exact = can.fixture._similar({
			url: '/thingers/5',
			type: 'get'
		}, {
			url: '/thingers/{id}'
		}, true);
		ok(!exact, 'not exact');
		exact = can.fixture._similar({
			url: '/thingers/5'
		}, {
			url: '/thingers/5'
		}, true);
		ok(exact, 'exact');
	});
	test('fixture function gets id', function () {
		can.fixture('/thingers/{id}', function (settings) {
			return {
				id: settings.data.id,
				name: 'justin'
			};
		});
		stop();
		can.ajax({
			url: '/thingers/5',
			dataType: 'json',
			data: {
				id: 5
			}
		})
			.done(function (data) {
				ok(data.id);
				start();
			});
	});
	test('replacing and removing a fixture', function () {
		var url = can.test.path('util/fixture/fixtures/remove.json');
		can.fixture('GET ' + url, function () {
			return {
				weird: 'ness!'
			};
		});
		stop();
		can.ajax({
			url: url,
			dataType: 'json'
		})
			.done(function (json) {
				equal(json.weird, 'ness!', 'fixture set right');
				can.fixture('GET ' + url, function () {
					return {
						weird: 'ness?'
					};
				});
				can.ajax({
					url: url,
					dataType: 'json'
				})
					.done(function (json) {
						equal(json.weird, 'ness?', 'fixture set right');
						can.fixture('GET ' + url, null);
						can.ajax({
							url: url,
							dataType: 'json'
						})
							.done(function (json) {
								equal(json.weird, 'ness', 'fixture set right');
								start();
							});
					});
			});
	});
	/*
	 removed test, makes phantom js build fail. does not fail browser tests. Opened issue #408 to track, for milestone 1.2
	 //TODO re-enable test and determine why it fails in phantom but not in real browser. https://github.com/canjs/canjs/issues/408
	 */
	test('can.fixture.store with can.Model', function () {
		var store = can.fixture.store(100, function (i) {
			return {
				id: i,
				name: 'Object ' + i
			};
		}),
			Model = can.Model({
				findAll: 'GET /models',
				findOne: 'GET /models/{id}',
				create: 'POST /models',
				update: 'PUT /models/{id}',
				destroy: 'DELETE /models/{id}'
			}, {});
		can.fixture('GET /models', store.findAll);
		can.fixture('GET /models/{id}', store.findOne);
		can.fixture('POST /models', store.create);
		can.fixture('PUT /models/{id}', store.update);
		can.fixture('DELETE /models/{id}', store.destroy);
		stop();
		Model.findAll()
			.done(function (models) {
				equal(models.length, 100, 'Got 100 models for findAll with no parameters');
				equal(models[95].name, 'Object 95', 'All models generated properly');
				Model.findOne({
					id: 51
				})
					.done(function (data) {
						equal(data.id, 51, 'Got correct object id');
						equal('Object 51', data.name, 'Object name generated correctly');
						new Model({
							name: 'My test object'
						})
							.save()
							.done(function (newmodel) {
								equal(newmodel.id, 100, 'Id got incremented');
								equal(newmodel.name, 'My test object');
								// Tests creating, deleting, updating
								Model.findOne({
									id: 100
								})
									.done(function (model) {
										equal(model.id, 100, 'Loaded new object');
										model.attr('name', 'Updated test object');
										model.save()
											.done(function (model) {
												equal(model.name, 'Updated test object', 'Successfully updated object');
												model.destroy()
													.done(function (deleted) {
														start();
													});
											});
									});
							});
					});
			});
	});
	test('can.fixture with response callback', 4, function () {
		can.fixture.delay = 10;
		can.fixture('responseCb', function (orig, response) {
			response({
				sweet: 'ness'
			});
		});
		can.fixture('responseErrorCb', function (orig, response) {
			response(404, 'This is an error from callback');
		});
		stop();
		can.ajax({
			url: 'responseCb',
			dataType: 'json'
		})
			.done(function (data) {
				equal(data.sweet, 'ness', 'can.get works');
				start();
			});
		stop();
		can.ajax({
			url: 'responseErrorCb',
			dataType: 'json'
		})
			.fail(function (orig, error, text) {
				equal(error, 'error', 'Got error status');
				equal(text, 'This is an error from callback', 'Got error text');
				start();
			});
		stop();
		can.fixture('cbWithTimeout', function (orig, response) {
			setTimeout(function () {
				response([{
					epic: 'ness'
				}]);
			}, 10);
		});
		can.ajax({
			url: 'cbWithTimeout',
			dataType: 'json'
		})
			.done(function (data) {
				equal(data[0].epic, 'ness', 'Got responsen with timeout');
				start();
			});
	});
	test('store create works with an empty array of items', function () {
		var store = can.fixture.store(0, function () {
			return {};
		});
		store.create({
			data: {}
		}, function (responseData, responseHeaders) {
			equal(responseData.id, 0, 'the first id is 0');
		});
	});
	test('store creates sequential ids', function () {
		var store = can.fixture.store(0, function () {
			return {};
		});
		store.create({
			data: {}
		}, function (responseData, responseHeaders) {
			equal(responseData.id, 0, 'the first id is 0');
		});
		store.create({
			data: {}
		}, function (responseData, responseHeaders) {
			equal(responseData.id, 1, 'the second id is 1');
		});
		store.destroy({
			data: {
				id: 0
			}
		});
		store.create({
			data: {}
		}, function (responseData, responseHeaders) {
			equal(responseData.id, 2, 'the third id is 2');
		});
	});
})(undefined);

// ## view/bindings/bindings_test.js
var __m76 = (function () {
	module('can/view/bindings', {
		setup: function () {
			document.getElementById('qunit-test-area')
				.innerHTML = '';
		}
	});
	test('can-event handlers', function () {
		expect(4);
		var template = can.view.mustache('<div>' + '{{#each foodTypes}}' + '<p can-click=\'doSomething\'>{{content}}</p>' + '{{/each}}' + '</div>');
		var foodTypes = new can.List([{
			title: 'Fruits',
			content: 'oranges, apples'
		}, {
			title: 'Breads',
			content: 'pasta, cereal'
		}, {
			title: 'Sweets',
			content: 'ice cream, candy'
		}]);
		var doSomething = function (foodType, el, ev) {
			ok(true, 'doSomething called');
			equal(el[0].nodeName.toLowerCase(), 'p', 'this is the element');
			equal(ev.type, 'click', '1st argument is the event');
			equal(foodType, foodTypes[0], '2nd argument is the 1st foodType');
		};
		var frag = template({
			foodTypes: foodTypes,
			doSomething: doSomething
		});
		var ta = document.getElementById('qunit-test-area');
		ta.appendChild(frag);
		var p0 = ta.getElementsByTagName('p')[0];
		can.trigger(p0, 'click');
	});
	test('can-value input text', function () {
		var template = can.view.mustache('<input can-value=\'age\'/>');
		var map = new can.Map();
		var frag = template(map);
		var ta = document.getElementById('qunit-test-area');
		ta.appendChild(frag);
		var input = ta.getElementsByTagName('input')[0];
		equal(input.value, '', 'input value set correctly if key does not exist in map');
		map.attr('age', '30');
		equal(input.value, '30', 'input value set correctly');
		map.attr('age', '31');
		equal(input.value, '31', 'input value update correctly');
		input.value = '32';
		can.trigger(input, 'change');
		equal(map.attr('age'), '32', 'updated from input');
	});
	test('can-value input radio', function () {
		var template = can.view.mustache('<input type=\'radio\' can-value=\'color\' value=\'red\'/> Red<br/>' + '<input type=\'radio\' can-value=\'color\' value=\'green\'/> Green<br/>');
		var map = new can.Map({
			color: 'red'
		});
		var frag = template(map);
		var ta = document.getElementById('qunit-test-area');
		ta.appendChild(frag);
		var inputs = ta.getElementsByTagName('input');
		ok(inputs[0].checked, 'first input checked');
		ok(!inputs[1].checked, 'second input not checked');
		map.attr('color', 'green');
		ok(!inputs[0].checked, 'first notinput checked');
		ok(inputs[1].checked, 'second input checked');
		inputs[0].checked = true;
		inputs[1].checked = false;
		can.trigger(inputs[0], 'change');
		equal(map.attr('color'), 'red', 'updated from input');
	});
	test('can-enter', function () {
		var template = can.view.mustache('<input can-enter=\'update\'/>');
		var called = 0;
		var frag = template({
			update: function () {
				called++;
				ok(called, 1, 'update called once');
			}
		});
		var input = frag.childNodes[0];
		can.trigger(input, {
			type: 'keyup',
			keyCode: 38
		});
		can.trigger(input, {
			type: 'keyup',
			keyCode: 13
		});
	});
	test('two bindings on one element call back the correct method', function () {
		expect(2);
		var template = can.view.mustache('<input can-blur=\'first\' can-click=\'second\'/>');
		var callingFirst = false,
			callingSecond = false;
		var frag = template({
			first: function () {
				ok(callingFirst, 'called first');
			},
			second: function () {
				ok(callingSecond, 'called second');
			}
		});
		var input = frag.childNodes[0];
		callingFirst = true;
		can.trigger(input, {
			type: 'blur'
		});
		callingFirst = false;
		callingSecond = true;
		can.trigger(input, {
			type: 'click'
		});
	});
	asyncTest('can-value select remove from DOM', function () {
		expect(1);
		var template = can.view.mustache('<select can-value=\'color\'>' + '<option value=\'red\'>Red</option>' + '<option value=\'green\'>Green</option>' + '</select>'),
			frag = template(),
			ta = document.getElementById('qunit-test-area');
		ta.appendChild(frag);
		can.remove(can.$('select', ta));
		setTimeout(function () {
			start();
			ok(true, 'Nothing should break if we just add and then remove the select');
		}, 10);
	});
	test('checkboxes with can-value bind properly (#628)', function () {
		var data = new can.Map({
			completed: true
		}),
			frag = can.view.mustache('<input type="checkbox" can-value="completed"/>')(data);
		can.append(can.$('#qunit-test-area'), frag);
		var input = can.$('#qunit-test-area')[0].getElementsByTagName('input')[0];
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
})(undefined, undefined, __m30);

// ## view/live/live_test.js
var __m77 = (function () {
	module('can/view/live');
	test('html', function () {
		var div = document.createElement('div'),
			span = document.createElement('span');
		div.appendChild(span);
		var items = new can.List([
			'one',
			'two'
		]);
		var html = can.compute(function () {
			var html = '';
			items.each(function (item) {
				html += '<label>' + item + '</label>';
			});
			return html;
		});
		can.view.live.html(span, html, div);
		equal(div.getElementsByTagName('label')
			.length, 2);
		items.push('three');
		equal(div.getElementsByTagName('label')
			.length, 3);
	});
	var esc = function (str) {
		return str.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	};
	test('text', function () {
		var div = document.createElement('div'),
			span = document.createElement('span');
		div.appendChild(span);
		var items = new can.List([
			'one',
			'two'
		]);
		var text = can.compute(function () {
			var html = '';
			items.each(function (item) {
				html += '<label>' + item + '</label>';
			});
			return html;
		});
		can.view.live.text(span, text, div);
		equal(div.innerHTML, esc('<label>one</label><label>two</label>'));
		items.push('three');
		equal(div.innerHTML, esc('<label>one</label><label>two</label><label>three</label>'));
	});
	test('attributes', function () {
		var div = document.createElement('div');
		var items = new can.List([
			'class',
			'foo'
		]);
		var text = can.compute(function () {
			var html = '';
			if (items.attr(0) && items.attr(1)) {
				html += items.attr(0) + '=\'' + items.attr(1) + '\'';
			}
			return html;
		});
		can.view.live.attributes(div, text);
		equal(div.className, 'foo');
		items.splice(0, 2);
		equal(div.className, '');
		items.push('foo', 'bar');
		equal(div.getAttribute('foo'), 'bar');
	});
	test('attribute', function () {
		var div = document.createElement('div');
		div.className = 'foo ' + can.view.live.attributePlaceholder + ' ' + can.view.live.attributePlaceholder + ' end';
		var firstObject = new can.Map({});
		var first = can.compute(function () {
			return firstObject.attr('selected') ? 'selected' : '';
		});
		var secondObject = new can.Map({});
		var second = can.compute(function () {
			return secondObject.attr('active') ? 'active' : '';
		});
		can.view.live.attribute(div, 'class', first);
		can.view.live.attribute(div, 'class', second);
		equal(div.className, 'foo   end');
		firstObject.attr('selected', true);
		equal(div.className, 'foo selected  end');
		secondObject.attr('active', true);
		equal(div.className, 'foo selected active end');
		firstObject.attr('selected', false);
		equal(div.className, 'foo  active end');
	});
	test('specialAttribute with new line', function () {
		var div = document.createElement('div');
		var style = can.compute('style="width: 50px;\nheight:50px;"');
		can.view.live.specialAttribute(div, 'style', style);
		equal(div.style.height, '50px');
		equal(div.style.width, '50px');
	});
	test('list', function () {
		var div = document.createElement('div'),
			list = new can.List([
				'sloth',
				'bear'
			]),
			template = function (animal) {
				return '<label>Animal=</label> <span>' + animal + '</span>';
			};
		div.innerHTML = 'my <b>fav</b> animals: <span></span> !';
		var el = div.getElementsByTagName('span')[0];
		can.view.live.list(el, list, template, {});
		equal(div.getElementsByTagName('label')
			.length, 2, 'There are 2 labels');
		div.getElementsByTagName('label')[0].myexpando = 'EXPANDO-ED';
		list.push('turtle');
		equal(div.getElementsByTagName('label')[0].myexpando, 'EXPANDO-ED', 'same expando');
		equal(div.getElementsByTagName('span')[2].innerHTML, 'turtle', 'turtle added');
	});
	test('list with a compute', function () {
		var div = document.createElement('div'),
			map = new can.Map({
				animals: [
					'bear',
					'turtle'
				]
			}),
			template = function (animal) {
				return '<label>Animal=</label> <span>' + animal + '</span>';
			};
		var compute = can.compute(function () {
			return map.attr('animals');
		});
		div.innerHTML = 'my <b>fav</b> animals: <span></span> !';
		var el = div.getElementsByTagName('span')[0];
		can.view.live.list(el, compute, template, {});
		equal(div.getElementsByTagName('label')
			.length, 2, 'There are 2 labels');
		div.getElementsByTagName('label')[0].myexpando = 'EXPANDO-ED';
		map.attr('animals')
			.push('turtle');
		equal(div.getElementsByTagName('label')[0].myexpando, 'EXPANDO-ED', 'same expando');
		equal(div.getElementsByTagName('span')[2].innerHTML, 'turtle', 'turtle added');
		map.attr('animals', new can.List([
			'sloth',
			'bear',
			'turtle'
		]));
		var spans = div.getElementsByTagName('span');
		equal(spans.length, 3, 'there are 3 spans');
		ok(!div.getElementsByTagName('label')[0].myexpando, 'no expando');
	});
	test('list with a compute that returns a list', function () {
		var div = document.createElement('div'),
			template = function (num) {
				return '<label>num=</label> <span>' + num + '</span>';
			};
		var compute = can.compute([
			0,
			1
		]);
		div.innerHTML = 'my <b>fav</b> nums: <span></span> !';
		var el = div.getElementsByTagName('span')[0];
		can.view.live.list(el, compute, template, {});
		equal(div.getElementsByTagName('label')
			.length, 2, 'There are 2 labels');
		compute([
			0,
			1,
			2
		]);
		var spans = div.getElementsByTagName('span');
		equal(spans.length, 3, 'there are 3 spans');
	});
	test('text binding is memory safe (#666)', function () {
		can.view.nodeLists.nodeMap = {};
		var div = document.createElement('div'),
			span = document.createElement('span'),
			el = can.$(div),
			text = can.compute(function () {
				return 'foo';
			});
		div.appendChild(span);
		can.$('#qunit-test-area')[0].appendChild(div);
		can.view.live.text(span, text, div);
		can.remove(el);
		stop();
		setTimeout(function () {
			ok(can.isEmptyObject(can.view.nodeLists.nodeMap), 'nothing in nodeMap');
			start();
		}, 100);
	});
})(undefined, undefined, __m30);

// ## view/scope/scope_test.js
var __m78 = (function () {
	module('can/view/scope');
	/*	test("basics",function(){

	 var items = { people: [{name: "Justin"},[{name: "Brian"}]], count: 1000 }; 

	 var itemsScope = new can.view.Scope(items),
	 arrayScope = new can.view.Scope(itemsScope.attr('people'), itemsScope),
	 firstItem = new can.view.Scope( arrayScope.attr('0'), arrayScope );

	 var nameInfo = firstItem.get('name');
	 equal(nameInfo.name, "name");
	 equal(nameInfo.scope, firstItem);
	 equal(nameInfo.value,"Justin");
	 equal(nameInfo.parent, items.people[0]);

	 var countInfo = firstItem.get('count');
	 equal( countInfo.name, "count" );
	 equal( countInfo.scope, itemsScope );
	 equal(countInfo.value,1000);
	 equal(countInfo.parent, items);

	 });*/
	/*
	 * REMOVE
	 test("adding items",function(){
	 expect(1);

	 var base = new can.view.Scope({}),
	 cur = base.add(new can.Map());


	 cur._data.bind("items",function(ev, newVal, oldVal){
	 ok(newVal.length, "newVal is an array")
	 })

	 cur.attr("items",[1])

	 })(*/
	/*	test("current context",function(){
	 var base = new can.view.Scope({}),
	 cur = base.add("foo")

	 equal( cur.get(".").value, "foo", ". returns value");

	 equal( cur.attr("."), "foo", ". returns value");

	 equal( cur.get("this").value, "foo", "this returns value");

	 equal( cur.attr("this"), "foo", "this returns value");
	 })*/
	/*test("highest scope observe is parent observe",function(){
	 var parent = new can.Map({name: "Justin"})
	 var child = new can.Map({vals: "something"})

	 var base = new can.view.Scope(parent),
	 cur = base.add(child);

	 var data = cur.get("bar")

	 equal(data.parent, parent, "gives highest parent observe")
	 equal(data.value, undefined, "no value")
	 })*/
	/*	test("computes on scope",function(){
	 var base = new can.view.Scope({}),
	 cur = base.add(can.compute({name: {first: "justin"}}));

	 var data = cur.get("name.first");
	 equal(data.value, "justin", "computes on path will be evaluted")
	 })*/
	/*	test("functions on an observe get called with this correctly", function(){

	 var Person = can.Map.extend({
	 fullName: function(){
	 equal( this.attr('first'), "Justin" )
	 }
	 })

	 var me = new Person({name: "Justin"})
	 var base = new can.view.Scope(me),
	 cur = base.add({other: "foo"})

	 var data = cur.get("fullName");

	 equal(data.value, Person.prototype.fullName, "got the raw function");
	 equal(data.parent, me, "parent provided")

	 })*/
	test('can.view.Scope.prototype.computeData', function () {
		var map = new can.Map();
		var base = new can.view.Scope(map);
		var age = base.computeData('age')
			.compute;
		equal(age(), undefined, 'age is not set');
		age.bind('change', function (ev, newVal, oldVal) {
			equal(newVal, 31, 'newVal is provided correctly');
			equal(oldVal, undefined, 'oldVal is undefined');
		});
		age(31);
		equal(map.attr('age'), 31, 'maps age is set correctly');
	});
	test('backtrack path (#163)', function () {
		var row = new can.Map({
			first: 'Justin'
		}),
			col = {
				format: 'str'
			}, base = new can.view.Scope(row),
			cur = base.add(col);
		equal(cur.attr('.'), col, 'got col');
		equal(cur.attr('..'), row, 'got row');
		equal(cur.attr('../first'), 'Justin', 'got row');
	});
	/*	test("use highest default observe in stack", function(){
	 var bottom = new can.Map({
	 name: "bottom"
	 });
	 var top = new can.Map({
	 name: "top"
	 });

	 var base = new can.view.Scope( bottom ),
	 cur = base.add(top);

	 var fooInfo = cur.get("foo");
	 ok(fooInfo.parent ===  top, "we pick the current if we have no leads");

	 })*/

	/*	test("use observe like objects, e.g. can.route, within scope properly", function() {
	 var expected = "video"
	 var cur = new can.view.Scope({}).add(can.route);
	 can.route.attr('type', expected);
	 var type = cur.get('type'); 

	 equal(type.value, expected);
	 equal(type.parent, can.route);
	 })*/
	test('nested properties with compute', function () {
		var me = new can.Map({
			name: {
				first: 'Justin'
			}
		});
		var cur = new can.view.Scope(me);
		var compute = cur.computeData('name.first')
			.compute;
		var changes = 0;
		compute.bind('change', function (ev, newVal, oldVal) {
			if (changes === 0) {
				equal(oldVal, 'Justin');
				equal(newVal, 'Brian');
			} else if (changes === 1) {
				equal(oldVal, 'Brian');
				equal(newVal, undefined);
			} else if (changes === 2) {
				equal(oldVal, undefined);
				equal(newVal, 'Payal');
			} else if (changes === 3) {
				equal(oldVal, 'Payal');
				equal(newVal, 'Curtis');
			}
			changes++;
		});
		equal(compute(), 'Justin');
		me.attr('name.first', 'Brian');
		me.removeAttr('name');
		me.attr('name', {
			first: 'Payal'
		});
		me.attr('name', new can.Map({
			first: 'Curtis'
		}));
	});
	test('function at the end', function () {
		var compute = new can.view.Scope({
			me: {
				info: function () {
					return 'Justin';
				}
			}
		})
			.computeData('me.info')
			.compute;
		equal(compute(), 'Justin');
		var fn = function () {
			return this.name;
		};
		var compute2 = new can.view.Scope({
			me: {
				info: fn,
				name: 'Hank'
			}
		})
			.computeData('me.info', {
				isArgument: true,
				args: []
			})
			.compute;
		equal(compute2()(), 'Hank');
	});
	test('binds to the right scope only', function () {
		var baseMap = new can.Map({
			me: {
				name: {
					first: 'Justin'
				}
			}
		});
		var base = new can.view.Scope(baseMap);
		var topMap = new can.Map({
			me: {
				name: {}
			}
		});
		var scope = base.add(topMap);
		var compute = scope.computeData('me.name.first')
			.compute;
		compute.bind('change', function (ev, newVal, oldVal) {
			equal(oldVal, 'Justin');
			equal(newVal, 'Brian');
		});
		equal(compute(), 'Justin');
		// this should do nothing
		topMap.attr('me.name.first', 'Payal');
		baseMap.attr('me.name.first', 'Brian');
	});
	// ok to comment out ... read is not documented
	/*test('Scope read returnObserveMethods=true', function () {
		var MapConstruct = can.Map.extend({
			foo: function (arg) {
				equal(this, data.map, 'correct this');
				equal(arg, true, 'correct arg');
			}
		});
		var data = {
			map: new MapConstruct()
		};
		var res = can.view.Scope.read(data, [
			'map',
			'foo'
		], {
			returnObserveMethods: true,
			isArgument: true
		});
		res.value(true);
	});*/
	test('rooted observable is able to update correctly', function () {
		var baseMap = new can.Map({
			name: {
				first: 'Justin'
			}
		});
		var scope = new can.view.Scope(baseMap);
		var compute = scope.computeData('name.first')
			.compute;
		equal(compute(), 'Justin');
		baseMap.attr('name', new can.Map({
			first: 'Brian'
		}));
		equal(compute(), 'Brian');
	});
	test('computeData reading an object with a compute', function () {
		var sourceAge = 21;
		var age = can.compute(function (newVal) {
			if (newVal) {
				sourceAge = newVal;
			} else {
				return sourceAge;
			}
		});
		var scope = new can.view.Scope({
			person: {
				age: age
			}
		});
		var computeData = scope.computeData('person.age');
		var value = computeData.compute();
		equal(value, 21, 'correct value');
		computeData.compute(31);
		equal(age(), 31, 'age updated');
	});
	test('computeData with initial empty compute (#638)', function () {
		expect(2);
		var compute = can.compute();
		var scope = new can.view.Scope({
			compute: compute
		});
		var computeData = scope.computeData('compute');
		equal(computeData.compute(), undefined);
		computeData.compute.bind('change', function (ev, newVal) {
			equal(newVal, 'compute value');
		});
		compute('compute value');
	});
	test('Can read static properties on constructors (#634)', function () {
		can.Map.extend('can.Foo', {
			static_prop: 'baz'
		}, {
			proto_prop: 'thud'
		});
		var data = new can.Foo({
			own_prop: 'quux'
		}),
			scope = new can.view.Scope(data);
		equal(scope.computeData('constructor.static_prop')
			.compute(), 'baz', 'static prop');
	});
})(undefined, undefined, __m30);

// ## util/string/string_test.js
var __m79 = (function () {
	module('can/util/string');
	test('can.sub', function () {
		equal(can.sub('a{b}', {
			b: 'c'
		}), 'ac');
		var foo = {
			b: 'c'
		};
		equal(can.sub('a{b}', foo, true), 'ac');
		ok(!foo.b, 'b\'s value was removed');
	});
	test('can.sub with undefined values', function () {
		var subbed = can.sub('test{exists} plus{noexists}', {
			exists: 'test'
		});
		deepEqual(subbed, null, 'Rendering with undefined values should return null');
		subbed = can.sub('test{exists} plus{noexists}', {
			exists: 'test'
		}, true);
		deepEqual(subbed, null, 'Rendering with undefined values should return null even when remove param is true');
	});
	test('can.sub with null values', function () {
		var subbed = can.sub('test{exists} plus{noexists}', {
			exists: 'test',
			noexists: null
		});
		deepEqual(subbed, null, 'Rendering with null values should return null');
		subbed = can.sub('test{exists} plus{noexists}', {
			exists: 'test',
			noexists: null
		}, true);
		deepEqual(subbed, null, 'Rendering with null values should return null even when remove param is true');
	});
	test('can.sub double', function () {
		equal(can.sub('{b} {d}', [{
			b: 'c',
			d: 'e'
		}]), 'c e');
	});
	test('String.underscore', function () {
		equal(can.underscore('Foo.Bar.ZarDar'), 'foo.bar.zar_dar');
	});
	test('can.sub remove', function () {
		var obj = {
			a: 'a'
		};
		equal(can.sub('{a}', obj, false), 'a');
		deepEqual(obj, {
			a: 'a'
		});
		equal(can.sub('{a}', obj, true), 'a');
		deepEqual(obj, {});
	});
	test('can.getObject Single root', function () {
		// ## Single root
		var root, result;
		// # Only get
		root = {
			foo: 'bar'
		};
		// exists
		result = can.getObject('foo', root);
		equal(result, 'bar', 'got \'bar\'');
		// not exists
		result = can.getObject('baz', root);
		equal(result, undefined, 'got \'undefined\'');
		// # With remove
		// exists
		root = {
			foo: 'bar'
		};
		result = can.getObject('foo', root, false);
		equal(result, 'bar', 'got \'bar\'');
		deepEqual(root, {}, 'root is empty');
		// not exists
		root = {
			foo: 'bar'
		};
		result = can.getObject('baz', root, false);
		equal(result, undefined, 'got \'undefined\'');
		deepEqual(root, {
			foo: 'bar'
		}, 'root is same');
		// # With add
		// exists
		root = {
			foo: 'bar'
		};
		result = can.getObject('foo', root, true);
		equal(result, 'bar', 'got \'bar\'');
		deepEqual(root, {
			foo: 'bar'
		}, 'root is same');
		// not exists
		root = {
			foo: 'bar'
		};
		result = can.getObject('baz', root, true);
		deepEqual(result, {}, 'got \'{}\'');
		deepEqual(root, {
			foo: 'bar',
			baz: {}
		}, 'added \'baz: {}\' into root');
	});
	test('can.getObject Multiple root', function () {
		// ## Multiple roots
		var root1, root2, roots, result;
		// # Only get
		root1 = {
			a: 1
		};
		root2 = {
			b: 2
		};
		roots = [
			root1,
			root2
		];
		// exists in first root
		result = can.getObject('a', roots);
		equal(result, 1, 'got \'1\'');
		// exists in second root
		result = can.getObject('b', roots);
		equal(result, 2, 'got \'2\'');
		// not exists anywhere
		result = can.getObject('c', roots);
		equal(result, undefined, 'got \'undefined\'');
		// # With remove
		// exists in first root
		root1 = {
			a: 1
		};
		root2 = {
			b: 2
		};
		roots = [
			root1,
			root2
		];
		result = can.getObject('a', roots, false);
		equal(result, 1, 'got \'1\'');
		deepEqual(root1, {}, 'root is empty');
		deepEqual(root2, {
			b: 2
		}, 'root is same');
		// exists in second root
		root1 = {
			a: 1
		};
		root2 = {
			b: 2
		};
		roots = [
			root1,
			root2
		];
		result = can.getObject('b', roots, false);
		equal(result, 2, 'got \'2\'');
		deepEqual(root1, {
			a: 1
		}, 'root is same');
		deepEqual(root2, {}, 'root is empty');
		// not exists anywhere
		root1 = {
			a: 1
		};
		root2 = {
			b: 2
		};
		roots = [
			root1,
			root2
		];
		result = can.getObject('c', roots, false);
		equal(result, undefined, 'got \'undefined\'');
		deepEqual(root1, {
			a: 1
		}, 'root is same');
		deepEqual(root2, {
			b: 2
		}, 'root is same');
		// # With add
		// exists in first root
		root1 = {
			a: 1
		};
		root2 = {
			b: 2
		};
		roots = [
			root1,
			root2
		];
		result = can.getObject('a', roots, true);
		equal(result, 1, 'got \'1\'');
		deepEqual(root1, {
			a: 1
		}, 'root is same');
		deepEqual(root2, {
			b: 2
		}, 'root is same');
		// exists in second root
		root1 = {
			a: 1
		};
		root2 = {
			b: 2
		};
		roots = [
			root1,
			root2
		];
		result = can.getObject('b', roots, true);
		equal(result, 2, 'got \'2\'');
		deepEqual(root1, {
			a: 1
		}, 'root is same');
		deepEqual(root2, {
			b: 2
		}, 'root is same');
		// not exists anywhere
		root1 = {
			a: 1
		};
		root2 = {
			b: 2
		};
		roots = [
			root1,
			root2
		];
		result = can.getObject('c', roots, true);
		deepEqual(result, {}, 'got \'{}\'');
		deepEqual(root1, {
			a: 1,
			c: {}
		}, 'added \'c: {}\' into first root');
		deepEqual(root2, {
			b: 2
		}, 'root is same');
		// # One of roots is not an object
		// exists in second root
		root1 = undefined;
		root2 = {
			b: 2
		};
		roots = [
			root1,
			root2
		];
		result = can.getObject('b', roots);
		equal(result, 2, 'got \'2\'');
		// exists in second root and remove
		root1 = undefined;
		root2 = {
			b: 2
		};
		roots = [
			root1,
			root2
		];
		result = can.getObject('b', roots, false);
		equal(result, 2, 'got \'2\'');
		equal(root1, undefined, 'got \'undefined\'');
		deepEqual(root2, {}, 'deleted \'b\' from root');
		// not exists in any root and add
		root1 = undefined;
		root2 = {
			b: 2
		};
		roots = [
			root1,
			root2
		];
		result = can.getObject('a', roots, true);
		equal(result, undefined, 'got \'undefined\'');
		equal(root1, undefined, 'root is same');
		deepEqual(root2, {
			b: 2
		}, 'root is same');
	});
	test('can.getObject Deep objects', function () {
		// ## Deep objects
		var root, result;
		// # Only get
		root = {
			foo: {
				bar: 'baz'
			}
		};
		// exists
		result = can.getObject('foo.bar', root);
		equal(result, 'baz', 'got \'baz\'');
		// not exists
		result = can.getObject('foo.world', root);
		equal(result, undefined, 'got \'undefined\'');
		// # With remove
		// exists
		root = {
			foo: {
				bar: 'baz'
			}
		};
		result = can.getObject('foo.bar', root, false);
		equal(result, 'baz', 'got \'baz\'');
		deepEqual(root, {
			foo: {}
		}, 'deep object is empty');
		// not exists
		root = {
			foo: {
				bar: 'baz'
			}
		};
		result = can.getObject('foo.world', root, false);
		equal(result, undefined, 'got \'undefined\'');
		deepEqual(root, {
			foo: {
				bar: 'baz'
			}
		}, 'root is same');
		// # With add
		// exists
		root = {
			foo: {
				bar: 'baz'
			}
		};
		result = can.getObject('foo.bar', root, true);
		equal(result, 'baz', 'got \'baz\'');
		deepEqual(root, {
			foo: {
				bar: 'baz'
			}
		}, 'root is same');
		// not exists
		root = {
			foo: {
				bar: 'baz'
			}
		};
		result = can.getObject('foo.world', root, true);
		deepEqual(result, {}, 'got \'{}\'');
		deepEqual(root, {
			foo: {
				bar: 'baz',
				world: {}
			}
		}, 'added \'world: {}\' into deep object');
	});
	test('can.esc', function () {
		var text = can.esc(0);
		equal(text, '0', '0 value properly rendered');
		text = can.esc(null);
		deepEqual(text, '', 'null value returns empty string');
		text = can.esc();
		deepEqual(text, '', 'undefined returns empty string');
		text = can.esc(NaN);
		deepEqual(text, '', 'NaN returns empty string');
		text = can.esc('<div>&nbsp;</div>');
		equal(text, '&lt;div&gt;&amp;nbsp;&lt;/div&gt;', 'HTML escaped properly');
	});
	test('can.camelize', function () {
		var text = can.camelize(0);
		equal(text, '0', '0 value properly rendered');
		text = can.camelize(null);
		equal(text, '', 'null value returns empty string');
		text = can.camelize();
		equal(text, '', 'undefined returns empty string');
		text = can.camelize(NaN);
		equal(text, '', 'NaN returns empty string');
		text = can.camelize('-moz-index');
		equal(text, 'MozIndex');
		text = can.camelize('foo-bar');
		equal(text, 'fooBar');
	});
	test('can.hyphenate', function () {
		var text = can.hyphenate(0);
		equal(text, '0', '0 value properly rendered');
		text = can.hyphenate(null);
		equal(text, '', 'null value returns empty string');
		text = can.hyphenate();
		equal(text, '', 'undefined returns empty string');
		text = can.hyphenate(NaN);
		equal(text, '', 'NaN returns empty string');
		text = can.hyphenate('ABC');
		equal(text, 'ABC');
		text = can.hyphenate('dataNode');
		equal(text, 'data-node');
	});
})(undefined);


})(QUnit.module);
