import { connect, restModel, QueryLogic, DefineMap } from "//unpkg.com/can@5/core.mjs";

const Todo = DefineMap.extend({
	id: {
		identity: true,
		type: 'number'
	},
	userId: 'number',
	title: 'string',
	completed: 'boolean',
	lastAccessedDate: 'string',
});

const updateLastAccessed = connect.behavior(
	'update-last-accessed',
	(previousBehavior) => {
		function updateLastAccessed(instance) {
			instance.lastAccessedDate = new Date().toISOString(); 
			instance.save().then(() => console.log('Updated last accessed time for: ', instance));
		};
		
		return {
			get() {
				return previousBehavior.get.apply(this, arguments).then((instance) => {
					updateLastAccessed(instance);
					return instance;
				});
			},
			getList() {
				return previousBehavior.getList.apply(this, arguments).then((list) => {
					list.forEach((instance) => updateLastAccessed(instance));
					return list;
				});
			},
		};
	}
);

const connectionOptions = {
	url: 'https://jsonplaceholder.typicode.com/todos/',
	queryLogic: new QueryLogic(Todo),
	Map: Todo,
};

const connection = updateLastAccessed(restModel(connectionOptions));

connection.getList({}).then(data =>
	console.log(`Loaded ${data.length} todos.`)
);
