var QUnit = require("steal-qunit");

var helpers = require("./helpers");
var SimpleMap = require("can-simple-map");
var stache = require("can-stache");
var Component = require("can-component");
var domEvents = require('can-dom-events');
var domMutateNode = require('can-dom-mutate/node');
var domMutateDomEvents = require('can-dom-mutate/dom-events');
var insertedEvent = domMutateDomEvents.inserted;
var canViewModel = require('can-view-model');
var DefineMap = require("can-define/map/map");
var queues = require("can-queues");
var getFragment = require("can-fragment");
var viewCallbacks = require("can-view-callbacks");
var Scope = require("can-view-scope");

var innerHTML = function(el){
    return el && helpers.cloneAndClean(el).innerHTML;
};

helpers.makeTests("can-component views", function(doc, runTestInOnlyDocument){

    QUnit.test("lexical scoping", function(assert) {
		Component.extend({
			tag: "hello-world",
			view: stache("{{greeting}} <content>World</content>{{exclamation}}"),
			viewModel: function(){
                return new SimpleMap({
    				greeting: "Hello"
    			});
            }
		});
		var renderer = stache("<hello-world>{{greeting}}</hello-world>");


		var frag = renderer({
			greeting: "World",
			exclamation: "!"
		});

		var hello = frag.firstChild;

		assert.equal(hello.innerHTML.trim(), "Hello World");

		Component.extend({
			tag: "hello-world-no-template",
			leakScope: false,
			viewModel: function(){
                return new SimpleMap({greeting: "Hello"});
            }
		});
		renderer = stache("<hello-world-no-template>{{greeting}}</hello-world-no-template>");

		frag = renderer({
			greeting: "World",
			exclamation: "!"
		});

		hello = frag.firstChild;

		assert.equal(hello.innerHTML.trim(), "Hello",
			  "If no view is provided to Component, treat <content> bindings as dynamic.");
	});

	QUnit.test("dynamic scoping", function(assert) {

		Component.extend({
			tag: "hello-world",
			leakScope: true,
			view: stache("{{greeting}} <content>World</content>{{../exclamation}}"),
			viewModel: function(){
				return new SimpleMap({greeting: "Hello"});
			}
		});

		var renderer = stache("<hello-world>{{greeting}}</hello-world>");
		var frag = renderer({
			greeting: "World",
			exclamation: "!"
		});

		var hello = frag.firstChild;

		assert.equal( hello.innerHTML.trim() , "Hello Hello!");

	});

    QUnit.test("hello-world and whitespace around custom elements", function(assert) {

        Component.extend({
            tag: "hello-world",
            view: stache("{{#if visible}}{{message}}{{else}}Click me{{/if}}"),
            viewModel: function(){
                return new SimpleMap({
                    visible: false,
                    message: "Hello There!"
                });
            },
            events: {
                click: function () {
                    this.viewModel.attr("visible", true);
                }
            }
        });

        var renderer = stache("  <hello-world></hello-world>  ");
        var frag = renderer({});

        var helloWorld = frag.childNodes.item(1);

        domEvents.dispatch(helloWorld, "click");

        assert.equal( helpers.cloneAndClean(helloWorld).innerHTML , "Hello There!");

    });

    QUnit.test("self closing content tags", function(assert) {

        Component.extend({
            "tag": "my-greeting",
            view: stache("<h1><content/></h1>"),
            viewModel: function(){
                return new SimpleMap({
                    title: "Component"
                });
            }
        });

        var renderer = stache("<my-greeting><span>{{site}} - {{title}}</span></my-greeting>");

        var frag = renderer({
            site: "CanJS"
        });

        assert.equal(frag.firstChild.getElementsByTagName("span")
            .length, 1, "there is an h1");
    });

    QUnit.test("content extension stack overflow error", function(assert) {

        Component({
            tag: 'outer-tag',
            view: stache('<inner-tag>inner-tag CONTENT <content/></inner-tag>')
        });

        Component({
            tag: 'inner-tag',
            view: stache('inner-tag TEMPLATE <content/>')
        });

        // currently causes Maximum call stack size exceeded
        var renderer = stache("<outer-tag>outer-tag CONTENT</outer-tag>");

        // RESULT = <outer-tag><inner-tag>inner-tag TEMPLATE inner-tag CONTENT outer-tag CONTENT</inner-tag></outer-tag>

        var frag = renderer();

        assert.equal( innerHTML(frag.firstChild.firstChild), 'inner-tag TEMPLATE inner-tag CONTENT outer-tag CONTENT');

    });

    QUnit.test("inserted event fires twice if component inside live binding block", function(assert) {
		var undo = domEvents.addEvent(insertedEvent);

        var inited = 0,
            inserted = 0;

        Component.extend({
            tag: 'child-tag',

            ViewModel: DefineMap.extend({
                init: function () {
                    inited++;
                }
            }),
            events: {
                ' inserted': function () {
                    inserted++;
                }
            }
        });

        Component.extend({
            tag: 'parent-tag',

            view: stache('{{#shown}}<child-tag></child-tag>{{/shown}}'),

            viewModel: DefineMap.extend("ParentTag",{},{
                shown: { default: false }
            }),
            events: {
                ' inserted': function () {
                    this.viewModel.shown = true;
                }
            }
        });

        var frag = stache("<parent-tag id='pt'></parent-tag>")({});

        domMutateNode.appendChild.call(this.fixture, frag);
        var done = assert.async();

        var attempts = 0;
        function checkCount(){
            if(inserted >= 1 || attempts > 100) {
                assert.equal(inited, 1, "inited");
				assert.equal(inserted, 1, "inserted");
				undo();
                done();
            } else {
                attempts += 1;
                setTimeout(checkCount,30);
            }
        }

        checkCount();
    });

    QUnit.test('Same component tag nested', function(assert) {
        Component({
            'tag': 'my-tag',
            view: stache('<p><content/></p>')
        });
        //simplest case
        var renderer = stache('<div><my-tag>Outter<my-tag>Inner</my-tag></my-tag></div>');
        //complex case
        var renderer2 = stache('<div><my-tag>3<my-tag>2<my-tag>1<my-tag>0</my-tag></my-tag></my-tag></my-tag></div>');
        //edge case for new logic (same custom tag at same depth as one previously encountered)
        var renderer3 = stache('<div><my-tag>First</my-tag><my-tag>Second</my-tag></div>');


        assert.equal( renderer({}).firstChild.getElementsByTagName('p').length, 2, 'proper number of p tags');

        assert.equal( renderer2({}).firstChild.getElementsByTagName('p').length, 4, 'proper number of p tags');

        assert.equal( renderer3({}).firstChild.getElementsByTagName('p').length, 2, 'proper number of p tags');

    });

    QUnit.test('nested component within an #if is not live bound(#1025)', function(assert) {
        Component.extend({
            tag: 'parent-component',
            view: stache('{{#if shown}}<child-component></child-component>{{/if}}'),
            viewModel: function(){
                return new SimpleMap({
                    shown: false
                });
            }
        });

        Component.extend({
            tag: 'child-component',
            view: stache('Hello world.')
        });

        var renderer = stache('<parent-component></parent-component>');
        var frag = renderer({});

        assert.equal( innerHTML(frag.firstChild), '', 'child component is not inserted');
        canViewModel(frag.firstChild).attr('shown', true);

        assert.equal( innerHTML(helpers.cloneAndClean(frag).firstChild.firstChild), 'Hello world.', 'child component is inserted');
        canViewModel(frag.firstChild).attr('shown', false);

        assert.equal( innerHTML(frag.firstChild), '', 'child component is removed');
    });

    QUnit.test("references scopes are available to bindings nested in components (#2029)", function(assert) {

        var renderer = stache('<export-er value:to="scope.vars.reference" />'+
            '<wrap-er><simple-example key:from="scope.vars.reference"/></wrap-er>');

        Component.extend({
            tag : "wrap-er"
        });
        Component.extend({
            tag : "export-er",
            events : {
                "init" : function() {
                    var self = this.viewModel;
                    var done = assert.async();
                    setTimeout(function() {
                        self.set("value" , 100);
                        var wrapper = frag.lastChild,
                            simpleExample = wrapper.firstChild,
                            textNode = simpleExample.firstChild;
                        assert.equal(textNode.nodeValue, "100", "updated value with reference");
                        done();
                    }, 100);

                }
            }
        });

        Component.extend({
            tag : "simple-example",
            view : stache("{{key}}")
        });
        var frag = renderer({});

    });

    QUnit.test("<content> (#2151)", function(assert) {
		var mapInstance = new DefineMap({
			items:[{
				id : 1,
				context : 'Item 1',
				render : false
			}, {
				id : 2,
				context : 'Item 2',
				render : false
			}]
		});

		Component.extend({
			tag : 'list-items',
			view : stache("<ul>"+
				"{{#items}}"+
					"{{#if render}}"+
						"<li><content /></li>"+
					"{{/if}}"+
					"{{/items}}"+
				"</ul>"),
			viewModel: mapInstance,
			leakScope: true
		});

		Component.extend({
			tag : 'list-item',
			view : stache("{{item.context}}")
		});

		var renderer = stache("<list-items><list-item item:from='this'/></list-items>");

		var frag = renderer();

		queues.batch.start();
		canViewModel(frag.firstChild).get('items').forEach(function(item, index) {
			item.set('render', true);
		});
		queues.batch.stop();

		var lis = frag.firstChild.getElementsByTagName("li");
		assert.ok( innerHTML(lis[0]).indexOf("Item 1") >= 0, "Item 1 written out");
		assert.ok( innerHTML(lis[1]).indexOf("Item 2") >= 0, "Item 2 written out");

	});

    QUnit.test('two-way - reference - with <content> tag', function(assert) {
		Component.extend({
			tag: "other-export",
			viewModel: function(){
                return new SimpleMap({
    				name: "OTHER-EXPORT"
    			});
            }
		});

		Component.extend({
			tag: "ref-export",
			view: stache('<other-export name:bind="*otherExport"/><content>{{*otherExport}}</content>')
		});

		// this should have otherExport name in the page
		var t1 = stache("<ref-export></ref-export>");

		// this should not have anything in 'one', but something in 'two'
		//var t2 = stache("<form><other-export *other/><ref-export><b>{{*otherExport.name}}</b><label>{{*other.name}}</label></ref-export></form>");

		var f1 = t1();
		assert.equal(canViewModel( f1.firstChild.firstChild ).get("name"), "OTHER-EXPORT", "viewModel set correctly");
		assert.equal(f1.firstChild.lastChild.nodeValue, "OTHER-EXPORT", "content");

		/*var f2 = t2();
		var one = f2.firstChild.getElementsByTagName('b')[0];
		var two = f2.firstChild.getElementsByTagName('label')[0];

		equal(one.firstChild.nodeValue, "", "external content, internal export");
		equal(two.firstChild.nodeValue, "OTHER-EXPORT", "external content, external export");*/
	});

    runTestInOnlyDocument("custom renderer can provide setupBindings", function(assert){
		var rendererFactory = function(tmpl){
			var frag = getFragment(tmpl);
			return function(scope, options){
				scope = scope || new Scope();
				options = options || {};

				if(frag.firstChild.nodeName === "CUSTOM-RENDERER") {
					viewCallbacks.tagHandler(frag.firstChild, "custom-renderer", {
						scope: scope,
						options: options,
						templateType: "my-renderer",
						setupBindings: function(el, callback, data){
							callback({
								foo: "qux"
							});
						}
					});
				} else {
					var tn = frag.firstChild.firstChild;
					tn.nodeValue = scope.read("foo").value;
				}

				return frag;
			};
		};

		Component.extend({
			tag: "custom-renderer",
			view: rendererFactory("<div>{{foo}}</div>"),
			ViewModel: SimpleMap.extend({})
		});

		var renderer = rendererFactory("<custom-renderer foo='bar'></custom-renderer>");
		var frag = renderer();

		var tn = frag.firstChild.firstChild.firstChild;
		assert.equal(tn.nodeValue, "qux", "was bound!");
	});

	QUnit.test("view defaults to stache if set to a string", function(assert) {

		Component.extend({
			tag: "hello-world",
			leakScope: true,
			view: "{{greeting}} World{{../exclamation}}",
			viewModel: function(){
                return new SimpleMap({greeting: "Hello"});
            }
		});

		var renderer = stache("<hello-world />");
		var frag = renderer({
			exclamation: "!"
		});

		var hello = frag.firstChild;

		assert.equal( hello.innerHTML.trim() , "Hello World!");

	});

    QUnit.test("content tag available (#279)", function(assert) {
        var template = stache("<ct-outer>CT-OUTER-LIGHT-DOM</ct-outer>");

        Component.extend({
            tag: "ct-outer",
            view: "CT-OUTER-SHADOW-START <ct-inner/> <span><content/></span> CT-OUTER-SHADOW-END"
        });

        Component.extend({
            tag: "ct-inner",
            leakScope: true,
            view: stache("")
        });

        var frag = template();

		var span = frag.firstChild.getElementsByTagName("span")[0];
        assert.equal(span.innerHTML, "CT-OUTER-LIGHT-DOM");


	});

});
