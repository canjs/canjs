@page can.List.prototype.sort
@parent can.List.prototype
@plugin can/map/sort
@test can/map/sort/test.html

`list.sort(sortfunc)`

Sorts the instances in the list.

	var list = new can.List([
		{ name: 'Justin' },
		{ name: 'Brian' },
		{ name: 'Austin' },
		{ name: 'Mihael' }])
		
	list.comparator = 'name';
	list.sort(); //- sorts the list by the name attribute