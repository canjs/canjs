import { ObservableObject, QueryLogic, connect } from "//unpkg.com/can@6/core.mjs";

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

const behaviors = [
	connect.base,
	connect.dataUrl,
	connect.dataParse,
	connect.constructor,
];

const connectionOptions = {
	url: 'https://jsonplaceholder.typicode.com/todos/{id}',
	queryLogic: new QueryLogic(Todo)
};

const connection = behaviors.reduce(
	(connection, behavior) => behavior(connection),
	connectionOptions
);
connection.init();

connection.get({id: 5}).then((result) => {
	console.log(`Fetched A Todo: `, result);
});
