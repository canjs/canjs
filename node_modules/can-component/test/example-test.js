var QUnit = require("steal-qunit");

var helpers = require("./helpers");
var SimpleMap = require("can-simple-map");
var stache = require("can-stache");
var Component = require("can-component");
var DefineList = require("can-define/list/list");
var DefineMap = require("can-define/map/map");

var domEvents = require('can-dom-events');
var canViewModel = require("can-view-model");
var domMutateNode = require('can-dom-mutate/node');
var domMutateDomEvents = require('can-dom-mutate/dom-events');
var insertedEvent = domMutateDomEvents.inserted;
var canLog = require("can-log");
var queues = require("can-queues");

var innerHTML = function(el) {
	return el && el.innerHTML;
};

helpers.makeTests("can-component examples", function(doc) {

	var Paginate = DefineMap.extend({
		count: {
			default: Infinity
		},
		offset: {
			default: 0
		},
		limit: {
			default: 100
		},
		// Prevent negative counts
		setCount: function(newCount, success, error) {
			return newCount < 0 ? 0 : newCount;
		},
		// Prevent negative offsets
		setOffset: function(newOffset) {
			return newOffset < 0 ?
				0 :
				Math.min(newOffset, !isNaN(this.count - 1) ?
					this.count - 1 :
					Infinity);
		},
		// move next
		next: function() {
			this.set('offset', this.offset + this.limit);
		},
		prev: function() {
			this.set('offset', this.offset - this.limit);
		},
		canNext: function() {
			return this.get('offset') < this.get('count') -
				this.get('limit');
		},
		canPrev: function() {
			return this.get('offset') > 0;
		},
		page: function(newVal) {
			if (newVal === undefined) {
				return Math.floor(this.get('offset') / this.get('limit')) + 1;
			} else {
				this.set('offset', (parseInt(newVal) - 1) * this.get('limit'));
			}
		},
		pageCount: function() {
			return this.get('count') ?
				Math.ceil(this.get('count') / this.get('limit')) : null;
		}
	});


	QUnit.test("treecombo", function(assert) {

		var TreeComboViewModel = DefineMap.extend("TreeComboViewModel",{
			items: {
				Default: DefineList
			},
			breadcrumb: {
				Default: DefineList
			},
			selected: {
				Default: DefineList
			},
			selectableItems: function() {
				var breadcrumb = this.get("breadcrumb");

				// if there's an item in the breadcrumb
				if (breadcrumb.length) {

					// return the last item's children
					return breadcrumb[breadcrumb.length - 1].children;
				} else {

					// return the top list of items
					return this.get('items');
				}
			},
			showChildren: function(item, ev) {
				ev.stopPropagation();
				this.get('breadcrumb')
					.push(item);
			},
			emptyBreadcrumb: function() {
				this.get("breadcrumb")
					.update([]);
			},
			updateBreadcrumb: function(item) {
				var breadcrumb = this.get("breadcrumb"),
					index = breadcrumb.indexOf(item);
				breadcrumb.splice(index + 1, breadcrumb.length - index - 1);
			},
			toggle: function(item) {
				var selected = this.get('selected'),
					index = selected.indexOf(item);
				if (index === -1) {
					selected.push(item);
				} else {
					selected.splice(index, 1);
				}
			},
			isSelected: function(item) {
				return this.get("selected").indexOf(item) > -1;
			}
		});

		Component.extend({
			tag: "treecombo",
			view: stache("<ul class='breadcrumb'>" +
				"<li on:click='emptyBreadcrumb()'>{{title}}</li>" +
				"{{#each breadcrumb}}" +
				"<li on:click='../updateBreadcrumb(this)'>{{title}}</li>" +
				"{{/each}}" +
				"</ul>" +
				"<ul class='options'>" +
				"<content>" +
				"{{#selectableItems()}}" +
				"<li {{#../isSelected(this)}}class='active'{{/../isSelected}} on:click='../toggle(this)'>" +
				"<input type='checkbox' {{#../isSelected(.)}}checked{{/../isSelected}}/>" +
				"{{title}}" +
				"{{#if children.length}}" +
				"<button class='showChildren' on:click='../showChildren(this, scope.event)'>+</button>" +
				"{{/if}}" +
				"</li>" +
				"{{/selectableItems}}" +
				"</content>" +
				"</ul>"),
			ViewModel: TreeComboViewModel
		});

		var renderer = stache("<treecombo items:bind='locations' title:from='\"Locations\"'></treecombo>");
		var BaseViewModel = DefineMap.extend("BaseViewModel",{seal: false},{});
		var base = new BaseViewModel({});

		var frag = renderer(base);
		var root = doc.createElement("div");
		root.appendChild(frag);

		var items = [{
			id: 1,
			title: "Midwest",
			children: [{
				id: 5,
				title: "Illinois",
				children: [{
					id: 23423,
					title: "Chicago"
				}, {
					id: 4563,
					title: "Springfield"
				}, {
					id: 4564,
					title: "Naperville"
				}]
			}, {
				id: 6,
				title: "Wisconsin",
				children: [{
					id: 232423,
					title: "Milwaulkee"
				}, {
					id: 45463,
					title: "Green Bay"
				}, {
					id: 45464,
					title: "Madison"
				}]
			}]
		}, {
			id: 2,
			title: "East Coast",
			children: [{
				id: 25,
				title: "New York",
				children: [{
					id: 3413,
					title: "New York"
				}, {
					id: 4613,
					title: "Rochester"
				}, {
					id: 4516,
					title: "Syracuse"
				}]
			}, {
				id: 6,
				title: "Pennsylvania",
				children: [{
					id: 2362423,
					title: "Philadelphia"
				}, {
					id: 454663,
					title: "Harrisburg"
				}, {
					id: 454664,
					title: "Scranton"
				}]
			}]
		}];

		var done = assert.async();

		setTimeout(function() {
			base.set('locations', items);

			var itemsList = base.get('locations');

			// check that the DOM is right
			var treecombo = root.firstChild,
				breadcrumb = treecombo.firstChild,
				breadcrumbLIs = function() {
					return breadcrumb.getElementsByTagName('li');
				},
				options = treecombo.lastChild,
				optionsLis = function() {
					return options.getElementsByTagName('li');
				};

			assert.equal(breadcrumbLIs().length, 1, "Only the default title is shown");

			assert.equal(breadcrumbLIs()[0].innerHTML, "Locations", "The correct title from the attribute is shown");

			assert.equal(itemsList.length, optionsLis().length, "first level items are displayed");

			// Test toggling selected, first by clicking
			domEvents.dispatch(optionsLis()[0], "click");

			assert.equal(optionsLis()[0].className, "active", "toggling something not selected adds active");

			assert.ok(optionsLis()[0].getElementsByTagName('input')[0].checked, "toggling something not selected checks checkbox");
			assert.equal(canViewModel(treecombo, "selected")
				.length, 1, "there is one selected item");

			assert.equal(canViewModel(treecombo).selected[0], itemsList[0], "the midwest is in selected");

			// adjust the state and everything should update
			var selectedList = canViewModel(treecombo, "selected");
			selectedList.pop();
			assert.equal(optionsLis()[0].className, "", "removing selected item in viewModel removes 'active' class");

			// Test going in a location
			domEvents.dispatch(optionsLis()[0].getElementsByTagName('button')[0], "click");
			assert.equal(breadcrumbLIs().length, 2, "Only the default title is shown");
			assert.equal(breadcrumbLIs()[1].innerHTML, "Midwest", "The breadcrumb has an item in it");
			assert.ok(/Illinois/.test(optionsLis()[0].innerHTML), "A child of the top breadcrumb is displayed");

			// Test going in a location without children
			domEvents.dispatch(optionsLis()[0].getElementsByTagName('button')[0], "click");
			assert.ok(/Chicago/.test(optionsLis()[0].innerHTML), "A child of the top breadcrumb is displayed");
			assert.ok(!optionsLis()[0].getElementsByTagName('button')
				.length, "no show children button");

			// Test poping off breadcrumb
			domEvents.dispatch(breadcrumbLIs()[1], "click");
			assert.equal(innerHTML(breadcrumbLIs()[1]), "Midwest", "The breadcrumb has an item in it");
			assert.ok(/Illinois/.test(innerHTML(optionsLis()[0])), "A child of the top breadcrumb is displayed");

			// Test removing everything
			domEvents.dispatch(breadcrumbLIs()[0], "click");
			assert.equal(breadcrumbLIs().length, 1, "Only the default title is shown");
			assert.equal(innerHTML(breadcrumbLIs()[0]), "Locations", "The correct title from the attribute is shown");

			done();

		}, 100);

	});

	QUnit.test("deferred grid", function(assert) {

		// This test simulates a grid that reads a `deferreddata` property for
		// items and displays them.
		// If `deferreddata` is a deferred, it waits for those items to resolve.
		// The grid also has a `waiting` property that is true while the deferred is being resolved.

		var GridViewModel = DefineMap.extend({
			items: {
				Default: DefineList
			},
			waiting: {
				default: true
			}
		});

		Component.extend({
			tag: "grid",
			ViewModel: GridViewModel,
			view: stache("<table><tbody><content></content></tbody></table>"),
			leakScope: true,
			events: {
				init: function() {
					this.update();
				},
				"{viewModel} deferreddata": "update",
				update: function() {
					var deferred = this.viewModel.get('deferreddata'),
						viewModel = this.viewModel;

					if (deferred && deferred.then) {
						this.viewModel.set("waiting", true);
						deferred.then(function(items) {
							viewModel.get('items')
								.update(items);
						});
					} else {
						viewModel.get('items')
							.update(deferred);
					}
				},
				"{items} length": function() {
					this.viewModel.set("waiting", false);
				}
			}
		});

		// The context object has a `set` property and a
		// deferredData property that reads from it and returns a new deferred.
		var SimulatedScope = DefineMap.extend({
			set: {
				default: 0
			},
			deferredData: function() {
				var deferred = {};
				var promise = new Promise(function(resolve, reject) {
					deferred.resolve = resolve;
					deferred.reject = reject;
				});
				var set = this.get('set');
				if (set === 0) {
					setTimeout(function() {
						deferred.resolve([{
							first: "Justin",
							last: "Meyer"
						}]);
					}, 100);
				} else if (set === 1) {
					setTimeout(function() {
						deferred.resolve([{
							first: "Brian",
							last: "Moschel"
						}]);
					}, 100);
				}
				return promise;
			}
		});
		var viewModel = new SimulatedScope();

		var renderer = stache("<grid deferreddata:bind='viewModel.deferredData()'>" +
			"{{#each items}}" +
			"<tr>" +
			"<td width='40%'>{{first}}</td>" +
			"<td width='70%'>{{last}}</td>" +
			"</tr>" +
			"{{/each}}" +
			"</grid>");

		domMutateNode.appendChild.call(this.fixture, renderer({
			viewModel: viewModel
		}));

		var gridScope = canViewModel(this.fixture.firstChild);

		assert.equal(gridScope.get("waiting"), true, "The grid is initially waiting on the deferreddata to resolve");

		var done = assert.async();
		var self = this;

		var waitingHandler = function() {
			gridScope.off('waiting', waitingHandler);

			setTimeout(function() {
				var tds = self.fixture.getElementsByTagName("td");
				assert.equal(tds.length, 2, "there are 2 tds");

				gridScope.on("waiting", function(ev, newVal) {
					if (newVal === false) {
						setTimeout(function() {
							tds = self.fixture.getElementsByTagName("td");
							assert.equal(innerHTML(tds[0]), "Brian", "td changed to brian");
							done();
						}, 100);

					}
				});

				// update set to change the deferred.
				viewModel.set = 1;

			}, 100);
		};

		gridScope.on('waiting', waitingHandler);
	});

	QUnit.test("nextprev", function(assert) {

		Component.extend({
			tag: "next-prev",
			view: stache(
				'<a href="javascript://"' +
				'class="prev {{#paginate.canPrev()}}enabled{{/paginate.canPrev}}" on:click="paginate.prev()">Prev</a>' +
				'<a href="javascript://"' +
				'class="next {{#paginate.canNext()}}enabled{{/paginate.canNext}}" on:click="paginate.next()">Next</a>')
		});

		var paginator = new Paginate({
			limit: 20,
			offset: 0,
			count: 100
		});
		var renderer = stache("<next-prev paginate:bind='paginator'></next-prev>");

		var frag = renderer({
			paginator: paginator
		});
		var nextPrev = frag.firstChild;

		var prev = nextPrev.firstChild,
			next = nextPrev.lastChild;

		assert.ok(!/enabled/.test(prev.className), "prev is not enabled");
		assert.ok(/enabled/.test(next.className), "next is enabled");

		domEvents.dispatch(next, "click");
		assert.ok(/enabled/.test(prev.getAttribute('class')), "prev is enabled"); // TODO: use .className when CSD is patched
	});

	QUnit.test("page-count", function(assert) {

		Component.extend({
			tag: "page-count",
			view: stache('Page <span>{{page()}}</span>.')
		});

		var paginator = new Paginate({
			limit: 20,
			offset: 0,
			count: 100
		});

		var renderer = stache("<page-count page:from='paginator.page'></page-count>");

		var frag = renderer(new SimpleMap({
			paginator: paginator
		}));

		var span = frag.firstChild.getElementsByTagName("span")[0];

		assert.equal(span.firstChild.nodeValue, "1");
		paginator.next();
		assert.equal(span.firstChild.nodeValue, "2");
		paginator.next();
		assert.equal(span.firstChild.nodeValue, "3");

	});

	if (System.env !== 'canjs-test') {
		// Brittle in IE
		QUnit.test("basic tabs", function(assert) {
			var undo = domEvents.addEvent(insertedEvent);

			var TabsViewModel = DefineMap.extend({
                active: "any",
                panels: {Default: DefineList},
				addPanel: function(panel) {
					if (this.panels.length === 0) {
						this.makeActive(panel);
					}
					this.panels.push(panel);
				},
				removePanel: function(panel) {
					var panels = this.panels;
					queues.batch.start();
					var index = panels.indexOf(panel);
					canLog.log(index);
					panels.splice(index, 1);
					if (panel === this.active) {
						if (panels.length) {
							this.makeActive(panels[0]);
						} else {
							this.active = null;
						}
					}
					queues.batch.stop();
				},
				makeActive: function(panel) {
					this.active = panel;
					this.panels.forEach(function(panel) {
						panel.active = false;
					});
					panel.active = true;

				},
				// this is viewModel, not stache
				// consider removing viewModel as arg
				isActive: function(panel) {
					return this.active === panel;
				}
			});

			// new Tabs() ..
			Component.extend({
				tag: "tabs",
				ViewModel: TabsViewModel,
				view: stache("<ul>" +
					"{{#panels}}" +
					"<li {{#../isActive(this)}}class='active'{{/../isActive}} on:click='../makeActive(this)'>{{title}}</li>" +
					"{{/panels}}" +
					"</ul>" +
					"<content></content>")
			});

			Component.extend({
				// make sure <content/> works
				view: stache("{{#if active}}<content></content>{{/if}}"),
				tag: "panel",
				ViewModel: DefineMap.extend({
					active: {default: false}
				}),
				events: {
					" inserted": function() {
						canViewModel(this.element.parentNode)
							.addPanel(this.viewModel);
						this.parent = this.element.parentNode.viewModel;

					},

					" beforeremove": function() {
						this.parent.removePanel(this.viewModel);
					}
				}
			});

			var renderer = stache("<tabs>{{#each foodTypes}}<panel title:from='title'>{{content}}</panel>{{/each}}</tabs>");

			var foodTypes = new DefineList([{
				title: "Fruits",
				content: "oranges, apples"
			}, {
				title: "Breads",
				content: "pasta, cereal"
			}, {
				title: "Sweets",
				content: "ice cream, candy"
			}]);

			var frag = renderer({
				foodTypes: foodTypes
			});

			domMutateNode.appendChild.call(this.fixture, frag);

			var testArea = this.fixture;

			var done = assert.async();

			helpers.runTasks([
				function() {
					var lis = testArea.getElementsByTagName("li");

					assert.equal(lis.length, 3, "three lis added");

					foodTypes.forEach(function(type, i) {
						assert.equal(innerHTML(lis[i]), type.title, "li " + i + " has the right content");
					});

					foodTypes.push({
						title: "Vegies",
						content: "carrots, kale"
					});
				},
				function() {
					var lis = testArea.getElementsByTagName("li");

					assert.equal(lis.length, 4, "li added");


					foodTypes.forEach(function(type, i) {
						assert.equal(innerHTML(lis[i]), type.title, "li " + i + " has the right content");
					});

					assert.equal(testArea.getElementsByTagName("panel")
						.length, 4, "panel added");
					canLog.log("SHIFTY");
					foodTypes.shift();
				},
				function() {
					var lis = testArea.getElementsByTagName("li");
					assert.equal(lis.length, 3, "removed li after shifting a foodType");
					foodTypes.forEach(function(type, i) {
						assert.equal(innerHTML(lis[i]), type.title, "li " + i + " has the right content");
					});

					// test changing the active element
					var panels = testArea.getElementsByTagName("panel");

					assert.equal(lis[0].className, "active", "the first element is active");
					assert.equal(innerHTML( helpers.cloneAndClean(panels[0]) ), "pasta, cereal", "the first content is shown");
					assert.equal(innerHTML( helpers.cloneAndClean(panels[1]) ), "", "the second content is removed");

					domEvents.dispatch(lis[1], "click");
					lis = testArea.getElementsByTagName("li");

					assert.equal(lis[1].className, "active", "the second element is active");
					assert.equal(lis[0].className, "", "the first element is not active");

					assert.equal(innerHTML( helpers.cloneAndClean(panels[0]) ), "", "the second content is removed");
					assert.equal(innerHTML( helpers.cloneAndClean(panels[1]) ), "ice cream, candy", "the second content is shown");
					undo();
				}
			], done);
		});


	}


});
