const todoAlgebra = new can.set.Algebra(
	can.set.props.boolean( "complete" ),
	can.set.props.id( "id" ),
	can.set.props.sort( "sort" )
);
const todoStore = can.fixture.store( [
	{ name: "mow lawn", complete: false, id: 5 },
	{ name: "dishes", complete: true, id: 6 },
	{ name: "learn canjs", complete: false, id: 7 }
], todoAlgebra );
can.fixture( "/api/todos", todoStore );
can.fixture.delay = 1000;
const Todo = can.DefineMap.extend( {
	id: "number",
	name: "string",
	complete: { type: "boolean", default: false }
} );
Todo.List = can.DefineList.extend( {
	"#": Todo,
	get active() {
		return this.filter( { complete: false } );
	},
	get complete() {
		return this.filter( { complete: true } );
	}
} );
can.connect.superMap( {
	url: "/api/todos",
	Map: Todo,
	List: Todo.List,
	name: "todo",
	algebra: todoAlgebra
} );
can.domEvents.addEvent( can.domEventEnter );
const TodoCreateVM = can.DefineMap.extend( {
	todo: { Default: Todo },
	createTodo: function() {
		this.todo.save().then( function() {
			this.todo = new Todo();
		}.bind( this ) );
	}
} );
can.Component.extend( {
	tag: "todo-create",
	view: can.stache.from( "todo-create-template" ),
	ViewModel: TodoCreateVM
} );
const TodoListVM = can.DefineMap.extend( {
	todos: Todo.List,
	editing: Todo,
	backupName: "string",
	isEditing: function( todo ) {
		return todo === this.editing;
	},
	edit: function( todo ) {
		this.backupName = todo.name;
		this.editing = todo;
	},
	cancelEdit: function() {
		if ( this.editing ) {
			this.editing.name = this.backupName;
		}
		this.editing = null;
	},
	updateName: function() {
		this.editing.save();
		this.editing = null;
	}
} );
can.Component.extend( {
	tag: "todo-list",
	view: can.stache.from( "todo-list-template" ),
	ViewModel: TodoListVM
} );
const template = can.stache.from( "todomvc-template" );
const frag = template( { todosPromise: Todo.getList( {} ) } );
document.body.appendChild( frag );
