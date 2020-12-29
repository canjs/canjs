/*
If you're reading this source, there is an additional API option in the second parameter of F(). This is to denote frame.

eg: F('#id') will look in the window, however F('#id', 0) will look in window.frames[0].

This is not necessarily standard, however we're using an iframe on the demo page for style only.
 */
F.speed = 100;

module('todomvc');

test('basic todo functionality', function() {
	var newTodo = F('#new-todo', 0);
	newTodo.type('FuncUnit [enter]');
	newTodo.type('is [enter]');
	newTodo.type('awesome! [enter]');

	F('.todo label:contains("FuncUnit")', 0).visible('basic assert');
	F('.todo label:contains("is")', 0).visible('basic assert');
	F('.todo label:contains("awesome")', 0).visible('basic assert');

	F('.toggle:not(:checked)', 0).click();
	F('.toggle:not(:checked)', 0).click();
	F('.toggle:not(:checked)', 0).click();

	F('#clear-completed', 0).click();
	F('.todo.completed', 0).missing('verifying completion');
});

test('testing filters', function() {
	var newTodo = F('#new-todo', 0);
	newTodo.type('Simple [enter]');
	newTodo.type('Event [enter]');
	newTodo.type('Simulation [enter]');

	F('.toggle:not(:checked)', 0).click();
	F('.toggle:not(:checked)', 0).click();

	F('a:contains("Active")', 0).click();
	F('.todo label:contains("Simple")', 0).invisible('active view');
	F('.todo label:contains("Event")', 0).invisible('active view');
	F('.todo label:contains("Simulation")', 0).visible('active view');

	F('a:contains("Completed")', 0).click();
	F('.todo label:contains("Simple")', 0).visible('completed view');
	F('.todo label:contains("Event")', 0).visible('completed view');
	F('.todo label:contains("Simulation")', 0).invisible('completed view');

	F('a:contains("All")', 0).click();
	F('.todo label:contains("Simple")', 0).visible('all view');
	F('.todo label:contains("Event")', 0).visible('all view');
	F('.todo label:contains("Simulation")', 0).visible('all view');

	F('.toggle:not(:checked)', 0).click();
	F('#clear-completed', 0).click();
	F('.todo.completed', 0).missing('verifying completion');
});

test('destroying todos', function() {
	F('#new-todo', 0).type('Sweet. [enter]');

	F('.todo label:contains("Sweet.")', 0).visible('basic assert');
	F('.destroy', 0).click();

	F('.todo label:contains("Sweet.")', 0).missing('destroyed todo');
});