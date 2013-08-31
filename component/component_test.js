(function(){
	
module("can/component",{
	setup: function(){
		can.remove( can.$("#qunit-test-area *") );
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
				can.Map.startBatch();
				panels.splice(panels.indexOf(panel),1);
				if(panel === this.attr("active")){
					if(panels.length){
						this.makeActive(panels[0]);
					} else {
						this.removeAttr("active")
					}
				}
				can.Map.stopBatch()
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
	
	can.remove( can.$("#qunit-test-area *") );
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
			"{deferreddata} change": "update",
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
		deferredData: can.compute(function(){
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
		})
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
			})
			
			
			
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
		template: 'Page <span>{{page}}</span> of <span>{{count}}</span>.'
	})
	
	
	var paginator = new Paginate({limit: 20, offset: 0, count: 100})
	
	var template = can.view.mustache("<page-count page='paginator.page' count='paginator.pageCount'></page-count>");

	can.append(can.$("#qunit-test-area"), template({
		paginator: paginator
	}));
	
	var spans = can.$("#qunit-test-area span")
	equal(spans[0].innerHTML,"1")
	paginator.next();
	equal(spans[0].innerHTML,"2")
	paginator.next();
	equal(spans[0].innerHTML,"3")
	
})


	
})()
