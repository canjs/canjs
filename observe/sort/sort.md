@page can.Observe.sort
@parent can.Observe
@plugin can/observe/sort
@download  http://jmvcsite.heroku.com/pluginify?plugins[]=can/observe/sort/sort.js
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