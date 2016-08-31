var QUnit = require("steal-qunit");
var F = require("funcunit");

F.attach(QUnit);

QUnit.module('todomvc', {
    beforeEach: function (assert) {
        localStorage.clear();
		var done = assert.async();
		F.open(__dirname+"/todomvc.html", function(){
			done();
		});
    }
});

QUnit.test("basics work", function(){
	F('li.todo').size(3, "there are 3 todos");
	F('#new-todo').type("new thing\r");

	F('li.todo').size(4, "new todo added");
});
