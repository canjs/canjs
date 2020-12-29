/*
If you're reading this source, there is an additional API option in the second parameter of F(). This is to denote frame.

eg: F('#id') will look in the window, however F('#id', 0) will look in window.frames[0].

This is not necessarily standard, however we're using an iframe on the demo page for style only.
 */

F.speed = 100;

describe('TodoMVC', function(){
	it('should create and complete todos', function() {
		var newTodo = F('#new-todo', 0);
		newTodo.type('FuncUnit [enter]');
		newTodo.type('is [enter]');
		newTodo.type('awesome! [enter]');

		F('.todo label:contains("FuncUnit")', 0).visible();
		F('.todo label:contains("is")', 0).visible();
		F('.todo label:contains("awesome")', 0).visible();

		F('.toggle:not(:checked)', 0).click();
		F('.toggle:not(:checked)', 0).click();
		F('.toggle:not(:checked)', 0).click();

		F('#clear-completed', 0).click();
		F('.todo.completed', 0).missing();
	});

	it('should filter todos, then complete', function() {
		var newTodo = F('#new-todo', 0);
		newTodo.type('Simple [enter]');
		newTodo.type('Event [enter]');
		newTodo.type('Simulation [enter]');

		F('.toggle:not(:checked)', 0).click();
		F('.toggle:not(:checked)', 0).click();

		F('a:contains("Active")', 0).click();
		F('.todo label:contains("Simple")', 0).invisible();
		F('.todo label:contains("Event")', 0).invisible();
		F('.todo label:contains("Simulation")', 0).visible();

		F('a:contains("Completed")', 0).click();
		F('.todo label:contains("Simple")', 0).visible();
		F('.todo label:contains("Event")', 0).visible();
		F('.todo label:contains("Simulation")', 0).invisible();

		F('a:contains("All")', 0).click();
		F('.todo label:contains("Simple")', 0).visible();
		F('.todo label:contains("Event")', 0).visible();
		F('.todo label:contains("Simulation")', 0).visible();

		F('.toggle:not(:checked)', 0).click();
		F('#clear-completed', 0).click();
		F('.todo.completed', 0).missing();
	});

	it('should destroy todos', function() {
		F('#new-todo', 0).type('Sweet. [enter]');

		F('.todo label:contains("Sweet.")', 0).visible();
		F('.destroy', 0).click();

		F('.todo label:contains("Sweet.")', 0).missing();
	});
});