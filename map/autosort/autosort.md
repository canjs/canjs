@page can.List.prototype.autosort
@parent can.List.prototype
@plugin can/map/autosort
@test can/map/autosort/test.html

`list.autosort(sortfunc)`

Sorts the instances in the list.

	var list = new can.List([
		{ name: 'Justin' },
		{ name: 'Brian' },
		{ name: 'Austin' },
		{ name: 'Mihael' }])
		
	list.comparator = 'name';
	list.autosort(); //- sorts the list by the name attribute