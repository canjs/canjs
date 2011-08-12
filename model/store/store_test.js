steal('funcunit/qunit','./store.js',
	'jquery/model',
	'jquery/model/list',
	'jquery/dom/fixture',function(){

module("store", {
	setup : function(){
		
	}
});

test("subsets", function(){
	
	var res1 = $.Object.subsets({parentId: 5, type: "files"},
		[{parentId: 6}, {type: "folders"}, {type: "files"}]);
		
	same(res1,[{type: "files"}])
	
	var res2 = $.Object.subsets({parentId: 5, type: "files"},
		[{}, {type: "folders"}, {type: "files"}]);
		
	same(res2,[{},{type: "files"}]);
	
	var res3 = $.Object.subsets({parentId: 5, type: "folders"},
		[{parentId: 5},{type: "files"}]);
		
	same(res3,[{parentId: 5}])
});

/*
test("smart findAll", function(){
	
	$.Model('Item');
		
	
	
	ok( this.store.has({parentId: 7})  , "store has everything with parentId 7");
	
	
	var items = this.store.findAll({parentId: 7});
	equals( items.length, 2 , "got the wrong number of items"); 
	$.each(items, function(i, item){
		if(item.parentId != 7){
			ok(false,"got a bad parentId")
		}
	})
})*/

test("store findAll", 5, function(){
	
	$.fixture.make('item',40, function(i){
		return {
			name: "Name "+i,
			parentId: i%4+1
		}
	})
	
	$.Model('Item',{},{});
	$.Model.List('Item.List');
	$.Model.Store('Item.Store');
	
	
	var list = Item.Store.findAll({});
	stop(3000);
	list.bind("add", function(ev, items){
		console.log("here ...")
		start();
		
		ok(items, "add called with items");
		
		equal( items.length,40, "add called with items");
		
		var list2 = Item.Store.findAll({parentId: 2});
		
		equal( list2.length , 10, "immediately loaded");
		
		
		list.unbind('add',arguments.callee);
		
		list.bind('add', function(){
			ok(true, "big list added to")
		})
		
		list2.bind('add', function(){
			ok(true, "small list added too")
		})
		
		Item.Store.add([new Item({id: 100, parentId: 2})]);
		
	})
	
})




});

