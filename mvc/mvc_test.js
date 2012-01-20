steal('funcunit/qunit','./mvc','can/dom/fixture',function(){

module("mvc");

test("Class basics", function(){
	
	var Note = $.Class.extend({
		init : function(name){
			this.name = name;
		},
		
		author : function(){ return this.name },
		
		coordinates : "xy",
		
		allowedToEdit: function(account) { 
			return true;
		}
	});
	
	var PrivateNote = Note.extend({
		allowedToEdit: function(account) {
			return false;
		}
	})
	
	var n = new PrivateNote("Hello World");
	equals(n.author(),"Hello World")
});

test("Model basics",function(){
	$.fixture("/mvc/foo",function(){
		return [[{
			id: 1,
			name : "foo"
		}]]
	})
	
	var Task = $.Model({
		findAll : "/mvc/foo"
	},{
		print : function(){
			return this.name;
		}
	});
	stop();
	Task.findAll({}, function(tasks){
		
		equals(tasks.length, 1,"we have an array")
		equals(tasks[0].id, 1, "we have the objects")
		ok(tasks[0] instanceof Task, "we have an instance of task")
		
		// add a task
		
		tasks.bind('add', function(ev, items, where){
			ok(items.length, "add called with an array");
			
			ok(newtask === items[0], "add called with new task")
			start();
			
		})
		var newtask = new Task({name: "hello"})
		tasks.push( newtask )
	});
})

test("Controller Basics",3,function(){
	var Task = $.Model({
		findAll : "/mvc/foo"
	},{
		print : function(){
			return this.name;
		}
	});
	
	var Tasks = $.Controller({
		"{Task} created" : function(Task, ev, task){
			ok(task, "created called")
		},
		"click" : function(el, ev){
			ok(el, "click called")
		}
	});
	
	
	var tasks = new Tasks( '#qunit-test-area' , {
		Task : Task
	})
	$('#qunit-test-area').click();
	
	new Task({id: 1}).created();
	
	equals($('#qunit-test-area')[0].className, "")
	
	tasks.destroy();
	
	// make sure we can't click
	$('#qunit-test-area').click();
	
})

});