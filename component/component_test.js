(function(){
	
module("can/component",{
	setup: function(){
		can.remove( can.$("#qunit-test-area>*") );
	}
})
	
	
var Paginate = can.Map.extend({
  count: Infinity,
  offset: 0,
  limit: 100,
  // Prevent negative counts
  setCount: function(newCount, success, error){
    return newCount < 0 ? 0 : newCount;
  },
  // Prevent negative offsets
  setOffset: function(newOffset){
    return newOffset < 0 ? 
        0 : 
        Math.min(newOffset, ! isNaN(this.count - 1) ? 
                 this.count - 1 : 
                 Infinity )
  },
  // move next
  next: function(){
    this.attr('offset', this.offset+this.limit);
  },
  prev : function(){
    this.attr('offset', this.offset - this.limit )
  },
  canNext : function(){
    return this.attr('offset') < this.attr('count') - 
            this.attr('limit')
  },
  canPrev: function(){
    return this.attr('offset') > 0
  },
  page: function(newVal){
  	if(newVal === undefined){
  	  return Math.floor( this.attr('offset') / this.attr('limit') )+1;
  	} else {
	  this.attr('offset', ( parseInt(newVal) - 1 ) * this.attr('limit') );
  	}
  },
  pageCount: function(){
  	return this.attr('count') ? 
  		Math.ceil( this.attr('count')  / this.attr('limit') )
  		: null;
  }
});	
	
test("basic tabs",function(){
	
	// new Tabs() .. 
	can.Component.extend({
		tag: "tabs",
		template: 	
			"<ul>"+
	    		 "{{#panels}}"+
	    			"<li {{#isActive}}class='active'{{/isActive}} can-click='makeActive'>{{title}}</li>"+
	    		 "{{/panels}}"+
	    	"</ul>"+
	    	"<content></content>",
		scope: {
			panels: [],
			addPanel: function(panel){
				
				if( this.attr("panels").length === 0 ) {
					this.makeActive(panel)
				} 
				this.attr("panels").push(panel);
			},
			removePanel: function(panel){
				var panels = this.attr("panels");
				can.batch.start();
				panels.splice(panels.indexOf(panel),1);
				if(panel === this.attr("active")){
					if(panels.length){
						this.makeActive(panels[0]);
					} else {
						this.removeAttr("active")
					}
				}
				can.batch.stop()
			},
			makeActive: function(panel){
				this.attr("active",panel);
				this.attr("panels").each(function(panel){
					panel.attr("active", false)
				})
				panel.attr("active",true);
				
			},
			// this is scope, not mustache
			// consider removing scope as arg
			isActive: function( panel ) {
				return this.attr('active') == panel
			}
		}
	});
	can.Component.extend({
		// make sure <content/> works
		template: "{{#if active}}<content></content>{{/if}}",
		tag:"panel",
		scope: {
			active: false
		},
		events: {
			" inserted": function(){
				can.scope(this.element[0].parentNode).addPanel( this.scope );
			},
			" removed": function(){
				if( !can.scope(this.element[0].parentNode) ){
					console.log("bruke")
				}
				can.scope(this.element[0].parentNode).removePanel( this.scope );
			}
		}
	})
	
	
	
	var template = can.view.mustache("<tabs>{{#each foodTypes}}<panel title='title'>{{content}}</panel>{{/each}}</tabs>")
	
	var foodTypes= new can.List([
		{title: "Fruits", content: "oranges, apples"},
		{title: "Breads", content: "pasta, cereal"},
		{title: "Sweets", content: "ice cream, candy"}
	])

	can.append(can.$("#qunit-test-area"), template({
		foodTypes: foodTypes
	}) )

	var testArea = can.$("#qunit-test-area")[0],
		lis = testArea.getElementsByTagName("li");
	equal( lis.length, 3, "three lis added");
	
	foodTypes.each(function(type, i){
		equal(lis[i].innerHTML, type.attr("title"),"li "+i+" has the right content")
	})
	
	foodTypes.push({
		title: "Vegies",
		content: "carrots, kale"
	});
	
	//lis = testArea.getElementsByTagName("li");
	equal( lis.length, 4, "li added");
	
	foodTypes.each(function(type, i){
		equal(lis[i].innerHTML, type.attr("title"),"li "+i+" has the right content")
	})
	
	equal( testArea.getElementsByTagName("panel").length, 4, "panel added");
	
	foodTypes.shift();

	equal( lis.length, 3, "removed li after shifting a foodType");
	
	foodTypes.each(function(type, i){
		equal(lis[i].innerHTML, type.attr("title"),"li "+i+" has the right content")
	})
	
	// test changing the active element
	var panels = testArea.getElementsByTagName("panel")
	
	equal( lis[0].className, "active", "the first element is active"  )
	equal( panels[0].innerHTML, "pasta, cereal", "the first content is shown"  )
	equal( panels[1].innerHTML, "", "the second content is removed"  )
	
	can.trigger(lis[1],"click");
	
	equal( lis[1].className, "active", "the second element is active"  )
	equal( lis[0].className, "", "the first element is not active"  )
	
	equal( panels[0].innerHTML, "", "the second content is removed"  )
	equal( panels[1].innerHTML, "ice cream, candy", "the second content is shown"  );
	
	can.remove( can.$("#qunit-test-area>*") );
});


test("treecombo", function(){
	
	
	can.Component.extend({
		tag: "treecombo",
		template:
			"<ul class='breadcrumb'>"+
				"<li can-click='emptyBreadcrumb'>{{title}}</li>"+
				"{{#each breadcrumb}}"+
					"<li can-click='updateBreadcrumb'>{{title}}</li>"+
				"{{/each}}"+
			"</ul>"+
			"<ul class='options'>"+
				"<content>"+
					"{{#selectableItems}}"+
						"<li {{#isSelected}}class='active'{{/isSelected}} can-click='toggle'>"+
							"<input type='checkbox' {{#isSelected}}checked{{/isSelected}}/>"+
							"{{title}}"+
							"{{#if children.length}}"+
								"<button class='showChildren' can-click='showChildren'>+</button>"+
							"{{/if}}"+
						"</li>"+
					"{{/selectableItems}}"+
				"</content>"+
			"</ul>",
		scope: {
			items: [],
			breadcrumb: [],
			selected: [],
			title: "@",
			selectableItems: function(){
				var breadcrumb = this.attr("breadcrumb");
		      	
				// if there's an item in the breadcrumb
				if(breadcrumb.attr('length')){
				
					// return the last item's children
					return breadcrumb.attr(""+(breadcrumb.length-1)+'.children');
				} else{
			    
					// return the top list of items
					return this.attr('items');
				}
			},
			showChildren: function( item, el, ev ) {
				ev.stopPropagation();
				this.attr('breadcrumb').push(item)
			},
			emptyBreadcrumb: function( ) {
				this.attr("breadcrumb").attr([], true)
			},
			updateBreadcrumb: function( item ){
				var breadcrumb = this.attr("breadcrumb"),
					index = breadcrumb.indexOf(item);
				breadcrumb.splice(index+1, breadcrumb.length - index- 1 );
			},
			toggle: function(item){
				var selected = this.attr('selected'),
					index = selected.indexOf(item);
			    if(index === -1 ){
			    	selected.push(item);
			    } else {
			      	selected.splice(index, 1) 
			    }
			}
		},
		helpers: {
			isSelected: function( options ){
				if(this.attr("selected").indexOf( options.context ) > -1){
					return options.fn();
				} else {
					return options.inverse()
				}
			}
		}
	})
	
	
	var template = can.view.mustache("<div><treecombo items='locations' title='Locations'></treecombo></div>");
	
	var base = new can.Map({})
	
	can.append(can.$("#qunit-test-area"), template(base) )
	
	
	var items = [
	  { id: 1, title: "Midwest", children: [
	    { id: 5, title: "Illinois", children: [
	      { id: 23423, title: "Chicago"}, { id: 4563, title: "Springfield"},
	      { id: 4564, title: "Naperville"} 
	      ]
	    },
	    { id: 6, title: "Wisconsin", children: [
	      { id: 232423, title: "Milwaulkee"}, { id: 45463, title: "Green Bay"},
	      { id: 45464, title: "Madison"} 
	      ]
	    }]
	  },
	  { id: 2, title: "East Coast", children: [
	    { id: 25, title: "New York", children: [
	      { id: 3413, title: "New York"}, { id: 4613, title: "Rochester"},
	      { id: 4516, title: "Syracuse"} 
	      ]
	    },
	    { id: 6, title: "Pennsylvania", children: [
	      { id: 2362423, title: "Philadelphia"}, { id: 454663, title: "Harrisburg"},
	      { id: 454664, title: "Scranton"} 
	      ]
	    }]
	  }];

	stop();
	
	setTimeout(function(){
		
		base.attr('locations',items);

		var itemsList = base.attr('locations');
		
		// check that the DOM is right
		var ta = can.$("#qunit-test-area")[0];
		var treecombo = can.$("#qunit-test-area treecombo")[0],
			breadcrumb = can.$("#qunit-test-area .breadcrumb")[0],
			breadcrumbLIs = breadcrumb.getElementsByTagName('li'),
			options = can.$("#qunit-test-area .options")[0]
			optionsLis = options.getElementsByTagName('li')
		
		equal(breadcrumbLIs.length,1, "Only the default title is shown")
		equal(breadcrumbLIs[0].innerHTML, "Locations", "The correct title from the attribute is shown")
		
		equal(optionsLis.length, itemsList.length, "first level items are displayed")

		// Test toggling selected, first by clicking
		can.trigger(optionsLis[0],"click");
		
		equal(optionsLis[0].className, "active", "toggling something not selected adds active");
		
		ok(optionsLis[0].getElementsByTagName('input')[0].checked, "toggling something not selected checks checkbox");
		equal( can.scope(treecombo,"selected").length, 1 , "there is one selected item")
		equal( can.scope(treecombo,"selected.0"), itemsList.attr("0") , "the midwest is in selected")
		
		// adjust the state and everything should update
		can.scope(treecombo,"selected").pop()
		equal(optionsLis[0].className, "", "toggling something not selected adds active");
		
		// Test going in a location
		can.trigger(optionsLis[0].getElementsByTagName('button')[0],"click");
		equal(breadcrumbLIs.length,2, "Only the default title is shown")
		equal(breadcrumbLIs[1].innerHTML, "Midwest", "The breadcrumb has an item in it")
		ok(/Illinois/.test(optionsLis[0].innerHTML),  "A child of the top breadcrumb is displayed");
		
		// Test going in a location without children
		can.trigger(optionsLis[0].getElementsByTagName('button')[0],"click");
		ok(/Chicago/.test(optionsLis[0].innerHTML),  "A child of the top breadcrumb is displayed");
		ok(!optionsLis[0].getElementsByTagName('button').length, "no show children button")
		
		// Test poping off breadcrumb
		can.trigger(breadcrumbLIs[1],"click");
		equal(breadcrumbLIs[1].innerHTML, "Midwest", "The breadcrumb has an item in it")
		ok(/Illinois/.test(optionsLis[0].innerHTML),  "A child of the top breadcrumb is displayed");
		
		// Test removing everything
		can.trigger(breadcrumbLIs[0],"click");
		equal(breadcrumbLIs.length,1, "Only the default title is shown")
		equal(breadcrumbLIs[0].innerHTML, "Locations", "The correct title from the attribute is shown")
		
		
		start()
		
	},100)
	
})



test("deferred grid",function(){

	can.Component.extend({
		tag:"grid",
		scope: {
			items: [],
			waiting: true
		},
		template: "<table><tbody><content></content></tbody></table>",
		events: {
			init: function(){
				this.update()
			},
			"{scope} deferreddata": "update",
			update: function(){
				var deferred = this.scope.attr('deferreddata'),
					scope = this.scope,
					el = this.element;
				if(can.isDeferred( deferred )){
					this.scope.attr("waiting", true)
					deferred.then(function(items){
						scope.attr('items').attr(items, true)
					});
				} else {
					scope.attr('items').attr(deferred, true)
				}
			},
			"{items} change": function(){
				this.scope.attr("waiting",false)
			}
		}
	});
	
	
	var SimulatedScope = can.Map.extend({
		set: 0,
		deferredData: function(){
			var deferred = new can.Deferred();
			var set = this.attr('set');
			if(set == 0 ){
				setTimeout(function(){
					deferred.resolve([{first: "Justin", last: "Meyer"}])
				},100)
			} else if(set == 1 ){
				setTimeout(function(){
					deferred.resolve([{first: "Brian", last: "Moschel"}])
				},100)
			}
			return deferred;
		}
	})
	var scope = new SimulatedScope();
	
	var template = can.view.mustache("<grid deferreddata='scope.deferredData'>"+
						"{{#each items}}"+
							"<tr>"+
						  	  	"<td width='40%'>{{first}}</td>"+
						  	  	"<td width='70%'>{{last}}</td>"+
						  	"</tr>"+
						"{{/each}}"+
					"</grid>");

	can.append(can.$("#qunit-test-area"), template({
		scope: scope
	}));
	
	var gridScope = can.scope("#qunit-test-area grid")
	equal( gridScope.attr("waiting"), true, "waiting is true")
	stop();
	
	gridScope.bind("waiting", function(){
		
		gridScope.unbind("waiting", arguments.callee)
		setTimeout(function(){
			var tds = can.$("#qunit-test-area td")
			equal(tds.length, 2, "there are 2 tds")
			
			
			gridScope.bind("waiting", function(ev, newVal){
				if(newVal === false){
					setTimeout(function(){
						equal(tds[0].innerHTML, "Brian", "td changed to brian");
						start();
					},10)
					
				}
			});
			scope.attr("set",1);
			
		},10)
		
	})
	
	
})

test("nextprev", function(){
	
	can.Component.extend({
		tag: "next-prev",
		template: '<a href="javascript://"'+
		     			'class="prev {{#paginate.canPrev}}enabled{{/paginate.canPrev}}" can-click="paginate.prev">Prev</a>'+
		  			'<a href="javascript://"'+
		     			'class="next {{#paginate.canNext}}enabled{{/paginate.canNext}}" can-click="paginate.next">Next</a>'
	})
	
	
	var paginator = new Paginate({limit: 20, offset: 0, count: 100})
	var template = can.view.mustache("<next-prev paginate='paginator'></next-prev>");
	
	var frag = template({
		paginator: paginator
	});

	can.append(can.$("#qunit-test-area"), frag);
	
	var prev = can.$("#qunit-test-area .prev")[0],
		next = can.$("#qunit-test-area .next")[0];
	
	ok(!/enabled/.test(prev.className), "prev is not enabled");
	ok(/enabled/.test(next.className), "next is  enabled");
	
	can.trigger(next,"click");
	ok(/enabled/.test(prev.className), "prev is enabled");
});

test("page-count",function(){
	
	can.Component.extend({
		tag: "page-count",
		template: 'Page <span>{{page}}</span>.'
	})
	
	
	var paginator = new Paginate({limit: 20, offset: 0, count: 100})
	
	var template = can.view.mustache("<page-count page='paginator.page'></page-count>");

	can.append(can.$("#qunit-test-area"), template(new can.Map({
		paginator: paginator
	})));
	
	var spans = can.$("#qunit-test-area span")
	equal(spans[0].innerHTML,"1")
	paginator.next();
	equal(spans[0].innerHTML,"2")
	paginator.next();
	equal(spans[0].innerHTML,"3")
	
})

test("hello-world and whitespace around custom elements", function(){
	
	can.Component.extend({
	  tag: "hello-world",
	  template: "{{#if visible}}{{message}}{{else}}Click me{{/if}}",
	  scope: {
	    visible: false,
	    message: "Hello There!"
	  },
	  events: {
	    click: function(){
	    	this.scope.attr("visible", true)
	    }
	  }
	});
		
	
	var template = can.view.mustache("  <hello-world></hello-world>  ");
	
	can.append(can.$("#qunit-test-area"), template({}));
	
	can.trigger( can.$("#qunit-test-area hello-world"), "click" );
	
	equal(can.$("#qunit-test-area hello-world")[0].innerHTML, "Hello There!")

});

test("self closing content tags", function(){
	
	can.Component({
	    "tag": "my-greeting",
	    template: "<h1><content/></h1>",
	    scope: {
	      title: "can.Component"
	    }
	})
	
	var template = can.view.mustache("<my-greeting><span>{{site}} - {{title}}</span></my-greeting>");
	
	can.append(can.$("#qunit-test-area"), template({
		site: "CanJS"
	}));
	
	
	equal(can.$("#qunit-test-area span").length, 1, "there is an h1")
})

test("setting passed variables - two way binding", function(){
	
	can.Component({
	    tag: "my-toggler",
	    template: "{{#if visible}}<content/>{{/if}}",
	    scope: {
	        visible: true,
	        show: function(){
	            this.attr('visible', true)
	        },
	        hide: function(){
	            this.attr("visible", false)
	        }
	    }
	})
	
	
	can.Component({
	    tag: "my-app",
	    scope: {
	        visible: true,
	        show: function(){
	          this.attr('visible', true)              
	        }
	    }
	})
    var template = can.view.mustache("<my-app>"+
        '{{^visible}}<button can-click="show">show</button>{{/visible}}'+
        '<my-toggler visible="visible">'+
        	'content'+
            '<button can-click="hide">hide</button>'+
        '</my-toggler>'+
    '</my-app>')
    
    
    can.append(can.$("#qunit-test-area"), template({}));
    
    var testArea = can.$("#qunit-test-area")[0],
		buttons = testArea.getElementsByTagName("button")
    
    equal(buttons.length, 1, "there is one button")
    equal(buttons[0].innerHTML, "hide", "the button's text is hide")
    
    can.trigger(buttons[0],"click");
    
    equal(buttons.length, 1, "there is one button")
    equal(buttons[0].innerHTML, "show", "the button's text is show");
    
    can.trigger(buttons[0],"click");
    equal(buttons.length, 1, "there is one button")
    equal(buttons[0].innerHTML, "hide", "the button's text is hide")
})

test("helpers reference the correct instance (#515)", function() {
	expect(2);
	can.Component({    
	  tag: 'my-text',    
	  template: '<p>{{valueHelper}}</p>',   
	  scope: {
	      value: '@'
	  },
	  helpers: {
			valueHelper: function(){
				return this.attr('value');
			}
	  }                 
	});

	var template = can.view.mustache('<my-text value="value1"></my-text><my-text value="value2"></my-text>');

	can.append(can.$('#qunit-test-area'), template({}));

	var testArea = can.$("#qunit-test-area")[0],
	myTexts = testArea.getElementsByTagName("my-text");

	equal(myTexts[0].children[0].innerHTML, 'value1');
	equal(myTexts[1].children[0].innerHTML,'value2');
});

test('access hypenated attributes via camelCase or hypenated', function() {
	can.Component({
		tag: 'hyphen',
		scope: {
			'camelCase': '@'
		},
		template: '<p>{{valueHelper}}</p>',
		helpers: {
			valueHelper: function() {
				return this.attr('camelCase');
			}
		}
	});

	var template = can.view.mustache('<hyphen camel-case="value1"></hyphen>');

	can.append(can.$('#qunit-test-area'), template({}));

  var testArea = can.$("#qunit-test-area")[0],
	hyphen = testArea.getElementsByTagName("hyphen");

	equal(hyphen[0].children[0].innerHTML, 'value1');

})

test("a map as scope", function(){
	
	var me = new can.Map({
		name: "Justin"
	})
	
	can.Component.extend({
		tag: 'my-scope',
		scope: me
	})
	
	var template = can.view.mustache('<my-scope>{{name}}</my-scope>');
	equal(template().childNodes[0].innerHTML, "Justin")
	
});

test("content in a list", function(){
	var template = can.view.mustache('<my-list>{{name}}</my-list>');
	
	can.Component.extend({
		tag: "my-list",
		template: "{{#each items}}<li><content/></li>{{/each}}",
		scope: {
			items: new can.List([{name: "one"},{name: "two"}])
		}
	});
	
	var lis = template().childNodes[0].getElementsByTagName("li");
	
	equal( lis[0].innerHTML, "one", "first li has correct content")
	equal( lis[1].innerHTML, "two", "second li has correct content")
	
});

test("don't update computes unnecessarily", function(){
	var sourceAge = 30,
		timesComputeIsCalled = 0;
	var age = can.compute(function(newVal){
		timesComputeIsCalled++;
		if(timesComputeIsCalled === 1){
			ok(true, "reading initial value to set as years")
		} else if(timesComputeIsCalled === 2){
			equal(newVal, 31, "updating value to 31")
		} else if(timesComputeIsCalled === 3){
			ok(true, "called back another time after set to get the value")
		} else {
			ok(false,"You've called the callback "+timesComputeIsCalled+" times")
		}
		
		
		if(arguments.length){
			sourceAge = newVal;
		} else {
			return sourceAge;
		}
	})
	
	can.Component.extend({
		tag: "age-er"
	})
	
	var template = can.view.mustache("<age-er years='age'></age-er>")
	
	
	var frag = template({
		age: age
	})
	
	
	age(31)
	
});


test("component does not respect can.compute passed via attributes (#540)", function(){
	
	var data = {
		compute: can.compute(30)
	}
	
	can.Component.extend({
		tag: "my-component",
		template: "<span>{{blocks}}</span>"
	})
	
	var template = can.view.mustache("<my-component blocks='compute'></my-component>");
	
	var frag  = template(data)
	
	equal(frag.childNodes[0].childNodes[0].innerHTML, "30")
	
	
});

test("defined view models (#563)", function(){
	
	var HelloWorldModel = can.Map.extend({
		visible: true,
		toggle: function(){
			this.attr("visible", !this.attr("visible"))
		}
	});
	
	can.Component.extend({
		tag: "my-helloworld",
		template: "<h1>{{#if visible}}visible{{else}}invisible{{/if}}</h1>",
		scope: HelloWorldModel
	});
	
	var template = can.view.mustache("<my-helloworld></my-helloworld>");
	
	
	var frag  = template({})

	equal(frag.childNodes[0].childNodes[0].innerHTML, "visible")
});

test("scope not rebound correctly (#550)", function(){

	var nameChanges = 0;

	can.Component.extend({
		tag: "scope-rebinder",
		events: {
			"{name} change" : function(){
				nameChanges++;
			}
		}
	});

	var template = can.view.mustache("<scope-rebinder></scope-rebinder>");

	var frag = template();
	var scope = can.scope( can.$(frag.childNodes[0]) );

	var n1 = can.compute(),
		n2 = can.compute()

	scope.attr("name", n1 );
	n1("updated");
	scope.attr("name", n2);
	n2("updated");
	equal(nameChanges, 2)
})

test("content extension stack overflow error", function(){

    can.Component({
        tag: 'outer-tag',
        template: '<inner-tag>inner-tag CONTENT <content/></inner-tag>'
    })

    can.Component({
        tag: 'inner-tag',
        template: 'inner-tag TEMPLATE <content/>'
    })

    // currently causes Maximum call stack size exceeded
    var template = can.view.mustache("<outer-tag>outer-tag CONTENT</outer-tag>");
    
    // RESULT = <outer-tag><inner-tag>inner-tag TEMPLATE inner-tag CONTENT outer-tag CONTENT</inner-tag></outer-tag>
    
    var frag = template();

    equal(frag.childNodes[0].childNodes[0].innerHTML, 'inner-tag TEMPLATE inner-tag CONTENT outer-tag CONTENT')

})
	
test("inserted event fires twice if component inside live binding block", function(){

    var inited = 0,
        inserted = 0;

    can.Component({
        tag: 'child-tag',

        scope: {
            init: function(){
                inited++
            }
        },
        events: {
            ' inserted': function() {
                inserted++
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
            ' inserted': function() {
                this.scope.attr('shown', true)
            }
        }
    });

	var frag = can.view.mustache("<parent-tag></parent-tag>")({})
    
    can.append( can.$("#qunit-test-area") , frag );


    equal(inited, 1)
    equal(inserted, 1)
});

test("checkboxes with can-value bind properly (#628)", function() {
	can.Component({
		tag: 'checkbox-value',
		template: '<input type="checkbox" can-value="completed"/>'
	});

	var data = new can.Map({ completed: true }),
		frag = can.view.mustache("<checkbox-value></checkbox-value>")(data);
  can.append( can.$("#qunit-test-area") , frag );
	
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

test("Scope as Map constructors should follow '@' default values (#657)", function() {
	var PanelViewModel = can.Map.extend({
		title: "@"
	});

	can.Component.extend({
		tag: "panel",
		scope: PanelViewModel
	})

	var frag = can.view.mustache('<panel title="Libraries">Content</panel>')({ title: "hello" });
  can.append( can.$("#qunit-test-area") , frag );

  equal(can.scope(can.$("panel")[0]).attr("title"), "Libraries");
});

})()
