import { connect, restModel, QueryLogic, ObservableObject } from "//unpkg.com/can@6/core.mjs";

class Todo extends ObservableObject {
  static props = {
    id: {
      identity: true,
      type: Number
    },
    userId: Number,
    title: String,
    completed: Boolean,
    lastAccessedDate: String,
  }
}

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
	ObjectType: Todo,
};

const connection = updateLastAccessed(restModel(connectionOptions));

connection.getList({}).then(data =>
	console.log(`Loaded ${data.length} todos.`)
);
