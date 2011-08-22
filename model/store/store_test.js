steal('funcunit/qunit','./store.js',
	'jquery/model',
	'jquery/model/list',
	'jquery/dom/fixture',function(){

module("store", {
	setup : function(){
		
	}
});

test("same", function(){
	
	
	ok( $.Object.same({type: "FOLDER"},{type: "FOLDER", count: 5}, {
		count: null
	}), "count ignored" );
	
	ok( $.Object.same({type: "folder"},{type: "FOLDER"}, {
		type: "i"
	}), "folder case ignored" );
})

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

test("subset compare", function(){
	
	ok( $.Object.subset(
		{type: "FOLDER"},
		{type: "FOLDER"}), 
		
		"equal sets" );
	
	ok( $.Object.subset(
		{type: "FOLDER", parentId: 5},
		{type: "FOLDER"}), 
		
		"sub set" );
	
	ok(! $.Object.subset(
		{type: "FOLDER"},
		{type: "FOLDER", parentId: 5}), 
		
		"wrong way" );
	
	
	ok(! $.Object.subset(
		{type: "FOLDER", parentId: 7},
		{type: "FOLDER", parentId: 5}), 
		
		"different values" );

	ok( $.Object.subset(
		{type: "FOLDER", count: 5}, // subset
		{type: "FOLDER"},
		{count: null} ), 
		
		"count ignored" );
	
	
	ok( $.Object.subset(
		{type: "FOLDER", kind: "tree"}, // subset
		{type: "FOLDER", foo: true, bar: true },
		{foo: null, bar: null} ), 
		
		"understands a subset" );
	ok( $.Object.subset(
		{type: "FOLDER", foo: true, bar: true },
		{type: "FOLDER", kind: "tree"}, // subset
		
		{foo: null, bar: null, kind : null} ), 
		
		"ignores nulls" );
})

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

test("Store Compare", function(){
	
	
	$.fixture.make('item',40, function(i){
		return {
			name: "Name "+i,
			parentId: i%4+1
		}
	})
	
	$.Model('Item',{},{});
	$.Model.List('Item.List');
	$.Model.Store('Item.Store',{
		compare : {
			count : null
		}
	},{});
	
	
	var list = Item.Store.findAll({count: 2});
	stop(3000);
	list.bind("add", function(ev, items){
		ok(items.length);
		ok(list.length)
		start()
		var list2 = Item.Store.findAll({count: 500});
		equals(list2.length, list.length, "lists have the same items");
		ok(list2 === list,"lists are equal")
	})
})

test("Store Remove", function(){
	$.fixture.make('item',40, function(i){
		return {
			name: "Name "+i,
			parentId: i%4+1
		}
	})
	
	$.Model('Item',{},{});
	$.Model.List('Item.List');
	$.Model.Store('Item.Store',{
		compare : {
			count : null
		}
	},{});
	
	var list = Item.Store.findAll({parentId: 1}),
		len = 0,
		first;
	stop();
	list.bind("add", function(ev, items){
		ok(items.length, "there should be items");
		len = items.length;
		first = items[0]
		first.destroy();
	})
	list.bind("remove", function(ev, items){
		ok(items[0] === first, "removed first item");
		equals(list.length, len - 1, "length adjusted")
		start();
	})
});


});

