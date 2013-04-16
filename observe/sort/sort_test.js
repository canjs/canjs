steal('can/util', 'can/observe/sort', 'can/view/mustache', function(can) {

module("can/observe/sort");

test("list events", 16, function(){

	var list = new can.Observe.List([
		{name: 'Justin'},
		{name: 'Brian'},
		{name: 'Austin'},
		{name: 'Mihael'}])
	list.comparator = 'name';
	list.sort();
	// events on a list
	// - move - item from one position to another
	//          due to changes in elements that change the sort order
	// - add (items added to a list)
	// - remove (items removed from a list)
	// - reset (all items removed from the list)
	// - change something happened

	// a move directly on this list
	list.bind('move', function(ev, item, newPos, oldPos){
		ok(true,"move called");
		equals(item.name, "Zed");
		equals(newPos, 3);
		equals(oldPos, 0);
	});

	// a remove directly on this list
	list.bind('remove', function(ev, items, oldPos){
		ok(true,"remove called");
		equals(items.length,1);
		equals(items[0].name, 'Alexis');
		equals(oldPos, 0, "put in right spot")
	})
	list.bind('add', function(ev, items, newLength){
		ok(true,"add called");
		equals(items.length,1);
		equals(items[0].name, 'Alexis');
		// .push returns the new length not the current position
		equals(newLength, 4, "got new length");
	});

	list.push({name: 'Alexis'});

	// now lets remove alexis ...
	list.splice(0,1);
	list[0].attr('name',"Zed")
});

test("list sort with func", 1, function(){

	var list = new can.Observe.List([
		{priority: 4, name: "low"},
		{priority: 1, name: "high"},
		{priority: 2, name: "middle"},
		{priority: 3, name: "mid"}])

	list.sort(function(a, b){
		// Sort functions always need to return the -1/0/1 integers
		if(a.priority < b.priority) {
			return -1;
		}
		return a.priority > b.priority ? 1 : 0;
	});
	equals(list[0].name, 'high');
});

test("live binding with comparator (#170)", function() {
	var renderer = can.view.mustache('<ul>{{#items}}<li>{{text}}</li>{{/items}}</ul>'),
		el = document.createElement('div'),
		items = new can.Observe.List([{
			text : 'First'
		}]);

	el.appendChild(renderer({
		items : items
	}));

	equals(el.getElementsByTagName('li').length, 1, "Found one li");

	items.push({
		text : 'Second'
	});

	equals(el.getElementsByTagName('li').length, 2, "Live binding rendered second li");
});

})();