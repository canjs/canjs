@page can.Observe.List.prototype.sort
@parent can.Observe.List.prototype
@plugin can/observe/sort
@download http://donejs.com/can/dist/can.observe.sort.js
@test can/observe/sort/qunit.html

`list.sort(sortfunc)`

Sorts the instances in the list.

	var list = new can.Observe.List([
		{ name: 'Justin' },
		{ name: 'Brian' },
		{ name: 'Austin' },
		{ name: 'Mihael' }])
		
	list.comparator = 'name';
	list.sort(); //- sorts the list by the name attribute